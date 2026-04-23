<script lang="ts">
  interface Status {
    members: number;
    moneyInCirculation: number;
  }

  interface Member {
    id: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    personYears: number;
  }

  let status: Status | null = $state(null);
  let totalPersonYears = $state(0);
  let communityName = $state('Community');
  let loading = $state(true);
  let error: string | null = $state(null);

  async function load() {
    try {
      const [statusRes, membersRes, constitutionRes] = await Promise.all([
        fetch('/api/status'),
        fetch('/api/members'),
        fetch('/api/constitution'),
      ]);
      if (!statusRes.ok) throw new Error(`status ${statusRes.status}`);
      if (!membersRes.ok) throw new Error(`members ${membersRes.status}`);
      status = await statusRes.json();
      const members: Member[] = await membersRes.json();
      totalPersonYears = members.reduce((sum, m) => sum + (m.personYears ?? 0), 0);
      if (constitutionRes.ok) {
        const doc = await constitutionRes.json();
        communityName = doc.communityName ?? 'Community';
      }
    } catch (e) {
      error = (e as Error).message;
    } finally {
      loading = false;
    }
  }

  load();

  function fmt(n: number | null | undefined): string {
    if (n == null) return '—';
    return n.toLocaleString();
  }

</script>

<div class="home-hero">
  <div class="hero-inner">
    <h1 class="hero-title">{communityName}</h1>
    {#if status}
      <p class="hero-stats">
        <span class="hero-num members">{fmt(status.members)}</span> people with
        <span class="hero-num years">{fmt(Math.floor(totalPersonYears))}</span> years of lived experience.
      </p>
    {/if}
  </div>
</div>

{#if loading}
  <p class="muted">Loading…</p>
{:else if error}
  <p class="error">{error}</p>
{/if}

<style>
  .home-hero {
    background: linear-gradient(135deg, var(--color-primary, #2d6a4f) 0%, #1b4332 100%);
    color: #fff;
    padding: 3.5rem 2rem 3rem;
    margin-bottom: 2rem;
    border-radius: 0.5rem;
  }

  .hero-inner {
    max-width: 640px;
  }

  .hero-title {
    font-size: 2.4rem;
    font-weight: 700;
    margin: 0 0 0.5rem;
    letter-spacing: -0.5px;
  }

  .hero-stats {
    font-size: 1.15rem;
    opacity: 0.95;
    margin: 0;
  }

  .hero-num {
    font-weight: 700;
    font-size: 1.35rem;
  }

  .hero-num.members {
    color: #95d5b2;
  }

  .hero-num.years {
    color: #74c69d;
  }
</style>
