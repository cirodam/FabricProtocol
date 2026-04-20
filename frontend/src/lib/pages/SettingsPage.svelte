<script lang="ts">
  let { navigate }: { navigate: (path: string) => void } = $props();

  type Phase = 'idle' | 'confirm' | 'clearing' | 'restarting' | 'done' | 'error';
  let phase: Phase = $state('idle');
  let errorMsg = $state('');
  let pollTimer: ReturnType<typeof setInterval> | null = null;

  function startPoll() {
    // Poll /api/status until the server is back up, then go home.
    let attempts = 0;
    pollTimer = setInterval(async () => {
      attempts++;
      if (attempts > 60) {
        // Give up after ~60 seconds
        clearInterval(pollTimer!);
        phase = 'error';
        errorMsg = 'Server did not come back up in time. Try refreshing manually.';
        return;
      }
      try {
        const res = await fetch('/api/status');
        if (res.ok) {
          clearInterval(pollTimer!);
          phase = 'done';
          setTimeout(() => navigate('/members'), 800);
        }
      } catch {
        // Still down — keep polling
      }
    }, 1000);
  }

  async function clearAll() {
    phase = 'clearing';
    try {
      const res = await fetch('/api/admin/clear-all', { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Server returned ${res.status}: ${body}`);
      }
      phase = 'restarting';
      startPoll();
    } catch (e: unknown) {
      // If the server already exited before we got the response, treat as success.
      if (e instanceof TypeError && (e.message.includes('fetch') || e.message.includes('network'))) {
        phase = 'restarting';
        startPoll();
      } else {
        phase = 'error';
        errorMsg = (e as Error).message;
      }
    }
  }
</script>

<div class="page">
  <h1>Settings</h1>

  <section class="card danger-zone">
    <h2>Danger Zone</h2>

    <div class="setting-row">
      <div class="setting-info">
        <strong>Clear all data</strong>
        <p>
          Permanently deletes all members, accounts, transactions, posts, clinics,
          housing units, and other community data. Node identity and network keys
          are preserved. The server will restart automatically.
        </p>
      </div>

      {#if phase === 'idle'}
        <button class="btn danger" onclick={() => phase = 'confirm'}>Clear all data</button>

      {:else if phase === 'confirm'}
        <div class="confirm-box">
          <p><strong>Are you sure?</strong> This cannot be undone.</p>
          <div class="confirm-actions">
            <button class="btn danger" onclick={clearAll}>Yes, clear everything</button>
            <button class="btn secondary" onclick={() => phase = 'idle'}>Cancel</button>
          </div>
        </div>

      {:else if phase === 'clearing'}
        <div class="status-box">
          <span class="spinner"></span> Clearing data…
        </div>

      {:else if phase === 'restarting'}
        <div class="status-box">
          <span class="spinner"></span> Server restarting — waiting for it to come back up…
        </div>

      {:else if phase === 'done'}
        <div class="status-box success">
          Done. Redirecting to Members…
        </div>

      {:else if phase === 'error'}
        <div class="status-box error-box">
          {errorMsg}
        </div>
      {/if}
    </div>
  </section>
</div>

<style>
  .page {
    max-width: 700px;
    margin: 2rem auto;
    padding: 0 1rem;
  }

  h1 {
    font-size: 1.6rem;
    margin-bottom: 1.5rem;
  }

  .card {
    background: var(--surface, #fff);
    border: 1px solid var(--border, #e0e0e0);
    border-radius: 8px;
    padding: 1.5rem;
  }

  .danger-zone {
    border-color: #f5c6cb;
    background: #fff8f8;
  }

  .danger-zone h2 {
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #c00;
    margin: 0 0 1.25rem;
  }

  .setting-row {
    display: flex;
    align-items: flex-start;
    gap: 1.5rem;
    flex-wrap: wrap;
  }

  .setting-info {
    flex: 1;
    min-width: 200px;
  }

  .setting-info strong {
    display: block;
    margin-bottom: 0.35rem;
  }

  .setting-info p {
    margin: 0;
    font-size: 0.875rem;
    color: #666;
    line-height: 1.5;
  }

  .btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
    white-space: nowrap;
  }

  .btn.danger {
    background: #c00;
    color: #fff;
  }

  .btn.danger:hover {
    background: #a00;
  }

  .btn.secondary {
    background: #e9e9e9;
    color: #333;
  }

  .btn.secondary:hover {
    background: #d9d9d9;
  }

  .confirm-box {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .confirm-box p {
    margin: 0;
    font-size: 0.9rem;
  }

  .confirm-actions {
    display: flex;
    gap: 0.5rem;
  }

  .status-box {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.9rem;
    color: #444;
  }

  .status-box.success {
    color: #177a30;
  }

  .status-box.error-box {
    color: #c00;
  }

  /* Simple CSS spinner */
  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid #ccc;
    border-top-color: #555;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
