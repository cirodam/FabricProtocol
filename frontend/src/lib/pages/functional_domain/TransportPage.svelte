<script lang="ts">
  import DomainPage from '../../components/DomainPage.svelte';
  import DomainRolesTable from '../../components/DomainRolesTable.svelte';
  const { navigate }: { navigate: (path: string) => void } = $props();

  interface RoleDto { id: string; title: string; description: string; kinPerMonth: number; memberId: string | null; memberName: string | null; active: boolean; }
  interface RouteDto { id: string; name: string; description: string; stops: string[]; scheduleDescription: string; operatorId: string | null; operatorName: string | null; }

  let roles       = $state<RoleDto[]>([]);
  let routes      = $state<RouteDto[]>([]);
  let loading     = $state(true);
  let error: string | null = $state(null);

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

  load();
</script>

<DomainPage
  {navigate}
  title="Transport"
  description="Community people-mover routes, operators, and mobility services"
  domainId="00000000-0000-0000-0000-000000000015"
  {loading}
  {error}
>
  <DomainRolesTable {roles} rolesUrl="/api/transport/roles" onChanged={load} />

  <section class="section">
    <div class="section-header">
      <h2>Transit Routes <span class="count">{routes.length}</span></h2>
    </div>
    {#if routes.length === 0}
      <p class="muted">No routes defined.</p>
    {:else}
      <table class="data-table">
        <thead><tr><th>Route</th><th>Schedule</th><th>Stops</th><th>Operator</th></tr></thead>
        <tbody>
          {#each routes as route (route.id)}
            <tr>
              <td>
                <div class="row-title">{route.name}</div>
                {#if route.description}<div class="row-desc">{route.description}</div>{/if}
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
</DomainPage>

<style>
  h2 { margin: 0 0 12px; font-size: 16px; font-weight: 600; }
  .section { margin-bottom: 2.5rem; }
  .section-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 12px; }
  .section-header h2 { margin: 0; }
  .count { font-size: 0.8rem; font-weight: 400; color: var(--color-muted, #888); background: var(--color-bg-subtle, #f1f5f9); padding: 0.1rem 0.45rem; border-radius: 10px; }
  .data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  .data-table th, .data-table td { padding: 0.6rem 0.75rem; text-align: left; border-bottom: 1px solid var(--color-border, #e2e8f0); }
  .data-table th { font-weight: 600; color: var(--color-muted, #555); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
  .row-title { font-weight: 500; }
  .row-desc { font-size: 0.8rem; color: var(--color-muted, #888); margin-top: 0.2rem; }
  .stops-list { margin: 0; padding-left: 1.2rem; font-size: 0.85rem; }
  .stops-list li { margin: 0.1rem 0; }
  .muted { color: var(--color-muted, #888); }
  .muted-inline { color: var(--color-muted, #888); font-style: italic; }
</style>
