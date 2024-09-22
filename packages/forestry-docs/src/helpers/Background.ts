import Two from "two.js";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { Screen } from "./Screen";
import type {
  Place,
  DateInfo,
  InfoMap,
  Mortality,
  CellIF,
} from "./types.background";
import type { Group } from "two.js/src/group";
import { Cell } from "./Cell";
import { XYContainer } from "./XYContainer";
let singleton: Background | null = null;

const ns = "http://www.w3.org/2000/svg";
const ISO_DATE = "YYYY-MM-DD";
export const unit = 8;

/**
 * translate a number from one min-max base
 * to a different min-max base
 */
function project(
  n: number,
  min: number,
  max: number,
  min2: number,
  max2: number
) {
  const domain = max - min;
  const range = max2 - min2;
  const extent = (n - min) / domain;
  return extent * range + min2;
}

export class Background {
  #node?: HTMLElement;

  #resizeObserver?: ResizeObserver;
  #screen?: Screen;
  #two?: Two;

  constructor() {
    this.#init();
    this.#loadData();
  }

  async #loadData() {
    const response = await fetch("http://localhost:3000/data/1");
    if (!response.ok) {
      console.warn("cannot get data:", response);
    } else {
      const data = await response.json();
      this.#process(data);
    }
  }

  #process(data: Place[]) {
    //   const container = new XYContainer();
    //   for (const p of data) {
    //     container.add(p.longitude, p.latitude);
    //   }
    //   console.log("lat lon range:", container);

    const dateSet = data.reduce((dateSet: Set<string>, place: Place) => {
      for (const d of place.dates) {
        dateSet.add(d);
      }
      return dateSet;
    }, new Set());

    const dates = Array.from(dateSet.values())
      .map((d: string) => ({
        string: d,
        date: dayjs(d, ISO_DATE),
      }))
      .sort((d1: DateInfo, d2: DateInfo) => d1.date.diff(d2.date, "d"));

    console.log("dates are ", dates.slice(0, 4));
    this.#mergeData(dates, data);
  }

  #mergeData(dates: DateInfo[], data: Place[]) {
    let infoMap: InfoMap = new Map();

    for (const place of data) {
      place.dates.forEach((dateString: string, i: number) => {
        const deaths = place.deaths[i];
        const confirmed = place.confirmed[i];
        const dateInfo = dates.find((d) => d.string === dateString);
        if (!dateInfo) return;

        if (!infoMap.has(dateInfo)) {
          infoMap.set(dateInfo, new Map());
        }

        let dataMap = infoMap.get(dateInfo);
        if (dataMap) {
          dataMap.set(place.id, { deaths, confirmed, place });
        }
      });
    }

    this.#info = infoMap;
    this.drawInfo();
  }

  #info?: InfoMap;

  #placeToIJ(place: Place) {
    const { latitude, longitude } = place;

    const i = Math.floor(
      project(latitude, -180, 180, 0, this.#screen?.iCount ?? 0)
    );
    const j = Math.floor(
      project(longitude, -90, 90, 0, this.#screen?.jCount ?? 0)
    );
    console.log(
      "place",
      place,
      "lat long = ",
      latitude,
      longitude,
      "i j = ",
      i,
      j
    );

    return { i, j };
  }

  drawInfo() {
    console.log("drawInfo()");

    if (!this.#info) return;

    const lastDate = Array.from(this.#info.keys()).pop();
    if (!lastDate) return;

    const lastInfo = this.#info.get(lastDate);

    console.log("drawInfo for date", lastDate, "info", lastInfo);
    lastInfo?.forEach((mortality) => {
      const { i, j } = this.#placeToIJ(mortality.place);
      const cell = this.#screen?.cell(i, j);
      if (!cell) {
        console.log(
          "place",
          mortality.place.id,
          "i j = ",
          i,
          j,
          "screen:",
          this.#screen,
          "cell",
          cell
        );
      }

      if (cell) {
        const radius = Math.pow(mortality.deaths, 1 / 3);
        this.#addCircle(cell, radius, mortality);
      }
    });
  }

  #addCircle(cell: CellIF, radius: number, mortality: Mortality) {
    if (!this.#two) return;
    if (!this.rectGroup) {
      this.#initGroups();
    }
    console.log("adding circle at", cell.x, cell.y, "with radius", radius);
    const circle = this.#two.makeCircle(cell.x, cell.y, radius);
    circle.fill = "red";
    circle.stroke = "transparent";
    if (cell.circle) {
      this.circleGroup?.remove(cell.circle);
    }
    cell.circle = circle;
    this.circleGroup?.add(circle);
  }

  #init() {
    this.#initCells();
    console.log("background rendered");
  }

  #initCells() {
    const node = document.getElementById("background");
    if (!node) return;
    this.#node = node;
    if (!this.#node) return;

    this.#resizeObserver = new ResizeObserver((entries) => {
      if (!this.#node) return;
      for (let entry of entries) {
        this.#initScreen(entry);
      }
    });

    this.#resizeObserver.observe(this.#node);
  }

  #initScreen(entry: ResizeObserverEntry) {
    const width = entry.contentRect.width;
    const height = entry.contentRect.height;
    let lastScreen = this.#screen;
    console.log("initialiaing screen", width, height);
    this.#screen = new Screen(
      width,
      height,
      (i, j, s) => new Cell(i, j, s),
      lastScreen
    );
    if (!this.#two) this.#initTwo();
    this.render();
  }

  #initTwo() {
    if (!this.#node || !this.#screen) return;
    const types = Two.Types;
    console.log("types are ", types);
    this.#two = new Two({
      autostart: true,
      fitted: true,
      type: Two.Types.canvas,
    }).appendTo(this.#node);
  }

  static singleton() {
    if (!singleton) singleton = new Background();
    return singleton;
  }

  rectGroup: null | Group;
  circleGroup: null | Group;

  #initGroups() {
    if (!this.#two) return;
    if (!this.rectGroup) {
      this.rectGroup = this.#two.makeGroup();
    }
    if (!this.circleGroup) {
      this.circleGroup = this.#two?.makeGroup();
    }
  }

  render() {
    if (!this.#screen || !this.#two) {
      console.warn(
        "cannot render without screen and two:",
        this.#screen,
        this.#two
      );
      return;
    }
    if (!this.rectGroup) {
      this.#initGroups();
    }
    this.#screen.cells.forEach((cell) => {
      if (!this.#node || !this.#screen || !this.#two) return;
      if (!cell.rect) {
        cell.rect = this.#two.makeRectangle(cell.x, cell.y, unit, unit);
      }
      cell.rect.fill = cell.color;
      cell.rect.stroke = "transparent";
      this.rectGroup?.add(cell.rect);
    });
    console.log("rendered");
  }
}
