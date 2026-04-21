<script lang="ts">
  const { navigate, memberId } = $props<{ navigate: (to: string) => void; memberId: string }>();

  type Member = { id: string; firstName: string; lastName: string; handle: string };

  let members: Member[] = $state([]);
  let submitting = $state(false);
  let error = $state('');

  // Pre-fill from query params (reply flow)
  const params = new URLSearchParams(window.location.search);
  let toId      = $state(params.get('replyTo') ?? '');
  let subject   = $state(params.get('subject') ?? '');
  let body      = $state('');
  let broadcast = $state(false);

  async function loadMembers() {
    try {
      const res = await fetch('/api/members');
      if (res.ok) members = await res.json();
    } catch { /* ignore */ }
  }

  $effect(() => { void loadMembers(); });

  async function submit() {
    if (!memberId) { error = 'No sender selected.'; return; }
    if (!broadcast && !toId) { error = 'Select a recipient.'; return; }
    if (!subject.trim()) { error = 'Subject is required.'; return; }
    if (!body.trim())    { error = 'Message body is required.'; return; }
    error = '';
    submitting = true;
    try {
      let res: Response;
      if (broadcast) {
        res = await fetch('/api/messages/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fromId: memberId, subject: subject.trim(), body: body.trim() }),
        });
      } else {
        res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fromId: memberId, toId, subject: subject.trim(), body: body.trim() }),
        });
      }
      if (!res.ok) {
        const b = await res.json() as { error?: string };
        throw new Error(b.error ?? 'Failed to send');
      }
      navigate('/messages');
    } catch (e) {
      error = String(e);
    } finally {
      submitting = false;
    }
  }
</script>

<div class="page">
  <div class="page-header">
    <h1>New Message</h1>
    <button class="btn-ghost" onclick={() => navigate('/messages')}>← Back</button>
  </div>

  {#if error}
    <p class="form-error">{error}</p>
  {/if}

  <form onsubmit={(e) => { e.preventDefault(); void submit(); }}>
    <div class="form-grid">

      <div class="field full broadcast-row">
        <label>
          <input type="checkbox" bind:checked={broadcast} />
          📢 Send as community announcement (all members)
        </label>
      </div>

      {#if !broadcast}
        <div class="field full">
          <label for="to">To *</label>
          <select id="to" bind:value={toId} required>
            <option value="">— select recipient —</option>
            {#each members.filter(m => m.id !== memberId) as m}
              <option value={m.id}>{m.firstName} {m.lastName} (@{m.handle})</option>
            {/each}
          </select>
        </div>
      {/if}

      <div class="field full">
        <label for="subject">Subject *</label>
        <input id="subject" type="text" bind:value={subject} placeholder="Subject" required />
      </div>

      <div class="field full">
        <label for="body">Message *</label>
        <textarea id="body" rows="10" bind:value={body} placeholder="Write your message…" required></textarea>
      </div>

    </div>

    <div class="form-actions">
      <button type="button" class="btn-secondary" onclick={() => navigate('/messages')}>Cancel</button>
      <button type="submit" class="btn-primary" disabled={submitting}>
        {#if submitting}Sending…{:else if broadcast}📢 Send Announcement{:else}Send Message{/if}
      </button>
    </div>
  </form>
</div>

<style>
  .page { max-width: 680px; margin: 0 auto; padding: 1.5rem; }
  .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
  h1 { margin: 0; font-size: 1.4rem; }

  .form-grid { display: flex; flex-direction: column; gap: 1rem; }
  .field { display: flex; flex-direction: column; gap: 0.3rem; }
  .field.full { width: 100%; }

  label { font-size: 0.85rem; font-weight: 600; color: #444; }
  input[type="text"], select, textarea {
    padding: 0.45rem 0.6rem;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 0.9rem;
    width: 100%;
    box-sizing: border-box;
  }
  textarea { resize: vertical; font-family: inherit; }

  .broadcast-row label { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; cursor: pointer; font-size: 0.9rem; background: #fff8e1; border: 1px solid #f0c040; border-radius: 6px; padding: 0.6rem 0.8rem; }

  .form-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; }

  .btn-primary   { padding: 0.55rem 1.2rem; background: #1a6db5; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; }
  .btn-primary:hover:not(:disabled) { background: #155a96; }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-secondary { padding: 0.5rem 1rem; background: white; border: 1px solid #ccc; border-radius: 6px; cursor: pointer; }
  .btn-ghost     { background: none; border: none; cursor: pointer; color: #1a6db5; font-size: 0.9rem; }

  .form-error { color: #c0392b; background: #fdf0f0; border-radius: 4px; padding: 0.6rem 0.8rem; margin-bottom: 1rem; font-size: 0.9rem; }
</style>
