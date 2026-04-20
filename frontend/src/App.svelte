<script lang="ts">
  import MembersPage from './lib/pages/MembersPage.svelte';
  import MemberPage from './lib/pages/MemberPage.svelte';
  import AccountsPage from './lib/pages/AccountsPage.svelte';
  import AddMemberPage from './lib/pages/AddMemberPage.svelte';

  function getPath() {
    const p = window.location.pathname;
    if (p === '/') { history.pushState({}, '', '/members'); return '/members'; }
    return p;
  }

  let path = $state(getPath());

  function navigate(to: string) {
    history.pushState({}, '', to);
    path = to;
  }

  window.addEventListener('popstate', () => { path = getPath(); });
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
  {:else if path.startsWith('/members/')}
    <MemberPage id={path.slice('/members/'.length)} {navigate} />
  {/if}
</main>
