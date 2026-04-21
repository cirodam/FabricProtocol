<script lang="ts">
  const { navigate }: { navigate: (to: string) => void } = $props();

  const governanceLinks = [
    { label: 'Assembly',     path: '/assembly' },
    { label: 'Referenda',    path: '/referenda' },
    { label: 'Sortition',    path: '/sortition' },
    { label: 'Constitution', path: '/constitution' },
  ];

  const domainLinks = [
    { label: 'Food',             path: '/food' },
    { label: 'Housing',          path: '/housing' },
    { label: 'Healthcare',       path: '/healthcare' },
    { label: 'Education',        path: '/education' },
    { label: 'Child Care',       path: '/child-care' },
    { label: 'Dependency Care',  path: '/dependency-care' },
    { label: 'Fire',             path: '/fire' },
    { label: 'Provisioning',     path: '/provisioning' },
    { label: 'Demographics',     path: '/demographics' },
  ];

  function isActive(linkPath: string): boolean {
    return window.location.pathname === linkPath ||
      (linkPath !== '/' && window.location.pathname.startsWith(linkPath));
  }
</script>

<aside class="community-sidebar">
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
