import { FunctionalDomain } from "../commons/domain/FunctionalDomain.js";
import { ChildcareProfile } from "./ChildcareProfile.js";

export class ChildcareDomain extends FunctionalDomain {
    private profiles: Map<string, ChildcareProfile> = new Map();

    constructor() {
        super("Childcare", "Provides care and early education for children in the community.");
    }

    addProfile(memberId: string, dateOfBirth: Date, notes: string = ""): ChildcareProfile {
        const profile = new ChildcareProfile(memberId, dateOfBirth, notes);
        this.profiles.set(profile.id, profile);
        return profile;
    }

    getProfile(profileId: string): ChildcareProfile | undefined {
        return this.profiles.get(profileId);
    }

    getProfileByMember(memberId: string): ChildcareProfile | undefined {
        return Array.from(this.profiles.values()).find((p) => p.memberId === memberId);
    }

    getAllProfiles(): ChildcareProfile[] {
        return Array.from(this.profiles.values());
    }

    removeProfile(profileId: string): void {
        this.profiles.delete(profileId);
    }
}

