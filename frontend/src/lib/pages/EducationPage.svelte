<script lang="ts">
  import CouncilPanel from '../components/CouncilPanel.svelte';
  import CommunitySidebar from '../components/CommunitySidebar.svelte';
  const { navigate }: { navigate: (path: string) => void } = $props();

  interface SchoolDto {
    id: string;
    name: string;
    description: string;
    staffCount: number;
  }

  interface LibraryDto {
    id: string;
    name: string;
    description: string;
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

  let schools   = $state<SchoolDto[]>([]);
  let libraries = $state<LibraryDto[]>([]);
  let roles     = $state<RoleDto[]>([]);
  let loading   = $state(true);
  let error     = $state("");

  let assigningId  = $state<string | null>(null);
  let assignInput  = $state("");
  let assignError  = $state("");

  async function load() {
    try {
      const [schoolsRes, librariesRes, rolesRes] = await Promise.all([
        fetch("/api/education/schools"),
        fetch("/api/education/libraries"),
        fetch("/api/education/roles"),
      ]);
      if (!schoolsRes.ok)   throw new Error(`HTTP ${schoolsRes.status}`);
      if (!librariesRes.ok) throw new Error(`HTTP ${librariesRes.status}`);
      if (!rolesRes.ok)     throw new Error(`HTTP ${rolesRes.status}`);
      const schoolData   = await schoolsRes.json();
      const libraryData  = await librariesRes.json();
      schools   = schoolData.schools;
      libraries = libraryData.libraries;
      roles     = await rolesRes.json();
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : "Failed to load education";
    } finally {
      loading = false;
    }
  }

  async function assign(roleId: string) {
    assignError = "";
    const res = await fetch(`/api/education/roles/${roleId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberId: assignInput.trim() }),
    });
    if (!res.ok) { assignError = (await res.json()).error ?? "Failed"; return; }
    assigningId = null; assignInput = "";
    await load();
  }

  async function unassign(roleId: string) {
    await fetch(`/api/education/roles/${roleId}/assign`, { method: "DELETE" });
    await load();
  }

  load();
</script>

<div class="domain-layout">
<CommunitySidebar {navigate} />
<div class="domain-main">
  <div class="page-header">
    <div>
      <h1>Education</h1>
      <p class="subtitle">Schools, vocational training, and knowledge infrastructure</p>
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
                <td>{role.memberName ?? "—"}</td>
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
        <h2>Schools</h2>
        <button class="new-btn" onclick={() => navigate("/education/schools/new")}>+ New school</button>
      </div>
      {#if schools.length === 0}
        <p class="muted">No schools yet.</p>
      {:else}
        <div class="unit-grid">
          {#each schools as school (school.id)}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="unit-card" role="button" tabindex="0"
              onclick={() => navigate(`/education/schools/${school.id}`)}
              onkeydown={(e) => e.key === 'Enter' && navigate(`/education/schools/${school.id}`)}>
              <div class="badge">School</div>
              <h3>{school.name}</h3>
              <p class="card-desc">{school.description}</p>
              <div class="card-meta">{school.staffCount} staff member{school.staffCount === 1 ? "" : "s"}</div>
            </div>
          {/each}
        </div>
      {/if}
    </section>

    <section class="section">
      <div class="section-header">
        <h2>Libraries</h2>
        <button class="new-btn" onclick={() => navigate("/education/libraries/new")}>+ New library</button>
      </div>
      {#if libraries.length === 0}
        <p class="muted">No libraries yet.</p>
      {:else}
        <div class="unit-grid">
          {#each libraries as library (library.id)}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="unit-card" role="button" tabindex="0"
              onclick={() => navigate(`/education/libraries/${library.id}`)}
              onkeydown={(e) => e.key === 'Enter' && navigate(`/education/libraries/${library.id}`)}
            >
              <div class="badge badge-library">Library</div>
              <h3>{library.name}</h3>
              <p class="card-desc">{library.description}</p>
              <div class="card-meta">{library.staffCount} staff member{library.staffCount === 1 ? "" : "s"}</div>
            </div>
          {/each}
        </div>
      {/if}
    </section>
  {/if}
  <CouncilPanel domainId="00000000-0000-0000-0000-000000000005" {navigate} />
</div>
</div>

<style>
  .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
  h1 { margin: 0; font-size: 22px; font-weight: 600; }
  h2 { margin: 0 0 12px; font-size: 16px; font-weight: 600; }
  .subtitle { margin: 0.25rem 0 0; color: var(--color-muted, #888); font-size: 0.95rem; }

  .section { margin-bottom: 2.5rem; }
  .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
  .section-header h2 { margin: 0; font-size: 1rem; font-weight: 600; }

  .new-btn {
    padding: 0.4rem 1rem;
    background: var(--color-primary, #2563eb);
    color: #fff;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
  }
  .new-btn:hover { opacity: 0.85; }

  .unit-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; }

  .unit-card {
    background: var(--color-surface, #fff);
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: 10px;
    padding: 1.25rem 1.5rem;
    cursor: pointer;
    transition: box-shadow 0.15s, border-color 0.15s;
  }
  .unit-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); border-color: var(--color-primary, #2563eb); }
  .unit-card h3 { margin: 0 0 0.5rem; font-size: 1.05rem; }

  .badge {
    display: inline-block;
    font-size: 0.75rem; font-weight: 600; letter-spacing: 0.03em;
    padding: 0.2rem 0.6rem; border-radius: 999px;
    background: #d1fae5; color: #065f46;
    margin-bottom: 0.75rem;
  }
  .badge-library { background: #fef3c7; color: #92400e; }

  .card-desc { margin: 0 0 1rem; font-size: 0.875rem; color: var(--color-muted, #666); line-height: 1.5; }
  .card-meta { font-size: 0.85rem; color: var(--color-muted, #888); }

  .muted { color: var(--color-muted, #888); }

  .roles-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  .roles-table th, .roles-table td { padding: 0.6rem 0.75rem; text-align: left; border-bottom: 1px solid var(--color-border, #e2e8f0); }
  .roles-table th { font-weight: 600; color: var(--color-muted, #555); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
  .role-title { font-weight: 500; }
  .role-desc { font-size: 0.8rem; color: var(--color-muted, #888); margin-top: 0.2rem; }
  .assign-row { display: flex; gap: 0.4rem; align-items: center; }
  .assign-row input { padding: 0.3rem 0.5rem; border: 1px solid var(--color-border, #ccc); border-radius: 4px; font-size: 0.85rem; width: 220px; }
  .unassign-btn { color: var(--color-danger, #dc2626); background: none; border: 1px solid var(--color-danger, #dc2626); border-radius: 4px; padding: 0.25rem 0.6rem; cursor: pointer; font-size: 0.8rem; }
  .unassign-btn:hover { background: #fef2f2; }
  .error { color: var(--color-danger, #dc2626); }
</style>
