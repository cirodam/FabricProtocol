<script lang="ts">
  const { navigate }: { navigate: (path: string) => void } = $props();

  interface MoneySupply {
    moneyInCirculation: number;
    desiredMoneyInCirculation: number;
    unrecoveredCredits: number;
  }

  interface Endowment {
    memberId: string;
    memberName: string;
    handle: string;
    endowment: number;
  }

  let supply: MoneySupply | null = $state(null);
  let endowments: Endowment[] = $state([]);
  let loading = $state(true);
  let error: string | null = $state(null);

  async function load() {
    try {
      const [supplyRes, endowRes] = await Promise.all([
        fetch('/api/money-supply'),
        fetch('/api/endowments'),
      ]);
      if (!supplyRes.ok) throw new Error(`money-supply: ${supplyRes.status}`);
      if (!endowRes.ok) throw new Error(`endowments: ${endowRes.status}`);
      supply = await supplyRes.json();
      endowments = await endowRes.json();
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
</script>

<div class="page-header">
  <h1>Central Bank</h1>
</div>

{#if loading}
  <p class="muted">Loading…</p>
{:else if error}
  <p class="error">{error}</p>
{:else if supply}
  <div class="stats">
    <div class="stat-card">
      <div class="stat-label">In Circulation</div>
      <div class="stat-value">{fmt(supply.moneyInCirculation)}</div>
      <div class="stat-sub">credits currently held by members</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Target Supply</div>
      <div class="stat-value">{fmt(supply.desiredMoneyInCirculation)}</div>
      <div class="stat-sub">sum of all active endowments</div>
    </div>
    <div class="stat-card {supply.unrecoveredCredits > 0 ? 'warn' : ''}">
      <div class="stat-label">Unrecovered</div>
      <div class="stat-value">{fmt(supply.unrecoveredCredits)}</div>
      <div class="stat-sub">from departed members</div>
    </div>
  </div>

  {#if endowments.length > 0}
    <h2>Member Endowments</h2>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Member</th>
            <th class="num">Endowment</th>
          </tr>
        </thead>
        <tbody>
          {#each endowments as e (e.memberId)}
            <tr>
              <td>
                <button class="link-btn" onclick={() => navigate(`/members/${e.memberId}`)}>
                  {e.memberName}
                </button>
                <span class="handle muted">@{e.handle}</span>
              </td>
              <td class="num">{fmt(e.endowment)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
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
  h2 { margin: 32px 0 12px; font-size: 16px; font-weight: 600; }

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
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

  .table-wrap {
    overflow-x: auto;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface);
  }

  table { width: 100%; border-collapse: collapse; }

  th {
    text-align: left;
    padding: 10px 16px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    border-bottom: 1px solid var(--border);
  }

  td {
    padding: 10px 16px;
    border-bottom: 1px solid var(--border);
    font-size: 14px;
  }

  tr:last-child td { border-bottom: none; }
  tr:hover td { background: color-mix(in srgb, var(--accent) 4%, transparent); }

  .num { text-align: right; font-variant-numeric: tabular-nums; }

  .link-btn {
    background: none;
    border: none;
    padding: 0;
    color: var(--accent);
    font-size: 14px;
    cursor: pointer;
  }

  .link-btn:hover { text-decoration: underline; }

  .handle { font-family: monospace; font-size: 13px; margin-left: 6px; }

  .muted { color: var(--text-muted); }
  .error { color: #ef4444; }
</style>
