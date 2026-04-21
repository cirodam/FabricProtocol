# Network Topology

## Overview

The Fabric Protocol network is a giant peer-to-peer graph of nodes. Each node is an
independently-run HTTP server. Nodes discover each other through gossip and maintain
their own local registry of known peers.

At scale: untold thousands of nodes, most of them community nodes, connected laterally
with no central coordinator.

---

## Node Types

| Type | Purpose | Who runs it |
|------|---------|-------------|
| `community` | A local community running the Fabric stack | The community itself |
| `infrastructure` | A service node (relay, archive, bridge, etc.) | Infrastructure operator |
| `federation` | A clearing house for inter-community kithe transactions | Federation council |
| `forum` | A hosted topic space for cross-network interest groups | Anyone (individual, org) |

All four types speak the same protocol and are treated identically by the peer registry.
Type is metadata — it affects how clients *display* the node, not how they *talk* to it.

---

## Node Identity

Each node has a stable identity record written to disk on first boot:

```ts
interface NodeIdentity {
  id: string;          // UUID, generated once, never changes
  type: NodeType;      // "community" | "infrastructure" | "federation" | "forum"
  name: string;        // Human-readable name, e.g. "Maplewood Commons"
  address: string;     // Public base URL, e.g. "https://maplewood.example.org"
  publicKey?: string;  // Reserved for future request signing
  createdAt: Date;
}
```

---

## Peer Registry

Each node independently maintains a registry of every other node it has encountered.
Peers are stored with health metadata:

```ts
interface PeerRecord {
  id: string;
  type: NodeType;
  name: string;
  address: string;
  firstSeenAt: Date;
  lastSeenAt: Date;
  lastLatencyMs: number | null;
  healthy: boolean;
}
```

The registry is persisted to disk and loaded on startup. There is no global peer list —
the network is discovered entirely through gossip.

### Scale consideration
At thousands of nodes, storing every peer naively becomes a memory/disk problem.
**Mitigation**: cap the registry at N peers (e.g. 10,000), evicting the oldest/unhealthiest
entries when the cap is hit. Healthy, recently-seen peers are never evicted.

---

## Transport Strategy

Not all inter-node communication has the same requirements. Two distinct transports:

### UDP Gossip — health checking and peer discovery

- Single datagram per ping, no connection setup overhead
- Membership updates piggybacked onto health messages for free
- Failure detection is distributed — no node polls all peers
- Uses Node.js built-in `dgram`, no extra dependencies
- Protocol: **SWIM** (used by Consul, Cassandra, Kubernetes)

This handles `GET /node/peers` propagation and liveness checks at scale.

### HTTPS + HMAC — financial settlements and federation actions

HTTP is the right tool for intentional cross-node actions: transfers, proposals,
announcements. The complexity is in the *transaction protocol*, not the transport.

Required properties for any cross-node credit transfer:
- **Idempotency key** — client-generated UUID on every request; receiver deduplicates.
  A retried request after a network drop must not double-spend.
- **Two-phase commit** — `POST /transfers/prepare` reserves the debit; `POST /transfers/commit`
  finalizes both sides. Uncommitted prepares roll back after a timeout (e.g. 60s).
- **HMAC request signing** — every request body is signed with the sending community's
  shared secret. The receiver verifies before processing. Non-repudiation: neither party
  can deny a finalized transfer.
- **Settlement finality via federation node** — for kithe swaps, the `federation` node type
  acts as a trusted clearing house, confirming both sides independently before committing.

This is the same pattern used by Stripe, ACH bridges, and most financial APIs.
HMAC signing (previously deferred) is non-negotiable for cross-node transfers.

---

## Protocol (Shared by All Node Types)

All nodes expose these endpoints:

```
GET  /node/identity          — return this node's NodeIdentity
GET  /node/peers             — return a sample of known healthy peers (for gossip)
POST /node/ping              — health check; body: { fromId, fromAddress }; returns { nodeId, name, timestamp }
POST /node/announce          — a peer introduces itself; body: NodeIdentity; node adds it to registry
```

`GET /node/peers` returns a random sample (e.g. 50 peers) rather than the full registry
to keep response size bounded and spread graph knowledge probabilistically.

---

## Peer Discovery Flow

1. **Bootstrap**: new node is given one or more seed addresses at startup (config/env)
2. **Announce**: new node POSTs its identity to each seed via `POST /node/announce`
3. **Crawl**: new node fetches `GET /node/peers` from each seed, then announces itself to
   each of *those* peers, and so on for N hops (e.g. 2–3 hops is sufficient at scale)
4. **Steady state**: node pings known peers on a schedule (e.g. every 5 minutes),
   marking unresponsive ones unhealthy after K failures

---

## Health Checking

- Scheduler job: ping all known peers every 5 minutes
- A peer is marked **unhealthy** after 3 consecutive failed pings
- Unhealthy peers are excluded from `GET /node/peers` responses
- Peers that have been unhealthy for > 30 days are eligible for eviction

---

## File Layout (planned)

```
src/network/
  NodeIdentity.ts          — interface + NodeType union
  PeerRecord.ts            — interface
  PeerRegistry.ts          — in-memory + persisted registry with cap/eviction
  PeerRegistryLoader.ts    — FileStore-backed persistence
  NodeService.ts           — owns identity, manages registry, runs discovery
  NetworkController.ts     — Express handlers for the 4 protocol endpoints
  networkRoutes.ts         — Router mounting
```

`NodeService` is the singleton that:
- Owns this node's `NodeIdentity`
- Manages the `PeerRegistry`
- Runs the bootstrap/announce crawl on startup
- Runs the periodic ping health check job

---

## Open Questions

- **Forum node subscriptions**: should community nodes maintain a list of forum nodes
  they're "subscribed" to, enabling filtered `GET /node/peers?type=forum` queries?
- **Relay nodes**: infrastructure nodes could act as relays for communities behind NAT.
  Needs a forwarding protocol extension.
- **SWIM implementation**: build from scratch with `dgram` or adopt an existing library?
- **Federation node governance**: who is allowed to run a federation node, and how are
  shared secrets established between communities and their clearing house?
