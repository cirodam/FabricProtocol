<script lang="ts">
  const { id, navigate } = $props<{ id: string; navigate: (to: string) => void }>();

  interface Account {
    id: string;
    ownerId: string;
    label: string;
    kin: number;
    allowNegativeKin: boolean;
    exemptFromDemurrage: boolean;
    createdAt: string;
  }

  interface Member {
    id: string;
    firstName: string;
    lastName: string;
    handle: string;
  }

  interface DemurrageSchedule {
    rate: number;
    lastRun: string | null;
    nextRun: string | null;
    intervalMs: number | null;
  }

  let account: Account | null = $state(null);
  let owner: Member | null = $state(null);
  let schedule: DemurrageSchedule | null = $state(null);
  let loading = $state(true);
  let error: string | null = $state(null);

  async function load() {
    try {
      const [acctRes, schedRes] = await Promise.all([
        fetch(`/api/account/${id}`),
        fetch('/api/demurrage-schedule'),
      ]);
      if (!acctRes.ok) throw new Error(`Account ${acctRes.status}: ${acctRes.statusText}`);
      account = await acctRes.json();
      schedule = schedRes.ok ? await schedRes.json() : null;

      // Try to load the owner as a member (may not be a member if it's a domain)
      if (account) {
        const ownerRes = await fetch(`/api/members/${account.ownerId}`);
        if (ownerRes.ok) owner = await ownerRes.json();
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
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function fmtDate(iso: string | null) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  }

  const demurrageAmount = $derived.by(() => {
    if (!account || !schedule) return 0;
    return account.kin * schedule.rate;
  });
  const balanceAfter = $derived.by(() => {
    if (!account || !schedule) return 0;
    return account.kin - demurrageAmount;
  });
</script>

<div class="page-header">
  <button class="back-btn" onclick={() => navigate('/accounts')}>← Accounts</button>
</div>

{#if loading}
  <p class="muted">Loading…</p>
{:else if error}
  <p class="error">{error}</p>
{:else if account}
  <div class="account-header">
    <div>
      <h1>{account.label}</h1>
      {#if owner}
        <p class="owner">
          <button class="link-btn" onclick={() => navigate(`/members/${owner!.id}`)}>
            {owner.firstName} {owner.lastName}
          </button>
          <span class="handle">@{owner.handle}</span>
        </p>
      {:else}
        <p class="owner muted">{account.ownerId}</p>
      {/if}
    </div>
    <div class="balance-block">
      <span class="balance-label">Balance</span>
      <span class="balance">{fmt(account.kin)} kin</span>
    </div>
  </div>

  <div class="flags-row">
    {#if account.allowNegativeKin}
      <span class="flag">overdraft allowed</span>
    {/if}
    {#if account.exemptFromDemurrage}
      <span class="flag exempt">exempt from demurrage</span>
    {/if}
  </div>

  <section class="demurrage-section">
    <h2>Demurrage</h2>

    {#if account.exemptFromDemurrage}
      <p class="muted">This account is exempt from demurrage.</p>
    {:else if schedule}
      <div class="demurrage-grid">
        <div class="demurrage-row">
          <span class="dl">Rate</span>
          <span class="dv">{(schedule.rate * 100).toFixed(1)}% per cycle</span>
        </div>
        <div class="demurrage-row">
          <span class="dl">Next run</span>
          <span class="dv">{fmtDate(schedule.nextRun)}</span>
        </div>
        <div class="demurrage-row">
          <span class="dl">Last run</span>
          <span class="dv">{fmtDate(schedule.lastRun)}</span>
        </div>
        <div class="demurrage-row separator">
          <span class="dl">Amount taken</span>
          <span class="dv debit">− {fmt(demurrageAmount)} kin</span>
        </div>
        <div class="demurrage-row">
          <span class="dl">Balance after</span>
          <span class="dv">{fmt(balanceAfter)} kin</span>
        </div>
      </div>
    {:else}
      <p class="muted">Demurrage schedule unavailable.</p>
    {/if}
  </section>
{/if}

<style>
  .page-header {
    margin-bottom: 24px;
  }

  .back-btn {
    background: none;
    border: none;
    padding: 0;
    color: var(--accent);
    font-size: 14px;
    cursor: pointer;
  }
  .back-btn:hover { text-decoration: underline; }

  .account-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }

  h1 { margin: 0 0 4px; font-size: 22px; font-weight: 600; }
  h2 { margin: 0 0 16px; font-size: 16px; font-weight: 600; }

  .owner {
    margin: 0;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .handle { color: var(--text-muted); font-family: monospace; font-size: 13px; }

  .link-btn {
    background: none;
    border: none;
    padding: 0;
    color: var(--accent);
    font-size: 14px;
    cursor: pointer;
  }
  .link-btn:hover { text-decoration: underline; }

  .balance-block {
    text-align: right;
  }

  .balance-label {
    display: block;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted);
    margin-bottom: 2px;
  }

  .balance {
    display: block;
    font-size: 28px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--text);
  }

  .flags-row {
    display: flex;
    gap: 6px;
    margin-bottom: 24px;
  }

  .flag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 12px;
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    color: var(--accent);
  }

  .flag.exempt {
    background: color-mix(in srgb, #10b981 12%, transparent);
    color: #059669;
  }

  .demurrage-section {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface);
    padding: 20px 24px;
    max-width: 480px;
  }

  .demurrage-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .demurrage-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
  }

  .demurrage-row.separator {
    padding-top: 10px;
    border-top: 1px solid var(--border);
  }

  .dl { color: var(--text-muted); }
  .dv { font-variant-numeric: tabular-nums; font-weight: 500; }
  .dv.debit { color: #ef4444; }

  .muted { color: var(--text-muted); }
  .error { color: #ef4444; }
</style>
