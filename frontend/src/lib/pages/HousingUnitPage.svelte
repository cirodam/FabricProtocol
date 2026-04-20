<script lang="ts">
  const { id, navigate }: { id: string; navigate: (path: string) => void } = $props();

  interface Resident {
    id: string;
    name: string;
    handle: string;
  }

  interface HousingUnit {
    id: string;
    name: string;
    ownerId: string;
    latitude: number;
    longitude: number;
    hasRunningWater: boolean;
    hasToilet: boolean;
    hasElectricity: boolean;
    hasHeating: boolean;
    hasCooking: boolean;
    isHabitable: boolean;
    occupancy: number;
    residents: Resident[];
    createdAt: string;
  }

  let unit: HousingUnit | null = $state(null);
  let loading = $state(true);
  let error: string | null = $state(null);

  async function load() {
    try {
      const res = await fetch(`/api/housing/units/${id}`);
      if (!res.ok) throw new Error(res.status === 404 ? 'Unit not found' : `${res.status}`);
      unit = await res.json();
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  load();

  let deleting = $state(false);

  async function deleteUnit() {
    if (!confirm(`Remove "${unit?.name}"? This cannot be undone.`)) return;
    deleting = true;
    try {
      const res = await fetch(`/api/housing/units/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`${res.status}`);
      navigate('/housing');
    } catch (e) {
      error = (e as Error).message;
      deleting = false;
    }
  }

  function amenities(u: HousingUnit): { label: string; icon: string; value: boolean }[] {
    return [
      { label: 'Running Water', icon: '💧', value: u.hasRunningWater },
      { label: 'Toilet',        icon: '🚽', value: u.hasToilet },
      { label: 'Electricity',   icon: '⚡', value: u.hasElectricity },
      { label: 'Heating',       icon: '🔥', value: u.hasHeating },
      { label: 'Cooking',       icon: '🍳', value: u.hasCooking },
    ];
  }
</script>

<div class="page-header">
  <button class="back-btn" onclick={() => navigate('/housing')}>← Housing</button>
  {#if unit}
    <button class="delete-btn" onclick={deleteUnit} disabled={deleting}>
      {deleting ? 'Removing…' : 'Remove unit'}
    </button>
  {/if}
</div>

{#if loading}
  <p class="muted">Loading…</p>
{:else if error}
  <p class="error">{error}</p>
{:else if unit}
  <div class="header-row">
    <h1>{unit.name}</h1>
    {#if unit.isHabitable}
      <span class="badge habitable">Habitable</span>
    {:else}
      <span class="badge uninhabitable">Not habitable</span>
    {/if}
  </div>

  <div class="cards">
    <div class="card">
      <div class="card-title">Details</div>
      <dl>
        <dt>Added</dt>
        <dd>{new Date(unit.createdAt).toLocaleDateString()}</dd>
        {#if unit.latitude !== 0 || unit.longitude !== 0}
          <dt>Coordinates</dt>
          <dd>{unit.latitude.toFixed(5)}, {unit.longitude.toFixed(5)}</dd>
        {/if}
      </dl>
    </div>

    <div class="card">
      <div class="card-title">Amenities</div>
      <ul class="amenity-list">
        {#each amenities(unit) as a}
          <li class={a.value ? 'present' : 'absent'}>
            <span class="icon">{a.icon}</span>
            <span class="label">{a.label}</span>
            <span class="status">{a.value ? '✓' : '✗'}</span>
          </li>
        {/each}
      </ul>
    </div>
  </div>

  <div class="card full-width">
    <div class="card-title">Residents ({unit.occupancy})</div>
    {#if unit.residents.length === 0}
      <p class="muted">No residents assigned.</p>
    {:else}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Handle</th>
          </tr>
        </thead>
        <tbody>
          {#each unit.residents as r (r.id)}
            <tr>
              <td>
                <button class="link-btn" onclick={() => navigate(`/members/${r.id}`)}>
                  {r.name}
                </button>
              </td>
              <td class="muted">@{r.handle}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>
{/if}

<style>
  .page-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
  }

  .back-btn {
    background: none;
    border: none;
    padding: 0;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.9rem;
  }

  .back-btn:hover { color: var(--text); }

  .delete-btn {
    margin-left: auto;
    background: none;
    border: 1px solid #ef5350;
    border-radius: var(--radius);
    padding: 6px 14px;
    color: #ef5350;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
  }
  .delete-btn:hover:not(:disabled) { background: #3a1b1b; }
  .delete-btn:disabled { opacity: 0.5; cursor: default; }

  .header-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
  }

  h1 { margin: 0; font-size: 22px; font-weight: 600; }

  .cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    margin-bottom: 16px;
  }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
  }

  .full-width {
    margin-bottom: 16px;
  }

  .card-title {
    font-size: 0.78rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
    margin-bottom: 14px;
  }

  dl { display: grid; grid-template-columns: auto 1fr; gap: 6px 16px; margin: 0; }
  dt { color: var(--text-secondary); font-size: 0.85rem; }
  dd { margin: 0; font-size: 0.85rem; }

  .amenity-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .amenity-list li {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
  }

  .amenity-list .icon { font-size: 1rem; width: 1.4rem; }
  .amenity-list .label { flex: 1; }
  .amenity-list .status { font-weight: 700; }
  .amenity-list .present .status { color: #80cbc4; }
  .amenity-list .absent  .status { color: #ef9a9a; }
  li.absent { opacity: 0.5; }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  th, td {
    padding: 9px 12px;
    text-align: left;
    border-bottom: 1px solid var(--border);
  }

  th {
    font-size: 0.78rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-secondary);
  }

  tbody tr:last-child td { border-bottom: none; }

  .badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .habitable     { background: #1b3a2d; color: #80cbc4; }
  .uninhabitable { background: #3a1b1b; color: #ef9a9a; }

  .link-btn {
    background: none;
    border: none;
    padding: 0;
    color: var(--accent);
    cursor: pointer;
    font-size: inherit;
    font-family: inherit;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .link-btn:hover { opacity: 0.8; }

  .muted { color: var(--text-secondary); }
  .error { color: #ef5350; }
</style>
