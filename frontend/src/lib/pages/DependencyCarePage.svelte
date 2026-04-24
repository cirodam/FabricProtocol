<script lang="ts">
  import DomainPage from '../components/DomainPage.svelte';
  import DomainRolesTable from '../components/DomainRolesTable.svelte';
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

  interface RoleDto {
    id: string;
    title: string;
    description: string;
    kinPerMonth: number;
    memberId: string | null;
    memberName: string | null;
    active: boolean;
  }

  let households: SharedHousehold[] = $state([]);
  let medicalUnits: MedicalCareUnit[] = $state([]);
  let homeCaregiving: HomeCaregivingInfo | null = $state(null);
  let roles       = $state<RoleDto[]>([]);
  let loading = $state(true);
  let error: string | null = $state(null);

  async function load() {
    try {
      const [hRes, mRes, hcgRes, rolesRes] = await Promise.all([
        fetch('/api/dependency-care/households'),
        fetch('/api/dependency-care/medical-care-units'),
        fetch('/api/dependency-care/home-caregiving'),
        fetch('/api/dependency-care/roles'),
      ]);
      if (!hRes.ok) throw new Error(`households ${hRes.status}`);
      if (!mRes.ok) throw new Error(`medical-care-units ${mRes.status}`);
      if (!rolesRes.ok) throw new Error(`roles ${rolesRes.status}`);
      const hData = await hRes.json();
      const mData = await mRes.json();
      households   = hData.households;
      medicalUnits = mData.units;
      if (hcgRes.ok) homeCaregiving = await hcgRes.json();
      roles = await rolesRes.json();
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
  title="Dependency Care"
  description="Shared households, medical care units, and home caregiving for members with ongoing care needs"
  domainId="00000000-0000-0000-0000-000000000011"
  {loading}
  {error}
>
  <DomainRolesTable {roles} rolesUrl="/api/dependency-care/roles" onChanged={load} />

  <section class="section">
    <div class="section-header">
      <h2>Shared Households <span class="count">{households.length}</span></h2>
      <button class="new-btn" onclick={() => navigate('/domains/00000000-0000-0000-0000-000000000011/units/new')}>+ New household</button>
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
              <tr class="clickable" onclick={() => navigate(`/domains/00000000-0000-0000-0000-000000000011/units/${h.id}`)}>
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
      <button class="new-btn" onclick={() => navigate('/domains/00000000-0000-0000-0000-000000000011/units/new')}>+ New unit</button>
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
              <tr class="clickable" onclick={() => navigate(`/domains/00000000-0000-0000-0000-000000000011/units/${u.id}`)}>
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
</DomainPage>

<style>
  .section { margin-bottom: 2.5rem; }
  .section-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
  .section-header h2 { margin: 0; font-size: 1rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-muted, #666); }
  .count { font-weight: 400; opacity: 0.7; }
  .new-btn { margin-left: auto; background: var(--accent); border: none; border-radius: var(--radius); padding: 7px 16px; color: #fff; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
  .view-btn { margin-left: auto; background: none; border: 1px solid var(--color-border, #e2e8f0); border-radius: var(--radius); padding: 5px 14px; font-size: 0.85rem; cursor: pointer; color: var(--color-primary, #2563eb); }
  .table-wrap { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
  table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  th, td { padding: 10px 14px; text-align: left; border-bottom: 1px solid var(--border); }
  th { font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-secondary); background: var(--surface); }
  th.num, td.num { text-align: right; }
  tr.clickable { cursor: pointer; }
  tr.clickable:hover td { background: var(--surface); }
  tbody tr:last-child td { border-bottom: none; }
  td.name { font-weight: 500; }
  .hcg-card { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border: 1px solid var(--color-border, #e2e8f0); border-radius: 8px; cursor: pointer; background: var(--color-surface, #fff); }
  .hcg-card:hover { background: var(--color-hover, #f8fafc); }
  .hcg-label { font-size: 0.9rem; font-weight: 500; }
  .hcg-staff { font-size: 0.85rem; color: var(--color-muted, #888); }
  .muted { color: var(--text-secondary); }
</style>
