<script lang="ts">
  import CommunitySidebar from '../components/CommunitySidebar.svelte';
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

  const PAGE_SIZE = 20;

  let units: HousingUnit[] = $state([]);
  let total = $state(0);
  let page = $state(1);
  let loading = $state(true);
  let error: string | null = $state(null);
  let unhoused: UnhousedMember[] = $state([]);
  let unhousedLoading = $state(true);

  interface RoleDto {
    id: string;
    title: string;
    description: string;
    kinPerMonth: number;
    memberId: string | null;
    memberName: string | null;
    active: boolean;
  }

  let roles = $state<RoleDto[]>([]);
  let assigningId = $state<string | null>(null);
  let assignInput = $state('');
  let assignError = $state('');

  async function load(p: number) {
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

  async function loadUnhoused() {
    try {
      const res = await fetch('/api/housing/unhoused');
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      unhoused = data.members;
    } finally {
      unhousedLoading = false;
    }
  }

  async function loadRoles() {
    try {
      const res = await fetch('/api/housing/roles');
      if (res.ok) roles = await res.json();
    } catch { /* silent */ }
  }

  async function assign(roleId: string) {
    assignError = '';
    const res = await fetch(`/api/housing/roles/${roleId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: assignInput.trim() }),
    });
    if (!res.ok) { assignError = (await res.json()).error ?? 'Failed'; return; }
    assigningId = null; assignInput = '';
    await loadRoles();
  }

  async function unassign(roleId: string) {
    await fetch(`/api/housing/roles/${roleId}/assign`, { method: 'DELETE' });
    await loadRoles();
  }

  load(1);
  loadUnhoused();
  loadRoles();

  const totalPages = $derived(Math.max(1, Math.ceil(total / PAGE_SIZE)));

  function amenityCount(u: HousingUnit) {
    return [u.hasRunningWater, u.hasToilet, u.hasElectricity, u.hasHeating, u.hasCooking].filter(Boolean).length;
  }
</script>

<div class="domain-layout">
<CommunitySidebar {navigate} />
<div class="domain-main">
<div class="page-header">
  <div>
    <h1>Housing</h1>
    <p class="subtitle">Community housing stock, habitability, and member accommodation</p>
  </div>
  <button class="new-btn" onclick={() => navigate('/housing/new')}>+ New unit</button>
</div>

{#if roles.length > 0}
  <section class="section">
    <h2>Roles</h2>
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
            <td>{role.memberName ?? '\u2014'}</td>
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
  </section>
{/if}

<section class="section">
  <div class="section-header">
    <h2>Units</h2>
    <span class="unit-count muted">{total} unit{total === 1 ? '' : 's'}</span>
  </div>

{#if loading}
  <p class="muted">Loading…</p>
{:else if error}
  <p class="error">{error}</p>
{:else if units.length === 0}
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
      <button disabled={page <= 1} onclick={() => load(page - 1)}>← Prev</button>
      <span>Page {page} of {totalPages}</span>
      <button disabled={page >= totalPages} onclick={() => load(page + 1)}>Next →</button>
    </div>
  {/if}
{/if}
</section>

<section class="unhoused-section">
  <h2>Unhoused Members</h2>
  {#if unhousedLoading}
    <p class="muted">Loading…</p>
  {:else if unhoused.length === 0}
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

</div>
</div>

<style>
  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 2rem;
  }

  h1 { margin: 0; font-size: 22px; font-weight: 600; }
  h2 { margin: 0 0 12px; font-size: 16px; font-weight: 600; }
  .subtitle { margin: 0.25rem 0 0; color: var(--color-muted, #888); font-size: 0.95rem; }

  .section { margin-bottom: 2.5rem; }
  .section-header { display: flex; align-items: baseline; gap: 10px; margin-bottom: 12px; }
  .section-header h2 { margin: 0; }
  .unit-count { font-size: 0.85rem; }

  .new-btn {
    margin-left: auto;
    background: var(--accent);
    border: none;
    border-radius: var(--radius);
    padding: 7px 16px;
    color: #fff;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
  }

  .table-wrap {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  th, td {
    padding: 10px 14px;
    text-align: left;
    border-bottom: 1px solid var(--border);
  }

  th {
    font-size: 0.78rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-secondary);
    background: var(--surface);
  }

  th.num, td.num { text-align: right; }

  tr.clickable { cursor: pointer; }
  tr.clickable:hover td { background: var(--surface); }

  tbody tr:last-child td { border-bottom: none; }

  td.name { font-weight: 500; }

  .amenity { font-size: 1rem; margin-right: 2px; }

  .badge {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .habitable    { background: #1b3a2d; color: #80cbc4; }
  .uninhabitable { background: #3a1b1b; color: #ef9a9a; }

  .pagination {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 20px;
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  .pagination button {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 6px 12px;
    cursor: pointer;
    font-size: 0.85rem;
    color: var(--text);
  }

  .pagination button:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .muted { color: var(--text-secondary); }

  .roles-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; margin-bottom: 0.5rem; }
  .roles-table th, .roles-table td { padding: 0.6rem 0.75rem; text-align: left; border-bottom: 1px solid var(--color-border, #e2e8f0); }
  .roles-table th { font-weight: 600; color: var(--color-muted, #555); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
  .role-title { font-weight: 500; }
  .role-desc { font-size: 0.8rem; color: var(--color-muted, #888); margin-top: 0.2rem; }
  .assign-row { display: flex; gap: 0.4rem; align-items: center; }
  .assign-row input { padding: 0.3rem 0.5rem; border: 1px solid var(--color-border, #ccc); border-radius: 4px; font-size: 0.85rem; width: 220px; }
  .unassign-btn { color: var(--color-danger, #dc2626); background: none; border: 1px solid var(--color-danger, #dc2626); border-radius: 4px; padding: 0.25rem 0.6rem; cursor: pointer; font-size: 0.8rem; }
  .unassign-btn:hover { background: #fef2f2; }

  .unhoused-section {
    margin-top: 40px;
  }

  .unhoused-section h2 {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: 600;
  }
  .error { color: #ef5350; }
</style>
