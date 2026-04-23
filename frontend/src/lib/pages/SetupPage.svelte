<script lang="ts">
  const { navigate }: { navigate: (path: string) => void } = $props();

  let firstName = $state('');
  let lastName = $state('');
  let birthDate = $state('');
  let handle = $state('');
  let password = $state('');
  let submitting = $state(false);
  let error: string | null = $state(null);

  async function submit(e: Event) {
    e.preventDefault();
    error = null;
    submitting = true;
    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          birthDate,
          handle: handle.trim().toLowerCase(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) { error = data.error ?? `${res.status}`; return; }
      navigate('/');
    } catch (e) {
      error = (e as Error).message;
    } finally {
      submitting = false;
    }
  }
</script>

<div class="auth-page">
  <h1>Set up your community</h1>
  <p class="subtitle">Create the organizer account to get started.</p>

  <form onsubmit={submit}>
    <div class="row">
      <div class="field">
        <label>
          First name <span class="req">*</span>
          <input type="text" bind:value={firstName} autocomplete="given-name" required />
        </label>
      </div>
      <div class="field">
        <label>
          Last name <span class="req">*</span>
          <input type="text" bind:value={lastName} autocomplete="family-name" required />
        </label>
      </div>
    </div>

    <div class="field">
      <label>
        Date of birth <span class="req">*</span>
        <input type="date" bind:value={birthDate} required />
      </label>
    </div>

    <div class="field">
      <label>
        Handle <span class="req">*</span>
        <input type="text" bind:value={handle} autocomplete="username" required />
      </label>
      <p class="hint">Lowercase letters, numbers, and underscores only.</p>
    </div>

    <div class="field">
      <label>
        Password <span class="req">*</span>
        <input type="password" bind:value={password} autocomplete="new-password" required minlength="8" />
      </label>
      <p class="hint">At least 8 characters.</p>
    </div>

    {#if error}
      <p class="error">{error}</p>
    {/if}

    <div class="actions">
      <button type="submit" disabled={submitting}>
        {submitting ? 'Setting up…' : 'Create organizer account'}
      </button>
    </div>
  </form>
</div>

<style>
  .auth-page {
    max-width: 440px;
    margin: 64px auto;
    padding: 0 16px;
  }

  h1 {
    margin-bottom: 4px;
  }

  .subtitle {
    color: var(--muted, #666);
    margin-bottom: 24px;
    font-size: 14px;
  }

  .row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .field {
    margin-bottom: 16px;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 14px;
  }

  input {
    padding: 8px 10px;
    font-size: 14px;
    border: 1px solid var(--border, #ccc);
    border-radius: 4px;
  }

  .hint {
    font-size: 12px;
    color: var(--muted, #666);
    margin: 4px 0 0;
  }

  .req {
    color: var(--danger, #c00);
  }

  .error {
    color: var(--danger, #c00);
    font-size: 13px;
    margin-bottom: 12px;
  }

  .actions {
    margin-top: 8px;
  }

  button[type="submit"] {
    width: 100%;
    padding: 10px;
    font-size: 15px;
  }
</style>
