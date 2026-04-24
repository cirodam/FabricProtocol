<script lang="ts">
  const { id, navigate, path }: { id: string; navigate: (path: string) => void; path: string } = $props();

  import CommunitySidebar from '../components/CommunitySidebar.svelte';

  interface Member { id: string; firstName: string; lastName: string; handle: string; }
  interface CouncilSeat { memberId: string; seatedAt: string; firstName: string; lastName: string; handle: string; }
  interface LeaderPool {
    id: string; poolName: string;
    memberCount: number; createdAt: string; members: Member[];
    isActive: boolean;
    councilSize: number; activationThreshold: number;
    councilSeatCount: number; councilVacancies: number;
    councilSeats: CouncilSeat[];
  }

  let pool: LeaderPool | null  = $state(null);
  let allMembers: Member[]     = $state([]);
  let loading = $state(true);
  let error: string | null     = $state(null);

  let availableMembers = $derived(
    allMembers.filter(m => !pool?.members.some(pm => pm.id === m.id))
  );

  // add form
  let addMemberId = $state("");
  let addError    = $state("");
  let addWorking  = $state(false);

  // draw form
  let drawCount   = $state(1);
  let drawn: Member[] = $state([]);
  let drawError   = $state("");
  let drawWorking = $state(false);

  // council
  let councilDrawWorking = $state(false);
  let councilDrawError   = $state("");

  // delete confirm
  let confirmDelete = $state(false);
  let deleteWorking = $state(false);

  async function load() {
    try {
      const [poolRes, membersRes] = await Promise.all([
        fetch(`/api/leader-pools/${id}`),
        fetch("/api/members"),
      ]);
      if (!poolRes.ok) throw new Error(`${poolRes.status}`);
      if (!membersRes.ok) throw new Error(`${membersRes.status}`);
      pool       = await poolRes.json();
      allMembers = await membersRes.json();
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  async function addMember(e: Event) {
    e.preventDefault();
    if (!addMemberId) { addError = "Please select a member"; return; }
    addWorking = true; addError = "";
    try {
      const res = await fetch(`/api/leader-pools/${id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: addMemberId.trim() }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `HTTP ${res.status}`);
      }
      addMemberId = "";
      drawn = [];
      await load();
    } catch (e: unknown) {
      addError = e instanceof Error ? e.message : "Failed to add member";
    } finally {
      addWorking = false;
    }
  }

  async function removeMember(memberId: string) {
    const res = await fetch(`/api/leader-pools/${id}/members/${memberId}`, { method: "DELETE" });
    if (res.ok) { drawn = drawn.filter(d => d.id !== memberId); await load(); }
  }

  async function drawMembers(e: Event) {
    e.preventDefault();
    drawWorking = true; drawError = ""; drawn = [];
    try {
      const res = await fetch(`/api/leader-pools/${id}/draw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: drawCount }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json();
      drawn = data.drawn;
    } catch (e: unknown) {
      drawError = e instanceof Error ? e.message : "Failed to draw";
    } finally {
      drawWorking = false;
    }
  }

  async function drawCouncilSeats() {
    councilDrawWorking = true; councilDrawError = "";
    try {
      const res = await fetch(`/api/leader-pools/${id}/council/draw`, { method: "POST" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `HTTP ${res.status}`);
      }
      await load();
    } catch (e: unknown) {
      councilDrawError = e instanceof Error ? e.message : "Draw failed";
    } finally {
      councilDrawWorking = false;
    }
  }

  async function vacateCouncilSeat(memberId: string) {
    const res = await fetch(`/api/leader-pools/${id}/council/seats/${memberId}`, { method: "DELETE" });
    if (res.ok) await load();
  }

  async function deletePool() {
    deleteWorking = true;
    const res = await fetch(`/api/leader-pools/${id}`, { method: "DELETE" });
    if (res.ok) { navigate("/leader-pools"); } else { deleteWorking = false; }
  }

  load();
</script>

<div class="domain-layout">
<CommunitySidebar {navigate} {path} />
<div class="domain-main">
<div class="page">
  <button class="back-link" onclick={() => navigate("/leader-pools")}>← Leader Pools</button>

  {#if loading}
    <p class="muted">Loading…</p>
  {:else if error || !pool}
    <p class="error">{error ?? "Leader pool not found"}</p>
  {:else}
    <div class="header">
      <div>
        <span class="badge">Leader Pool</span>
        <h1>{pool.poolName}</h1>
      </div>
      <div class="header-actions">
        {#if !confirmDelete}
          <button class="danger-outline" onclick={() => confirmDelete = true}>Delete pool</button>
        {:else}
          <span class="confirm-text">Delete permanently?</span>
          <button class="danger" onclick={deletePool} disabled={deleteWorking}>
            {deleteWorking ? "Deleting…" : "Yes, delete"}
          </button>
          <button onclick={() => confirmDelete = false}>Cancel</button>
        {/if}
      </div>
    </div>

    <!-- Council section -->
    <section class="section">
      <h2>Council</h2>
      {#if !pool.isActive}
        <p class="dormant-notice">
          This pool's council is <strong>dormant</strong>.
          It activates when the pool exceeds {pool.activationThreshold} members
          ({pool.memberCount} / {pool.activationThreshold + 1} needed).
        </p>
      {:else}
        <p class="meta">{pool.councilSeatCount} / {pool.councilSize} seats filled &middot; {pool.councilVacancies} vacant</p>
        {#if councilDrawError}<p class="error">{councilDrawError}</p>{/if}
        {#if pool.councilVacancies > 0}
          <button class="primary council-draw-btn" onclick={drawCouncilSeats} disabled={councilDrawWorking}>
            {councilDrawWorking ? "Drawing…" : `Draw ${pool.councilVacancies} seat${pool.councilVacancies === 1 ? '' : 's'}`}
          </button>
        {/if}
        {#if pool.councilSeats.length === 0}
          <p class="muted">No seats filled yet. Draw to seat members.</p>
        {:else}
          <div class="table-wrap">
            <table>
              <thead><tr><th>Member</th><th>Handle</th><th>Seated</th><th></th></tr></thead>
              <tbody>
                {#each pool.councilSeats as s (s.memberId)}
                  <tr>
                    <td>{s.firstName} {s.lastName}</td>
                    <td class="muted">{s.handle || '—'}</td>
                    <td class="muted">{new Date(s.seatedAt).toLocaleDateString()}</td>
                    <td class="actions-cell">
                      <button class="remove-btn" onclick={() => vacateCouncilSeat(s.memberId)}>Vacate</button>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {/if}
      {/if}
    </section>

    <!-- Draw section -->
    <section class="section">
      <h2>Draw</h2>
      <form onsubmit={drawMembers} class="draw-form">
        {#if drawError}<p class="error">{drawError}</p>{/if}
        <div class="draw-row">
          <label>
            Count
            <input type="number" bind:value={drawCount} min="1" max={pool.memberCount || 1} disabled={drawWorking} />
          </label>
          <button type="submit" class="primary" disabled={drawWorking || pool.memberCount === 0}>
            {drawWorking ? "Drawing…" : "Draw"}
          </button>
        </div>
      </form>
      {#if drawn.length > 0}
        <div class="drawn-results">
          <p class="drawn-label">Selected ({drawn.length})</p>
          <ul>
            {#each drawn as m (m.id)}
              <li>{m.firstName} {m.lastName} {m.handle ? `(${m.handle})` : ""}</li>
            {/each}
          </ul>
        </div>
      {/if}
    </section>

    <!-- Members section -->
    <section class="section">
      <div class="section-header">
        <h2>Members <span class="count">{pool.memberCount}</span></h2>
      </div>

      {#if pool.members.length === 0}
        <p class="muted">No members yet.</p>
      {:else}
        <div class="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Handle</th><th></th></tr></thead>
            <tbody>
              {#each pool.members as m (m.id)}
                <tr>
                  <td>{m.firstName} {m.lastName}</td>
                  <td class="muted">{m.handle || '—'}</td>
                  <td class="actions-cell">
                    <button class="remove-btn" onclick={() => removeMember(m.id)}>Remove</button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}

      <form onsubmit={addMember} class="add-form">
        <h3>Add member</h3>
        {#if addError}<p class="error">{addError}</p>{/if}
        <div class="add-row">
          <select bind:value={addMemberId} disabled={addWorking || availableMembers.length === 0}>
            <option value="">{availableMembers.length === 0 ? 'All members already in pool' : 'Select a member…'}</option>
            {#each availableMembers as m (m.id)}
              <option value={m.id}>{m.firstName} {m.lastName}{m.handle ? ` (${m.handle})` : ''}</option>
            {/each}
          </select>
          <button type="submit" class="primary" disabled={addWorking || !addMemberId}>
            {addWorking ? "Adding…" : "Add"}
          </button>
        </div>
      </form>
    </section>
  {/if}
</div>
</div>
</div>

<style>
  .page { max-width: 720px; margin: 0 auto; padding: 2rem 1rem; }
  .back-link { background: none; border: none; color: var(--color-primary, #2563eb); cursor: pointer; padding: 0; margin-bottom: 1.25rem; font-size: 0.9rem; }

  .header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
  .badge { display: inline-block; padding: 0.2rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; background: #ede9fe; color: #5b21b6; margin-bottom: 0.5rem; }
  h1 { margin: 0 0 0.25rem; font-size: 1.4rem; font-weight: 600; }

  .header-actions { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }
  .confirm-text { font-size: 0.85rem; }

  .section { margin-bottom: 2rem; }
  .section-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; }
  h2 { margin: 0 0 0.75rem; font-size: 1rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-muted, #666); }
  .count { font-weight: 400; opacity: 0.7; }
  h3 { margin: 1rem 0 0.5rem; font-size: 0.9rem; font-weight: 600; }

  .draw-form { margin-bottom: 0.5rem; }
  .draw-row { display: flex; align-items: flex-end; gap: 0.75rem; }
  .draw-row label { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.85rem; font-weight: 500; }
  .draw-row input { width: 80px; padding: 0.45rem 0.6rem; border: 1px solid var(--color-border, #e2e8f0); border-radius: 6px; font-size: 0.9rem; }

  .drawn-results { background: #f5f3ff; border-radius: 8px; padding: 0.75rem 1rem; margin-top: 0.75rem; }
  .drawn-label { margin: 0 0 0.4rem; font-size: 0.85rem; font-weight: 600; color: #5b21b6; }
  ul { margin: 0; padding-left: 1.2rem; }
  li { font-size: 0.9rem; padding: 0.15rem 0; }

  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 0.4rem 0.75rem; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-muted, #888); border-bottom: 1px solid var(--color-border, #e2e8f0); }
  td { padding: 0.6rem 0.75rem; border-bottom: 1px solid var(--color-border, #f1f5f9); font-size: 0.9rem; }
  .muted { color: var(--text-secondary); }
  .actions-cell { text-align: right; }
  .remove-btn { background: none; border: 1px solid var(--color-border, #e2e8f0); border-radius: 4px; padding: 0.2rem 0.6rem; font-size: 0.8rem; cursor: pointer; color: var(--color-danger, #dc2626); }

  .add-form { margin-top: 1rem; }
  .add-row { display: flex; gap: 0.5rem; }
  .add-row select { flex: 1; padding: 0.5rem 0.75rem; border: 1px solid var(--color-border, #e2e8f0); border-radius: 6px; font-size: 0.9rem; background: var(--color-surface, #fff); }

  button { padding: 0.45rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem; border: 1px solid var(--color-border, #e2e8f0); background: none; }
  button:disabled { opacity: 0.6; cursor: not-allowed; }
  .primary { background: var(--color-primary, #2563eb); color: #fff; border-color: transparent; }
  .danger { background: var(--color-danger, #dc2626); color: #fff; border-color: transparent; }
  .danger-outline { color: var(--color-danger, #dc2626); border-color: var(--color-danger, #dc2626); }
  .error { color: var(--color-danger, #dc2626); font-size: 0.875rem; margin: 0 0 0.5rem; }
  .dormant-notice { background: #fef9c3; border: 1px solid #fde047; border-radius: 8px; padding: 0.75rem 1rem; font-size: 0.9rem; color: #713f12; margin: 0; }
  .meta { font-size: 0.85rem; color: var(--color-muted, #666); margin: 0 0 0.75rem; }
  .council-draw-btn { margin-bottom: 0.75rem; }
</style>
