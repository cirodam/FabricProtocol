<script lang="ts">
  import CommunitySidebar from '../components/CommunitySidebar.svelte';
  const { navigate }: { navigate: (path: string) => void } = $props();

  interface HomeChildcareInfo {
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

  let homeChildcare: HomeChildcareInfo | null = $state(null);
  let roles       = $state<RoleDto[]>([]);
  let loading = $state(true);
  let error: string | null = $state(null);
  let assigningId = $state<string | null>(null);
  let assignInput = $state("");
  let assignError = $state("");

  async function load() {
    try {
      const [hcRes, rolesRes] = await Promise.all([
        fetch('/api/child-care/home-childcare'),
        fetch('/api/child-care/roles'),
      ]);
      if (hcRes.ok) homeChildcare = await hcRes.json();
      if (!rolesRes.ok) throw new Error(`roles ${rolesRes.status}`);
      roles = await rolesRes.json();
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  async function assign(roleId: string) {
    assignError = "";
    const res = await fetch(`/api/child-care/roles/${roleId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId: assignInput.trim() }),
    });
    if (!res.ok) { assignError = (await res.json()).error ?? "Failed"; return; }
    assigningId = null; assignInput = "";
    await load();
  }

  async function unassign(roleId: string) {
    await fetch(`/api/child-care/roles/${roleId}/assign`, { method: "DELETE" });
    await load();
  }

  load();
</script>

<div class="domain-layout">
<CommunitySidebar {navigate} />
<div class="domain-main">
<div class="page-header">
  <div>
    <h1>Child Care</h1>
    <p class="subtitle">Early childhood care and home childcare programs for children under five</p>
  </div>
</div>

{#if loading}
  <p class="muted">Loading…</p>
{:else if error}
  <p class="error">{error}</p>
{:else}
  <section class="section">
    <h2 class="section-title">Roles</h2>
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
      <h2>Home Childcare</h2>
      {#if homeChildcare}
        <button class="view-btn" onclick={() => navigate('/child-care/home-childcare')}>View →</button>
      {/if}
    </div>
    {#if homeChildcare}
      <div class="hc-card" role="button" tabindex="0"
        onclick={() => navigate('/child-care/home-childcare')}
        onkeydown={e => e.key === 'Enter' && navigate('/child-care/home-childcare')}>
        <span class="hc-label">Home Childcare Program</span>
        <span class="hc-staff">{homeChildcare.staffCount} staff</span>
      </div>
    {:else}
      <p class="muted">Not yet initialised.</p>
    {/if}
  </section>
{/if}
</div>
</div>

<style>
  h1 { margin: 0; font-size: 22px; font-weight: 600; }
  .subtitle { margin: 0.25rem 0 0; color: var(--color-muted, #888); font-size: 0.95rem; }
  .muted { color: var(--text-secondary); }
  .error { color: var(--color-danger, #dc2626); font-size: 0.9rem; }

  .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }

  .section { margin-bottom: 2.5rem; }
  .section-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
  .section-header h2 { margin: 0; font-size: 1rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-muted, #666); }
  .section-title { font-size: 16px; font-weight: 600; margin: 0 0 12px; }

  .roles-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; margin-bottom: 0.5rem; }
  .roles-table th, .roles-table td { padding: 0.6rem 0.75rem; text-align: left; border-bottom: 1px solid var(--color-border, #e2e8f0); }
  .roles-table th { font-weight: 600; color: var(--color-muted, #555); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
  .role-title { font-weight: 500; }
  .role-desc { font-size: 0.8rem; color: var(--color-muted, #888); margin-top: 0.2rem; }
  .assign-row { display: flex; gap: 0.4rem; align-items: center; }
  .assign-row input { padding: 0.3rem 0.5rem; border: 1px solid var(--color-border, #ccc); border-radius: 4px; font-size: 0.85rem; width: 220px; }
  .unassign-btn { color: var(--color-danger, #dc2626); background: none; border: 1px solid var(--color-danger, #dc2626); border-radius: 4px; padding: 0.25rem 0.6rem; cursor: pointer; font-size: 0.8rem; }
  .unassign-btn:hover { background: #fef2f2; }

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
  .hc-card {
    display: flex; align-items: center; justify-content: space-between;
    padding: 0.75rem 1rem;
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: 8px;
    cursor: pointer;
    background: var(--color-surface, #fff);
  }
  .hc-card:hover { background: var(--color-hover, #f8fafc); }
  .hc-label { font-size: 0.9rem; font-weight: 500; }
  .hc-staff { font-size: 0.85rem; color: var(--color-muted, #888); }
</style>
