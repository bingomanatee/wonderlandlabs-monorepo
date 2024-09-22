import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { LevelReader } from "./LevelReader";
import { SupabaseService } from "./supabase/supabase.service";

export const RCD = "raw-covid-data";

@Injectable()
export class InputService {
  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService
  ) {}

  async read(level = 1) {
    if (!this.levelReaders[level]) {
      this.levelReaders[level] = new LevelReader(
        level,
        this.configService,
        this.supabaseService
      );
    }
    return this.levelReaders[level].read();
  }

  private levelReaders: LevelReader[] = [];
}
