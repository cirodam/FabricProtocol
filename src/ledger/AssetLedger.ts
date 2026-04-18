import { randomUUID } from "crypto";
import { IEconomicActor } from "../IEconomicActor.js";
import { Asset } from "../Asset.js";

// AssetLedger is a named, owner-bound list of physical assets.
// It mirrors the Account model: one owner can hold multiple ledgers.
// Any IEconomicActor (Commons, FunctionalDomain, Member) can open one.
export class AssetLedger {
    readonly id: string;
    readonly ownerId: string;
    readonly label: string;
    readonly createdAt: Date;

    private assets: Asset[] = [];

    constructor(owner: IEconomicActor, label: string) {
        this.id = randomUUID();
        this.ownerId = owner.getId();
        this.label = label;
        this.createdAt = new Date();
    }

    add(asset: Asset): void {
        this.assets.push(asset);
    }

    getAll(): Asset[] {
        return [...this.assets];
    }

    findById(assetId: string): Asset | undefined {
        return this.assets.find((a) => a.id === assetId);
    }

    // Adjust the quantity of an existing asset by a delta (positive or negative).
    adjustQuantity(assetId: string, delta: number): void {
        const asset = this.findById(assetId);
        if (!asset) throw new Error(`Asset ${assetId} not found in ledger ${this.id}`);
        asset.quantity = Math.round((asset.quantity + delta) * 1000) / 1000;
    }

    remove(assetId: string): void {
        const index = this.assets.findIndex((a) => a.id === assetId);
        if (index === -1) throw new Error(`Asset ${assetId} not found in ledger ${this.id}`);
        this.assets.splice(index, 1);
    }
}
