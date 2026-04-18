export interface Event {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly type: "festival" | "performance" | "screening" | "workshop" | "gathering" | "other";
    readonly organizerId: string;   // member or functional unit id
    readonly scheduledAt: string;   // ISO datetime
    readonly durationMinutes: number;
    readonly locationDescription: string;
    readonly maxAttendees: number | null; // null = open
}
