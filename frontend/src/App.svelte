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
  import SocialInsurancePage from './lib/pages/SocialInsurancePage.svelte';
  import DemographicsPage from './lib/pages/DemographicsPage.svelte';
  import FoodPage from './lib/pages/functional_domain/FoodPage.svelte';
  import CommunicationsPage from './lib/pages/functional_domain/CommunicationsPage.svelte';
  import AgriculturePage from './lib/pages/functional_domain/AgriculturePage.svelte';
  import SanitationPage from './lib/pages/functional_domain/SanitationPage.svelte';
  import WaterPage from './lib/pages/functional_domain/WaterPage.svelte';
  import HousingPage from './lib/pages/functional_domain/HousingPage.svelte';
  import HousingUnitPage from './lib/pages/functional_domain/HousingUnitPage.svelte';
  import AddHousingUnitPage from './lib/pages/functional_domain/AddHousingUnitPage.svelte';
  import CourierPage from './lib/pages/functional_domain/CourierPage.svelte';
  import DeathcarePage from './lib/pages/functional_domain/DeathcarePage.svelte';
  import TransportPage from './lib/pages/functional_domain/TransportPage.svelte';
  import EnrichmentPage from './lib/pages/functional_domain/EnrichmentPage.svelte';
  import DependencyCarePage from './lib/pages/functional_domain/DependencyCarePage.svelte';
  import HomeCaregivingPage from './lib/pages/functional_domain/HomeCaregivingPage.svelte';
  import ChildCarePage from './lib/pages/functional_domain/ChildCarePage.svelte';
  import HomeChildcarePage from './lib/pages/functional_domain/HomeChildcarePage.svelte';
  import LeaderPoolsPage from './lib/pages/LeaderPoolsPage.svelte';
  import LeaderPoolDetailPage from './lib/pages/LeaderPoolDetailPage.svelte';
  import AddLeaderPoolPage from './lib/pages/AddLeaderPoolPage.svelte';
  import AssemblyPage from './lib/pages/AssemblyPage.svelte';
  import ConstitutionPage from './lib/pages/ConstitutionPage.svelte';
  import ApplicationsPage from './lib/pages/ApplicationsPage.svelte';
  import CalendarPage from './lib/pages/CalendarPage.svelte';
  import AddEventPage from './lib/pages/AddEventPage.svelte';
  import MessagesPage from './lib/pages/MessagesPage.svelte';
  import ComposeMessagePage from './lib/pages/ComposeMessagePage.svelte';
  import ReferendaPage from './lib/pages/ReferendaPage.svelte';
  import CreateReferendumPage from './lib/pages/CreateReferendumPage.svelte';
  import ReferendumDetailPage from './lib/pages/ReferendumDetailPage.svelte';
  import HealthcarePage from './lib/pages/functional_domain/HealthcarePage.svelte';
  import SettingsPage from './lib/pages/SettingsPage.svelte';
  import FirePage from './lib/pages/functional_domain/FirePage.svelte';
  import EducationPage from './lib/pages/functional_domain/EducationPage.svelte';
  import AdminPage from './lib/pages/AdminPage.svelte';
  import CreateAccountPage from './lib/pages/CreateAccountPage.svelte';
  import LoginPage from './lib/pages/LoginPage.svelte';
  import SetupPage from './lib/pages/SetupPage.svelte';
  import FunctionalUnitPage from './lib/pages/FunctionalUnitPage.svelte';
  import AddFunctionalUnitPage from './lib/pages/AddFunctionalUnitPage.svelte';

  function getPath() {
    return window.location.pathname;
  }

  let path = $state(getPath());

  const authPaths = ['/login', '/create-account', '/setup'];
  const hideNav = $derived(authPaths.includes(path));

  function getMemberId() {
    return new URLSearchParams(window.location.search).get('as') ?? '';
  }
  let currentMemberId = $state(getMemberId());

  function navigate(to: string) {
    history.pushState({}, '', to);
    path = to;
    currentMemberId = getMemberId();
    loadSession();
  }

  window.addEventListener('popstate', () => { path = getPath(); currentMemberId = getMemberId(); });

  // Session state
  let sessionHandle = $state<string | null>(null);
  let communityName = $state('Community');

  async function loadCommunityName() {
    try {
      const res = await fetch('/api/constitution');
      if (res.ok) {
        const doc = await res.json();
        communityName = doc.communityName ?? 'Community';
        document.title = communityName;
      }
    } catch { /* keep default */ }
  }

  async function loadSession() {
    try {
      const setupRes = await fetch('/api/setup');
      if (setupRes.ok) {
        const { isSetup } = await setupRes.json();
        if (!isSetup && path !== '/setup') {
          navigate('/setup');
          return;
        }
      }
      const res = await fetch('/api/auth/me');
      if (!res.ok) { sessionHandle = null; return; }
      const { memberId } = await res.json();
      // Fetch the member's handle
      const mRes = await fetch(`/api/members/${memberId}`);
      if (mRes.ok) {
        const m = await mRes.json();
        sessionHandle = m.handle ?? null;
      }
    } catch {
      sessionHandle = null;
    }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    sessionHandle = null;
    navigate('/login');
  }

  loadSession();
  loadCommunityName();
</script>

{#if !hideNav}
<nav>
  <span class="brand" role="button" tabindex="0" onclick={() => navigate('/')} onkeydown={(e) => e.key === 'Enter' && navigate('/')}>{communityName}</span>
  <button class:active={path.startsWith('/calendar')} onclick={() => navigate('/calendar')}>Calendar</button>
  <button class:active={path.startsWith('/marketplace')} onclick={() => navigate('/marketplace')}>Marketplace</button>
  <button class:active={path.startsWith('/community')} onclick={() => navigate('/community')}>Community</button>
  <div class="nav-spacer"></div>
  <button class:active={path.startsWith('/messages')} onclick={() => navigate('/messages')}>Messages</button>
  {#if sessionHandle}
    <span class="nav-handle">@{sessionHandle}</span>
    <button class="nav-logout" onclick={logout}>Log out</button>
  {:else}
    <button onclick={() => navigate('/login')}>Log in</button>
  {/if}
</nav>
{/if}

<main>
  {#if path === '/'}
    <HomePage />
  {:else if path === '/setup'}
    <SetupPage {navigate} />
  {:else if path === '/login'}
    <LoginPage {navigate} />
  {:else if path === '/create-account'}
    <CreateAccountPage {navigate} />
  {:else if path.startsWith('/admin')}
    <AdminPage {navigate} {path} />
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
  {:else if path === '/marketplace'}
    <MarketplacePage {navigate} />
  {:else if path === '/marketplace/new'}
    <AddPostPage {navigate} />
  {:else if path.startsWith('/marketplace/')}
    <PostPage id={path.slice('/marketplace/'.length)} {navigate} />
  {:else if path.startsWith('/community')}
    <CommonwealthPage {navigate} {path} />
  {:else if path === '/social-insurance'}
    <SocialInsurancePage {navigate} {path} />
  {:else if path === '/demographics'}
    <DemographicsPage />
  {:else if path === '/food'}
    <FoodPage {navigate} />
  {:else if path === '/communications'}
    <CommunicationsPage {navigate} {path} />
  {:else if path === '/agriculture'}
    <AgriculturePage {navigate} {path} />
  {:else if path === '/sanitation'}
    <SanitationPage {navigate} />
  {:else if path === '/water'}
    <WaterPage {navigate} />

  {:else if path === '/housing'}
    <HousingPage {navigate} />
  {:else if path === '/housing/new'}
    <AddHousingUnitPage {navigate} />
  {:else if path.startsWith('/housing/')}
    <HousingUnitPage id={path.slice('/housing/'.length)} {navigate} />
  {:else if path === '/courier'}
    <CourierPage {navigate} />
  {:else if path === '/deathcare'}
    <DeathcarePage {navigate} />
  {:else if path === '/transport'}
    <TransportPage {navigate} />
  {:else if path === '/enrichment'}
    <EnrichmentPage {navigate} />
  {:else if path === '/dependency-care'}
    <DependencyCarePage {navigate} />
  {:else if path === '/dependency-care/home-caregiving'}
    <HomeCaregivingPage {navigate} />
  {:else if path === '/child-care'}
    <ChildCarePage {navigate} />
  {:else if path === '/child-care/home-childcare'}
    <HomeChildcarePage {navigate} />
  {:else if path === '/healthcare'}
    <HealthcarePage {navigate} />
  {:else if path === '/settings'}
    <SettingsPage {navigate} />
  {:else if path === '/fire'}
    <FirePage {navigate} />
  {:else if path === '/leader-pools'}
    <LeaderPoolsPage {navigate} {path} />
  {:else if path === '/leader-pools/new'}
    <AddLeaderPoolPage {navigate} />
  {:else if path.startsWith('/leader-pools/')}
    <LeaderPoolDetailPage id={path.slice('/leader-pools/'.length)} {navigate} {path} />
  {:else if path === '/assembly'}
    <AssemblyPage />
  {:else if path === '/constitution'}
    <ConstitutionPage {navigate} {path} />
  {:else if path === '/education'}
    <EducationPage {navigate} />
  {:else if path.startsWith('/domains/') && path.endsWith('/units/new')}
    <AddFunctionalUnitPage domainId={path.split('/')[2]} {navigate} />
  {:else if path.startsWith('/domains/') && path.includes('/units/')}
    <FunctionalUnitPage domainId={path.split('/')[2]} unitId={path.split('/')[4]} {navigate} />
  {/if}
</main>
