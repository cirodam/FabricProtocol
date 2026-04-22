import { BankAccount } from "./BankAccount.js";
import { FileStore } from "../storage/FileStore.js";

interface AccountRecord {
  id: string;
  ownerId: string;
  label: string;
  kin: number;
  overdraftLimit: number;
  exemptFromDemurrage: boolean;
  createdAt: string;
}

export class AccountLoader {
  private readonly store: FileStore;

  constructor(dataDir: string) {
    this.store = new FileStore(dataDir);
  }

  save(account: BankAccount): void {
    const record: AccountRecord = {
      id: account.id,
      ownerId: account.ownerId,
      label: account.label,
      kin: account.kin,
      overdraftLimit: account.overdraftLimit,
      exemptFromDemurrage: account.exemptFromDemurrage,
      createdAt: account.createdAt.toISOString(),
    };
    this.store.write(account.id, record);
  }

  loadAll(): BankAccount[] {
    return this.store.readAll<AccountRecord>().map(r => this.fromRecord(r));
  }

  delete(accountId: string): boolean {
    return this.store.delete(accountId);
  }

  private fromRecord(r: AccountRecord): BankAccount {
    const stub = { getId: () => r.ownerId, getDisplayName: () => "", getHandle: () => "" };
    // Backward compat: old boolean fields mapped to 0 (no overdraft) or -Infinity (unlimited)
    const rec = r as unknown as Record<string, unknown>;
    let overdraftLimit: number;
    if (typeof r.overdraftLimit === "number") {
      overdraftLimit = r.overdraftLimit;
    } else if (r.overdraftLimit === null || rec["allowNegativeKin"] === true || rec["allowNegativeCredits"] === true) {
      overdraftLimit = -Infinity;
    } else {
      overdraftLimit = 0;
    }
    const account = new BankAccount(stub, r.label, overdraftLimit, r.exemptFromDemurrage);
    const a = account as unknown as Record<string, unknown>;
    a["id"] = r.id;
    a["ownerId"] = r.ownerId;
    a["createdAt"] = new Date(r.createdAt);
    account.kin = r.kin ?? (r as unknown as Record<string, number>)["credits"] ?? 0;
    return account;
  }
}
