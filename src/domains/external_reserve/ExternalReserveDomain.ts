/**
 * ExternalReserveDomain
 *
 * Manages the community's reserve of external currency (USD).
 *
 * Dollars enter the community through member conversions — members sell dollars
 * to the commonwealth at the current buy rate and receive kin in return.
 * Dollars never leave: the reserve is a one-way sink, deployed only through
 * community governance (proposals) for external purchases the community cannot
 * produce internally.
 *
 * The standing buy order is a marketplace post created/removed by this domain.
 * When active, any member can sell dollars to the community at the posted rate.
 */
export class ExternalReserveDomain {
    private static instance: ExternalReserveDomain;

    /** Kin paid per USD when the community buys dollars from members. */
    private _buyRate: number = 0.76;

    /** USD held in the community's real-world dollar account (off-ledger). */
    private _reserveUsd: number = 0;

    /** Whether the standing buy order is currently active on the marketplace. */
    private _buyOrderActive: boolean = false;

    private constructor() {}

    static getInstance(): ExternalReserveDomain {
        if (!ExternalReserveDomain.instance) {
            ExternalReserveDomain.instance = new ExternalReserveDomain();
        }
        return ExternalReserveDomain.instance;
    }

    get buyRate(): number { return this._buyRate; }
    get reserveUsd(): number { return this._reserveUsd; }
    get buyOrderActive(): boolean { return this._buyOrderActive; }

    setBuyRate(rate: number): void {
        if (rate <= 0) throw new Error("Buy rate must be positive");
        this._buyRate = rate;
    }

    /**
     * Record an inflow of USD (e.g. a member sold dollars to the community).
     * Kin should be issued to the member separately via Bank.transfer().
     */
    recordInflow(usd: number): void {
        if (usd <= 0) throw new Error("Inflow must be positive");
        this._reserveUsd += usd;
    }

    /**
     * Record an outflow of USD (e.g. the community spent dollars externally).
     * Should only be called after a governance proposal is ratified.
     */
    recordOutflow(usd: number): void {
        if (usd <= 0) throw new Error("Outflow must be positive");
        if (usd > this._reserveUsd) throw new Error("Insufficient USD reserve");
        this._reserveUsd -= usd;
    }

    /**
     * Activate the standing buy order on the marketplace.
     * TODO: create a standing Post on Marketplace when implemented.
     */
    activateBuyOrder(): void {
        this._buyOrderActive = true;
        // TODO: create standing marketplace post:
        //   type: "bid", category: "currency", postedBy: Commonwealth.id,
        //   title: `Community buys USD at ${this._buyRate} kin/dollar`,
        //   price: this._buyRate (kin per dollar)
    }

    /**
     * Deactivate the standing buy order.
     * TODO: remove the standing Post from Marketplace when implemented.
     */
    deactivateBuyOrder(): void {
        this._buyOrderActive = false;
        // TODO: delete the standing marketplace post
    }

    toStatus() {
        return {
            buyRate:        this._buyRate,
            reserveUsd:     this._reserveUsd,
            buyOrderActive: this._buyOrderActive,
        };
    }
}
