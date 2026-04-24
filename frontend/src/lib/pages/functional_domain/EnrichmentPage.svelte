<script lang="ts">
  import DomainPage from '../../components/DomainPage.svelte';
  import DomainRolesTable from '../../components/DomainRolesTable.svelte';
  const { navigate }: { navigate: (path: string) => void } = $props();

  interface RoleDto { id: string; title: string; description: string; kinPerMonth: number; memberId: string | null; memberName: string | null; active: boolean; }
  interface EventDto { id: string; title: string; description: string; type: string; organizerId: string; scheduledAt: string; durationMinutes: number; locationDescription: string; maxAttendees: number | null; }

  let roles       = $state<RoleDto[]>([]);
  let events      = $state<EventDto[]>([]);
  let loading     = $state(true);
  let error: string | null = $state(null);

  async function load() {
    try {
      const [rolesRes, eventsRes] = await Promise.all([
        fetch('/api/enrichment/roles'),
        fetch('/api/enrichment/events/upcoming'),
      ]);
      if (!rolesRes.ok)  throw new Error(`roles ${rolesRes.status}`);
      if (!eventsRes.ok) throw new Error(`events ${eventsRes.status}`);
      [roles, events] = await Promise.all([rolesRes.json(), eventsRes.json()]);
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }


  function formatDate(iso: string): string {
    return new Date(iso).toLocaleString(undefined, {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  }

  load();
</script>

<DomainPage
  {navigate}
  title="Enrichment"
  description="Cultural events, recreation, and community celebration"
  domainId="00000000-0000-0000-0000-000000000016"
  {loading}
  {error}
>
  <DomainRolesTable {roles} rolesUrl="/api/enrichment/roles" onChanged={load} />

  <section class="section">
    <div class="section-header">
      <h2>Upcoming Events <span class="count">{events.length}</span></h2>
    </div>
    {#if events.length === 0}
      <p class="muted">No upcoming events scheduled.</p>
    {:else}
      <table class="data-table">
        <thead><tr><th>Event</th><th>When</th><th>Location</th><th>Duration</th></tr></thead>
        <tbody>
          {#each events as event (event.id)}
            <tr>
              <td>
                <div class="event-title">{event.title}</div>
                <div class="event-type">{event.type}</div>
                {#if event.description}<div class="event-desc">{event.description}</div>{/if}
              </td>
              <td class="no-wrap">{formatDate(event.scheduledAt)}</td>
              <td>{event.locationDescription || '—'}</td>
              <td>{event.durationMinutes} min{event.maxAttendees !== null ? ` · max ${event.maxAttendees}` : ''}</td>
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
  .section-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 12px; }
  .section-header h2 { margin: 0; }
  .count { font-size: 0.8rem; font-weight: 400; color: var(--color-muted, #888); background: var(--color-bg-subtle, #f1f5f9); padding: 0.1rem 0.45rem; border-radius: 10px; }
  .data-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  .data-table th, .data-table td { padding: 0.6rem 0.75rem; text-align: left; border-bottom: 1px solid var(--color-border, #e2e8f0); }
  .data-table th { font-weight: 600; color: var(--color-muted, #555); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
  .event-title { font-weight: 500; }
  .event-type { font-size: 0.75rem; color: var(--color-muted, #888); text-transform: capitalize; margin-top: 0.15rem; }
  .event-desc { font-size: 0.8rem; color: var(--color-muted, #888); margin-top: 0.2rem; }
  .no-wrap { white-space: nowrap; }
  .muted { color: var(--color-muted, #888); }
</style>
