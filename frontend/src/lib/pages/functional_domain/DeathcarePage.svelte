<script lang="ts">
  import DomainPage from '../../components/DomainPage.svelte';
  import DomainRolesTable from '../../components/DomainRolesTable.svelte';
  const { navigate }: { navigate: (path: string) => void } = $props();

  let roles = $state<{ id: string; title: string; description: string; kinPerMonth: number; memberId: string | null; memberName: string | null; active: boolean }[]>([]);
  let loading = $state(true);
  let error: string | null = $state(null);

  async function load() {
    try {
      const res = await fetch('/api/deathcare/roles');
      if (!res.ok) throw new Error(`roles ${res.status}`);
      roles = await res.json();
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
  title="Deathcare"
  description="Dignified handling of deceased members, burial grounds, and end-of-life coordination"
  domainId="00000000-0000-0000-0000-000000000017"
  {loading}
  {error}
>
  <DomainRolesTable {roles} rolesUrl="/api/deathcare/roles" onChanged={load} />
</DomainPage>
