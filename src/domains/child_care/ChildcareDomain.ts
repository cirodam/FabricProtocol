import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";
import { CommunityRole } from "../../commons/CommunityRole.js";
import { ChildcareProfile } from "./ChildcareProfile.js";
import { HomeChildcare } from "./HomeChildcare.js";
import { HomeChildcareLoader } from "./HomeChildcareLoader.js";
import { MemberService } from "../../member/MemberService.js";
import { Member } from "../../member/Member.js";

const AGE_LIMIT_YEARS = 5;

function ageYears(birthDate: Date): number {
    return (Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
}

export class ChildcareDomain extends FunctionalDomain {
    private static readonly DOMAIN_ID = "00000000-0000-0000-0000-000000000012";
    private static instance: ChildcareDomain;

    private profiles: Map<string, ChildcareProfile> = new Map();
    private homeChildcareLoader: HomeChildcareLoader | null = null;
    private homeChildcareUnit: HomeChildcare | null = null;

    private constructor() {
        super("Childcare", "Provides care and early education for children in the community.", ChildcareDomain.DOMAIN_ID);
        this.addRole(new CommunityRole(
            "Childcare Coordinator",
            "Organises home childcare programs, recruits and supports caregivers, and ensures children under five have access to safe, nurturing care.",
            700,
        ));
    }

    static getInstance(): ChildcareDomain {
        if (!ChildcareDomain.instance) {
            ChildcareDomain.instance = new ChildcareDomain();
        }
        return ChildcareDomain.instance;
    }

    // ── Home Childcare ────────────────────────────────────────────────────────

    initHomeChildcare(loader: HomeChildcareLoader): void {
        this.homeChildcareLoader = loader;
        const existing = loader.load();
        if (existing) {
            this.homeChildcareUnit = existing;
            this.addUnit(existing);
        } else {
            const unit = new HomeChildcare();
            this.homeChildcareUnit = unit;
            this.addUnit(unit);
            loader.save(unit);
        }
    }

    getHomeChildcare(): HomeChildcare | null {
        return this.homeChildcareUnit;
    }

    saveHomeChildcare(): void {
        if (this.homeChildcareUnit) {
            this.homeChildcareLoader?.save(this.homeChildcareUnit);
        }
    }

    // ── Care Profiles ─────────────────────────────────────────────────────────

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

