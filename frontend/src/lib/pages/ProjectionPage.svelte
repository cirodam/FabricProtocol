<script lang="ts">
  interface Range { min: number; max: number; }

  interface DemographicProjection {
    total: number;
    infants: number;
    children: number;
    adults: number;
    elderly: number;
    availableFTEs: number;
    dependencyRatio: number;
  }

  interface NutritionalNeeds {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number;
    waterL: number;
  }

  interface FoodProjection {
    daily: NutritionalNeeds;
    annual: NutritionalNeeds;
  }

  interface HealthcareProjection {
    physicians: number;
    dentalHygienists: number;
    mentalHealthProviders: number;
    annualBirths: number;
    annualDeaths: number;
    annualPrimaryCareVisits: number;
  }

  interface LaborDomain {
    name: string;
    ftes: Range;
  }

  interface LaborProjection {
    availableFTEs: number;
    domains: LaborDomain[];
    totalRequired: Range;
    reserve: Range;
  }

  interface Projection {
    demographics: DemographicProjection;
    food: FoodProjection;
    healthcare: HealthcareProjection;
    labor: LaborProjection;
  }

  let sizeInput = $state('');
  let data: Projection | null = $state(null);
  let loading = $state(false);
  let error: string | null = $state(null);

  async function load() {
    const sizeStr = sizeInput.trim();
    // If no input and no members, just wait for user to type a number
    if (!sizeStr) {
      const countRes = await fetch('/api/status').then(r => r.json()).catch(() => ({ members: 0 }));
      if ((countRes as { members: number }).members === 0) {
        error = 'No members yet — enter a population size above to project a hypothetical community.';
        return;
      }
    }
    loading = true;
    error = null;
    data = null;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const qs = sizeStr ? `?size=${encodeURIComponent(sizeStr)}` : '';
      const res = await fetch(`/api/projection${qs}`, { signal: controller.signal });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `${res.status}`);
      }
      data = await res.json();
    } catch (e) {
      if ((e as Error).name === 'AbortError') {
        error = 'Request timed out — the server may need to be restarted to pick up the /api/projection route.';
      } else {
        error = (e as Error).message;
      }
    } finally {
      clearTimeout(timeout);
      loading = false;
    }
  }

  // Load with live member count on mount
  load();

  function fmt(n: number): string {
    return n.toLocaleString();
  }

  function fmtRange(r: Range): string {
    return `${fmt(r.min)} – ${fmt(r.max)}`;
  }

  function pct(n: number, total: number): string {
    if (total === 0) return '—';
    return (n / total * 100).toFixed(1) + '%';
  }

  function reserveWarning(labor: LaborProjection): string | null {
    const minReserve = labor.reserve.min;
    const threshold = labor.availableFTEs * 0.15;
    if (minReserve < 0) return 'Labor deficit — more workers needed than available.';
    if (minReserve < threshold) return 'Low reserve — less than 15% buffer above estimated needs.';
    return null;
  }
</script>

<div class="page-header">
  <h1>Population Projection</h1>
  <p class="subtitle">Estimates community needs based on population size.</p>
</div>

<div class="controls">
  <label for="size-input">Population size</label>
  <div class="input-row">
    <input
      id="size-input"
      type="number"
      min="1"
      placeholder="Leave blank to use live count"
      bind:value={sizeInput}
    />
    <button onclick={load} disabled={loading}>
      {loading ? 'Loading…' : 'Project'}
    </button>
  </div>
</div>

{#if loading}
  <p class="muted">Loading…</p>
{:else if error}
  <p class="error">{error}</p>
{/if}

{#if data}
  {@const d = data}

  <!-- Demographics -->
  <section class="section">
    <h2>Demographics — {fmt(d.demographics.total)} members</h2>
    <div class="stats">
      <div class="stat-card">
        <div class="stat-label">Infants (&lt;2)</div>
        <div class="stat-value">{fmt(d.demographics.infants)}</div>
        <div class="stat-sub">{pct(d.demographics.infants, d.demographics.total)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Children (2–12)</div>
        <div class="stat-value">{fmt(d.demographics.children)}</div>
        <div class="stat-sub">{pct(d.demographics.children, d.demographics.total)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Adults (13–64)</div>
        <div class="stat-value">{fmt(d.demographics.adults)}</div>
        <div class="stat-sub">{pct(d.demographics.adults, d.demographics.total)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Elderly (65+)</div>
        <div class="stat-value">{fmt(d.demographics.elderly)}</div>
        <div class="stat-sub">{pct(d.demographics.elderly, d.demographics.total)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Available FTEs</div>
        <div class="stat-value">{fmt(d.demographics.availableFTEs)}</div>
        <div class="stat-sub">{pct(d.demographics.availableFTEs, d.demographics.total)} of population</div>
      </div>
      <div class="stat-card" class:warn={d.demographics.dependencyRatio > 1.8}>
        <div class="stat-label">Dependency Ratio</div>
        <div class="stat-value">{d.demographics.dependencyRatio.toFixed(2)}</div>
        <div class="stat-sub">dependents per worker · target &lt;1.8</div>
      </div>
    </div>
  </section>

  <!-- Food -->
  <section class="section">
    <h2>Food</h2>
    <table class="data-table">
      <thead>
        <tr>
          <th>Nutrient</th>
          <th class="num">Daily</th>
          <th class="num">Annual</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Calories (kcal)</td><td class="num">{fmt(d.food.daily.calories)}</td><td class="num">{fmt(d.food.annual.calories)}</td></tr>
        <tr><td>Protein (g)</td><td class="num">{fmt(d.food.daily.proteinG)}</td><td class="num">{fmt(d.food.annual.proteinG)}</td></tr>
        <tr><td>Carbohydrates (g)</td><td class="num">{fmt(d.food.daily.carbsG)}</td><td class="num">{fmt(d.food.annual.carbsG)}</td></tr>
        <tr><td>Fat (g)</td><td class="num">{fmt(d.food.daily.fatG)}</td><td class="num">{fmt(d.food.annual.fatG)}</td></tr>
        <tr><td>Fiber (g)</td><td class="num">{fmt(d.food.daily.fiberG)}</td><td class="num">{fmt(d.food.annual.fiberG)}</td></tr>
        <tr><td>Water (L)</td><td class="num">{d.food.daily.waterL.toFixed(1)}</td><td class="num">{d.food.annual.waterL.toFixed(0)}</td></tr>
      </tbody>
    </table>
  </section>

  <!-- Healthcare -->
  <section class="section">
    <h2>Healthcare Staffing</h2>
    <div class="stats">
      <div class="stat-card">
        <div class="stat-label">Physicians</div>
        <div class="stat-value">{d.healthcare.physicians}</div>
        <div class="stat-sub">~1,750 patients each</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Dental Hygienists</div>
        <div class="stat-value">{d.healthcare.dentalHygienists}</div>
        <div class="stat-sub">2 cleanings/member/yr</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Mental Health Providers</div>
        <div class="stat-value">{d.healthcare.mentalHealthProviders}</div>
        <div class="stat-sub">~20% need support · caseload 50</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Annual Births</div>
        <div class="stat-value">{fmt(d.healthcare.annualBirths)}</div>
        <div class="stat-sub">~13 per 1,000</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Annual Deaths</div>
        <div class="stat-value">{fmt(d.healthcare.annualDeaths)}</div>
        <div class="stat-sub">~9 per 1,000</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Primary Care Visits / yr</div>
        <div class="stat-value">{fmt(d.healthcare.annualPrimaryCareVisits)}</div>
        <div class="stat-sub">~3 per member</div>
      </div>
    </div>
  </section>

  <!-- Labor -->
  <section class="section">
    <h2>Labor Distribution</h2>

    {#if reserveWarning(d.labor)}
      <p class="warning-banner">{reserveWarning(d.labor)}</p>
    {/if}

    <div class="labor-summary stats">
      <div class="stat-card">
        <div class="stat-label">Available FTEs</div>
        <div class="stat-value">{fmt(d.labor.availableFTEs)}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Required</div>
        <div class="stat-value">{fmtRange(d.labor.totalRequired)}</div>
      </div>
      <div class="stat-card" class:warn={d.labor.reserve.min < d.labor.availableFTEs * 0.15}>
        <div class="stat-label">Reserve</div>
        <div class="stat-value">{fmtRange(d.labor.reserve)}</div>
        <div class="stat-sub">target ≥15% of available</div>
      </div>
    </div>

    <table class="data-table domain-table">
      <thead>
        <tr>
          <th>Domain</th>
          <th class="num">FTE min</th>
          <th class="num">FTE max</th>
          <th class="bar-col"></th>
        </tr>
      </thead>
      <tbody>
        {#each d.labor.domains as domain (domain.name)}
          <tr>
            <td>{domain.name}</td>
            <td class="num">{fmt(domain.ftes.min)}</td>
            <td class="num">{fmt(domain.ftes.max)}</td>
            <td class="bar-col">
              <div class="bar-track">
                <div
                  class="bar-fill"
                  style="width: {d.labor.availableFTEs > 0 ? Math.min(100, domain.ftes.max / d.labor.availableFTEs * 100) : 0}%"
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
  .page-header { margin-bottom: 24px; }
  h1 { margin: 0 0 4px; font-size: 22px; font-weight: 600; }
  .subtitle { margin: 0; font-size: 14px; color: var(--text-secondary); }

  .controls {
    margin-bottom: 28px;
  }
  .controls label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 8px;
  }
  .input-row {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  .input-row input {
    width: 220px;
    padding: 8px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--surface);
    color: var(--text);
    font-size: 14px;
  }
  .input-row button {
    padding: 8px 16px;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: var(--radius);
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
  }
  .input-row button:disabled { opacity: 0.6; cursor: default; }

  .section { margin-bottom: 36px; }
  h2 { margin: 0 0 16px; font-size: 16px; font-weight: 600; }

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }

  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
  }
  .stat-card.warn { border-color: var(--warning, #d97706); }

  .stat-label {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }
  .stat-value { font-size: 26px; font-weight: 700; line-height: 1; margin-bottom: 6px; }
  .stat-sub { font-size: 12px; color: var(--text-secondary); }

  .muted { color: var(--text-secondary); font-size: 14px; }
  .error { color: var(--error, #dc2626); font-size: 14px; }

  .warning-banner {
    background: color-mix(in srgb, var(--warning, #d97706) 12%, transparent);
    border: 1px solid var(--warning, #d97706);
    border-radius: var(--radius);
    padding: 10px 14px;
    font-size: 13px;
    margin-bottom: 16px;
  }

  .data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }
  .data-table th {
    text-align: left;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-secondary);
    padding: 0 12px 10px 0;
    border-bottom: 1px solid var(--border);
  }
  .data-table td {
    padding: 10px 12px 10px 0;
    border-bottom: 1px solid var(--border);
  }
  .num { text-align: right; }
  .bar-col { width: 160px; padding-right: 0; }
  .bar-track {
    height: 7px;
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
</style>
