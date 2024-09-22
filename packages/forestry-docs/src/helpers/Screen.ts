import { unit } from "./Background";
import type { CellFactory, CellIF } from "./types.background";

export class Screen {
  constructor(
    public width: number,
    public height: number,
    private cellFactory: CellFactory,
    prevScreen?: Screen
  ) {
    this.initTiles();
  }
  private initTiles() {
    const tiles = this.iCount * this.jCount;
    const I = this.iCount;
    for (let t = 0; t < tiles; ++t) {
      const i = t % I;
      const j = Math.floor(t / I);
      this.cells[t] = this.cellFactory(i, j, this);
    }
  }
  get iCount() {
    return Math.ceil(this.width / unit);
  }
  get jCount() {
    return Math.ceil(this.height / unit);
  }

  cells: CellIF[] = [];

  cell(i: number, j: number) {
    if (i < 0 || j < 0 || i >= this.iCount || j >= this.jCount) {
      return null;
    }
    const index = j * this.iCount + i;
    return this.cells[index];
  }
}
