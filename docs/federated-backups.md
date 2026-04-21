# Federated Backups

## Concept

A commons node periodically sends an encrypted snapshot of itself to one or more trusted neighboring nodes. If the originating node is lost — hardware failure, disaster, disruption — a neighbor can return the snapshot and the community can reconstitute.

No central server. No corporate dependency. Resilience is a property of the network, not of any single node.

## Trust Requirement

Backups contain sensitive data: member records, balances, care needs, guardianship relationships, governance history. Backup agreements require a governance vote on both sides. The trust threshold should be higher than basic federation or kithe trading.

A node that holds a backup cannot use the data — it is encrypted with the originating community's key and opaque to the holder.

## What Gets Backed Up

- All member records (id, name, birthDate, memberType, capacities, careNeeds, guardianId, trustScore)
- All Bank accounts and balances
- All asset ledgers
- All governance proposals and votes
- Commons and domain configurations (positions, funding levels)
- The snapshot timestamp and a hash for integrity verification

Encryption keys stay with the originating community. The backup holder stores ciphertext only.

## Backup Policy

Each commons configures:
- `trustedBackupNodes: string[]` — node IDs authorized to receive backups
- `backupFrequency` — how often to push (e.g. daily, weekly)
- `retentionCount` — how many snapshots a neighbor keeps before discarding oldest

## Restoration

If a community needs to restore:
1. Contact a backup-holding neighbor (out of band if necessary)
2. Neighbor returns the encrypted snapshot
3. Community decrypts with their key and loads the snapshot
4. Governance re-convenes to verify state and resume operations

## Political Property

If a commons is suppressed or its infrastructure seized, its neighbors can preserve the community's records and help it reconstitute elsewhere. The data survives even if the node doesn't.

## Implementation Notes (when ready)

- `RemoteNode` class: `id`, `name`, `trustLevel`, `backupAgreement: boolean`
- `BackupSnapshot` class: `id`, `originNodeId`, `createdAt`, `hash`, `encryptedPayload: Buffer`
- `FederationService` extended with `sendBackup(nodeId)`, `receiveBackup(snapshot)`, `listHeldBackups()`
- Encryption: the originating node holds a symmetric key (or public/private keypair); payload is encrypted before transmission
- Backup frequency driven by a scheduled call, similar to `payMonthly()` or `checkAnniversaries()`
