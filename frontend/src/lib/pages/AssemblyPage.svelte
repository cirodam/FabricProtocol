<script lang="ts">
  interface Seat { memberId: string; seatedAt: string; firstName: string; lastName: string; handle: string; }
  interface Assembly {
    size: number; seatCount: number; vacancies: number; seats: Seat[];
  }

  let assembly: Assembly | null = $state(null);
  let loading     = $state(true);
  let error       = $state("");
  let drawWorking = $state(false);
  let drawError   = $state("");

  async function load() {
    try {
      const res = await fetch("/api/assembly");
      if (!res.ok) throw new Error(`${res.status}`);
      assembly = await res.json();
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : "Failed to load";
    } finally {
      loading = false;
    }
  }

  async function draw() {
    drawWorking = true; drawError = "";
    try {
      const res = await fetch("/api/assembly/draw", { method: "POST" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `HTTP ${res.status}`);
      }
      await load();
    } catch (e: unknown) {
      drawError = e instanceof Error ? e.message : "Draw failed";
    } finally {
      drawWorking = false;
    }
  }

  async function vacate(memberId: string) {
    const res = await fetch(`/api/assembly/seats/${memberId}`, { method: "DELETE" });
    if (res.ok) await load();
  }

  load();
</script>

<div class="page">
  <div class="page-header">
    <div>
      <span class="badge">Citizens Assembly</span>
      <h1>Citizens Assembly</h1>
    </div>
    {#if assembly && assembly.vacancies > 0}
      <button class="primary" onclick={draw} disabled={drawWorking}>
        {drawWorking ? "Drawing…" : `Draw ${assembly.vacancies} seat${assembly.vacancies === 1 ? '' : 's'}`}
      </button>
    {/if}
  </div>

  {#if loading}
    <p class="muted">Loading…</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if assembly}
    <p class="meta">{assembly.seatCount} / {assembly.size} seats filled</p>

    {#if drawError}<p class="error">{drawError}</p>{/if}

    <!-- Seats -->
    <section class="section">
      <h2>Members</h2>
      {#if assembly.seats.length === 0}
        <p class="muted">No seats filled yet. Use Draw to randomly select members.</p>
      {:else}
        <div class="table-wrap">
          <table>
            <thead><tr><th>Member</th><th>Handle</th><th>Seated</th><th></th></tr></thead>
            <tbody>
              {#each assembly.seats as s (s.memberId)}
                <tr>
                  <td class="name">{s.firstName} {s.lastName}</td>
                  <td class="muted">{s.handle || '—'}</td>
                  <td class="muted">{new Date(s.seatedAt).toLocaleDateString()}</td>
                  <td class="actions-cell">
                    <button class="vacate-btn" onclick={() => vacate(s.memberId)}>Vacate</button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
      {#if assembly.vacancies > 0}
        <p class="vacancy-note">{assembly.vacancies} vacant {assembly.vacancies === 1 ? 'seat' : 'seats'}</p>
      {/if}
    </section>
  {/if}
</div>

<style>
  .page { max-width: 760px; margin: 0 auto; padding: 2rem 1rem; }

  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.5rem;
    flex-wrap: wrap;
  }

  .badge {
    display: inline-block;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
    background: #e0e7ff;
    color: #3730a3;
    margin-bottom: 0.4rem;
  }

  h1 { margin: 0; font-size: 1.5rem; font-weight: 700; }
  .meta { margin: 0 0 1.5rem; font-size: 0.9rem; color: var(--text-secondary); }

  .section { margin-bottom: 2rem; }
  h2 {
    margin: 0 0 0.75rem;
    font-size: 0.875rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-muted, #666);
  }

  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  th {
    text-align: left;
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-muted, #888);
    border-bottom: 1px solid var(--color-border, #e2e8f0);
  }
  td { padding: 0.6rem 0.75rem; border-bottom: 1px solid var(--color-border, #f1f5f9); font-size: 0.9rem; }
  td.name { font-weight: 500; }
  td.muted { color: var(--text-secondary); }
  td.actions-cell { text-align: right; }

  .vacancy-note { margin: 0.75rem 0 0; font-size: 0.875rem; color: var(--color-warning, #d97706); font-weight: 500; }
  .vacate-btn {
    background: none;
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: 4px;
    padding: 0.2rem 0.6rem;
    font-size: 0.8rem;
    cursor: pointer;
    color: var(--color-danger, #dc2626);
  }

  .muted { color: var(--text-secondary); }

  button { padding: 0.45rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem; border: 1px solid var(--color-border, #e2e8f0); background: none; }
  button:disabled { opacity: 0.6; cursor: not-allowed; }
  .primary { background: var(--color-primary, #2563eb); color: #fff; border-color: transparent; }
  .error { color: var(--color-danger, #dc2626); font-size: 0.875rem; margin: 0 0 0.75rem; }
</style>
