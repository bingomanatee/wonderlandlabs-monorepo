import { numbery } from "./numbery"; // Import the numbery function
import { Place } from "./Place";
import type { DataRecord } from "./record.types";
import type { ByDateInsert } from "./supabase.service";

export class ByDate {
  public created_at: string;
  constructor(private data: DataRecord) {
    this.created_at = new Date().toISOString();
  }

  // Getters for numeric fields
  get administrative_area_level(): number {
    return numbery(this.data.administrative_area_level) as number;
  }

  get confirmed(): number {
    return numbery(this.data.confirmed) as number;
  }

  get deaths(): number {
    return numbery(this.data.deaths) as number;
  }

  // Getters for non-numeric fields

  get date(): string | undefined {
    return this.data.date;
  }

  get id(): string {
    return `${this.place}--${this.date}`;
  }

  get place(): string {
    return Place.identityFor(this.data);
  }

  // Deconstruct the class into a plain object in toJSON
  toJSON(): ByDateInsert {
    const {
      administrative_area_level,
      confirmed,
      created_at,
      date,
      deaths,
      id,
      place,
    } = this;

    return {
      administrative_area_level,
      confirmed,
      created_at,
      date,
      deaths,
      id,
      place,
    };
  }
}
