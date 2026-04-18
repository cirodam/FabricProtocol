import { FunctionalUnit } from "../commons/domain/FunctionalUnit.js";

/**
 * The Fire Station is the operational base for fire and emergency response.
 *
 * A fire station houses the apparatus (engines, tankers, rescue vehicles), equipment,
 * and personnel needed to respond to emergencies. Its location relative to the
 * community it serves is critical — response time is the primary determinant of
 * outcomes in structure fires and cardiac emergencies. The general target is a
 * 4-minute response time to 90% of the service area.
 *
 * In a rural community, one station may not cover the entire area within target
 * response times. Multiple stations — or satellite apparatus bays in outlying areas —
 * may be needed depending on geography. Each station is a separate unit instance.
 *
 * A station at community scale typically includes:
 * - Career or part-paid firefighters for daytime coverage (when volunteer availability
 *   is lowest)
 * - On-call members for overnight and weekend response
 * - Regular training program (maintaining certifications, running drills)
 * - Equipment maintenance function (apparatus, hoses, self-contained breathing gear)
 * - Pre-incident planning for high-risk structures (the mill, the cannery, fuel storage)
 *
 * The station also functions as a community emergency coordination point during
 * large-scale events — wildfire, flood, mass casualty — where it interfaces with
 * the Portering domain (evacuation) and Healthcare domain (medical triage).
 *
 * Staffing per station: 8–15 FTEs plus on-call roster
 */
export class FireStation extends FunctionalUnit {
    constructor(name: string) {
        super(name, "Operational base for fire suppression, rescue, and emergency first response.");
    }
}
