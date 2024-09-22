import { ConfigService } from "@nestjs/config";
import csv from "csv-parser";
import https from "https";
import type {
  ByDateInsert,
  SupabaseService,
} from "./supabase/supabase.service";
import type { DataRecord } from "./supabase/record.types";
import { ByDate } from "./supabase/ByDate";
import { min } from "rxjs";

export const RCD = "raw-covid-data";
const RIE_DELAY = 5000; // wait 5 seconds for more records to be emptied

const MAX_UNSAVED = 10000;
const MAX_WRITE = 1000;
const MIN_WRITE = 500;

const MAX_WRITE_DURATION_MINUTES = 60;
const SECOND_MS = 60 * 1000;
const MAX_WRITE_DURATION = SECOND_MS * MAX_WRITE_DURATION_MINUTES;
const TWO_MINUTES_MS = SECOND_MS * 120;
export class LevelReader {
  constructor(
    private level: number,
    private configService: ConfigService,
    private supabaseService: SupabaseService
  ) {
    this.#report(true);
  }

  #report(repeat = false) {
    console.log(`
      level: ${this.level}
      reading: ${this.#reading}
      lines: ${this.lines.length}
      paused: ${this.#paused ? "Y" : "N"}
      lines read: ${this.#linesRead}
      lines written: ${this.#linesWritten}
      `);

    if (repeat) setTimeout(() => this.#report(repeat), TWO_MINUTES_MS);
  }

  path() {
    let out: string;
    switch (this.level) {
      case 1:
        out = this.configService.get<string>("COVID_DATA_URL_LEVEL_1");
        break;
      case 2:
        out = this.configService.get<string>("COVID_DATA_URL_LEVEL_2");
        break;
      case 3:
        out = this.configService.get<string>("COVID_DATA_URL_LEVEL_3");
        break;
      default:
        throw new Error("cannot find path for level " + this.level);
    }
    return out;
  }

  #linesWritten = 0;
  #linesRead = 0;
  #startTime = 0;
  #reading = 0;
  #response: any;

  lines: ByDateInsert[] = [];
  #paused = false;

  async #addLine(line: DataRecord) {
    if (!line) return;
    this.supabaseService.addPlace(line, this.level);
    const data = new ByDate(line);
    this.lines.push(data.toJSON());
    this.#linesRead += 1;

    if (!(this.#linesRead % 2000)) {
      console.log(
        "#addLine: lines read = ",
        this.#linesRead,
        "lines in list:",
        this.lines.length
      );
    }

    if (!this.#reading || this.lines.length >= MIN_WRITE) {
      this.#saveLines();
    }

    // if after slicing some lines out to save, too many lines are still in the queue,
    // delay further reading until the count is low enough.
    if (this.lines.length > MAX_UNSAVED) {
      if (this.#response && !this.#paused) {
        console.log("----- overflow -----");
        console.log("#addLine pausing");
        this.#paused = true;
        this.#response.pause();
        this.#resumeIfEmptied();
      }
    }
  }

  #saveLines() {
    if (this.lines.length < (this.#reading ? MIN_WRITE : 1)) {
      console.log("#saveLines: no data to save");
      return;
    }
    let lines = this.lines;
    this.lines = lines.slice(MAX_WRITE);
    const lineSet = lines.slice(0, MAX_WRITE);
    this.#sendToDB(lineSet);
  }

  async #splitLines(lines: ByDateInsert[]) {
    const m = Math.floor(lines.length / 2);

    const firstPart = lines.slice(0, m);
    const secondPart = lines.slice(m);
    this.#returnLinesToQueue(firstPart);
    this.#sendToDB(secondPart);
  }

  #returnLinesToQueue(lines: ByDateInsert[]) {
    this.lines = [...this.lines, ...lines];
  }
  #linesWrittenMessageNumber = 0;
  #savingData = false;
  async #sendToDB(lines: ByDateInsert[]) {
    if (this.#savingData) {
      this.#returnLinesToQueue(lines);
      return;
    }

    this.#savingData = true;
    try {
      const { error } = await this.supabaseService.addByDateData(lines);
      if (error) {
        throw error;
      }
      this.#linesWritten += lines.length;

      if (this.#linesWritten - this.#linesWrittenMessageNumber > 1000) {
        console.log(this.#linesWritten, "lines written");
        this.#linesWrittenMessageNumber = this.#linesWritten;
      }

      this.#savingData = false;
      // if another batch of lines are ready, send them too.
      this.#saveLines();
    } catch (error) {
      this.#savingData = false;
      if (lines.length > 1) {
        await this.#splitLines(lines); // re-send half the lines to try a smaller set
      } else {
        // three may be a single problematic record - skip it.
        console.log("cannot write line", ...lines);
      }
    } finally {
      this.#savingData = false;
    }
  }

  #resume() {
    if (this.#response) {
      console.log("#resume: resming");
      this.#response.resume();
    } else {
      console.log("#resume: not reading any more");
    }
    this.#paused = false;
  }
  /**
   * ittermittently calls itself until
   *   * lines are sufficiently small
   *   * saving is not happening
   *
   */
  #resumeIfEmptied() {
    console.log("resumeIfEmpited checking ", this.lines.length);
    // once we hit the overflow, wait til the lines to fully empty in order to resume
    if (this.#reading && this.lines.length <= MAX_UNSAVED) {
      console.log("#resumeIfExpired: resuming read");
      this.#resume(); // read more data
    }

    if (!this.#reading) {
      console.log("======== DONE READING ========");
      this.#report(false);
    }

    if (!this.#savingData) {
      // write / remove more lines
      console.log(
        "resumeIfEmptied",
        this.lines.length,
        "lines left;",
        "saving more lines"
      );
      this.#saveLines();
    }

    if (this.#paused) {
      // lines being written - wait a cycle
      console.log(
        "resumeIfEmptied",
        this.lines.length,
        "lines left;",
        "waiting for more lines to be saved"
      );
      // try later to ensure that we eventually resume reading
      setTimeout(() => {
        this.#resumeIfEmptied();
      }, RIE_DELAY);
    }
  }

  async read() {
    this.#linesRead = 0;
    this.#linesWritten = 0;
    console.log("--- LevelReader: ", this.level, "reading");

    // if reading happened recently, don't execute so that
    if (this.#reading > 0) {
      if (this.#reading < Date.now() - MAX_WRITE_DURATION)
        throw new Error("already reading lines");
      else {
        console.warn("stale read ignored");
      }
    }
    this.#reading = Date.now();
    const path = this.path();
    console.log("--- LevelReader: ", this.level, "reading from path", path);

    await this.#clearHistory();

    // prepare a delaying promise

    let done: (value: unknown) => void;
    let fail: (err: Error) => void;

    let responsePromise = new Promise((onDone, onFail) => {
      done = (value: unknown) => {
        return onDone(value);
      };

      fail = (e: Error) => {
        this.#reading = 0;
        return onFail(e);
      };
    });

    // read from the file
    this.#linesRead = 0;
    this.#startTime = Date.now();

    https.get(path, (response) => {
      this.#response = response;
      response
        .pipe(csv())
        .on("data", async (row: DataRecord) => {
          await this.#addLine(row);
        })
        .on("error", (err) => {
          this.#response = null;
          this.#reading = 0;

          fail?.(err);
        })
        .on("end", async () => {
          console.log("File reading finished");

          this.#response = null;
          this.#reading = 0;

          const elapsed = Date.now() - this.#startTime;
          console.log(
            this.#linesRead / elapsed,
            "lines/ms READ time for level",
            this.level
          );
          // flush all remaining records
          this.#saveLines();
          // document the lines in data
          done(this.#linesRead);
        });
    });

    return responsePromise; // note - the READING of data may be done - the SAVING of data is still going on most likely
  }

  async #clearHistory() {
    return await this.supabaseService.clearLevel(this.level);
  }
}
