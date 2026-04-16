export interface Tour {
  id: number;
  userId: number;
  name: string;
  description: string;
  from: string;
  to: string;
  transportType: TransportType;
  distance: number;          // in km, from OpenRouteService
  estimatedTime: number;     // in minutes, from OpenRouteService
  routeGeoJson: any | null;  // GeoJSON from OpenRouteService
  routeImagePath: string;    // path to stored map screenshot (backend-generated)
  imageUrl: string;          // user-provided image URL for the tour

  // Computed attributes
  popularity: number;            // derived from number of logs
  childFriendliness: number;     // derived from difficulty, time, distance of logs

  // Coordinates for map markers
  fromCoords: [number, number] | null;  // [lat, lng]
  toCoords: [number, number] | null;    // [lat, lng]
}

export enum TransportType {
  BIKE = 'BIKE',
  HIKE = 'HIKE',
  RUNNING = 'RUNNING',
  VACATION = 'VACATION'
}
