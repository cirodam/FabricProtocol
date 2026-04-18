import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";
import { ChildcareProfile } from "./ChildcareProfile.js";
import { MemberService } from "../../member/MemberService.js";
import { Member } from "../../member/Member.js";

const AGE_LIMIT_YEARS = 5;

function ageYears(birthDate: Date): number {
    return (Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
}

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

    /** Returns members under 5 who have no childcare profile. */
    getUnenrolledUnderFive(): Member[] {
        const enrolledIds = new Set(Array.from(this.profiles.values()).map(p => p.memberId));
        return MemberService.getInstance().getAll()
            .filter(m => ageYears(m.birthDate) < AGE_LIMIT_YEARS && !enrolledIds.has(m.id));
    }
}

