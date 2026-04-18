# Federation at Scale

## The problem

Bilateral FEM relationships work well for a small network. Two communities agree to trade, establish a clearing relationship, and settle periodically. Simple, decentralized, no central authority.

But the bilateral model doesn't scale to hundreds of communities. 100 communities maintaining direct relationships with each other is 4,950 bilateral links. In practice, communities will only maintain relationships with their nearest neighbors — which means trade between distant communities requires routing through intermediaries, and those intermediaries gain structural power. Price discovery becomes opaque. Multilateral netting (A owes B, B owes C, C owes A — settle it all at once) becomes impossible without some shared clearing institution.

The solution is not to abandon the bilateral model. It is to apply the same principles at a higher level of abstraction.

---

## The three-tier model

### Tier 1 — Community

The base layer. Local currency, local central bank, local governance. Communities are sovereign. The Fabric Protocol as currently implemented lives entirely at this tier.

### Tier 2 — Regional federation

A cluster of communities that form a shared clearing institution. The regional federation:

- Issues a **regional clearing currency** — used only to settle trade between member communities, not as a local currency replacement
- Is governed by member communities, one community one vote
- Applies demurrage to the regional clearing currency to discourage regional hoarding
- Has no authority over local governance, membership criteria, or endowment levels

A regional federation is structurally a community whose members are communities rather than individuals. It has a commons, a currency, governance, and demurrage. The same principles that make a local community resistant to extraction apply here — if applied consistently.

### Tier 3 — Inter-federation

Bilateral relationships between regional federations, for goods and services that no single region can produce. At this tier, trade is probably better thought of as a clearing ledger than a currency — federations settling accounts periodically rather than maintaining a circulating instrument.

---

## Three currencies, one experience

In the full model there are three distinct instruments:

1. **Local currency.** What members earn, spend, and hold. Never leaves the community.
2. **Regional clearing currency.** Settles trade between communities within a region. Lives at the community-to-community layer. Ordinary members never interact with it directly.
3. **Inter-federation clearing.** Settles trade between regional federations. Mostly an accounting instrument.

In practice, a member buys food with local currency. The food domain sources grain from another community — that settlement happens in regional clearing currency. The member never sees it. The clearing layers exist to make the local economy work at scale, not to replace it.

---

## Tradeoffs worth accepting

**Some shared governance at tier 2.** A regional federation needs a governance structure. Someone has to set clearing rates, handle disputes, and manage the regional commons. One community, one vote is the right starting principle.

**Some loss of monetary isolation.** Participating in regional clearing means your local economy is partially exposed to regional dynamics. That's the price of access to what you can't produce locally. It's a better deal than dependency on global supply chains you have no leverage over.

**Genuine opacity at tier 3.** You will not have full visibility into another federation's internal institutions. Inter-federation trade requires a degree of trust in their governance the way community trade requires trust between members.

---

## Tradeoffs worth resisting

**Any single community's currency becoming the regional reserve currency.** Whoever issues the reserve currency gets to run deficits everyone else finances. The regional clearing currency must be issued by the federation collectively, not adopted from its largest member.

**Voting weight proportional to economic size.** Large productive communities will push for this. It is the path to federation capture by the strongest member.

**Federation authority over local governance.** The federation clears trade. It does not set housing policy, endowment levels, or membership criteria for its member communities. This boundary must be explicit and actively defended.

---

## Open questions

These are not solved. They are the design problems that need to be worked through before tier 2 is built:

- **Clearing rates.** How does the regional clearing currency's value get set relative to local currencies? Fixed rates, negotiated rates, or market-determined?
- **Admission.** What are the criteria for a community to join a regional federation? Who decides?
- **Exit.** Can a community leave a regional federation? What happens to outstanding clearing balances?
- **Regional demurrage rate.** Should it match local demurrage, be set independently, or be governed by the federation?
- **Dispute resolution.** When two communities have a trade dispute, who adjudicates?

---

## What to build now

Nothing. The current bilateral FEM implementation is the right foundation. It doesn't foreclose the regional tier — the regional federation is just a community-level actor that happens to be composed of communities rather than individuals. When the network grows to the point where bilateral relationships are insufficient, the tier 2 layer can be built on top without breaking tier 1.

The goal now is to keep tier 1 clean and principled so the eventual tier 2 implementation has something solid to build on.
