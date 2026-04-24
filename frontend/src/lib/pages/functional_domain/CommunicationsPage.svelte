<script lang="ts">
  import CommunitySidebar from '../../components/CommunitySidebar.svelte';
  import DomainPoolPanel from '../../components/DomainPoolPanel.svelte';
  const { navigate, path }: { navigate: (p: string) => void; path: string } = $props();

  interface RoleDto { id: string; title: string; description: string; kinPerMonth: number; memberId: string | null; memberName: string | null; active: boolean; }
  interface MemberOption { id: string; firstName: string; lastName: string; handle: string; }

  let roles = $state<RoleDto[]>([]);
  let allMembers = $state<MemberOption[]>([]);
  let loading = $state(true);
  let error: string | null = $state(null);
  let budgetTotal = $state(0);

  // new role form
  let newTitle = $state('');
  let newDescription = $state('');
  let newKinPerMonth = $state(0);
  let creatingRole = $state(false);
  let createError: string | null = $state(null);

  // assign member state keyed by role id
  let assigningId = $state<string | null>(null);
  let assignMemberId = $state('');
  let assignWorking = $state(false);
  let assignError: string | null = $state(null);

  async function load() {
    try {
      const [rolesRes, membersRes, outflowsRes] = await Promise.all([
        fetch('/api/communications/roles'),
        fetch('/api/members'),
        fetch('/api/community/outflows'),
      ]);
      if (!rolesRes.ok) throw new Error(`roles: ${rolesRes.status}`);
      if (!membersRes.ok) throw new Error(`members: ${membersRes.status}`);
      if (!outflowsRes.ok) throw new Error(`outflows: ${outflowsRes.status}`);
      roles = await rolesRes.json();
      allMembers = await membersRes.json();
      const outflows = await outflowsRes.json();
      const commsDomain = outflows.payroll.domains.find((d: { handle: string }) => d.handle === 'communications');
      budgetTotal = commsDomain?.total ?? 0;
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  async function createRole(e: Event) {
    e.preventDefault();
    if (!newTitle.trim()) { createError = 'Title is required'; return; }
    creatingRole = true;
    createError = null;
    try {
      const res = await fetch('/api/communications/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim(), description: newDescription.trim(), kinPerMonth: newKinPerMonth }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error ?? `HTTP ${res.status}`); }
      newTitle = '';
      newDescription = '';
      newKinPerMonth = 0;
      await load();
    } catch (e) {
      createError = (e as Error).message;
    } finally {
      creatingRole = false;
    }
  }

  async function assignMember(roleId: string) {
    if (!assignMemberId) { assignError = 'Select a member'; return; }
    assignWorking = true;
    assignError = null;
    try {
      const res = await fetch(`/api/communications/roles/${roleId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: assignMemberId }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error ?? `HTTP ${res.status}`); }
      assigningId = null;
      assignMemberId = '';
      await load();
    } catch (e) {
      assignError = (e as Error).message;
    } finally {
      assignWorking = false;
    }
  }

  async function unassignMember(roleId: string) {
    try {
      const res = await fetch(`/api/communications/roles/${roleId}/assign`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await load();
    } catch { /* reload silently */ }
  }

  async function deleteRole(memberId: string) {
    try {
      const res = await fetch(`/api/communications/roles/${memberId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await load();
    } catch { /* reload silently */ }
  }

  function openAssign(roleId: string) {
    assigningId = roleId;
    assignMemberId = '';
    assignError = null;
  }

  function fmtKin(n: number) { return n.toLocaleString(undefined, { maximumFractionDigits: 0 }); }

  load();
</script>

<div class="domain-layout">
  <CommunitySidebar {navigate} {path} />
  <div class="domain-main">
    <div class="page-header">
      <h1>Communications</h1>
    </div>
    <p class="domain-desc">The Communications domain maintains the community's shared communications infrastructure: radio stations, internet access points, postal hubs, and similar facilities. Roles in this domain are funded by the community.</p>


    <DomainPoolPanel domainId="00000000-0000-0000-0000-000000000006" {navigate} />

    {#if loading}
      <p class="muted">Loading…</p>
    {:else if error}
      <p class="error">{error}</p>
    {:else}

      <!-- BUDGET SUMMARY -->
      {#if budgetTotal > 0}
      <section class="section">
        <h2>Budget</h2>
        <p class="budget-summary">Total committed: <strong>{budgetTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })} kin / mo</strong></p>
      </section>
      {/if}

      <!-- ROLES -->
      <section class="section">
        <h2>Roles</h2>

        {#if roles.length === 0}
          <p class="muted">No roles defined yet.</p>
        {:else}
          <table class="roles-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Assigned to</th>
                <th class="num">Kin / mo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {#each roles as r (r.id)}
                <tr>
                  <td>
                    <span class="role-title">{r.title}</span>
                    {#if r.description}<div class="role-desc muted">{r.description}</div>{/if}
                  </td>
                  <td>
                    {#if assigningId === r.id}
                      <div class="assign-inline">
                        <select bind:value={assignMemberId} disabled={assignWorking}>
                          <option value="">— select member —</option>
                          {#each allMembers as m (m.id)}
                            <option value={m.id}>{m.firstName} {m.lastName}{m.handle ? ` (@${m.handle})` : ''}</option>
                          {/each}
                        </select>
                        <button class="btn-small" disabled={assignWorking || !assignMemberId} onclick={() => assignMember(r.id)}>
                          {assignWorking ? 'Saving…' : 'Assign'}
                        </button>
                        <button class="btn-small secondary" onclick={() => assigningId = null}>Cancel</button>
                        {#if assignError}<span class="error-inline">{assignError}</span>{/if}
                      </div>
                    {:else if r.memberName}
                      <div class="assigned-member">
                        <button class="name-link" onclick={() => navigate(`/members/${r.memberId}`)}>{r.memberName}</button>
                        <button class="btn-tiny" onclick={() => unassignMember(r.id)}>Unassign</button>
                      </div>
                    {:else}
                      <button class="btn-small secondary" onclick={() => openAssign(r.id)}>Assign member</button>
                    {/if}
                  </td>
                  <td class="num">{r.kinPerMonth > 0 ? fmtKin(r.kinPerMonth) : '—'}</td>
                  <td>
                    {#if !r.memberId}
                      <button class="remove-btn" onclick={() => deleteRole(r.id)}>Delete</button>
                    {/if}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}

        <!-- Add role form -->
        <details class="add-role-details">
          <summary>Add a role</summary>
          <form class="add-form" onsubmit={createRole}>
            {#if createError}<p class="error">{createError}</p>{/if}
            <div class="form-grid">
              <label>
                Title
                <input type="text" bind:value={newTitle} placeholder="e.g. Newsletter Editor" disabled={creatingRole} />
              </label>
              <label>
                Kin / month
                <input type="number" bind:value={newKinPerMonth} min="0" disabled={creatingRole} />
              </label>
              <label class="full">
                Description <span class="muted">(optional)</span>
                <input type="text" bind:value={newDescription} placeholder="Brief description of the role" disabled={creatingRole} />
              </label>
            </div>
            <button type="submit" disabled={creatingRole || !newTitle.trim()}>{creatingRole ? 'Creating…' : 'Create role'}</button>
          </form>
        </details>
      </section>

    {/if}
</div>
</div>

<style>
  .page-header { display: flex; align-items: baseline; gap: 12px; margin-bottom: 12px; }
  h1 { margin: 0; font-size: 22px; font-weight: 600; }
  .domain-desc {
    font-size: 14px;
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0 0 28px;
    max-width: 680px;
  }
  h2 { margin: 0 0 12px; font-size: 16px; font-weight: 600; }
  .section { margin-bottom: 36px; }
  .muted { color: var(--text-secondary); }
  .error { color: #ef5350; }
  .error-inline { font-size: 12px; color: #ef5350; }

  .budget-summary { margin: 0; font-size: 14px; color: var(--text-secondary); }
  .budget-summary strong { color: var(--text-primary, #111); font-weight: 700; }

  /* Roles table */
  .roles-table { width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 12px; }
  .roles-table th {
    text-align: left; padding: 6px 12px;
    font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;
    color: var(--text-secondary); border-bottom: 1px solid var(--border);
  }
  .roles-table td { padding: 10px 12px; border-bottom: 1px solid var(--border); vertical-align: top; }
  .roles-table .num { text-align: right; font-variant-numeric: tabular-nums; }

  .role-title { font-weight: 500; }
  .role-desc { font-size: 12px; margin-top: 2px; }

  .assigned-member { display: flex; align-items: center; gap: 8px; }
  .name-link { background: none; border: none; padding: 0; cursor: pointer; color: var(--accent, #2563eb); font-size: 14px; }
  .name-link:hover { text-decoration: underline; }

  .assign-inline { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .assign-inline select { font-size: 13px; padding: 4px 6px; border: 1px solid var(--border); border-radius: 4px; }

  .btn-small {
    font-size: 12px; padding: 4px 10px;
    border: 1px solid var(--border); border-radius: 4px;
    background: var(--surface-2, #f5f5f5); cursor: pointer;
  }
  .btn-small:disabled { opacity: 0.5; cursor: default; }
  .btn-small.secondary { color: var(--text-secondary); }

  .btn-tiny { font-size: 11px; padding: 2px 8px; border: 1px solid var(--border); border-radius: 4px; background: none; cursor: pointer; color: var(--text-secondary); }
  .btn-tiny:hover { color: #ef5350; }

  .remove-btn { font-size: 12px; background: none; border: none; cursor: pointer; color: var(--text-secondary); }
  .remove-btn:hover { color: #ef5350; }

  /* Add role form */
  .add-role-details { margin-top: 4px; }
  .add-role-details summary { cursor: pointer; font-size: 13px; color: var(--accent, #2563eb); user-select: none; }

  .add-form { margin-top: 12px; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
  .form-grid .full { grid-column: 1 / -1; }
  .form-grid label { display: flex; flex-direction: column; gap: 4px; font-size: 13px; font-weight: 500; }
  .form-grid input { font-size: 13px; padding: 6px 8px; border: 1px solid var(--border); border-radius: 4px; }

  .add-form button[type="submit"] {
    font-size: 13px; padding: 6px 14px;
    background: var(--accent, #2563eb); color: #fff;
    border: none; border-radius: 4px; cursor: pointer;
  }
  .add-form button[type="submit"]:disabled { opacity: 0.5; cursor: default; }

</style>

