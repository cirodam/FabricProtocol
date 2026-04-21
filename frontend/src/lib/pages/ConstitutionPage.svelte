<script lang="ts">
  type Authority = 'immutable' | 'citizens-assembly' | 'council' | 'commonwealth';

  interface Parameter {
    value: number | boolean;
    authority: Authority;
    description: string;
    constraints?: { min?: number; max?: number };
  }

  interface Amendment {
    version: number;
    parameter: string;
    oldValue: number | boolean;
    newValue: number | boolean;
    proposalId: string;
    amendedAt: string;
  }

  interface ConstitutionDoc {
    version: number;
    adoptedAt: string;
    parameters: Record<string, Parameter>;
    amendments: Amendment[];
  }

  let doc: ConstitutionDoc | null = $state(null);
  let loading = $state(true);
  let error: string | null = $state(null);

  async function load() {
    try {
      const res = await fetch('/api/constitution');
      if (!res.ok) throw new Error(`${res.status}`);
      doc = await res.json();
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  load();

  function fmtDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  }

  function fmtValue(key: string, param: Parameter): string {
    if (typeof param.value === 'boolean') return param.value ? 'Guaranteed' : 'Not guaranteed';
    const v = param.value as number;
    if (key.includes('Rate') || key.startsWith('threshold')) return (v * 100).toFixed(1) + '%';
    if (key === 'deliberationPeriodDays') return v + (v === 1 ? ' day' : ' days');
    if (key === 'monthlyFoodAllowance') return v.toLocaleString() + ' kin / month';
    return v.toLocaleString();
  }

  function fmtConstraints(param: Parameter): string | null {
    if (!param.constraints) return null;
    const { min, max } = param.constraints;
    const isRate = typeof param.value === 'number' && (param.value <= 1);
    const fmt = (n: number | undefined) => {
      if (n == null) return null;
      return isRate ? (n * 100).toFixed(0) + '%' : n.toLocaleString();
    };
    if (min != null && max != null) return `${fmt(min)} – ${fmt(max)}`;
    if (min != null) return `min ${fmt(min)}`;
    if (max != null) return `max ${fmt(max)}`;
    return null;
  }

  function paramsByAuthority(authority: Authority): [string, Parameter][] {
    if (!doc) return [];
    return Object.entries(doc.parameters).filter(([, p]) => p.authority === authority);
  }

  function labelFor(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, c => c.toUpperCase())
      .trim();
  }
</script>

<div class="page-header">
  <div>
    <span class="badge">Governance</span>
    <h1>Constitution</h1>
  </div>
  {#if doc}
    <div class="meta-info">
      <span>Version {doc.version}</span>
      <span class="sep">·</span>
      <span>Adopted {fmtDate(doc.adoptedAt)}</span>
      {#if doc.amendments.length > 0}
        <span class="sep">·</span>
        <span>{doc.amendments.length} amendment{doc.amendments.length === 1 ? '' : 's'}</span>
      {/if}
    </div>
  {/if}
</div>

{#if loading}
  <p class="muted">Loading…</p>
{:else if error}
  <p class="error">{error}</p>
{:else if doc}

  <!-- Axioms -->
  <section class="section">
    <h2>Axioms</h2>
    <p class="section-desc">These principles are foundational. They cannot be amended by any vote — they define what this community is.</p>
    <ul class="axiom-list">
      {#each paramsByAuthority('immutable') as [key, param] (key)}
        <li class="axiom-item">
          <div class="axiom-check">✓</div>
          <div class="axiom-body">
            <div class="axiom-name">{labelFor(key)}</div>
            <div class="axiom-desc">{param.description}</div>
          </div>
        </li>
      {/each}
    </ul>
  </section>

  <!-- Citizens Assembly parameters -->
  {#if paramsByAuthority('citizens-assembly').length > 0}
    <section class="section">
      <h2>Citizens Assembly Policy</h2>
      <p class="section-desc">These parameters are set by the Citizens Assembly through a proposal and vote. Changes take effect immediately when a vote passes.</p>
      <div class="param-grid">
        {#each paramsByAuthority('citizens-assembly') as [key, param] (key)}
          <div class="param-card">
            <div class="param-header">
              <span class="param-name">{labelFor(key)}</span>
              {#if fmtConstraints(param)}
                <span class="param-range">{fmtConstraints(param)}</span>
              {/if}
            </div>
            <div class="param-value">{fmtValue(key, param)}</div>
            <div class="param-desc">{param.description}</div>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Council parameters -->
  {#if paramsByAuthority('council').length > 0}
    <section class="section">
      <h2>Council Policy</h2>
      <p class="section-desc">These parameters are set by the Community Council.</p>
      <div class="param-grid">
        {#each paramsByAuthority('council') as [key, param] (key)}
          <div class="param-card">
            <div class="param-header">
              <span class="param-name">{labelFor(key)}</span>
              {#if fmtConstraints(param)}
                <span class="param-range">{fmtConstraints(param)}</span>
              {/if}
            </div>
            <div class="param-value">{fmtValue(key, param)}</div>
            <div class="param-desc">{param.description}</div>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <!-- Amendment history -->
  <section class="section">
    <h2>Amendment History</h2>
    {#if doc.amendments.length === 0}
      <p class="muted">No amendments yet. This constitution is in its original form.</p>
    {:else}
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Version</th>
              <th>Parameter</th>
              <th class="num">Old Value</th>
              <th class="num">New Value</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {#each [...doc.amendments].reverse() as a (a.version)}
              <tr>
                <td>v{a.version}</td>
                <td>{labelFor(a.parameter)}</td>
                <td class="num muted">{a.oldValue}</td>
                <td class="num">{a.newValue}</td>
                <td class="muted">{fmtDate(a.amendedAt)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </section>

{/if}

<style>
  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 28px;
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

  .meta-info {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: var(--text-secondary);
    padding-top: 4px;
  }

  .sep { opacity: 0.4; }

  .section { margin-bottom: 36px; }

  h2 { margin: 0 0 6px; font-size: 16px; font-weight: 600; }

  .section-desc {
    font-size: 13px;
    color: var(--text-secondary);
    margin: 0 0 16px;
    max-width: 640px;
    line-height: 1.5;
  }

  /* Axioms */
  .axiom-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .axiom-item {
    display: flex;
    gap: 12px;
    padding: 12px 16px;
    background: var(--surface-alt, #f8f8f8);
    border-radius: 8px;
    border-left: 3px solid var(--accent, #2d7d46);
  }

  .axiom-check {
    font-size: 14px;
    color: var(--accent, #2d7d46);
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .axiom-body { display: flex; flex-direction: column; gap: 2px; }

  .axiom-name {
    font-size: 14px;
    font-weight: 600;
  }

  .axiom-desc {
    font-size: 13px;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  /* Parameter cards */
  .param-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 14px;
  }

  .param-card {
    padding: 14px 16px;
    background: var(--surface-alt, #f8f8f8);
    border-radius: 8px;
    border: 1px solid var(--border, #e0e0e0);
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .param-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
  }

  .param-name {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .param-range {
    font-size: 11px;
    color: var(--text-secondary);
    opacity: 0.7;
    white-space: nowrap;
  }

  .param-value {
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text-primary, #111);
  }

  .param-desc {
    font-size: 12px;
    color: var(--text-secondary);
    line-height: 1.5;
    margin-top: 4px;
  }

  /* Amendment table */
  .table-wrap { overflow-x: auto; }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  th {
    text-align: left;
    padding: 8px 12px;
    font-weight: 600;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
    border-bottom: 1px solid var(--border, #e0e0e0);
  }

  td {
    padding: 10px 12px;
    border-bottom: 1px solid var(--border-light, #f0f0f0);
    vertical-align: top;
  }

  .num { text-align: right; }
  .muted { color: var(--text-secondary); }
  .error { color: var(--error, #c0392b); }
</style>
