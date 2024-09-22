import { numbery } from "./numbery";
import type { DataRecord } from "./record.types";
import { v5 } from "uuid";

const MY_NAMESPACE = "e1d2a46b-8fb8-4f49-b1b2-b9d1657d225d";

export class Place {
  constructor(private dr: DataRecord, identity?: string) {
    if (identity) this.#identity = identity;
  }

  // Getter for identity (generated using UUID v5)
  #identity = "";
  get id(): string {
    if (this.#identity) return this.#identity;

    this.#identity = Place.identityFor(this.dr);
    return this.#identity;
  }

  static identityFor(dr: DataRecord) {
    const {
      administrative_area_level,
      iso_alpha_3,
      administrative_area_level_1,
      administrative_area_level_2,
      administrative_area_level_3,
    } = dr;

    const seed = [
      administrative_area_level,
      iso_alpha_3,
      administrative_area_level_1,
      administrative_area_level_2,
      administrative_area_level_3,
    ]
      .filter(Boolean)
      .join("--");

    return seed;
  }

  // Getters for other properties, referencing dr every time
  get administrative_area_level(): number {
    return numbery(this.dr.administrative_area_level);
  }

  get administrative_area_level_1(): string {
    return this.dr.administrative_area_level_1 || "";
  }

  get administrative_area_level_2(): string {
    return this.dr.administrative_area_level_2 || "";
  }

  get administrative_area_level_3(): string {
    return this.dr.administrative_area_level_3 || "";
  }

  get latitude(): number {
    return numbery(this.dr.latitude);
  }

  get longitude(): number {
    return numbery(this.dr.longitude);
  }

  get population(): number {
    return numbery(this.dr.population);
  }

  get iso_alpha_3(): string {
    return this.dr.iso_alpha_3 || "";
  }

  get iso_alpha_2(): string {
    return this.dr.iso_alpha_2 || "";
  }

  valueOf() {
    return {
      id: this.id,
      administrative_area_level: this.administrative_area_level,
      administrative_area_level_1: this.administrative_area_level_1,
      administrative_area_level_2: this.administrative_area_level_2,
      administrative_area_level_3: this.administrative_area_level_3,
      population: this.population,
      latitude: this.latitude,
      longitude: this.longitude,
      iso_alpha_2: this.iso_alpha_2,
      iso_alpha_3: this.iso_alpha_3,
    };
  }
}
