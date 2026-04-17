// The Constitution holds the community's protected values.
// These cannot be overridden by any ordinary proposal.
// Amending the constitution requires near-consensus (≥90% approval).
export const Constitution = Object.freeze({
    universalFloorGuaranteed: true,       // every member receives basic needs support unconditionally
    membershipUnconditional: true,         // belonging is not contingent on productive capacity
    dataPortabilityGuaranteed: true,       // members can always take their data and leave
    ledgerTransparent: true,               // all credit flows are visible to all members
    democraticMinimumProtected: true,      // governance cannot be captured by any individual or group

    // Thresholds for proposal passage (fraction of votes required)
    thresholds: Object.freeze({
        SIMPLE_MAJORITY: 0.51,
        SUPERMAJORITY: 0.67,
        NEAR_CONSENSUS: 0.90,
    }),

    // Minimum deliberation period in days before a vote can close
    deliberationPeriodDays: 3,
});
