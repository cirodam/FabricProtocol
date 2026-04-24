<script lang="ts">
  import CommunitySidebar from '../components/CommunitySidebar.svelte';
  import DomainPoolPanel from '../components/DomainPoolPanel.svelte';
  import FunctionalUnitsSection from '../components/FunctionalUnitsSection.svelte';
  const { navigate }: { navigate: (path: string) => void } = $props();

  interface Totals {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number;
    waterL: number;
  }

  let totals: Totals | null = $state(null);
  let monthlyAllowance: number = $state(0);
  let monthlyOutflow: number = $state(0);
  let memberCount: number = $state(0);
  let loading = $state(true);
  let error: string | null = $state(null);

  interface BudgetLineItem { label: string; amount: number; }
  let budgetLineItems = $state<BudgetLineItem[]>([]);
  let budgetTotal = $state(0);

  function fmtKin(n: number) { return n.toLocaleString(undefined, { maximumFractionDigits: 0 }); }

  let editingAllowance = $state(false);
  let allowanceInput: number = $state(0);
  let saving = $state(false);
  let saveError: string | null = $state(null);

  async function load() {
    try {
      const [reqRes, settingsRes, outflowsRes] = await Promise.all([
        fetch('/api/food/requirements'),
        fetch('/api/food/settings'),
        fetch('/api/community/outflows'),
      ]);
      if (!reqRes.ok) throw new Error(`requirements: ${reqRes.status}`);
      if (!settingsRes.ok) throw new Error(`settings: ${settingsRes.status}`);
      if (!outflowsRes.ok) throw new Error(`outflows: ${outflowsRes.status}`);
      totals = await reqRes.json();
      const settings = await settingsRes.json();
      monthlyAllowance = settings.monthlyFoodAllowance;
      monthlyOutflow = settings.monthlyOutflow;
      memberCount = settings.memberCount;
      const outflows = await outflowsRes.json();
      const foodDomain = outflows.payroll.domains.find((d: { handle: string }) => d.handle === 'food');
      budgetLineItems = foodDomain?.lineItems ?? [];
      budgetTotal = foodDomain?.total ?? 0;
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  function startEdit() {
    allowanceInput = monthlyAllowance;
    saveError = null;
    editingAllowance = true;
  }

  function cancelEdit() {
    editingAllowance = false;
    saveError = null;
  }

  async function saveAllowance() {
    saving = true;
    saveError = null;
    try {
      const res = await fetch('/api/food/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthlyFoodAllowance: allowanceInput }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `${res.status}`);
      }
      const data = await res.json();
      monthlyAllowance = data.monthlyFoodAllowance;
      monthlyOutflow = data.monthlyOutflow;
      memberCount = data.memberCount;
      editingAllowance = false;
    } catch (e) {
      saveError = (e as Error).message;
    } finally {
      saving = false;
    }
  }

  load();
</script>

<div class="domain-layout">
<CommunitySidebar {navigate} />
<div class="domain-main">
<div class="page-header">
  <h1>Food</h1>
</div>
<p class="domain-desc">The Food domain is responsible for feeding every community member. It manages the universal monthly food allowance, community kitchens, mills, and other food production infrastructure. The community funds this domain so that no member ever goes hungry for lack of money.</p>


  <DomainPoolPanel domainId="00000000-0000-0000-0000-000000000003" {navigate} />

{#if loading}
  <p class="muted">Loading…</p>
{:else if error}
  <p class="error">{error}</p>
{:else}
  {#if budgetLineItems.length > 0}
  <section class="section">
    <h2>Budget</h2>
    <table class="budget-table">
      <thead><tr><th>Line item</th><th class="num">Kin / mo</th></tr></thead>
      <tbody>
        {#each budgetLineItems as item (item.label)}
          <tr><td>{item.label}</td><td class="num">{fmtKin(item.amount)}</td></tr>
        {/each}
      </tbody>
      <tfoot>
        <tr class="total-row"><td>Total</td><td class="num">{fmtKin(budgetTotal)}</td></tr>
      </tfoot>
    </table>
  </section>
  {/if}
  <section class="section">
    <h2>Monthly Food Allowance</h2>
    <div class="allowance-row">
      {#if editingAllowance}
        <input
          type="number"
          min="0"
          step="1"
          class="allowance-input"
          bind:value={allowanceInput}
        />
        <span class="unit">kin / member / month</span>
        <button class="save-btn" onclick={saveAllowance} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button class="cancel-btn" onclick={cancelEdit} disabled={saving}>Cancel</button>
        {#if saveError}<span class="error">{saveError}</span>{/if}
      {:else}
        <span class="allowance-value">{monthlyAllowance.toLocaleString()}</span>
        <span class="unit">kin / member / month</span>
        <button class="edit-btn" onclick={startEdit}>Edit</button>
      {/if}
    </div>
    <div class="outflow-row">
      <span class="outflow-label">Total monthly outflow</span>
      <span class="outflow-value">{monthlyOutflow.toLocaleString()} kin</span>
      <span class="outflow-sub">({memberCount} members)</span>
    </div>
  </section>

  {#if totals}
    <section class="section">
      <h2>Daily Community Requirements</h2>
      <div class="stats">
        <div class="stat-card">
          <div class="stat-label">Calories</div>
          <div class="stat-value">{totals.calories.toLocaleString()}</div>
          <div class="stat-sub">kcal / day</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Protein</div>
          <div class="stat-value">{totals.proteinG.toLocaleString()}</div>
          <div class="stat-sub">grams / day</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Carbohydrates</div>
          <div class="stat-value">{totals.carbsG.toLocaleString()}</div>
          <div class="stat-sub">grams / day</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Fat</div>
          <div class="stat-value">{totals.fatG.toLocaleString()}</div>
          <div class="stat-sub">grams / day</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Fiber</div>
          <div class="stat-value">{totals.fiberG.toLocaleString()}</div>
          <div class="stat-sub">grams / day</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Water</div>
          <div class="stat-value">{totals.waterL.toFixed(1)}</div>
          <div class="stat-sub">liters / day</div>
        </div>
      </div>
    </section>
  {/if}

      <FunctionalUnitsSection domainId="00000000-0000-0000-0000-000000000003" {navigate} />
    {/if}
</div>
</div>

<style>
  .page-header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 12px;
  }

  h1 { margin: 0; font-size: 22px; font-weight: 600; }

  .domain-desc {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0 0 28px;
    max-width: 680px;
  }

  .section { margin-bottom: 32px; }
  h2 { margin: 0 0 16px; font-size: 16px; font-weight: 600; }

  .budget-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  .budget-table th {
    text-align: left;
    padding: 6px 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
    border-bottom: 1px solid var(--border);
  }
  .budget-table td { padding: 8px 12px; border-bottom: 1px solid var(--border); }
  .budget-table .num { text-align: right; font-variant-numeric: tabular-nums; }
  .budget-table tfoot .total-row td { font-weight: 700; border-top: 2px solid var(--border); border-bottom: none; }

  .allowance-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .allowance-value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
  }

  .allowance-input {
    width: 120px;
    font-size: 20px;
    font-weight: 600;
    padding: 6px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface);
    color: var(--text);
  }

  .unit {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .outflow-row {
    display: flex;
    align-items: baseline;
    gap: 10px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid var(--border);
  }

  .outflow-label {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .outflow-value {
    font-size: 15px;
    font-weight: 600;
  }

  .outflow-sub {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  }

  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
  }

  .stat-label {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 6px;
  }

  .stat-sub {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .edit-btn, .save-btn, .cancel-btn {
    border-radius: var(--radius);
    padding: 6px 14px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  }
  .edit-btn {
    background: none;
    border: 1px solid var(--border);
    color: var(--text-secondary);
  }
  .edit-btn:hover { border-color: var(--text-secondary); color: var(--text); }

  .save-btn {
    background: var(--accent);
    border: none;
    color: #fff;
  }
  .save-btn:disabled { opacity: 0.5; cursor: default; }

  .cancel-btn {
    background: none;
    border: 1px solid var(--border);
    color: var(--text-secondary);
  }
  .cancel-btn:disabled { opacity: 0.5; cursor: default; }
  .cancel-btn:hover:not(:disabled) { color: var(--text); border-color: var(--text-secondary); }

  .muted { color: var(--text-secondary); }
  .error { color: #ef5350; }

  .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
  .section-header h2 { margin: 0; }
</style>
