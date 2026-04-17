import { FunctionalDomain } from "../commons/domain/FunctionalDomain.js";
import { DependencyCareProfile, CareNeeds } from "./DependencyCareProfile.js";

export class DependencyCareDomain extends FunctionalDomain {
    private profiles: Map<string, DependencyCareProfile> = new Map();

    constructor() {
        super("DependencyCare", "Supports members with chronic illness, disability, or other ongoing care needs.");
    }

    addProfile(memberId: string, careNeeds: CareNeeds, notes: string = ""): DependencyCareProfile {
        const profile = new DependencyCareProfile(memberId, careNeeds, notes);
        this.profiles.set(profile.id, profile);
        return profile;
    }

    getProfile(profileId: string): DependencyCareProfile | undefined {
        return this.profiles.get(profileId);
    }

    getProfileByMember(memberId: string): DependencyCareProfile | undefined {
        return Array.from(this.profiles.values()).find((p) => p.memberId === memberId);
    }

    getAllProfiles(): DependencyCareProfile[] {
        return Array.from(this.profiles.values());
    }

    removeProfile(profileId: string): void {
        this.profiles.delete(profileId);
    }
}
