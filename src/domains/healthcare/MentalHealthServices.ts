import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

/**
 * Mental Health Services provides counseling, psychiatric care, and addiction services.
 *
 * A community forming in the context of economic collapse, displacement, and social
 * disruption will have significant mental health needs from the beginning. Members
 * arrive carrying trauma — job loss, family breakdown, housing instability, grief.
 * This is not a peripheral concern; it is the baseline condition.
 *
 * Mental Health Services covers:
 * - Individual and group counseling and therapy
 * - Psychiatric evaluation and medication management
 * - Addiction and substance use treatment
 * - Crisis intervention (in coordination with the Emergency Department)
 * - Community-level grief and trauma response after collective losses
 *
 * A community that treats mental health as a luxury or as a personal failing will
 * find that untreated trauma and addiction erodes every other domain — it reduces
 * productive capacity, strains relationships, and concentrates burden on caregivers.
 * The cost of not providing this care is paid across the entire community.
 *
 * At 30,000 members, roughly 20% are likely to need mental health support in any
 * given year (a conservative estimate under stress conditions). At standard caseloads
 * of 40–60 active clients per therapist:
 *
 * Total staffing: ~40–50 FTEs (therapists, psychiatrists, case managers)
 */
export class MentalHealthServices extends FunctionalUnit {
    constructor() {
        super("Mental Health Services", "Provides counseling, psychiatric care, and addiction services for community members.");
    }

    getType(): string { return "mental-health-services"; }

}
