import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";
import { CommunityRole } from "../../commons/CommunityRole.js";

/**
 * The Sanitation domain manages waste, hygiene infrastructure, and disease prevention.
 *
 * Sanitation is the most underacknowledged determinant of public health. Cholera,
 * typhoid, dysentery — the diseases that historically decimated communities — are
 * largely sanitation failures. Modern communities take functioning sewage and waste
 * collection for granted. They should not. In a disruption scenario, sanitation
 * infrastructure is among the first things to fail and the most dangerous to lose.
 *
 * This domain covers: sewage and greywater management, solid waste collection and
 * composting, hygiene supply distribution, and the maintenance of sanitation
 * infrastructure. The labor is unglamorous and essential. It is compensated here
 * because it is community infrastructure, not a market service.
 */
export class SanitationDomain extends FunctionalDomain {
    private static instance: SanitationDomain;

    constructor() {
        super("Sanitation", "Manages waste, hygiene infrastructure, and disease prevention for the community.", "00000000-0000-0000-0000-000000000008");
        this.addRole(new CommunityRole(
            "Sanitation Coordinator",
            "Oversees waste collection, sewage management, composting, hygiene supply distribution, and sanitation infrastructure maintenance.",
            700,
        ));
    }

    static getInstance(): SanitationDomain {
        if (!SanitationDomain.instance) {
            SanitationDomain.instance = new SanitationDomain();
        }
        return SanitationDomain.instance;
    }
}
