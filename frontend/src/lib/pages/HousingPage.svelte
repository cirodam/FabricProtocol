<script lang="ts">
  import DomainPage from '../components/DomainPage.svelte';
  import DomainRolesTable from '../components/DomainRolesTable.svelte';
  const { navigate }: { navigate: (path: string) => void } = $props();

  interface HousingUnit {
    id: string;
    name: string;
    occupancy: number;
    isHabitable: boolean;
    hasRunningWater: boolean;
    hasToilet: boolean;
    hasElectricity: boolean;
    hasHeating: boolean;
    hasCooking: boolean;
    createdAt: string;
  }

  interface UnhousedMember {
    id: string;
    firstName: string;
    lastName: string;
    handle: string;
  }

  interface RoleDto {
    id: string;
    title: string;
    description: string;
    kinPerMonth: number;
    memberId: string | null;
    memberName: string | null;
    active: boolean;
  }

  const PAGE_SIZE = 20;

  let units: HousingUnit[] = $state([]);
  let total = $state(0);
  let page = $state(1);
  let loading = $state(true);
  let error: string | null = $state(null);
  let unhoused: UnhousedMember[] = $state([]);
  let roles = $state<RoleDto[]>([]);

  async function load(p = 1) {
    loading = true;
    error = null;
    try {
      const [unitsRes, unhousedRes, rolesRes] = await Promise.all([
        fetch(`/api/housing/units?page=${p}&pageSize=${PAGE_SIZE}`),
        fetch('/api/housing/unhoused'),
        fetch('/api/housing/roles'),
      ]);
      if (!unitsRes.ok) throw new Error(`${unitsRes.status}`);
      const data = await unitsRes.json();
      units = data.items;
      total = data.total;
      page = data.page;
      if (unhousedRes.ok) {
        const ud = await unhousedRes.json();
        unhoused = ud.members;
      }
      if (rolesRes.ok) roles = await rolesRes.json();
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  async function loadPage(p: number) {
    loading = true;
    error = null;
    try {
      const res = await fetch(`/api/housing/units?page=${p}&pageSize=${PAGE_SIZE}`);
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      units = data.items;
      total = data.total;
      page = data.page;
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  load(1);

  const totalPages = $derived(Math.max(1, Math.ceil(total / PAGE_SIZE)));

  function amenityCount(u: HousingUnit) {
    return [u.hasRunningWater, u.hasToilet, u.hasElectricity, u.hasHeating, u.hasCooking].filter(Boolean).length;
  }
</script>

{#snippet headerRight()}
  <button class="new-btn" onclick={() => navigate('/housing/new')}>+ New unit</button>
{/snippet}

<DomainPage
  {navigate}
  title="Housing"
  description="Community housing stock, habitability, and member accommodation"
  domainId="00000000-0000-0000-0000-000000000001"
  {loading}
  {error}
  {headerRight}
>
  <DomainRolesTable {roles} rolesUrl="/api/housing/roles" onChanged={() => load(page)} />

  <section class="section">
    <div class="section-header">
      <h2>Units</h2>
      <span class="unit-count muted">{total} unit{total === 1 ? '' : 's'}</span>
    </div>
    {#if units.length === 0}
      <p class="muted">No housing units recorded yet.</p>
    {:else}
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th class="num">Occupants</th>
              <th>Amenities</th>
              <th>Status</th>
              <th>Added</th>
            </tr>
          </thead>
          <tbody>
            {#each units as u (u.id)}
              <tr class="clickable" onclick={() => navigate(`/housing/${u.id}`)}>
                <td class="name">{u.name}</td>
                <td class="num">{u.occupancy}</td>
                <td>
                  <span class="amenities">
                    {#if u.hasRunningWater}<span class="amenity" title="Running water">💧</span>{/if}
                    {#if u.hasToilet}<span class="amenity" title="Toilet">🚽</span>{/if}
                    {#if u.hasElectricity}<span class="amenity" title="Electricity">⚡</span>{/if}
                    {#if u.hasHeating}<span class="amenity" title="Heating">🔥</span>{/if}
                    {#if u.hasCooking}<span class="amenity" title="Cooking">🍳</span>{/if}
                    {#if amenityCount(u) === 0}<span class="muted">—</span>{/if}
                  </span>
                </td>
                <td>
                  {#if u.isHabitable}
                    <span class="badge habitable">Habitable</span>
                  {:else}
                    <span class="badge uninhabitable">Not habitable</span>
                  {/if}
                </td>
                <td class="muted">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      {#if totalPages > 1}
        <div class="pagination">
          <button disabled={page <= 1} onclick={() => loadPage(page - 1)}>← Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page >= totalPages} onclick={() => loadPage(page + 1)}>Next →</button>
        </div>
      {/if}
    {/if}
  </section>

  <section class="unhoused-section">
    <h2>Unhoused Members</h2>
    {#if unhoused.length === 0}
      <p class="muted">All members have housing.</p>
    {:else}
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Handle</th>
            </tr>
          </thead>
          <tbody>
            {#each unhoused as m (m.id)}
              <tr class="clickable" onclick={() => navigate(`/members/${m.id}`)}>
                <td>{m.firstName} {m.lastName}</td>
                <td class="muted">{m.handle ? '@' + m.handle : '—'}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </section>
</DomainPage>

<style>
  h2 { margin: 0 0 12px; font-size: 16px; font-weight: 600; }
  .section { margin-bottom: 2.5rem; }
  .section-header { display: flex; align-items: baseline; gap: 10px; margin-bottom: 12px; }
  .section-header h2 { margin: 0; }
  .unit-count { font-size: 0.85rem; }
  .unhoused-section { margin-top: 40px; }
  .unhoused-section h2 { margin: 0 0 16px; font-size: 16px; font-weight: 600; }

  .new-btn { margin-left: auto; background: var(--accent); border: none; border-radius: var(--radius); padding: 7px 16px; color: #fff; font-size: 0.85rem; font-weight: 600; cursor: pointer; }

  .table-wrap { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
  table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  th, td { padding: 10px 14px; text-align: left; border-bottom: 1px solid var(--border); }
  th { font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-secondary); background: var(--surface); }
  th.num, td.num { text-align: right; }
  tr.clickable { cursor: pointer; }
  tr.clickable:hover td { background: var(--surface); }
  tbody tr:last-child td { border-bottom: none; }
  td.name { font-weight: 500; }

  .amenity { font-size: 1rem; margin-right: 2px; }

  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
  .habitable    { background: #1b3a2d; color: #80cbc4; }
  .uninhabitable { background: #3a1b1b; color: #ef9a9a; }

  .pagination { display: flex; align-items: center; gap: 12px; margin-top: 20px; font-size: 0.9rem; color: var(--text-secondary); }
  .pagination button { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 6px 12px; cursor: pointer; font-size: 0.85rem; color: var(--text); }
  .pagination button:disabled { opacity: 0.4; cursor: default; }

  .muted { color: var(--text-secondary); }
</style>
