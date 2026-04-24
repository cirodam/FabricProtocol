<script lang="ts">
  import CommunitySidebar from '../components/CommunitySidebar.svelte';
  const { navigate }: { navigate: (path: string) => void } = $props();

  interface RoleDto {
    id: string; title: string; description: string;
    kinPerMonth: number; memberId: string | null; memberName: string | null; active: boolean;
  }

  interface RouteDto {
    id: string; name: string; description: string;
    stops: string[]; scheduleDescription: string;
    operatorId: string | null; operatorName: string | null;
  }

  let roles       = $state<RoleDto[]>([]);
  let routes      = $state<RouteDto[]>([]);
  let loading     = $state(true);
  let error: string | null = $state(null);
  let assigningId = $state<string | null>(null);
  let assignInput = $state('');
  let assignError = $state('');

  async function load() {
    try {
      const [rolesRes, routesRes] = await Promise.all([
        fetch('/api/transport/roles'),
        fetch('/api/transport/routes'),
      ]);
      if (!rolesRes.ok)  throw new Error(`roles ${rolesRes.status}`);
      if (!routesRes.ok) throw new Error(`routes ${routesRes.status}`);
      [roles, routes] = await Promise.all([rolesRes.json(), routesRes.json()]);
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  async function assign(roleId: string) {
    assignError = '';
    const res = await fetch(`/api/transport/roles/${roleId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: assignInput.trim() }),
    });
    if (!res.ok) { assignError = (await res.json()).error ?? 'Failed'; return; }
    assigningId = null; assignInput = '';
    await load();
  }

  async function unassign(roleId: string) {
    await fetch(`/api/transport/roles/${roleId}/assign`, { method: 'DELETE' });
    await load();
  }

  load();
</script>

<div class="domain-layout">
<CommunitySidebar {navigate} />
<div class="domain-main">
<div class="page-header">
  <div>
    <h1>Transport</h1>
    <p class="subtitle">Community people-mover routes, operators, and mobility services</p>
  </div>
</div>

{#if loading}
  <p class="muted">Loading…</p>
{:else if error}
  <p class="error">{error}</p>
{:else}
  <section class="section">
    <h2>Roles</h2>
    {#if roles.length === 0}
      <p class="muted">No roles defined.</p>
    {:else}
      <table class="roles-table">
        <thead><tr><th>Title</th><th>Kin/month</th><th>Assigned To</th><th></th></tr></thead>
        <tbody>
          {#each roles as role (role.id)}
            <tr>
              <td>
                <div class="role-title">{role.title}</div>
                {#if role.description}<div class="role-desc">{role.description}</div>{/if}
              </td>
              <td>{role.kinPerMonth}</td>
              <td>{role.memberName ?? '—'}</td>
              <td>
                {#if assigningId === role.id}
                  <div class="assign-row">
                    <input bind:value={assignInput} placeholder="Member ID" />
                    <button onclick={() => assign(role.id)}>Save</button>
                    <button onclick={() => { assigningId = null; assignInput = ''; assignError = ''; }}>Cancel</button>
                  </div>
                  {#if assignError}<span class="error">{assignError}</span>{/if}
                {:else if role.memberId}
                  <button class="unassign-btn" onclick={() => unassign(role.id)}>Unassign</button>
                {:else}
                  <button onclick={() => { assigningId = role.id; assignInput = ''; assignError = ''; }}>Assign</button>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </section>

  <section class="section">
    <div class="section-header">
      <h2>Transit Routes <span class="count">{routes.length}</span></h2>
    </div>
    {#if routes.length === 0}
      <p class="muted">No routes defined.</p>
    {:else}
      <table class="roles-table">
        <thead><tr><th>Route</th><th>Schedule</th><th>Stops</th><th>Operator</th></tr></thead>
        <tbody>
          {#each routes as route (route.id)}
            <tr>
              <td>
                <div class="role-title">{route.name}</div>
                {#if route.description}<div class="role-desc">{route.description}</div>{/if}
              </td>
              <td>{route.scheduleDescription || '—'}</td>
              <td>
                {#if route.stops.length > 0}
                  <ol class="stops-list">
                    {#each route.stops as stop}<li>{stop}</li>{/each}
                  </ol>
                {:else}
                  —
                {/if}
              </td>
              <td>{#if route.operatorName}{route.operatorName}{:else}<span class="muted-inline">Unassigned</span>{/if}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </section>

{/if}
</div>
</div>

<style>
  .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
  h1 { margin: 0; font-size: 22px; font-weight: 600; }
  h2 { margin: 0 0 12px; font-size: 16px; font-weight: 600; }
  .subtitle { margin: 0.25rem 0 0; color: var(--color-muted, #888); font-size: 0.95rem; }

  .section { margin-bottom: 2.5rem; }
  .section-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 12px; }
  .section-header h2 { margin: 0; }
  .count { font-size: 0.8rem; font-weight: 400; color: var(--color-muted, #888); background: var(--color-bg-subtle, #f1f5f9); padding: 0.1rem 0.45rem; border-radius: 10px; }

  .roles-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  .roles-table th, .roles-table td { padding: 0.6rem 0.75rem; text-align: left; border-bottom: 1px solid var(--color-border, #e2e8f0); }
  .roles-table th { font-weight: 600; color: var(--color-muted, #555); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
  .role-title { font-weight: 500; }
  .role-desc { font-size: 0.8rem; color: var(--color-muted, #888); margin-top: 0.2rem; }
  .assign-row { display: flex; gap: 0.4rem; align-items: center; }
  .assign-row input { padding: 0.3rem 0.5rem; border: 1px solid var(--color-border, #ccc); border-radius: 4px; font-size: 0.85rem; width: 220px; }
  .unassign-btn { color: var(--color-danger, #dc2626); background: none; border: 1px solid var(--color-danger, #dc2626); border-radius: 4px; padding: 0.25rem 0.6rem; cursor: pointer; font-size: 0.8rem; }
  .unassign-btn:hover { background: #fef2f2; }

  .stops-list { margin: 0; padding-left: 1.2rem; font-size: 0.85rem; }
  .stops-list li { margin: 0.1rem 0; }
  .muted { color: var(--color-muted, #888); }
  .muted-inline { color: var(--color-muted, #888); font-style: italic; }
  .error { color: var(--color-danger, #dc2626); font-size: 0.85rem; }

  .domain-layout { display: flex; min-height: 100vh; }
  .domain-main { flex: 1; padding: 32px 40px; max-width: 860px; }
</style>
