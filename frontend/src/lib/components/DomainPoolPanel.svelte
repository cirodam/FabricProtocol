<script lang="ts">
  const { domainId, navigate }: { domainId: string; navigate: (path: string) => void } = $props();

  interface CouncilSeat {
    memberId: string; seatedAt: string;
    firstName: string; lastName: string; handle: string;
  }
  interface Pool {
    id: string; poolName: string; memberCount: number;
    isActive: boolean; councilSeatCount: number; councilVacancies: number;
  }
  interface Domain {
    id: string; name: string; poolId: string | null;
    pool: Pool | null; councilSeats: CouncilSeat[];
  }
  interface LeaderPoolSummary { id: string; poolName: string; memberCount: number; }

  let domain: Domain | null   = $state(null);
  let allPools: LeaderPoolSummary[] = $state([]);
  let loading     = $state(true);
  let error       = $state("");
  let selectedPoolId = $state("");
  let saving      = $state(false);
  let saveError   = $state("");

  async function load() {
    try {
      const [dRes, pRes] = await Promise.all([
        fetch(`/api/domains/${domainId}`),
        fetch("/api/leader-pools"),
      ]);
      if (!dRes.ok) throw new Error(`${dRes.status}`);
      domain       = await dRes.json();
      allPools     = (await pRes.json()).pools;
      selectedPoolId = domain?.poolId ?? "";
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : "Failed to load";
    } finally {
      loading = false;
    }
  }

  async function savePool() {
    saving = true; saveError = "";
    try {
      const res = await fetch(`/api/domains/${domainId}/pool`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ poolId: selectedPoolId || null }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `HTTP ${res.status}`);
      }
      await load();
    } catch (e: unknown) {
      saveError = e instanceof Error ? e.message : "Save failed";
    } finally {
      saving = false;
    }
  }

  load();
</script>

<section class="domain-pool-panel">
  <h2>Governing Pool</h2>

  {#if loading}
    <p class="muted">Loading…</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if domain}
    {#if domain.pool}
      {@const pool = domain.pool}
      <div class="pool-summary">
        <button class="pool-name-link" onclick={() => navigate(`/leader-pools/${pool.id}`)}>
          {pool.poolName}
        </button>
        <span class="member-count">{pool.memberCount} members</span>
        {#if pool.isActive}
          <span class="badge active">Active</span>
        {:else}
          <span class="badge dormant">Dormant (≤50 members)</span>
        {/if}
      </div>

      {#if pool.isActive}
        <div class="council-block">
          <h3>Council <span class="seat-count">{pool.councilSeatCount} / 5 seats</span></h3>
          {#if domain.councilSeats.length === 0}
            <p class="muted">No council seats filled yet.</p>
          {:else}
            <div class="table-wrap">
              <table>
                <thead><tr><th>Member</th><th>Handle</th><th>Seated</th></tr></thead>
                <tbody>
                  {#each domain.councilSeats as s (s.memberId)}
                    <tr>
                      <td>{s.firstName} {s.lastName}</td>
                      <td class="muted">{s.handle || '—'}</td>
                      <td class="muted">{new Date(s.seatedAt).toLocaleDateString()}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
          {#if pool.councilVacancies > 0}
            <p class="hint">
              {pool.councilVacancies} vacant seat{pool.councilVacancies === 1 ? '' : 's'} —
              <button class="link-btn" onclick={() => navigate(`/leader-pools/${pool.id}`)}>
                Draw from pool →
              </button>
            </p>
          {/if}
        </div>
      {/if}
    {:else}
      <p class="muted no-pool">No leader pool assigned. This domain has no governing council.</p>
    {/if}

    {#if saveError}<p class="error">{saveError}</p>{/if}
    <div class="assign-row">
      <select bind:value={selectedPoolId} disabled={saving}>
        <option value="">— Unassigned —</option>
        {#each allPools as p (p.id)}
          <option value={p.id}>{p.poolName} ({p.memberCount} members)</option>
        {/each}
      </select>
      <button
        class="primary"
        onclick={savePool}
        disabled={saving || selectedPoolId === (domain.poolId ?? "")}
      >
        {saving ? "Saving…" : "Save"}
      </button>
    </div>
    {#if allPools.length === 0}
      <p class="hint">
        No leader pools exist yet.
        <button class="link-btn" onclick={() => navigate('/leader-pools/new')}>Create one →</button>
      </p>
    {/if}
  {/if}
</section>

<style>
  .domain-pool-panel {
    margin-top: 2rem;
    margin-bottom: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--color-border, #e2e8f0);
  }

  h2 {
    margin: 0 0 0.75rem;
    font-size: 1rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-muted, #666);
  }

  h3 {
    margin: 0 0 0.5rem;
    font-size: 0.9rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .pool-summary {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
  }

  .pool-name-link {
    background: none;
    border: none;
    padding: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-primary, #2563eb);
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .member-count { font-size: 0.85rem; color: var(--color-muted, #666); }

  .badge {
    display: inline-block;
    padding: 0.15rem 0.55rem;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 600;
  }
  .badge.active  { background: #d1fae5; color: #065f46; }
  .badge.dormant { background: #fef3c7; color: #92400e; }

  .seat-count { font-weight: 400; opacity: 0.7; font-size: 0.85rem; }

  .council-block { margin-bottom: 0.75rem; }

  .table-wrap { overflow-x: auto; margin-bottom: 0.5rem; }
  table { width: 100%; border-collapse: collapse; }
  th {
    text-align: left; padding: 0.35rem 0.65rem;
    font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em;
    color: var(--color-muted, #888); border-bottom: 1px solid var(--color-border, #e2e8f0);
  }
  td { padding: 0.5rem 0.65rem; border-bottom: 1px solid var(--color-border, #f1f5f9); font-size: 0.88rem; }
  .muted { color: var(--text-secondary, #666); }

  .assign-row {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }
  .assign-row select {
    flex: 1;
    padding: 0.45rem 0.65rem;
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: 6px;
    font-size: 0.88rem;
    background: var(--color-surface, #fff);
  }

  .no-pool { margin-bottom: 0.25rem; }

  .error { color: var(--color-danger, #dc2626); font-size: 0.875rem; margin: 0.25rem 0; }

  .hint {
    font-size: 0.82rem;
    color: var(--color-muted, #666);
    margin: 0.25rem 0 0;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .link-btn {
    background: none;
    border: none;
    padding: 0;
    color: var(--color-primary, #2563eb);
    cursor: pointer;
    font-size: inherit;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  button.primary {
    padding: 0.45rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    border: 1px solid transparent;
    background: var(--color-primary, #2563eb);
    color: #fff;
  }
  button:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
