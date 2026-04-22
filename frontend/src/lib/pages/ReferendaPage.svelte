<script lang="ts">
  import CommunitySidebar from '../components/CommunitySidebar.svelte';

  const { navigate } = $props<{ navigate: (to: string) => void }>();

  type ReferendumDto = {
    id: string;
    title: string;
    question: string;
    type: string;
    status: string;
    opensAt: string;
    closesAt: string;
    voteCount: number;
    tally: Record<string, number>;
    quorumPct: number;
    quorumMet: boolean | null;
    result: string | null;
    closedAt: string | null;
  };

  let referenda: ReferendumDto[] = $state([]);
  let loading = $state(true);
  let error = $state('');

  async function load() {
    loading = true;
    error = '';
    try {
      const res = await fetch('/api/referenda');
      if (!res.ok) throw new Error(await res.text());
      referenda = await res.json();
    } catch (e) {
      error = String(e);
    } finally {
      loading = false;
    }
  }

  $effect(() => { void load(); });

  const STATUS_LABEL: Record<string, string> = {
    draft:     'Draft',
    open:      'Open',
    closed:    'Closed',
    cancelled: 'Cancelled',
  };

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function resultLabel(r: ReferendumDto): string {
    if (r.status !== 'closed' && r.status !== 'cancelled') return '';
    if (r.status === 'cancelled') return 'Cancelled';
    if (r.quorumMet === false) return 'Failed quorum';
    if (r.result === null) return 'Tied';
    return `Result: ${r.result}`;
  }

  const open = $derived(referenda.filter(r => r.status === 'open'));
  const draft = $derived(referenda.filter(r => r.status === 'draft'));
  const closed = $derived(referenda.filter(r => r.status === 'closed' || r.status === 'cancelled'));
</script>

<div class="domain-layout">
  <CommunitySidebar {navigate} />
  <div class="page">
  <div class="page-header">
    <h1>Referenda</h1>
    <button class="btn-primary" onclick={() => navigate('/referenda/new')}>+ New Referendum</button>
  </div>

  {#if loading}
    <p class="empty">Loading…</p>
  {:else if error}
    <p class="err">{error}</p>
  {:else if referenda.length === 0}
    <p class="empty">No referenda yet.</p>
  {:else}
    {#if open.length > 0}
      <h2 class="section-heading">Open for Voting</h2>
      <div class="card-grid">
        {#each open as r}
          <button class="card open" onclick={() => navigate(`/referenda/${r.id}`)}>
            <div class="card-top">
              <span class="badge open">Open</span>
              <span class="card-type">{r.type}</span>
            </div>
            <div class="card-title">{r.title}</div>
            <div class="card-meta">Closes {formatDate(r.closesAt)} · {r.voteCount} vote{r.voteCount !== 1 ? 's' : ''}</div>
          </button>
        {/each}
      </div>
    {/if}

    {#if draft.length > 0}
      <h2 class="section-heading">Upcoming</h2>
      <div class="card-grid">
        {#each draft as r}
          <button class="card draft" onclick={() => navigate(`/referenda/${r.id}`)}>
            <div class="card-top">
              <span class="badge draft">Draft</span>
              <span class="card-type">{r.type}</span>
            </div>
            <div class="card-title">{r.title}</div>
            <div class="card-meta">Opens {formatDate(r.opensAt)}</div>
          </button>
        {/each}
      </div>
    {/if}

    {#if closed.length > 0}
      <h2 class="section-heading">Past</h2>
      <div class="card-grid">
        {#each closed as r}
          <button class="card closed" onclick={() => navigate(`/referenda/${r.id}`)}>
            <div class="card-top">
              <span class="badge {r.status}">{STATUS_LABEL[r.status]}</span>
              <span class="card-type">{r.type}</span>
            </div>
            <div class="card-title">{r.title}</div>
            <div class="card-meta result">{resultLabel(r)}</div>
          </button>
        {/each}
      </div>
    {/if}
  {/if}
  </div>
</div>

<style>
  .domain-layout { display: flex; flex: 1; min-height: 0; }
  .page { flex: 1; max-width: 960px; margin: 0 auto; padding: 1.5rem; }
  .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
  h1 { margin: 0; font-size: 1.5rem; }
  .section-heading { font-size: 1rem; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: .05em; margin: 1.5rem 0 0.75rem; }

  .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 0.75rem; }

  .card {
    display: flex; flex-direction: column; gap: 0.4rem;
    padding: 1rem; border-radius: 8px; border: 1px solid #ddd;
    background: white; text-align: left; cursor: pointer;
    transition: box-shadow .15s;
  }
  .card:hover { box-shadow: 0 2px 8px rgba(0,0,0,.12); }
  .card.open  { border-color: #2980b9; }
  .card.draft { border-color: #bbb; background: #fafafa; }

  .card-top { display: flex; justify-content: space-between; align-items: center; }
  .card-title { font-weight: 600; font-size: 0.95rem; color: #222; }
  .card-meta  { font-size: 0.78rem; color: #888; }
  .card-meta.result { color: #1a6db5; font-weight: 600; }
  .card-type  { font-size: 0.72rem; color: #999; text-transform: capitalize; }

  .badge { font-size: 0.7rem; font-weight: 700; padding: 2px 7px; border-radius: 99px; text-transform: uppercase; }
  .badge.open      { background: #d4edff; color: #0a69c2; }
  .badge.draft     { background: #eee; color: #777; }
  .badge.closed    { background: #e9f7e9; color: #2e7d32; }
  .badge.cancelled { background: #fce; color: #900; }

  .empty { text-align: center; color: #aaa; padding: 3rem; }
  .err   { color: #c0392b; background: #fdf0f0; border-radius: 4px; padding: 0.75rem; }

  .btn-primary { padding: 0.5rem 1rem; background: #1a6db5; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem; }
  .btn-primary:hover { background: #155a96; }
</style>
