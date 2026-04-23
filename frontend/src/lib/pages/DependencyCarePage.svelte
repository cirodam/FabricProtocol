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
  let assigningId = $state<string | null>(null);
  let assignInput = $state("");
  let assignError = $state("");

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

  async function assign(roleId: string) {
    assignError = "";
    const res = await fetch(`/api/dependency-care/roles/${roleId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId: assignInput.trim() }),
    });
    if (!res.ok) { assignError = (await res.json()).error ?? "Failed"; return; }
    assigningId = null; assignInput = "";
    await load();
  }

  async function unassign(roleId: string) {
    await fetch(`/api/dependency-care/roles/${roleId}/assign`, { method: "DELETE" });
    await load();
  }

  load();
</script>

<div class="domain-layout">
<CommunitySidebar {navigate} />
<div class="domain-main">
<div class="page-header">
  <div>
    <h1>Dependency Care</h1>
    <p class="subtitle">Shared households, medical care units, and home caregiving for members with ongoing care needs</p>
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
              <td>{role.memberName ?? "\u2014"}</td>
              <td>
                {#if assigningId === role.id}
                  <div class="assign-row">
                    <input bind:value={assignInput} placeholder="Member ID" />
                    <button onclick={() => assign(role.id)}>Save</button>
                    <button onclick={() => { assigningId = null; assignInput = ""; assignError = ""; }}>Cancel</button>
                  </div>
                  {#if assignError}<span class="error">{assignError}</span>{/if}
                {:else if role.memberId}
                  <button class="unassign-btn" onclick={() => unassign(role.id)}>Unassign</button>
                {:else}
                  <button onclick={() => { assigningId = role.id; assignInput = ""; assignError = ""; }}>Assign</button>
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
  h1 { margin: 0; font-size: 22px; font-weight: 600; }
  .subtitle { margin: 0.25rem 0 0; color: var(--color-muted, #888); font-size: 0.95rem; }
  .muted { color: var(--text-secondary); }

  .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }

  .section { margin-bottom: 2.5rem; }
  .section-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
  h2 { font-size: 16px; font-weight: 600; margin: 0 0 12px; }
  .section-header h2 { margin: 0; font-size: 1rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-muted, #666); }
  .count { font-weight: 400; opacity: 0.7; }

  .roles-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; margin-bottom: 0.5rem; }
  .roles-table th, .roles-table td { padding: 0.6rem 0.75rem; text-align: left; border-bottom: 1px solid var(--color-border, #e2e8f0); }
  .roles-table th { font-weight: 600; color: var(--color-muted, #555); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
  .role-title { font-weight: 500; }
  .role-desc { font-size: 0.8rem; color: var(--color-muted, #888); margin-top: 0.2rem; }
  .assign-row { display: flex; gap: 0.4rem; align-items: center; }
  .assign-row input { padding: 0.3rem 0.5rem; border: 1px solid var(--color-border, #ccc); border-radius: 4px; font-size: 0.85rem; width: 220px; }
  .unassign-btn { color: var(--color-danger, #dc2626); background: none; border: 1px solid var(--color-danger, #dc2626); border-radius: 4px; padding: 0.25rem 0.6rem; cursor: pointer; font-size: 0.8rem; }
  .unassign-btn:hover { background: #fef2f2; }
  .error { color: var(--color-danger, #dc2626); font-size: 0.85rem; }

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
