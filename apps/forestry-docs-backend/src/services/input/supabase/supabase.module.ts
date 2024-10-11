import { Module } from "@nestjs/common";
import { SupabaseService } from "./supabase.service";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [ConfigModule],
  providers: [SupabaseService, ConfigService],
})
export class SupabaseModule {}
