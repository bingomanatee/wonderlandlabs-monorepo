import Two from "two.js";
import { clamp } from "lodash-es";
let singleton: Background | null = null;

const ns = "http://www.w3.org/2000/svg";

const unit = 8;

class Cell {
  constructor(public i: number, public j: number, public s: Screen) {}

  get iAngle() {
    return (Math.PI * this.i) / this.s.iCount;
  }

  get jGrad() {
    return (this.j / this.s.jCount - 0.25) * 2;
  }

  rect: any;

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

class Screen {
  constructor(
    public width: number,
    public height: number,
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
      this.cells[t] = new Cell(i, j, this);
    }
  }
  get iCount() {
    return Math.ceil(this.width / unit);
  }
  get jCount() {
    return Math.ceil(this.height / unit);
  }

  cells: Cell[] = [];
}

export class Background {
  #node?: HTMLElement;

  #resizeObserver?: ResizeObserver;
  #screen?: Screen;
  #two?: Two;

  constructor() {
    this.#init();
  }

  #init() {
    this.#initCells();
    console.log("background rendered");
  }

  #initCells() {
    const node = document.getElementById("background");
    if (!node) return;
    this.#node = node;
    if (!this.#node) return;

    this.#resizeObserver = new ResizeObserver((entries) => {
      if (!this.#node) return;
      for (let entry of entries) {
        this.#initScreen(entry);
      }
    });

    this.#resizeObserver.observe(this.#node);
  }

  #initScreen(entry: ResizeObserverEntry) {
    const width = entry.contentRect.width;
    const height = entry.contentRect.height;
    let lastScreen = this.#screen;
    console.log("initialiaing screen", width, height);
    this.#screen = new Screen(width, height, lastScreen);
    if (!this.#two) this.#initTwo();
    this.render();
  }

  #initTwo() {
    if (!this.#node || !this.#screen) return;
    const types = Two.Types;
    console.log("types are ", types);
    this.#two = new Two({
      autostart: true,
      fitted: true,
      type: Two.Types.canvas,
    }).appendTo(this.#node);
  }

  static singleton() {
    if (!singleton) singleton = new Background();
    return singleton;
  }

  render() {
    if (!this.#screen || !this.#two) {
      console.warn(
        "cannot render without screen and two:",
        this.#screen,
        this.#two
      );
      return;
    }
    console.log("rendering cells");
    this.#screen.cells.forEach((cell, i) => {
      if (!this.#node || !this.#screen || !this.#two) return;
      if (!cell.rect) {
        cell.rect = this.#two.makeRectangle(cell.x, cell.y, unit, unit);
      }
      cell.rect.fill = cell.color;
      cell.rect.stroke = "transparent";
    });
    console.log("rendered");
  }
}
