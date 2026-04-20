<script lang="ts">
  import MembersPage from './lib/pages/MembersPage.svelte';
  import MemberPage from './lib/pages/MemberPage.svelte';
  import AccountsPage from './lib/pages/AccountsPage.svelte';
  import AddMemberPage from './lib/pages/AddMemberPage.svelte';
  import MarketplacePage from './lib/pages/MarketplacePage.svelte';
  import AddPostPage from './lib/pages/AddPostPage.svelte';
  import PostPage from './lib/pages/PostPage.svelte';
  import CentralBankPage from './lib/pages/CentralBankPage.svelte';
  import CommonwealthPage from './lib/pages/CommonwealthPage.svelte';
  import DemographicsPage from './lib/pages/DemographicsPage.svelte';
  import FoodPage from './lib/pages/FoodPage.svelte';
  import HousingPage from './lib/pages/HousingPage.svelte';
  import HousingUnitPage from './lib/pages/HousingUnitPage.svelte';
  import AddHousingUnitPage from './lib/pages/AddHousingUnitPage.svelte';
  import DependencyCarePage from './lib/pages/DependencyCarePage.svelte';
  import ChildCarePage from './lib/pages/ChildCarePage.svelte';
  import HealthcarePage from './lib/pages/HealthcarePage.svelte';
  import ClinicPage from './lib/pages/ClinicPage.svelte';
  import AddHealthcareClinicPage from './lib/pages/AddHealthcareClinicPage.svelte';
  import DentalClinicPage from './lib/pages/DentalClinicPage.svelte';
  import AddDentalClinicPage from './lib/pages/AddDentalClinicPage.svelte';
  import SettingsPage from './lib/pages/SettingsPage.svelte';
  import EducationPage from './lib/pages/EducationPage.svelte';
  import SchoolPage from './lib/pages/SchoolPage.svelte';
  import AddSchoolPage from './lib/pages/AddSchoolPage.svelte';
  import LibraryPage from './lib/pages/LibraryPage.svelte';
  import AddLibraryPage from './lib/pages/AddLibraryPage.svelte';
  import CommunityKitchenPage from './lib/pages/CommunityKitchenPage.svelte';
  import AddCommunityKitchenPage from './lib/pages/AddCommunityKitchenPage.svelte';
  import MillPage from './lib/pages/MillPage.svelte';
  import AddMillPage from './lib/pages/AddMillPage.svelte';

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
  <button class:active={path === '/commonwealth'} onclick={() => navigate('/commonwealth')}>Commonwealth</button>
  <button class:active={path === '/demographics'} onclick={() => navigate('/demographics')}>Demographics</button>
  <button class:active={path === '/food'} onclick={() => navigate('/food')}>Food</button>
  <button class:active={path.startsWith('/housing')} onclick={() => navigate('/housing')}>Housing</button>
  <button class:active={path === '/dependency-care'} onclick={() => navigate('/dependency-care')}>Dependency Care</button>
  <button class:active={path === '/child-care'} onclick={() => navigate('/child-care')}>Child Care</button>
  <button class:active={path.startsWith('/healthcare')} onclick={() => navigate('/healthcare')}>Healthcare</button>
  <button class:active={path.startsWith('/education')} onclick={() => navigate('/education')}>Education</button>
  <button class:active={path === '/settings'} onclick={() => navigate('/settings')}>Settings</button>
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
  {:else if path === '/commonwealth'}
    <CommonwealthPage />
  {:else if path === '/demographics'}
    <DemographicsPage />
  {:else if path === '/food'}
    <FoodPage {navigate} />
  {:else if path === '/food/kitchens/new'}
    <AddCommunityKitchenPage {navigate} />
  {:else if path.startsWith('/food/kitchens/')}
    <CommunityKitchenPage id={path.slice('/food/kitchens/'.length)} {navigate} />
  {:else if path === '/food/mills/new'}
    <AddMillPage {navigate} />
  {:else if path.startsWith('/food/mills/')}
    <MillPage id={path.slice('/food/mills/'.length)} {navigate} />
  {:else if path === '/housing'}
    <HousingPage {navigate} />
  {:else if path === '/housing/new'}
    <AddHousingUnitPage {navigate} />
  {:else if path.startsWith('/housing/')}
    <HousingUnitPage id={path.slice('/housing/'.length)} {navigate} />
  {:else if path === '/dependency-care'}
    <DependencyCarePage />
  {:else if path === '/child-care'}
    <ChildCarePage />
  {:else if path === '/healthcare'}
    <HealthcarePage {navigate} />
  {:else if path === '/healthcare/clinics/new'}
    <AddHealthcareClinicPage {navigate} />
  {:else if path.startsWith('/healthcare/clinics/')}
    <ClinicPage id={path.slice('/healthcare/clinics/'.length)} {navigate} />
  {:else if path === '/healthcare/dental-clinics/new'}
    <AddDentalClinicPage {navigate} />
  {:else if path.startsWith('/healthcare/dental-clinics/')}
    <DentalClinicPage id={path.slice('/healthcare/dental-clinics/'.length)} {navigate} />
  {:else if path === '/settings'}
    <SettingsPage {navigate} />
  {:else if path === '/education'}
    <EducationPage {navigate} />
  {:else if path === '/education/schools/new'}
    <AddSchoolPage {navigate} />
  {:else if path.startsWith('/education/schools/')}
    <SchoolPage id={path.slice('/education/schools/'.length)} {navigate} />
  {:else if path === '/education/libraries/new'}
    <AddLibraryPage {navigate} />
  {:else if path.startsWith('/education/libraries/')}
    <LibraryPage id={path.slice('/education/libraries/'.length)} {navigate} />
  {/if}
</main>
