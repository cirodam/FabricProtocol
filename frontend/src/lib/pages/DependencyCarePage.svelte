<script lang="ts">
  const { navigate }: { navigate: (path: string) => void } = $props();

  interface SharedHousehold {
    id: string;
    name: string;
    description: string;
    staffCount: number;
    createdAt: string;
  }

  interface MedicalCareUnit {
    id: string;
    name: string;
    description: string;
    staffCount: number;
    createdAt: string;
  }

  let households: SharedHousehold[] = $state([]);
  let medicalUnits: MedicalCareUnit[] = $state([]);
  let loading = $state(true);
  let error: string | null = $state(null);

  async function load() {
    try {
      const [hRes, mRes] = await Promise.all([
        fetch('/api/dependency-care/households'),
        fetch('/api/dependency-care/medical-care-units'),
      ]);
      if (!hRes.ok) throw new Error(`households ${hRes.status}`);
      if (!mRes.ok) throw new Error(`medical-care-units ${mRes.status}`);
      const hData = await hRes.json();
      const mData = await mRes.json();
      households   = hData.households;
      medicalUnits = mData.units;
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  load();
</script>

<div class="page-header">
  <h1>Dependency Care</h1>
</div>

{#if loading}
  <p class="muted">Loading…</p>
{:else if error}
  <p class="error">{error}</p>
{:else}
  <section class="section">
    <div class="section-header">
      <h2>Shared Households <span class="count">{households.length}</span></h2>
      <button class="new-btn" onclick={() => navigate('/dependency-care/households/new')}>+ New household</button>
    </div>
    {#if households.length === 0}
      <p class="muted">No shared households yet.</p>
    {:else}
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Description</th><th class="num">Staff</th><th>Added</th></tr>
          </thead>
          <tbody>
            {#each households as h (h.id)}
              <tr class="clickable" onclick={() => navigate(`/dependency-care/households/${h.id}`)}>
                <td class="name">{h.name}</td>
                <td class="muted">{h.description || '—'}</td>
                <td class="num">{h.staffCount}</td>
                <td class="muted">{new Date(h.createdAt).toLocaleDateString()}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </section>

  <section class="section">
    <div class="section-header">
      <h2>Medical Care Units <span class="count">{medicalUnits.length}</span></h2>
      <button class="new-btn" onclick={() => navigate('/dependency-care/medical-care-units/new')}>+ New unit</button>
    </div>
    {#if medicalUnits.length === 0}
      <p class="muted">No medical care units yet.</p>
    {:else}
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Description</th><th class="num">Staff</th><th>Added</th></tr>
          </thead>
          <tbody>
            {#each medicalUnits as u (u.id)}
              <tr class="clickable" onclick={() => navigate(`/dependency-care/medical-care-units/${u.id}`)}>
                <td class="name">{u.name}</td>
                <td class="muted">{u.description || '—'}</td>
                <td class="num">{u.staffCount}</td>
                <td class="muted">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </section>
{/if}

<style>
  h1 { margin: 0 0 12px; font-size: 22px; font-weight: 600; }
  .muted { color: var(--text-secondary); }

  .section { margin-bottom: 2.5rem; }
  .section-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
  .section-header h2 { margin: 0; font-size: 1rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-muted, #666); }
  .count { font-weight: 400; opacity: 0.7; }

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
</style>
