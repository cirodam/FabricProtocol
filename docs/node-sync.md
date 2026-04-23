# Node Sync and Multi-Node Resilience

## Goal

The software must remain operational when individual machines fail, when network
connectivity is intermittent, and — in the extreme case — when the software
itself is unavailable and clerks must continue by hand. Resilience is a design
constraint, not a feature to be added later.

## Physical model

A county-scale community runs several nodes: one at the bank, one at the
courthouse, one at the provisioning office. Each node runs a full copy of the
software with a full copy of `data/`. Any node can serve the UI to a clerk or
member at that terminal without contacting any other node. There is no primary
node. No single machine is the source of truth.

## Read operations

Any node answers read requests from its local `data/` directory. A teller
looking up a member balance, a clerk checking a housing assignment — these
queries never leave the building. The `FileStore` flat-file layout means each
node holds a complete, human-readable dataset.

## Write operations and the event log

Every write is recorded as an immutable event appended to a local event log:

```
{ id, timestamp, nodeId, type, payload }
```

The event log is the truth. Each node's current state is derived by replaying
the log. Syncing between nodes is the exchange of events: each node sends the
other the events it has not yet seen, and each node applies those events in
timestamp order.

This is an append-only design. Records are never overwritten in place during
sync; new events supersede old state. The log is the audit trail.

## Sync protocol (sketch)

```
Node A writes transaction
  → appends event to local log (data/eventlog/)
  → continues serving normally

Every N minutes (configurable):
  Node A connects to known peers (via PeerRegistry)
  Node A sends: "give me all events after sequence X"
  Peers respond with their new events
  Node A applies events it has not seen
  Node A sends its own new events to peers

All nodes converge to the same state within one sync cycle.
```

The peer registry (`data/network/`) and health-checking infrastructure already
exist. The sync protocol is the missing piece.

## Conflict resolution

Conflicts are rare in practice because writes are naturally attributed to one
node. A transaction originates at the bank node; a housing record at the
courthouse node. Domains tend to have a home terminal.

When conflicts do occur — two nodes both modified the same record before
syncing — the resolution rule is:

1. **For transactions**: both are valid; append both; let the ledger reflect both.
   Double-entry prevents silent loss.
2. **For role assignments**: last timestamp wins; the earlier assignment is
   recorded as superseded, not deleted.
3. **For member records**: flag for human review; do not silently overwrite.

## Partition tolerance

If two nodes cannot reach each other, both continue operating independently.
Each accepts writes and appends to its local log. When connectivity is restored,
they exchange logs and converge. The gap period is recorded in the event
metadata (`nodeId`, `timestamp`) so the sequence of events can be reconstructed.

Clerks do not need to know a partition is occurring. They continue working at
their local terminal. The software handles reconciliation on reconnect.

## Backup procedure (operational, not software)

The `data/` directory is self-contained and human-readable. The following
procedure requires no special tooling:

- **Nightly**: `rsync data/` to a second machine in a different building.
- **Weekly**: copy `data/` to removable storage held in the audit office.
- **On demand**: any node can produce a full export before maintenance.

The audit office copy is the paper-equivalent vault copy. It is not used for
live operations; it is the recovery baseline.

## Export to portable formats

For the scenario where the software itself is gone, each major record type
should be exportable to CSV or plain text. A literate person with a spreadsheet
can reconstruct operations from the export. This is the bridge to full paper
fallback.

Priority export targets:
- Account ledger (member ID, balance, transaction history)
- Member roster (name, ID, roles, join date)
- Role assignments (domain, role, assigned member, pay rate)
- Active transactions (date, from, to, amount, description)

## Relationship to the paper fallback

The event log, once printed and dated, becomes a paper ledger. A clerk can
continue appending rows by hand. When the software is restored, those handwritten
rows are entered as backdated events with the clerk's node ID and a note
indicating manual entry. The log absorbs paper records without special handling.

This is the same workflow a 19th-century bank used. The software is a faster,
more legible version of the same ledger book.
