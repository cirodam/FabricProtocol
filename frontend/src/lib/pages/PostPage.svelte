<script lang="ts">
  const { id, navigate }: { id: string; navigate: (path: string) => void } = $props();

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

  let post: Post | null = $state(null);
  let loading = $state(true);
  let error: string | null = $state(null);
  let deleting = $state(false);
  let deleteError: string | null = $state(null);

  async function load() {
    try {
      const res = await fetch(`/api/marketplace/posts/${id}`);
      if (res.status === 404) throw new Error('Post not found');
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      post = await res.json();
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  load();

  async function deletePost() {
    if (!post) return;
    if (!confirm(`Delete "${post.title}"?`)) return;
    deleting = true;
    deleteError = null;
    try {
      const res = await fetch(`/api/marketplace/posts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      navigate('/marketplace');
    } catch (e) {
      deleteError = (e as Error).message;
      deleting = false;
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function formatPrice(p: Post) {
    if (p.price === 0) return 'Free';
    if (p.type === 'service') {
      return p.pricingUnit === 'per_hour' ? `${p.price} kin / hour` : `${p.price} kin`;
    }
    return `${p.price} kin`;
  }
</script>

<div class="page-header">
  <button class="back-btn" onclick={() => navigate('/marketplace')}>← Marketplace</button>
  {#if post}
    <button class="danger-btn" onclick={deletePost} disabled={deleting}>
      {deleting ? 'Deleting…' : 'Delete post'}
    </button>
  {/if}
</div>
{#if deleteError}
  <p class="error">{deleteError}</p>
{/if}

{#if loading}
  <p class="muted">Loading…</p>
{:else if error}
  <p class="error">{error}</p>
{:else if post}
  <div class="post">
    <div class="post-header">
      <h1>{post.title}</h1>
      <span class="price">{formatPrice(post)}</span>
    </div>

    <div class="badges">
      <span class="badge {post.side}">{post.side}</span>
      <span class="badge {post.type}">{post.type}</span>
      <span class="category">{post.category}</span>
    </div>

    {#if post.description}
      <p class="description">{post.description}</p>
    {/if}

    <div class="card-grid">
      <div class="card">
        <h2>Details</h2>
        <dl>
          <dt>Posted by</dt>
          <dd><button class="link-btn" onclick={() => navigate(`/members/${post!.posterId}`)}>{post.posterName}</button> <span class="muted">@{post.posterHandle}</span></dd>

          <dt>Posted on</dt>
          <dd>{formatDate(post.createdAt)}</dd>

          {#if post.type === 'item' && post.quantity !== undefined}
            <dt>Quantity</dt>
            <dd>{post.quantity}</dd>
          {/if}

          {#if post.type === 'service' && post.pricingUnit}
            <dt>Pricing</dt>
            <dd>{post.pricingUnit === 'per_hour' ? 'Per hour' : 'Fixed price'}</dd>
          {/if}
        </dl>
      </div>
    </div>
  </div>
{/if}

<style>
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 36px;
  }

  .back-btn {
    background: none;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 6px 12px;
    font-size: 13px;
    color: var(--text-muted);
    cursor: pointer;
  }

  .back-btn:hover { background: var(--surface); color: var(--text); }

  .danger-btn {
    padding: 6px 14px;
    background: none;
    border: 1px solid #ef4444;
    border-radius: var(--radius);
    font-size: 13px;
    color: #ef4444;
    cursor: pointer;
  }

  .danger-btn:hover:not(:disabled) { background: #ef444415; }
  .danger-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .post-header {
    display: flex;
    align-items: baseline;
    gap: 16px;
    margin-bottom: 10px;
    flex-wrap: wrap;
  }

  h1 { margin: 0; font-size: 24px; font-weight: 600; }

  .price { font-size: 20px; font-weight: 600; color: var(--accent); }

  .badges {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .badge {
    display: inline-block;
    padding: 2px 8px;
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

  .description {
    font-size: 15px;
    line-height: 1.6;
    margin: 0 0 24px;
    white-space: pre-wrap;
  }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 16px;
  }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
  }

  h2 { margin: 0 0 16px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }

  dl { margin: 0; display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; align-items: baseline; }
  dt { color: var(--text-muted); font-size: 13px; white-space: nowrap; }
  dd { margin: 0; font-size: 14px; }

  .link-btn {
    background: none;
    border: none;
    padding: 0;
    color: var(--accent);
    font-size: 14px;
    cursor: pointer;
  }

  .link-btn:hover { text-decoration: underline; }

  .muted { color: var(--text-muted); }
  .error { color: #ef4444; }
</style>
