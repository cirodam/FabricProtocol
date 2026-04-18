import { readdirSync, existsSync } from "fs";
import { BankTransaction, Currency } from "./BankTransaction.js";
import { FileStore } from "../storage/FileStore.js";

export interface TransactionQuery {
  accountId?: string;
  month?: string; // YYYY-MM; omit to query all months
}

interface TransactionRecord {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  currency: Currency;
  amount: number;
  memo: string;
  timestamp: string;
}

/** Returns the YYYY-MM bucket string for a given date. */
function monthBucket(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${date.getFullYear()}-${mm}`;
}

export class TransactionLoader {
  private readonly baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  /** Append a transaction to the current month's bucket. */
  save(tx: BankTransaction): void {
    const store = new FileStore(`${this.baseDir}/${monthBucket(tx.timestamp)}`);
    store.write(tx.id, this.toRecord(tx));
  }

  /**
   * Query transactions from disk. Optionally filter by accountId and/or month bucket.
   * Results are sorted by timestamp ascending.
   */
  query(options: TransactionQuery = {}): BankTransaction[] {
    if (!existsSync(this.baseDir)) return [];

    const allBuckets = readdirSync(this.baseDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();

    const buckets = options.month ? allBuckets.filter(b => b === options.month) : allBuckets;

    const txs: BankTransaction[] = [];
    for (const bucket of buckets) {
      const store = new FileStore(`${this.baseDir}/${bucket}`);
      for (const record of store.readAll<TransactionRecord>()) {
        if (!options.accountId || record.fromAccountId === options.accountId || record.toAccountId === options.accountId) {
          txs.push(this.fromRecord(record));
        }
      }
    }

    txs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    return txs;
  }

  private toRecord(tx: BankTransaction): TransactionRecord {
    return {
      id: tx.id,
      fromAccountId: tx.fromAccountId,
      toAccountId: tx.toAccountId,
      currency: tx.currency,
      amount: tx.amount,
      memo: tx.memo,
      timestamp: tx.timestamp.toISOString(),
    };
  }

  private fromRecord(r: TransactionRecord): BankTransaction {
    const tx = new BankTransaction(r.fromAccountId, r.toAccountId, r.currency, r.amount, r.memo);
    const t = tx as unknown as Record<string, unknown>;
    t["id"] = r.id;
    t["timestamp"] = new Date(r.timestamp);
    return tx;
  }
}
