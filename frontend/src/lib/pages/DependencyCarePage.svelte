<script lang="ts">
  import CouncilPanel from '../components/CouncilPanel.svelte';
  import CommunitySidebar from '../components/CommunitySidebar.svelte';
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

  interface HomeCaregivingInfo {
    id: string;
    staffCount: number;
  }

  let households: SharedHousehold[] = $state([]);
  let medicalUnits: MedicalCareUnit[] = $state([]);
  let homeCaregiving: HomeCaregivingInfo | null = $state(null);
  let loading = $state(true);
  let error: string | null = $state(null);

  async function load() {
    try {
      const [hRes, mRes, hcgRes] = await Promise.all([
        fetch('/api/dependency-care/households'),
        fetch('/api/dependency-care/medical-care-units'),
        fetch('/api/dependency-care/home-caregiving'),
      ]);
      if (!hRes.ok) throw new Error(`households ${hRes.status}`);
      if (!mRes.ok) throw new Error(`medical-care-units ${mRes.status}`);
      const hData = await hRes.json();
      const mData = await mRes.json();
      households   = hData.households;
      medicalUnits = mData.units;
      if (hcgRes.ok) homeCaregiving = await hcgRes.json();
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  load();
</script>

<div class="domain-layout">
<CommunitySidebar {navigate} />
<div class="domain-main">
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

  <section class="section">
    <div class="section-header">
      <h2>Home Caregiving</h2>
      {#if homeCaregiving}
        <button class="view-btn" onclick={() => navigate('/dependency-care/home-caregiving')}>View →</button>
      {/if}
    </div>
    {#if homeCaregiving}
      <div class="hcg-card" role="button" tabindex="0"
        onclick={() => navigate('/dependency-care/home-caregiving')}
        onkeydown={e => e.key === 'Enter' && navigate('/dependency-care/home-caregiving')}>
        <span class="hcg-label">Home Caregiving Program</span>
        <span class="hcg-staff">{homeCaregiving.staffCount} staff</span>
      </div>
    {:else}
      <p class="muted">Not yet initialised.</p>
    {/if}
  </section>
  <CouncilPanel domainId="00000000-0000-0000-0000-000000000011" {navigate} />
{/if}
</div>
</div>

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
  .view-btn {
    margin-left: auto;
    background: none;
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: var(--radius);
    padding: 5px 14px;
    font-size: 0.85rem;
    cursor: pointer;
    color: var(--color-primary, #2563eb);
  }
  .hcg-card {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.75rem 1rem;
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: 8px;
    cursor: pointer;
    background: var(--color-surface, #fff);
  }
  .hcg-card:hover { background: var(--color-hover, #f8fafc); }
  .hcg-label { font-size: 0.9rem; font-weight: 500; }
  .hcg-staff { font-size: 0.85rem; color: var(--color-muted, #888); }
</style>
