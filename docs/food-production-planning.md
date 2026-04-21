# Food Production Planning

## The Core Problem

A community that grows its own food faces a coordination problem that supermarkets hide: someone has to decide in February what will be eaten in September. Planting decisions must be made months before harvest, capital must be committed before demand is confirmed, and a failed crop means real hunger unless alternatives are arranged in advance.

The Commons solves this through a structured annual planning cycle anchored by purchase contracts — the community expresses its demand before farmers plant, so producers have guaranteed income and the community has guaranteed supply.

---

## The Annual Planning Cycle

### January–February: Demand Assessment

The Food domain calculates what the community needs to eat for the coming year.

Inputs:
- Current membership count and demographic breakdown (more children and elderly shifts nutritional requirements)
- Per-capita nutritional targets by food category (grains, legumes, vegetables, fruit, dairy, protein)
- Consumption records from the prior year — what was actually eaten, what went to waste, what had to be imported
- Anticipated membership growth or contraction

Output: a procurement target by food category, expressed in kg or units, for the harvest season.

### February–March: Inventory of Production Capacity

The Food domain surveys what the community can actually produce:

- Available land by type (field crops, market garden, orchard, pasture)
- Active producers and their track records — yield per acre, crop specializations, infrastructure they hold
- Equipment and storage capacity — what can be processed, what can be stored and for how long
- Perennial crops already in production (orchards, berry patches, perennial vegetables) — these are fixed inputs that don't require new planting decisions

### March: Gap Analysis

Compare demand targets against production capacity. The gap between what the community needs and what it can grow is the import requirement — goods that must be acquired through federation trade or external markets.

The gap analysis also identifies concentration risk: if 80% of the community's grain supply is coming from one farmer on one plot, a single bad harvest is a crisis. Diversification targets should be explicit.

### March–April: Contract Issuance

The Food domain posts purchase contracts before planting decisions must be made. Each contract specifies:

- What is being procured (crop, variety if relevant)
- Quantity and acceptable quality standard
- Delivery window (the harvest period)
- Credit rate per kg or unit delivered

A farmer who accepts a contract knows before they spend money on seed, soil amendment, or labor that there is a guaranteed buyer at a guaranteed price. This is what makes small-scale farming economically viable — the risk of producing without a buyer is eliminated.

Contracts are not exclusive. Multiple producers can accept the same contract, splitting the total quantity between them. This builds redundancy into the supply chain.

### April–September: Production Period

Farmers plant and grow. The Food domain tracks:

- Which contracts have been accepted and by whom
- Any producers who report likely shortfalls (disease, weather, equipment failure) — early warning allows time to issue supplemental contracts or arrange imports
- Inputs required — seed, compost, irrigation — that the community should be supplying through its agricultural domain

### Harvest Season: Delivery and Credit Issuance

Goods are delivered to the Food domain's storage facilities. Each delivery is weighed, inspected for quality, and recorded. Kin are issued at that moment by the Central Bank, backed by the real goods now in community inventory.

Partial deliveries receive proportional credit. A farmer who delivered 180kg against a 200kg contract receives 90% of the contracted credit.

---

## Crop Planning Principles

### Match crops to lead times and certainty

| Category | Lead time | Planning certainty |
|---|---|---|
| Annual vegetables | 3–5 months | High — can adjust year to year |
| Grains and legumes | 6–8 months | High — annual commitment |
| Root vegetables and storage crops | 4–6 months | High — predictable storage |
| Fruit trees | 3–7 years to yield | Very low — long-term capital investment |
| Livestock (meat) | 6 months to 2 years | Medium — herd size decisions made in advance |
| Dairy and eggs | Continuous once established | High — predictable daily output |

Perennial crops and livestock are infrastructure decisions, not annual planting decisions. They require multi-year contracts and capital commitments from the domain, not single-season purchase orders.

### Prioritize staples over variety

In the early years, the community should maximize production of calorie-dense staples: grains, legumes, root vegetables, cooking oils. These form the base of the food supply and store well. Variety and specialty crops come after the staple base is secure.

### Plan for storage from the start

A harvest in September that cannot be stored is a windfall followed by scarcity. Cold storage, root cellars, grain silos, fermentation, and drying capacity must be built alongside production capacity. The Food domain's storage infrastructure determines how much production actually translates into year-round food security.

### Preserve surplus

A good harvest year should produce more than the community needs. The surplus is preserved — dried, fermented, canned, or stored whole — and forms the community's food reserve. The target reserve is at minimum 3 months of full community consumption, ideally 6 months. Reserve depth is tracked by the Food domain and reported to the assembly annually.

---

## Risk Management

### Crop failure

No single producer should supply more than 30% of any staple crop. No single crop should provide more than 40% of any nutritional category. These diversification rules limit the damage from a single failure.

When a producer reports a likely shortfall during the growing season, the Food domain has time to:
1. Issue supplemental contracts to other producers if capacity exists
2. Draw down food reserves to cover the gap
3. Issue an FEC-denominated import request to the federation

### Drought and weather

The community should maintain access to irrigation water independent of rainfall. The Water domain and Food domain must plan together — irrigation infrastructure is a shared capital investment.

### Pest and disease

Monoculture is the primary risk amplifier for crop disease. Mixed planting, crop rotation, and variety diversity are the mitigation. The agricultural domain should maintain seed diversity as a matter of policy and keep no-spray/low-spray practices as the default.

---

## The Contract as a Social Contract

The purchase contract system does something beyond logistics: it makes the community's food needs legible to the people who grow the food, and it makes the growers' economic needs legible to the community.

A farmer who knows the community needs 500kg of dry beans and is willing to pay 4 kin per kg can plan a season with confidence. A community that knows 3 farmers have accepted contracts for a total of 600kg of dry beans can plan its menus with confidence.

This mutual legibility — producer and consumer both seeing the same plan — is what replaces the price signal of a commodity market. The price signal in a commodity market is noisy, lagged, and shaped by speculators who eat none of the food. The purchase contract is a direct negotiation between the people who grow the food and the people who eat it.

---

## Relationship to the Food Voucher System

Food vouchers are issued to all members unconditionally on a fixed schedule. They can only be spent on food domain goods. This creates baseline demand that is visible to planners: the community can calculate the minimum food supply required simply by multiplying membership by the per-member voucher allocation.

Voucher demand sets the floor for production planning. Anything above the floor is discretionary credit spending. Planners should ensure the contracted supply comfortably covers the voucher floor with surplus before planning for discretionary demand.
