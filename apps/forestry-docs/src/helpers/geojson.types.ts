// Coordinate tuple for GeoJSON: [longitude, latitude, (optional) elevation]
export type Position = [number, number] | [number, number, number];

// Geometry object definitions
export interface GeoJsonGeometryPoint {
  type: "Point";
  coordinates: Position;
}

export interface GeoJsonGeometryLineString {
  type: "LineString";
  coordinates: Position[];
}

export interface GeoJsonGeometryPolygon {
  type: "Polygon";
  coordinates: Position[][];
}

export interface GeoJsonGeometryMultiPoint {
  type: "MultiPoint";
  coordinates: Position[];
}

export interface GeoJsonGeometryMultiLineString {
  type: "MultiLineString";
  coordinates: Position[][];
}

export interface GeoJsonGeometryMultiPolygon {
  type: "MultiPolygon";
  coordinates: Position[][][];
}

export interface GeoJsonGeometryCollection {
  type: "GeometryCollection";
  geometries: GeoJsonGeometry[];
}

// Union type representing all possible GeoJSON Geometry types
export type GeoJsonGeometry =
  | GeoJsonGeometryPoint
  | GeoJsonGeometryLineString
  | GeoJsonGeometryPolygon
  | GeoJsonGeometryMultiPoint
  | GeoJsonGeometryMultiLineString
  | GeoJsonGeometryMultiPolygon
  | GeoJsonGeometryCollection;
