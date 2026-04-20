<script lang="ts">
  interface AgeBracket {
    label: string;
    min: number;
    max: number;
    count: number;
  }

  interface Demographics {
    total: number;
    workingAgeMin: number;
    workingAgeMax: number;
    workingAge: number;
    disabled: number;
    laborPool: number;
    dependents: number;
    dependencyRatio: number | null;
    ageBrackets: AgeBracket[];
  }

  let data: Demographics | null = $state(null);
  let loading = $state(true);
  let error: string | null = $state(null);

  async function load() {
    try {
      const res = await fetch('/api/members/demographics');
      if (!res.ok) throw new Error(`${res.status}`);
      data = await res.json();
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  load();

  function pct(n: number, total: number): string {
    if (total === 0) return '0%';
    return (n / total * 100).toFixed(1) + '%';
  }
</script>

<div class="page-header">
  <h1>Demographics</h1>
</div>

{#if loading}
  <p class="muted">Loading…</p>
{:else if error}
  <p class="error">{error}</p>
{:else if data}
  <section class="section">
    <h2>Overview</h2>
    <div class="stats">
      <div class="stat-card">
        <div class="stat-label">Total Members</div>
        <div class="stat-value">{data.total}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Working Age ({data.workingAgeMin}–{data.workingAgeMax})</div>
        <div class="stat-value">{data.workingAge}</div>
        <div class="stat-sub">{pct(data.workingAge, data.total)} of population</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Disabled</div>
        <div class="stat-value">{data.disabled}</div>
        <div class="stat-sub">community-determined</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Labor Pool</div>
        <div class="stat-value">{data.laborPool}</div>
        <div class="stat-sub">working age, not disabled</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Dependents</div>
        <div class="stat-value">{data.dependents}</div>
        <div class="stat-sub">under {data.workingAgeMin}, over {data.workingAgeMax}, or disabled</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Dependency Ratio</div>
        <div class="stat-value">
          {#if data.dependencyRatio !== null}
            {data.dependencyRatio.toFixed(2)}
          {:else}
            —
          {/if}
        </div>
        <div class="stat-sub">dependents per worker</div>
      </div>
    </div>
  </section>

  <section class="section">
    <h2>Age Distribution</h2>
    <table class="age-table">
      <thead>
        <tr>
          <th>Age group</th>
          <th class="num">Count</th>
          <th class="num">% of population</th>
          <th class="bar-col"></th>
        </tr>
      </thead>
      <tbody>
        {#each data.ageBrackets as bracket (bracket.label)}
          <tr>
            <td>{bracket.label}</td>
            <td class="num">{bracket.count}</td>
            <td class="num">{pct(bracket.count, data.total)}</td>
            <td class="bar-col">
              <div class="bar-track">
                <div
                  class="bar-fill"
                  style="width: {data.total > 0 ? (bracket.count / data.total * 100) : 0}%"
                ></div>
              </div>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>
{/if}

<style>
  .page-header {
    margin-bottom: 24px;
  }
  h1 { margin: 0; font-size: 22px; font-weight: 600; }

  .section { margin-bottom: 32px; }
  h2 { margin: 0 0 16px; font-size: 16px; font-weight: 600; }

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  }

  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
  }

  .stat-label {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 6px;
  }

  .stat-sub {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .age-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  .age-table th {
    text-align: left;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-secondary);
    padding: 0 12px 10px 0;
    border-bottom: 1px solid var(--border);
  }

  .age-table td {
    padding: 10px 12px 10px 0;
    border-bottom: 1px solid var(--border);
  }

  .num { text-align: right; }

  .bar-col { width: 200px; padding-right: 0; }

  .bar-track {
    height: 8px;
    background: color-mix(in srgb, var(--accent) 15%, transparent);
    border-radius: 999px;
    overflow: hidden;
  }

  .bar-fill {
    height: 100%;
    background: var(--accent);
    border-radius: 999px;
    transition: width 0.3s ease;
  }

  .muted { color: var(--text-secondary); }
  .error { color: #ef5350; }
</style>
