import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";
import { TransitRoute } from "./TransitRoute.js";

/**
 * The Transport domain runs scheduled people-mover routes within the community.
 *
 * Car-dependence is one of the primary mechanisms of isolation in modern life —
 * members who cannot drive (elderly, disabled, young adults without a vehicle)
 * are effectively cut off from participation. The Transport domain makes mobility
 * a public service: fixed routes run on a known schedule, operated by community
 * members compensated through payroll.
 *
 * This is the internal analog of a municipal bus system. Routes are sized to one
 * operator's working day and cover predictable paths: residential areas to the
 * commons hub, hub to the clinic, hub to the food domain, inter-neighborhood runs.
 *
 * Coordinates with the Dependency Care domain for members with mobility limitations
 * who may need door-to-door service rather than fixed-stop pickup.
 *
 * In a federation context, inter-community routes may be operated jointly between
 * member communities to connect their hubs.
 */
export class TransportDomain extends FunctionalDomain {
    private routes: Map<string, TransitRoute> = new Map();

    constructor() {
        super("Transport", "Runs scheduled people-mover routes within the community.");
    }

    // ── Routes ─────────────────────────────────────────────────────────────────

    addRoute(name: string, description: string = "", stops: string[] = [], scheduleDescription: string = ""): TransitRoute {
        const route = new TransitRoute(name, description, stops, scheduleDescription);
        this.routes.set(route.id, route);
        return route;
    }

    assignOperator(routeId: string, operatorId: string): void {
        const route = this.routes.get(routeId);
        if (!route) throw new Error(`Route ${routeId} not found`);
        route.operatorId = operatorId;
    }

    getRoutes(): TransitRoute[] {
        return Array.from(this.routes.values());
    }

    getUnassignedRoutes(): TransitRoute[] {
        return this.getRoutes().filter(r => r.operatorId === null);
    }

    getRoute(routeId: string): TransitRoute | undefined {
        return this.routes.get(routeId);
    }
}
