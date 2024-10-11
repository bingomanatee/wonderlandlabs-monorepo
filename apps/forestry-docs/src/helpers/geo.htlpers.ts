import type { Position, GeoJsonGeometry } from "./geojson.types";
import { project } from "./project";
import * as PIXI from "pixi.js";

export function scale([lon, lat]: Position, w: number, h: number) {
  let left = 0;
  let right = w;
  let top = 0;
  let bottom = h;
  if (w / h > 2) {
    // too wide - expand the sides
    const widerHeight = w / 2;
    const extraHeight = widerHeight - h;
    top -= extraHeight * 0.25;
    bottom += extraHeight * 0.75;
  } else {
    // too narrow: center horizontally.
    const widerWidth = h * 2;
    const extraWidth = widerWidth - w;
    left = -extraWidth * 0.25;
    right += extraWidth * 0.75;
  }
  const center = (left + right) / 2;
  const radius = (right - left) / 2;
  const latScale = Math.cos(toRadians(lat));
  left = center - radius * latScale;
  right = center + radius * latScale;
  const x = project(lon, -160, 180, left, right);
  const y = project(lat, 80, -80, top, bottom);
  return { x, y };
}

function toRadians(angle: number) {
  return (angle * Math.PI) / 180;
}
export function toPolar([lon, lat]: Position, w: number, h: number) {
  const centerX = w / 2;
  const centerY = h / 2;

  const radLon = toRadians(lon + 360);
  const radius = (w + h) / 2;
  const lonX = Math.cos(radLon);
  const lonY = Math.sin(radLon);

  const extent = radius - project(lat, 90, -90, 0, radius);
  const x = centerX + lonX * extent;
  const y = centerY + lonY * extent;
  return { x, y };
}

export function drawPoly(
  g: PIXI.Graphics,
  coordinates: Position[][],
  w: number,
  h: number
) {
  if (!coordinates.length) return;

  for (const coordinateList of coordinates) {
    const last = scale(coordinateList[coordinateList.length - 1], w, h);
    g.moveTo(last.x, last.y);
    for (const coord of coordinateList) {
      const { x, y } = scale(coord, w, h);
      g.lineTo(x, y);
    }
  }
}

export function drawGeometry(
  g: PIXI.Graphics,
  geometry: GeoJsonGeometry,
  w: number,
  h: number,
  color = new PIXI.Color({ r: 125, g: 100, b: 150 }).toNumber()
) {
  g.beginFill(color);
  if (geometry.type === "Polygon") {
    drawPoly(g, geometry.coordinates, w, h);
  } else if (geometry.type === "MultiPolygon") {
    geometry.coordinates.forEach((coords: Position[][]) => {
      drawPoly(g, coords, w, h);
    });
  } else {
    console.log("cannot render geometry", geometry);
  }

  g.endFill();
}
