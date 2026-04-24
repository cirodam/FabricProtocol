<script lang="ts">
  import DomainPage from '../components/DomainPage.svelte';
  import DomainRolesTable from '../components/DomainRolesTable.svelte';
  const { navigate }: { navigate: (path: string) => void } = $props();

  let roles = $state<{ id: string; title: string; description: string; kinPerMonth: number; memberId: string | null; memberName: string | null; active: boolean }[]>([]);
  let loading = $state(true);
  let error = $state('');

  async function load() {
    try {
      const res = await fetch('/api/sanitation/roles');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      roles = await res.json();
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : 'Failed to load sanitation';
    } finally {
      loading = false;
    }
  }

  load();
</script>

<DomainPage
  {navigate}
  title="Sanitation"
  description="Waste management, hygiene infrastructure, and disease prevention"
  domainId="00000000-0000-0000-0000-000000000008"
  {loading}
  {error}
>
  <DomainRolesTable {roles} rolesUrl="/api/sanitation/roles" onChanged={load} />
</DomainPage>
