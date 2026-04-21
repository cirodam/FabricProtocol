# Governance Implementation Plan

This document maps the three-body governance model (council / assembly / referendum) to the
current codebase state and specifies what needs to be built or changed to bring them into
alignment. It is a working plan — cross off items as they land.

---

## Current State Summary

| Area | Current state |
|---|---|
| `DomainCouncil` | One council per domain, keyed by `domainId`. Hard-coded 5 seats. |
| `CouncilService` | Map keyed by `domainId`. `getOrCreateCouncil(domainId, domainName)` |
| `CouncilController` | All routes use `:domainId` as the council identifier. |
| `CouncilPage.svelte` | Exists; shows one council per domain. |
| Assembly | `src/commons/assembly/` exists — needs audit. |
| Sortition | `SortitionPool` + `SortitionService` + `SortitionController` exist. |
| Referendum | New — fully implemented (model, service, controller, 3 frontend pages). |
| Constitution | `ParameterAuthority` has `"council"` and `"citizens-assembly"` but no `"referendum"` or `"assembly"`. No authority map for action classes. |
| Authorization | No authorization layer exists — governance bodies are informational only. |

---

## Work Items

### 1. Refactor `DomainCouncil` — multi-domain purview

**Problem:** A council is currently 1:1 with a domain. The model needs to be 1:many.

**Changes:**

- `DomainCouncil`:
  - Add own `id: string` (UUID, becomes the storage key instead of `domainId`)
  - Rename `domainId → primaryDomainId` (kept for display / legacy)
  - Add `domainIds: string[]` — the full list of domains this council has purview over
  - Add `name: string` — human name for the council (e.g. "Sustenance Council")
  - Keep `domainName` as a derived/display field or remove in favour of `name`
  - Keep seat size as configurable (3–5) rather than hard-coded 5: add `minSeats` / `maxSeats` or a single `targetSize: number` defaulting to 5

- `DomainCouncilLoader`:
  - Add `id`, `name`, `domainIds` to the stored record
  - Store keyed by `council.id` not `council.domainId`
  - Add `load(id)` method

- `CouncilService`:
  - Internal map changes from `Map<domainId, DomainCouncil>` to `Map<councilId, DomainCouncil>`
  - Add `getCouncilForDomain(domainId)` — returns the council whose `domainIds` includes this domain
  - Add `create(name, domainIds, targetSize?)` method (replaces `getOrCreateCouncil`)
  - Keep `getOrCreateCouncil` as a shim or migrate all callers
  - `getAllCouncils()` unchanged (returns all councils)

- `CouncilController`:
  - Routes change from `/councils/:domainId` to `/councils/:id`
  - Add `domainIds` to DTO
  - Add `PATCH /councils/:id/domains` — update the domain list
  - `listCouncils` DTO includes `domainIds` and `name`
  - `drawSeats` references council by `id` not `domainId`

- `CouncilPage.svelte` / `CouncilController` frontend:
  - Update to use council `id` in URLs
  - Show domain list in council detail view
  - Allow adding/removing domain associations from the UI

**Migration:** Existing `data/councils/*.json` files are keyed by `domainId`. A one-time migration script (or graceful load fallback) will need to rewrite them to the new format.

---

### 2. Audit and complete the Assembly

**Problem:** `src/commons/assembly/` exists but its scope relative to the governance model is unclear.

**Tasks:**
- [ ] Read current `Assembly` model and `AssemblyService` — document what exists
- [ ] Verify: does assembly have members drawn by sortition from the full membership pool (not a qualified pool)?
- [ ] Verify: does assembly have a term length and rotation mechanism?
- [ ] Add `targetSize` formula: `max(9, floor(activeMemberCount * 0.15))`
- [ ] Add `termMonths` (default 6)
- [ ] Add `draw()` method that fills to target size from full membership pool
- [ ] Ensure `AssemblyPage.svelte` shows current members, vacancies, and a draw button
- [ ] Wire assembly draw to `MemberService.getActiveMembers()` not a sortition pool

---

### 3. Add `"referendum"` and `"assembly"` as `ParameterAuthority` values

**Problem:** `Constitution.ts` defines `ParameterAuthority` as `"immutable" | "citizens-assembly" | "council" | "commonwealth"`. The term `"citizens-assembly"` is ambiguous — it predates the three-body model. The referendum is now a distinct instrument.

**Changes to `Constitution.ts`:**

```ts
export type ParameterAuthority =
  | "immutable"
  | "referendum"        // requires community-wide vote
  | "assembly"          // requires assembly vote
  | "council"           // council within its domain
  | "commonwealth";     // commonwealth stewardship (operational)
```

- Migrate existing usages: `"citizens-assembly"` → `"assembly"` or `"referendum"` as appropriate:
  - `bankDemurrageRate` → `"referendum"` (changes monetary policy community-wide)
  - `commonsLevyRate` → `"referendum"`
  - `thresholdSimpleMajority` → `"referendum"` (constitutional)
  - `thresholdSupermajority` → `"referendum"`
  - `thresholdNearConsensus` → `"referendum"`
  - `deliberationPeriodDays` → `"assembly"`
  - `monthlyFoodAllowance` → `"assembly"`

---

### 4. Add an authority map to the Constitution

**Problem:** There is no machine-readable mapping from action class → required governance body. The governance doc defines this as the "authority map" that lives in the constitution and can only be changed by the body that would gain or lose authority.

**New type in `Constitution.ts`:**

```ts
export type GovernanceBody = "council" | "assembly" | "referendum";

export interface ActionAuthority {
  action:       string;          // e.g. "admit-member"
  body:         GovernanceBody;
  description:  string;
}
```

**Initial authority map (add to `DEFAULT_CONSTITUTION`):**

| Action key | Body | Notes |
|---|---|---|
| `admit-member` | `assembly` | |
| `suspend-member` | `assembly` | pending review |
| `exclude-member` | `referendum` | permanent |
| `change-levy-rate` | `referendum` | |
| `change-demurrage-rate` | `referendum` | |
| `change-food-allowance` | `assembly` | |
| `amend-constitution` | `referendum` | supermajority |
| `join-federation` | `referendum` | |
| `leave-federation` | `referendum` | |
| `split-council` | `assembly` | splitting a multi-domain council |
| `allocate-domain-budget` | `assembly` | |
| `declare-domain-emergency` | `council` | assembly ratifies within 72h |
| `change-market-schedule` | `council` | |
| `enact-domain-statute` | `council` | |

The `ConstitutionDocument` record gets an `authorityMap: ActionAuthority[]` field.

The `Constitution` class gets `getRequiredBody(action: string): GovernanceBody | null`.

---

### 5. Seed default councils at startup

**Problem:** Currently `getOrCreateCouncil` is called per-domain individually somewhere in startup (or not at all for new installs). Under the new model, the 6 default councils with their domain groupings should be seeded if no councils exist yet.

**Add to `CouncilService.seedDefaults()`:**

```
Sustenance Council    → food, agriculture, water
Care Council          → healthcare, dependency-care, child-care, deathcare
Infrastructure Council → housing, energy, sanitation, transport
Commons Council       → education, enrichment, communications
Safety Council        → fire, justice
Economy Council       → marketplace, manufacturing, courier
```

Called from `src/index.ts` after `CouncilService.init()`, similar to `CalendarService.seedDefaults()`.

---

### 6. Frontend: Council management page updates

Once items 1 and 5 are complete:

- [ ] Council list page shows councils by name (not domain), with their domain list
- [ ] Council detail shows `name`, `domainIds` as readable domain names, seats, pool link
- [ ] Allow editing council name and domain associations (admin action for now, eventually requires assembly vote)
- [ ] "Split council" action (creates a new council, moves selected domains out)

---

### 7. Frontend: Assembly page audit

Once item 2 is complete:

- [ ] Assembly page shows current members, term end dates, vacancies
- [ ] Shows target size relative to current active member count
- [ ] Draw button fills vacancies from full membership

---

### 8. (Later) Authorization enforcement

The authority map (item 4) and the three bodies give us everything needed to enforce authorization on write actions. This is intentionally deferred — it requires a session/identity concept (who is taking this action?) which the app doesn't have yet.

When that layer arrives, the pattern will be:

1. Before executing a write action, call `Constitution.getInstance().getRequiredBody(action)`
2. Check that the request carries a valid authorization token from that body (a passed referendum ID, an assembly decision record, a council vote record)
3. If not, return 403 with the required body indicated

This is a future phase. Document it here so it doesn't get forgotten.

---

## Order of Work

1. **Item 3** — `ParameterAuthority` rename (tiny, no migrations, unblocks vocabulary elsewhere)
2. **Item 4** — authority map in Constitution (data model only, no behavior yet)
3. **Item 1** — `DomainCouncil` refactor (largest change, touches model + loader + service + controller + frontend)
4. **Item 5** — seed default councils (depends on item 1)
5. **Item 2** — assembly audit and completion
6. **Items 6–7** — frontend updates (depend on 1–5)
7. **Item 8** — authorization enforcement (later, requires identity layer)
