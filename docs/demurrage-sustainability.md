# Demurrage Sustainability Model

## Overview

The community sustains essential services through a monthly demurrage levy — a charge on all credit balances that funds Commonwealth outflows. No external funding is required at steady state.

## Money Supply (M)

**M** is the total credits in circulation: the sum of all account balances across all members and domains.

In a closed community, M is conserved by internal transactions — spending moves credits between accounts but does not change M. M changes only through:

- **Injection**: endowments issued by the Central Bank (increases M)
- **Destruction**: Central Bank demurrage / bank recovery (decreases M)
- **Leakage**: net outflow to external parties via FEC trade (decreases M)

## Commonwealth Outflows

Each month the Commonwealth is responsible for two categories of spending:

```
monthly outflow = Σ allowances + Σ wages
```

**Allowances** are per-member credits distributed for essential needs (food, healthcare, etc.) — a local UBI funded by the Commonwealth and routed through domain accounts:

```
Commonwealth → FoodDomain → members
Commonwealth → HealthcareDomain → members
...
```

**Wages** are direct payments to community-employed workers in essential services (food workers, healthcare workers, etc.).

Both stay within M. Workers and members spend their credits, those credits accumulate in other accounts, and demurrage collects from wherever they land.

## Demurrage Revenue

Each monthly levy collects:

```
revenue = rate × M
```

The rate applies uniformly to all non-exempt credit balances. Because the system is closed, velocity does not affect total revenue — credits spent quickly land in another account and are taxed there instead. The aggregate tax base is always M.

## Sustainability Condition

The system is self-sustaining when:

```
rate × M ≥ monthly outflow
```

Or equivalently, the minimum viable rate is:

```
rate = monthly outflow / M
```

### States

| Condition | Effect |
|-----------|--------|
| `rate × M > outflow` | Surplus — Commonwealth balance grows; community can lower rate, raise allowances, or hire workers |
| `rate × M = outflow` | Break-even — balance stays flat; system runs indefinitely |
| `rate × M < outflow` | Deficit — balance shrinks; rate must rise or outflows must fall |

## Setting M Through Endowment Policy

M is not determined by commerce or behavior — it is directly controlled by how many credits the Central Bank issues through endowments. The community chooses M, and that choice determines what rate is required to sustain a given level of services:

```
required M = outflow / rate
```

The founding question is therefore: **what endowment per member does the Central Bank need to issue so that the community can run at a bearable rate?**

## Example: 15,000-Person Community

A rural county of 15,000 people. Essential workforce at ~8% of population = ~1,200 workers (food, healthcare, education, water, sanitation, energy, governance).

**Monthly outflow estimate:**

```
Wages:      1,200 workers × 800 cr/mo  =  960,000 cr/mo
Allowances: 15,000 members × 200 cr/mo = 3,000,000 cr/mo
─────────────────────────────────────────────────────────
Total outflow:                           ≈ 4,000,000 cr/mo
```

**Required M at different target rates:**

| Target rate | Required M | Endowment per member |
|-------------|-----------|---------------------|
| 10%/mo | 40M credits | ~2,700 cr |
| 5%/mo | 80M credits | ~5,300 cr |
| 2%/mo | 200M credits | ~13,300 cr |
| 1%/mo | 400M credits | ~26,700 cr |

The community sets its endowment amount knowing it directly determines the rate they will live under. A higher endowment per member means a lower ongoing tax rate — but requires the Central Bank to issue more credits upfront.

**Trajectory over time:**

M grows as more members join and receive endowments. The rate can be lowered incrementally as M reaches each threshold. A community might launch at 10% with 2,000 founding members, and lower the rate in stages as the population grows toward 15,000.

| Members | M (at 2,700 cr endowment) | Rate needed |
|---------|--------------------------|-------------|
| 2,000 | 5.4M | ~74% — not viable yet |
| 5,000 | 13.5M | ~30% — early hardship phase |
| 10,000 | 27M | ~15% — transition phase |
| 15,000 | 40M | ~10% — viable founding rate |

This illustrates why **scale matters**. A 15,000-person community issuing 2,700 cr/member reaches the viable threshold. A 500-person community with the same endowment and the same service ambitions cannot — the math doesn't close.

## Risk Factors

The sustainability condition can fail if M shrinks unexpectedly:

- **Bank demurrage too aggressive**: the 2% Central Bank recovery rate destroys money. If set too high relative to endowment injection, M deflates and demurrage revenue falls.
- **External trade imbalance**: net imports drain credits out of the community as FEC payments.
- **Community too small**: M never reaches the threshold where a tolerable rate covers essential costs.

## The Role of Endowments

Endowments are not recurring expenses in this model — they are **one-time capital injections** to grow M. When the community wants to expand capacity (hire a new worker, launch a new domain, raise allowances), it issues endowments to increase M. The demurrage loop then sustains the higher level of service indefinitely.

```
endowments → grow M → demurrage revenue rises → sustains higher outflow
```

## Commonwealth Balance as Buffer

The Commonwealth balance acts as a float between monthly levy collections and ongoing disbursements. If a disbursement spike occurs before the next levy run, the balance absorbs it.

A healthy balance target is **2–3 months of outflow** in reserve. The rate should be calibrated to maintain this runway:

- Balance falling below 1 month → raise rate
- Balance above 4 months → lower rate or increase outflows
