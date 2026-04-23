<script lang="ts">
  import CommunitySidebar from '../components/CommunitySidebar.svelte';

  const { domainId, navigate }:
    { domainId: string; navigate: (p: string) => void } = $props();

  let name        = $state('');
  let type        = $state('');
  let description = $state('');
  let working     = $state(false);
  let error       = $state('');

  async function submit(ev: Event) {
    ev.preventDefault();
    if (!name.trim() || !type.trim()) { error = 'Name and type are required'; return; }
    working = true; error = '';
    try {
      const res = await fetch(`/api/domains/${domainId}/units`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), type: type.trim(), description: description.trim() }),
      });
      if (!res.ok) { error = (await res.json()).error ?? 'Failed'; return; }
      const unit = await res.json();
      navigate(`/domains/${domainId}/units/${unit.id}`);
    } catch (e) {
      error = (e as Error).message;
    } finally {
      working = false;
    }
  }
</script>

<div class="layout">
  <CommunitySidebar {navigate} />
  <main class="main">
    <h1>Add functional unit</h1>

    <form class="card" onsubmit={submit}>
      {#if error}<p class="error">{error}</p>{/if}

      <label class="field">
        <span>Name</span>
        <input class="input" bind:value={name} placeholder="e.g. North Neighborhood Clinic" required />
      </label>
      <label class="field">
        <span>Type</span>
        <input class="input" bind:value={type} placeholder="e.g. clinic, school, fire-company" required />
      </label>
      <label class="field">
        <span>Description</span>
        <textarea class="input" rows="3" bind:value={description} placeholder="Optional description"></textarea>
      </label>

      <div class="actions">
        <button class="btn primary" type="submit" disabled={working}>
          {working ? 'Creating…' : 'Create unit'}
        </button>
        <button class="btn secondary" type="button" onclick={() => navigate(`/domains/${domainId}`)}>
          Cancel
        </button>
      </div>
    </form>
  </main>
</div>

<style>
  .layout { display: flex; min-height: 100vh; }
  .main { flex: 1; padding: 2rem; max-width: 600px; }
  h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; }
  .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
  .field { display: flex; flex-direction: column; gap: 0.3rem; font-size: 0.875rem; font-weight: 500; color: #374151; }
  .input { border: 1px solid #d1d5db; border-radius: 6px; padding: 0.4rem 0.6rem; font-size: 0.875rem; width: 100%; box-sizing: border-box; font-family: inherit; }
  .actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
  .btn { padding: 0.4rem 0.9rem; border-radius: 6px; border: 1px solid transparent; font-size: 0.875rem; cursor: pointer; font-weight: 500; }
  .btn.primary { background: #2563eb; color: #fff; border-color: #2563eb; }
  .btn.primary:disabled { background: #93c5fd; border-color: #93c5fd; cursor: not-allowed; }
  .btn.secondary { background: #e9e9e9; color: #333; border-color: #e9e9e9; }
  .error { color: #c00; font-size: 0.875rem; }
</style>
