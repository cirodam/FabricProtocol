<script lang="ts">
  const { domainId, navigate }: { domainId: string; navigate: (path: string) => void } = $props();

  interface Seat { memberId: string; seatedAt: string; firstName: string; lastName: string; handle: string; }
  interface Guild { id: string; name: string; memberCount: number; }
  interface Council {
    domainId: string; domainName: string; poolId: string | null; poolName: string | null;
    size: number; seatCount: number; vacancies: number; seats: Seat[];
  }

  let council: Council | null = $state(null);
  let allGuilds: Guild[]      = $state([]);
  let loading        = $state(true);
  let error          = $state("");
  let selectedGuildId = $state("");
  let guildSaving    = $state(false);
  let drawWorking    = $state(false);
  let drawError      = $state("");

  async function load() {
    try {
      const [cRes, gRes] = await Promise.all([
        fetch(`/api/councils/${domainId}`),
        fetch("/api/guilds"),
      ]);
      if (!cRes.ok) throw new Error(`${cRes.status}`);
      council         = await cRes.json();
      allGuilds       = (await gRes.json()).guilds;
      selectedGuildId = council?.poolId ?? "";
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : "Failed to load";
    } finally {
      loading = false;
    }
  }

  async function saveGuild() {
    guildSaving = true;
    try {
      const res = await fetch(`/api/councils/${domainId}/pool`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poolId: selectedGuildId || null }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      await load();
    } finally {
      guildSaving = false;
    }
  }

  async function draw() {
    drawWorking = true; drawError = "";
    try {
      const res = await fetch(`/api/councils/${domainId}/draw`, { method: "POST" });
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
    const res = await fetch(`/api/councils/${domainId}/seats/${memberId}`, { method: "DELETE" });
    if (res.ok) await load();
  }

  load();
</script>

<section class="council-panel">
  <div class="panel-header">
    <h2>Domain Council</h2>
    {#if council && council.vacancies > 0 && council.poolId}
      <button class="primary" onclick={draw} disabled={drawWorking}>
        {drawWorking ? "Drawing…" : `Draw ${council.vacancies} seat${council.vacancies === 1 ? '' : 's'}`}
      </button>
    {/if}
  </div>

  {#if loading}
    <p class="muted">Loading council…</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if council}
    {#if drawError}<p class="error">{drawError}</p>{/if}

    <p class="meta">{council.seatCount} / {council.size} seats filled</p>

    {#if council.seats.length === 0}
      <p class="muted empty">
        {council.poolId ? 'No seats filled. Use Draw to select members.' : 'Link a guild below, then draw seats.'}
      </p>
    {:else}
      <div class="table-wrap">
        <table>
          <thead><tr><th>Member</th><th>Handle</th><th>Seated</th><th></th></tr></thead>
          <tbody>
            {#each council.seats as s (s.memberId)}
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

    {#if council.vacancies > 0}
      <p class="vacancy-note">{council.vacancies} vacant {council.vacancies === 1 ? 'seat' : 'seats'}</p>
    {/if}

    <div class="pool-row">
      <select bind:value={selectedGuildId} disabled={guildSaving}>
        <option value="">— No guild linked —</option>
        {#each allGuilds as g (g.id)}
          <option value={g.id}>{g.name} ({g.memberCount} members)</option>
        {/each}
      </select>
      <button
        class="primary"
        onclick={saveGuild}
        disabled={guildSaving || selectedGuildId === (council.poolId ?? "")}
      >
        {guildSaving ? "Saving…" : "Save guild"}
      </button>
    </div>
    {#if allGuilds.length === 0}
      <p class="hint">
        No guilds yet.
        <button class="link-btn" onclick={() => navigate('/guilds/new')}>Create one →</button>
      </p>
    {/if}
  {/if}
</section>

<style>
  .council-panel {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--color-border, #e2e8f0);
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  h2 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-muted, #666);
  }

  .meta {
    margin: 0 0 0.75rem;
    font-size: 0.85rem;
    color: var(--text-secondary);
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
  td {
    padding: 0.55rem 0.75rem;
    border-bottom: 1px solid var(--color-border, #f1f5f9);
    font-size: 0.9rem;
  }
  td.name { font-weight: 500; }
  td.muted { color: var(--text-secondary); }
  td.actions-cell { text-align: right; }

  .vacancy-note {
    margin: 0.5rem 0 0.75rem;
    font-size: 0.875rem;
    color: var(--color-warning, #d97706);
    font-weight: 500;
  }

  .vacate-btn {
    background: none;
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: 4px;
    padding: 0.2rem 0.6rem;
    font-size: 0.8rem;
    cursor: pointer;
    color: var(--color-danger, #dc2626);
  }

  .pool-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    margin-top: 1rem;
  }

  .pool-row select {
    flex: 1;
    padding: 0.45rem 0.75rem;
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: 6px;
    font-size: 0.9rem;
    background: var(--color-surface, #fff);
  }

  .hint {
    margin-top: 0.5rem;
    font-size: 0.85rem;
    color: var(--text-secondary);
  }

  .empty { margin: 0 0 1rem; }
  .muted { color: var(--text-secondary); }

  .link-btn {
    background: none;
    border: none;
    color: var(--color-primary, #2563eb);
    cursor: pointer;
    padding: 0;
    font-size: inherit;
    text-decoration: underline;
  }

  button {
    padding: 0.4rem 0.9rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    border: 1px solid var(--color-border, #e2e8f0);
    background: none;
  }
  button:disabled { opacity: 0.6; cursor: not-allowed; }
  .primary { background: var(--color-primary, #2563eb); color: #fff; border-color: transparent; }
  .error { color: var(--color-danger, #dc2626); font-size: 0.875rem; margin: 0 0 0.5rem; }
</style>
