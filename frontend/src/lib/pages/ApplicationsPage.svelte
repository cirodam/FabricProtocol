<script lang="ts">
  const { navigate }: { navigate: (path: string) => void } = $props();

  type AppStatus = 'pending' | 'approved' | 'denied';

  interface Application {
    id: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    handle: string | null;
    phone: string | null;
    note: string | null;
    status: AppStatus;
    submittedAt: string;
    reviewedAt: string | null;
    reviewerName: string | null;
    reviewNote: string | null;
    memberId: string | null;
  }

  let applications: Application[] = $state([]);
  let statusFilter: AppStatus | 'all' = $state('pending');
  let loading = $state(true);
  let error: string | null = $state(null);

  // Per-card action state: id → 'approve' | 'deny' | null
  let working: Record<string, boolean> = $state({});
  let actionError: string | null = $state(null);

  async function load() {
    loading = true;
    error = null;
    try {
      const url = statusFilter === 'all'
        ? '/api/applications'
        : `/api/applications?status=${statusFilter}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      applications = data.applications ?? data;
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  $effect(() => { statusFilter; load(); });

  async function act(id: string, action: 'approve' | 'deny') {
    actionError = null;
    working = { ...working, [id]: true };
    try {
      const res = await fetch(`/api/applications/${id}/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `HTTP ${res.status}`);
      }
      await load();
    } catch (e) {
      actionError = (e as Error).message;
    } finally {
      working = { ...working, [id]: false };
    }
  }

  function age(birthDate: string): string {
    const ms = Date.now() - new Date(birthDate).getTime();
    return Math.floor(ms / (365.25 * 24 * 60 * 60 * 1000)).toString();
  }

  function fmtDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  const STATUS_LABEL: Record<AppStatus, string> = {
    pending:  'Pending',
    approved: 'Approved',
    denied:   'Denied',
  };

  const STATUS_CLASS: Record<AppStatus, string> = {
    pending:  'status-pending',
    approved: 'status-approved',
    denied:   'status-denied',
  };
</script>

<div class="page">
  <div class="page-header">
    <h1>Membership Applications</h1>
    <button class="btn-primary" onclick={() => navigate('/applications/new')}>
      + New Application
    </button>
  </div>

  <div class="filter-bar">
    {#each (['all', 'pending', 'approved', 'denied'] as const) as s}
      <button class="filter-btn {statusFilter === s ? 'active' : ''}"
        onclick={() => statusFilter = s}>
        {s === 'all' ? 'All' : STATUS_LABEL[s]}
      </button>
    {/each}
  </div>

  {#if actionError}
    <p class="error">{actionError}</p>
  {/if}

  {#if loading}
    <p class="muted">Loading…</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if applications.length === 0}
    <p class="muted">No {statusFilter === 'all' ? '' : statusFilter} applications.</p>
  {:else}
    <div class="applications-list">
      {#each applications as app (app.id)}
        <div class="app-card {app.status === 'pending' ? 'app-pending' : ''}">
          <div class="app-header">
            <div>
              <span class="app-name">{app.firstName} {app.lastName}</span>
              {#if app.handle}
                <span class="app-handle">@{app.handle}</span>
              {/if}
            </div>
            <span class="status-badge {STATUS_CLASS[app.status]}">{STATUS_LABEL[app.status]}</span>
          </div>

          <div class="app-meta">
            <span>Age {age(app.birthDate)}</span>
            {#if app.phone}<span>{app.phone}</span>{/if}
            <span>Submitted {fmtDate(app.submittedAt)}</span>
          </div>

          {#if app.note}
            <p class="app-note">"{app.note}"</p>
          {/if}

          {#if app.status !== 'pending'}
            <p class="review-line">
              {STATUS_LABEL[app.status]} on {fmtDate(app.reviewedAt!)}
              {#if app.reviewerName} by {app.reviewerName}{/if}
              {#if app.reviewNote} — <em>{app.reviewNote}</em>{/if}
            </p>
            {#if app.memberId}
              <button class="link-btn" onclick={() => navigate(`/members/${app.memberId}`)}>
                View Member →
              </button>
            {/if}
          {:else}
            <div class="app-actions">
              <button class="btn-approve" disabled={working[app.id]}
                onclick={() => act(app.id, 'approve')}>
                {working[app.id] ? '…' : 'Approve'}
              </button>
              <button class="btn-deny" disabled={working[app.id]}
                onclick={() => act(app.id, 'deny')}>
                {working[app.id] ? '…' : 'Deny'}
              </button>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .page { max-width: 800px; margin: 0 auto; padding: 1.5rem; }
  .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
  h1 { font-size: 1.5rem; font-weight: 700; margin: 0; }

  .filter-bar { display: flex; gap: 0.5rem; margin-bottom: 1.25rem; }
  .filter-btn { padding: 0.35rem 0.85rem; border: 1px solid var(--border, #d1d5db);
    border-radius: 1rem; background: transparent; cursor: pointer; font-size: 0.85rem; }
  .filter-btn.active { background: var(--accent, #4f46e5); color: #fff; border-color: transparent; }

  .applications-list { display: flex; flex-direction: column; gap: 0.875rem; }
  .app-card { background: var(--card-bg, #fff); border: 1px solid var(--border, #e5e7eb);
    border-radius: 0.5rem; padding: 1rem 1.25rem; }
  .app-pending { border-left: 3px solid #f59e0b; }

  .app-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.4rem; }
  .app-name { font-weight: 600; font-size: 1rem; }
  .app-handle { color: var(--muted, #6b7280); font-size: 0.85rem; margin-left: 0.5rem; }

  .app-meta { font-size: 0.8rem; color: var(--muted, #6b7280); display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 0.4rem; }
  .app-note { font-size: 0.875rem; color: var(--muted, #6b7280); font-style: italic; margin: 0.5rem 0; }
  .review-line { font-size: 0.8rem; color: var(--muted, #6b7280); margin: 0.4rem 0 0; }

  .status-badge { font-size: 0.75rem; font-weight: 600; padding: 0.2rem 0.6rem; border-radius: 1rem; }
  .status-pending  { background: #fef3c7; color: #92400e; }
  .status-approved { background: #d1fae5; color: #065f46; }
  .status-denied   { background: #fee2e2; color: #991b1b; }

  .app-actions { margin-top: 0.75rem; display: flex; gap: 0.5rem; }

  .btn-primary { padding: 0.45rem 1rem; background: var(--accent, #4f46e5); color: #fff;
    border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.875rem; font-weight: 500; }
  .btn-approve { padding: 0.35rem 0.85rem; background: #059669; color: #fff;
    border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.8rem; font-weight: 500; }
  .btn-approve:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-deny { padding: 0.35rem 0.85rem; background: #dc2626; color: #fff;
    border: none; border-radius: 0.375rem; cursor: pointer; font-size: 0.8rem; font-weight: 500; }
  .btn-deny:disabled { opacity: 0.6; cursor: not-allowed; }
  .link-btn { background: none; border: none; color: var(--accent, #4f46e5); cursor: pointer;
    font-size: 0.8rem; padding: 0; margin-top: 0.4rem; display: block; }

  .muted { color: var(--muted, #6b7280); }
  .error { color: #dc2626; font-size: 0.875rem; }
</style>
