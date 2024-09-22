import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(endpoint = ""): string {
    return "Hello World! redis endpoiont = " + endpoint;
  }
}
