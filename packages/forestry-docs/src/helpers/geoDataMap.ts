import type { GeoJsonGeometryPolygon } from "./geojson.types";
import data from "./custom.geo.json";
export const geoDataMap: Map<string, GeoJsonGeometryPolygon> = new Map();

type Feature = {
  type: string;
  properties: { adm0_a3: string };
  geometry: GeoJsonGeometryPolygon;
};

data.features.forEach(
  // @ts-expect-error
  (feature: Feature) => {
    const { properties, geometry } = feature;
    if (properties.adm0_a3) {
      geoDataMap.set(properties.adm0_a3, geometry);
    }
  }
);
