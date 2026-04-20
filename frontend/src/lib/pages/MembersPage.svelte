<script lang="ts">
  const { navigate }: { navigate: (path: string) => void } = $props();

  interface Member {
    id: string;
    firstName: string;
    lastName: string;
    handle: string;
    memberType: string;
    joinDate: string;
    trustScore: number;
    phone: string | null;
  }

  let members: Member[] = $state([]);
  let loading = $state(true);
  let error: string | null = $state(null);

  async function load() {
    try {
      const res = await fetch('/api/members');
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      members = await res.json();
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  load();

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }
</script>

<div class="page-header">
  <h1>Members</h1>
  <span class="count">{loading ? '…' : members.length}</span>
  <button class="add-btn" onclick={() => navigate('/members/add')}>+ Add member</button>
</div>

{#if loading}
  <p class="muted">Loading…</p>
{:else if error}
  <p class="error">Failed to load members: {error}</p>
{:else if members.length === 0}
  <p class="muted">No members yet.</p>
{:else}
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Handle</th>
          <th>Type</th>
          <th>Joined</th>
          <th>Trust</th>
        </tr>
      </thead>
      <tbody>
        {#each members as m (m.id)}
          <tr>
            <td>{m.firstName} {m.lastName}</td>
            <td class="handle">@{m.handle}</td>
            <td><span class="badge">{m.memberType}</span></td>
            <td class="muted">{formatDate(m.joinDate)}</td>
            <td>{m.trustScore.toFixed(2)}</td>
          </tr>
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

  .add-btn {
    margin-left: auto;
    padding: 7px 16px;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: var(--radius);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
  }

  .add-btn:hover { background: var(--accent-hover); }

  h1 {
    margin: 0;
    font-size: 22px;
    font-weight: 600;
  }

  .count {
    font-size: 14px;
    color: var(--text-muted);
  }

  .table-wrap {
    overflow-x: auto;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface);
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

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
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
    font-size: 14px;
  }

  tr:last-child td { border-bottom: none; }
  tr:hover td { background: color-mix(in srgb, var(--accent) 4%, transparent); }

  .handle { color: var(--text-muted); font-family: monospace; }

  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 12px;
    background: color-mix(in srgb, var(--accent) 12%, transparent);
    color: var(--accent);
  }

  .muted { color: var(--text-muted); }
  .error { color: #ef4444; }
</style>
