<script lang="ts">
  interface RoleDto {
    id: string;
    title: string;
    description: string;
    kinPerMonth: number;
    memberId: string | null;
    memberName: string | null;
    active: boolean;
  }

  const { roles, rolesUrl, onChanged }: {
    roles: RoleDto[];
    rolesUrl: string;
    onChanged: () => void;
  } = $props();

  let assigningId = $state<string | null>(null);
  let assignInput = $state('');
  let assignError = $state('');

  async function assign(roleId: string) {
    assignError = '';
    const res = await fetch(`${rolesUrl}/${roleId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId: assignInput.trim() }),
    });
    if (!res.ok) { assignError = (await res.json()).error ?? 'Failed'; return; }
    assigningId = null; assignInput = '';
    onChanged();
  }

  async function unassign(roleId: string) {
    await fetch(`${rolesUrl}/${roleId}/assign`, { method: 'DELETE' });
    onChanged();
  }
</script>

<section class="section">
  <h2>Roles</h2>
  {#if roles.length === 0}
    <p class="muted">No roles defined.</p>
  {:else}
    <table class="roles-table">
      <thead><tr><th>Title</th><th>Kin/month</th><th>Assigned To</th><th></th></tr></thead>
      <tbody>
        {#each roles as role (role.id)}
          <tr>
            <td>
              <div class="role-title">{role.title}</div>
              {#if role.description}<div class="role-desc">{role.description}</div>{/if}
            </td>
            <td>{role.kinPerMonth}</td>
            <td>{role.memberName ?? '—'}</td>
            <td>
              {#if assigningId === role.id}
                <div class="assign-row">
                  <input bind:value={assignInput} placeholder="Member ID" />
                  <button onclick={() => assign(role.id)}>Save</button>
                  <button onclick={() => { assigningId = null; assignInput = ''; assignError = ''; }}>Cancel</button>
                </div>
                {#if assignError}<span class="error">{assignError}</span>{/if}
              {:else if role.memberId}
                <button class="unassign-btn" onclick={() => unassign(role.id)}>Unassign</button>
              {:else}
                <button onclick={() => { assigningId = role.id; assignInput = ''; assignError = ''; }}>Assign</button>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</section>

<style>
  .section { margin-bottom: 2.5rem; }
  .section h2 { font-size: 16px; font-weight: 600; margin: 0 0 12px; }
  .muted { color: var(--color-muted, #888); }
  .error { color: var(--color-danger, #dc2626); font-size: 0.9rem; }
  .roles-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  .roles-table th, .roles-table td { padding: 0.6rem 0.75rem; text-align: left; border-bottom: 1px solid var(--color-border, #e2e8f0); }
  .roles-table th { font-weight: 600; color: var(--color-muted, #555); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
  .role-title { font-weight: 500; }
  .role-desc { font-size: 0.8rem; color: var(--color-muted, #888); margin-top: 0.2rem; }
  .assign-row { display: flex; gap: 0.4rem; align-items: center; }
  .assign-row input { padding: 0.3rem 0.5rem; border: 1px solid var(--color-border, #ccc); border-radius: 4px; font-size: 0.85rem; width: 220px; }
  .unassign-btn { color: var(--color-danger, #dc2626); background: none; border: 1px solid var(--color-danger, #dc2626); border-radius: 4px; padding: 0.25rem 0.6rem; cursor: pointer; font-size: 0.8rem; }
  .unassign-btn:hover { background: #fef2f2; }
</style>
