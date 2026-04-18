import { randomUUID } from "crypto";
import { IAccountOwner } from "../IAccountOwner.js";
import { Bank } from "../bank/Bank.js";
import { Asset } from "../Asset.js";
import { CommunityRole } from "./CommunityRole.js";
import { FunctionalDomain } from "./domain/FunctionalDomain.js";
import { LedgerService } from "../ledger/LedgerService.js";
import { AssetLedger } from "../ledger/AssetLedger.js";

// The Commons represents the community's collective investment in itself.
// It holds pooled credits used to meet basic needs, provide care for dependents,
// fund insurance, and support members who cannot fully participate in the credit system.
export class Commons implements IAccountOwner {
    private static instance: Commons;

    readonly id: string;

    private positions: CommunityRole[] = [];
    private domains: FunctionalDomain[] = [];
    readonly ledger: AssetLedger;

    private constructor() {
        this.id = randomUUID();
        Bank.getInstance().openAccount(this, "primary", false, true);
        this.ledger = LedgerService.getInstance().openLedger(this, "primary");
    }

    static getInstance(): Commons {
        if (!Commons.instance) {
        Commons.instance = new Commons();
        }
        return Commons.instance;
    }

    getId(): string { return this.id; }

    addAsset(asset: Asset): void {
        this.ledger.add(asset);
    }

    getAssets(): Asset[] {
        return this.ledger.getAll();
    }

    addPosition(position: CommunityRole): void {
        this.positions.push(position);
    }

    getPositions(): CommunityRole[] {
        return this.positions;
    }

    // Register a functional domain under this Commons.
    addDomain(domain: FunctionalDomain): void {
        this.domains.push(domain);
    }

    getDomains(): FunctionalDomain[] {
        return this.domains;
    }

    // Allocate credits from the Commons account to a domain's account.
    fundDomain(domain: FunctionalDomain, amount: number): void {
        const bankInst = Bank.getInstance();
        const from = bankInst.getPrimaryAccount(this.id);
        const to = bankInst.getPrimaryAccount(domain.id);
        if (!from) throw new Error("Commons has no primary account");
        if (!to) throw new Error(`Domain "${domain.name}" has no primary account`);
        bankInst.transfer(from.id, to.id, "credits", amount, `fund domain: ${domain.name}`);
    }

    // Collect demurrage from all non-exempt accounts into the Commons primary account.
    // Always runs — commons levy is unconditional.
    assessDemurrage(rate: number): void {
        const bankInst = Bank.getInstance();
        const commonsAccount = bankInst.getPrimaryAccount(this.id);
        if (!commonsAccount) return;

        for (const account of bankInst.getAllAccounts()) {
            if (account.exemptFromDemurrage || account.credits <= 0) continue;
            const amount = Math.round(account.credits * rate * 100) / 100;
            if (amount > 0) {
                bankInst.transfer(account.id, commonsAccount.id, "credits", amount, "demurrage: commons");
            }
        }
    }
}
