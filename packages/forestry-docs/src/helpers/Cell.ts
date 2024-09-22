import { clamp } from "lodash-es";
import { unit } from "./Background";
import type { ScreenIF } from "./types.background";

export class Cell {
  constructor(public i: number, public j: number, public s: ScreenIF) {}

  get iAngle() {
    return (Math.PI * this.i) / this.s.iCount;
  }

  get jGrad() {
    return (this.j / this.s.jCount - 0.25) * 2;
  }

  rect: any;

  circle: any;

  private get opacity() {
    const op = Math.sin(this.iAngle);
    return Math.pow(clamp(this.jGrad + op - 1, 0, 1), 4);
  }
  get color() {
    return `rgba(0, 0, 0, ${this.opacity})`;
  }

  get x() {
    return this.i * unit;
  }
  get y() {
    return this.j * unit;
  }
}
