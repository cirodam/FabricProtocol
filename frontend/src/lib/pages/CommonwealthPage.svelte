<script lang="ts">
  interface Summary {
    kin: number;
  }

  interface DemurrageInfo {
    rate: number;
    lastRun: string | null;
    nextRun: string | null;
    projectedCollection: number;
  }

  interface DomainPayroll { name: string; payroll: number; }
  interface Outflows {
    payroll: { commons: number; domains: DomainPayroll[]; total: number };
    allowances: { total: number; perMember: number };
    monthlyTotal: number;
  }

  let summary: Summary | null = $state(null);
  let demurrage: DemurrageInfo | null = $state(null);
  let outflows: Outflows | null = $state(null);
  let loading = $state(true);
  let error: string | null = $state(null);

  async function load() {
    try {
      const [sumRes, demRes, outRes] = await Promise.all([
        fetch('/api/commonwealth/summary'),
        fetch('/api/commonwealth/demurrage'),
        fetch('/api/commonwealth/outflows'),
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

  function fmtDate(iso: string | null): string {
    if (!iso) return 'Never';
    return new Date(iso).toLocaleString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  function fmtPct(rate: number): string {
    return (rate * 100).toFixed(1) + '%';
  }
</script>

<div class="page-header">
  <h1>Commonwealth</h1>
</div>

{#if loading}
  <p class="muted">Loading…</p>
{:else if error}
  <p class="error">{error}</p>
{:else}
  {#if summary}
    <section class="section">
      <h2>Balance</h2>
      <div class="stats">
        <div class="stat-card">
          <div class="stat-label">Kin</div>
          <div class="stat-value">{fmt(summary.kin)}</div>
        </div>
      </div>
    </section>
  {/if}

  {#if demurrage}
    <section class="section">
      <h2>Commons Levy</h2>
      <p class="section-desc">A monthly charge on all non-exempt credit balances. Funds flow into the Commonwealth to cover community expenses.</p>
      <div class="stats">
        <div class="stat-card">
          <div class="stat-label">Monthly Rate</div>
          <div class="stat-value">{fmtPct(demurrage.rate)}</div>
          <div class="stat-sub">of each member's balance</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Projected Collection</div>
          <div class="stat-value">{fmt(demurrage.projectedCollection)}</div>
          <div class="stat-sub">kin at current balances</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Next Collection</div>
          <div class="stat-value date-value">{fmtDate(demurrage.nextRun)}</div>
          <div class="stat-sub">last run: {fmtDate(demurrage.lastRun)}</div>
        </div>
      </div>
    </section>
  {/if}

  {#if outflows}
    <section class="section">
      <h2>Monthly Outflows</h2>
      <p class="section-desc">Payroll obligations across all functional domains, plus outstanding member allowances.</p>

      <div class="stats" style="margin-bottom: 1.5rem;">
        <div class="stat-card">
          <div class="stat-label">Total Monthly Payroll</div>
          <div class="stat-value">{fmt(outflows.payroll.total)}</div>
          <div class="stat-sub">kin / month</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Outstanding Allowances</div>
          <div class="stat-value">{fmt(outflows.allowances.total)}</div>
          <div class="stat-sub">{fmt(outflows.allowances.perMember)} kin per member</div>
        </div>
      </div>

      <table class="outflows-table">
        <thead>
          <tr>
            <th>Domain</th>
            <th class="num">Monthly payroll</th>
          </tr>
        </thead>
        <tbody>
          {#if outflows.payroll.commons > 0}
            <tr>
              <td>Commonwealth (governance)</td>
              <td class="num">{fmt(outflows.payroll.commons)}</td>
            </tr>
          {/if}
          {#each outflows.payroll.domains as d (d.name)}
            <tr>
              <td>{d.name}</td>
              <td class="num">{#if d.payroll > 0}{fmt(d.payroll)}{:else}<span class="muted">—</span>{/if}</td>
            </tr>
          {/each}
          {#if outflows.payroll.domains.length === 0 && outflows.payroll.commons === 0}
            <tr><td colspan="2" class="muted">No payroll roles assigned yet.</td></tr>
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
{/if}

<style>
  .page-header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 24px;
  }

  h1 { margin: 0; font-size: 22px; font-weight: 600; }

  .section { margin-bottom: 32px; }
  h2 { margin: 0 0 6px; font-size: 16px; font-weight: 600; }

  .section-desc {
    font-size: 13px;
    color: var(--text-secondary);
    margin: 0 0 16px;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
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

  .date-value {
    font-size: 15px;
    line-height: 1.4;
  }

  .stat-sub {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .muted { color: var(--text-secondary); }
  .error { color: #ef5350; }

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
