import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { LevelReader } from "./LevelReader";
import { SupabaseService } from "./supabase/supabase.service";
import { DataReader } from "./DataReader";

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

  async data(level = 1) {
    const dataReader = new DataReader(
      level,
      this.configService,
      this.supabaseService
    );
    return dataReader.data();
  }
}
