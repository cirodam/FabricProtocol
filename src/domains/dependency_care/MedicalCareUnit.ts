import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

/**
 * The Medical Care Unit provides continuous clinical care for members with complex
 * or end-of-life needs that exceed what home or shared household settings can support.
 *
 * This is the closest the community gets to a traditional care facility — but the
 * intent is clinical necessity, not convenience or cost. A member moves here because
 * their needs genuinely require clinical oversight, not because their family couldn't
 * manage the paperwork or because a facility had a bed available.
 *
 * Appropriate for members with:
 * - Late-stage dementia requiring constant supervision and behavioral support
 * - Post-stroke or post-surgical recovery requiring clinical monitoring
 * - Advanced chronic illness with complex, unstable medical needs
 * - End-of-life care requiring pain management and palliative support
 *
 * The Medical Care Unit operates in close coordination with the Healthcare domain —
 * specifically the Clinic and Emergency Department. It is staffed by both care workers
 * and clinical staff (nurses, a physician on regular rotation). It is not a
 * replacement for the hospital; it is the place where people with ongoing but stable
 * complex needs can be cared for with dignity without permanent ED occupancy.
 *
 * Palliative and end-of-life care is an explicit function of this unit. A community
 * that has thought carefully about how people die — with comfort, with people they
 * know, without extraordinary intervention that serves no one — is providing something
 * most of the healthcare system fails to offer.
 *
 * Total staffing: ~40–60 FTEs (clinical and care staff combined)
 */
export class MedicalCareUnit extends FunctionalUnit {
    constructor() {
        super("Medical Care Unit", "Provides continuous clinical care for community members with complex or end-of-life needs.");
    }
}
