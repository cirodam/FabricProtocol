# Network Node Types

## Two Kinds of Nodes

The commons protocol network is composed of two distinct node types. They share the same federation primitives (FEC, governance, backups) but serve fundamentally different purposes.

---

## Community Node

Where people live. The full human model.

- Has **members** with endowments, care needs, guardians, trust scores, food vouchers
- Has **functional domains** (Food, Healthcare, Childcare, Elder Care, Housing)
- Runs **demurrage**, **payroll**, **governance**, **marketplace**
- Members' social, economic, and care life is rooted here
- The commons protocol at its richest

Staff who work at an infrastructure node are still members of a community node. Their endowment, food, housing, and care come from their community — the infrastructure node is where they hold a position, not where they live.

---

## Infrastructure Node

Where large shared functions live. An organizational model, not a human one.

- No individual members — no endowments, no food vouchers, no care needs
- Has **positions** (staffed by members of affiliated community nodes)
- Has **accounts** (funded by kithe contributions from affiliated communities)
- Has **service agreements** with affiliated community nodes
- Governed by its affiliated communities, not by individuals

Examples: regional hospital, university, power cooperative, water system, logistics hub, legal services collective.

---

## Why This Distinction Matters

A hospital is too large for one community to own, but it shouldn't be a corporation. The infrastructure node model gives it:

- **Accountability** — governed by the communities that fund and use it
- **No profit extraction** — surplus stays in the node, reduces levies, or expands services
- **Resilience** — if the node fails, another can form and take over the function
- **No shareholders** — funded by contribution, not investment

---

## Funding and Access

- Affiliated community nodes pay a periodic **FEC levy** to the infrastructure node
- The levy is proportional to population, usage, or a governance-agreed formula
- In return, the community's members have **standing access** to the node's services
- No bills, no insurance claims, no means tests — access follows affiliation

---

## Governance

- Affiliated community nodes vote on infrastructure node decisions
- Voting weight is proportional to contribution or population (governance-determined)
- Every affiliated community has a voice, regardless of size
- Staff have voice through their home community's governance, not through the infrastructure node directly

---

## kithe as the Network Currency

Kin are the internal currency of a community node. kithe is the currency of the network layer.

- Communities pay infrastructure levies in kithe
- Infrastructure nodes pay inter-node settlements in kithe
- kithe is how the network funds shared infrastructure without subordinating any community to another

---

## Implementation Notes (when ready)

- `CommunityNode` — current `Commons` class, full human model
- `InfrastructureNode` — leaner class: accounts, positions, affiliated community list, service agreements
- Both implement a shared `INode` interface for federation
- `FederationService` connects both types: `affiliate(communityId, nodeId)`, `payLevy(communityId, nodeId, amount)`, `getAffiliatedNodes(communityId)`
- A `ServiceAgreement` record: which community is affiliated, what services are covered, the levy rate
