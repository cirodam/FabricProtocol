<script lang="ts">
  const { navigate }: { navigate: (path: string) => void } = $props();

  type PostSide = 'offer' | 'request';
  type PostType = 'item' | 'service';

  interface Member { id: string; firstName: string; lastName: string; handle: string; }

  let members: Member[] = $state([]);
  let posterId = $state('');
  let side: PostSide = $state('offer');
  let type: PostType = $state('item');
  let category = $state('');
  let title = $state('');
  let description = $state('');
  let price = $state(0);
  let quantity = $state(1);
  let pricingUnit: 'per_hour' | 'in_total' = $state('in_total');

  let submitting = $state(false);
  let error: string | null = $state(null);

  async function loadMembers() {
    try {
      const res = await fetch('/api/members');
      if (!res.ok) throw new Error(`${res.status}`);
      members = await res.json();
      if (members.length > 0) posterId = members[0].id;
    } catch {
      // non-fatal; poster select will be empty
    }
  }

  loadMembers();

  async function submit(e: Event) {
    e.preventDefault();
    error = null;
    submitting = true;
    try {
      const body: Record<string, unknown> = {
        posterId,
        side,
        type,
        category: category.trim(),
        title: title.trim(),
        description: description.trim(),
        price,
      };
      if (type === 'item') body.quantity = quantity;
      if (type === 'service') body.pricingUnit = pricingUnit;

      const res = await fetch('/api/marketplace/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { error = data.error ?? `${res.status}`; return; }
      navigate(`/marketplace/${data.id}`);
    } catch (e) {
      error = (e as Error).message;
    } finally {
      submitting = false;
    }
  }
</script>

<div class="page-header">
  <button class="back-btn" onclick={() => navigate('/marketplace')}>← Marketplace</button>
</div>

<h1>New Post</h1>

<form onsubmit={submit}>
  <div class="field">
    <label>
      Posted by <span class="req">*</span>
      <select bind:value={posterId} required>
        {#each members as m (m.id)}
          <option value={m.id}>{m.firstName} {m.lastName} (@{m.handle})</option>
        {/each}
      </select>
    </label>
  </div>

  <div class="row">
    <div class="seg-field">
      <span class="seg-label">Side <span class="req">*</span></span>
      <div class="seg" role="group">
        <button type="button" class:active={side === 'offer'}   onclick={() => side = 'offer'}>For Sale</button>
        <button type="button" class:active={side === 'request'} onclick={() => side = 'request'}>Looking to Buy</button>
      </div>
    </div>

    <div class="seg-field">
      <span class="seg-label">Type <span class="req">*</span></span>
      <div class="seg" role="group">
        <button type="button" class:active={type === 'item'}    onclick={() => type = 'item'}>Item</button>
        <button type="button" class:active={type === 'service'} onclick={() => type = 'service'}>Service</button>
      </div>
    </div>
  </div>

  <div class="grid">
    <label>
      Title <span class="req">*</span>
      <input type="text" bind:value={title} required />
    </label>
    <label>
      Category <span class="req">*</span>
      <input type="text" bind:value={category} placeholder="e.g. food, tools, childcare" required />
    </label>
  </div>

  <label class="full">
    Description
    <textarea bind:value={description} rows="4" placeholder="Details about what you're offering or looking for…"></textarea>
  </label>

  <div class="grid">
    <label>
      Price <span class="hint">(kin, 0 = free)</span>
      <input type="number" min="0" step="1" bind:value={price} required />
    </label>

    {#if type === 'item'}
      <label>
        Quantity <span class="req">*</span>
        <input type="number" min="1" step="1" bind:value={quantity} required />
      </label>
    {:else}
      <div class="seg-field">
        <span class="seg-label">Pricing</span>
        <div class="seg" role="group">
          <button type="button" class:active={pricingUnit === 'in_total'} onclick={() => pricingUnit = 'in_total'}>Fixed</button>
          <button type="button" class:active={pricingUnit === 'per_hour'} onclick={() => pricingUnit = 'per_hour'}>Per hour</button>
        </div>
      </div>
    {/if}
  </div>

  {#if error}
    <p class="error">{error}</p>
  {/if}

  <button type="submit" class="submit-btn" disabled={submitting}>
    {submitting ? 'Posting…' : 'Create post'}
  </button>
</form>

<style>
  .page-header { margin-bottom: 20px; }

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

  h1 { margin: 0 0 24px; font-size: 22px; font-weight: 600; }

  form {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
    max-width: 640px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .row {
    display: flex;
    gap: 24px;
    flex-wrap: wrap;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 14px;
    font-weight: 500;
  }

  label.full { width: 100%; }

  input[type="text"],
  input[type="number"],
  select,
  textarea {
    padding: 8px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg);
    color: var(--text);
    font-size: 14px;
    font-family: inherit;
  }

  textarea { resize: vertical; }

  input:focus, select:focus, textarea:focus {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }

  .seg-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .seg-label {
    font-size: 14px;
    font-weight: 500;
  }

  .seg {
    display: flex;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    width: fit-content;
  }

  .seg button {
    background: var(--bg);
    border: none;
    border-right: 1px solid var(--border);
    padding: 6px 16px;
    font-size: 13px;
    cursor: pointer;
    color: var(--text-muted);
  }

  .seg button:last-child { border-right: none; }
  .seg button:hover { background: var(--surface); color: var(--text); }
  .seg button.active { background: var(--accent); color: #fff; }

  .submit-btn {
    align-self: flex-start;
    padding: 9px 20px;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: var(--radius);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
  }

  .submit-btn:hover:not(:disabled) { background: var(--accent-hover); }
  .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .req { color: #ef4444; }
  .hint { font-size: 12px; font-weight: 400; color: var(--text-muted); }
  .error { color: #ef4444; font-size: 14px; margin: 0; }
</style>
