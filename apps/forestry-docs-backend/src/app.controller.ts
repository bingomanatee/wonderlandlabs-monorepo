import { Controller, Get, Param } from "@nestjs/common";
import { AppService } from "./app.service";
import { RedisService } from "./services/redis/redis.service";
import { InputService } from "./services/input/input.service";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly redisService: RedisService,
    private readonly inputService: InputService
  ) {}

  @Get("/")
  async keys(): Promise<string> {
    console.log("--- keys");
    const keys = await this.redisService.test();
    console.log("keys", keys);
    return this.appService.getHello(keys);
  }

  @Get("/load/:level")
  async loadData(@Param() params: any) {
    console.log("---load", params.level);
    const loadNum = Number(params.level);
    if ([1, 2, 3].includes(loadNum)) return this.inputService.read(loadNum);
    else {
      throw new Error("bad load level " + params.level);
    }
  }

  @Get("/data/:level")
  async getData(@Param() params: any) {
    console.log("---data", params.level);
    const loadNum = Number(params.level);
    if ([1, 2, 3].includes(loadNum)) return this.inputService.data(loadNum);
    else {
      throw new Error("bad load level " + params.level);
    }
  }
}
