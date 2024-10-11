import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import debounce from "lodash.debounce";
type Strs = string | string[];

const delayedFlush = debounce((redisService: RedisService) => {
  console.log("delayed flushing pipeline");
  redisService.flushPipeline();
}, 1000);

const MAX_BYTES = 500000;
@Injectable()
export class RedisService {
  constructor(private configService: ConfigService) {
    this.conn = new Redis({
      password: this.password,
      host: this.path,
      port: this.port,
    });
  }
  private conn: Redis;

  get path() {
    return this.configService.get<string>("REDIS_ENDPOINT").split(":")[0];
  }

  #endpoint?: string;
  get endpoint() {
    if (!this.#endpoint) {
      this.#endpoint = this.configService.get<string>("REDIS_ENDPOINT");
    }
    return this.#endpoint;
  }
  get port() {
    return Number.parseInt(this.endpoint.split(":")[1]);
  }

  get password() {
    return this.configService.get<string>("REDIS_PASSWORD");
  }

  async test() {
    const keys = await this.conn.keys("*");
    return keys.join(", ");
  }

  async keys(pattern: string) {
    return this.conn.keys(pattern);
  }

  async del(...keys: Strs[]) {
    const fKeys = keys.flat();
    console.log("deleting keys", fKeys.slice(0, 10), "(", fKeys.length, ")");
    return this.conn.del(fKeys);
  }

  #pipeline;
  #pipelineSize = 0;

  flushPipeline() {
    if (!this.#pipeline) return;
    this.#pipeline.exec((_err, result) => {
      console.log(
        "pipeline written",
        Array.isArray(result) ? result.length : ""
      );
    });
    this.#pipeline = undefined;
    this.#pipelineSize = 0;
  }

  async set(key: string, data: string | Buffer) {
    if (!this.#pipeline) {
      this.#pipeline = this.conn.pipeline().set(key, data);
      this.#pipelineSize = data.length;
    } else {
      this.#pipeline.set(key, data);
      this.#pipelineSize += data.length;
    }
    if (this.#pipelineSize > MAX_BYTES) {
      this.flushPipeline();
    } else {
      delayedFlush(this);
    }

    return this.conn.set(key, data);
  }
}
