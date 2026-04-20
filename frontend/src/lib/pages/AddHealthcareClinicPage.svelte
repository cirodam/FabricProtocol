<script lang="ts">
  const { navigate }: { navigate: (path: string) => void } = $props();

  let name        = $state("");
  let description = $state("");
  let submitting  = $state(false);
  let error       = $state("");

  async function submit(e: Event) {
    e.preventDefault();
    if (!name.trim()) { error = "Name is required"; return; }
    submitting = true;
    error = "";
    try {
      const res = await fetch("/api/healthcare/clinics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `HTTP ${res.status}`);
      }
      const clinic = await res.json();
      navigate(`/healthcare/clinics/${clinic.id}`);
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : "Failed to create clinic";
      submitting = false;
    }
  }
</script>

<div class="page">
  <button class="back-link" onclick={() => navigate("/healthcare")}>← Healthcare</button>
  <h1>New Clinic</h1>

  <form onsubmit={submit} class="form">
    {#if error}
      <p class="error">{error}</p>
    {/if}

    <label>
      <span>Name <span class="req">*</span></span>
      <input type="text" bind:value={name} placeholder="e.g. Eastside Community Clinic" required />
    </label>

    <label>
      <span>Description</span>
      <textarea bind:value={description} rows="3" placeholder="Optional — leave blank for default"></textarea>
    </label>

    <div class="actions">
      <button type="button" class="cancel-btn" onclick={() => navigate("/healthcare")}>Cancel</button>
      <button type="submit" class="submit-btn" disabled={submitting}>{submitting ? "Creating…" : "Create Clinic"}</button>
    </div>
  </form>
</div>

<style>
  .page { max-width: 560px; margin: 0 auto; padding: 2rem 1rem; }
  .back-link { background: none; border: none; color: var(--color-primary, #2563eb); cursor: pointer; padding: 0; margin-bottom: 1rem; font-size: 0.9rem; }

  h1 { margin: 0 0 1.75rem; }

  .form { display: flex; flex-direction: column; gap: 1.25rem; }
  label { display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.9rem; font-weight: 500; }
  label span { color: var(--color-text, #1e293b); }
  .req { color: var(--color-danger, #dc2626); }
  input, textarea { padding: 0.5rem 0.75rem; border: 1px solid var(--color-border, #e2e8f0); border-radius: 6px; font-size: 0.95rem; width: 100%; box-sizing: border-box; }
  textarea { resize: vertical; }

  .actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 0.5rem; }
  .cancel-btn { padding: 0.5rem 1rem; background: none; border: 1px solid var(--color-border, #e2e8f0); border-radius: 6px; cursor: pointer; }
  .submit-btn { padding: 0.5rem 1.25rem; background: var(--color-primary, #2563eb); color: #fff; border: none; border-radius: 6px; cursor: pointer; }
  .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .error { color: var(--color-danger, #dc2626); font-size: 0.9rem; margin: 0; }
</style>
