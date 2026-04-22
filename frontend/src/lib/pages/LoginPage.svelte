<script lang="ts">
  const { navigate }: { navigate: (path: string) => void } = $props();

  let handle = $state('');
  let password = $state('');
  let submitting = $state(false);
  let error: string | null = $state(null);

  async function submit(e: Event) {
    e.preventDefault();
    error = null;
    submitting = true;
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: handle.trim().toLowerCase(), password }),
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
  <h1>Log in</h1>

  <form onsubmit={submit}>
    <div class="field">
      <label>
        Handle <span class="req">*</span>
        <input type="text" bind:value={handle} autocomplete="username" required />
      </label>
    </div>

    <div class="field">
      <label>
        Password <span class="req">*</span>
        <input type="password" bind:value={password} autocomplete="current-password" required />
      </label>
    </div>

    {#if error}
      <p class="error">{error}</p>
    {/if}

    <div class="actions">
      <button type="submit" disabled={submitting}>
        {submitting ? 'Logging in…' : 'Log in'}
      </button>
      <button type="button" class="link-btn" onclick={() => navigate('/create-account')}>
        First time? Create an account
      </button>
    </div>
  </form>
</div>

<style>
  .auth-page {
    max-width: 400px;
    margin: 64px auto;
    padding: 0 16px;
  }

  h1 {
    margin-bottom: 24px;
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

  .req {
    color: var(--danger, #c00);
  }

  .error {
    color: var(--danger, #c00);
    font-size: 13px;
    margin-bottom: 12px;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
  }

  button[type='submit'] {
    padding: 10px;
    font-size: 14px;
    cursor: pointer;
  }

  .link-btn {
    background: none;
    border: none;
    color: var(--accent, #0066cc);
    cursor: pointer;
    font-size: 13px;
    padding: 0;
    text-align: left;
  }
</style>
