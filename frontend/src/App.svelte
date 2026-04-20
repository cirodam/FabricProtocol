<script lang="ts">
  import MembersPage from './lib/pages/MembersPage.svelte';
  import AccountsPage from './lib/pages/AccountsPage.svelte';
  import AddMemberPage from './lib/pages/AddMemberPage.svelte';

  function getPath() {
    return window.location.pathname;
  }

  let path = $state(getPath());

  function navigate(to: string) {
    history.pushState({}, '', to);
    path = to;
  }

  window.addEventListener('popstate', () => { path = getPath(); });

  // Redirect bare / to /members
  if (path === '/') navigate('/members');
</script>

<nav>
  <span class="brand">LocalCommunity</span>
  <button class:active={path === '/members'} onclick={() => navigate('/members')}>Members</button>
  <button class:active={path === '/accounts'} onclick={() => navigate('/accounts')}>Accounts</button>
</nav>

<main>
  {#if path === '/members'}
    <MembersPage {navigate} />
  {:else if path === '/accounts'}
    <AccountsPage />
  {:else if path === '/members/add'}
    <AddMemberPage />
  {/if}
</main>
