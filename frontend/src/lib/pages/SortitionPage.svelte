<script lang="ts">
  const { navigate }: { navigate: (path: string) => void } = $props();

  interface Pool {
    id: string;
    name: string;
    description: string;
    memberCount: number;
    createdAt: string;
  }

  let pools: Pool[] = $state([]);
  let loading = $state(true);
  let error: string | null = $state(null);

  async function load() {
    try {
      const res = await fetch('/api/sortition/pools');
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

<div class="page-header">
  <h1>Sortition</h1>
</div>

{#if loading}
  <p class="muted">Loading…</p>
{:else if error}
  <p class="error">{error}</p>
{:else}
  <section class="section">
    <div class="section-header">
      <h2>Pools <span class="count">{pools.length}</span></h2>
      <button class="new-btn" onclick={() => navigate('/sortition/pools/new')}>+ New pool</button>
    </div>
    {#if pools.length === 0}
      <p class="muted">No sortition pools yet.</p>
    {:else}
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Description</th><th class="num">Members</th><th>Created</th></tr>
          </thead>
          <tbody>
            {#each pools as p (p.id)}
              <tr class="clickable" onclick={() => navigate(`/sortition/pools/${p.id}`)}>
                <td class="name">{p.name}</td>
                <td class="muted">{p.description || '—'}</td>
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

<style>
  h1 { margin: 0 0 12px; font-size: 22px; font-weight: 600; }
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
