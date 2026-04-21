<script lang="ts">
  import CouncilPanel from '../components/CouncilPanel.svelte';
  const { navigate }: { navigate: (path: string) => void } = $props();

  interface HomeChildcareInfo {
    id: string;
    staffCount: number;
  }

  let homeChildcare: HomeChildcareInfo | null = $state(null);
  let loading = $state(true);
  let error: string | null = $state(null);

  async function load() {
    try {
      const res = await fetch('/api/child-care/home-childcare');
      if (res.ok) homeChildcare = await res.json();
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  load();
</script>

<div class="page-header">
  <h1>Child Care</h1>
</div>

{#if loading}
  <p class="muted">Loading…</p>
{:else if error}
  <p class="error">{error}</p>
{:else}
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
  <CouncilPanel domainId="00000000-0000-0000-0000-000000000012" {navigate} />
{/if}

<style>
  h1 { margin: 0 0 12px; font-size: 22px; font-weight: 600; }
  .muted { color: var(--text-secondary); }
  .error { color: var(--color-danger, #dc2626); font-size: 0.9rem; }

  .section { margin-bottom: 2.5rem; }
  .section-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
  .section-header h2 { margin: 0; font-size: 1rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-muted, #666); }

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
