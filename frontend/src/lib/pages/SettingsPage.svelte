<script lang="ts">
  let { navigate }: { navigate: (path: string) => void } = $props();

  // ── Shared restart poller ──────────────────────────────────────────────────
  type Phase = 'idle' | 'confirm' | 'clearing' | 'restarting' | 'done' | 'error';

  let phase: Phase = $state('idle');
  let errorMsg = $state('');
  let pollTimer: ReturnType<typeof setInterval> | null = null;

  function startPoll(onDone: () => void = () => navigate('/admin/settings')) {
    let attempts = 0;
    pollTimer = setInterval(async () => {
      attempts++;
      if (attempts > 60) {
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
          setTimeout(onDone, 800);
        }
      } catch { /* still down */ }
    }, 1000);
  }

  async function clearAll() {
    phase = 'clearing';
    try {
      const res = await fetch('/api/admin/clear-all', { method: 'DELETE' });
      if (!res.ok) throw new Error(`Server returned ${res.status}: ${await res.text()}`);
      phase = 'restarting';
      startPoll(() => navigate('/members'));
    } catch (e: unknown) {
      if (e instanceof TypeError && (e.message.includes('fetch') || e.message.includes('network'))) {
        phase = 'restarting';
        startPoll(() => navigate('/members'));
      } else {
        phase = 'error';
        errorMsg = (e as Error).message;
      }
    }
  }

  // ── Domain management ──────────────────────────────────────────────────────
  interface DomainDto {
    id: string; name: string; description: string;
    enabled: boolean; dataDirs: string[];
  }

  let domains = $state<DomainDto[]>([]);
  let domainsLoading = $state(true);
  let domainsError: string | null = $state(null);
  let domainPhase = $state<'idle' | 'restarting' | 'error'>('idle');
  let domainPhaseMsg = $state('');
  // pending: id → true (enable) | false (disable); absent = no change
  let pending = $state<Record<string, boolean>>({});

  const hasPending = $derived(Object.keys(pending).length > 0);

  const disabledByPending = $derived(
    domains.filter(d => {
      const p = pending[d.id];
      return p === undefined ? !d.enabled : !p;
    })
  );

  async function loadDomains() {
    domainsLoading = true;
    domainsError = null;
    try {
      const res = await fetch('/api/admin/domains');
      if (!res.ok) throw new Error(`${res.status}`);
      domains = await res.json();
      pending = {};
    } catch (e) {
      domainsError = (e as Error).message;
    } finally {
      domainsLoading = false;
    }
  }

  function toggle(domain: DomainDto) {
    const currentlyEnabled = pending[domain.id] !== undefined ? pending[domain.id] : domain.enabled;
    // If toggling back to original state, remove from pending
    const next = !currentlyEnabled;
    if (next === domain.enabled) {
      const { [domain.id]: _, ...rest } = pending;
      pending = rest;
    } else {
      pending = { ...pending, [domain.id]: next };
    }
  }

  function effectiveEnabled(domain: DomainDto): boolean {
    return pending[domain.id] !== undefined ? pending[domain.id] : domain.enabled;
  }

  function isPending(domain: DomainDto): boolean {
    return pending[domain.id] !== undefined;
  }

  async function applyChanges() {
    const toDisable = Object.entries(pending)
      .filter(([, v]) => !v)
      .map(([id]) => domains.find(d => d.id === id))
      .filter(Boolean) as DomainDto[];

    const hasDataLoss = toDisable.some(d => d.dataDirs.length > 0);
    if (hasDataLoss) {
      const names = toDisable.filter(d => d.dataDirs.length > 0).map(d => d.name).join(', ');
      if (!confirm(`This will permanently delete data for: ${names}.\n\nContinue?`)) return;
    }

    domainPhase = 'restarting';
    domainPhaseMsg = 'Applying changes…';

    const changes = Object.entries(pending).map(([id, enabled]) => ({ id, enabled }));
    try {
      await fetch('/api/admin/domains/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ changes }),
      });
    } catch { /* server may exit before response */ }

    domainPhaseMsg = 'Server restarting…';
    startPoll(() => { domainPhase = 'idle'; loadDomains(); });
  }

  loadDomains();
</script>

<div class="page">
  <h1>Settings</h1>

  <!-- ── Domain Settings ──────────────────────────────────────────────────── -->
  <section class="card" style="margin-bottom: 1.5rem;">
    <h2 class="section-heading">Functional Domains</h2>
    <p class="section-desc">
      Toggle domains on or off, then click <strong>Apply changes</strong> to save and restart the server once.
      Disabling a domain clears its stored data permanently.
    </p>

    {#if domainPhase === 'restarting'}
      <div class="status-box" style="margin-top: 1rem;">
        <span class="spinner"></span> {domainPhaseMsg}
      </div>
    {:else if domainPhase === 'error'}
      <div class="status-box error-box" style="margin-top: 1rem;">{domainPhaseMsg}</div>
    {:else if domainsLoading}
      <p class="muted" style="margin-top: 1rem;">Loading domains…</p>
    {:else if domainsError}
      <p class="error" style="margin-top: 1rem;">Failed to load domains: {domainsError}</p>
    {:else}
      <table class="domain-table">
        <thead>
          <tr><th>Domain</th><th>Enabled</th></tr>
        </thead>
        <tbody>
          {#each domains as domain (domain.id)}
            {@const on = effectiveEnabled(domain)}
            {@const changed = isPending(domain)}
            <tr class:disabled-row={!on}>
              <td>
                <div class="domain-name">{domain.name}{#if changed}<span class="changed-badge">changed</span>{/if}</div>
                <div class="domain-desc">{domain.description}</div>
                {#if changed && !on && domain.dataDirs.length > 0}
                  <div class="data-loss-warning">Data will be deleted: {domain.dataDirs.join(', ')}</div>
                {/if}
              </td>
              <td>
                <label class="toggle">
                  <input type="checkbox" checked={on} onchange={() => toggle(domain)} />
                  <span class="slider"></span>
                </label>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>

      <div class="domain-actions">
        <button class="btn primary" disabled={!hasPending} onclick={applyChanges}>
          Apply changes{hasPending ? ` (${Object.keys(pending).length})` : ''}
        </button>
        {#if hasPending}
          <button class="btn secondary" onclick={() => pending = {}}>Reset</button>
        {/if}
      </div>
    {/if}
  </section>

  <!-- ── Danger Zone ──────────────────────────────────────────────────────── -->
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

  .section-heading {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.5rem;
  }

  .section-desc {
    font-size: 0.875rem;
    color: #666;
    margin: 0 0 1rem;
    line-height: 1.5;
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

  /* Domain table */
  .domain-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
  .domain-table th, .domain-table td { padding: 0.6rem 0.5rem; text-align: left; border-bottom: 1px solid #eee; }
  .domain-table th { font-weight: 600; color: #555; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em; }
  .domain-name { font-weight: 500; display: flex; align-items: center; gap: 0.4rem; }
  .domain-desc { font-size: 0.8rem; color: #888; margin-top: 0.15rem; }
  .disabled-row { opacity: 0.5; }
  .changed-badge { font-size: 0.7rem; font-weight: 500; background: #fef9c3; color: #854d0e; border: 1px solid #fde68a; border-radius: 4px; padding: 0.1rem 0.35rem; }
  .data-loss-warning { font-size: 0.78rem; color: #c00; margin-top: 0.2rem; }

  .domain-actions { display: flex; gap: 0.6rem; align-items: center; margin-top: 1rem; }

  /* Toggle switch */
  .toggle { position: relative; display: inline-block; width: 36px; height: 20px; cursor: pointer; }
  .toggle input { opacity: 0; width: 0; height: 0; }
  .slider { position: absolute; inset: 0; background: #ccc; border-radius: 20px; transition: background 0.2s; }
  .slider::before { content: ''; position: absolute; width: 14px; height: 14px; left: 3px; top: 3px; background: #fff; border-radius: 50%; transition: transform 0.2s; }
  .toggle input:checked + .slider { background: #2563eb; }
  .toggle input:checked + .slider::before { transform: translateX(16px); }



  .btn {
    padding: 0.4rem 0.85rem;
    border: 1px solid transparent;
    border-radius: 6px;
    font-size: 0.85rem;
    cursor: pointer;
    white-space: nowrap;
  }

  .btn.danger { background: #c00; color: #fff; border-color: #c00; }
  .btn.danger:hover { background: #a00; }
  .btn.danger-outline { background: none; color: #c00; border-color: #c00; }
  .btn.danger-outline:hover { background: #fff0f0; }
  .btn.secondary { background: #e9e9e9; color: #333; border-color: #e9e9e9; }
  .btn.secondary:hover { background: #d9d9d9; }
  .btn.primary { background: #2563eb; color: #fff; border-color: #2563eb; }
  .btn.primary:hover { background: #1d4ed8; }
  .btn.primary:disabled { background: #93c5fd; border-color: #93c5fd; cursor: not-allowed; }

  .confirm-box { display: flex; flex-direction: column; gap: 0.75rem; }
  .confirm-box p { margin: 0; font-size: 0.9rem; }
  .confirm-actions { display: flex; gap: 0.5rem; }

  .status-box { display: flex; align-items: center; gap: 0.6rem; font-size: 0.9rem; color: #444; }
  .status-box.success { color: #177a30; }
  .status-box.error-box { color: #c00; }

  .muted { color: #888; }
  .error { color: #c00; font-size: 0.875rem; }

  .spinner {
    display: inline-block;
    width: 16px; height: 16px;
    border: 2px solid #ccc;
    border-top-color: #555;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
</style>
