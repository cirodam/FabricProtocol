import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";

/**
 * The Audit domain observes and reports on the economic health of the community.
 * It has no authority over other domains — its only output is information.
 *
 * At small scale (under a few hundred members) the assembly can read the ledger
 * directly. Past that threshold, the data becomes rich enough to require dedicated
 * interpretation: balance distribution, credit velocity, reserve levels, labor gaps,
 * and the downstream effects of policy decisions.
 *
 * This domain reports to the assembly, not to any functional domain. Independence
 * is the point — its job is partly to tell the assembly uncomfortable truths about
 * what the data shows.
 *
 * Typical work:
 *   - Periodic economic health reports (balance distribution, velocity, reserves)
 *   - Policy impact assessment (what changed after we raised food vouchers?)
 *   - Early warning (domains trending toward insolvency, members with declining balances)
 *   - Scenario modeling (if membership grows by 50, what does that cost?)
 *
 * One or two people. Not needed until the community is well established.
 */
export class AuditDomain extends FunctionalDomain {
    constructor() {
        super("Audit", "Observes and reports on community economic health. No authority — information only.");
    }
}
