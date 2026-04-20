<script lang="ts">
  const { id, navigate }: { id: string; navigate: (path: string) => void } = $props();

  interface LanguageProficiency {
    language: string;
    reading: boolean;
    writing: boolean;
    speaking: boolean;
  }

  interface Member {
    id: string;
    firstName: string;
    lastName: string;
    handle: string;
    birthDate: string;
    joinDate: string;
    trustScore: number;
    physicalCapacity: number;
    cognitiveCapacity: number;
    guardianId: string | null;
    phone: string | null;
    languages: LanguageProficiency[];
  }

  let member: Member | null = $state(null);
  let loading = $state(true);
  let error: string | null = $state(null);
  let deleting = $state(false);
  let deleteError: string | null = $state(null);

  async function load() {
    try {
      const res = await fetch(`/api/members/${id}`);
      if (res.status === 404) throw new Error('Member not found');
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      member = await res.json();
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  load();

  async function deleteMember() {
    if (!member) return;
    if (!confirm(`Remove ${member.firstName} ${member.lastName} from the community?`)) return;
    deleting = true;
    deleteError = null;
    try {
      const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      navigate('/members');
    } catch (e) {
      deleteError = (e as Error).message;
      deleting = false;
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  }

  function age(iso: string) {
    const ms = Date.now() - new Date(iso).getTime();
    return Math.floor(ms / (365.25 * 24 * 60 * 60 * 1000));
  }

  function yearsAsMember(iso: string) {
    const ms = Date.now() - new Date(iso).getTime();
    const yrs = Math.floor(ms / (365.25 * 24 * 60 * 60 * 1000));
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    if (yrs >= 1) return `${yrs} year${yrs > 1 ? 's' : ''}`;
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
</script>

<div class="page-header">
  <button class="back-btn" onclick={() => navigate('/members')}>← Members</button>
  {#if member}
    <button class="danger-btn" onclick={deleteMember} disabled={deleting}>
      {deleting ? 'Removing…' : 'Remove member'}
    </button>
  {/if}
</div>
{#if deleteError}
  <p class="error">{deleteError}</p>
{/if}

{#if loading}
  <p class="muted">Loading…</p>
{:else if error}
  <p class="error">{error}</p>
{:else if member}
  <div class="profile">
    <div class="profile-name">
      <h1>{member.firstName} {member.lastName}</h1>
      {#if member.handle}
        <span class="handle">@{member.handle}</span>
      {/if}
    </div>

    <div class="card-grid">
      <div class="card">
        <h2>Identity</h2>
        <dl>
          <dt>Age</dt>
          <dd>{age(member.birthDate)} years old</dd>

          <dt>Born</dt>
          <dd>{formatDate(member.birthDate)}</dd>

          {#if member.phone}
            <dt>Phone</dt>
            <dd>{member.phone}</dd>
          {/if}

          {#if member.guardianId}
            <dt>Guardian</dt>
            <dd class="muted">{member.guardianId}</dd>
          {/if}
        </dl>
      </div>

      <div class="card">
        <h2>Membership</h2>
        <dl>
          <dt>Joined</dt>
          <dd>{formatDate(member.joinDate)}</dd>

          <dt>Duration</dt>
          <dd>{yearsAsMember(member.joinDate)}</dd>

          <dt>Trust score</dt>
          <dd>{member.trustScore.toFixed(2)}</dd>
        </dl>
      </div>

      <div class="card">
        <h2>Capacity</h2>
        <div class="capacity">
          <span class="cap-label">Physical</span>
          <div class="bar-track">
            <div class="bar-fill" style="width: {member.physicalCapacity * 100}%"></div>
          </div>
          <span class="cap-pct">{Math.round(member.physicalCapacity * 100)}%</span>
        </div>
        <div class="capacity">
          <span class="cap-label">Cognitive</span>
          <div class="bar-track">
            <div class="bar-fill" style="width: {member.cognitiveCapacity * 100}%"></div>
          </div>
          <span class="cap-pct">{Math.round(member.cognitiveCapacity * 100)}%</span>
        </div>
      </div>
    </div>

      {#if member.languages.length > 0}
        <div class="card lang-card" style="margin-top: 16px;">
          <h2>Languages</h2>
          <table class="lang-table">
            <thead>
              <tr>
                <th>Language</th>
                <th>Reading</th>
                <th>Writing</th>
                <th>Speaking</th>
              </tr>
            </thead>
            <tbody>
              {#each member.languages as lang (lang.language)}
                <tr>
                  <td>{lang.language}</td>
                  <td>{lang.reading ? '✓' : '—'}</td>
                  <td>{lang.writing ? '✓' : '—'}</td>
                  <td>{lang.speaking ? '✓' : '—'}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
  </div>
{/if}

<style>
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 36px;
  }

  .back-btn {
    background: none;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 6px 12px;
    font-size: 13px;
    color: var(--text-muted);
    cursor: pointer;
  }

  .back-btn:hover {
    background: var(--surface);
    color: var(--text);
  }

  .danger-btn {
    padding: 6px 14px;
    background: none;
    border: 1px solid #ef4444;
    border-radius: var(--radius);
    font-size: 13px;
    color: #ef4444;
    cursor: pointer;
  }

  .danger-btn:hover:not(:disabled) { background: #ef444415; }
  .danger-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .profile-name {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 24px;
  }

  h1 { margin: 0; font-size: 26px; font-weight: 600; }

  .handle { color: var(--text-muted); font-family: monospace; font-size: 16px; }

  .card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 16px;
  }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
  }

  h2 { margin: 0 0 16px; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); }

  dl { margin: 0; display: grid; grid-template-columns: auto 1fr; gap: 8px 16px; align-items: baseline; }
  dt { color: var(--text-muted); font-size: 13px; white-space: nowrap; }
  dd { margin: 0; font-size: 14px; }

  .capacity {
    display: grid;
    grid-template-columns: 72px 1fr 36px;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }

  .cap-label { font-size: 13px; color: var(--text-muted); }
  .cap-pct { font-size: 13px; text-align: right; }

  .bar-track {
    height: 6px;
    background: color-mix(in srgb, var(--accent) 15%, transparent);
    border-radius: 999px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    background: var(--accent);
    border-radius: 999px;
  }

  .lang-card { grid-column: 1 / -1; }

  .lang-table { width: 100%; border-collapse: collapse; font-size: 14px; }
  .lang-table th {
    text-align: left;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    border-bottom: 1px solid var(--border);
  }
  .lang-table td { padding: 8px 12px; border-bottom: 1px solid var(--border); }
  .lang-table tr:last-child td { border-bottom: none; }

  .muted { color: var(--text-muted); }
  .error { color: #ef4444; }
</style>
