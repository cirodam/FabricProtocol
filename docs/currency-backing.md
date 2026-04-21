# Currency Backing

## Core Principle

Commons currency is not issued arbitrarily, nor backed by debt. It is backed by three things that the community actually produces and sustains:

1. **Membership** — the number of people committed to the community
2. **Trust** — the time members have spent in good standing (trust scores)
3. **Food stores** — the physical inventory held in community storage

Together these three anchors tie the money supply to real productive capacity: people, their demonstrated commitment, and the food they have grown and stored.

---

## The Three Backings

### 1. Membership

The Central Bank issues a baseline endowment to each member when they join. More members means more currency in circulation — but only because there are more people to use it and contribute to it. This is the population-anchored component.

**Incentive:** grow the community with people who intend to stay and contribute.

### 2. Trust Score

Trust scores accumulate over time through consistent, good-standing membership. Higher trust scores correspond to higher endowment ceilings. Members cannot inflate their trust scores quickly — they accrue through lived time in the community.

**Incentive:** long-term commitment over short-term opportunism; loyalty over churn.

### 3. Food Stores (Inventory-Backed Credit)

When the community stores food, the Central Bank issues kin against that inventory. Kin are retired when food is consumed. Kin are cancelled and a demurrage penalty applied when food spoils or is destroyed.

This is not a loan in the conventional sense. It is **inventory-backed credit issuance** — more like a grain warehouse receipt than a debt instrument. The distinction is critical:

- A *loan* means the community owes principal regardless of what happens to the food. A bad harvest or blight becomes a debt spiral — exactly the dynamic that destroys rural communities under conventional finance.
- *Credit against inventory* means the money supply tracks the goods. Food consumed → kin retired. Food rotted → kin cancelled + demurrage. No orphaned debt.

**Incentive:** produce food, store it carefully, rotate stock, minimize waste.

---

## Why the Combination Works

Each component disciplines the others:

- **Membership alone** could inflate supply by recruiting people with no productive capacity.
- **Food alone** is seasonal and perishable — the money supply would swing unpredictably.
- **Trust alone** would entrench incumbents and make it hard for new members to participate.

Together they create multiple anchors with different failure modes. No single shock collapses the system.

---

## The Role of Demurrage on Spoilage

Demurrage on food rot is the integrity mechanism for the food-backing component. Without it, communities could over-report inventory or delay spoilage acknowledgment to keep kin on the books. Demurrage means holding food costs money unless it is consumed — there is no incentive to inflate the food stock on paper.

Spoilage must be logged honestly by whoever manages the store, reviewed by an officer, and auditable in the ledger. This is a governance design problem as much as a technical one. The system creates the right incentive; the community must honor it.

---

## Flow Summary

```
Member joins
  → Central Bank issues endowment (membership-backed)

Member remains in good standing over time
  → Trust score rises → endowment ceiling rises (time-backed)

Community stores food
  → Central Bank issues food kin to community account (inventory-backed)

Member takes food from store
  → Member account debited → community account credited → kin retired

Food spoils
  → Kin cancelled + demurrage applied to community account
```

---

## What This Does Not Cover

This model does not yet address:

- **Housing** — whether housing units can back credit issuance in a similar way
- **Labor** — whether committed labor hours (e.g. shift pledges) could serve as a backing component
- **Seasonal rebalancing** — how to handle food-backed credit contraction at the end of winter

These are open design questions.
