# The Person-Year

## What it is

A person-year is one calendar year spent as a member of a community in good standing. It is the fundamental unit of account in the monetary system — the anchor that ties the money supply to something real, observable, and slow-moving.

It measures time and presence, not output or productivity. A farmer and a teacher accumulate person-years at the same rate. This is intentional. The anchor is demographic, not evaluative.

---

## Why it works as a monetary anchor

A community of stable, long-standing members has accumulated productive capacity that is not fully visible in any single metric. They have:

- Established infrastructure built and maintained over years
- Institutional knowledge of how to feed, house, and care for each other
- Social trust that reduces the friction and overhead of coordination
- Demonstrated commitment that makes future cooperation credible

Person-years captures all of this indirectly. A community cannot fake a decade of membership. The anchor is slow-moving by design — it cannot be gamed by rapid recruitment, it cannot be inflated by a good harvest, it cannot be manipulated by any single actor.

A larger, older community has more person-years and a proportionally larger money supply. That money supply reflects real accumulated capacity, not a policy decision.

---

## How money is created and destroyed

### Creation

When a member joins, the Central Bank issues them 10,000 credits — one person-year's worth. Every year thereafter, on the anniversary of their joining, the Central Bank issues another 10,000 credits. This is not a loan. It is the community's recognition that another year of presence and participation has value.

The money supply grows with the community. More members, more years, more credits in circulation. The total money supply at any moment is approximately:

$$M = \sum_{\text{members}} \text{years in community} \times 10{,}000$$

### Destruction

When a member leaves or dies, the Central Bank reclaims their remaining account balance. Whatever was issued to them but already spent — credits now held by other members — becomes an unrecovered deficit on the bank's books.

The community then runs demurrage across all accounts until that deficit is recovered and the Central Bank is made whole. Demurrage is not a standing tax. It runs only when there is an unrecovered deficit, and stops the moment the deficit is cleared.

This means:
- A stable community with no recent exits runs no demurrage at all
- A community with frequent turnover runs demurrage almost continuously
- The monetary cost of losing a member is shared across the community
- Membership retention is directly rewarded in monetary terms

---

## Relationship to the previous trust score

The codebase previously used a `trustScore` (0.0–1.0) that scaled a member's one-time endowment. That has been replaced by the person-year model. Trust is no longer an abstract score — it is simply elapsed time since joining, calculated directly from `joinDate`. The monetary expression of that time is the annual 10,000-credit issuance.

---

## At the federation level

The same principle applies one level up. Each community's FEC (Federation Exchange Credits) allocation is proportional to its total accumulated person-years across all members. A larger, older community has more FEC purchasing power in the federation. A new community starts small and grows into it.

The federation money supply is therefore:

$$\text{FEC supply} = \sum_{\text{communities}} \sum_{\text{members}} \text{years in community} \times \text{FEC per person-year}$$

No federation committee decides this. No vote is required. The supply adjusts automatically as communities grow and age.

FEC and local credits are backed by the same thing — person-years — measured at different scales. This is why the conversion from FEC to local credits does not require an arbitrary exchange rate. The community's Central Bank issues local credits against incoming FEC at the same person-year rate it uses for everything else.

---

## Properties of the anchor

**It cannot be inflated quickly.** You cannot acquire person-years faster than time passes. A community cannot bootstrap a large money supply by recruiting a flash mob — new members start at zero years and accumulate slowly.

**It rewards stability.** The communities with the largest, most robust economies are the ones that have retained members for the longest time. The monetary system creates a direct incentive for the social conditions — rootedness, commitment, mutual investment — that make communities resilient.

**It is legible.** Anyone can verify the money supply: count the members, check their tenure, multiply by 10,000. No black box, no model, no trust required in the calculation.

**It is egalitarian within the community.** Every year of every member's life is worth the same. The farmer and the surgeon accumulate person-years identically. Wages within the economy can vary — the hospital can pay a specialist more than a cleaner — but the underlying monetary backing treats all human time as equivalent.

**It is humane at the edges.** An aging community whose productive output is declining still carries the monetary weight of its members' accumulated decades. They earned that standing when they were building. It does not evaporate when they get old. The federation's solidarity mechanisms ensure those accumulated person-years translate into real purchasing power for food and care when it is needed.

---

## Historical analogues

The person-year is not a new idea. Versions of it have appeared throughout history:

- **The hide** (Anglo-Saxon England) — one family's worth of land, used as the unit of tax obligation and resource entitlement. Community capacity scaled directly with population.
- **The headright** (colonial Virginia, 1618) — 50 acres of land per person transported. The resource base expanded with each new person.
- **Gesell's Freigeld** (early 20th century) — money anchored to population and carrying demurrage, briefly implemented in Wörgl, Austria (1932) with striking success before being suppressed by the central bank.
- **The kibbutz** — equal allocation regardless of role, with tenure increasing governance standing but not material entitlement.

Each of these was eventually suppressed or abandoned — usually by interests that benefited from the alternative. The person-year model is the same principle, implemented in software where it is harder to dismantle by pressuring a single institution.
