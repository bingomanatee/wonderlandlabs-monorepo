import { Injectable } from "@nestjs/common";
import { RedisService } from "src/services/redis/redis.service";

@Injectable()
export class ByCountryService {
  constructor(redisService: RedisService) {}
}
