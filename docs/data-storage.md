# Data Storage

## Philosophy

The community server stores all data as JSON files on the local filesystem. No separate database server is required. An administrator can open the data directory and read any record directly. This is a feature, not a limitation — human-readable data is auditable data, and auditability is a core requirement for a system that handles community finances and governance.

The tradeoff is that JSON files lack the query capabilities of a relational database. This is acceptable because:
- The server process is the sole writer — no concurrent write conflicts
- The dataset for a single community (tens of thousands of members, years of transactions) fits comfortably in memory for read operations
- Complex queries are handled in-process rather than via SQL

If query performance becomes a bottleneck at scale, migration to SQLite is straightforward — the data model is already defined, and SQLite is essentially this with a query engine on top.

---

## Two-Copy Model

Every write produces two copies of the data:

### Operational Copy (`data/`)

The copy the application reads from. This is the live working state — member records, account balances, proposals, domain configurations. The application loads from here on startup and writes here on every mutation.

This copy may be encrypted at rest in a future version to protect sensitive fields (private keys, personal health information) from physical access to the machine. For now it is plaintext, consistent with the audit copy.

### Audit Copy (`audit/`)

A parallel, always-unencrypted, human-readable copy of every record. Written alongside every operational write. This copy is never encrypted, even if the operational copy is.

The audit copy exists so that:
- Any member can verify the state of the system by reading files directly, without going through the server
- External review is always possible — an auditor does not need server access or decryption keys
- The community retains readable records even if the server software is unavailable

The audit copy mirrors the same directory structure as the operational copy. It is not a diff log — it is a full copy of the current state of each record, updated on every write.

### Write Semantics

Both copies are written on every mutation. The operational copy is written first (atomically via tmp + rename). The audit copy is written immediately after. If the audit write fails, the error is logged but the operational write is not rolled back — the operational copy is authoritative.

```
write(id, data)
  → write data/records/{id}.json   (atomic)
  → write audit/records/{id}.json  (plaintext, non-atomic is acceptable)
```

### What "Unencrypted" Means

Member PINs are stored as SHA-256 hashes in both copies — the plain-text PIN is never written anywhere. "Unencrypted" means the files are not wrapped in a layer of at-rest encryption. The audit copy will always be readable by anyone with filesystem access to that directory.

This is intentional. The audit copy is a transparency guarantee. If you need to restrict access to it, that is a filesystem permissions concern, not a storage concern.

---

## Directory structure

```
data/
  members/
    {memberId}.json
  accounts/
    {accountId}.json
  transactions/
    {YYYY-MM}/
      {transactionId}.json
  domains/
    food.json
    healthcare.json
    agriculture.json
    education.json
    housing.json
    sanitation.json
    portering.json
    fire.json
    justice.json
    dependency_care.json
    child_care.json
  proposals/
    {proposalId}.json
  positions/
    {positionId}.json
  assets/
    {assetId}.json
  config.json
  snapshot.json
```

---

## File formats

### Member (`members/{memberId}.json`)

```json
{
  "id": "uuid",
  "name": "Jane Smith",
  "phone": "+15551234567",
  "pin": "hashed-pin",
  "memberType": "adult",
  "joinedAt": "2026-01-15T00:00:00Z",
  "dateOfBirth": "1985-03-22",
  "trustScore": 0.12,
  "active": true
}
```

### Account (`accounts/{accountId}.json`)

```json
{
  "id": "uuid",
  "ownerId": "memberId or domainId",
  "ownerType": "member | domain | commons | centralbank",
  "kin": 450.00,
  "foodVouchers": 80.00,
  "fem": 0.00,
  "exemptFromDemurrage": false,
  "createdAt": "2026-01-15T00:00:00Z"
}
```

### Transaction (`transactions/{YYYY-MM}/{transactionId}.json`)

```json
{
  "id": "uuid",
  "fromAccountId": "uuid",
  "toAccountId": "uuid",
  "currency": "kin | foodVouchers | fem",
  "amount": 50.00,
  "memo": "groceries",
  "source": "sms | web | paper | system",
  "createdAt": "2026-04-18T14:32:00Z"
}
```

Transactions are append-only. They are never modified after creation. The transaction log is the authoritative record; account balances are derived from it and cached in account files for performance.

Organizing transactions by month keeps directory sizes manageable. A community of 30,000 with 10 transactions per member per month produces 300,000 files per month — large but navigable, and each month is a self-contained directory.

### Proposal (`proposals/{proposalId}.json`)

```json
{
  "id": "uuid",
  "title": "Fund greenhouse construction",
  "description": "...",
  "proposedBy": "memberId",
  "status": "open | passed | rejected | withdrawn",
  "votes": {
    "memberId1": "yes",
    "memberId2": "no"
  },
  "createdAt": "2026-04-01T00:00:00Z",
  "closedAt": null
}
```

### Config (`config.json`)

```json
{
  "communityName": "Millbrook Commons",
  "communityId": "uuid",
  "foundedAt": "2026-01-01T00:00:00Z",
  "memberEndowment": 500,
  "demurrageRate": 0.02,
  "demurragePeriodDays": 30,
  "federationServerUrl": "https://federation.example.org",
  "phone": "+15559876543"
}
```

### Snapshot (`snapshot.json`)

A summary of current state used for federation backup sync and fast server startup. Regenerated after each demurrage cycle and after significant state changes.

```json
{
  "communityId": "uuid",
  "generatedAt": "2026-04-18T00:00:00Z",
  "memberCount": 847,
  "moneyInCirculation": 423500.00,
  "transactionCount": 142389,
  "lastTransactionAt": "2026-04-18T14:32:00Z"
}
```

---

## Write safety

All writes use an atomic rename pattern to prevent corruption if the server crashes mid-write:

1. Write new content to `{filename}.tmp`
2. Rename `.tmp` over the target file

Rename is atomic on all major operating systems. A crash before the rename leaves the original file intact. A crash after the rename leaves the new file intact. There is no window where the file is partially written.

---

## Backup and recovery

The server pushes a signed snapshot to the federation server on a configurable schedule (default: every 6 hours). The snapshot includes:
- The full `snapshot.json` summary
- A compressed archive of all member and account files
- The complete transaction log for the current and previous month

If the community server is lost (hardware failure, SD card corruption), recovery is:
1. Restore the latest snapshot from the federation server
2. Replay any transactions that occurred after the snapshot
3. Resume normal operation

Paper transaction slips (see `docs/interfaces.md`) serve as the recovery record for transactions that occurred during the outage window.

---

## Paper backup

Each transaction generates a printable slip with:
- Transaction ID (also encoded as a QR code)
- From, to, amount, currency, memo
- Timestamp
- Server signature

When the server is unavailable, transactions are recorded on pre-numbered paper slips signed by both parties. When the server comes back online, slips are submitted in serial number order and reconciled. The serial numbers prevent double-spending during outages.

Periodic printed account statements give each member a paper record of their balance and recent transactions. If the server is permanently lost and the federation backup is unavailable, these statements are the seed for manual reconstruction.
