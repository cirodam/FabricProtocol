<script lang="ts">
  import MembersPage from './lib/pages/MembersPage.svelte';
  import MemberPage from './lib/pages/MemberPage.svelte';
  import AccountsPage from './lib/pages/AccountsPage.svelte';
  import AddMemberPage from './lib/pages/AddMemberPage.svelte';
  import MarketplacePage from './lib/pages/MarketplacePage.svelte';
  import AddPostPage from './lib/pages/AddPostPage.svelte';
  import PostPage from './lib/pages/PostPage.svelte';
  import CentralBankPage from './lib/pages/CentralBankPage.svelte';
  import FoodPage from './lib/pages/FoodPage.svelte';
  import HousingPage from './lib/pages/HousingPage.svelte';
  import HousingUnitPage from './lib/pages/HousingUnitPage.svelte';
  import AddHousingUnitPage from './lib/pages/AddHousingUnitPage.svelte';

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
  <button class:active={path.startsWith('/marketplace')} onclick={() => navigate('/marketplace')}>Marketplace</button>
  <button class:active={path === '/central-bank'} onclick={() => navigate('/central-bank')}>Central Bank</button>
  <button class:active={path === '/food'} onclick={() => navigate('/food')}>Food</button>
  <button class:active={path.startsWith('/housing')} onclick={() => navigate('/housing')}>Housing</button>
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
  {:else if path === '/marketplace'}
    <MarketplacePage {navigate} />
  {:else if path === '/marketplace/new'}
    <AddPostPage {navigate} />
  {:else if path.startsWith('/marketplace/')}
    <PostPage id={path.slice('/marketplace/'.length)} {navigate} />
  {:else if path === '/central-bank'}
    <CentralBankPage {navigate} />
  {:else if path === '/food'}
    <FoodPage />
  {:else if path === '/housing'}
    <HousingPage {navigate} />
  {:else if path === '/housing/new'}
    <AddHousingUnitPage {navigate} />
  {:else if path.startsWith('/housing/')}
    <HousingUnitPage id={path.slice('/housing/'.length)} {navigate} />
  {/if}
</main>
