<script lang="ts">
  import CommunitySidebar from '../components/CommunitySidebar.svelte';

  const { domainId, unitId, navigate }:
    { domainId: string; unitId: string; navigate: (p: string) => void } = $props();

  interface RoleDto {
    id: string; title: string; description: string;
    kinPerMonth: number; memberId: string | null; memberName: string | null; active: boolean;
  }
  interface UnitDetail {
    id: string; name: string; type: string; description: string;
    createdAt: string; payroll: number; roles: RoleDto[];
  }

  let unit     = $state<UnitDetail | null>(null);
  let loading  = $state(true);
  let error    = $state('');

  let newTitle       = $state('');
  let newDescription = $state('');
  let newKin         = $state(0);
  let addingRole     = $state(false);
  let addError       = $state('');

  async function load() {
    loading = true; error = '';
    try {
      const res = await fetch(`/api/domains/${domainId}/units/${unitId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      unit = await res.json();
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  async function addRole(ev: Event) {
    ev.preventDefault();
    if (!newTitle.trim()) { addError = 'Title is required'; return; }
    addError = '';
    const res = await fetch(`/api/domains/${domainId}/units/${unitId}/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.trim(), description: newDescription.trim(), kinPerMonth: newKin }),
    });
    if (!res.ok) { addError = (await res.json()).error ?? 'Failed'; return; }
    newTitle = ''; newDescription = ''; newKin = 0;
    await load();
  }

  async function removeRole(roleId: string) {
    await fetch(`/api/domains/${domainId}/units/${unitId}/roles/${roleId}`, { method: 'DELETE' });
    await load();
  }

  async function deleteUnit() {
    if (!confirm(`Delete ${unit?.name}? This cannot be undone.`)) return;
    await fetch(`/api/domains/${domainId}/units/${unitId}`, { method: 'DELETE' });
    navigate(`/domains/${domainId}`);
  }

  load();
</script>

<div class="layout">
  <CommunitySidebar {navigate} />
  <main class="main">
    {#if loading}
      <p class="muted">Loading…</p>
    {:else if error}
      <p class="error">{error}</p>
    {:else if unit}
      <div class="page-header">
        <div>
          <h1>{unit.name}</h1>
          <span class="type-badge">{unit.type}</span>
        </div>
        <button class="btn danger-outline" onclick={deleteUnit}>Delete unit</button>
      </div>

      {#if unit.description}
        <p class="desc">{unit.description}</p>
      {/if}

      <!-- Roles -->
      <section class="card" style="margin-top: 1.5rem;">
        <h2>Roles <span class="budget-badge">{unit.payroll} kin/mo</span></h2>

        {#if unit.roles.length === 0}
          <p class="muted">No roles defined.</p>
        {:else}
          <table class="table">
            <thead><tr><th>Title</th><th>Salary</th><th>Holder</th><th></th></tr></thead>
            <tbody>
              {#each unit.roles as role (role.id)}
                <tr>
                  <td>
                    <div class="role-title">{role.title}</div>
                    {#if role.description}<div class="role-desc">{role.description}</div>{/if}
                  </td>
                  <td>{role.kinPerMonth} kin/mo</td>
                  <td>
                    {#if role.memberName}
                      {role.memberName}
                    {:else}
                      <span class="muted-inline">Unassigned</span>
                    {/if}
                  </td>
                  <td><button class="btn danger-outline btn-sm" onclick={() => removeRole(role.id)}>Remove</button></td>
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}

        <details class="add-role-form" style="margin-top: 1rem;">
          <summary class="btn secondary btn-sm">Add role</summary>
          <form onsubmit={addRole} style="margin-top: 0.75rem; display:flex; flex-direction:column; gap:0.5rem; max-width:400px;">
            {#if addError}<p class="error">{addError}</p>{/if}
            <input class="input" bind:value={newTitle} placeholder="Role title" required />
            <input class="input" bind:value={newDescription} placeholder="Description (optional)" />
            <input class="input" type="number" bind:value={newKin} placeholder="kin/month" min="0" />
            <button class="btn primary btn-sm" type="submit">Add</button>
          </form>
        </details>
      </section>
    {/if}
  </main>
</div>

<style>
  .layout { display: flex; min-height: 100vh; }
  .main { flex: 1; padding: 2rem; max-width: 800px; }
  .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
  h1 { font-size: 1.5rem; font-weight: 700; margin: 0; }
  .type-badge { font-size: 0.75rem; background: #e0e7ff; color: #3730a3; border-radius: 10px; padding: 0.1rem 0.5rem; font-weight: 500; }
  .desc { color: #555; margin: 0.5rem 0 0; }
  .card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 1.25rem; }
  h2 { font-size: 1.1rem; font-weight: 600; margin: 0 0 1rem; display: flex; align-items: center; gap: 0.5rem; }
  .budget-badge { font-size: 0.8rem; font-weight: 500; background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; border-radius: 10px; padding: 0.1rem 0.5rem; }
  .table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
  .table th, .table td { padding: 0.5rem 0.4rem; text-align: left; border-bottom: 1px solid #eee; }
  .table th { font-weight: 600; color: #555; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em; }
  .role-title { font-weight: 500; }
  .role-desc { font-size: 0.8rem; color: #888; }
  .muted { color: #888; font-style: italic; }
  .muted-inline { color: #aaa; font-style: italic; font-size: 0.85em; }
  .error { color: #c00; font-size: 0.875rem; }
  .input { border: 1px solid #d1d5db; border-radius: 6px; padding: 0.4rem 0.6rem; font-size: 0.875rem; width: 100%; box-sizing: border-box; }
  .btn { padding: 0.4rem 0.9rem; border-radius: 6px; border: 1px solid transparent; font-size: 0.875rem; cursor: pointer; font-weight: 500; }
  .btn-sm { padding: 0.25rem 0.6rem; font-size: 0.8rem; }
  .btn.primary { background: #2563eb; color: #fff; border-color: #2563eb; }
  .btn.secondary { background: #e9e9e9; color: #333; border-color: #e9e9e9; }
  .btn.danger-outline { background: none; color: #c00; border-color: #c00; }
  .add-role-form summary { cursor: pointer; display: inline-block; }
</style>
