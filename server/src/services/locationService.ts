/**
 * Server-side location helpers for hyperlocal distance calculations.
 * Mirrors the core logic from the client locationService.
 */

export interface GeoPoint {
  lat: number;
  lng: number;
  name?: string;
  id?: string;
}

export interface ShopLike {
  id?: string;
  name?: string;
  locationId?: string;
  distanceKm?: number;
  lat?: number;
  lng?: number;
}

export interface LocationLike {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radiusKm?: number;
}

function isValidCoord(lat: number, lng: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/** Approximate road distance using a regional winding factor. */
export function calculateRoadDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;
  const straight = calculateDistanceKm(lat1, lon1, lat2, lon2);
  if (straight === 0) return 0;
  const winding =
    straight < 0.8 ? 1.45 : straight < 3.0 ? 1.38 : straight < 10.0 ? 1.32 : 1.28;
  return Math.max(0.2, Math.round(straight * winding * 10) / 10);
}

function getShopCoordinates(
  shop: ShopLike,
  locations: LocationLike[]
): { lat: number; lng: number; locationName: string } {
  if (
    shop.lat !== undefined &&
    shop.lng !== undefined &&
    isValidCoord(Number(shop.lat), Number(shop.lng))
  ) {
    const loc = locations.find((l) => l.id === shop.locationId);
    return {
      lat: Number(shop.lat),
      lng: Number(shop.lng),
      locationName: loc ? loc.name : shop.locationId || 'Unknown',
    };
  }

  const loc =
    locations.find((l) => l.id === shop.locationId) ||
    locations[0] || {
      id: 'default',
      name: 'Default',
      lat: 11.2375,
      lng: 75.9815,
    };

  const hash = (shop.id || shop.name || 'shop')
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const angles = [35, 110, 195, 280, 70, 160, 240, 315];
  const angle = (angles[Math.abs(hash) % angles.length] * Math.PI) / 180;
  const distKm = Math.min(
    2.5,
    Math.max(0.4, (shop.distanceKm || 0.8) + (Math.abs(hash % 7) * 0.2))
  );
  const deltaLat = (distKm / 111) * Math.cos(angle);
  const deltaLng =
    (distKm / (111 * Math.cos((loc.lat * Math.PI) / 180))) * Math.sin(angle);

  return {
    lat: Math.round((loc.lat + deltaLat) * 100000) / 100000,
    lng: Math.round((loc.lng + deltaLng) * 100000) / 100000,
    locationName: loc.name,
  };
}

/**
 * Calculates road-network-style distance from a consumer location to a shop.
 */
export function calculateHyperlocalDistance(
  consumerLocation: LocationLike | GeoPoint | null,
  shop: ShopLike,
  locations: LocationLike[]
): {
  distanceKm: number;
  consumerLocationName: string;
  shopLocationName: string;
} {
  const shopCoords = getShopCoordinates(shop, locations);

  if (!consumerLocation) {
    return {
      distanceKm: shop.distanceKm || 1.2,
      consumerLocationName: shopCoords.locationName,
      shopLocationName: shopCoords.locationName,
    };
  }

  const consumerLat = consumerLocation.lat;
  const consumerLng = consumerLocation.lng;
  const consumerName =
    (consumerLocation as any).name ||
    locations.find((l) => l.id === (consumerLocation as any).id)?.name ||
    'Your Location';

  const roadDist = calculateRoadDistanceKm(
    consumerLat,
    consumerLng,
    shopCoords.lat,
    shopCoords.lng
  );

  return {
    distanceKm: roadDist,
    consumerLocationName: consumerName,
    shopLocationName: shopCoords.locationName,
  };
}
