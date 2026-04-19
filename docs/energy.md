# Energy

## The Core Problem

A community dependent on grid power and fuel imports is one supply disruption away from crisis. The goal of the Energy domain is **energy sovereignty**: the capacity to sustain essential community functions through disruptions of arbitrary length. Grid connection may exist as a supplement or export channel, but it is not a dependency.

When energy is scarce — whether from grid failure, fuel shortage, or insufficient local generation — the community must have an explicit rationing order. That order is not negotiable in the moment; it must be decided in advance, written into the constitution, and enforced by the Energy domain without exception.

---

## Rationing Priority Tiers

Scarcity is managed by shedding load from the bottom up. The lowest tiers are cut first. Generation is allocated from the top down — essentials are fully powered before anything lower receives anything.

### Tier 1 — Life Safety (never shed)
Power here cannot be interrupted without risking lives.

- **Healthcare clinic** — medical equipment, refrigerated medications, operating lighting
- **Water pumping and treatment** — safe water is a medical necessity
- **Food cold storage** — preventing spoilage of community food supply
- **Emergency communications** — radio, network nodes sufficient for coordination
- **Fire and emergency stations** — lighting, communications, equipment charging

### Tier 2 — Community Operations (shed only in severe shortage)
Functions that keep the community running as a collective.

- **Commons hall** — governance, meetings, shared computing, administrative functions
- **Shared kitchens and food preparation facilities**
- **Childcare and education facilities** — lighting, heating/cooling, equipment
- **Sanitation systems** — pumps, treatment, waste processing
- **Courier and transport charging/fueling** — keeps the movement of goods and people functional
- **Workshop and manufacturing** — tools, fabrication, repair

### Tier 3 — Shared Residential (shed before community operations)
Collective housing is powered before individual units.

- **Shared housing common areas** — hallways, laundry, shared kitchens in multi-unit buildings
- **Heating and cooling for high-density residential** (apartments, co-housing clusters)
- **Community bathhouses or shared bathing facilities** if individual units lack them

### Tier 4 — Individual Residential (lowest priority)
Power to individual single-family homes or private apartments is a **residual allocation** — it receives whatever is left after Tiers 1–3 are fully supplied. In a genuine shortage, this tier is the first to be reduced and the last to be restored.

This is not punitive. It reflects the structural reality that a single household's private lighting and appliances serve fewer people per watt than shared community infrastructure. A community that has surplus energy will fully power individual homes; a community in shortage cannot sacrifice its clinic to keep one member's television on.

During rationing of Tier 4:
- Households receive a **daily energy budget** metered at the unit level
- Budget is equal per household, not per person (larger households benefit from density)
- Excess usage above budget is either blocked by smart metering or recorded as a debt against the member's account, repaid when the shortage ends
- Essential home medical equipment (home oxygen, powered wheelchairs, refrigerated insulin) is reclassified to Tier 1 upon documentation with the Healthcare domain

---

## Generation Sources

Ordered by operational preference — sources higher on this list should be maximized before relying on sources lower on it.

1. **Solar PV with battery storage** — zero fuel cost, modular, low maintenance, predictable degradation
2. **Micro-hydro** — highly reliable if a suitable watercourse exists; continuous generation day and night
3. **Wind turbines** — strong complement to solar in appropriate geographies; generation peaks in winter when solar is weakest
4. **Biogas from anaerobic digestion** — dispatchable (controllable) generation from food and agricultural waste; the community produces this waste regardless
5. **Wood gasification** — dispatchable, but draws on forestry resources that have competing uses; reserve for deficit periods
6. **Grid import** — last resort in shortage, first choice for export of surplus

The community should target generation capacity sufficient to cover Tiers 1–3 entirely from local sources in a median-insolation month. Grid connection is a buffer, not a baseline.

---

## Load Management

Generation capacity alone is insufficient. A community that generates enough power on average but cannot manage its consumption profile will still experience shortages during cloudy weeks or equipment failures.

**Deferrable loads** — operations that can shift to peak generation hours without harm:
- Laundry and water heating
- Battery charging for transport vehicles
- Manufacturing and workshop operations
- Grain milling and food processing

**Interruptible loads** — operations that can be paused for hours without consequence:
- Non-essential lighting
- Recreational equipment
- Administrative computing beyond minimum

The Energy domain schedules deferrable loads to align with generation peaks. In a solar-primary system, this means midday; in a wind-primary system, scheduling follows forecast data.

---

## Fuel for Transport

As liquid fuel becomes expensive or unavailable, the Transport and Courier domains shift in order:

1. **Human power** (walking, cycling, cargo bikes) — zero fuel cost, no infrastructure dependency
2. **Animal draft** — horses and donkeys run on hay and grass the community can grow
3. **Electric vehicles** charged from community generation — a storage problem, not a fuel problem
4. **Biodiesel** from community-produced cooking oil waste or oil crops
5. **Biogas-fueled vehicles** with converted engines
6. **Combustion vehicles on purchased fuel** — lowest priority, phased out as alternatives mature

Route planning for both domains should document the `vehicleType` for each route so the community can immediately identify which routes survive a fuel constraint and which require conversion or redesign.

---

## Relationship to Other Domains

| Domain | Energy dependency |
|---|---|
| Healthcare | Tier 1 — non-negotiable |
| Food (cold storage) | Tier 1 — spoilage is irreversible |
| Water | Tier 1 — safe water is a medical necessity |
| Childcare / Education | Tier 2 — community-scale facilities |
| Courier / Transport | Tier 2 — fleet charging and route operation |
| Housing (shared) | Tier 3 — collective before individual |
| Housing (individual) | Tier 4 — residual allocation |
