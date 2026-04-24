<script lang="ts">
  const { navigate, path = window.location.pathname }: { navigate: (to: string) => void; path?: string } = $props();

  const economyLinks = [
    { label: 'Community Budget',    path: '/community' },
    { label: 'Central Bank',        path: '/community/central-bank' },
    { label: 'Currency Board',      path: '/community/currency-board' },
    { label: 'Social Insurance',    path: '/social-insurance' },
  ];

  const governanceLinks = [
    { label: 'Referenda',     path: '/referenda' },
    { label: 'Constitution',  path: '/constitution' },
    { label: 'Leader Pools',  path: '/leader-pools' },
  ];

  const adminLinks = [
    { label: 'Members',      path: '/admin/members' },
    { label: 'Applications', path: '/admin/applications' },
    { label: 'Accounts',     path: '/admin/accounts' },
    { label: 'Demographics', path: '/admin/demographics' },
    { label: 'Projection',   path: '/admin/projection' },
    { label: 'Settings',     path: '/admin/settings' },
  ];

  const allDomainLinks = [
    { label: 'Agriculture',     path: '/agriculture',     id: '00000000-0000-0000-0000-000000000007' },
    { label: 'Child Care',      path: '/child-care',      id: '00000000-0000-0000-0000-000000000012' },
    { label: 'Communications',  path: '/communications',  id: '00000000-0000-0000-0000-000000000006' },
    { label: 'Courier',         path: '/courier',         id: '00000000-0000-0000-0000-000000000010' },
    { label: 'Deathcare',       path: '/deathcare',       id: '00000000-0000-0000-0000-000000000017' },
    { label: 'Dependency Care', path: '/dependency-care', id: '00000000-0000-0000-0000-000000000011' },
    { label: 'Education',       path: '/education',       id: '00000000-0000-0000-0000-000000000005' },
    { label: 'Enrichment',      path: '/enrichment',      id: '00000000-0000-0000-0000-000000000016' },
    { label: 'Fire',            path: '/fire',            id: '00000000-0000-0000-0000-000000000013' },
    { label: 'Food',            path: '/food',            id: '00000000-0000-0000-0000-000000000003' },
    { label: 'Healthcare',      path: '/healthcare',      id: '00000000-0000-0000-0000-000000000004' },
    { label: 'Housing',         path: '/housing',         id: '00000000-0000-0000-0000-000000000001' },
    { label: 'Sanitation',      path: '/sanitation',      id: '00000000-0000-0000-0000-000000000008' },
    { label: 'Transport',       path: '/transport',       id: '00000000-0000-0000-0000-000000000015' },
    { label: 'Water',           path: '/water',           id: '00000000-0000-0000-0000-000000000009' },
  ];

  // Fetch enabled domain IDs; fall back to showing all if the request fails.
  let enabledIds = $state<Set<string> | null>(null);

  fetch('/api/admin/domains')
    .then(r => r.ok ? r.json() : Promise.reject())
    .then((data: { id: string; enabled: boolean }[]) => {
      enabledIds = new Set(data.filter(d => d.enabled).map(d => d.id));
    })
    .catch(() => { enabledIds = null; });

  const domainLinks = $derived(
    enabledIds === null
      ? allDomainLinks
      : allDomainLinks.filter(l => enabledIds!.has(l.id))
  );

  function isActive(linkPath: string): boolean {
    if (path === linkPath) return true;
    // These paths are prefixes of sibling links, so require exact match only
    const exactOnly = ['/community', '/referenda', '/leader-pools'];
    if (exactOnly.includes(linkPath)) return false;
    return path.startsWith(linkPath + '/');
  }
</script>

<aside class="community-sidebar">
  <div class="sidebar-section">
    <div class="sidebar-heading">Economy</div>
    {#each economyLinks as link}
      <button
        class="sidebar-link"
        class:active={isActive(link.path)}
        onclick={() => navigate(link.path)}
      >{link.label}</button>
    {/each}
  </div>
  <div class="sidebar-section">
    <div class="sidebar-heading">Governance</div>
    {#each governanceLinks as link}
      <button
        class="sidebar-link"
        class:active={isActive(link.path)}
        onclick={() => navigate(link.path)}
      >{link.label}</button>
    {/each}
  </div>
  <div class="sidebar-section">
    <div class="sidebar-heading">Domains</div>
    {#each domainLinks as link}
      <button
        class="sidebar-link"
        class:active={isActive(link.path)}
        onclick={() => navigate(link.path)}
      >{link.label}</button>
    {/each}
  </div>
  <div class="sidebar-section">
    <div class="sidebar-heading">Admin</div>
    {#each adminLinks as link}
      <button
        class="sidebar-link"
        class:active={isActive(link.path)}
        onclick={() => navigate(link.path)}
      >{link.label}</button>
    {/each}
  </div>
</aside>

<style>
  .community-sidebar {
    width: 180px;
    flex-shrink: 0;
    border-right: 1px solid var(--border);
    padding: 32px 0;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .sidebar-section {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .sidebar-heading {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--text-secondary);
    padding: 0 16px 6px;
  }

  .sidebar-link {
    display: block;
    width: 100%;
    text-align: left;
    background: none;
    border: none;
    padding: 6px 16px;
    font-size: 14px;
    color: var(--text);
    cursor: pointer;
    border-radius: 0;
  }
  .sidebar-link:hover { background: var(--surface); }
  .sidebar-link.active {
    color: var(--accent);
    font-weight: 600;
  }
</style>
