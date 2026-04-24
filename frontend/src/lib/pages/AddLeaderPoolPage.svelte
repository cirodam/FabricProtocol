<script lang="ts">
  const { navigate }: { navigate: (path: string) => void } = $props();

  let poolName = $state("");
  let error    = $state("");
  let working  = $state(false);

  async function submit(e: Event) {
    e.preventDefault();
    if (!poolName.trim()) { error = "Pool name is required"; return; }
    working = true; error = "";
    try {
      const res = await fetch("/api/leader-pools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poolName: poolName.trim() }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      navigate(`/leader-pools/${data.id}`);
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : "Failed to create pool";
      working = false;
    }
  }
</script>

<div class="page">
  <button class="back-link" onclick={() => navigate("/leader-pools")}>← Leader Pools</button>
  <h1>New Leader Pool</h1>

  <form onsubmit={submit} class="form">
    {#if error}<p class="error">{error}</p>{/if}

    <label>
      <span>Pool Name <span class="req">*</span></span>
      <input type="text" bind:value={poolName} placeholder="e.g. Farmers, Medical Workers, Fire Department" disabled={working} />
    </label>

    <div class="actions">
      <button type="button" onclick={() => navigate("/leader-pools")} disabled={working}>Cancel</button>
      <button type="submit" class="primary" disabled={working || !poolName.trim()}>{working ? "Creating…" : "Create pool"}</button>
    </div>
  </form>
</div>

<style>
  .page { max-width: 540px; margin: 0 auto; padding: 2rem 1rem; }
  .back-link { background: none; border: none; color: var(--color-primary, #2563eb); cursor: pointer; padding: 0; margin-bottom: 1.25rem; font-size: 0.9rem; }
  h1 { margin: 0 0 1.5rem; font-size: 1.4rem; font-weight: 600; }

  .form { display: flex; flex-direction: column; gap: 1.1rem; }
  label { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.9rem; font-weight: 500; }
  .req { color: var(--color-danger, #dc2626); }
  input { padding: 0.5rem 0.75rem; border: 1px solid var(--color-border, #e2e8f0); border-radius: 6px; font-size: 0.9rem; font-family: inherit; }
  input:disabled { opacity: 0.6; }

  .actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 0.5rem; }
  .actions button { padding: 0.5rem 1.25rem; border-radius: 6px; cursor: pointer; font-size: 0.9rem; border: 1px solid var(--color-border, #e2e8f0); background: none; }
  .actions button:disabled { opacity: 0.6; cursor: not-allowed; }
  .actions .primary { background: var(--color-primary, #2563eb); color: #fff; border-color: transparent; }
  .error { color: var(--color-danger, #dc2626); font-size: 0.9rem; margin: 0; }
</style>
