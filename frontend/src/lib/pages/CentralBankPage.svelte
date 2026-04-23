<script lang="ts">
  const { navigate }: { navigate: (path: string) => void } = $props();

  interface MoneySupply {
    moneyInCirculation: number;
    desiredMoneyInCirculation: number;
    unrecoveredKin: number;
    retirementPool: number;
    activeCirculation: number;
  }

  interface Member {
    id: string;
    birthDate: string;
    personYears: number;
  }

  let supply: MoneySupply | null = $state(null);
  let population = $state(0);
  let totalPersonYears = $state(0);
  let averageAge = $state(0);
  let loading = $state(true);
  let error: string | null = $state(null);

  async function load() {
    try {
      const [supplyRes, membersRes] = await Promise.all([
        fetch('/api/money-supply'),
        fetch('/api/members'),
      ]);
      if (!supplyRes.ok) throw new Error(`money-supply: ${supplyRes.status}`);
      if (!membersRes.ok) throw new Error(`members: ${membersRes.status}`);
      supply = await supplyRes.json();
      const members: Member[] = await membersRes.json();
      population = members.length;
      totalPersonYears = members.reduce((sum, m) => sum + (m.personYears ?? 0), 0);
      if (members.length > 0) {
        const now = Date.now();
        const totalAge = members.reduce((sum, m) => {
          const age = (now - new Date(m.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
          return sum + age;
        }, 0);
        averageAge = totalAge / members.length;
      }
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
</script>

<div class="domain-main">
<div class="page-header">
  <h1>Central Bank</h1>
</div>

<p class="intro">
  The central bank manages the community's currency supply. Unlike a conventional bank, it does not lend money or earn interest.
  Its only function is to issue kin — one person-year's worth — to each member as they join and accumulate time in the community,
  and to recover unspent kin when a member departs. The money supply is therefore anchored directly to the size and longevity of
  the community itself.
</p>

{#if loading}
  <p class="muted">Loading…</p>
{:else if error}
  <p class="error">{error}</p>
{:else if supply}
  <h2>Currency Supply</h2>
  <p class="section-desc">How much kin is in circulation, what the community's target supply is, and whether any kin is outstanding from departed members.</p>
  <div class="stats">
    <div class="stat-card">
      <div class="stat-label">In Circulation</div>
      <div class="stat-value">{fmt(supply.moneyInCirculation)}</div>
      <div class="stat-sub">total kin issued and unburned</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Active Circulation</div>
      <div class="stat-value">{fmt(supply.activeCirculation)}</div>
      <div class="stat-sub">kin available to spend</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Retirement Pool</div>
      <div class="stat-value">{fmt(supply.retirementPool)}</div>
      <div class="stat-sub">deferred; exempt from demurrage</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Target Supply</div>
      <div class="stat-value">{fmt(supply.desiredMoneyInCirculation)}</div>
      <div class="stat-sub">sum of all active endowments</div>
    </div>
    <div class="stat-card {supply.unrecoveredKin > 0 ? 'warn' : ''}">
      <div class="stat-label">Unrecovered</div>
      <div class="stat-value">{fmt(supply.unrecoveredKin)}</div>
      <div class="stat-sub">from departed members</div>
    </div>
  </div>

  <h2>Population</h2>
  <p class="section-desc">The money supply is a function of who is here. These figures show the demographic foundation the currency is built on.</p>
  <div class="stats">
    <div class="stat-card">
      <div class="stat-label">Members</div>
      <div class="stat-value">{population}</div>
      <div class="stat-sub">current population</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Person-Years</div>
      <div class="stat-value">{fmt(Math.floor(totalPersonYears))}</div>
      <div class="stat-sub">total lived experience</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Average Age</div>
      <div class="stat-value">{population > 0 ? fmt(averageAge) : '—'}</div>
      <div class="stat-sub">years</div>
    </div>
  </div>

  <h2>Demurrage</h2>
  <p class="section-desc">
    The money supply expands as the population grows and contracts as it shrinks — inflation and deflation are a
    natural consequence of community size, not monetary mismanagement. Demurrage is a periodic holding fee deducted
    from balances. At a minimum it is used to bring circulation back in line with the target when the supply runs high.
    The community can also choose to run a higher demurrage rate, with the collected kin flowing into a common fund
    to support collective needs — a community kitchen, for example.
  </p>
{/if}
</div>

<style>
  .domain-main { flex: 1; min-width: 0; overflow-y: auto; padding: 24px; }
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

  .muted { color: var(--text-muted); }
  .error { color: #ef4444; }

  .intro {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;
    max-width: 680px;
    margin: 0 0 32px;
  }

  h2 { margin: 0 0 4px; font-size: 16px; font-weight: 600; }

  .section-desc {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.6;
    max-width: 680px;
    margin: 0 0 16px;
  }
</style>
