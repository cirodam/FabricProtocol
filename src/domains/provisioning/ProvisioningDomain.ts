import { FunctionalDomain } from "../../commons/domain/FunctionalDomain.js";

/**
 * The Provisioning domain is the community's interface with the external economy.
 * It has two complementary functions:
 *
 * 1. Currency exchange — Members who receive external wages or income can deposit
 *    dollars (or other external currency) with Provisioning. In return they receive
 *    kin credit at a community-set rate. This converts external earnings into
 *    participation in the community economy and gives the domain a dollar reserve
 *    to work with.
 *
 * 2. Bulk procurement — The domain uses its dollar reserve to purchase goods in bulk
 *    on behalf of the whole community: food staples, fuel, building materials,
 *    seeds, medicine, and anything else the community cannot yet produce internally.
 *    Buying collectively achieves far better prices than individual purchasing.
 *
 * Supply Officers manage both functions. They are responsible for identifying the
 * best available sources, timing purchases strategically, maintaining stockpile
 * targets, and recording every transaction so the community can audit the flow of
 * external currency. Good supply work translates directly into how far each dollar
 * goes for the people who deposited it.
 *
 * As the community develops more internal production capacity, the domain's external
 * purchasing footprint naturally shrinks. Provisioning is a transitional institution —
 * most valuable early, less necessary as the community becomes self-sufficient.
 */
export class ProvisioningDomain extends FunctionalDomain {
    private static readonly DOMAIN_ID = "00000000-0000-0000-0000-000000000014";
    private static instance: ProvisioningDomain;

    private constructor() {
        super(
            "Provisioning",
            "Exchanges member dollars for kin and procures goods in bulk from external suppliers.",
            ProvisioningDomain.DOMAIN_ID,
        );
    }

    static getInstance(): ProvisioningDomain {
        if (!ProvisioningDomain.instance) {
            ProvisioningDomain.instance = new ProvisioningDomain();
        }
        return ProvisioningDomain.instance;
    }
}
