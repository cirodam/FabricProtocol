import { randomUUID } from "crypto";

export class HousingUnit {
    readonly id: string;
    ownerId: string;
    name: string;
    latitude: number;
    longitude: number;

    // Utilities & conditions
    hasRunningWater: boolean;
    hasToilet: boolean;
    hasElectricity: boolean;
    hasHeating: boolean;
    hasCooking: boolean;
    isHabitable: boolean;

    private memberIds: Set<string> = new Set();
    readonly createdAt: Date;

    constructor(
        ownerId: string,
        name: string,
        latitude: number = 0,
        longitude: number = 0,
    ) {
        this.id = randomUUID();
        this.ownerId = ownerId;
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.hasRunningWater = false;
        this.hasToilet = false;
        this.hasElectricity = false;
        this.hasHeating = false;
        this.hasCooking = false;
        this.isHabitable = false;
        this.createdAt = new Date();
    }

    addMember(memberId: string): void {
        this.memberIds.add(memberId);
    }

    removeMember(memberId: string): void {
        this.memberIds.delete(memberId);
    }

    getMembers(): string[] {
        return Array.from(this.memberIds);
    }

    occupancy(): number {
        return this.memberIds.size;
    }
}
