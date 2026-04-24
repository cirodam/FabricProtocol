<script lang="ts">
  import DomainPage from '../../components/DomainPage.svelte';
  import DomainRolesTable from '../../components/DomainRolesTable.svelte';
  const { navigate }: { navigate: (path: string) => void } = $props();

  interface RoleDto { id: string; title: string; description: string; kinPerMonth: number; memberId: string | null; memberName: string | null; active: boolean; }
  interface DeliveryRequest { id: string; description: string; originLabel: string | null; destinationLabel: string | null; priority: 'regular' | 'urgent'; status: string; createdAt: string; }

  let roles       = $state<RoleDto[]>([]);
  let requests    = $state<DeliveryRequest[]>([]);
  let loading     = $state(true);
  let error: string | null = $state(null);

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

  load();
</script>

<DomainPage
  {navigate}
  title="Courier"
  description="On-demand delivery of goods and documents within the community"
  domainId="00000000-0000-0000-0000-000000000010"
  {loading}
  {error}
>
  <DomainRolesTable {roles} rolesUrl="/api/courier/roles" onChanged={load} />

  <section class="section">
    <h2>Pending Deliveries</h2>
    {#if requests.length === 0}
      <p class="muted">No pending delivery requests.</p>
    {:else}
      <table class="data-table">
        <thead><tr><th>Description</th><th>From</th><th>To</th><th>Priority</th><th>Requested</th></tr></thead>
        <tbody>
          {#each requests as r (r.id)}
            <tr>
              <td class="bold">{r.description}</td>
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
</DomainPage>

<style>
  h2 { margin: 0 0 12px; font-size: 16px; font-weight: 600; }
  .section { margin-bottom: 2.5rem; }
  .data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  .data-table th, .data-table td { padding: 0.6rem 0.75rem; text-align: left; border-bottom: 1px solid var(--color-border, #e2e8f0); }
  .data-table th { font-weight: 600; color: var(--color-muted, #555); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
  .bold { font-weight: 500; }
  .badge { display: inline-block; font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.55rem; border-radius: 999px; }
  .badge.urgent  { background: #fef3c7; color: #92400e; }
  .badge.regular { background: var(--color-surface, #f1f5f9); color: var(--color-muted, #555); }
  .muted { color: var(--color-muted, #888); }
</style>
