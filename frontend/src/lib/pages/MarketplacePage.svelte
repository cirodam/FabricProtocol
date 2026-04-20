<script lang="ts">
  const { navigate }: { navigate: (path: string) => void } = $props();

  type PostSide = 'offer' | 'request';
  type PostType = 'item' | 'service';

  interface Post {
    id: string;
    posterId: string;
    posterName: string;
    posterHandle: string;
    type: PostType;
    side: PostSide;
    category: string;
    title: string;
    description: string;
    price: number;
    quantity?: number;
    pricingUnit?: 'per_hour' | 'in_total';
    createdAt: string;
  }

  const PAGE_SIZE = 20;

  let side: PostSide | '' = $state('offer');
  let type: PostType | '' = $state('');
  let search = $state('');

  let allPosts: Post[] = $state([]);
  let loading = $state(true);
  let error: string | null = $state(null);
  let page = $state(0);

  async function load() {
    loading = true;
    error = null;
    try {
      const params = new URLSearchParams();
      if (side) params.set('side', side);
      if (type) params.set('type', type);
      const res = await fetch(`/api/marketplace/posts?${params}`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      allPosts = await res.json();
      page = 0;
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  load();

  function filtered() {
    const q = search.trim().toLowerCase();
    if (!q) return allPosts;
    return allPosts.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.posterName.toLowerCase().includes(q)
    );
  }

  function paginated() {
    const f = filtered();
    return f.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  }

  function totalPages() {
    return Math.max(1, Math.ceil(filtered().length / PAGE_SIZE));
  }

  function onFilterChange() {
    page = 0;
    load();
  }

  function formatPrice(p: Post) {
    if (p.price === 0) return 'Free';
    if (p.type === 'service') {
      return p.pricingUnit === 'per_hour' ? `${p.price} cr/hr` : `${p.price} cr`;
    }
    return `${p.price} cr`;
  }
</script>

<div class="page-header">
  <h1>Marketplace</h1>
  <button class="add-btn" onclick={() => navigate('/marketplace/new')}>+ New post</button>
</div>

<div class="filters">
  <div class="seg" role="group">
    <button class:active={side === 'offer'}   onclick={() => { side = 'offer';   onFilterChange(); }}>For Sale</button>
    <button class:active={side === 'request'} onclick={() => { side = 'request'; onFilterChange(); }}>Looking to Buy</button>
    <button class:active={side === ''}        onclick={() => { side = '';        onFilterChange(); }}>All</button>
  </div>

  <div class="seg" role="group">
    <button class:active={type === ''}        onclick={() => { type = '';        page = 0; }}>Any type</button>
    <button class:active={type === 'item'}    onclick={() => { type = 'item';    page = 0; }}>Items</button>
    <button class:active={type === 'service'} onclick={() => { type = 'service'; page = 0; }}>Services</button>
  </div>

  <input
    class="search"
    type="search"
    placeholder="Search title, description, category…"
    bind:value={search}
    oninput={() => { page = 0; }}
  />
</div>

{#if loading}
  <p class="muted">Loading…</p>
{:else if error}
  <p class="error">{error}</p>
{:else}
  {@const rows = paginated()}
  {@const total = filtered().length}
  {@const pages = totalPages()}

  <div class="results-bar">
    <span class="muted">{total} post{total !== 1 ? 's' : ''}</span>
  </div>

  {#if rows.length === 0}
    <p class="muted">No posts found.</p>
  {:else}
    <div class="post-list">
      {#each rows as p (p.id)}
        <button class="post-card" onclick={() => navigate(`/marketplace/${p.id}`)}>
          <div class="post-top">
            <span class="post-title">{p.title}</span>
            <span class="post-price">{formatPrice(p)}</span>
          </div>
          <div class="post-meta">
            <span class="badge {p.side}">{p.side}</span>
            <span class="badge {p.type}">{p.type}</span>
            <span class="category">{p.category}</span>
            <span class="poster muted">@{p.posterHandle}</span>
          </div>
          {#if p.description}
            <p class="post-desc">{p.description}</p>
          {/if}
        </button>
      {/each}
    </div>

    {#if pages > 1}
      <div class="pagination">
        <button disabled={page === 0} onclick={() => page--}>← Prev</button>
        <span class="muted">Page {page + 1} of {pages}</span>
        <button disabled={page >= pages - 1} onclick={() => page++}>Next →</button>
      </div>
    {/if}
  {/if}
{/if}

<style>
  .page-header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 20px;
  }

  h1 { margin: 0; font-size: 22px; font-weight: 600; }

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

  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
    align-items: center;
  }

  .seg {
    display: flex;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }

  .seg button {
    background: var(--bg);
    border: none;
    border-right: 1px solid var(--border);
    padding: 6px 14px;
    font-size: 13px;
    cursor: pointer;
    color: var(--text-muted);
  }

  .seg button:last-child { border-right: none; }
  .seg button:hover { background: var(--surface); color: var(--text); }
  .seg button.active { background: var(--accent); color: #fff; }

  .search {
    flex: 1;
    min-width: 200px;
    padding: 6px 12px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg);
    color: var(--text);
    font-size: 14px;
  }

  .results-bar {
    margin-bottom: 12px;
    font-size: 13px;
  }

  .post-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .post-card {
    display: block;
    width: 100%;
    text-align: left;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px 16px;
    cursor: pointer;
  }

  .post-card:hover {
    border-color: var(--accent);
  }

  .post-top {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 6px;
  }

  .post-title { font-size: 15px; font-weight: 500; }
  .post-price { font-size: 14px; color: var(--accent); font-weight: 500; white-space: nowrap; margin-left: 12px; }

  .post-meta {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
    flex-wrap: wrap;
  }

  .badge {
    display: inline-block;
    padding: 2px 7px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .badge.offer   { background: color-mix(in srgb, #22c55e 15%, transparent); color: #16a34a; }
  .badge.request { background: color-mix(in srgb, #f59e0b 15%, transparent); color: #b45309; }
  .badge.item    { background: color-mix(in srgb, var(--accent) 12%, transparent); color: var(--accent); }
  .badge.service { background: color-mix(in srgb, #a855f7 12%, transparent); color: #9333ea; }

  .category { font-size: 13px; color: var(--text-muted); }
  .poster { font-size: 13px; margin-left: auto; font-family: monospace; }

  .post-desc {
    margin: 0;
    font-size: 13px;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .pagination {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 20px;
    justify-content: center;
  }

  .pagination button {
    background: none;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 5px 14px;
    font-size: 13px;
    cursor: pointer;
    color: var(--text);
  }

  .pagination button:hover:not(:disabled) { background: var(--surface); }
  .pagination button:disabled { opacity: 0.4; cursor: not-allowed; }

  .muted { color: var(--text-muted); }
  .error { color: #ef4444; }
</style>
