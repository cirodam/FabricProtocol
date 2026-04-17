# The Fabric Protocol

A TypeScript implementation of a mutual credit system for local communities.

## Why

The modern economy is abandoning people. AI and automation are making labor redundant faster than new roles emerge. The market cannot see productive capacity that isn't profitable. The safety nets built for a different era are fraying. A growing number of people have looked at the deal on offer and decided it isn't good enough.

The Fabric Protocol is built for those people and those communities.

It is infrastructure for the work that markets ignore and bureaucracies do badly: feeding people, housing them, caring for their children and elders, and compensating the labor that makes all of that possible. It is **need-motivated rather than profit-motivated** — production follows genuine human necessity, not commodity prices.

It is not a government. It is not a charity platform. It is not a startup. It works across political difference because it is organized around needs, not ideology. The test for every feature is simple: does this help people work together to meet each other's needs?

## What is it?

The Fabric Protocol is a set of primitives for communities to collectively identify and meet their own needs. It is designed to operate at the scale of a neighborhood, town, or rural county — anywhere a shared identity and enough trust already exist to make collective decisions.

It is not a replacement for the broader economy. It is a substrate communities can build on top of — filling the gaps the market ignores and compensating the labor that conventional systems render invisible.

## Core ideas

**Mutual credit.** Members earn credits by contributing to the community. Credits decay over time (demurrage), which discourages hoarding and keeps value circulating.

**The Commons.** A collectively owned pool governed by member vote — the community's central bank, savings pool, investment fund, and expression of collective values in one transparent institution. Its negative balance is the money supply. This is not a problem. It is the system working correctly.

**Universal basic needs.** Every member's basic needs are met regardless of their productive capacity. This is not charity. It is what membership means. Every person alive was entirely non-productive for the first decade of their life. Most will be again. The community is strong enough to sustain its members through those periods — or it builds the capacity to become so.

**Functional domains.** Specialized areas of community life — food, housing, healthcare, childcare, dependency care — each with its own account and governance. Communities fund what they need.

**Positions.** Community-funded roles with a monthly credit salary. Any member can hold a position — including family members caring for relatives. The community votes to recognize the labor. Unpaid domestic and care work becomes visible and compensated.

**Federation.** Communities link to each other via Federated Exchange Credits (FEC), enabling inter-community trade without a central authority. The network is the emergent result of bilateral relationships.

## What it enables

- Knowing who in the community is unhoused, and funding the domain to address it
- Paying a parent or neighbor to care for a child or disabled family member
- Issuing food vouchers to every member up to a nutritional baseline
- Tracking the condition of every housing unit in the community
- Trading with neighboring communities without surrendering local sovereignty

## Structure

```
src/
  bank/               Credits, food vouchers, and FEC accounts
  central_bank/       Currency issuance and endowments
  commons/            Governance, payroll, positions, proposals
    domain/           FunctionalDomain base class
  member/             Member registry
  food/               Food domain and nutritional profiles
  housing/            Housing domain and unit registry
  healthcare/         Healthcare domain
  child_care/         Childcare domain
  dependency_care/    Dependency care profiles and domain
  marketplace/        Offers, requests, and fulfillment
  federation/         Inter-community links and FEC clearing
  ledger/             Physical asset tracking
```

## Philosophy

Communities self-organize. The Fabric Protocol provides primitives — accounts, governance, care profiles, housing records — and gets out of the way. Where to draw boundaries, who to elect, how much to fund each domain: those are social questions answered by the people living inside the system, not by the software.
