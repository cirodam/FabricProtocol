import { IEconomicActor } from "../IEconomicActor.js";
import { BankAccount } from "./BankAccount.js";
import { AccountLoader } from "./AccountLoader.js";
import { BankTransaction, Currency } from "./BankTransaction.js";
import { TransactionLoader } from "./TransactionLoader.js";

/**
 * Pure infrastructure singleton that owns all account balances and transaction history.
 *
 * Members, Commons, and CentralBank are economic actors that hold references to
 * accounts in the Bank — they do not store balances themselves. All kin movement
 * must go through {@link Bank.transfer}; there is no direct balance mutation.
 */
export class Bank {
    private static instance: Bank;

    /** All accounts keyed by account ID. */
    private accounts: Map<string, BankAccount> = new Map();
    /** Maps owner ID → list of account IDs that belong to that owner. */
    private ownerIndex: Map<string, string[]> = new Map();
    private accountLoader: AccountLoader | null = null;
    private transactionLoader: TransactionLoader | null = null;

    private constructor() {}

    /**
     * Attach persistence layers and hydrate the in-memory account map from disk.
     * Must be called exactly once at application startup before any other method.
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

    /** Returns the singleton Bank instance, creating it on first call. */
    static getInstance(): Bank {
        if (!Bank.instance) {
            Bank.instance = new Bank();
        }
        return Bank.instance;
    }

    // --- Account management ---

    /**
     * Open a new account for the given owner, persist it, and return it.
     *
     * @param owner - The economic actor who owns this account.
     * @param label - Human-readable label (e.g. `"primary"`, `"escrow"`).
     * @param overdraftLimit - Minimum allowed balance (inclusive). Defaults to `0`
     *   (no overdraft). Pass `-Infinity` for accounts that can go arbitrarily negative
     *   (e.g. the central-bank issuing account).
     * @param exemptFromDemurrage - If `true`, the account is skipped during demurrage sweeps.
     */
    openAccount(owner: IEconomicActor, label: string, overdraftLimit: number = 0, exemptFromDemurrage: boolean = false): BankAccount {
        const account = new BankAccount(owner, label, overdraftLimit, exemptFromDemurrage);
        this.accounts.set(account.id, account);

        const ownerAccounts = this.ownerIndex.get(owner.getId()) ?? [];
        ownerAccounts.push(account.id);
        this.ownerIndex.set(owner.getId(), ownerAccounts);
        this.accountLoader?.save(account);

        return account;
    }

    /** Look up an account by its ID. Returns `undefined` if not found. */
    getAccount(accountId: string): BankAccount | undefined {
        return this.accounts.get(accountId);
    }

    /** Return all accounts belonging to the given owner (may be empty). */
    getAccounts(ownerId: string): BankAccount[] {
        const ids = this.ownerIndex.get(ownerId) ?? [];
        return ids.map((id) => this.accounts.get(id)!);
    }

    /** Return the first account with label `"primary"` for the given owner, or `undefined`. */
    getPrimaryAccount(ownerId: string): BankAccount | undefined {
        return this.getAccounts(ownerId).find((a) => a.label === "primary");
    }

    /** Return every account in the bank (all owners). */
    getAllAccounts(): BankAccount[] {
        return Array.from(this.accounts.values());
    }

    /** Close all accounts for an owner. Throws if any account has a non-zero balance. */
    closeAccounts(ownerId: string): void {
        const ids = this.ownerIndex.get(ownerId) ?? [];
        for (const id of ids) {
            const account = this.accounts.get(id);
            if (account && account.kin !== 0) {
                throw new Error(
                    `Cannot close account ${id} (label: "${account.label}") for owner ${ownerId}: balance is ${account.kin} kin`
                );
            }
        }
        for (const id of ids) {
            this.accounts.delete(id);
            this.accountLoader?.delete(id);
        }
        this.ownerIndex.delete(ownerId);
    }

    // --- Transfers ---

    /**
     * Move `amount` kin from one account to another.
     *
     * Both accounts must exist. The debit is applied first; if the resulting
     * balance would fall below `from.overdraftLimit` the transfer is rejected.
     * Balances are rounded to 2 decimal places to prevent floating-point drift.
     *
     * @param fromAccountId - Account to debit.
     * @param toAccountId - Account to credit.
     * @param currency - Must be `"kin"` (the only currency in the system).
     * @param amount - Must be a finite positive number.
     * @param memo - Optional human-readable description stored on the transaction.
     * @returns The persisted {@link BankTransaction}.
     * @throws If `amount` is not a finite positive number, either account is missing,
     *   or the debit would breach the overdraft limit.
     */
    transfer(
        fromAccountId: string,
        toAccountId: string,
        currency: Currency,
        amount: number,
        memo: string = ""
    ): BankTransaction {
        if (!Number.isFinite(amount) || amount <= 0) {
            throw new Error(`Transfer amount must be a finite positive number, got ${amount}`);
        }

        const from = this.accounts.get(fromAccountId);
        const to = this.accounts.get(toAccountId);
        if (!from) throw new Error(`Account ${fromAccountId} not found`);
        if (!to) throw new Error(`Account ${toAccountId} not found`);

        if (from.kin - amount < from.overdraftLimit) {
            throw new Error(
                `Insufficient kin: account ${fromAccountId} has ${from.kin}, limit ${from.overdraftLimit}, attempted ${amount}`
            );
        }

        from.debit(amount);
        to.credit(amount);

        const tx = new BankTransaction(fromAccountId, toAccountId, currency, amount, memo);
        this.accountLoader?.save(from);
        this.accountLoader?.save(to);
        this.transactionLoader?.save(tx);
        return tx;
    }

    // --- Transaction history ---

    /**
     * Query transaction history.
     *
     * @param accountId - If provided, only returns transactions where this account
     *   appears as sender or receiver.
     * @param month - ISO month string (`"YYYY-MM"`). If provided, filters to that
     *   calendar month only and skips the full chain-integrity check.
     */
    getTransactions(accountId?: string, month?: string): BankTransaction[] {
        return this.transactionLoader?.query({ accountId, month }) ?? [];
    }

}

