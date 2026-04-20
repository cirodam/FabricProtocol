import { FunctionalUnit } from "../../commons/domain/FunctionalUnit.js";

/**
 * A FoodPurchasing unit acquires food from external suppliers using the community's
 * dollar reserve. It is the bridge between the external dollar economy and the
 * community's food commons — the first food unit a bootstrapping community needs,
 * and the last one it will still need once agriculture, milling, and kitchen
 * production are fully operational.
 *
 * As the community develops internal food production capacity, this unit's dollar
 * spend should decline toward zero. Tracking its spend over time is a direct
 * measure of the community's food self-sufficiency.
 */
export class FoodPurchasing extends FunctionalUnit {
    readonly createdAt: Date;

    /** Running total of USD spent by this unit on external food purchases. */
    totalUsdSpent: number = 0;

    constructor(name: string, description: string = "Purchases food from external suppliers using the community's dollar reserve.") {
        super(name, description);
        this.createdAt = new Date();
    }

    getType(): string { return "food-purchasing"; }

    /**
     * Record an external food purchase denominated in USD.
     * Actual dollar accounting is handled by ExternalReserveDomain.recordOutflow().
     */
    recordPurchase(usd: number): void {
        if (usd <= 0) throw new Error("Purchase amount must be positive");
        this.totalUsdSpent += usd;
    }
}
