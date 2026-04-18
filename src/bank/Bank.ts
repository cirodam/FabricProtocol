import { IAccountOwner } from "./IAccountOwner.js";
import { Account } from "./Account.js";
import { AccountLoader } from "./AccountLoader.js";
import { BankTransaction, Currency } from "./BankTransaction.js";
import { TransactionLoader } from "./TransactionLoader.js";

// The Bank is pure infrastructure. All balances live here.
// Members, Commons, and CentralBank are agents that interface with the Bank —
// they do not hold balances themselves.
export class Bank {
    private static instance: Bank;

    private accounts: Map<string, Account> = new Map();        // keyed by accountId
    private ownerIndex: Map<string, string[]> = new Map();     // ownerId → accountId[]
    private accountLoader: AccountLoader | null = null;
    private transactionLoader: TransactionLoader | null = null;

    private constructor() {}

    /**
     * Set the persistence layers and load all accounts and transactions from disk.
     * Call once at app startup before any other operations.
     */
    init(accountLoader: AccountLoader, transactionLoader: TransactionLoader): void {
        this.accountLoader = accountLoader;
        this.transactionLoader = transactionLoader;
        for (const account of accountLoader.loadAll()) {
            this.accounts.set(account.id, account);
            const list = this.ownerIndex.get(account.ownerId) ?? [];
            list.push(account.id);
            this.ownerIndex.set(account.ownerId, list);
        }
    }

    static getInstance(): Bank {
        if (!Bank.instance) {
            Bank.instance = new Bank();
        }
        return Bank.instance;
    }

    // --- Account management ---

    openAccount(owner: IAccountOwner, label: string, allowNegativeCredits: boolean = false, exemptFromDemurrage: boolean = false): Account {
        const account = new Account(owner, label, allowNegativeCredits, exemptFromDemurrage);
        this.accounts.set(account.id, account);

        const ownerAccounts = this.ownerIndex.get(owner.getId()) ?? [];
        ownerAccounts.push(account.id);
        this.ownerIndex.set(owner.getId(), ownerAccounts);
        this.accountLoader?.save(account);

        return account;
    }

    getAccount(accountId: string): Account | undefined {
        return this.accounts.get(accountId);
    }

    getAccounts(ownerId: string): Account[] {
        const ids = this.ownerIndex.get(ownerId) ?? [];
        return ids.map((id) => this.accounts.get(id)!);
    }

    // Returns the first account labelled "primary" for the given owner.
    getPrimaryAccount(ownerId: string): Account | undefined {
        return this.getAccounts(ownerId).find((a) => a.label === "primary");
    }

    getAllAccounts(): Account[] {
        return Array.from(this.accounts.values());
    }

    // --- Transfers ---

    transfer(
        fromAccountId: string,
        toAccountId: string,
        currency: Currency,
        amount: number,
        memo: string = ""
    ): BankTransaction {
        if (amount <= 0) throw new Error(`Transfer amount must be positive, got ${amount}`);

        const from = this.accounts.get(fromAccountId);
        const to = this.accounts.get(toAccountId);
        if (!from) throw new Error(`Account ${fromAccountId} not found`);
        if (!to) throw new Error(`Account ${toAccountId} not found`);

        const fromBalance = (from as Record<Currency, number>)[currency];
        if (!from.allowNegativeCredits && currency === "credits" && fromBalance < amount) {
            throw new Error(
                `Insufficient credits: account ${fromAccountId} has ${fromBalance}, attempted ${amount}`
            );
        }
        if ((currency === "fec" || currency === "foodVouchers") && fromBalance < amount) {
            throw new Error(
                `Insufficient ${currency}: account ${fromAccountId} has ${fromBalance}, attempted ${amount}`
            );
        }

        // Round to 2 decimal places to avoid floating-point drift
        (from as Record<Currency, number>)[currency] = Math.round(((from as Record<Currency, number>)[currency] - amount) * 100) / 100;
        (to as Record<Currency, number>)[currency] = Math.round(((to as Record<Currency, number>)[currency] + amount) * 100) / 100;

        const tx = new BankTransaction(fromAccountId, toAccountId, currency, amount, memo);
        this.accountLoader?.save(from);
        this.accountLoader?.save(to);
        this.transactionLoader?.save(tx);
        return tx;
    }

    // --- Transaction history ---

    getTransactions(accountId?: string, month?: string): BankTransaction[] {
        return this.transactionLoader?.query({ accountId, month }) ?? [];
    }

    // Convert credits to foodVouchers (or vice versa) within a single account, 1:1.
    // Used by the Commons to fund voucher issuance from its credit balance.
    convertCurrency(accountId: string, from: Currency, to: Currency, amount: number): void {
        if (amount <= 0) throw new Error(`Conversion amount must be positive, got ${amount}`);
        const account = this.accounts.get(accountId);
        if (!account) throw new Error(`Account ${accountId} not found`);
        const balance = (account as Record<Currency, number>)[from];
        if (balance < amount) throw new Error(`Insufficient ${from}: has ${balance}, needs ${amount}`);
        (account as Record<Currency, number>)[from] = Math.round((balance - amount) * 100) / 100;
        (account as Record<Currency, number>)[to]   = Math.round(((account as Record<Currency, number>)[to] + amount) * 100) / 100;
        this.accountLoader?.save(account);
    }
}
