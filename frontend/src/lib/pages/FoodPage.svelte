<script lang="ts">
  interface Totals {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number;
    waterL: number;
  }

  let totals: Totals | null = $state(null);
  let loading = $state(true);
  let error: string | null = $state(null);

  async function load() {
    try {
      const res = await fetch('/api/food/requirements');
      if (!res.ok) throw new Error(`${res.status}`);
      totals = await res.json();
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  load();
</script>

<div class="page-header">
  <h1>Food</h1>
</div>

{#if loading}
  <p class="muted">Loading…</p>
{:else if error}
  <p class="error">{error}</p>
{:else if totals}
  <h2>Daily Community Requirements</h2>
  <div class="stats">
    <div class="stat-card">
      <div class="stat-label">Calories</div>
      <div class="stat-value">{totals.calories.toLocaleString()}</div>
      <div class="stat-sub">kcal / day</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Protein</div>
      <div class="stat-value">{totals.proteinG.toLocaleString()}</div>
      <div class="stat-sub">grams / day</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Carbohydrates</div>
      <div class="stat-value">{totals.carbsG.toLocaleString()}</div>
      <div class="stat-sub">grams / day</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Fat</div>
      <div class="stat-value">{totals.fatG.toLocaleString()}</div>
      <div class="stat-sub">grams / day</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Fiber</div>
      <div class="stat-value">{totals.fiberG.toLocaleString()}</div>
      <div class="stat-sub">grams / day</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Water</div>
      <div class="stat-value">{totals.waterL.toFixed(1)}</div>
      <div class="stat-sub">liters / day</div>
    </div>
  </div>
{/if}

<style>
  .page-header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 24px;
  }

  h1 { margin: 0; font-size: 22px; font-weight: 600; }
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

  .muted { color: var(--text-secondary); }
  .error { color: #ef5350; }
</style>


