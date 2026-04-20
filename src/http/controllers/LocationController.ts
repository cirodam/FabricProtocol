import { Request, Response } from "express";
import { LocationRegistry } from "../../location/LocationRegistry.js";
import { Location, LocationType } from "../../location/Location.js";
import { Address } from "../../location/Address.js";
import { computeGeographicAnalytics, GeoPoint } from "../../location/GeoAnalytics.js";

function locationToDto(loc: Location) {
    return {
        id:             loc.id,
        label:          loc.label,
        address:        loc.address,
        latitude:       loc.latitude,
        longitude:      loc.longitude,
        type:           loc.type,
        linkedEntityId: loc.linkedEntityId,
        notes:          loc.notes,
        createdAt:      loc.createdAt.toISOString(),
    };
}

function parseAddress(body: Record<string, unknown>): Address | null {
    const { street, city, state, zip, unit } = body;
    if (typeof street !== "string" || !street.trim()) return null;
    if (typeof city   !== "string" || !city.trim())   return null;
    if (typeof state  !== "string" || !state.trim())  return null;
    if (typeof zip    !== "string" || !zip.trim())    return null;
    const addr: Address = {
        street: (street as string).trim(),
        city:   (city   as string).trim(),
        state:  (state  as string).trim(),
        zip:    (zip    as string).trim(),
    };
    if (typeof unit === "string" && unit.trim()) addr.unit = unit.trim();
    return addr;
}

const VALID_TYPES = new Set<LocationType>(["community", "residential", "external"]);

// GET /locations?type=community|residential|external
export function listLocations(req: Request, res: Response): void {
    const type = req.query.type as string | undefined;
    const all = type && VALID_TYPES.has(type as LocationType)
        ? LocationRegistry.getInstance().getByType(type as LocationType)
        : LocationRegistry.getInstance().getAll();
    res.json({ total: all.length, locations: all.map(locationToDto) });
}

// GET /locations/:id
export function getLocation(req: Request, res: Response): void {
    const loc = LocationRegistry.getInstance().get(req.params.id as string);
    if (!loc) { res.status(404).json({ error: "Location not found" }); return; }
    res.json(locationToDto(loc));
}

// POST /locations
// Body: { label, address: { street, unit?, city, state, zip }, latitude, longitude, type?, linkedEntityId?, notes? }
export function createLocation(req: Request, res: Response): void {
    const body = req.body ?? {};
    const { label, latitude, longitude, type, linkedEntityId, notes } = body;

    if (typeof label !== "string" || !label.trim()) {
        res.status(400).json({ error: "label is required" }); return;
    }
    const address = parseAddress(body.address ?? {});
    if (!address) {
        res.status(400).json({ error: "address with street, city, state, zip is required" }); return;
    }
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        res.status(400).json({ error: "latitude and longitude must be numbers" }); return;
    }
    const locType: LocationType = VALID_TYPES.has(type as LocationType) ? type as LocationType : "external";

    const loc = new Location(label.trim(), address, lat, lng, locType);
    if (typeof linkedEntityId === "string" && linkedEntityId.trim()) loc.linkedEntityId = linkedEntityId.trim();
    if (typeof notes           === "string") loc.notes = notes;

    LocationRegistry.getInstance().add(loc);
    res.status(201).json(locationToDto(loc));
}

// PATCH /locations/:id
export function updateLocation(req: Request, res: Response): void {
    const registry = LocationRegistry.getInstance();
    const loc = registry.get(req.params.id as string);
    if (!loc) { res.status(404).json({ error: "Location not found" }); return; }

    const body = req.body ?? {};
    if (typeof body.label === "string" && body.label.trim()) loc.label = body.label.trim();
    if (typeof body.notes === "string") loc.notes = body.notes;
    if (typeof body.linkedEntityId === "string") loc.linkedEntityId = body.linkedEntityId || null;
    if (VALID_TYPES.has(body.type as LocationType)) loc.type = body.type as LocationType;

    const lat = Number(body.latitude);
    const lng = Number(body.longitude);
    if (Number.isFinite(lat)) loc.latitude  = lat;
    if (Number.isFinite(lng)) loc.longitude = lng;

    const address = body.address ? parseAddress(body.address) : null;
    if (address) loc.address = address;

    registry.save(loc);
    res.json(locationToDto(loc));
}

// DELETE /locations/:id
export function deleteLocation(req: Request, res: Response): void {
    const existed = LocationRegistry.getInstance().remove(req.params.id as string);
    if (!existed) { res.status(404).json({ error: "Location not found" }); return; }
    res.status(204).send();
}

// GET /locations/analytics?type=community|residential|external
// Omit type to include all locations.
export function getAnalytics(req: Request, res: Response): void {
    const type = req.query.type as string | undefined;
    const VALID: Set<LocationType> = new Set(["community", "residential", "external"]);
    const locs = type && VALID.has(type as LocationType)
        ? LocationRegistry.getInstance().getByType(type as LocationType)
        : LocationRegistry.getInstance().getAll();

    const points: GeoPoint[] = locs
        .filter(l => l.latitude !== 0 || l.longitude !== 0)
        .map(l => ({ id: l.id, label: l.label, lat: l.latitude, lng: l.longitude }));

    res.json(computeGeographicAnalytics(points));
}
