<script lang="ts">
  const { navigate, path = window.location.pathname }: { navigate: (to: string) => void; path?: string } = $props();

  const economyLinks = [
    { label: 'Community Budget', path: '/community' },
    { label: 'Central Bank',     path: '/community/central-bank' },
    { label: 'Currency Board',   path: '/community/currency-board' },
  ];

  const governanceLinks = [
    { label: 'Referenda',    path: '/referenda' },
    { label: 'Constitution', path: '/constitution' },
  ];

  const adminLinks = [
    { label: 'Members',      path: '/admin/members' },
    { label: 'Applications', path: '/admin/applications' },
    { label: 'Accounts',     path: '/admin/accounts' },
    { label: 'Settings',     path: '/admin/settings' },
  ];

  function isActive(linkPath: string): boolean {
    if (path === linkPath) return true;
    // These paths are prefixes of sibling links, so require exact match only
    const exactOnly = ['/community', '/referenda'];
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
