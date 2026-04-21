<script lang="ts">
  const { navigate }: { navigate: (path: string) => void } = $props();

  interface Pool { id: string; name: string; memberCount: number; }

  let pools: Pool[]   = $state([]);
  let poolsLoaded     = $state(false);

  let domainName  = $state("");
  let poolId      = $state("");
  let size        = $state<3 | 5>(5);
  let error       = $state("");
  let working     = $state(false);

  async function loadPools() {
    try {
      const res = await fetch("/api/sortition/pools");
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      pools = data.pools;
      if (pools.length > 0) poolId = pools[0]!.id;
    } catch {
      // non-fatal — user will see empty select
    } finally {
      poolsLoaded = true;
    }
  }

  async function submit(e: Event) {
    e.preventDefault();
    if (!domainName.trim()) { error = "Domain name is required"; return; }
    if (!poolId) { error = "A sortition pool is required"; return; }
    working = true; error = "";
    try {
      const res = await fetch("/api/councils", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domainName: domainName.trim(), poolId, size }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      navigate(`/councils/${data.id}`);
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : "Failed to create council";
      working = false;
    }
  }

  loadPools();
</script>

<div class="page">
  <button class="back-link" onclick={() => navigate("/councils")}>← Councils</button>
  <h1>New Council</h1>

  <form onsubmit={submit} class="form">
    {#if error}<p class="error">{error}</p>{/if}

    <label>
      <span>Domain name <span class="req">*</span></span>
      <input type="text" bind:value={domainName} placeholder="e.g. Housing" disabled={working} />
    </label>

    <label>
      <span>Sortition pool <span class="req">*</span></span>
      {#if !poolsLoaded}
        <p class="muted">Loading pools…</p>
      {:else if pools.length === 0}
        <p class="muted warn">No sortition pools exist yet. <button type="button" class="link-btn" onclick={() => navigate('/sortition/pools/new')}>Create one first →</button></p>
      {:else}
        <select bind:value={poolId} disabled={working}>
          {#each pools as p (p.id)}
            <option value={p.id}>{p.name} ({p.memberCount} members)</option>
          {/each}
        </select>
      {/if}
    </label>

    <fieldset>
      <legend>Council size</legend>
      <div class="radio-group">
        <label class="radio">
          <input type="radio" bind:group={size} value={3} disabled={working} />
          3 seats
        </label>
        <label class="radio">
          <input type="radio" bind:group={size} value={5} disabled={working} />
          5 seats
        </label>
      </div>
    </fieldset>

    <div class="actions">
      <button type="button" onclick={() => navigate("/councils")} disabled={working}>Cancel</button>
      <button type="submit" class="primary" disabled={working || !domainName.trim() || !poolId}>
        {working ? "Creating…" : "Create council"}
      </button>
    </div>
  </form>
</div>

<style>
  .page { max-width: 480px; margin: 0 auto; padding: 2rem 1rem; }
  .back-link { background: none; border: none; color: var(--color-primary, #2563eb); cursor: pointer; padding: 0; margin-bottom: 1.25rem; font-size: 0.9rem; }
  h1 { margin: 0 0 1.5rem; font-size: 1.4rem; font-weight: 600; }

  .form { display: flex; flex-direction: column; gap: 1.2rem; }
  label { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.9rem; font-weight: 500; }
  .req { color: var(--color-danger, #dc2626); }
  input[type="text"], select { padding: 0.5rem 0.75rem; border: 1px solid var(--color-border, #e2e8f0); border-radius: 6px; font-size: 0.9rem; font-family: inherit; background: var(--color-surface, #fff); }
  input:disabled, select:disabled { opacity: 0.6; }

  fieldset { border: 1px solid var(--color-border, #e2e8f0); border-radius: 6px; padding: 0.75rem 1rem; }
  legend { font-size: 0.85rem; font-weight: 500; padding: 0 0.25rem; }
  .radio-group { display: flex; gap: 1.5rem; margin-top: 0.25rem; }
  .radio { flex-direction: row; align-items: center; gap: 0.4rem; font-weight: 400; cursor: pointer; }

  .muted { color: var(--text-secondary); font-size: 0.875rem; margin: 0; font-weight: 400; }
  .warn { color: var(--color-warning, #d97706); }
  .link-btn { background: none; border: none; color: var(--color-primary, #2563eb); cursor: pointer; padding: 0; font-size: inherit; text-decoration: underline; }

  .actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 0.5rem; }
  .actions button { padding: 0.5rem 1.25rem; border-radius: 6px; cursor: pointer; font-size: 0.9rem; border: 1px solid var(--color-border, #e2e8f0); background: none; }
  .actions button:disabled { opacity: 0.6; cursor: not-allowed; }
  .actions .primary { background: var(--color-primary, #2563eb); color: #fff; border-color: transparent; }
  .error { color: var(--color-danger, #dc2626); font-size: 0.9rem; margin: 0; }
</style>
