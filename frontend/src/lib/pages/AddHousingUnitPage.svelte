<script lang="ts">
  const { navigate }: { navigate: (path: string) => void } = $props();

  let name = $state('');
  let hasRunningWater = $state(false);
  let hasToilet       = $state(false);
  let hasElectricity  = $state(false);
  let hasHeating      = $state(false);
  let hasCooking      = $state(false);
  let isHabitable     = $state(false);

  let submitting = $state(false);
  let error: string | null = $state(null);

  async function submit(e: Event) {
    e.preventDefault();
    error = null;
    if (!name.trim()) { error = 'Name is required.'; return; }
    submitting = true;
    try {
      const res = await fetch('/api/housing/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          hasRunningWater,
          hasToilet,
          hasElectricity,
          hasHeating,
          hasCooking,
          isHabitable,
        }),
      });
      const data = await res.json();
      if (!res.ok) { error = data.error ?? `${res.status}`; return; }
      navigate(`/housing/${data.id}`);
    } catch (e) {
      error = (e as Error).message;
    } finally {
      submitting = false;
    }
  }
</script>

<div class="page-header">
  <button class="back-btn" onclick={() => navigate('/housing')}>← Housing</button>
</div>

<h1>Add Housing Unit</h1>

<form onsubmit={submit} class="form">
  {#if error}
    <p class="error">{error}</p>
  {/if}

  <div class="field">
    <label for="name">Name</label>
    <input id="name" type="text" bind:value={name} placeholder="e.g. 14 Oak Street" required />
  </div>

  <fieldset>
    <legend>Amenities</legend>
    <div class="checkboxes">
      <label class="check">
        <input type="checkbox" bind:checked={hasRunningWater} />
        💧 Running Water
      </label>
      <label class="check">
        <input type="checkbox" bind:checked={hasToilet} />
        🚽 Toilet
      </label>
      <label class="check">
        <input type="checkbox" bind:checked={hasElectricity} />
        ⚡ Electricity
      </label>
      <label class="check">
        <input type="checkbox" bind:checked={hasHeating} />
        🔥 Heating
      </label>
      <label class="check">
        <input type="checkbox" bind:checked={hasCooking} />
        🍳 Cooking
      </label>
    </div>
  </fieldset>

  <div class="field">
    <label class="check inline">
      <input type="checkbox" bind:checked={isHabitable} />
      Mark as habitable
    </label>
  </div>

  <div class="actions">
    <button type="button" class="cancel" onclick={() => navigate('/housing')}>Cancel</button>
    <button type="submit" class="submit" disabled={submitting}>
      {submitting ? 'Saving…' : 'Create Unit'}
    </button>
  </div>
</form>

<style>
  .page-header { margin-bottom: 20px; }

  .back-btn {
    background: none;
    border: none;
    padding: 0;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.9rem;
  }
  .back-btn:hover { color: var(--text); }

  h1 { margin: 0 0 28px; font-size: 22px; font-weight: 600; }

  .form {
    max-width: 520px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-secondary);
  }

  input[type="text"] {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 8px 12px;
    color: var(--text);
    font-size: 0.95rem;
    font-family: inherit;
    width: 100%;
    box-sizing: border-box;
  }

  input[type="text"]:focus {
    outline: none;
    border-color: var(--accent);
  }

  fieldset {
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 16px 20px;
    margin: 0;
  }

  legend {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-secondary);
    padding: 0 6px;
  }

  .checkboxes {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 4px;
  }

  .check {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    font-weight: 400;
    color: var(--text);
    cursor: pointer;
  }

  .check input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: var(--accent);
  }

  .actions {
    display: flex;
    gap: 12px;
    margin-top: 8px;
  }

  .cancel {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 9px 20px;
    cursor: pointer;
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  .submit {
    background: var(--accent);
    border: none;
    border-radius: var(--radius);
    padding: 9px 24px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 600;
    color: #fff;
  }

  .submit:disabled { opacity: 0.5; cursor: default; }

  .error {
    color: #ef5350;
    font-size: 0.9rem;
  }
</style>
