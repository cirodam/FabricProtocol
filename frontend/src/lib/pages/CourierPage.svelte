<script lang="ts">
  import CommunitySidebar from '../components/CommunitySidebar.svelte';
  import DomainPoolPanel from '../components/DomainPoolPanel.svelte';
  const { navigate }: { navigate: (path: string) => void } = $props();

  interface RoleDto {
    id: string;
    title: string;
    description: string;
    kinPerMonth: number;
    memberId: string | null;
    memberName: string | null;
    active: boolean;
  }

  interface DeliveryRequest {
    id: string;
    description: string;
    originLabel: string | null;
    destinationLabel: string | null;
    priority: 'regular' | 'urgent';
    status: string;
    createdAt: string;
  }

  let roles       = $state<RoleDto[]>([]);
  let requests    = $state<DeliveryRequest[]>([]);
  let loading     = $state(true);
  let error: string | null = $state(null);
  let assigningId = $state<string | null>(null);
  let assignInput = $state('');
  let assignError = $state('');

  async function load() {
    try {
      const [rolesRes, reqRes] = await Promise.all([
        fetch('/api/courier/roles'),
        fetch('/api/courier/requests?status=pending'),
      ]);
      if (!rolesRes.ok) throw new Error(`roles ${rolesRes.status}`);
      roles = await rolesRes.json();
      if (reqRes.ok) {
        const data = await reqRes.json();
        requests = data.requests;
      }
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  async function assign(roleId: string) {
    assignError = '';
    const res = await fetch(`/api/courier/roles/${roleId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: assignInput.trim() }),
    });
    if (!res.ok) { assignError = (await res.json()).error ?? 'Failed'; return; }
    assigningId = null; assignInput = '';
    await load();
  }

  async function unassign(roleId: string) {
    await fetch(`/api/courier/roles/${roleId}/assign`, { method: 'DELETE' });
    await load();
  }

  load();
</script>

<div class="domain-layout">
<CommunitySidebar {navigate} />
<div class="domain-main">
<div class="page-header">
  <div>
    <h1>Courier</h1>
    <p class="subtitle">On-demand delivery of goods and documents within the community</p>
  </div>
</div>


  <DomainPoolPanel domainId="00000000-0000-0000-0000-000000000010" {navigate} />

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
    {/if}
  </section>

  <section class="section">
    <h2>Pending Deliveries</h2>
    {#if requests.length === 0}
      <p class="muted">No pending delivery requests.</p>
    {:else}
      <table class="roles-table">
        <thead><tr><th>Description</th><th>From</th><th>To</th><th>Priority</th><th>Requested</th></tr></thead>
        <tbody>
          {#each requests as r (r.id)}
            <tr>
              <td class="role-title">{r.description}</td>
              <td>{r.originLabel ?? '—'}</td>
              <td>{r.destinationLabel ?? '—'}</td>
              <td>
                {#if r.priority === 'urgent'}
                  <span class="badge urgent">Urgent</span>
                {:else}
                  <span class="badge regular">Regular</span>
                {/if}
              </td>
              <td class="muted">{new Date(r.createdAt).toLocaleDateString()}</td>
            </tr>
          {/each}
        </tbody>
      </table>
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

  .section { margin-bottom: 2.5rem; }

  .roles-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  .roles-table th, .roles-table td { padding: 0.6rem 0.75rem; text-align: left; border-bottom: 1px solid var(--color-border, #e2e8f0); }
  .roles-table th { font-weight: 600; color: var(--color-muted, #555); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
  .role-title { font-weight: 500; }
  .role-desc { font-size: 0.8rem; color: var(--color-muted, #888); margin-top: 0.2rem; }
  .assign-row { display: flex; gap: 0.4rem; align-items: center; }
  .assign-row input { padding: 0.3rem 0.5rem; border: 1px solid var(--color-border, #ccc); border-radius: 4px; font-size: 0.85rem; width: 220px; }
  .unassign-btn { color: var(--color-danger, #dc2626); background: none; border: 1px solid var(--color-danger, #dc2626); border-radius: 4px; padding: 0.25rem 0.6rem; cursor: pointer; font-size: 0.8rem; }
  .unassign-btn:hover { background: #fef2f2; }

  .badge { display: inline-block; font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.55rem; border-radius: 999px; }
  .badge.urgent  { background: #fef3c7; color: #92400e; }
  .badge.regular { background: var(--color-surface, #f1f5f9); color: var(--color-muted, #555); }

  .muted { color: var(--color-muted, #888); }
  .error { color: var(--color-danger, #dc2626); font-size: 0.85rem; }

  .domain-layout { display: flex; min-height: 100vh; }
  .domain-main { flex: 1; padding: 32px 40px; max-width: 860px; }
</style>
