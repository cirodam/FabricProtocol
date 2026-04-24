<script lang="ts">
  import DomainPage from '../../components/DomainPage.svelte';
  import DomainRolesTable from '../../components/DomainRolesTable.svelte';
  const { navigate }: { navigate: (path: string) => void } = $props();

  let roles = $state<{ id: string; title: string; description: string; kinPerMonth: number; memberId: string | null; memberName: string | null; active: boolean }[]>([]);
  let loading = $state(true);
  let error = $state('');

  async function load() {
    try {
      const res = await fetch('/api/water/roles');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      roles = await res.json();
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : 'Failed to load water';
    } finally {
      loading = false;
    }
  }

  load();
</script>

<DomainPage
  {navigate}
  title="Water"
  description="Freshwater extraction, treatment, storage, distribution, and irrigation"
  domainId="00000000-0000-0000-0000-000000000009"
  {loading}
  {error}
>
  <DomainRolesTable {roles} rolesUrl="/api/water/roles" onChanged={load} />
</DomainPage>
