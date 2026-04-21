# External Resources

## Core Idea: Dollars as a Resource, Not a Foundation

Dollars (and other external currencies) are treated as a resource like any other — wheat, labor, tools, space. They have no privileged status in the system. There is no hard exchange rate baked in.

When the community accepts dollars, it is accepting undifferentiated potential that governance then decides how to deploy. The conversion from dollars to kin is a deliberate community act, not an automatic market mechanism.

As the dollar economy becomes less reliable over time, the community simply draws on that resource less. It becomes one input among many rather than the thing everything is priced against.

Think of dollars as stem cells: undifferentiated potential. The community takes them in and decides what to grow from them — kin, food, tools, space, care. The conversion is a governance act. The dollar itself is inert until the community gives it direction.

---

## Model

### Dollar holdings
- Tracked as an `Asset` on the `Commons` (or a `FunctionalDomain`) with `unit: "USD"` (new `AssetUnit` entry)
- Quantity reflects actual dollars held in an external account
- No `"usd"` currency type in the `Bank` — dollars never enter the internal credit system directly

### Contributions (on-ramp)
- A member pays a real-world dollar expense on behalf of the community (rent, bulk food, utilities, equipment)
- Or donates dollars to the community pool
- Governance approves the contribution and decides how many kin to issue in return
- Kin are issued via `CentralBank.issueEndowment()` or a one-time Commons transfer — the rate is set by the proposal, not the system
- The Commons asset quantity increases by the dollar amount received

### External expenses (consumption)
- The community has dollar-denominated obligations: rent, utilities, insurance, bulk purchasing
- Modeled as `ExternalExpense` records: description, amount (USD), due date, paid by (memberId or null)
- When paid, the Commons dollar asset quantity decreases accordingly
- Members who cover expenses are reimbursed in kin per the governance-approved rate

### Off-ramp
- Not supported by default — kin are not redeemable for dollars
- Could be enabled by governance as a time-delayed, approval-gated process if needed

---

## Implementation Notes (when ready)

- Add `USD = "USD"` to `AssetUnit` enum in `Asset.ts`
- Add `ExternalExpense` class: `id`, `description`, `amountUsd`, `dueDate`, `paidByMemberId | null`, `paidAt | null`
- Commons (or a domain) tracks `externalExpenses: ExternalExpense[]`
- GovernanceService gets `approveContribution(memberId, amountUsd, kinIssued, proposalId)` — increases asset, issues kin
- GovernanceService gets `recordExpensePaid(expenseId, memberId, proposalId)` — decreases asset, issues reimbursement kin
