import { Module } from "@nestjs/common";
import { InputService } from "./input.service";
import { ConfigModule } from "@nestjs/config";
import { RedisModule } from "../redis/redis.module";
import { RedisService } from "../redis/redis.service";
import { ByCountryService } from "./by-country/by-country.service";
import { SupabaseModule } from "./supabase/supabase.module";
import { SupabaseService } from "./supabase/supabase.service";

@Module({
  imports: [ConfigModule, SupabaseModule, RedisModule],
  providers: [InputService, RedisService, ByCountryService, SupabaseService],
})
export class InputModule {}
