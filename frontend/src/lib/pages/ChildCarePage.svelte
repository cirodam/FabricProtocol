<script lang="ts">
  import DomainPage from '../components/DomainPage.svelte';
  import DomainRolesTable from '../components/DomainRolesTable.svelte';
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

  load();
</script>

<DomainPage
  {navigate}
  title="Child Care"
  description="Early childhood care and home childcare programs for children under five"
  domainId="00000000-0000-0000-0000-000000000012"
  {loading}
  {error}
>
  <DomainRolesTable {roles} rolesUrl="/api/child-care/roles" onChanged={load} />

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
</DomainPage>

<style>
  .section { margin-bottom: 2.5rem; }
  .section-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
  .section-header h2 { margin: 0; font-size: 1rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-muted, #666); }
  .view-btn { margin-left: auto; background: none; border: 1px solid var(--color-border, #e2e8f0); border-radius: var(--radius); padding: 5px 14px; font-size: 0.85rem; cursor: pointer; color: var(--color-primary, #2563eb); }
  .hc-card { display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border: 1px solid var(--color-border, #e2e8f0); border-radius: 8px; cursor: pointer; background: var(--color-surface, #fff); }
  .hc-card:hover { background: var(--color-hover, #f8fafc); }
  .hc-label { font-size: 0.9rem; font-weight: 500; }
  .hc-staff { font-size: 0.85rem; color: var(--color-muted, #888); }
  .muted { color: var(--text-secondary); }
</style>
