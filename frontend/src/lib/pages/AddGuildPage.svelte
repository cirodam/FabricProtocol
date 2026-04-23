<script lang="ts">
  const { navigate }: { navigate: (path: string) => void } = $props();

  let name        = $state("");
  let description = $state("");
  let error       = $state("");
  let working     = $state(false);

  async function submit(e: Event) {
    e.preventDefault();
    if (!name.trim()) { error = "Name is required"; return; }
    working = true; error = "";
    try {
      const res = await fetch("/api/guilds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      navigate(`/guilds/${data.id}`);
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : "Failed to create guild";
      working = false;
    }
  }
</script>

<div class="page">
  <button class="back-link" onclick={() => navigate("/guilds")}>← Specialists</button>
  <h1>New Specialist Group</h1>

  <form onsubmit={submit} class="form">
    {#if error}<p class="error">{error}</p>{/if}

    <label>
      <span>Name <span class="req">*</span></span>
      <input type="text" bind:value={name} placeholder="e.g. Farmers, Medical Workers, Fire Department" disabled={working} />
    </label>

    <label>
      <span>Description</span>
      <textarea bind:value={description} rows="3" placeholder="Who this group represents, eligibility criteria, notes…" disabled={working}></textarea>
    </label>

    <div class="actions">
      <button type="button" onclick={() => navigate("/guilds")} disabled={working}>Cancel</button>
      <button type="submit" class="primary" disabled={working || !name.trim()}>{working ? "Creating…" : "Create group"}</button>
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
  input, textarea { padding: 0.5rem 0.75rem; border: 1px solid var(--color-border, #e2e8f0); border-radius: 6px; font-size: 0.9rem; font-family: inherit; resize: vertical; }
  input:disabled, textarea:disabled { opacity: 0.6; }

  .actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 0.5rem; }
  .actions button { padding: 0.5rem 1.25rem; border-radius: 6px; cursor: pointer; font-size: 0.9rem; border: 1px solid var(--color-border, #e2e8f0); background: none; }
  .actions button:disabled { opacity: 0.6; cursor: not-allowed; }
  .actions .primary { background: var(--color-primary, #2563eb); color: #fff; border-color: transparent; }
  .error { color: var(--color-danger, #dc2626); font-size: 0.9rem; margin: 0; }
</style>
