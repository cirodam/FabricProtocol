<script lang="ts">
  const { navigate }: { navigate: (path: string) => void } = $props();

  interface ClinicDto {
    id: string;
    name: string;
    description: string;
    staffCount: number;
    createdAt: string;
  }

  interface DentalClinicDto {
    id: string;
    name: string;
    description: string;
    staffCount: number;
    createdAt: string;
  }

  let clinics       = $state<ClinicDto[]>([]);
  let dentalClinics = $state<DentalClinicDto[]>([]);
  let loading       = $state(true);
  let error         = $state("");

  async function load() {
    try {
      const [clinicsRes, dentalRes] = await Promise.all([
        fetch("/api/healthcare/clinics"),
        fetch("/api/healthcare/dental-clinics"),
      ]);
      if (!clinicsRes.ok) throw new Error(`HTTP ${clinicsRes.status}`);
      if (!dentalRes.ok)  throw new Error(`HTTP ${dentalRes.status}`);
      const clinicsData = await clinicsRes.json();
      const dentalData  = await dentalRes.json();
      clinics       = clinicsData.clinics;
      dentalClinics = dentalData.dentalClinics;
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : "Failed to load healthcare";
    } finally {
      loading = false;
    }
  }

  load();
</script>

<div class="page">
  <div class="page-header">
    <div>
      <h1>Healthcare</h1>
      <p class="subtitle">Community clinics and health services</p>
    </div>
    <button class="new-btn" onclick={() => navigate("/healthcare/clinics/new")}>+ New clinic</button>
  </div>

  {#if loading}
    <p class="muted">Loading…</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if clinics.length === 0}
    <p class="muted">No clinics yet. Create one to get started.</p>
  {:else}
    <div class="clinic-grid">
      {#each clinics as clinic (clinic.id)}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div class="clinic-card" role="button" tabindex="0"
          onclick={() => navigate(`/healthcare/clinics/${clinic.id}`)}
          onkeydown={(e) => e.key === 'Enter' && navigate(`/healthcare/clinics/${clinic.id}`)}>
          <div class="card-badge">Primary Care</div>
          <h2>{clinic.name}</h2>
          <p class="card-desc">{clinic.description}</p>
          <div class="card-meta">
            <span>{clinic.staffCount} staff member{clinic.staffCount === 1 ? "" : "s"}</span>
          </div>
        </div>
      {/each}
    </div>
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
    margin-bottom: 0.75rem;
  }
  .badge-primary { background: var(--color-primary-light, #dbeafe); color: var(--color-primary, #1d4ed8); }
  .badge-dental  { background: #e0f2fe; color: #0369a1; }

  .card-desc { margin: 0 0 1rem; font-size: 0.875rem; color: var(--color-muted, #666); line-height: 1.5; }
  .card-meta { font-size: 0.85rem; color: var(--color-muted, #888); }

  .muted { color: var(--color-muted, #888); }
  .error { color: var(--color-danger, #dc2626); }
</style>
