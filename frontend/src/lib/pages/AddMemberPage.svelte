<script lang="ts">
  let firstName = $state('');
  let lastName = $state('');
  let birthDate = $state('');
  let handle = $state('');
  let phone = $state('');
  let disabled = $state(false);

  let submitting = $state(false);
  let error: string | null = $state(null);
  let success: string | null = $state(null);

  interface LanguageProficiency {
    language: string;
    reading: boolean;
    writing: boolean;
    speaking: boolean;
  }

  let languages: LanguageProficiency[] = $state([]);
  let newLang = $state('');

  const COMMON_LANGUAGES: { code: string; name: string }[] = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'zh', name: 'Chinese (Mandarin)' },
    { code: 'yue', name: 'Chinese (Cantonese)' },
    { code: 'tl', name: 'Tagalog' },
    { code: 'vi', name: 'Vietnamese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'fr', name: 'French' },
    { code: 'ko', name: 'Korean' },
    { code: 'ru', name: 'Russian' },
    { code: 'de', name: 'German' },
    { code: 'hi', name: 'Hindi' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'it', name: 'Italian' },
    { code: 'pl', name: 'Polish' },
    { code: 'uk', name: 'Ukrainian' },
    { code: 'ht', name: 'Haitian Creole' },
    { code: 'so', name: 'Somali' },
    { code: 'am', name: 'Amharic' },
    { code: 'sw', name: 'Swahili' },
    { code: 'fa', name: 'Persian / Farsi' },
    { code: 'ur', name: 'Urdu' },
    { code: 'pa', name: 'Punjabi' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'bn', name: 'Bengali' },
  ];

  function availableLanguages() {
    return COMMON_LANGUAGES.filter(l => !languages.some(x => x.language === l.code));
  }

  function addLanguage() {
    const code = newLang.trim();
    if (!code || languages.some(l => l.language === code)) { newLang = ''; return; }
    languages = [...languages, { language: code, reading: false, writing: false, speaking: false }];
    newLang = '';
  }

  function removeLanguage(code: string) {
    languages = languages.filter(l => l.language !== code);
  }

  async function submit(e: Event) {
    e.preventDefault();
    error = null;
    success = null;
    submitting = true;

    try {
      const body: Record<string, unknown> = {
        firstName,
        lastName,
        birthDate,
        disabled,
      };
      if (handle.trim()) body.handle = handle.trim();
      if (phone.trim()) body.phone = phone.trim();
      if (languages.length > 0) body.languages = languages;

      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        error = data.error ?? `${res.status} ${res.statusText}`;
        return;
      }

      success = `${data.firstName} ${data.lastName} added (${data.id})`;
      firstName = '';
      lastName = '';
      birthDate = '';
      handle = '';
      phone = '';
      disabled = false;
      languages = [];
    } catch (e) {
      error = (e as Error).message;
    } finally {
      submitting = false;
    }
  }
</script>

<div class="page-header">
  <h1>Add Member</h1>
</div>

<form onsubmit={submit}>
  <div class="grid">
    <label>
      First name <span class="req">*</span>
      <input type="text" bind:value={firstName} required />
    </label>
    <label>
      Last name <span class="req">*</span>
      <input type="text" bind:value={lastName} required />
    </label>
    <label>
      Date of birth <span class="req">*</span>
      <input type="date" bind:value={birthDate} required />
    </label>
    <label>
      Handle
      <input type="text" bind:value={handle} placeholder="auto-generated if blank" />
    </label>
    <label>
      Phone <span class="hint">(E.164, e.g. +15551234567)</span>
      <input type="tel" bind:value={phone} placeholder="+1…" />
    </label>
  </div>

  <div class="lang-section">
    <div class="lang-header">Languages</div>
    {#if languages.length > 0}
      <table class="lang-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Reading</th>
            <th>Writing</th>
            <th>Speaking</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each languages as lang (lang.language)}
            <tr>
              <td class="lang-code">{lang.language}</td>
              <td><input type="checkbox" bind:checked={lang.reading} /></td>
              <td><input type="checkbox" bind:checked={lang.writing} /></td>
              <td><input type="checkbox" bind:checked={lang.speaking} /></td>
              <td><button type="button" class="remove-btn" onclick={() => removeLanguage(lang.language)}>✕</button></td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
    <div class="lang-add">
      <select bind:value={newLang} onchange={addLanguage}>
        <option value="">Add a language…</option>
        {#each availableLanguages() as l (l.code)}
          <option value={l.code}>{l.name}</option>
        {/each}
      </select>
    </div>
  </div>

  <div class="disabled-row">
    <label class="checkbox-label">
      <input type="checkbox" bind:checked={disabled} />
      Disabled <span class="hint">(community-determined; exempt from work expectations)</span>
    </label>
  </div>

  {#if error}
    <p class="error">{error}</p>
  {/if}
  {#if success}
    <p class="success">{success}</p>
  {/if}

  <button type="submit" disabled={submitting}>
    {submitting ? 'Adding…' : 'Add member'}
  </button>
</form>

<style>
  .page-header {
    margin-bottom: 24px;
  }

  h1 { margin: 0; font-size: 22px; font-weight: 600; }

  form {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
    max-width: 640px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 14px;
    font-weight: 500;
  }

  input[type="text"],
  input[type="date"],
  input[type="tel"] {
    padding: 8px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg);
    color: var(--text);
    font-size: 14px;
  }

  input:focus {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
  }

  .disabled-row {
    display: flex;
    align-items: center;
  }

  .checkbox-label {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    font-weight: 500;
    cursor: pointer;
  }

  .checkbox-label input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: var(--accent);
  }

  .req { color: #ef4444; }

  .hint {
    font-size: 12px;
    font-weight: 400;
    color: var(--text-muted);
  }

  button[type="submit"] {
    align-self: flex-start;
    padding: 9px 20px;
    background: var(--accent);
    color: #fff;
    border: none;
    border-radius: var(--radius);
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
  }

  button[type="submit"]:hover:not(:disabled) { background: var(--accent-hover); }
  button[type="submit"]:disabled { opacity: 0.6; cursor: not-allowed; }

  .error { color: #ef4444; font-size: 14px; margin: 0; }
  .success { color: #16a34a; font-size: 14px; margin: 0; }

  .lang-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .lang-header {
    font-size: 14px;
    font-weight: 500;
  }

  .lang-table { width: 100%; border-collapse: collapse; font-size: 14px; }
  .lang-table th {
    text-align: left;
    padding: 5px 10px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    border-bottom: 1px solid var(--border);
  }
  .lang-table td { padding: 6px 10px; border-bottom: 1px solid var(--border); }
  .lang-table tr:last-child td { border-bottom: none; }
  .lang-code { font-family: monospace; }

  .lang-add select {
    width: 100%;
    padding: 7px 10px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg);
    color: var(--text);
    font-size: 14px;
    cursor: pointer;
  }

  .remove-btn {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    font-size: 14px;
    padding: 0 4px;
  }

  .remove-btn:hover { color: #ef4444; }
</style>
