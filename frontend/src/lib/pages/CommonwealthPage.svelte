<script lang="ts">
  interface Summary {
    credits: number;
    fec: number;
  }

  interface DemurrageInfo {
    rate: number;
    lastRun: string | null;
    nextRun: string | null;
    projectedCollection: number;
  }

  let summary: Summary | null = $state(null);
  let demurrage: DemurrageInfo | null = $state(null);
  let loading = $state(true);
  let error: string | null = $state(null);

  async function load() {
    try {
      const [sumRes, demRes] = await Promise.all([
        fetch('/api/commonwealth/summary'),
        fetch('/api/commonwealth/demurrage'),
      ]);
      if (!sumRes.ok) throw new Error(`summary: ${sumRes.status}`);
      if (!demRes.ok) throw new Error(`demurrage: ${demRes.status}`);
      summary = await sumRes.json();
      demurrage = await demRes.json();
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  load();

  function fmt(n: number) {
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
          <div class="stat-label">Credits</div>
          <div class="stat-value">{fmt(summary.credits)}</div>
        </div>
        {#if summary.fec !== 0}
          <div class="stat-card">
            <div class="stat-label">FEC</div>
            <div class="stat-value">{fmt(summary.fec)}</div>
            <div class="stat-sub">federation credits</div>
          </div>
        {/if}
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
          <div class="stat-sub">credits at current balances</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Next Collection</div>
          <div class="stat-value date-value">{fmtDate(demurrage.nextRun)}</div>
          <div class="stat-sub">last run: {fmtDate(demurrage.lastRun)}</div>
        </div>
      </div>
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
</style>
