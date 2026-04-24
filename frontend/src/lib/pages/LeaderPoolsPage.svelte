<script lang="ts">
  import CommunitySidebar from '../components/CommunitySidebar.svelte';

  const { navigate, path }: { navigate: (path: string) => void; path: string } = $props();

  interface LeaderPool {
    id: string;
    poolName: string;
    memberCount: number;
    createdAt: string;
  }

  let pools: LeaderPool[] = $state([]);
  let loading = $state(true);
  let error: string | null = $state(null);

  async function load() {
    try {
      const res = await fetch('/api/leader-pools');
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      pools = data.pools;
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  load();
</script>

<div class="domain-layout">
<CommunitySidebar {navigate} {path} />
<div class="domain-main">
<div class="page-header">
  <h1>Leader Pools</h1>
  <p class="intro">Leader pools are groups of members eligible to be drawn by sortition to fill seats on a domain's governing council. Each pool is named for the domain it serves — Farmers, Medical Workers, Fire Department, and so on.</p>
</div>

{#if loading}
  <p class="muted">Loading…</p>
{:else if error}
  <p class="error">{error}</p>
{:else}
  <section class="section">
    <div class="section-header">
      <h2>Leader Pools <span class="count">{pools.length}</span></h2>
      <button class="new-btn" onclick={() => navigate('/leader-pools/new')}>+ New pool</button>
    </div>
    {#if pools.length === 0}
      <p class="muted">No leader pools yet.</p>
    {:else}
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Pool Name</th><th class="num">Members</th><th>Created</th></tr>
          </thead>
          <tbody>
            {#each pools as p (p.id)}
              <tr class="clickable" onclick={() => navigate(`/leader-pools/${p.id}`)}>
                <td class="name">{p.poolName}</td>
                <td class="num">{p.memberCount}</td>
                <td class="muted">{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </section>
{/if}
</div>
</div>

<style>
  h1 { margin: 0 0 8px; font-size: 22px; font-weight: 600; }
  .intro { margin: 0 0 20px; font-size: 0.9rem; color: var(--text-secondary); max-width: 600px; line-height: 1.5; }
  .muted { color: var(--text-secondary); }
  .error { color: var(--color-danger, #dc2626); font-size: 0.9rem; }

  .section { margin-bottom: 2.5rem; }
  .section-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
  .section-header h2 { margin: 0; font-size: 1rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-muted, #666); }
  .count { font-weight: 400; opacity: 0.7; }

  .new-btn {
    margin-left: auto;
    background: var(--accent);
    border: none;
    border-radius: var(--radius);
    padding: 7px 16px;
    color: #fff;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
  }

  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 0.4rem 0.75rem; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-muted, #888); border-bottom: 1px solid var(--color-border, #e2e8f0); }
  td { padding: 0.65rem 0.75rem; border-bottom: 1px solid var(--color-border, #f1f5f9); font-size: 0.9rem; }
  td.name { font-weight: 500; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  tr.clickable { cursor: pointer; }
  tr.clickable:hover td { background: var(--color-hover, #f8fafc); }
</style>
