import type { ConfigService } from "@nestjs/config";
import type { SupabaseService } from "./supabase/supabase.service";
import dayjs from "dayjs";

export class DataReader {
  constructor(
    public level: number,
    private configService: ConfigService,
    private supabaseService: SupabaseService
  ) {}
  async data() {
    let t = Date.now();
    const data = await this.supabaseService.placeData(this.level);
    console.log("level", this.level, "took", (Date.now() - t) / 1000, "secs");
    return data;
  }
}
