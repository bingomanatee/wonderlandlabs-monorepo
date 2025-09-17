import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase.types";
import type { DataRecord } from "./record.types";
import { Place } from "./Place";
import dayjs from "dayjs";

export type ByDateInsert = Database["public"]["Tables"]["bydate"]["Insert"];
export type ByDateRow = Database["public"]["Tables"]["bydate"]["Row"];
export type PlaceMap = Map<string, Place>;

export type PlaceSelect = Database["public"]["Tables"]["bydate_places"]["Row"];

export type PlaceDataL1 =
  Database["public"]["Views"]["places_with_data_l1"]["Row"];
@Injectable()
export class SupabaseService {
  constructor(private configService: ConfigService) {
    console.log("initializing supabase with", this.path, this.key);
    this.conn = createClient<Database>(this.path, this.key);
  }

  conn: SupabaseClient<any, any>;

  get path() {
    return this.configService.get<string>("PUBLIC_SUPABASE_URL");
  }
  get key() {
    return this.configService.get<string>("SUPABASE_PRIVATE_KEY");
  }

  async addByDateData(
    rows: ByDateInsert[]
  ): Promise<{ error: any; count?: number }> {
    const { error, count } = await this.conn
      .from("bydate")
      // @ts-expect-error
      .upsert(rows, { onConflict: ["id"] });

    if (error) {
      console.error("Error inserting data:", error);
      return { error };
    }

    return { error: null, count };
  }

  async clearLevel(level: number): Promise<{ error?: any }> {
    const { error } = await this.conn
      .from("bydate") // Replace with your table $name
      .delete()
      .eq("administrative_area_level", level); // 'level' is the field, 1 is the value to match

    return { error };
  }

  #places1: PlaceMap = new Map();
  #places2: PlaceMap = new Map();
  #places3: PlaceMap = new Map();
  addPlace(data: DataRecord, level: number) {
    const identity = Place.identityFor(data);

    let map = this.#places1;
    switch (level) {
      case 1:
        map = this.#places1;
        break;
      case 2:
        map = this.#places2;
        break;

      case 3:
        map = this.#places3;
        break;

      default:
        console.warn("cannot find map for ", { ...data });
        return;
    }

    if (!map.has(identity)) {
      const place = new Place(data, identity);
      map.set(identity, place);
      this.#savePlace(place);
    }
  }

  async #savePlace(place: Place) {
    const value = place.valueOf();
    return (
      this.conn
        .from("bydate_places")
        // @ts-expect-error
        .upsert(value, { onConflict: ["id"] })
    );
  }

  async places(level = 1) {
    const { data, error } = await this.conn
      .from("bydate_places") // Specify the table you want to query
      .select("id, administrative_area_level,  bydate (date, deaths)") // Select all columns or specify particular columns
      .eq("administrative_area_level", level)
      .range(0, 5);
    if (error) throw error;
    return data;
  }

  /**
   * returns all data for a place ordered by time
   */
  async placeData(level: number): Promise<PlaceDataL1[]> {
    const { data, error } = await this.conn
      .from("places_with_data_l" + level)
      .select("*");
    if (error) throw error;
    return data;
  }
}
