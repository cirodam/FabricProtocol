import { VoteThreshold } from "./Proposal.js";

// ── Types ────────────────────────────────────────────────────────────────────

export type ParameterAuthority = "immutable" | "citizens-assembly" | "council" | "commonwealth";

export interface ConstitutionalParameter<T extends number | boolean> {
    readonly value: T;
    readonly authority: ParameterAuthority;
    readonly description: string;
    readonly constraints?: { min?: number; max?: number };
}

export interface ConstitutionAmendment {
    readonly version: number;
    readonly parameter: string;
    readonly oldValue: number | boolean;
    readonly newValue: number | boolean;
    readonly proposalId: string;
    readonly amendedAt: string; // ISO 8601
}

export interface ConstitutionDocument {
    version: number;
    adoptedAt: string;
    parameters: Record<string, ConstitutionalParameter<number | boolean>>;
    amendments: ConstitutionAmendment[];
}

// ── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_CONSTITUTION: ConstitutionDocument = {
    version: 1,
    adoptedAt: new Date().toISOString(),
    parameters: {
        // ── Axioms — unit definitions, never changeable ──────────────────────
        kinPerPersonYear: {
            value: 10_000,
            authority: "immutable",
            description:
                "Kin issued per person-year of presence. This is a unit definition — 1 kin = 1/10,000 person-year — not a policy choice. All human years are valued equally.",
        },

        // ── Fundamental guarantees — axioms, not policies ────────────────────
        universalFloorGuaranteed: {
            value: true,
            authority: "immutable",
            description: "Every member receives basic needs support unconditionally.",
        },
        membershipUnconditional: {
            value: true,
            authority: "immutable",
            description: "Belonging is not contingent on productive capacity.",
        },
        dataPortabilityGuaranteed: {
            value: true,
            authority: "immutable",
            description: "Members can always take their data and leave.",
        },
        ledgerTransparent: {
            value: true,
            authority: "immutable",
            description: "All kin flows are visible to all members.",
        },
        democraticMinimumProtected: {
            value: true,
            authority: "immutable",
            description: "Governance cannot be captured by any individual or group.",
        },
        dueProcessGuaranteed: {
            value: true,
            authority: "immutable",
            description:
                "No member may have their membership suspended, revoked, or materially restricted without notice, a stated reason, and an opportunity to respond before the decision takes effect.",
        },
        noExPostFacto: {
            value: true,
            authority: "immutable",
            description:
                "No rule change may be applied retroactively to penalise conduct that was permitted at the time it occurred.",
        },
        rightOfAppeal: {
            value: true,
            authority: "immutable",
            description:
                "Any member subject to an adverse governance decision has the right to appeal it to an independent body before it takes permanent effect.",
        },

        // ── Vote thresholds ──────────────────────────────────────────────────
        thresholdSimpleMajority: {
            value: 0.51,
            authority: "citizens-assembly",
            description: "Fraction of total members required to pass a simple majority proposal.",
            constraints: { min: 0.51, max: 0.66 },
        },
        thresholdSupermajority: {
            value: 0.67,
            authority: "citizens-assembly",
            description: "Fraction of total members required to pass a supermajority proposal.",
            constraints: { min: 0.60, max: 0.80 },
        },
        thresholdNearConsensus: {
            value: 0.90,
            authority: "citizens-assembly",
            description: "Fraction of total members required to pass a near-consensus proposal.",
            constraints: { min: 0.80, max: 1.00 },
        },

        // ── Governance process ───────────────────────────────────────────────
        deliberationPeriodDays: {
            value: 3,
            authority: "council",
            description: "Minimum days before a proposal vote can close.",
            constraints: { min: 1, max: 30 },
        },

        // ── Monetary policy ──────────────────────────────────────────────────
        bankDemurrageRate: {
            value: 0.02,
            authority: "citizens-assembly",
            description:
                "Monthly rate at which the Central Bank applies demurrage to recover unanchored kin.",
            constraints: { min: 0, max: 0.10 },
        },
        commonsLevyRate: {
            value: 0.02,
            authority: "citizens-assembly",
            description:
                "Monthly commons levy rate applied to all non-exempt member accounts. Funds flow to the Commonwealth.",
            constraints: { min: 0, max: 0.10 },
        },

        // ── Basic income ─────────────────────────────────────────────────────
        monthlyFoodAllowance: {
            value: 833,
            authority: "citizens-assembly",
            description:
                "Kin paid to each member per month from the Food domain as an unconditional food allowance. This is a community policy decision — not a monetary definition. The community decides how much of the commons to distribute to members each month.",
            constraints: { min: 0 },
        },
    },
    amendments: [],
};

// ── Constitution singleton ───────────────────────────────────────────────────

export class Constitution {
    private static instance: Constitution;
    private doc: ConstitutionDocument = { ...DEFAULT_CONSTITUTION, amendments: [] };

    private constructor() {}

    static getInstance(): Constitution {
        if (!Constitution.instance) {
            Constitution.instance = new Constitution();
        }
        return Constitution.instance;
    }

    /** Load a persisted document, replacing the in-memory defaults. */
    load(doc: ConstitutionDocument): void {
        this.doc = doc;
    }

    /** Current constitution version. */
    get version(): number { return this.doc.version; }

    /** ISO timestamp of original adoption. */
    get adoptedAt(): string { return this.doc.adoptedAt; }

    /** Full amendment history. */
    get amendments(): readonly ConstitutionAmendment[] { return this.doc.amendments; }

    /** Return the raw document for persistence. */
    toDocument(): ConstitutionDocument { return this.doc; }

    /** Read a parameter's current value. Throws if unknown. */
    get<T extends number | boolean>(key: string): T {
        const param = this.doc.parameters[key];
        if (!param) throw new Error(`Unknown constitutional parameter: "${key}"`);
        return param.value as T;
    }

    /** Return full parameter metadata. */
    getParameter(key: string): ConstitutionalParameter<number | boolean> {
        const param = this.doc.parameters[key];
        if (!param) throw new Error(`Unknown constitutional parameter: "${key}"`);
        return param;
    }

    /** List all parameter keys and metadata. */
    getAll(): Record<string, ConstitutionalParameter<number | boolean>> {
        return { ...this.doc.parameters };
    }

    /**
     * Amend a mutable parameter. Called by GovernanceService after a proposal passes.
     * Throws if the parameter is immutable or if the value is out of constraints.
     */
    amend(key: string, newValue: number | boolean, proposalId: string): void {
        const param = this.doc.parameters[key];
        if (!param) throw new Error(`Unknown constitutional parameter: "${key}"`);
        if (param.authority === "immutable") {
            throw new Error(`Parameter "${key}" is immutable — it is a unit definition, not a policy choice.`);
        }
        if (typeof newValue === "number" && param.constraints) {
            const { min, max } = param.constraints;
            if (min !== undefined && newValue < min)
                throw new Error(`Value ${newValue} is below the minimum (${min}) for "${key}"`);
            if (max !== undefined && newValue > max)
                throw new Error(`Value ${newValue} exceeds the maximum (${max}) for "${key}"`);
        }

        const amendment: ConstitutionAmendment = {
            version:   this.doc.version + 1,
            parameter: key,
            oldValue:  param.value,
            newValue,
            proposalId,
            amendedAt: new Date().toISOString(),
        };

        // Mutate the parameter value and bump the version
        (this.doc.parameters[key] as { value: number | boolean }).value = newValue;
        this.doc.version = amendment.version;
        this.doc.amendments.push(amendment);
    }

    // ── Convenience getters for frequently used parameters ───────────────────

    /** Vote threshold fractions keyed by VoteThreshold enum. */
    get thresholds(): Record<VoteThreshold, number> {
        return {
            [VoteThreshold.SIMPLE_MAJORITY]: this.get<number>("thresholdSimpleMajority"),
            [VoteThreshold.SUPERMAJORITY]:   this.get<number>("thresholdSupermajority"),
            [VoteThreshold.NEAR_CONSENSUS]:  this.get<number>("thresholdNearConsensus"),
        };
    }

    get deliberationPeriodDays(): number  { return this.get<number>("deliberationPeriodDays"); }
    get bankDemurrageRate(): number       { return this.get<number>("bankDemurrageRate"); }
    get commonsLevyRate(): number         { return this.get<number>("commonsLevyRate"); }
    get kinPerPersonYear(): number        { return this.get<number>("kinPerPersonYear"); }
    get monthlyFoodAllowance(): number    { return this.get<number>("monthlyFoodAllowance"); }
}
