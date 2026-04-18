export interface Announcement {
    readonly id: string;
    readonly title: string;
    readonly body: string;
    readonly authorId: string;
    readonly createdAt: string;       // ISO date
    readonly expiresAt: string | null; // ISO date, null = no expiry
}
