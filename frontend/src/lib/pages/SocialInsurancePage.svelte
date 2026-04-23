<script lang="ts">
  import CommunitySidebar from '../components/CommunitySidebar.svelte';

  const { navigate, path }: { navigate: (to: string) => void; path: string } = $props();

  interface Summary {
    poolBalance: number;
    retirementAge: number;
    payoutRate: number;
    totalMembers: number;
    workingMembers: number;
    retiredMembers: number;
    monthlyInflow: number;
    monthlyOutflow: number;
    netMonthlyFlow: number;
    perRetireeMonthly: number;
  }

  let summary: Summary | null = $state(null);
  let loading = $state(true);
  let error: string | null = $state(null);

  async function load() {
    try {
      const res = await fetch('/api/social-insurance/summary');
      if (!res.ok) throw new Error(`social-insurance: ${res.status}`);
      summary = await res.json();
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  load();

  function fmt(n: number | null | undefined) {
    if (n == null) return '—';
    return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }

  function fmtRate(n: number) {
    return (n * 100).toFixed(2) + '%';
  }
</script>

<div class="community-layout">
  <CommunitySidebar {navigate} {path} />
  <div class="domain-main">
    <div class="page-header">
      <h1>Social Insurance</h1>
    </div>

    <p class="intro">
      The social insurance pool holds each member's accumulated back-debt — one person-year of kin minted
      on each birthday. The pool is exempt from demurrage and does not circulate. When a member retires,
      they receive a monthly share of the pool. When a member dies, their unspent entitlement is burned,
      keeping the money supply proportional to the living population.
    </p>

    {#if loading}
      <p class="muted">Loading…</p>
    {:else if error}
      <p class="error">{error}</p>
    {:else if summary}
      <h2>Pool</h2>
      <p class="section-desc">The retirement pool is the community's aggregate demographic liability — held in reserve until members retire.</p>
      <div class="stats">
        <div class="stat-card">
          <div class="stat-label">Pool Balance</div>
          <div class="stat-value">{fmt(summary.poolBalance)}</div>
          <div class="stat-sub">kin in reserve</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Payout Rate</div>
          <div class="stat-value">{fmtRate(summary.payoutRate)}</div>
          <div class="stat-sub">of pool per month</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Retirement Age</div>
          <div class="stat-value">{summary.retirementAge}</div>
          <div class="stat-sub">years</div>
        </div>
      </div>

      <h2>Population</h2>
      <p class="section-desc">Monthly birthday deposits come from every living member — working and retired alike.</p>
      <div class="stats">
        <div class="stat-card">
          <div class="stat-label">Total Members</div>
          <div class="stat-value">{summary.totalMembers}</div>
          <div class="stat-sub">all ages</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Working Age</div>
          <div class="stat-value">{summary.workingMembers}</div>
          <div class="stat-sub">under {summary.retirementAge}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Drawing from Pool</div>
          <div class="stat-value">{summary.retiredMembers}</div>
          <div class="stat-sub">retired or disabled</div>
        </div>
      </div>

      <h2>Monthly Flow</h2>
      <p class="section-desc">
        The pool is self-sustaining as long as inflow exceeds outflow.
        Because payouts are a fixed percentage of the pool balance, the pool degrades
        gradually rather than collapsing — and the community can adjust the payout rate by referendum.
      </p>
      <div class="stats">
        <div class="stat-card">
          <div class="stat-label">Inflow</div>
          <div class="stat-value">+{fmt(summary.monthlyInflow)}</div>
          <div class="stat-sub">birthday deposits / mo</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Outflow</div>
          <div class="stat-value">−{fmt(summary.monthlyOutflow)}</div>
          <div class="stat-sub">retirement payments / mo</div>
        </div>
        <div class="stat-card {summary.netMonthlyFlow >= 0 ? '' : 'warn'}">
          <div class="stat-label">Net</div>
          <div class="stat-value">{summary.netMonthlyFlow >= 0 ? '+' : ''}{fmt(summary.netMonthlyFlow)}</div>
          <div class="stat-sub">{summary.netMonthlyFlow >= 0 ? 'pool growing' : 'pool shrinking'}</div>
        </div>
        {#if summary.retiredMembers > 0}
          <div class="stat-card">
            <div class="stat-label">Per Retiree</div>
            <div class="stat-value">{fmt(summary.perRetireeMonthly)}</div>
            <div class="stat-sub">kin / month</div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .community-layout { display: flex; height: 100%; }
  .domain-main { flex: 1; min-width: 0; overflow-y: auto; padding: 24px; }

  .page-header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 24px;
  }

  h1 { margin: 0; font-size: 22px; font-weight: 600; }
  h2 { margin: 32px 0 4px; font-size: 16px; font-weight: 600; }

  .intro {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;
    max-width: 680px;
    margin: 0 0 32px;
  }

  .section-desc {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.6;
    max-width: 680px;
    margin: 0 0 16px;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
    margin-bottom: 8px;
  }

  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
  }

  .stat-card.warn { border-color: #f59e0b; }

  .stat-label {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    margin-bottom: 8px;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    margin-bottom: 4px;
  }

  .stat-card.warn .stat-value { color: #b45309; }

  .stat-sub {
    font-size: 12px;
    color: var(--text-muted);
  }

  .muted { color: var(--text-muted); }
  .error { color: #ef4444; }
</style>
