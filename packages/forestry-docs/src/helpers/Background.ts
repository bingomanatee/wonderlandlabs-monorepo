import Two from 'two.js';
import dayjs from 'dayjs';
import { Screen } from './Screen';
import type { DateInfo, CellIF, BasePlace } from '../types';
import type { Group } from 'two.js/src/group';
import { Cell } from './Cell';
import { datesTree, deathCollections, placeCollection } from '../CovidForestState';
import { project } from './project';
let singleton: Background | null = null;

const ISO_DATE = 'YYYY-MM-DD';
export const unit = 8;

export class Background {
  #node?: HTMLElement;

  #resizeObserver?: ResizeObserver;
  #screen?: Screen;
  #two?: Two;

  constructor() {
    this.#init();
    this.process();
  }

  process() {
    //   const container = new XYContainer();
    //   for (const p of data) {
    //     container.add(p.longitude, p.latitude);
    //   }
    //   console.log("lat lon range:", container);
    const dates = Array.from(datesTree.value)
      .map((d: string) => ({
        string: d,
        date: dayjs(d, ISO_DATE),
      }))
      .sort((d1: DateInfo, d2: DateInfo) => d1.date.diff(d2.date, 'd'));
    console.log('#process()', dates);

    console.log('dates are ', dates.slice(0, 4));
    this.#drawInfo(dates);
  }

  #placeToIJ(place: BasePlace) {
    const { latitude, longitude } = place;

    const iCount = this.#screen?.iCount ?? 0;
    const jCount = this.#screen?.jCount ?? 0;

    console.log('p2ij: ', iCount, jCount);

    const j = Math.floor(project(latitude, 90, -90, 0, jCount));
    const i = Math.floor(project(longitude, -180, 180, 0, iCount));
    console.log('place', place, 'lat long = ', latitude, longitude, 'i j = ', i, j);

    return { i, j };
  }

  #drawInfo(dates: DateInfo[]) {
    console.log('drawInfo()');

    const lastDate = dates[dates.length - 1];
    if (!lastDate) return;

    this.circleGroup?.remove(this.circleGroup.children);
    this.textGroup?.remove(this.textGroup.children);

    Array.from(placeCollection.values()).forEach((place: BasePlace) => {
      const { i, j } = this.#placeToIJ(place);
      const cell = this.#screen?.cell(i, j);

      if (cell) {
        const deaths = deathCollections.get(place.id)?.get(lastDate.string);
        if (!deaths) return;
        const radius = deaths ? Math.pow(deaths, 1 / 3) : 0;
        this.#addCircle(cell, radius);
        this.#addText(place.iso_alpha_3 + ':' + deaths, cell);
      }
    });
  }

  #addText(label: string, cell: CellIF) {
    if (!this.#two) return;
    if (!this.textGroup) {
      this.#initGroups();
    }
    const text = this.#two.makeText(label, cell.x, cell.y, {
      fontSize: '0.5rem',
      fontWeight: 'bold',
      textAlign: 'left',
    });
    this.textGroup?.add(text);
  }

  #addCircle(cell: CellIF, radius: number) {
    if (!this.#two) return;
    if (!this.rectGroup) {
      this.#initGroups();
    }
    console.log('adding circle at', cell.x, cell.y, 'with radius', radius);
    const circle = this.#two.makeCircle(cell.x, cell.y, radius);
    circle.fill = 'rgba(255,0,0,0.2)';
    circle.stroke = 'transparent';
    if (cell.circle) {
      this.circleGroup?.remove(cell.circle);
    }
    cell.circle = circle;
    this.circleGroup?.add(circle);
  }

  #init() {
    this.#initCells();
    console.log('background rendered');
  }

  #initCells() {
    const node = document.getElementById('background');
    if (!node) return;
    this.#node = node;
    if (!this.#node) return;

    this.#resizeObserver = new ResizeObserver((entries) => {
      if (!this.#node) return;
      for (const entry of entries) {
        this.#initScreen(entry);
      }
    });

    this.#resizeObserver.observe(this.#node);
  }

  #initScreen(entry: ResizeObserverEntry) {
    const width = entry.contentRect.width;
    const height = entry.contentRect.height;
    const lastScreen = this.#screen;
    console.log('initialiaing screen', width, height);
    this.#screen = new Screen(width, height, (i, j, s) => new Cell(i, j, s), lastScreen);
    if (!this.#two) this.#initTwo();
    this.render();
  }

  #initTwo() {
    if (!this.#node || !this.#screen) return;
    const types = Two.Types;
    console.log('types are ', types);
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

  rectGroup?: null | Group;
  circleGroup?: null | Group;
  textGroup?: null | Group;

  #initGroups() {
    if (!this.#two) return;
    if (!this.rectGroup) {
      this.rectGroup = this.#two.makeGroup();
    }
    if (!this.circleGroup) {
      this.circleGroup = this.#two?.makeGroup();
    }
    if (!this.textGroup) {
      this.textGroup = this.#two?.makeGroup();
    }
  }

  render() {
    if (!this.#screen || !this.#two) {
      console.warn('cannot render without screen and two:', this.#screen, this.#two);
      return;
    }
    if (!this.rectGroup) {
      this.#initGroups();
    }
    this.#screen.cells.forEach((cell) => {
      if (!this.#node || !this.#screen || !this.#two) return;
      if (!cell.rect) {
        cell.rect = this.#two.makeRectangle(cell.x, cell.y, unit, unit);
      }
      cell.rect.fill = cell.color;
      cell.rect.stroke = 'transparent';
      this.rectGroup?.add(cell.rect);
    });
    console.log('rendered');
  }
}
