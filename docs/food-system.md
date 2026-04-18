# Food System

## Scope

This document covers food storage and preparation — the functional units responsible for processing and distributing food once it has been acquired or grown. Agriculture (production) is out of scope here.

## Functional units

| Unit | Role |
|---|---|
| FoodStorage | Receives, organizes, and rotates stored food; maintains inventory |
| Mill | Grinds shelf-stable grains into flour |
| Bakery | Produces baseline bread and baked staples for community distribution |
| Cannery | Preserves food via canning, fermentation, drying, and smoking; primary harvest-season operation |
| CommunityKitchen | Prepares daily meals for institutional distribution (elderly, sick, children, communal) |
| Butchery | Slaughters and processes community livestock; episodic |

## Staffing

For a community of 1,000, estimated year-round full-time equivalents:

| Unit | Staff (FTE) | Notes |
|---|---|---|
| FoodStorage | 3 | Receiving, rotation, inventory |
| Mill | 3 | ~2,000 lbs/day throughput; shift coverage required |
| Bakery | 10 | ~1 per 100 people at production scale |
| Cannery | 4 avg / 20 peak | Spikes hard at harvest; peak work is mostly unskilled |
| CommunityKitchen | 6 | Institutional feeding only (~20–30% of community) |
| Butchery | 2 | Only if livestock present |

**Year-round total: ~28 FTEs per 1,000 members (~2.8% of population)**

At harvest peaks, the Cannery temporarily inflates this to ~44. The surge is largely unskilled (washing, packing, labeling) and draws from the general community rather than dedicated staff.

The staffing ratio is roughly linear:

$$\text{food prep staff} \approx N \times 0.028$$

The main nonlinearity is the Cannery. Its peak demand doesn't scale linearly because batch processing has fixed setup costs — a community of 2,000 needs roughly 30 peak cannery workers, not 40.

## What this doesn't cover

- **Agriculture** — growing, harvesting, and delivering raw food to the system
- **Water** — food preparation requires significant water beyond drinking
- **Cooking fuel** — milling and baking are energy-intensive; fuel source is a separate planning concern
- **Supply tracking** — inventory levels, caloric coverage, and gap analysis are not yet modeled in code
