import { Account } from "./Account.js";
import { FileStore } from "../storage/FileStore.js";

interface AccountRecord {
  id: string;
  ownerId: string;
  label: string;
  credits: number;
  foodVouchers: number;
  fec: number;
  allowNegativeCredits: boolean;
  exemptFromDemurrage: boolean;
  createdAt: string;
}

export class AccountLoader {
  private readonly store: FileStore;

  constructor(dataDir: string) {
    this.store = new FileStore(dataDir);
  }

  save(account: Account): void {
    const record: AccountRecord = {
      id: account.id,
      ownerId: account.ownerId,
      label: account.label,
      credits: account.credits,
      foodVouchers: account.foodVouchers,
      fec: account.fec,
      allowNegativeCredits: account.allowNegativeCredits,
      exemptFromDemurrage: account.exemptFromDemurrage,
      createdAt: account.createdAt.toISOString(),
    };
    this.store.write(account.id, record);
  }

  loadAll(): Account[] {
    return this.store.readAll<AccountRecord>().map(r => this.fromRecord(r));
  }

  delete(accountId: string): boolean {
    return this.store.delete(accountId);
  }

  private fromRecord(r: AccountRecord): Account {
    const stub = { getId: () => r.ownerId, getDisplayName: () => "", getHandle: () => "" };
    const account = new Account(stub, r.label, r.allowNegativeCredits, r.exemptFromDemurrage);
    const a = account as unknown as Record<string, unknown>;
    a["id"] = r.id;
    a["ownerId"] = r.ownerId;
    a["createdAt"] = new Date(r.createdAt);
    account.credits = r.credits;
    account.foodVouchers = r.foodVouchers;
    account.fec = r.fec;
    return account;
  }
}
