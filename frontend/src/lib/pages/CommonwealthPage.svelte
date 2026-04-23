<script lang="ts">
  import CommunitySidebar from '../components/CommunitySidebar.svelte';
  import CentralBankPage from './CentralBankPage.svelte';
  import CurrencyBoardPage from './CurrencyBoardPage.svelte';

  const { navigate, path }: { navigate: (to: string) => void; path: string } = $props();

  interface Summary { kin: number; }
  interface DemurrageInfo {
    rate: number;
    taxableSupply: number;
    projectedCollection: number;
    lastRun: string | null;
    nextRun: string | null;
  }
  interface DomainPayroll { name: string; payroll: number; }
  interface Outflows {
    payroll: { foodAllowance: number; commons: number; domains: DomainPayroll[]; total: number };
  }

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
          <div class="stat-label">Commons Balance</div>
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
          <div class="stat-sub">of all member balances, collected monthly</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Dues Base</div>
          <div class="stat-value">{fmt(demurrage.taxableSupply)}</div>
          <div class="stat-sub">total kin subject to dues</div>
        </div>
      </div>

      <p class="levy-explanation">
        {#if outflows.payroll.total === 0}
          No budget is set. Community dues are <strong>0%</strong> — nothing will be collected this month.
        {:else}
          Dues are derived from the budget: <strong>{fmt(outflows.payroll.total)} kin</strong> needed
          ÷ <strong>{fmt(demurrage.taxableSupply)} kin</strong> in member balances
          = <strong>{fmtPct(demurrage.rate)}</strong> collected automatically from all member accounts each month.
        {/if}
      </p>

      <!-- OUTFLOWS TABLE -->
      <section class="budget-section">
        <h2>Payroll</h2>
        <p class="section-desc">Monthly obligations the commons fund must meet. The dues rate adjusts automatically to cover these exactly.</p>

        <table class="outflows-table">
          <thead>
            <tr>
              <th>Domain</th>
              <th class="num">Monthly payroll (kin)</th>
            </tr>
          </thead>
          <tbody>
            {#if outflows.payroll.foodAllowance > 0}
              <tr class="allowance-row">
                <td>Food allowance <span class="muted-inline">(universal, all members)</span></td>
                <td class="num">{fmt(outflows.payroll.foodAllowance)}</td>
              </tr>
            {/if}
            {#if outflows.payroll.commons > 0}
              <tr>
                <td>Community (governance)</td>
                <td class="num">{fmt(outflows.payroll.commons)}</td>
              </tr>
            {/if}
            {#each outflows.payroll.domains as d (d.name)}
              <tr>
                <td>{d.name}</td>
                <td class="num">{#if d.payroll > 0}{fmt(d.payroll)}{:else}<span class="muted">—</span>{/if}</td>
              </tr>
            {/each}
            {#if outflows.payroll.foodAllowance === 0 && outflows.payroll.domains.length === 0 && outflows.payroll.commons === 0}
              <tr><td colspan="2" class="muted">No payroll roles assigned yet. The levy rate will be 0%.</td></tr>
            {/if}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td>Total</td>
              <td class="num">{fmt(outflows.payroll.total)}</td>
            </tr>
          </tfoot>
        </table>
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
  .muted-inline { font-size: 12px; color: var(--text-secondary); }
  .error { color: #ef5350; }

  .allowance-row td { font-weight: 500; }

  .outflows-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  .outflows-table th {
    text-align: left;
    padding: 6px 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
    border-bottom: 1px solid var(--border);
  }
  .outflows-table td {
    padding: 8px 12px;
    border-bottom: 1px solid var(--border);
  }
  .outflows-table .num { text-align: right; font-variant-numeric: tabular-nums; }
  .outflows-table tfoot .total-row td {
    font-weight: 700;
    border-top: 2px solid var(--border);
    border-bottom: none;
  }
</style>

