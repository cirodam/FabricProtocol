# Functional Units

## Concept

A Functional Unit is the operational body that actually does work. It is the commons equivalent of what a business, workshop, fire station, or clinic is in the outside world — without the corporate pathologies.

Functional Units sit below Functional Domains in the hierarchy. A domain represents the community's mandate for a function; a functional unit executes it.

---

## Hierarchy

```
Commons
└── FunctionalDomain (e.g. Public Safety)
    ├── FunctionalUnit (e.g. Fire Station 1)
    └── FunctionalUnit (e.g. Fire Station 2)

Commons
└── FunctionalDomain (e.g. Healthcare)
    ├── FunctionalUnit (e.g. Neighborhood Clinic)
    └── FunctionalUnit (e.g. Mobile Care Unit)

Commons
└── FunctionalDomain (e.g. Food Provisioning)
    ├── FunctionalUnit (e.g. Community Kitchen)
    ├── FunctionalUnit (e.g. Grain Store)
    └── FunctionalUnit (e.g. Distribution Point)
```

The domain sets policy and allocates budget. Functional Units execute. A small community may have one functional unit per domain; a larger one may have many.

---

## Properties

Every functional unit has:
- A **Bank account** — funded by its parent domain (or Commons directly)
- An **Asset ledger** — tracks physical resources (the firetruck, the kitchen equipment)
- A **member roster** — participants with defined roles
- **Positions** — funded roles with payroll, same model as domain/commons positions
- A **name** and **description**

---

## Two Accountability Types

Functional Units come in two types:

**Commons Service** (domain-owned)
- Funded by its parent FunctionalDomain
- Governed by community governance
- Serves all members by right
- Surplus stays in the functional unit or returns to the domain
- Examples: fire station, library, clinic, school, grain store

**Enterprise** (member-governed)
- A cooperative venture organized by members for their own benefit
- Earns credits from the marketplace
- The commons does not track or manage enterprises internally — they are marketplace participants like any member
- Enterprise accounting, membership, and profit-sharing are the members' own affair, outside the commons protocol
- A separate enterprise app could optionally use the Bank and Marketplace as infrastructure

---

## What Functional Units Are Not

- Not corporations — no shareholders, no equity, no limited liability as a shield from accountability
- Not employers in the capitalist sense — members retain community membership and endowment regardless of the functional unit's fortunes
- Not permanent by default — a functional unit can be wound down by governance (commons service) or by its members (enterprise)

---

## Payroll

PayrollService runs payroll at three levels:
1. Commons positions (governance officers)
2. FunctionalDomain positions (domain leads, inspectors, coordinators)
3. FunctionalUnit positions (the operational staff)

Each level draws from its own Bank account. Funding flows down: Commons → Domain → Functional Unit.

---

## Implementation Notes (when ready)

- `FunctionalUnit` class: `id`, `name`, `description`, `domainId | null`, `type: "service" | "enterprise"`, Bank account, asset ledger, positions, member roster
- `FunctionalDomain` gets `addUnit(unit)` / `getUnits()`
- `PayrollService` extended to iterate domain → functional units → positions
- Marketplace fulfillment can pay a functional unit's account directly (commons service receiving payment)
