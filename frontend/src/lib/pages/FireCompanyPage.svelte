<script lang="ts">
  const { id, navigate }: { id: string; navigate: (path: string) => void } = $props();

  interface StaffMember { id: string; firstName: string; lastName: string; handle: string; roleTitle: string; creditsPerMonth: number; }
  interface CompanyDetail {
    id: string;
    name: string;
    description: string;
    staffCount: number;
    staff: StaffMember[];
    createdAt: string;
  }
  interface MemberOption { id: string; firstName: string; lastName: string; handle: string; }

  let company       = $state<CompanyDetail | null>(null);
  let allMembers    = $state<MemberOption[]>([]);
  let loading       = $state(true);
  let error         = $state("");
  let addMemberId   = $state("");
  let addTitle      = $state("");
  let addSalary     = $state(0);
  let addError      = $state("");
  let addWorking    = $state(false);
  let confirmDelete = $state(false);

  let availableMembers = $derived(
    allMembers.filter(m => !company?.staff.some(s => s.id === m.id))
  );

  async function load() {
    try {
      const [cRes, membersRes] = await Promise.all([
        fetch(`/api/fire/companies/${id}`),
        fetch("/api/members"),
      ]);
      if (!cRes.ok) throw new Error(`HTTP ${cRes.status}`);
      if (!membersRes.ok) throw new Error(`HTTP ${membersRes.status}`);
      company    = await cRes.json();
      allMembers = await membersRes.json();
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : "Failed to load";
    } finally {
      loading = false;
    }
  }

  async function addStaff(e: Event) {
    e.preventDefault();
    if (!addMemberId.trim()) { addError = "Member is required"; return; }
    if (!addTitle.trim()) { addError = "Role title is required"; return; }
    addWorking = true;
    addError = "";
    try {
      const res = await fetch(`/api/fire/companies/${id}/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: addMemberId, title: addTitle.trim(), creditsPerMonth: addSalary }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `HTTP ${res.status}`);
      }
      addMemberId = "";
      addTitle    = "";
      addSalary   = 0;
      await load();
    } catch (e: unknown) {
      addError = e instanceof Error ? e.message : "Failed to add staff";
    } finally {
      addWorking = false;
    }
  }

  async function removeStaff(memberId: string) {
    try {
      const res = await fetch(`/api/fire/companies/${id}/staff/${memberId}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await load();
    } catch {
      // silently ignore
    }
  }

  async function deleteCompany() {
    try {
      const res = await fetch(`/api/fire/companies/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      navigate("/fire");
    } catch (e: unknown) {
      error = e instanceof Error ? e.message : "Failed to delete company";
    }
  }

  load();
</script>

<div class="page">
  <button class="back-link" onclick={() => navigate("/fire")}>← Fire</button>

  {#if loading}
    <p class="muted">Loading…</p>
  {:else if error}
    <p class="error">{error}</p>
  {:else if company}
    <div class="header">
      <div>
        <div class="badge">Fire Company</div>
        <h1>{company.name}</h1>
        {#if company.description}<p class="desc">{company.description}</p>{/if}
      </div>
      <button class="danger-btn" onclick={() => confirmDelete = !confirmDelete}>Delete</button>
    </div>

    {#if confirmDelete}
      <div class="confirm-box">
        <p>Delete <strong>{company.name}</strong>? This cannot be undone.</p>
        <div class="confirm-actions">
          <button onclick={() => confirmDelete = false}>Cancel</button>
          <button class="danger-btn" onclick={deleteCompany}>Confirm delete</button>
        </div>
      </div>
    {/if}

    <section class="section">
      <h2>Staff ({company.staffCount})</h2>

      {#if company.staff.length === 0}
        <p class="muted">No staff assigned yet.</p>
      {:else}
        <table class="staff-table">
          <thead>
            <tr><th>Name</th><th>Role</th><th class="num">Credits/mo</th><th></th></tr>
          </thead>
          <tbody>
            {#each company.staff as s (s.id)}
              <tr>
                <td>
                  <button class="name-link" onclick={() => navigate(`/members/${s.id}`)}>
                    {s.firstName} {s.lastName}
                  </button>
                </td>
                <td class="muted">{s.roleTitle || "—"}</td>
                <td class="num">{s.creditsPerMonth > 0 ? s.creditsPerMonth.toLocaleString() : "—"}</td>
                <td><button class="remove-btn" onclick={() => removeStaff(s.id)}>Remove</button></td>
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}

      <form class="add-form" onsubmit={addStaff}>
        {#if addError}<p class="error">{addError}</p>{/if}
        <div class="add-grid">
          <select bind:value={addMemberId} disabled={addWorking}>
            <option value="">— select a member —</option>
            {#each availableMembers as m (m.id)}
              <option value={m.id}>{m.firstName} {m.lastName}{m.handle ? ` (@${m.handle})` : ""}</option>
            {/each}
          </select>
          <input type="text" bind:value={addTitle} placeholder="Role title (e.g. Firefighter)" disabled={addWorking} />
          <input type="number" bind:value={addSalary} min="0" placeholder="Credits / month" disabled={addWorking} />
          <button type="submit" disabled={addWorking || !addMemberId || !addTitle.trim()}>{addWorking ? "Adding…" : "Add staff"}</button>
        </div>
      </form>
    </section>
  {/if}
</div>

<style>
  .page { max-width: 760px; margin: 0 auto; padding: 2rem 1rem; }
  .back-link { background: none; border: none; color: var(--color-primary, #2563eb); cursor: pointer; padding: 0; margin-bottom: 1.25rem; font-size: 0.9rem; }

  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
  .header > div { flex: 1; }

  .badge {
    display: inline-block;
    font-size: 0.75rem; font-weight: 600; letter-spacing: 0.03em;
    padding: 0.2rem 0.6rem; border-radius: 999px;
    background: #fee2e2; color: #991b1b;
    margin-bottom: 0.5rem;
  }

  h1 { margin: 0 0 0.4rem; }
  .desc { margin: 0; font-size: 0.9rem; color: var(--color-muted, #666); max-width: 540px; line-height: 1.5; }

  .section { margin-top: 2rem; }
  .section h2 { font-size: 1rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem; color: var(--color-muted, #666); }

  .staff-table { width: 100%; border-collapse: collapse; margin-bottom: 1.25rem; }
  .staff-table th { text-align: left; padding: 0.4rem 0.75rem; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-muted, #888); border-bottom: 1px solid var(--color-border, #e2e8f0); }
  .staff-table td { padding: 0.6rem 0.75rem; border-bottom: 1px solid var(--color-border, #f1f5f9); font-size: 0.9rem; }
  .staff-table .num { text-align: right; font-variant-numeric: tabular-nums; }

  .name-link { background: none; border: none; padding: 0; cursor: pointer; color: var(--color-primary, #2563eb); font-size: 0.9rem; }
  .name-link:hover { text-decoration: underline; }

  .remove-btn { background: none; border: none; cursor: pointer; color: var(--color-muted, #888); font-size: 0.8rem; }
  .remove-btn:hover { color: var(--color-danger, #dc2626); }

  .add-form { margin-top: 0.5rem; }
  .add-grid { display: grid; grid-template-columns: 2fr 1.5fr 1fr auto; gap: 0.5rem; align-items: center; }
  .add-grid select,
  .add-grid input { padding: 0.45rem 0.75rem; border: 1px solid var(--color-border, #e2e8f0); border-radius: 6px; font-size: 0.9rem; background: var(--color-surface, #fff); width: 100%; box-sizing: border-box; }
  .add-grid button { padding: 0.45rem 1rem; background: var(--color-primary, #2563eb); color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; white-space: nowrap; }
  .add-grid button:disabled { opacity: 0.6; cursor: not-allowed; }

  .confirm-box { background: #fff8f0; border: 1px solid #f97316; border-radius: 8px; padding: 1rem 1.25rem; margin-bottom: 1.5rem; }
  .confirm-box p { margin: 0 0 0.75rem; font-size: 0.9rem; }
  .confirm-actions { display: flex; gap: 0.75rem; }
  .confirm-actions button { padding: 0.4rem 0.9rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem; }
  .confirm-actions button:first-child { background: none; border: 1px solid var(--color-border, #e2e8f0); }

  .danger-btn { padding: 0.45rem 1rem; background: var(--color-danger, #dc2626); color: #fff; border: none; border-radius: 6px; cursor: pointer; font-size: 0.875rem; }
  .danger-btn:hover { opacity: 0.85; }

  .muted { color: var(--color-muted, #888); }
  .error { color: var(--color-danger, #dc2626); font-size: 0.9rem; margin: 0 0 0.5rem; }
</style>
