<script lang="ts">
  import type { Snippet } from 'svelte';
  import CommunitySidebar from './CommunitySidebar.svelte';
  import DomainPoolPanel from './DomainPoolPanel.svelte';

  const {
    navigate,
    path,
    title,
    description = '',
    domainId,
    loading = false,
    error = null,
    headerRight,
    children,
  }: {
    navigate: (p: string) => void;
    path?: string;
    title: string;
    description?: string;
    domainId: string;
    loading?: boolean;
    error?: string | null;
    headerRight?: Snippet;
    children: Snippet;
  } = $props();
</script>

<div class="domain-layout">
  <CommunitySidebar {navigate} {path} />
  <div class="domain-main">
    <div class="page-header">
      <div>
        <h1>{title}</h1>
        {#if description}<p class="subtitle">{description}</p>{/if}
      </div>
      {#if headerRight}{@render headerRight()}{/if}
    </div>

    <DomainPoolPanel {domainId} {navigate} />

    {#if loading}
      <p class="muted">Loading…</p>
    {:else if error}
      <p class="error">{error}</p>
    {:else}
      {@render children()}
    {/if}
  </div>
</div>

<style>
  .domain-layout { display: flex; min-height: 100vh; }
  .domain-main { flex: 1; padding: 32px 40px; max-width: 860px; }
  .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
  h1 { margin: 0; font-size: 22px; font-weight: 600; }
  .subtitle { margin: 0.25rem 0 0; font-size: 14px; color: var(--text-secondary); line-height: 1.6; max-width: 680px; }
  .muted { color: var(--text-secondary); }
  .error { color: #ef5350; }
</style>
