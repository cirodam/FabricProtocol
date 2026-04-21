<script lang="ts">
  import CouncilPanel from '../components/CouncilPanel.svelte';
  const { navigate }: { navigate: (path: string) => void } = $props();

  interface Officer {
    memberId: string | null;
    memberName: string | null;
    handle: string | null;
    title: string;
    kinPerMonth: number;
    termStartDate: string | null;
  }

  interface Overview {
    id: string;
    name: string;
    description: string;
    kin: number;
    payroll: number;
    officers: Officer[];
  }

  let overview: Overview | null = $state(null);
  let loading = $state(true);
  let error: string | null = $state(null);

  // Add officer form
  let addingOfficer = $state(false);
  let officerMemberId = $state('');
  let officerTitle = $state('Supply Officer');
  let officerKin = $state(0);
  let addError: string | null = $state(null);
  let addWorking = $state(false);

  let members: { id: string; firstName: string; lastName: string; handle: string }[] = $state([]);

  async function load() {
    try {
      const [ovRes, memRes] = await Promise.all([
        fetch('/api/provisioning'),
        fetch('/api/members'),
      ]);
      if (!ovRes.ok) throw new Error(`provisioning: ${ovRes.status}`);
      if (!memRes.ok) throw new Error(`members: ${memRes.status}`);
      overview = await ovRes.json();
      const md = await memRes.json();
      members = md.members ?? md;
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  async function addOfficer() {
    addError = null;
    addWorking = true;
    try {
      const res = await fetch('/api/provisioning/officers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: officerMemberId,
          title: officerTitle || 'Supply Officer',
          kinPerMonth: officerKin,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `HTTP ${res.status}`);
      }
      addingOfficer = false;
      officerMemberId = '';
      officerTitle = 'Supply Officer';
      officerKin = 0;
      await load();
    } catch (e) {
      addError = (e as Error).message;
    } finally {
      addWorking = false;
    }
  }

  async function removeOfficer(memberId: string) {
    const res = await fetch(`/api/provisioning/officers/${memberId}`, { method: 'DELETE' });
    if (res.ok) await load();
  }

  function fmt(n: number) {
    return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }

  load();
</script>

<div class="page-header">
  <div>
    <span class="badge">Domain</span>
    <h1>Provisioning</h1>
  </div>
</div>

{#if loading}
  <p class="muted">Loading…</p>
{:else if error}
  <p class="error">{error}</p>
{:else if overview}

  <p class="domain-desc">{overview.description}</p>

  <div class="stats">
    <div class="stat-card">
      <div class="stat-label">Domain Balance</div>
      <div class="stat-value">{fmt(overview.kin)} kin</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Monthly Payroll</div>
      <div class="stat-value">{fmt(overview.payroll)} kin</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Supply Officers</div>
      <div class="stat-value">{overview.officers.length}</div>
    </div>
  </div>

  <!-- Officers -->
  <section class="section">
    <div class="section-header">
      <h2>Supply Officers</h2>
      <button class="new-btn" onclick={() => { addingOfficer = !addingOfficer; addError = null; }}>
        {addingOfficer ? 'Cancel' : '+ Add officer'}
      </button>
    </div>

    {#if addingOfficer}
      <div class="add-form">
        <div class="form-row">
          <label>
            Member
            <select bind:value={officerMemberId}>
              <option value="">— select member —</option>
              {#each members as m (m.id)}
                <option value={m.id}>{m.firstName} {m.lastName} (@{m.handle})</option>
              {/each}
            </select>
          </label>
          <label>
            Title
            <input type="text" bind:value={officerTitle} placeholder="Supply Officer" />
          </label>
          <label>
            Kin / month
            <input type="number" bind:value={officerKin} min="0" step="1" />
          </label>
          <button class="primary" onclick={addOfficer} disabled={addWorking || !officerMemberId}>
            {addWorking ? 'Adding…' : 'Add'}
          </button>
        </div>
        {#if addError}<p class="error">{addError}</p>{/if}
      </div>
    {/if}

    {#if overview.officers.length === 0}
      <p class="muted">No supply officers assigned yet.</p>
    {:else}
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Member</th><th>Title</th><th class="num">Kin / month</th><th>Since</th><th></th></tr>
          </thead>
          <tbody>
            {#each overview.officers as o (o.memberId)}
              <tr>
                <td>
                  {#if o.memberName}
                    <span class="name">{o.memberName}</span>
                    {#if o.handle}<span class="handle">@{o.handle}</span>{/if}
                  {:else}
                    <span class="muted">{o.memberId ?? '—'}</span>
                  {/if}
                </td>
                <td>{o.title}</td>
                <td class="num">{fmt(o.kinPerMonth)}</td>
                <td class="muted">{o.termStartDate ? new Date(o.termStartDate).toLocaleDateString() : '—'}</td>
                <td>
                  {#if o.memberId}
                    <button class="remove-btn" onclick={() => removeOfficer(o.memberId!)}>Remove</button>
                  {/if}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </section>

  <CouncilPanel domainId="00000000-0000-0000-0000-000000000014" {navigate} />

{/if}

<style>
  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-secondary);
    margin-bottom: 4px;
  }

  h1 { margin: 0; font-size: 22px; font-weight: 600; }

  .domain-desc {
    font-size: 14px;
    color: var(--text-secondary);
    max-width: 640px;
    line-height: 1.6;
    margin: 0 0 24px;
  }

  .stats {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-bottom: 28px;
  }

  .stat-card {
    padding: 14px 18px;
    background: var(--surface-alt, #f8f8f8);
    border-radius: 8px;
    border: 1px solid var(--border, #e0e0e0);
    min-width: 140px;
  }

  .stat-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-secondary); margin-bottom: 4px; }
  .stat-value { font-size: 22px; font-weight: 700; }

  .section { margin-bottom: 2.5rem; }

  .section-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .section-header h2 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-muted, #666);
  }

  .new-btn {
    margin-left: auto;
    background: var(--accent);
    border: none;
    border-radius: var(--radius);
    padding: 7px 16px;
    color: #fff;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
  }

  .add-form {
    background: var(--surface-alt, #f8f8f8);
    border: 1px solid var(--border, #e0e0e0);
    border-radius: 8px;
    padding: 14px 16px;
    margin-bottom: 14px;
  }

  .form-row {
    display: flex;
    gap: 12px;
    align-items: flex-end;
    flex-wrap: wrap;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  input, select {
    padding: 6px 10px;
    border: 1px solid var(--border, #e0e0e0);
    border-radius: 5px;
    font-size: 14px;
    background: white;
    min-width: 160px;
  }

  button.primary {
    padding: 8px 18px;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: var(--radius);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }

  button.primary:disabled { opacity: 0.5; cursor: not-allowed; }

  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 0.4rem 0.75rem; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-muted, #888); border-bottom: 1px solid var(--color-border, #e2e8f0); }
  td { padding: 0.65rem 0.75rem; border-bottom: 1px solid var(--color-border, #f1f5f9); font-size: 0.9rem; vertical-align: middle; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }

  .name { font-weight: 500; }
  .handle { font-size: 12px; color: var(--text-secondary); margin-left: 6px; }

  .remove-btn {
    background: none;
    border: 1px solid var(--color-border, #e2e8f0);
    border-radius: 4px;
    padding: 3px 10px;
    font-size: 12px;
    color: var(--color-danger, #dc2626);
    cursor: pointer;
  }

  .remove-btn:hover { background: #fef2f2; }

  .muted { color: var(--text-secondary); }
  .error { color: var(--color-danger, #dc2626); font-size: 0.9rem; margin-top: 8px; }
</style>
