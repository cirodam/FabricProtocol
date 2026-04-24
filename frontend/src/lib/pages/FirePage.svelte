<script lang="ts">
  import CommunitySidebar from '../components/CommunitySidebar.svelte';
  import DomainPoolPanel from '../components/DomainPoolPanel.svelte';
  const { navigate }: { navigate: (path: string) => void } = $props();

  interface FireCompany {
    id: string;
    name: string;
    description: string;
    staffCount: number;
    createdAt: string;
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

  let companies: FireCompany[] = $state([]);
  let roles = $state<RoleDto[]>([]);
  let loading = $state(true);
  let error: string | null = $state(null);
  let assigningId = $state<string | null>(null);
  let assignInput = $state('');
  let assignError = $state('');

  async function load() {
    try {
      const [compRes, rolesRes] = await Promise.all([
        fetch('/api/fire/companies'),
        fetch('/api/fire/roles'),
      ]);
      if (!compRes.ok) throw new Error(`${compRes.status}`);
      const data = await compRes.json();
      companies = data.companies;
      if (rolesRes.ok) roles = await rolesRes.json();
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  async function assign(roleId: string) {
    assignError = '';
    const res = await fetch(`/api/fire/roles/${roleId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: assignInput.trim() }),
    });
    if (!res.ok) { assignError = (await res.json()).error ?? 'Failed'; return; }
    assigningId = null; assignInput = '';
    await load();
  }

  async function unassign(roleId: string) {
    await fetch(`/api/fire/roles/${roleId}/assign`, { method: 'DELETE' });
    await load();
  }

  load();
</script>

<div class="domain-layout">
<CommunitySidebar {navigate} />
<div class="domain-main">
<div class="page-header">
  <div>
    <h1>Fire</h1>
    <p class="subtitle">Fire protection, emergency response, and first responder services</p>
  </div>
  <button class="new-btn" onclick={() => navigate('/domains/00000000-0000-0000-0000-000000000013/units/new')}>+ New company</button>
</div>


  <DomainPoolPanel domainId="00000000-0000-0000-0000-000000000013" {navigate} />

{#if loading}
  <p class="muted">Loading…</p>
{:else if error}
  <p class="error">{error}</p>
{:else}
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
  </section>
  {/if}

  <section class="section">
    <div class="section-header">
      <h2>Fire Companies</h2>
      <span class="count muted">{companies.length}</span>
    </div>
    {#if companies.length === 0}
      <p class="muted">No fire companies yet.</p>
    {:else}
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Name</th><th>Description</th><th class="num">Staff</th><th>Added</th></tr>
          </thead>
          <tbody>
            {#each companies as c (c.id)}
              <tr class="clickable" onclick={() => navigate(`/domains/00000000-0000-0000-0000-000000000013/units/${c.id}`)}>
                <td class="name">{c.name}</td>
                <td class="muted">{c.description || '—'}</td>
                <td class="num">{c.staffCount}</td>
                <td class="muted">{new Date(c.createdAt).toLocaleDateString()}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
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
  .muted { color: var(--text-secondary); }
  .error { color: var(--color-danger, #dc2626); font-size: 0.9rem; }

  .section { margin-bottom: 2.5rem; }
  .section-header { display: flex; align-items: baseline; gap: 10px; margin-bottom: 12px; }
  .section-header h2 { margin: 0; }
  .count { font-size: 0.85rem; }

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

  .roles-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; margin-bottom: 0.5rem; }
  .roles-table th, .roles-table td { padding: 0.6rem 0.75rem; text-align: left; border-bottom: 1px solid var(--color-border, #e2e8f0); }
  .roles-table th { font-weight: 600; color: var(--color-muted, #555); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
  .role-title { font-weight: 500; }
  .role-desc { font-size: 0.8rem; color: var(--color-muted, #888); margin-top: 0.2rem; }
  .assign-row { display: flex; gap: 0.4rem; align-items: center; }
  .assign-row input { padding: 0.3rem 0.5rem; border: 1px solid var(--color-border, #ccc); border-radius: 4px; font-size: 0.85rem; width: 220px; }
  .unassign-btn { color: var(--color-danger, #dc2626); background: none; border: 1px solid var(--color-danger, #dc2626); border-radius: 4px; padding: 0.25rem 0.6rem; cursor: pointer; font-size: 0.8rem; }
  .unassign-btn:hover { background: #fef2f2; }

  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 0.4rem 0.75rem; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-muted, #888); border-bottom: 1px solid var(--color-border, #e2e8f0); }
  td { padding: 0.65rem 0.75rem; border-bottom: 1px solid var(--color-border, #f1f5f9); font-size: 0.9rem; }
  td.name { font-weight: 500; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  tr.clickable { cursor: pointer; }
  tr.clickable:hover td { background: var(--color-hover, #f8fafc); }

  .domain-layout { display: flex; min-height: 100vh; }
  .domain-main { flex: 1; padding: 32px 40px; max-width: 860px; }
</style>
