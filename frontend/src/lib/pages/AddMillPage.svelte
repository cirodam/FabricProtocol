<script lang="ts">
  const { navigate }: { navigate: (path: string) => void } = $props();

  let name        = $state("");
  let description = $state("");
  let error       = $state("");
  let working     = $state(false);

  async function submit(e: Event) {
    e.preventDefault();
    if (!name.trim()) { error = "Name is required"; return; }
    working = true;
    error   = "";
    try {
      const body: Record<string, string> = { name: name.trim() };
      if (description.trim()) body.description = description.trim();
      const res = await fetch("/api/food/mills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `HTTP ${res.status}`);
      }
      const created = await res.json();
      navigate(`/food/mills/${created.id}`);
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : "Failed to create mill";
      working = false;
    }
  }
</script>

<div class="page">
  <button class="back-link" onclick={() => navigate("/food")}>← Food</button>
  <h1>New Grain Mill</h1>

  <form class="form" onsubmit={submit}>
    {#if error}<p class="error">{error}</p>{/if}

    <label>
      Name <span class="required">*</span>
      <input type="text" bind:value={name} placeholder="e.g. North Side Grain Mill" disabled={working} required />
    </label>

    <label>
      Description <span class="optional">(optional)</span>
      <textarea bind:value={description} rows="3"
        placeholder="Leave blank to use the default description."
        disabled={working}></textarea>
    </label>

    <div class="actions">
      <button type="submit" class="primary-btn" disabled={working || !name.trim()}>
        {working ? "Creating…" : "Create mill"}
      </button>
      <button type="button" class="secondary-btn" onclick={() => navigate("/food")} disabled={working}>
        Cancel
      </button>
    </div>
  </form>
</div>

<style>
  .page { max-width: 520px; margin: 2rem auto; padding: 0 1rem; }
  .back-link { background: none; border: none; color: var(--color-primary, #2563eb); cursor: pointer; padding: 0; margin-bottom: 1.25rem; font-size: 0.9rem; }
  h1 { margin: 0 0 1.5rem; font-size: 1.4rem; }

  .form { display: flex; flex-direction: column; gap: 1rem; }

  label { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.9rem; font-weight: 500; }
  label input, label textarea {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: 6px;
    font-size: 0.9rem;
    font-family: inherit;
    background: var(--color-surface, #fff);
  }
  label textarea { resize: vertical; }

  .required { color: var(--color-danger, #dc2626); }
  .optional { font-weight: 400; color: var(--color-muted, #888); font-size: 0.8rem; }

  .actions { display: flex; gap: 0.75rem; margin-top: 0.5rem; }
  .primary-btn { padding: 0.5rem 1.25rem; background: var(--color-primary, #2563eb); color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; }
  .primary-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .secondary-btn { padding: 0.5rem 1.25rem; background: none; border: 1px solid var(--color-border, #e2e8f0); border-radius: 6px; cursor: pointer; font-size: 0.9rem; }

  .error { color: var(--color-danger, #dc2626); font-size: 0.9rem; margin: 0; }
</style>
