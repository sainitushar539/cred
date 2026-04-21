import { CSSProperties, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useIsMobile } from '@/hooks/use-mobile';
import Sidebar from '@/components/Sidebar';
import ClientSidebar from '@/components/ClientSidebar';
import Topbar from '@/components/Topbar';
import DashboardPage from './DashboardPage';
import BusinessesPage from './BusinessesPage';
import PipelinePage from './PipelinePage';
import LoansPage from './LoansPage';
import AnalyticsPage from './AnalyticsPage';
import SettingsPage from './SettingsPage';
import AgentsPage from './AgentsPage';
import ClientDashboard from './ClientDashboard';
import LeadsCRMPage from './LeadsCRMPage';
import LeadFinderPage from './LeadFinderPage';
import NurtureBotPage from './NurtureBotPage';
import CRMEmailPage from './CRMEmailPage';

const adminPageTitles: Record<string, { title: string; subtitle?: string }> = {
  dashboard: { title: 'Fund Manager Dashboard' },
  businesses: { title: 'All Businesses', subtitle: 'Complete fundability view' },
  leads: { title: 'Leads CRM', subtitle: 'Manage and nurture your leads' },
  'lead-finder': { title: 'Lead Finder', subtitle: 'Search and filter high-priority leads' },
  'nurture-bot': { title: 'Lead Nurture Bot', subtitle: 'AI-powered lead nurturing' },
  'crm-email': { title: 'Email Outreach', subtitle: 'Send personalized emails' },
  pipeline: { title: 'Fundability Pipeline', subtitle: 'Pipeline view of all businesses' },
  loans: { title: 'Loan Approval Queue', subtitle: 'Review and approve applications' },
  agents: { title: 'AI Agents', subtitle: 'AI-powered analysis' },
  analytics: { title: 'Analytics & Reporting', subtitle: 'Portfolio performance metrics' },
  settings: { title: 'Settings', subtitle: 'Profile and fund configuration' },
};

const clientPageTitles: Record<string, { title: string; subtitle?: string }> = {
  dashboard: { title: 'My Dashboard', subtitle: 'Track your progress to capital access' },
  agents: { title: 'AI Agents', subtitle: 'AI-powered analysis' },
  settings: { title: 'Settings', subtitle: 'Manage your profile' },
};

const DashboardLayout = () => {
  const [activePage, setActivePage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { signOut } = useAuth();
  const { isAdmin, loading } = useUserRole();
  const isMobile = useIsMobile();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground text-sm animate-pulse">Loading...</div>
      </div>
    );
  }

  const pageTitles = isAdmin ? adminPageTitles : clientPageTitles;
  const pageInfo = pageTitles[activePage] || pageTitles.dashboard;

  const handleNavigate = (page: string) => {
    setActivePage(page);
    setSidebarOpen(false);
  };

  const adminTheme = {
    '--background': '222 39% 7%',
    '--foreground': '220 13% 91%',
    '--card': '221 39% 11%',
    '--card-foreground': '220 13% 91%',
    '--secondary': '220 32% 15%',
    '--secondary-foreground': '220 13% 91%',
    '--muted': '220 32% 15%',
    '--muted-foreground': '220 9% 64%',
    '--border': '220 32% 15%',
    '--input': '220 32% 15%',
    '--primary': '45 65% 52%',
    '--primary-foreground': '222 39% 7%',
    '--accent': '217 91% 60%',
    '--ring': '45 65% 52%',
    '--success': '158 35% 48%',
    '--warning': '45 65% 52%',
    '--info': '217 62% 55%',
  } as CSSProperties;

  const sidebarWidth = sidebarCollapsed ? 84 : 280;

  return (
    <div
      className={`flex min-h-screen ${isAdmin ? 'admin-panel bg-[#070b13] text-foreground' : 'bg-secondary/50'}`}
      style={isAdmin ? adminTheme : undefined}
    >
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-[99] md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <div className={`${isMobile ? `fixed z-[100] transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}` : ''}`}>
        {isAdmin ? (
          <Sidebar
            activePage={activePage}
            onNavigate={handleNavigate}
            onSignOut={signOut}
            collapsed={sidebarCollapsed}
            onToggleCollapsed={() => setSidebarCollapsed((value) => !value)}
          />
        ) : (
          <ClientSidebar activePage={activePage} onNavigate={handleNavigate} onSignOut={signOut} />
        )}
      </div>

      <div
        className={`${isMobile ? 'w-full' : ''} flex-1 min-h-screen flex flex-col transition-[margin] duration-200`}
        style={!isMobile && isAdmin ? { marginLeft: sidebarWidth } : !isMobile ? { marginLeft: 260 } : undefined}
      >
        <Topbar
          title={pageInfo.title}
          subtitle={pageInfo.subtitle}
          onLoanQueue={isAdmin && activePage === 'dashboard' ? () => setActivePage('loans') : undefined}
          onMenuToggle={isMobile ? () => setSidebarOpen(!sidebarOpen) : undefined}
        />
        <main className={`${isAdmin ? 'p-5 md:p-7' : 'p-4 md:p-6'} flex-1 overflow-x-hidden`}>
          {isAdmin ? (
            <>
              {activePage === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
              {activePage === 'businesses' && <BusinessesPage />}
              {activePage === 'leads' && <LeadsCRMPage />}
              {activePage === 'lead-finder' && <LeadFinderPage />}
              {activePage === 'nurture-bot' && <NurtureBotPage />}
              {activePage === 'crm-email' && <CRMEmailPage />}
              {activePage === 'pipeline' && <PipelinePage />}
              {activePage === 'loans' && <LoansPage />}
              {activePage === 'agents' && <AgentsPage />}
              {activePage === 'analytics' && <AnalyticsPage />}
              {activePage === 'settings' && <SettingsPage />}
            </>
          ) : (
            <>
              {activePage === 'dashboard' && <ClientDashboard />}
              {activePage === 'agents' && <AgentsPage />}
              {activePage === 'settings' && <SettingsPage />}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
