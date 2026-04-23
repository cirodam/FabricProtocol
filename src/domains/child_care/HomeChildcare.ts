import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

/**
 * HomeChildcare formalizes the care work that parents and community members provide
 * for young children in a home setting.
 *
 * A parent who stays home with their child and a small number of neighboring children
 * is doing skilled, valuable, community-sustaining work. In the current economy that
 * work is either unpaid (economically punishing for the parent) or done by an underpaid
 * worker in a market daycare. The community economy resolves this by recognizing home
 * childcare as a funded position.
 *
 * A HomeChildcare position covers:
 * - Daily care for infants and young children (feeding, hygiene, napping, safety)
 * - Age-appropriate play, stimulation, and early learning
 * - Coordination with the ChildcareDomain for health and development tracking
 * - Transition support as children age into preschool and school settings
 *
 * A home caregiver typically cares for their own child plus 2–4 others of similar age.
 * This produces high caregiver-to-child ratios (1:3 to 1:5) that exceed what most
 * institutional childcare can offer, in a domestic environment with a trusted caregiver.
 *
 * HomeChildcare is the preferred model for infants and toddlers, where attachment,
 * continuity, and low stress environments matter most. It draws on the cooperative
 * childcare traditions of communities where parents rotated supervision collectively —
 * formalized here into the payroll system rather than left to informal arrangement.
 */
export class HomeChildcare extends FunctionalUnit {
    readonly createdAt: Date;

    constructor(id?: string) {
        super("Home Childcare", "Provides paid positions for community members caring for young children at home.", undefined, id);
        this.createdAt = new Date();
    }

    getType(): string { return "home-childcare"; }

}
