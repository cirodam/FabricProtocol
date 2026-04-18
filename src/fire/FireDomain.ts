import { FunctionalDomain } from "../commons/domain/FunctionalDomain.js";

/**
 * The Fire domain protects the community from fire and provides emergency rescue services.
 *
 * Rural volunteer fire departments are one of the oldest and most successful examples
 * of community-organized mutual aid in the United States. Most rural communities have
 * relied on volunteer departments for generations — members who train together, maintain
 * equipment collectively, and respond when called. This is not a lesser version of
 * professional fire service; for the call types that dominate rural departments
 * (structure fires, vehicle accidents, brush fires, medical assist), it works.
 *
 * In a community economy, the distinction between "volunteer" and "paid" shifts. Core
 * firefighters hold community positions and are compensated — fire response is skilled,
 * dangerous work that deserves recognition as community labor. Members who participate
 * part-time or on-call may hold partial positions. The department is funded by the
 * Commons rather than by property tax or donation drives.
 *
 * This domain also coordinates with the Healthcare domain for medical emergency
 * response — in many rural areas, the fire department is the first medical responder
 * because it arrives before an ambulance.
 */
export class FireDomain extends FunctionalDomain {
    constructor() {
        super("Fire", "Protects the community from fire and provides emergency rescue and first response services.");
    }
}
