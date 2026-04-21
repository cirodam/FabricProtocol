<script lang="ts">
  const { navigate } = $props<{ navigate: (to: string) => void }>();

  type Occurrence = {
    eventId: string;
    occurrenceId: string;
    title: string;
    type: string;
    description: string | null;
    location: string | null;
    startAt: string;
    endAt: string | null;
    allDay: boolean;
    isRecurring: boolean;
    createdBy: string;
  };

  const TYPE_COLORS: Record<string, string> = {
    marketplace: '#2d9142',
    meeting:     '#1a6db5',
    workshop:    '#c47a00',
    holiday:     '#8b3a8b',
    general:     '#555',
  };

  const TYPE_LABELS: Record<string, string> = {
    marketplace: 'Marketplace',
    meeting:     'Meeting',
    workshop:    'Workshop',
    holiday:     'Holiday',
    general:     'General',
  };

  // ── Calendar state ──────────────────────────────────────────────────────────
  const today = new Date();
  let year  = $state(today.getFullYear());
  let month = $state(today.getMonth()); // 0-indexed

  // ── Data ────────────────────────────────────────────────────────────────────
  let occurrences: Occurrence[] = $state([]);
  let loading = $state(false);
  let error   = $state('');
  let selected: Occurrence | null = $state(null);

  // ── Derived: month grid ─────────────────────────────────────────────────────
  const MONTH_NAMES = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December',
  ];

  const monthLabel = $derived(`${MONTH_NAMES[month]} ${year}`);

  const days = $derived(() => {
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  });

  const occsByDay = $derived(() => {
    const map = new Map<string, Occurrence[]>();
    for (const o of occurrences) {
      const d = o.startAt.slice(0, 10); // YYYY-MM-DD
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(o);
    }
    return map;
  });

  // ── Upcoming (next 30 days from today) ──────────────────────────────────────
  const upcoming = $derived(() => {
    const now = new Date();
    const limit = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return occurrences
      .filter(o => {
        const d = new Date(o.startAt);
        return d >= now && d <= limit;
      })
      .slice(0, 10);
  });

  // ── Load occurrences for the current month ──────────────────────────────────
  async function loadMonth() {
    loading = true;
    error   = '';
    try {
      const start = new Date(year, month, 1).toISOString();
      const end   = new Date(year, month + 1, 0, 23, 59, 59).toISOString();
      const res   = await fetch(`/api/calendar?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
      if (!res.ok) throw new Error(await res.text());
      occurrences = await res.json();
    } catch (e) {
      error = String(e);
    } finally {
      loading = false;
    }
  }

  // Load on mount and whenever year/month changes
  $effect(() => { void loadMonth(); });

  function prevMonth() {
    if (month === 0) { month = 11; year--; } else month--;
  }
  function nextMonth() {
    if (month === 11) { month = 0; year++; } else month++;
  }
  function goToday() { year = today.getFullYear(); month = today.getMonth(); }

  function isToday(day: number) {
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  }

  function dayKey(day: number) {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  }

  function formatTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function typeColor(type: string) { return TYPE_COLORS[type] ?? '#555'; }
  function typeLabel(type: string) { return TYPE_LABELS[type] ?? type; }
</script>

<div class="calendar-page">
  <div class="page-header">
    <h1>Community Calendar</h1>
    <button class="btn-primary" onclick={() => navigate('/calendar/new')}>+ New Event</button>
  </div>

  {#if error}
    <p class="error">{error}</p>
  {/if}

  <div class="layout">
    <!-- ── Month view ── -->
    <section class="month-section">
      <div class="month-nav">
        <button onclick={prevMonth}>‹</button>
        <h2>{monthLabel}</h2>
        <button onclick={nextMonth}>›</button>
        <button class="today-btn" onclick={goToday}>Today</button>
      </div>

      {#if loading}
        <p class="loading">Loading…</p>
      {:else}
        <div class="grid">
          {#each ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'] as wd}
            <div class="weekday-header">{wd}</div>
          {/each}
          {#each days() as day}
            {#if day === null}
              <div class="cell empty"></div>
            {:else}
              {@const key = dayKey(day)}
              {@const evs = occsByDay().get(key) ?? []}
              <div
                class="cell"
                class:today={isToday(day)}
                class:has-events={evs.length > 0}
              >
                <span class="day-num">{day}</span>
                <div class="event-dots">
                  {#each evs.slice(0, 3) as occ}
                    <button
                      class="event-chip"
                      style="background: {typeColor(occ.type)}"
                      onclick={() => selected = occ}
                      title={occ.title}
                    >
                      {occ.allDay ? occ.title : `${formatTime(occ.startAt)} ${occ.title}`}
                    </button>
                  {/each}
                  {#if evs.length > 3}
                    <span class="more">+{evs.length - 3} more</span>
                  {/if}
                </div>
              </div>
            {/if}
          {/each}
        </div>
      {/if}
    </section>

    <!-- ── Upcoming sidebar ── -->
    <section class="upcoming-section">
      <h3>Upcoming (30 days)</h3>
      {#if upcoming().length === 0}
        <p class="empty-msg">No upcoming events.</p>
      {:else}
        <ul class="upcoming-list">
          {#each upcoming() as occ}
            <li>
              <button class="upcoming-item" onclick={() => selected = occ}>
                <span class="type-badge" style="background:{typeColor(occ.type)}">{typeLabel(occ.type)}</span>
                <span class="upcoming-title">{occ.title}</span>
                <span class="upcoming-date">{formatDate(occ.startAt)}{#if !occ.allDay}, {formatTime(occ.startAt)}{/if}</span>
                {#if occ.location}<span class="upcoming-loc">📍 {occ.location}</span>{/if}
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </section>
  </div>
</div>

<!-- ── Event detail modal ── -->
{#if selected}
  <div
    class="modal-backdrop"
    role="button"
    tabindex="-1"
    onclick={() => selected = null}
    onkeydown={(e) => { if (e.key === 'Escape') selected = null; }}
  >
    <div class="modal" onclick={(e) => e.stopPropagation()}>
      <div class="modal-header" style="border-left: 4px solid {typeColor(selected.type)}">
        <span class="type-badge" style="background:{typeColor(selected.type)}">{typeLabel(selected.type)}</span>
        {#if selected.isRecurring}<span class="recurring-badge">↻ Recurring</span>{/if}
        <h2>{selected.title}</h2>
      </div>
      <div class="modal-body">
        <p class="detail-line">
          📅 {formatDate(selected.startAt)}
          {#if !selected.allDay}
            {formatTime(selected.startAt)}
            {#if selected.endAt} – {formatTime(selected.endAt)}{/if}
          {:else}
            <em>(all day)</em>
          {/if}
        </p>
        {#if selected.location}
          <p class="detail-line">📍 {selected.location}</p>
        {/if}
        {#if selected.description}
          <p class="description">{selected.description}</p>
        {/if}
      </div>
      <div class="modal-actions">
        <button class="btn-secondary" onclick={() => selected = null}>Close</button>
        <button
          class="btn-danger"
          onclick={async () => {
            if (!confirm('Delete this event and all its occurrences?')) return;
            await fetch(`/api/calendar/events/${selected!.eventId}`, { method: 'DELETE' });
            selected = null;
            await loadMonth();
          }}
        >Delete</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .calendar-page { max-width: 1200px; margin: 0 auto; padding: 1.5rem; }
  .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
  h1 { margin: 0; font-size: 1.5rem; }

  .layout { display: grid; grid-template-columns: 1fr 280px; gap: 1.5rem; }
  @media (max-width: 900px) { .layout { grid-template-columns: 1fr; } }

  /* Month nav */
  .month-nav { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.75rem; }
  .month-nav h2 { margin: 0; font-size: 1.2rem; flex: 1; text-align: center; }
  .month-nav button { padding: 0.3rem 0.6rem; cursor: pointer; border: 1px solid #ccc; border-radius: 4px; background: white; }
  .today-btn { font-size: 0.8rem; }

  /* Grid */
  .grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; background: #ddd; border: 1px solid #ddd; border-radius: 6px; overflow: hidden; }
  .weekday-header { background: #f5f5f5; padding: 0.4rem; text-align: center; font-size: 0.75rem; font-weight: 600; color: #666; }
  .cell { background: white; min-height: 90px; padding: 0.3rem; overflow: hidden; }
  .cell.empty { background: #fafafa; }
  .cell.today .day-num { background: #1a6db5; color: white; border-radius: 50%; width: 22px; height: 22px; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; }
  .day-num { font-size: 0.8rem; font-weight: 500; color: #333; }

  .event-dots { display: flex; flex-direction: column; gap: 2px; margin-top: 2px; }
  .event-chip { display: block; width: 100%; text-align: left; border: none; border-radius: 3px; color: white; font-size: 0.68rem; padding: 1px 4px; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .more { font-size: 0.65rem; color: #888; padding-left: 2px; }

  /* Upcoming */
  .upcoming-section h3 { margin: 0 0 0.75rem; font-size: 1rem; }
  .upcoming-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
  .upcoming-item { display: flex; flex-direction: column; gap: 2px; background: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 6px; padding: 0.5rem 0.75rem; cursor: pointer; text-align: left; width: 100%; }
  .upcoming-item:hover { background: #f0f4ff; }
  .upcoming-title { font-weight: 600; font-size: 0.9rem; }
  .upcoming-date { font-size: 0.78rem; color: #555; }
  .upcoming-loc { font-size: 0.75rem; color: #777; }
  .type-badge { font-size: 0.65rem; color: white; border-radius: 3px; padding: 1px 5px; display: inline-block; width: fit-content; }
  .recurring-badge { font-size: 0.7rem; color: #777; margin-left: 0.5rem; }
  .empty-msg { font-size: 0.85rem; color: #888; }

  /* Modal */
  .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 100; }
  .modal { background: white; border-radius: 8px; padding: 1.5rem; max-width: 480px; width: 90%; box-shadow: 0 8px 32px rgba(0,0,0,0.18); }
  .modal-header { padding-bottom: 0.75rem; margin-bottom: 0.75rem; border-bottom: 1px solid #eee; }
  .modal-header h2 { margin: 0.4rem 0 0; font-size: 1.2rem; }
  .modal-body { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }
  .detail-line { margin: 0; font-size: 0.9rem; color: #444; }
  .description { margin: 0.5rem 0 0; font-size: 0.9rem; color: #333; white-space: pre-wrap; }
  .modal-actions { display: flex; gap: 0.5rem; justify-content: flex-end; }

  .btn-primary { padding: 0.5rem 1rem; background: #1a6db5; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; }
  .btn-primary:hover { background: #155a96; }
  .btn-secondary { padding: 0.4rem 0.8rem; background: white; border: 1px solid #ccc; border-radius: 6px; cursor: pointer; }
  .btn-danger { padding: 0.4rem 0.8rem; background: #c0392b; color: white; border: none; border-radius: 6px; cursor: pointer; }
  .btn-danger:hover { background: #a93226; }
  .loading { color: #888; text-align: center; padding: 2rem; }
  .error { color: #c0392b; padding: 0.75rem; background: #fdf0f0; border-radius: 4px; }
</style>
