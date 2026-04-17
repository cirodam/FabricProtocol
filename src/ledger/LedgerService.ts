import { IAccountOwner } from "../IAccountOwner.js";
import { AssetLedger } from "./AssetLedger.js";

// LedgerService is the singleton registry for all AssetLedgers.
// It mirrors the Bank: call openLedger() to create one, getLedger()/getLedgers() to retrieve.
export class LedgerService {
    private static instance: LedgerService;

    private ledgers: AssetLedger[] = [];

    private constructor() {}

    static getInstance(): LedgerService {
        if (!LedgerService.instance) {
            LedgerService.instance = new LedgerService();
        }
        return LedgerService.instance;
    }

    openLedger(owner: IAccountOwner, label: string): AssetLedger {
        const ledger = new AssetLedger(owner, label);
        this.ledgers.push(ledger);
        return ledger;
    }

    getLedger(ledgerId: string): AssetLedger | undefined {
        return this.ledgers.find((l) => l.id === ledgerId);
    }

    // Returns all ledgers belonging to a given owner.
    getLedgers(ownerId: string): AssetLedger[] {
        return this.ledgers.filter((l) => l.ownerId === ownerId);
    }

    // Returns the first ledger for an owner (the primary ledger by convention).
    getPrimaryLedger(ownerId: string): AssetLedger | undefined {
        return this.ledgers.find((l) => l.ownerId === ownerId);
    }

    getAllLedgers(): AssetLedger[] {
        return [...this.ledgers];
    }
}
