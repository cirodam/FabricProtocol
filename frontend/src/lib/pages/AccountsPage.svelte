<script lang="ts">
  const { navigate } = $props<{ navigate: (to: string) => void }>();

  interface Member {
    id: string;
    firstName: string;
    lastName: string;
    handle: string;
  }

  interface Account {
    id: string;
    ownerId: string;
    label: string;
    kin: number;
    allowNegativeKin: boolean;
    exemptFromDemurrage: boolean;
    createdAt: string;
  }

  interface Row {
    member: Member;
    accounts: Account[];
  }

  let rows: Row[] = $state([]);
  let loading = $state(true);
  let error: string | null = $state(null);

  async function load() {
    try {
      const res = await fetch('/api/members');
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const members: Member[] = await res.json();

      const settled = await Promise.allSettled(
        members.map(m =>
          fetch(`/api/accounts/${m.id}`)
            .then(r => (r.ok ? r.json() : []))
            .then((accounts: Account[]) => ({ member: m, accounts }))
        )
      );

      rows = settled
        .filter(r => r.status === 'fulfilled')
        .map(r => (r as PromiseFulfilledResult<Row>).value);
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
</script>

<div class="page-header">
  <h1>Accounts</h1>
  <span class="count">{loading ? '…' : rows.length}</span>
</div>

{#if loading}
  <p class="muted">Loading…</p>
{:else if error}
  <p class="error">Failed to load accounts: {error}</p>
{:else if rows.length === 0}
  <p class="muted">No accounts yet.</p>
{:else}
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Member</th>
          <th>Account</th>
          <th class="num">Kin</th>
          <th>Flags</th>
        </tr>
      </thead>
      <tbody>
        {#each rows as { member, accounts } (member.id)}
          {#each accounts as acct, i (acct.id)}
            <tr>
              {#if i === 0}
                <td class="member-cell" rowspan={accounts.length}>
                  <span class="name">{member.firstName} {member.lastName}</span>
                  <span class="handle">@{member.handle}</span>
                </td>
              {/if}
              <td class="label">
                <button class="link-btn" onclick={() => navigate(`/accounts/${acct.id}`)}>{acct.label}</button>
              </td>
              <td class="num">{fmt(acct.kin)}</td>
              <td class="flags">
                {#if acct.allowNegativeKin}<span class="flag">overdraft</span>{/if}
                {#if acct.exemptFromDemurrage}<span class="flag">dues exempt</span>{/if}
              </td>
            </tr>
          {/each}
        {/each}
      </tbody>
    </table>
  </div>
{/if}

<style>
  .page-header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 24px;
  }

  h1 { margin: 0; font-size: 22px; font-weight: 600; }
  .count { font-size: 14px; color: var(--text-muted); }

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

  th.num { text-align: right; }

  td {
    padding: 10px 16px;
    border-bottom: 1px solid var(--border);
    font-size: 14px;
    vertical-align: top;
  }

  tr:last-child td { border-bottom: none; }
  tr:hover td { background: color-mix(in srgb, var(--accent) 4%, transparent); }

  .member-cell {
    vertical-align: middle;
  }

  .name { display: block; font-weight: 500; }
  .handle { display: block; font-size: 12px; color: var(--text-muted); font-family: monospace; }
  .label { color: var(--text-muted); font-size: 13px; }

  .link-btn {
    background: none;
    border: none;
    padding: 0;
    color: var(--accent);
    font-size: 13px;
    cursor: pointer;
    text-align: left;
  }
  .link-btn:hover { text-decoration: underline; }

  .num { text-align: right; font-variant-numeric: tabular-nums; }

  .flags { display: flex; gap: 4px; flex-wrap: wrap; }
  .flag {
    display: inline-block;
    padding: 1px 6px;
    border-radius: 999px;
    font-size: 11px;
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    color: var(--accent);
  }

  .muted { color: var(--text-muted); }
  .error { color: #ef4444; }
</style>
