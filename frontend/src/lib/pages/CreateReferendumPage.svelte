<script lang="ts">
  const { navigate } = $props<{ navigate: (to: string) => void }>();

  type Member = { id: string; firstName: string; lastName: string; handle: string };

  let members: Member[] = $state([]);

  // Form fields
  let createdBy  = $state('');
  let title      = $state('');
  let question   = $state('');
  let body       = $state('');
  let type       = $state<'binary' | 'choice'>('binary');
  let options    = $state(['', '']);   // used when type === 'choice'
  let opensAt    = $state(todayStr());
  let closesAt   = $state(sevenDaysStr());
  let quorumPct  = $state(0);
  let passPct    = $state(50);

  let submitting = $state(false);
  let error      = $state('');

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }
  function sevenDaysStr() {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  }

  async function loadMembers() {
    try {
      const res = await fetch('/api/members');
      if (res.ok) members = await res.json();
    } catch { /* ignore */ }
  }

  $effect(() => { void loadMembers(); });

  function addOption() { options = [...options, '']; }
  function removeOption(i: number) { options = options.filter((_, idx) => idx !== i); }
  function setOption(i: number, val: string) {
    options = options.map((o, idx) => idx === i ? val : o);
  }

  async function submit() {
    error = '';
    if (!createdBy) { error = 'Select a proposer.'; return; }
    if (!title.trim()) { error = 'Title is required.'; return; }
    if (!question.trim()) { error = 'Question is required.'; return; }
    if (!opensAt || !closesAt) { error = 'Open and close dates are required.'; return; }
    if (new Date(closesAt) <= new Date(opensAt)) { error = 'Close date must be after open date.'; return; }
    if (type === 'choice' && options.filter(o => o.trim()).length < 2) {
      error = 'Provide at least 2 non-empty options.'; return;
    }

    submitting = true;
    try {
      const res = await fetch('/api/referenda', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          createdBy,
          title:     title.trim(),
          question:  question.trim(),
          body:      body.trim(),
          type,
          options:   type === 'choice' ? options.map(o => o.trim()).filter(Boolean) : [],
          opensAt:   new Date(opensAt).toISOString(),
          closesAt:  new Date(closesAt).toISOString(),
          quorumPct,
          passPct,
        }),
      });
      if (!res.ok) {
        const b = await res.json() as { error?: string };
        throw new Error(b.error ?? 'Failed to create');
      }
      const ref = await res.json() as { id: string };
      navigate(`/referenda/${ref.id}`);
    } catch (e) {
      error = String(e);
    } finally {
      submitting = false;
    }
  }
</script>

<div class="page">
  <div class="page-header">
    <h1>New Referendum</h1>
    <button class="btn-ghost" onclick={() => navigate('/referenda')}>← Back</button>
  </div>

  {#if error}
    <p class="form-error">{error}</p>
  {/if}

  <form onsubmit={(e) => { e.preventDefault(); void submit(); }}>
    <fieldset>
      <legend>Proposal</legend>

      <div class="field">
        <label for="proposer">Proposed by *</label>
        <select id="proposer" bind:value={createdBy} required>
          <option value="">— select member —</option>
          {#each members as m}
            <option value={m.id}>{m.firstName} {m.lastName} (@{m.handle})</option>
          {/each}
        </select>
      </div>

      <div class="field">
        <label for="title">Title *</label>
        <input id="title" type="text" bind:value={title} placeholder="e.g. Change market day to Friday" required />
      </div>

      <div class="field">
        <label for="question">Question *</label>
        <input id="question" type="text" bind:value={question} placeholder="e.g. Should we move the weekly market to Friday?" required />
      </div>

      <div class="field">
        <label for="body">Background / Context</label>
        <textarea id="body" rows="5" bind:value={body} placeholder="Optional: explain the reasoning, tradeoffs, relevant history…"></textarea>
      </div>
    </fieldset>

    <fieldset>
      <legend>Vote Format</legend>

      <div class="field inline">
        <label>
          <input type="radio" bind:group={type} value="binary" />
          Yes / No
        </label>
        <label>
          <input type="radio" bind:group={type} value="choice" />
          Multiple choice
        </label>
      </div>

      {#if type === 'choice'}
        <div class="field">
          <label>Options *</label>
          {#each options as opt, i}
            <div class="option-row">
              <input
                type="text"
                value={opt}
                placeholder="Option {i + 1}"
                oninput={(e) => setOption(i, (e.target as HTMLInputElement).value)}
              />
              {#if options.length > 2}
                <button type="button" class="btn-remove" onclick={() => removeOption(i)}>✕</button>
              {/if}
            </div>
          {/each}
          <button type="button" class="btn-add-option" onclick={addOption}>+ Add option</button>
        </div>
      {/if}
    </fieldset>

    <fieldset>
      <legend>Schedule</legend>
      <div class="two-col">
        <div class="field">
          <label for="opensAt">Opens *</label>
          <input id="opensAt" type="date" bind:value={opensAt} required />
        </div>
        <div class="field">
          <label for="closesAt">Closes *</label>
          <input id="closesAt" type="date" bind:value={closesAt} required />
        </div>
      </div>
    </fieldset>

    <fieldset>
      <legend>Thresholds</legend>
      <div class="two-col">
        <div class="field">
          <label for="quorumPct">Quorum % <span class="hint">(0 = no minimum)</span></label>
          <input id="quorumPct" type="number" min="0" max="100" bind:value={quorumPct} />
        </div>
        <div class="field">
          <label for="passPct">Pass % <span class="hint">(for Yes/No: % of votes needed)</span></label>
          <input id="passPct" type="number" min="1" max="100" bind:value={passPct} />
        </div>
      </div>
    </fieldset>

    <div class="form-actions">
      <button type="button" class="btn-secondary" onclick={() => navigate('/referenda')}>Cancel</button>
      <button type="submit" class="btn-primary" disabled={submitting}>
        {submitting ? 'Creating…' : 'Create Referendum'}
      </button>
    </div>
  </form>
</div>

<style>
  .page { max-width: 680px; margin: 0 auto; padding: 1.5rem; }
  .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
  h1 { margin: 0; font-size: 1.4rem; }

  fieldset { border: 1px solid #e0e0e0; border-radius: 8px; padding: 1rem 1.25rem; margin-bottom: 1.25rem; }
  legend { font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: .04em; color: #555; padding: 0 0.4rem; }

  .field { display: flex; flex-direction: column; gap: 0.3rem; margin-bottom: 0.85rem; }
  .field:last-child { margin-bottom: 0; }
  .field.inline { flex-direction: row; gap: 1.5rem; align-items: center; }
  .field.inline label { display: flex; align-items: center; gap: 0.4rem; font-weight: 400; }

  label { font-size: 0.85rem; font-weight: 600; color: #444; }
  .hint { font-weight: 400; color: #999; }

  input[type="text"], input[type="date"], input[type="number"], select, textarea {
    padding: 0.45rem 0.6rem;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 0.9rem;
    width: 100%;
    box-sizing: border-box;
  }
  textarea { resize: vertical; font-family: inherit; }

  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

  .option-row { display: flex; gap: 0.5rem; margin-bottom: 0.4rem; }
  .option-row input { flex: 1; }
  .btn-remove { background: none; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; padding: 0 0.5rem; color: #999; }
  .btn-add-option { background: none; border: none; color: #1a6db5; cursor: pointer; font-size: 0.85rem; padding: 0; margin-top: 0.25rem; }

  .form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; }
  .form-error { color: #c0392b; background: #fdf0f0; border-radius: 4px; padding: 0.6rem 0.8rem; margin-bottom: 1rem; font-size: 0.9rem; }

  .btn-primary   { padding: 0.55rem 1.2rem; background: #1a6db5; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; }
  .btn-primary:hover:not(:disabled) { background: #155a96; }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-secondary { padding: 0.5rem 1rem; background: white; border: 1px solid #ccc; border-radius: 6px; cursor: pointer; }
  .btn-ghost     { background: none; border: none; cursor: pointer; color: #1a6db5; font-size: 0.9rem; }
</style>
