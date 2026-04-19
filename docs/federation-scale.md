# Federation at Scale

## The problem

Bilateral trade relationships work well for a small network. Two communities agree to trade, establish a clearing relationship, and settle periodically. Simple, decentralized, no central authority.

But the bilateral model doesn't scale to hundreds of communities. 100 communities maintaining direct relationships with each other is 4,950 bilateral links. In practice, communities will only maintain relationships with their nearest neighbors — which means trade between distant communities requires routing through intermediaries, and those intermediaries gain structural power. Price discovery becomes opaque. Multilateral netting (A owes B, B owes C, C owes A — settle it all at once) becomes impossible without some shared clearing institution.

The solution is not to abandon the bilateral model. It is to apply the same principles at a higher level of abstraction.

---

## The federation model

### Community layer

The base layer. Local currency, local central bank, local governance. Communities are sovereign. Each community runs its own server — a Raspberry Pi or similar modest hardware — handling local transactions, governance, and domain management independently. The community server is the primary node. Everything else is secondary.

### Federation layer

A cluster of communities with a shared federation server. The federation server:

- Runs its own **federation central bank** that issues federation currency
- Receives periodic backup snapshots from member community servers
- Handles inter-community trade settlement and clearing
- Hosts federation-level governance (proposals, votes)
- Serves as a directory — communities discover each other through the federation server

A federation is structurally a community whose members are communities rather than individuals. It has a commons, a currency, governance, and demurrage. The same principles that make a local community resistant to extraction apply here — if applied consistently.

The federation server warrants better hardware than a community Pi — it is serving multiple communities and holding backups. It should be hosted collectively by member communities, not by a cloud provider.

---

## Federation currency

### The kWh anchor

All trade settlement above the community level — between communities within a federation, and between federations — is denominated in **FEC (Federation Exchange Credits), where 1 FEC = 1 kWh of verified energy production**.

The kWh anchor is chosen because:
- Energy is physically universal — a kWh is identical everywhere, unlike a commodity whose quality and transport cost vary
- It is not controlled by any single actor or geography
- It is the common denominator of all production — food, manufacturing, and transport all reduce to energy cost at some level
- Communities that invest in renewable generation increase their trade capacity as a direct byproduct

This single standard applies at both the federation layer (inter-community) and the inter-federation layer (inter-federation). There is no separate currency above the federation level, no conversion step, and no exchange rate between layers. The clearing engine is the same at every scale — only the participants differ.

### How it is issued

The federation central bank issues FEC algorithmically, with no human discretion:

$$\text{Federation FEC supply} = \sum_{c \in \text{communities}} \text{population}(c) \times \text{FEC per person}$$

When a community joins the federation, the supply expands proportionally. When a community's population shrinks, the supply contracts. No committee decides this. No vote is required. The algorithm runs.

FEC is **a clearing instrument for inter-community trade only**. It is not a local currency replacement. Ordinary members use local currency for daily life. FEC lives at the community-to-community layer — a member buys goods with local currency, the food domain sources grain from another community, that settlement happens in FEC. The member never sees it.

### The local credit exchange rate

Each community sets its own exchange rate between local credits and FEC independently. This rate floats based on the community's productive output relative to its energy consumption. A highly productive community's credits are worth more kWh; a struggling community's credits are worth fewer. This is a real-time signal of community economic health — no committee computes it, it emerges from the exchange.

### Demurrage

Federation currency carries demurrage at the same rate as local currency. A community holding a large federation currency surplus is losing value continuously. The rational response is to spend it — on goods from other communities, or on investment in productive capacity elsewhere in the network.

Demurrage creates the **push**. Visible needs in other communities create the **pull**. Together they channel surplus toward productive use rather than accumulation.

### Trade imbalances

Some communities will run persistent surpluses; others persistent deficits. This is the normal condition of trade between communities of unequal productive capacity. The federation currency system makes imbalances **visible in real time** — the federation server's dashboard shows net trade positions for every member community, updated continuously.

Visibility does not solve imbalances. It prevents the worst outcomes: communities discover structural problems early enough to respond rather than when reserves hit zero.

---

## The federation resource pool

Federation currency is a medium of exchange — it should not be used as a development finance instrument. When a community needs a greenhouse, a mill, or medical equipment, what it actually needs is real resources: materials, equipment, and people who know how to build. The federation resource pool addresses this at the real-goods layer, not the currency layer.

### How it works

Surplus communities contribute excess productive capacity to the pool — grain beyond their needs, spare labor after harvest, materials left over from construction. Deficit communities draw from the pool to build productive capacity: infrastructure, equipment, functional units.

Contributions and draws are in real goods, not currency. The federation server tracks what has been contributed, what has been requested, and what has been delivered.

### Grants, not loans

All draws from the resource pool are grants, not loans. This is deliberate and non-negotiable.

Loans create compounding obligations that grow independent of whether the investment succeeded. A community that borrows to build a greenhouse and fails — bad weather, wrong crops, inexperienced staff — is now poorer than before and owes resources on top. The debt trap that has destroyed developing economies for generations begins here.

Grants absorb the loss at the federation level and let the community try again. Failure is recoverable. This is the model of the Marshall Plan — grants, not loans — which produced faster and more durable recovery than anyone predicted. The contrast is WWI reparations, which produced hyperinflation, depression, and political collapse.

### Accountability without bureaucracy

Grants are tied to specific capital projects with a completion timeline. The receiving community reports back on what was built. A community that repeatedly fails to deliver loses access to future grants. The condition is productive capacity — "did this make the community more capable of meeting its own needs?" — not specification compliance. A community that receives a greenhouse grant and builds a slightly different greenhouse has adapted to local conditions. That is success.

Grant applications are short. Approvals are fast. The federation server handles the accounting. Administrative burden on recipients is minimized — the communities most in need are often the least equipped to manage complex compliance processes.

### What the pool is not

The resource pool is not a welfare fund. It does not cover operating deficits or consumption shortfalls. A community that consistently imports more than it exports needs to develop productive capacity, not receive ongoing transfers. The pool funds the development; the community does the work.

Conditions on grants must serve the recipient's productive capacity, not the contributors' economic interests. "You must build this mill" is a legitimate condition. "You must open your marketplace to our goods" is extraction dressed as aid.

---

## Governance

### One community, one vote

All federation governance decisions use equal voting regardless of community size. Population-weighted voting gives large communities structural dominance. The communities most likely to need federation resources are the small ones — they must not be systematically outvoted on the decisions that affect them most.

### Rotating administration

The community that administers the federation server rotates on a fixed schedule. No community controls it permanently. Administrators execute decisions; they do not make them.

### Public ledger

Every federation currency balance, every trade flow, every resource pool contribution and draw is public to all member communities in real time. Sunlight is the primary accountability mechanism. A community gaming the system can be seen doing it.

### Formula-based floor

Most resource pool allocation happens automatically by formula — communities below a productive capacity threshold receive a baseline grant without application or committee review. Discretionary allocation handles the unusual cases. The formula runs 80% of the time; governance handles the remaining 20%.

---

## Tradeoffs worth resisting

**Any single community's currency becoming the federation reserve currency.** Whoever issues the reserve currency runs deficits everyone else finances. FEC must be issued by the federation bank collectively, algorithmic and pegged to total network population.

**A separate inter-federation currency.** The kWh anchor already applies above the federation level. Adding a second clearing unit above FEC introduces conversion friction, governance complexity, and a new capture surface. The Congress of Federations runs the same FEC clearing system with federations as participants — not a new currency.

**Voting weight proportional to economic size.** Large productive communities will push for this. It is the path to federation capture by the strongest member.

**Federation authority over local governance.** The federation clears trade and coordinates investment. It does not set housing policy, endowment levels, or membership criteria for its member communities. This boundary must be explicit and actively defended.

**Conditions that serve contributors, not recipients.** Market-opening requirements, procurement preferences for contributing communities, or governance conditions that advantage larger members are extraction dressed as development. They must be recognized and refused.

---

## What to build now

The community server layer first. A federation cannot be built until there are communities worth federating.

The federation server is architecturally straightforward once the community server exists — it runs the same primitives (accounts, currency, governance, demurrage) at a higher level of abstraction, with community servers as its members rather than individual people. The community server codebase is the foundation. Keep it clean and principled so the federation layer has something solid to build on.
