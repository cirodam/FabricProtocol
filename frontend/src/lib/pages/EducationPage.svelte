<script lang="ts">
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

  let schools   = $state<SchoolDto[]>([]);
  let libraries = $state<LibraryDto[]>([]);
  let loading   = $state(true);
  let error     = $state("");

  async function load() {
    try {
      const [schoolsRes, librariesRes] = await Promise.all([
        fetch("/api/education/schools"),
        fetch("/api/education/libraries"),
      ]);
      if (!schoolsRes.ok)   throw new Error(`HTTP ${schoolsRes.status}`);
      if (!librariesRes.ok) throw new Error(`HTTP ${librariesRes.status}`);
      const schoolData   = await schoolsRes.json();
      const libraryData  = await librariesRes.json();
      schools   = schoolData.schools;
      libraries = libraryData.libraries;
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : "Failed to load education";
    } finally {
      loading = false;
    }
  }

  load();
</script>

<div class="page">
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
</div>

<style>
  .page { max-width: 900px; margin: 0 auto; padding: 2rem 1rem; }

  .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
  .page-header h1 { margin: 0; }
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
  .error { color: var(--color-danger, #dc2626); }
</style>
