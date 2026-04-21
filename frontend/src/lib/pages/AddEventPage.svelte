<script lang="ts">
  const { navigate } = $props<{ navigate: (to: string) => void }>();

  type Member = { id: string; firstName: string; lastName: string; handle: string };

  let members: Member[] = $state([]);
  let submitting = $state(false);
  let error = $state('');

  // Form fields
  let title       = $state('');
  let type        = $state('general');
  let description = $state('');
  let location    = $state('');
  let dateStr     = $state('');
  let startTime   = $state('09:00');
  let endTime     = $state('');
  let allDay      = $state(false);
  let createdBy   = $state('');

  // Recurrence
  let recurring   = $state(false);
  let frequency   = $state('weekly');
  let daysOfWeek: number[] = $state([]);
  let untilDate   = $state('');
  let occCount    = $state('');

  async function loadMembers() {
    try {
      const res = await fetch('/api/members');
      if (res.ok) members = await res.json();
    } catch { /* ignore */ }
  }

  $effect(() => { void loadMembers(); });

  const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  function toggleDay(d: number) {
    if (daysOfWeek.includes(d)) daysOfWeek = daysOfWeek.filter(x => x !== d);
    else daysOfWeek = [...daysOfWeek, d];
  }

  async function submit() {
    if (!title.trim() || !dateStr || !createdBy) {
      error = 'Title, date, and creator are required.';
      return;
    }
    error = '';
    submitting = true;
    try {
      const startAt = allDay
        ? new Date(`${dateStr}T00:00:00`).toISOString()
        : new Date(`${dateStr}T${startTime}:00`).toISOString();

      const endAt = (!allDay && endTime)
        ? new Date(`${dateStr}T${endTime}:00`).toISOString()
        : null;

      const recurrence = recurring
        ? {
            frequency,
            ...(( frequency === 'weekly' || frequency === 'biweekly') && daysOfWeek.length > 0
              ? { daysOfWeek }
              : {}),
            ...(untilDate ? { until: new Date(`${untilDate}T23:59:59`).toISOString() } : {}),
            ...(occCount && !untilDate ? { count: parseInt(occCount, 10) } : {}),
          }
        : null;

      const res = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          type,
          startAt,
          endAt,
          allDay,
          createdBy,
          description: description.trim() || null,
          location: location.trim() || null,
          recurrence,
        }),
      });
      if (!res.ok) {
        const body = await res.json() as { error?: string };
        throw new Error(body.error ?? 'Failed to create event');
      }
      navigate('/calendar');
    } catch (e) {
      error = String(e);
    } finally {
      submitting = false;
    }
  }
</script>

<div class="page">
  <div class="page-header">
    <h1>New Calendar Event</h1>
    <button class="btn-ghost" onclick={() => navigate('/calendar')}>← Back</button>
  </div>

  {#if error}
    <p class="form-error">{error}</p>
  {/if}

  <form onsubmit={(e) => { e.preventDefault(); void submit(); }}>
    <div class="form-grid">

      <div class="field full">
        <label for="title">Title *</label>
        <input id="title" type="text" bind:value={title} placeholder="Event title" required />
      </div>

      <div class="field">
        <label for="type">Type *</label>
        <select id="type" bind:value={type}>
          <option value="general">General</option>
          <option value="marketplace">Marketplace Day</option>
          <option value="meeting">Meeting</option>
          <option value="workshop">Workshop</option>
          <option value="holiday">Holiday</option>
        </select>
      </div>

      <div class="field">
        <label for="creator">Created by *</label>
        <select id="creator" bind:value={createdBy}>
          <option value="">— select member —</option>
          {#each members as m}
            <option value={m.id}>{m.firstName} {m.lastName} (@{m.handle})</option>
          {/each}
        </select>
      </div>

      <div class="field">
        <label for="date">Date *</label>
        <input id="date" type="date" bind:value={dateStr} required />
      </div>

      <div class="field all-day-row">
        <label>
          <input type="checkbox" bind:checked={allDay} />
          All day
        </label>
      </div>

      {#if !allDay}
        <div class="field">
          <label for="start-time">Start time</label>
          <input id="start-time" type="time" bind:value={startTime} />
        </div>
        <div class="field">
          <label for="end-time">End time</label>
          <input id="end-time" type="time" bind:value={endTime} placeholder="optional" />
        </div>
      {/if}

      <div class="field">
        <label for="location">Location</label>
        <input id="location" type="text" bind:value={location} placeholder="optional" />
      </div>

      <div class="field full">
        <label for="description">Description</label>
        <textarea id="description" rows="3" bind:value={description} placeholder="optional details…"></textarea>
      </div>

      <!-- ── Recurrence ── -->
      <div class="field full recurrence-toggle">
        <label>
          <input type="checkbox" bind:checked={recurring} />
          Recurring event
        </label>
      </div>

      {#if recurring}
        <div class="recurrence-box full">
          <div class="recurrence-row">
            <div class="field">
              <label for="frequency">Frequency</label>
              <select id="frequency" bind:value={frequency}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div class="field">
              <label for="until">End date <span class="hint">(or leave blank)</span></label>
              <input id="until" type="date" bind:value={untilDate} />
            </div>

            <div class="field">
              <label for="count">Max occurrences <span class="hint">(or leave blank)</span></label>
              <input id="count" type="number" min="1" bind:value={occCount} placeholder="∞" />
            </div>
          </div>

          {#if frequency === 'weekly' || frequency === 'biweekly'}
            <div class="days-row">
              <span class="days-label">Days:</span>
              {#each DAY_LABELS as label, i}
                <button
                  type="button"
                  class="day-btn"
                  class:selected={daysOfWeek.includes(i)}
                  onclick={() => toggleDay(i)}
                >{label}</button>
              {/each}
              <span class="hint">(leave blank to use event's start day)</span>
            </div>
          {/if}
        </div>
      {/if}

    </div>

    <div class="form-actions">
      <button type="button" class="btn-secondary" onclick={() => navigate('/calendar')}>Cancel</button>
      <button type="submit" class="btn-primary" disabled={submitting}>
        {submitting ? 'Saving…' : 'Create Event'}
      </button>
    </div>
  </form>
</div>

<style>
  .page { max-width: 700px; margin: 0 auto; padding: 1.5rem; }
  .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
  h1 { margin: 0; font-size: 1.4rem; }

  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .field { display: flex; flex-direction: column; gap: 0.3rem; }
  .field.full { grid-column: 1 / -1; }

  label { font-size: 0.85rem; font-weight: 600; color: #444; }
  input[type="text"],
  input[type="date"],
  input[type="time"],
  input[type="number"],
  select,
  textarea {
    padding: 0.45rem 0.6rem;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 0.9rem;
    width: 100%;
    box-sizing: border-box;
  }
  textarea { resize: vertical; }

  .all-day-row { justify-content: flex-end; padding-top: 1.5rem; }
  .all-day-row label { display: flex; align-items: center; gap: 0.4rem; font-weight: 400; cursor: pointer; }

  .recurrence-toggle label { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; cursor: pointer; }

  .recurrence-box { background: #f7f9fc; border: 1px solid #d0dce8; border-radius: 6px; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
  .recurrence-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }

  .days-row { display: flex; align-items: center; flex-wrap: wrap; gap: 0.4rem; }
  .days-label { font-size: 0.85rem; font-weight: 600; color: #444; }
  .day-btn { padding: 0.3rem 0.5rem; border: 1px solid #ccc; border-radius: 4px; background: white; cursor: pointer; font-size: 0.8rem; }
  .day-btn.selected { background: #1a6db5; color: white; border-color: #1a6db5; }
  .hint { font-size: 0.75rem; color: #888; font-weight: 400; }

  .form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }

  .btn-primary { padding: 0.55rem 1.2rem; background: #1a6db5; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; }
  .btn-primary:hover:not(:disabled) { background: #155a96; }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-secondary { padding: 0.5rem 1rem; background: white; border: 1px solid #ccc; border-radius: 6px; cursor: pointer; font-size: 0.9rem; }
  .btn-ghost { background: none; border: none; cursor: pointer; color: #1a6db5; font-size: 0.9rem; }

  .form-error { color: #c0392b; background: #fdf0f0; border-radius: 4px; padding: 0.6rem 0.8rem; margin-bottom: 1rem; font-size: 0.9rem; }
</style>
