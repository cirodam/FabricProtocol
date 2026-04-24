<script lang="ts">
  const { domainId, navigate }: { domainId: string; navigate: (p: string) => void } = $props();

  interface UnitDto { id: string; name: string; type: string; description: string; payroll: number; roleCount: number; }
  interface UnitTemplate { type: string; label: string; description: string; }

  let units     = $state<UnitDto[]>([]);
  let templates = $state<UnitTemplate[]>([]);
  let loading   = $state(true);
  let error     = $state('');

  let adding          = $state(false);
  let selectedType    = $state('');
  let working         = $state(false);
  let addError        = $state('');

  async function load() {
    loading = true; error = '';
    try {
      const [uRes, tRes] = await Promise.all([
        fetch(`/api/domains/${domainId}/units`),
        fetch(`/api/domains/${domainId}/units/templates`),
      ]);
      units     = uRes.ok  ? await uRes.json()  : [];
      templates = tRes.ok  ? await tRes.json()  : [];
      if (!selectedType && templates.length) selectedType = templates[0].type;
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  async function createUnit() {
    if (!selectedType) return;
    working = true; addError = '';
    try {
      const res = await fetch(`/api/domains/${domainId}/units`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: selectedType }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error ?? `HTTP ${res.status}`); }
      adding = false;
      await load();
    } catch (e) {
      addError = (e as Error).message;
    } finally {
      working = false;
    }
  }

  async function removeUnit(id: string) {
    await fetch(`/api/domains/${domainId}/units/${id}`, { method: 'DELETE' });
    await load();
  }

  function fmtKin(n: number) { return n.toLocaleString(undefined, { maximumFractionDigits: 0 }); }

  load();
</script>

<section class="units-section">
  <div class="section-header">
    <h2>Functional Units</h2>
    {#if !adding && templates.length > 0}
      <button class="new-btn" onclick={() => { adding = true; }}>+ Add unit</button>
    {/if}
  </div>

  {#if loading}
    <p class="muted">Loading…</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else}
    {#if adding}
      <div class="add-form">
        {#if addError}<p class="error">{addError}</p>{/if}
        <select bind:value={selectedType} disabled={working}>
          {#each templates as t (t.type)}
            <option value={t.type}>{t.label}</option>
          {/each}
        </select>
        {#if selectedType}
          <p class="template-desc muted">{templates.find(t => t.type === selectedType)?.description ?? ''}</p>
        {/if}
        <div class="form-actions">
          <button class="btn-sm" onclick={createUnit} disabled={working || !selectedType}>
            {working ? 'Creating…' : 'Create'}
          </button>
          <button class="btn-sm secondary" onclick={() => { adding = false; addError = ''; }}>Cancel</button>
        </div>
      </div>
    {/if}

    {#if units.length === 0 && !adding}
      <p class="muted">No functional units yet.</p>
    {:else if units.length > 0}
      <div class="units-list">
        {#each units as u (u.id)}
          <div class="unit-card">
            <div class="unit-info">
              <button class="unit-link" onclick={() => navigate(`/domains/${domainId}/units/${u.id}`)}>{u.name}</button>
              <span class="unit-type">{u.type}</span>
              {#if u.description}<p class="unit-desc">{u.description}</p>{/if}
            </div>
            <div class="unit-meta">
              <span>{u.roleCount} role{u.roleCount === 1 ? '' : 's'}</span>
              {#if u.payroll > 0}<span>{fmtKin(u.payroll)} kin/mo</span>{/if}
              <button class="remove-btn" onclick={() => removeUnit(u.id)}>Remove</button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
</section>

<style>
  .units-section { margin-top: 1.5rem; }
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
  .section-header h2 { margin: 0; font-size: 1.05rem; font-weight: 600; }

  .new-btn { font-size: 0.8rem; padding: 0.25rem 0.7rem; background: var(--accent, #2563eb); color: #fff; border: none; border-radius: 4px; cursor: pointer; }

  .units-list { display: flex; flex-direction: column; gap: 0.5rem; }
  .unit-card { display: flex; justify-content: space-between; align-items: flex-start; padding: 0.75rem 0.875rem; border: 1px solid var(--border, #e5e7eb); border-radius: 6px; background: var(--surface, #fff); }
  .unit-info { display: flex; flex-direction: column; gap: 0.15rem; }
  .unit-link { font-weight: 600; font-size: 0.875rem; background: none; border: none; padding: 0; cursor: pointer; text-align: left; color: var(--accent, #2563eb); text-decoration: underline; text-underline-offset: 2px; }
  .unit-type { font-size: 0.7rem; color: var(--text-secondary, #888); font-family: monospace; }
  .unit-desc { font-size: 0.75rem; margin: 0.25rem 0 0; color: var(--text-secondary, #888); }
  .unit-meta { display: flex; align-items: center; gap: 0.75rem; font-size: 0.8rem; color: var(--text-secondary, #888); flex-shrink: 0; }

  .add-form { padding: 0.875rem; border: 1px solid var(--border, #e5e7eb); border-radius: 6px; background: var(--surface, #fff); margin-bottom: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; }
  .add-form select { font-size: 0.8rem; padding: 0.35rem 0.5rem; border: 1px solid var(--border, #e5e7eb); border-radius: 4px; }
  .template-desc { margin: 0; font-size: 0.8rem; }
  .form-actions { display: flex; gap: 0.5rem; }

  .btn-sm { font-size: 0.8rem; padding: 0.25rem 0.65rem; border: 1px solid var(--border, #d1d5db); border-radius: 4px; background: var(--surface, #fff); cursor: pointer; }
  .btn-sm.secondary { color: var(--text-secondary, #555); }
  .btn-sm:disabled { opacity: 0.5; cursor: not-allowed; }

  .remove-btn { font-size: 0.75rem; padding: 0.2rem 0.5rem; border: 1px solid #ef5350; border-radius: 4px; background: transparent; color: #ef5350; cursor: pointer; }

  .muted { color: var(--text-secondary, #888); font-size: 0.875rem; }
  .error { color: #c00; font-size: 0.875rem; margin: 0; }
</style>
