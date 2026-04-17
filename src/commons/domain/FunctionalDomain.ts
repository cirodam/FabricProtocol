import { randomUUID } from "crypto";
import { IAccountOwner } from "../../IAccountOwner.js";
import { Bank } from "../../bank/Bank.js";
import { Asset } from "../../Asset.js";
import { Position } from "../Position.js";
import { LedgerService } from "../../ledger/LedgerService.js";
import { AssetLedger } from "../../ledger/AssetLedger.js";

// Base class for all functional domains (Food, Healthcare, Childcare, etc.).
// Each domain has its own Bank account, funded by the Commons via fundDomain().
// Positions and assets can be attached to the domain directly.
export abstract class FunctionalDomain implements IAccountOwner {
    readonly id: string;
    readonly name: string;
    readonly description: string;

    readonly ledger: AssetLedger;
    private positions: Position[] = [];

    constructor(name: string, description: string = "") {
        this.id = randomUUID();
        this.name = name;
        this.description = description;
        Bank.getInstance().openAccount(this, "primary", false, true);
        this.ledger = LedgerService.getInstance().openLedger(this, "primary");
    }

    getId(): string { return this.id; }

    addAsset(asset: Asset): void { this.ledger.add(asset); }
    getAssets(): Asset[] { return this.ledger.getAll(); }

    addPosition(position: Position): void { this.positions.push(position); }
    getPositions(): Position[] { return this.positions; }
}
