<script lang="ts">
  import HomePage from './lib/pages/HomePage.svelte';
  import MembersPage from './lib/pages/MembersPage.svelte';
  import MemberPage from './lib/pages/MemberPage.svelte';
  import AccountsPage from './lib/pages/AccountsPage.svelte';
  import AccountPage from './lib/pages/AccountPage.svelte';
  import AddApplicationPage from './lib/pages/AddApplicationPage.svelte';
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
  import SharedHouseholdPage from './lib/pages/SharedHouseholdPage.svelte';
  import AddSharedHouseholdPage from './lib/pages/AddSharedHouseholdPage.svelte';
  import MedicalCareUnitPage from './lib/pages/MedicalCareUnitPage.svelte';
  import AddMedicalCareUnitPage from './lib/pages/AddMedicalCareUnitPage.svelte';
  import HomeCaregivingPage from './lib/pages/HomeCaregivingPage.svelte';
  import ChildCarePage from './lib/pages/ChildCarePage.svelte';
  import HomeChildcarePage from './lib/pages/HomeChildcarePage.svelte';
  import GuildsPage from './lib/pages/GuildsPage.svelte';
  import GuildDetailPage from './lib/pages/GuildDetailPage.svelte';
  import AddGuildPage from './lib/pages/AddGuildPage.svelte';
  import AssemblyPage from './lib/pages/AssemblyPage.svelte';
  import ConstitutionPage from './lib/pages/ConstitutionPage.svelte';
  import ProvisioningPage from './lib/pages/ProvisioningPage.svelte';
  import ApplicationsPage from './lib/pages/ApplicationsPage.svelte';
  import CalendarPage from './lib/pages/CalendarPage.svelte';
  import AddEventPage from './lib/pages/AddEventPage.svelte';
  import MessagesPage from './lib/pages/MessagesPage.svelte';
  import ComposeMessagePage from './lib/pages/ComposeMessagePage.svelte';
  import ReferendaPage from './lib/pages/ReferendaPage.svelte';
  import CreateReferendumPage from './lib/pages/CreateReferendumPage.svelte';
  import ReferendumDetailPage from './lib/pages/ReferendumDetailPage.svelte';
  import HealthcarePage from './lib/pages/HealthcarePage.svelte';
  import ClinicPage from './lib/pages/ClinicPage.svelte';
  import AddHealthcareClinicPage from './lib/pages/AddHealthcareClinicPage.svelte';
  import DentalClinicPage from './lib/pages/DentalClinicPage.svelte';
  import AddDentalClinicPage from './lib/pages/AddDentalClinicPage.svelte';
  import SettingsPage from './lib/pages/SettingsPage.svelte';
  import FirePage from './lib/pages/FirePage.svelte';
  import FireCompanyPage from './lib/pages/FireCompanyPage.svelte';
  import AddFireCompanyPage from './lib/pages/AddFireCompanyPage.svelte';
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
    return window.location.pathname;
  }

  let path = $state(getPath());

  function getMemberId() {
    return new URLSearchParams(window.location.search).get('as') ?? '';
  }
  let currentMemberId = $state(getMemberId());

  function navigate(to: string) {
    history.pushState({}, '', to);
    path = to;
    currentMemberId = getMemberId();
  }

  window.addEventListener('popstate', () => { path = getPath(); currentMemberId = getMemberId(); });
</script>

<nav>
  <span class="brand">LocalCommunity</span>
  <button class:active={path === '/'} onclick={() => navigate('/')}>Home</button>
  <button class:active={path === '/members'} onclick={() => navigate('/members')}>Members</button>
  <button class:active={path === '/applications'} onclick={() => navigate('/applications')}>Applications</button>
  <button class:active={path.startsWith('/calendar')} onclick={() => navigate('/calendar')}>Calendar</button>
  <button class:active={path.startsWith('/messages')} onclick={() => navigate('/messages')}>Messages</button>
  <button class:active={path === '/accounts'} onclick={() => navigate('/accounts')}>Accounts</button>
  <button class:active={path.startsWith('/marketplace')} onclick={() => navigate('/marketplace')}>Marketplace</button>
  <button class:active={path === '/central-bank'} onclick={() => navigate('/central-bank')}>Central Bank</button>
  <button class:active={path === '/demographics'} onclick={() => navigate('/demographics')}>Demographics</button>
  <button class:active={path.startsWith('/commonwealth')} onclick={() => navigate('/commonwealth')}>Commonwealth</button>
  <button class:active={path === '/settings'} onclick={() => navigate('/settings')}>Settings</button>
</nav>

<main>
  {#if path === '/'}
    <HomePage />
  {:else if path === '/members'}
    <MembersPage {navigate} />
  {:else if path === '/accounts'}
    <AccountsPage {navigate} />
  {:else if path.startsWith('/accounts/')}
    <AccountPage id={path.slice('/accounts/'.length)} {navigate} />
  {:else if path === '/applications/new'}
    <AddApplicationPage {navigate} />
  {:else if path === '/applications'}
    <ApplicationsPage {navigate} />
  {:else if path === '/calendar/new'}
    <AddEventPage {navigate} />
  {:else if path === '/calendar'}
    <CalendarPage {navigate} />
  {:else if path === '/messages/new'}
    <ComposeMessagePage {navigate} memberId={currentMemberId} />
  {:else if path === '/messages'}
    <MessagesPage {navigate} memberId={currentMemberId} />
  {:else if path === '/referenda/new'}
    <CreateReferendumPage {navigate} />
  {:else if path.startsWith('/referenda/')}
    <ReferendumDetailPage {navigate} id={path.slice('/referenda/'.length)} />
  {:else if path === '/referenda'}
    <ReferendaPage {navigate} />
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
    <CommonwealthPage {navigate} />
  {:else if path === '/provisioning'}
    <ProvisioningPage {navigate} />
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
    <DependencyCarePage {navigate} />
  {:else if path === '/dependency-care/households/new'}
    <AddSharedHouseholdPage {navigate} />
  {:else if path.startsWith('/dependency-care/households/')}
    <SharedHouseholdPage id={path.slice('/dependency-care/households/'.length)} {navigate} />
  {:else if path === '/dependency-care/medical-care-units/new'}
    <AddMedicalCareUnitPage {navigate} />
  {:else if path.startsWith('/dependency-care/medical-care-units/')}
    <MedicalCareUnitPage id={path.slice('/dependency-care/medical-care-units/'.length)} {navigate} />
  {:else if path === '/dependency-care/home-caregiving'}
    <HomeCaregivingPage {navigate} />
  {:else if path === '/child-care'}
    <ChildCarePage {navigate} />
  {:else if path === '/child-care/home-childcare'}
    <HomeChildcarePage {navigate} />
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
  {:else if path === '/fire'}
    <FirePage {navigate} />
  {:else if path === '/fire/companies/new'}
    <AddFireCompanyPage {navigate} />
  {:else if path.startsWith('/fire/companies/')}
    <FireCompanyPage id={path.slice('/fire/companies/'.length)} {navigate} />
  {:else if path === '/guilds'}
    <GuildsPage {navigate} />
  {:else if path === '/guilds/new'}
    <AddGuildPage {navigate} />
  {:else if path.startsWith('/guilds/')}
    <GuildDetailPage id={path.slice('/guilds/'.length)} {navigate} />
  {:else if path === '/assembly'}
    <AssemblyPage />
  {:else if path === '/constitution'}
    <ConstitutionPage />
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
