<script lang="ts">
  import CommunitySidebar from '../components/CommunitySidebar.svelte';
  import MembersPage from './MembersPage.svelte';
  import MemberPage from './MemberPage.svelte';
  import ApplicationsPage from './ApplicationsPage.svelte';
  import AddApplicationPage from './AddApplicationPage.svelte';
  import AccountsPage from './AccountsPage.svelte';
  import AccountPage from './AccountPage.svelte';
  import SettingsPage from './SettingsPage.svelte';

  const { navigate, path } = $props<{ navigate: (to: string) => void; path: string }>();
</script>

<div class="domain-layout">
  <CommunitySidebar {navigate} />

  <div class="admin-content">
    {#if path === '/admin' || path === '/admin/members'}
      <MembersPage {navigate} />
    {:else if path.startsWith('/admin/members/')}
      <MemberPage id={path.slice('/admin/members/'.length)} {navigate} />
    {:else if path === '/admin/applications/new'}
      <AddApplicationPage {navigate} />
    {:else if path === '/admin/applications'}
      <ApplicationsPage {navigate} />
    {:else if path === '/admin/accounts'}
      <AccountsPage {navigate} />
    {:else if path.startsWith('/admin/accounts/')}
      <AccountPage id={path.slice('/admin/accounts/'.length)} {navigate} />
    {:else if path === '/admin/settings'}
      <SettingsPage {navigate} />
    {/if}
  </div>
</div>

<style>
  .domain-layout { display: flex; flex: 1; min-height: 0; }
  .admin-content { flex: 1; min-width: 0; overflow-y: auto; }
</style>
