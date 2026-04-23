<script lang="ts">
  import CommunitySidebar from '../components/CommunitySidebar.svelte';
  import CentralBankPage from './CentralBankPage.svelte';
  import CurrencyBoardPage from './CurrencyBoardPage.svelte';

  const { navigate, path }: { navigate: (to: string) => void; path: string } = $props();

  interface Summary { kin: number; }
  interface DemurrageInfo {
    rate: number;
    taxableSupply: number;
    floor: number;
    projectedCollection: number;
    lastRun: string | null;
    nextRun: string | null;
  }
  interface BudgetLineItem { label: string; amount: number; }
  interface DomainBudget { lineItems: BudgetLineItem[]; total: number; }
  interface Outflows {
    payroll: {
      commons: DomainBudget;
      domains: ({ name: string; handle: string } & DomainBudget)[];
      total: number;
    };
  }

  const DOMAIN_PAGES = new Set(['food', 'housing', 'healthcare', 'education', 'provisioning', 'communications']);

  let summary: Summary | null = $state(null);
  let demurrage: DemurrageInfo | null = $state(null);
  let outflows: Outflows | null = $state(null);
  let loading = $state(true);
  let error: string | null = $state(null);

  async function load() {
    try {
      const [sumRes, demRes, outRes] = await Promise.all([
        fetch('/api/community/summary'),
        fetch('/api/community/demurrage'),
        fetch('/api/community/outflows'),
      ]);
      if (!sumRes.ok) throw new Error(`summary: ${sumRes.status}`);
      if (!demRes.ok) throw new Error(`demurrage: ${demRes.status}`);
      if (!outRes.ok) throw new Error(`outflows: ${outRes.status}`);
      summary   = await sumRes.json();
      demurrage = await demRes.json();
      outflows  = await outRes.json();
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  load();

  function fmt(n: number | null | undefined) {
    if (n == null) return '—';
    return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  function fmtPct(rate: number): string {
    return (rate * 100).toFixed(3) + '%';
  }
</script>

<div class="domain-layout">
  <CommunitySidebar {navigate} {path} />

  {#if path === '/community/central-bank'}
    <CentralBankPage {navigate} />
  {:else if path === '/community/currency-board'}
    <CurrencyBoardPage {navigate} />
  {:else}
  <div class="domain-main">
    <div class="page-header">
      <h1>Community Budget</h1>
    </div>

    {#if loading}
      <p class="muted">Loading…</p>
    {:else if error}
      <p class="error">{error}</p>
    {:else if outflows && demurrage && summary}

      <!-- STAT CARDS -->
      <div class="stat-row">
        <div class="stat-card">
          <div class="stat-label">Community Balance</div>
          <div class="stat-value">{fmt(summary.kin)}</div>
          <div class="stat-sub">kin in community fund</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Monthly Outflows</div>
          <div class="stat-value">{fmt(outflows.payroll.total)}</div>
          <div class="stat-sub">total payroll obligations</div>
        </div>
        <div class="stat-card accent">
          <div class="stat-label">Dues Rate</div>
          <div class="stat-value">{demurrage.rate === 0 ? '0%' : fmtPct(demurrage.rate)}</div>
          <div class="stat-sub">of taxable balances, collected monthly</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Dues Base</div>
          <div class="stat-value">{fmt(demurrage.taxableSupply)}</div>
          <div class="stat-sub">kin above {fmt(demurrage.floor)}-kin floor subject to dues</div>
        </div>
      </div>

      <p class="levy-explanation">
        {#if outflows.payroll.total === 0}
          No budget is set. Community dues are <strong>0%</strong> — nothing will be collected this month.
        {:else}
          Dues are derived from the budget: <strong>{fmt(outflows.payroll.total)} kin</strong> needed
          ÷ <strong>{fmt(demurrage.taxableSupply)} kin</strong> taxable (balances above the {fmt(demurrage.floor)}-kin floor)
          = <strong>{fmtPct(demurrage.rate)}</strong> collected automatically each month.
        {/if}
      </p>

      <!-- OUTFLOWS TABLE -->
      <section class="budget-section">
        <h2>Monthly Outflows</h2>
        <p class="section-desc">Monthly obligations the community fund must meet, organised by domain. The dues rate adjusts automatically to cover these exactly.</p>

        {#if outflows.payroll.total === 0}
          <p class="muted">No payroll roles assigned yet. The levy rate will be 0%.</p>
        {:else}
          <table class="domain-table">
            <thead>
              <tr>
                <th>Domain</th>
                <th class="num">Kin / mo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {#if outflows.payroll.commons.total > 0}
                <tr>
                  <td>Community (governance)</td>
                  <td class="num">{fmt(outflows.payroll.commons.total)}</td>
                  <td></td>
                </tr>
              {/if}
              {#each outflows.payroll.domains as d (d.name)}
                {#if d.total > 0}
                  <tr>
                    <td>{d.name}</td>
                    <td class="num">{fmt(d.total)}</td>
                    <td class="view-cell">
                      {#if DOMAIN_PAGES.has(d.handle)}
                        <button class="view-link" onclick={() => navigate(`/${d.handle}`)}>View →</button>
                      {/if}
                    </td>
                  </tr>
                {/if}
              {/each}
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td>Total</td>
                <td class="num">{fmt(outflows.payroll.total)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        {/if}
      </section>

    {/if}
  </div>
  {/if}
</div>

<style>
  .page-header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 24px;
  }

  h1 { margin: 0; font-size: 22px; font-weight: 600; }

  .stat-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 20px;
  }

  .stat-card {
    background: var(--surface-2, #f5f5f5);
    border: 1px solid var(--border, #e0e0e0);
    border-radius: 8px;
    padding: 16px;
  }

  .stat-card.accent {
    background: var(--surface-accent, #f0f4ff);
    border-color: var(--border-accent, #c5cfe8);
  }

  .stat-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
    margin-bottom: 4px;
  }

  .stat-value { font-size: 22px; font-weight: 700; margin-bottom: 2px; }
  .stat-sub { font-size: 11px; color: var(--text-secondary); }

  .levy-explanation {
    font-size: 13px;
    color: var(--text-secondary);
    margin: 0 0 28px;
    line-height: 1.6;
  }

  .levy-explanation strong { color: var(--text-primary, inherit); }

  .budget-section { min-width: 0; }
  h2 { margin: 0 0 6px; font-size: 16px; font-weight: 600; }

  .section-desc {
    font-size: 13px;
    color: var(--text-secondary);
    margin: 0 0 16px;
  }

  .muted { color: var(--text-secondary); }
  .error { color: #ef5350; }

  .domain-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  .domain-table th {
    text-align: left;
    padding: 6px 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
    border-bottom: 1px solid var(--border);
  }
  .domain-table td {
    padding: 10px 12px;
    border-bottom: 1px solid var(--border);
  }
  .domain-table .num { text-align: right; font-variant-numeric: tabular-nums; }
  .domain-table tfoot .total-row td {
    font-weight: 700;
    border-top: 2px solid var(--border);
    border-bottom: none;
  }
  .view-cell { text-align: right; width: 80px; }
  .view-link {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 13px;
    color: var(--accent, #2563eb);
    padding: 0;
  }
  .view-link:hover { text-decoration: underline; }
</style>

