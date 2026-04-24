<script lang="ts">
  import DomainPage from '../../components/DomainPage.svelte';
  import DomainRolesTable from '../../components/DomainRolesTable.svelte';
  const { navigate }: { navigate: (path: string) => void } = $props();

  interface SchoolDto { id: string; name: string; description: string; staffCount: number; }
  interface LibraryDto { id: string; name: string; description: string; staffCount: number; }

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

  load();
</script>

<DomainPage
  {navigate}
  title="Education"
  description="Schools, vocational training, and knowledge infrastructure"
  domainId="00000000-0000-0000-0000-000000000005"
  {loading}
  {error}
>
  <DomainRolesTable {roles} rolesUrl="/api/education/roles" onChanged={load} />

  <section class="section">
    <div class="section-header">
      <h2>Schools</h2>
      <button class="new-btn" onclick={() => navigate("/domains/00000000-0000-0000-0000-000000000005/units/new")}>+ New school</button>
    </div>
      {#if schools.length === 0}
        <p class="muted">No schools yet.</p>
      {:else}
        <div class="unit-grid">
          {#each schools as school (school.id)}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="unit-card" role="button" tabindex="0"
              onclick={() => navigate(`/domains/00000000-0000-0000-0000-000000000005/units/${school.id}`)}
              onkeydown={(e) => e.key === 'Enter' && navigate(`/domains/00000000-0000-0000-0000-000000000005/units/${school.id}`)}>
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
        <button class="new-btn" onclick={() => navigate("/domains/00000000-0000-0000-0000-000000000005/units/new")}>+ New library</button>
      </div>
      {#if libraries.length === 0}
        <p class="muted">No libraries yet.</p>
      {:else}
        <div class="unit-grid">
          {#each libraries as library (library.id)}
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div class="unit-card" role="button" tabindex="0"
              onclick={() => navigate(`/domains/00000000-0000-0000-0000-000000000005/units/${library.id}`)}
              onkeydown={(e) => e.key === 'Enter' && navigate(`/domains/00000000-0000-0000-0000-000000000005/units/${library.id}`)}
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
</DomainPage>

<style>
  h2 { margin: 0 0 12px; font-size: 16px; font-weight: 600; }
  .section { margin-bottom: 2.5rem; }
  .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
  .section-header h2 { margin: 0; font-size: 1rem; font-weight: 600; }
  .new-btn { padding: 0.4rem 1rem; background: var(--color-primary, #2563eb); color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem; }
  .new-btn:hover { opacity: 0.85; }
  .unit-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; }
  .unit-card { background: var(--color-surface, #fff); border: 1px solid var(--color-border, #e2e8f0); border-radius: 10px; padding: 1.25rem 1.5rem; cursor: pointer; transition: box-shadow 0.15s, border-color 0.15s; }
  .unit-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); border-color: var(--color-primary, #2563eb); }
  .unit-card h3 { margin: 0 0 0.5rem; font-size: 1.05rem; }
  .badge { display: inline-block; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.03em; padding: 0.2rem 0.6rem; border-radius: 999px; background: #d1fae5; color: #065f46; margin-bottom: 0.75rem; }
  .badge-library { background: #fef3c7; color: #92400e; }
  .card-desc { margin: 0 0 1rem; font-size: 0.875rem; color: var(--color-muted, #666); line-height: 1.5; }
  .card-meta { font-size: 0.85rem; color: var(--color-muted, #888); }
  .muted { color: var(--color-muted, #888); }
</style>
