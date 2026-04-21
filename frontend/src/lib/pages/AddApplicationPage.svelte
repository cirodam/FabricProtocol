<script lang="ts">
  const { navigate }: { navigate: (path: string) => void } = $props();

  let firstName = $state('');
  let lastName  = $state('');
  let birthDate = $state('');
  let handle    = $state('');
  let phone     = $state('');
  let note      = $state('');

  let submitting = $state(false);
  let error: string | null = $state(null);

  async function submit(e: Event) {
    e.preventDefault();
    error = null;
    submitting = true;
    try {
      const body: Record<string, unknown> = { firstName, lastName, birthDate };
      if (handle.trim()) body.handle = handle.trim();
      if (phone.trim())  body.phone  = phone.trim();
      if (note.trim())   body.note   = note.trim();

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { error = data.error ?? `${res.status}`; return; }
      navigate('/applications');
    } catch (e) {
      error = (e as Error).message;
    } finally {
      submitting = false;
    }
  }
</script>

<div class="page-header">
  <h1>New Membership Application</h1>
</div>

<form onsubmit={submit}>
  <div class="grid">
    <label>
      First name <span class="req">*</span>
      <input type="text" bind:value={firstName} required />
    </label>
    <label>
      Last name <span class="req">*</span>
      <input type="text" bind:value={lastName} required />
    </label>
    <label>
      Date of birth <span class="req">*</span>
      <input type="date" bind:value={birthDate} required />
    </label>
    <label>
      Handle
      <input type="text" bind:value={handle} placeholder="auto-generated if blank" />
    </label>
    <label>
      Phone <span class="hint">(E.164, e.g. +15551234567)</span>
      <input type="tel" bind:value={phone} placeholder="+1…" />
    </label>
  </div>

  <label class="note-label">
    Note from applicant
    <textarea bind:value={note} rows="4" placeholder="Why would you like to join?"></textarea>
  </label>

  {#if error}
    <p class="error">{error}</p>
  {/if}

  <div class="actions">
    <button type="submit" disabled={submitting}>
      {submitting ? 'Submitting…' : 'Submit Application'}
    </button>
    <button type="button" class="cancel-btn" onclick={() => navigate('/applications')}>
      Cancel
    </button>
  </div>
</form>

<style>
  .page-header { margin-bottom: 24px; }
  h1 { margin: 0; font-size: 22px; font-weight: 600; }

  form {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
    max-width: 640px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

  label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 14px;
    font-weight: 500;
  }

  .note-label textarea {
    padding: 8px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg);
    color: var(--text);
    font-size: 14px;
    resize: vertical;
    width: 100%;
    box-sizing: border-box;
  }

  input[type="text"],
  input[type="date"],
  input[type="tel"] {
    padding: 8px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg);
    color: var(--text);
    font-size: 14px;
  }

  input:focus, textarea:focus {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }

  .req { color: #ef4444; }
  .hint { font-size: 12px; font-weight: 400; color: var(--text-muted); }

  .actions { display: flex; gap: 0.75rem; }

  button[type="submit"] {
    padding: 9px 20px;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: var(--radius);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
  }
  button[type="submit"]:hover:not(:disabled) { background: var(--accent-hover); }
  button[type="submit"]:disabled { opacity: 0.6; cursor: not-allowed; }

  .cancel-btn {
    padding: 9px 20px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-size: 14px;
    cursor: pointer;
  }

  .error { color: #ef4444; font-size: 14px; margin: 0; }
</style>
