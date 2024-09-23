import type { Dayjs } from "dayjs";
export type DateInfo = {
  string: string;
  date: Dayjs;
};

export type BasePlace = {
  id: string;
  latitude: number;
  longitude: number;
  population: number;
  iso_alpha_3: string;
  administrative_area_level: number;
  administrative_area_level_1: string;
  administrative_area_level_2: string;
  administrative_area_level_3: string;
};

export type Place = {
  dates: string[];
  deaths: number[];
  confirmed: number[];
} & BasePlace;

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
