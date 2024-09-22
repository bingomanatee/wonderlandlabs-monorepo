import { Module } from "@nestjs/common";
import { RedisService } from "./redis.service";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [ConfigModule],
  providers: [RedisService, ConfigService],
})
export class RedisModule {}
