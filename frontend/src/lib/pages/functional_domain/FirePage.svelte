<script lang="ts">
  import DomainPage from '../../components/DomainPage.svelte';
  import DomainRolesTable from '../../components/DomainRolesTable.svelte';
  const { navigate }: { navigate: (path: string) => void } = $props();

  interface FireCompany { id: string; name: string; description: string; staffCount: number; createdAt: string; }
  interface RoleDto { id: string; title: string; description: string; kinPerMonth: number; memberId: string | null; memberName: string | null; active: boolean; }

  let companies: FireCompany[] = $state([]);
  let roles = $state<RoleDto[]>([]);
  let loading = $state(true);
  let error: string | null = $state(null);

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

  load();
</script>

<DomainPage
  {navigate}
  title="Fire"
  description="Fire protection, emergency response, and first responder services"
  domainId="00000000-0000-0000-0000-000000000013"
  {loading}
  {error}
>
  {#snippet headerRight()}
    <button class="new-btn" onclick={() => navigate('/domains/00000000-0000-0000-0000-000000000013/units/new')}>+ New company</button>
  {/snippet}

  <DomainRolesTable {roles} rolesUrl="/api/fire/roles" onChanged={load} />

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
</DomainPage>

<style>
  h2 { margin: 0 0 12px; font-size: 16px; font-weight: 600; }
  .section { margin-bottom: 2.5rem; }
  .section-header { display: flex; align-items: baseline; gap: 10px; margin-bottom: 12px; }
  .section-header h2 { margin: 0; }
  .count { font-size: 0.85rem; }
  .new-btn { background: var(--accent); border: none; border-radius: var(--radius); padding: 7px 16px; color: #fff; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 0.4rem 0.75rem; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-muted, #888); border-bottom: 1px solid var(--color-border, #e2e8f0); }
  td { padding: 0.65rem 0.75rem; border-bottom: 1px solid var(--color-border, #f1f5f9); font-size: 0.9rem; }
  td.name { font-weight: 500; }
  td.num, th.num { text-align: right; font-variant-numeric: tabular-nums; }
  tr.clickable { cursor: pointer; }
  tr.clickable:hover td { background: var(--color-hover, #f8fafc); }
  .muted { color: var(--text-secondary); }
</style>
