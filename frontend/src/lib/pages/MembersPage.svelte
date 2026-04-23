<script lang="ts">
  const { navigate }: { navigate: (path: string) => void } = $props();

  interface Member {
    id: string;
    firstName: string;
    lastName: string;
    handle: string;
    birthDate: string;
    joinDate: string;
    personYears: number;
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

  function age(iso: string) {
    return Math.floor((Date.now() - new Date(iso).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  }
</script>

<div class="page-header">
  <h1>Members</h1>
  <span class="count">{loading ? '…' : members.length}</span>
  <button class="add-btn" onclick={() => navigate('/admin/applications/new')}>+ New application</button>
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
          <th>Age</th>
          <th>Handle</th>
          <th>Joined</th>
          <th class="num">Person-years</th>
        </tr>
      </thead>
      <tbody>
        {#each members as m (m.id)}
          <tr>
            <td><button class="link-btn" onclick={() => navigate(`/admin/members/${m.id}`)}>{m.firstName} {m.lastName}</button></td>
            <td class="muted">{age(m.birthDate)}</td>
            <td class="handle">@{m.handle}</td>
            <td class="muted">{formatDate(m.joinDate)}</td>
            <td class="num muted">{m.personYears.toFixed(2)}</td>
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

  .link-btn {
    background: none;
    border: none;
    padding: 0;
    color: var(--accent);
    font-size: 14px;
    cursor: pointer;
    text-align: left;
  }

  .link-btn:hover { text-decoration: underline; }

  .muted { color: var(--text-muted); }
  .error { color: #ef4444; }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
</style>
