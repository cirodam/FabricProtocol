<script lang="ts">
  const { navigate }: { navigate: (to: string) => void } = $props();

  interface Settlement {
    at: string;
    kithe: number;
    partnerId: string;
    memo: string;
  }

  interface CurrencyBoardData {
    kitheReserve: number;
    kinIssued: number;
    backingRatio: number;
    netPosition: number;
    inboundTotal: number;
    outboundTotal: number;
    settlements: Settlement[];
  }

  let data: CurrencyBoardData | null = $state(null);
  let loading = $state(true);
  let error: string | null = $state(null);

  async function load() {
    try {
      const res = await fetch('/api/currency-board');
      if (!res.ok) throw new Error(`${res.status}`);
      data = await res.json();
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  load();

  function fmt(n: number | null | undefined) {
    if (n == null) return '—';
    return n.toLocaleString(undefined, { maximumFractionDigits: 4 });
  }

  function fmtDate(iso: string): string {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  function backingColor(ratio: number): string {
    if (ratio >= 0.99) return 'good';
    if (ratio >= 0.90) return 'warn';
    return 'bad';
  }
</script>

<div class="domain-main">
    <div class="page-header">
      <h1>Currency Board</h1>
      <span class="muted">Balance of payments and reserve position</span>
    </div>

    {#if loading}
      <p class="muted">Loading…</p>
    {:else if error}
      <p class="error">{error}</p>
    {:else if data}

      <!-- RESERVE POSITION CARDS -->
      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-label">Kithe Reserve</div>
          <div class="stat-value">{fmt(data.kitheReserve)}</div>
          <div class="stat-sub">kithe held for the community</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Kin Issued</div>
          <div class="stat-value">{fmt(data.kinIssued)}</div>
          <div class="stat-sub">kin backed by the reserve</div>
        </div>
        <div class="stat-card" class:good={backingColor(data.backingRatio) === 'good'}
                               class:warn={backingColor(data.backingRatio) === 'warn'}
                               class:bad={backingColor(data.backingRatio) === 'bad'}>
          <div class="stat-label">Backing Ratio</div>
          <div class="stat-value">{(data.backingRatio * 100).toFixed(1)}%</div>
          <div class="stat-sub">kithe / (kin ÷ exchange rate)</div>
        </div>
        <div class="stat-card" class:surplus={data.netPosition >= 0} class:deficit={data.netPosition < 0}>
          <div class="stat-label">Net Trade Position</div>
          <div class="stat-value">{data.netPosition >= 0 ? '+' : ''}{fmt(data.netPosition)}</div>
          <div class="stat-sub">{data.netPosition >= 0 ? 'net inflow from other communities' : 'net outflow to other communities'}</div>
        </div>
      </div>

      <!-- BALANCE OF PAYMENTS SUMMARY -->
      <section class="bop-section">
        <h2>Balance of Payments</h2>
        <p class="section-desc">
          All trade with other communities settles in kithe through this board.
          Inbound kithe arrives when another community pays for goods or services we provided;
          outbound kithe leaves when we pay for imports.
        </p>
        <div class="bop-row">
          <div class="bop-card inbound-card">
            <div class="bop-label">Total Inbound</div>
            <div class="bop-amount">+{fmt(data.inboundTotal)} <span class="unit">kithe</span></div>
          </div>
          <div class="bop-divider">—</div>
          <div class="bop-card outbound-card">
            <div class="bop-label">Total Outbound</div>
            <div class="bop-amount">−{fmt(data.outboundTotal)} <span class="unit">kithe</span></div>
          </div>
          <div class="bop-divider">=</div>
          <div class="bop-card net-card" class:surplus={data.netPosition >= 0} class:deficit={data.netPosition < 0}>
            <div class="bop-label">Net</div>
            <div class="bop-amount">
              {data.netPosition >= 0 ? '+' : ''}{fmt(data.netPosition)} <span class="unit">kithe</span>
            </div>
          </div>
        </div>
      </section>

      <!-- SETTLEMENT HISTORY -->
      <section class="bop-section">
        <h2>Settlement History</h2>
        {#if data.settlements.length === 0}
          <p class="muted">No inter-community settlements recorded yet.</p>
        {:else}
          <table class="settlements-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Partner Community</th>
                <th>Direction</th>
                <th class="num">Kithe</th>
                <th>Memo</th>
              </tr>
            </thead>
            <tbody>
              {#each data.settlements as s (s.at + s.partnerId + s.kithe)}
                <tr>
                  <td class="date-cell">{fmtDate(s.at)}</td>
                  <td>{s.partnerId}</td>
                  <td>
                    {#if s.kithe > 0}
                      <span class="badge inbound">Inbound</span>
                    {:else}
                      <span class="badge outbound">Outbound</span>
                    {/if}
                  </td>
                  <td class="num" class:pos={s.kithe > 0} class:neg={s.kithe < 0}>
                    {s.kithe > 0 ? '+' : ''}{fmt(s.kithe)}
                  </td>
                  <td class="memo-cell">{s.memo || '—'}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}
      </section>

    {/if}
</div>

<style>
  .page-header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 28px;
  }
  h1 { margin: 0; font-size: 22px; font-weight: 600; }
  .muted { color: var(--text-secondary); font-size: 13px; }

  /* STAT GRID */
  .stat-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 36px;
  }

  .stat-card {
    background: var(--surface-2, #f5f5f5);
    border-radius: 8px;
    padding: 16px;
    border: 1px solid var(--border, #e0e0e0);
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

  .stat-card.surplus .stat-value { color: var(--color-green, #2e7d32); }
  .stat-card.deficit .stat-value { color: var(--color-red, #c62828); }
  .stat-card.good .stat-value    { color: var(--color-green, #2e7d32); }
  .stat-card.warn .stat-value    { color: var(--color-amber, #e65100); }
  .stat-card.bad .stat-value     { color: var(--color-red, #c62828); }

  /* BALANCE OF PAYMENTS */
  .bop-section { margin-bottom: 36px; }
  h2 { margin: 0 0 6px; font-size: 16px; font-weight: 600; }
  .section-desc { font-size: 13px; color: var(--text-secondary); margin: 0 0 16px; }

  .bop-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .bop-card {
    flex: 1;
    background: var(--surface-2, #f5f5f5);
    border: 1px solid var(--border, #e0e0e0);
    border-radius: 8px;
    padding: 14px 18px;
  }

  .bop-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
    margin-bottom: 4px;
  }
  .bop-amount { font-size: 20px; font-weight: 700; }
  .unit { font-size: 12px; font-weight: 400; color: var(--text-secondary); }

  .inbound-card .bop-amount { color: var(--color-green, #2e7d32); }
  .outbound-card .bop-amount { color: var(--color-red, #c62828); }
  .net-card.surplus .bop-amount { color: var(--color-green, #2e7d32); }
  .net-card.deficit .bop-amount { color: var(--color-red, #c62828); }

  .bop-divider {
    font-size: 20px;
    color: var(--text-secondary);
    flex: 0;
    padding: 0 4px;
  }

  /* SETTLEMENT TABLE */
  .settlements-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }

  .settlements-table th,
  .settlements-table td {
    padding: 8px 12px;
    text-align: left;
    border-bottom: 1px solid var(--border, #e0e0e0);
  }

  .settlements-table th {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
    background: var(--surface-2, #f5f5f5);
  }

  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .pos { color: var(--color-green, #2e7d32); font-weight: 600; }
  .neg { color: var(--color-red, #c62828); font-weight: 600; }

  .date-cell { white-space: nowrap; color: var(--text-secondary); }
  .memo-cell { color: var(--text-secondary); font-style: italic; }

  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .badge.inbound  { background: #e8f5e9; color: #2e7d32; }
  .badge.outbound { background: #ffebee; color: #c62828; }

  .error { color: var(--color-red, #c62828); }
</style>
