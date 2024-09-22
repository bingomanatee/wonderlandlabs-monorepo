import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { RedisModule } from "./services/redis/redis.module";
import { RedisService } from "./services/redis/redis.service";

import { ConfigModule } from "@nestjs/config";
import { InputModule } from "./services/input/input.module";
import { InputService } from "./services/input/input.service";
import { SupabaseService } from "./services/input/supabase/supabase.service";
import { SupabaseModule } from "./services/input/supabase/supabase.module";
@Module({
  imports: [RedisModule, ConfigModule.forRoot(), InputModule, SupabaseModule],
  controllers: [AppController],
  providers: [AppService, RedisService, InputService, SupabaseService],
})
export class AppModule {}
