/**
 * Geographic analytics utilities.
 * All distance calculations use the Haversine formula, returning kilometres.
 */

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
    return (deg * Math.PI) / 180;
}

/** Haversine distance between two lat/lng points, in kilometres. */
export function haversineKm(
    lat1: number, lng1: number,
    lat2: number, lng2: number,
): number {
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface GeoPoint {
    id:    string;
    label: string;
    lat:   number;
    lng:   number;
}

export interface GeographicAnalytics {
    /** Number of locations included in the analysis. */
    locationCount: number;
    /** Geographic centroid of all locations. */
    centroid: { lat: number; lng: number };
    /** Mean distance (km) from each location to the centroid. */
    meanDistanceToCentroidKm: number;
    /** Standard deviation (km) of distances to centroid — the "spread" metric. */
    spreadKm: number;
    /** Maximum straight-line distance (km) between any two locations. */
    maxPairwiseDistanceKm: number;
    /** The two locations that are furthest apart. */
    maxPairwisePair: [GeoPoint, GeoPoint] | null;
    /** Average straight-line distance (km) between all pairs. */
    avgPairwiseDistanceKm: number;
    /** Rough walkability assessment based on spread. */
    walkabilityAssessment: "walkable" | "bikeable" | "car-dependent" | "insufficient-data";
}

export function computeGeographicAnalytics(points: GeoPoint[]): GeographicAnalytics {
    if (points.length === 0) {
        return {
            locationCount:            0,
            centroid:                 { lat: 0, lng: 0 },
            meanDistanceToCentroidKm: 0,
            spreadKm:                 0,
            maxPairwiseDistanceKm:    0,
            maxPairwisePair:          null,
            avgPairwiseDistanceKm:    0,
            walkabilityAssessment:    "insufficient-data",
        };
    }

    // Centroid
    const centroid = {
        lat: points.reduce((s, p) => s + p.lat, 0) / points.length,
        lng: points.reduce((s, p) => s + p.lng, 0) / points.length,
    };

    // Distances to centroid
    const distsToCentroid = points.map(p => haversineKm(p.lat, p.lng, centroid.lat, centroid.lng));
    const meanDist = distsToCentroid.reduce((s, d) => s + d, 0) / distsToCentroid.length;
    const variance = distsToCentroid.reduce((s, d) => s + (d - meanDist) ** 2, 0) / distsToCentroid.length;
    const spreadKm = Math.sqrt(variance);

    // Pairwise distances
    let maxDist = 0;
    let maxPair: [GeoPoint, GeoPoint] | null = null;
    let totalPairDist = 0;
    let pairCount = 0;

    for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
            const d = haversineKm(points[i].lat, points[i].lng, points[j].lat, points[j].lng);
            totalPairDist += d;
            pairCount++;
            if (d > maxDist) {
                maxDist = d;
                maxPair = [points[i], points[j]];
            }
        }
    }

    const avgPairwise = pairCount > 0 ? totalPairDist / pairCount : 0;

    // Walkability heuristic based on spread radius
    // <0.8 km spread = most trips under 1.5 km = walkable
    // <2.5 km spread = most trips under 5 km = bikeable
    // otherwise = car-dependent
    let walkabilityAssessment: GeographicAnalytics["walkabilityAssessment"];
    if (points.length < 3) {
        walkabilityAssessment = "insufficient-data";
    } else if (spreadKm < 0.8) {
        walkabilityAssessment = "walkable";
    } else if (spreadKm < 2.5) {
        walkabilityAssessment = "bikeable";
    } else {
        walkabilityAssessment = "car-dependent";
    }

    return {
        locationCount:            points.length,
        centroid,
        meanDistanceToCentroidKm: Math.round(meanDist * 1000) / 1000,
        spreadKm:                 Math.round(spreadKm * 1000) / 1000,
        maxPairwiseDistanceKm:    Math.round(maxDist * 1000) / 1000,
        maxPairwisePair:          maxPair,
        avgPairwiseDistanceKm:    Math.round(avgPairwise * 1000) / 1000,
        walkabilityAssessment,
    };
}
