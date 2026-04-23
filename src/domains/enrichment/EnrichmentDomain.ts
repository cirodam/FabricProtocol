import { randomUUID } from "crypto";
import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";
import { Event } from "./Event.js";
import { CommunityRole } from "../../commons/CommunityRole.js";

// The Enrichment domain coordinates the cultural and recreational life of the community:
// festivals, theatrical performances, film screenings, music, art, games, and celebrations.
//
// Enrichment is not a luxury add-on. Communities that neglect cultural life erode social
// cohesion and become places people leave. Funding enrichment as a domain means it has
// positions, a budget, and institutional standing — not just volunteer goodwill.
//
// FunctionalUnits within this domain might include:
//   - A community theater or performance space
//   - A library or media archive
//   - A sports and recreation facility
//   - A workshop space for art and craft
export class EnrichmentDomain extends FunctionalDomain {
    private static readonly DOMAIN_ID = "00000000-0000-0000-0000-000000000016";
    private static instance: EnrichmentDomain;

    private events: Event[] = [];

    private constructor() {
        super("Enrichment", "Coordinates cultural events, recreation, and community celebration.", EnrichmentDomain.DOMAIN_ID);
        this.addRole(new CommunityRole("Enrichment Coordinator", "Plans community events, manages venues, and coordinates cultural programming.", 700));
    }

    static getInstance(): EnrichmentDomain {
        if (!EnrichmentDomain.instance) EnrichmentDomain.instance = new EnrichmentDomain();
        return EnrichmentDomain.instance;
    }

    // Schedule a new event.
    scheduleEvent(
        title: string,
        description: string,
        type: Event["type"],
        organizerId: string,
        scheduledAt: string,
        durationMinutes: number,
        locationDescription: string,
        maxAttendees: number | null = null,
    ): Event {
        const event: Event = {
            id: randomUUID(),
            title,
            description,
            type,
            organizerId,
            scheduledAt,
            durationMinutes,
            locationDescription,
            maxAttendees,
        };
        this.events.push(event);
        return event;
    }

    cancelEvent(id: string): void {
        this.events = this.events.filter((e) => e.id !== id);
    }

    // Return upcoming events, soonest first.
    getUpcoming(): Event[] {
        const now = new Date().toISOString();
        return this.events
            .filter((e) => e.scheduledAt >= now)
            .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
    }

    // Return past events, most recent first.
    getPast(): Event[] {
        const now = new Date().toISOString();
        return this.events
            .filter((e) => e.scheduledAt < now)
            .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
    }

    getById(id: string): Event | undefined {
        return this.events.find((e) => e.id === id);
    }
}
