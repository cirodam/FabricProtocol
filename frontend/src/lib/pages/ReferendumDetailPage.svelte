<script lang="ts">
  const { navigate, id } = $props<{ navigate: (to: string) => void; id: string }>();

  type ReferendumDto = {
    id: string;
    createdByName: string;
    title: string;
    question: string;
    body: string;
    type: 'binary' | 'choice';
    options: string[];
    status: 'draft' | 'open' | 'closed' | 'cancelled';
    opensAt: string;
    closesAt: string;
    quorumPct: number;
    passPct: number;
    voteCount: number;
    tally: Record<string, number>;
    quorumMet: boolean | null;
    result: string | null;
    closedAt: string | null;
    votes: { memberId: string; choice: string; castAt: string }[];
  };
  type Member = { id: string; firstName: string; lastName: string; handle: string };

  let ref: ReferendumDto | null = $state(null);
  let members: Member[] = $state([]);
  let voterMemberId = $state('');
  let selectedChoice = $state('');
  let loading = $state(true);
  let submitting = $state(false);
  let error = $state('');
  let actionError = $state('');

  async function load() {
    loading = true;
    error = '';
    try {
      const [rRes, mRes] = await Promise.all([
        fetch(`/api/referenda/${id}`),
        fetch('/api/members'),
      ]);
      if (!rRes.ok) throw new Error(await rRes.text());
      ref = await rRes.json();
      if (mRes.ok) members = await mRes.json();
    } catch (e) {
      error = String(e);
    } finally {
      loading = false;
    }
  }

  $effect(() => { void load(); });

  // When voter changes, pre-select their existing vote if any
  $effect(() => {
    if (!voterMemberId || !ref) return;
    const existing = ref.votes.find(v => v.memberId === voterMemberId);
    selectedChoice = existing ? existing.choice : '';
  });

  function alreadyVoted(memberId: string): string | null {
    return ref?.votes.find(v => v.memberId === memberId)?.choice ?? null;
  }

  async function castVote() {
    if (!voterMemberId || !selectedChoice) { actionError = 'Select a member and a choice.'; return; }
    actionError = '';
    submitting = true;
    try {
      const res = await fetch(`/api/referenda/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: voterMemberId, choice: selectedChoice }),
      });
      if (!res.ok) { const b = await res.json() as { error?: string }; throw new Error(b.error); }
      ref = await res.json();
    } catch (e) {
      actionError = String(e);
    } finally {
      submitting = false;
    }
  }

  async function closeRef() {
    if (!confirm('Close this referendum and compute the result?')) return;
    actionError = '';
    try {
      const res = await fetch(`/api/referenda/${id}/close`, { method: 'POST' });
      if (!res.ok) { const b = await res.json() as { error?: string }; throw new Error(b.error); }
      ref = await res.json();
    } catch (e) { actionError = String(e); }
  }

  async function cancelRef() {
    if (!confirm('Cancel this referendum?')) return;
    actionError = '';
    try {
      const res = await fetch(`/api/referenda/${id}/cancel`, { method: 'POST' });
      if (!res.ok) { const b = await res.json() as { error?: string }; throw new Error(b.error); }
      ref = await res.json();
    } catch (e) { actionError = String(e); }
  }

  async function deleteRef() {
    if (!confirm('Permanently delete this referendum?')) return;
    try {
      await fetch(`/api/referenda/${id}`, { method: 'DELETE' });
      navigate('/referenda');
    } catch (e) { actionError = String(e); }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' });
  }

  function maxVotes(tally: Record<string, number>): number {
    return Math.max(0, ...Object.values(tally));
  }

  function resultSummary(r: ReferendumDto): string {
    if (r.status === 'cancelled') return 'Cancelled';
    if (r.status !== 'closed') return '';
    if (r.quorumMet === false) return `Quorum not met (${r.voteCount} of ${r.quorumPct}% required)`;
    if (r.result === null) return 'Tied — no outcome';
    return `Result: ${r.result}`;
  }
</script>

<div class="page">
  <div class="page-header">
    <button class="btn-ghost" onclick={() => navigate('/referenda')}>← Referenda</button>
  </div>

  {#if loading}
    <p class="empty">Loading…</p>
  {:else if error || !ref}
    <p class="err">{error || 'Not found'}</p>
  {:else}
    <div class="layout">
      <!-- ── Left: question + tally ── -->
      <div class="main">
        <div class="status-row">
          <span class="badge {ref.status}">{ref.status.toUpperCase()}</span>
          <span class="meta">Proposed by {ref.createdByName}</span>
        </div>

        <h1>{ref.title}</h1>
        <p class="question">{ref.question}</p>
        {#if ref.body}
          <div class="body-text">{ref.body}</div>
        {/if}

        <div class="dates">
          {#if ref.status === 'draft'}Opens {formatDate(ref.opensAt)} · {/if}
          {ref.status === 'closed' || ref.status === 'cancelled'
            ? `Closed ${formatDate(ref.closedAt ?? ref.closesAt)}`
            : `Closes ${formatDate(ref.closesAt)}`}
          · {ref.voteCount} vote{ref.voteCount !== 1 ? 's' : ''}
          {#if ref.quorumPct > 0} · {ref.quorumPct}% quorum required{/if}
        </div>

        {#if ref.status === 'closed' || ref.status === 'cancelled'}
          <div class="result-banner" class:pass={ref.result === 'Yes' || (ref.result !== null && ref.result !== 'No')} class:fail={ref.result === 'No' || ref.quorumMet === false}>
            {resultSummary(ref)}
          </div>
        {/if}

        <!-- Tally bars -->
        {#if ref.voteCount > 0}
          <div class="tally">
            {#each ref.options as opt}
              {@const count = ref.tally[opt] ?? 0}
              {@const pct   = ref.voteCount > 0 ? Math.round((count / ref.voteCount) * 100) : 0}
              {@const isWinner = ref.result === opt}
              <div class="tally-row" class:winner={isWinner}>
                <span class="tally-label">{opt}</span>
                <div class="tally-bar-wrap">
                  <div class="tally-bar" style="width: {pct}%"></div>
                </div>
                <span class="tally-count">{count} ({pct}%)</span>
              </div>
            {/each}
          </div>
        {:else}
          <p class="no-votes">No votes cast yet.</p>
        {/if}
      </div>

      <!-- ── Right: vote form + actions ── -->
      <div class="sidebar">
        {#if actionError}
          <p class="err small">{actionError}</p>
        {/if}

        {#if ref.status === 'open'}
          <div class="vote-box">
            <h3>Cast a vote</h3>

            <div class="field">
              <label for="voter">Voting as</label>
              <select id="voter" bind:value={voterMemberId}>
                <option value="">— select member —</option>
                {#each members as m}
                  {@const prior = alreadyVoted(m.id)}
                  <option value={m.id}>{m.firstName} {m.lastName}{prior ? ` ✓ ${prior}` : ''}</option>
                {/each}
              </select>
            </div>

            <div class="choices">
              {#each ref.options as opt}
                <button
                  type="button"
                  class="choice-btn"
                  class:selected={selectedChoice === opt}
                  onclick={() => (selectedChoice = opt)}
                >
                  {opt}
                </button>
              {/each}
            </div>

            <button class="btn-vote" disabled={submitting || !voterMemberId || !selectedChoice} onclick={() => void castVote()}>
              {submitting ? 'Submitting…' : alreadyVoted(voterMemberId) ? 'Change vote' : 'Submit vote'}
            </button>
          </div>

          <div class="actions">
            <button class="btn-secondary" onclick={() => void closeRef()}>Close & tally</button>
            <button class="btn-cancel"    onclick={() => void cancelRef()}>Cancel referendum</button>
          </div>
        {:else if ref.status === 'draft'}
          <div class="info-box">Voting opens {formatDate(ref.opensAt)}.</div>
          <div class="actions">
            <button class="btn-cancel" onclick={() => void cancelRef()}>Cancel referendum</button>
          </div>
        {:else}
          <div class="actions">
            <button class="btn-danger" onclick={() => void deleteRef()}>Delete record</button>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>

<style>
  .page { max-width: 1000px; margin: 0 auto; padding: 1.5rem; }
  .page-header { margin-bottom: 1rem; }

  .layout { display: grid; grid-template-columns: 1fr 260px; gap: 2rem; align-items: start; }
  @media (max-width: 720px) { .layout { grid-template-columns: 1fr; } }

  .status-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem; }
  h1 { margin: 0 0 0.5rem; font-size: 1.4rem; }
  .question { font-size: 1.05rem; color: #333; margin: 0 0 0.75rem; }
  .body-text { white-space: pre-wrap; color: #555; font-size: 0.9rem; line-height: 1.6; border-left: 3px solid #e0e0e0; padding-left: 0.75rem; margin-bottom: 0.75rem; }
  .dates { font-size: 0.8rem; color: #888; margin-bottom: 1rem; }
  .meta  { font-size: 0.8rem; color: #888; }
  .no-votes { color: #aaa; font-size: 0.85rem; }

  .result-banner { padding: 0.75rem 1rem; border-radius: 6px; font-weight: 700; font-size: 0.95rem; margin-bottom: 1rem; background: #eee; color: #555; }
  .result-banner.pass { background: #e9f7e9; color: #2e7d32; }
  .result-banner.fail { background: #fce4ec; color: #b71c1c; }

  /* Tally */
  .tally { display: flex; flex-direction: column; gap: 0.65rem; margin-top: 1rem; }
  .tally-row { display: grid; grid-template-columns: 80px 1fr 80px; gap: 0.5rem; align-items: center; }
  .tally-row.winner .tally-label { font-weight: 700; color: #1a6db5; }
  .tally-label { font-size: 0.88rem; color: #333; }
  .tally-bar-wrap { background: #f0f0f0; border-radius: 4px; height: 16px; overflow: hidden; }
  .tally-bar { height: 100%; background: #1a6db5; border-radius: 4px; transition: width .4s; }
  .tally-row.winner .tally-bar { background: #27ae60; }
  .tally-count { font-size: 0.78rem; color: #666; text-align: right; }

  /* Sidebar */
  .vote-box { background: #f8f9ff; border: 1px solid #d0d8f0; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
  .vote-box h3 { margin: 0 0 0.75rem; font-size: 0.95rem; }
  .info-box { background: #f5f5f5; border-radius: 6px; padding: 0.75rem; font-size: 0.85rem; color: #666; margin-bottom: 1rem; }

  .field { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 0.75rem; }
  label { font-size: 0.8rem; font-weight: 600; color: #555; }
  select { padding: 0.4rem 0.5rem; border: 1px solid #ccc; border-radius: 5px; font-size: 0.85rem; width: 100%; }

  .choices { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 0.75rem; }
  .choice-btn { padding: 0.5rem 0.75rem; border: 2px solid #ccc; border-radius: 6px; background: white; cursor: pointer; font-size: 0.9rem; text-align: left; }
  .choice-btn:hover { border-color: #1a6db5; }
  .choice-btn.selected { border-color: #1a6db5; background: #e8f0fb; font-weight: 600; }

  .btn-vote { width: 100%; padding: 0.55rem; background: #1a6db5; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; font-weight: 600; }
  .btn-vote:hover:not(:disabled) { background: #155a96; }
  .btn-vote:disabled { opacity: 0.5; cursor: not-allowed; }

  .actions { display: flex; flex-direction: column; gap: 0.5rem; }
  .btn-secondary { padding: 0.45rem 0.75rem; background: white; border: 1px solid #ccc; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
  .btn-cancel    { padding: 0.45rem 0.75rem; background: white; border: 1px solid #e0a0a0; color: #b71c1c; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }
  .btn-danger    { padding: 0.45rem 0.75rem; background: #b71c1c; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; }

  .badge { font-size: 0.7rem; font-weight: 700; padding: 2px 8px; border-radius: 99px; text-transform: uppercase; }
  .badge.draft     { background: #eee; color: #777; }
  .badge.open      { background: #d4edff; color: #0a69c2; }
  .badge.closed    { background: #e9f7e9; color: #2e7d32; }
  .badge.cancelled { background: #fce; color: #900; }

  .empty { text-align: center; color: #aaa; padding: 3rem; }
  .err   { color: #c0392b; background: #fdf0f0; border-radius: 4px; padding: 0.6rem 0.8rem; }
  .err.small { font-size: 0.82rem; padding: 0.4rem 0.6rem; }

  .btn-ghost { background: none; border: none; cursor: pointer; color: #1a6db5; font-size: 0.9rem; }
</style>
