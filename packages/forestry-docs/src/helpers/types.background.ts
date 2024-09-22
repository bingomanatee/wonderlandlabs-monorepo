import type { Dayjs } from "dayjs";
export type DateInfo = {
  string: string;
  date: Dayjs;
};
export type Place = {
  id: string;
  latitude: number;
  longitude: number;
  population: number;
  dates: string[];
  deaths: number[];
  confirmed: number[];
};
export type Mortality = { deaths: number; confirmed: number; place: Place };
export type DataMap = Map<string, Mortality>; // map of place mortality on a given daty
export type InfoMap = Map<DateInfo, DataMap>;

export interface CellIF {
  x: number;
  y: number;
  i: number;
  j: number;
  rect: any;
  circle: any;
  iAngle: number;
  color: string;
  jGrad: number;
}

export interface ScreenIF {
  cells: CellIF[];
  iCount: number;
  jCount: number;
  width: number;
  height: number;
}

export type CellFactory = (i: number, j: number, s: ScreenIF) => CellIF;
