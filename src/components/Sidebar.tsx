import { useAuth } from '@/contexts/AuthContext';
import { Brain, LayoutDashboard, Building2, Zap, Landmark, Bot, BarChart3, Settings, LogOut, Users, Mail, MessageSquare } from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  onSignOut?: () => void;
}

const navItems = [
  { section: 'Overview', items: [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'businesses', icon: Building2, label: 'All Businesses' },
  ]},
  { section: 'CRM', items: [
    { id: 'leads', icon: Users, label: 'Leads CRM' },
    { id: 'nurture-bot', icon: MessageSquare, label: 'Nurture Bot' },
    { id: 'crm-email', icon: Mail, label: 'Email Outreach' },
  ]},
  { section: 'Capital', items: [
    { id: 'pipeline', icon: Zap, label: 'Pipeline', badge: '10' },
    { id: 'loans', icon: Landmark, label: 'Loan Queue', badge: '3', isWarning: true },
  ]},
  { section: 'Intelligence', items: [
    { id: 'agents', icon: Bot, label: 'AI Agents', badge: '6' },
  ]},
  { section: 'Reporting', items: [
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ]},
];

const Sidebar = ({ activePage, onNavigate, onSignOut }: SidebarProps) => {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <aside className="w-[260px] bg-background border-r border-border fixed top-0 left-0 bottom-0 flex flex-col z-[100]">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[hsl(230,80%,56%)] to-[hsl(260,70%,60%)] flex items-center justify-center shadow-md">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground leading-tight">
              Credibility Suite
            </div>
            <div className="text-[10px] text-muted-foreground tracking-wide">
              Fund Manager Portal
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="py-3 flex-1 overflow-y-auto px-3">
        {navItems.map(section => (
          <div key={section.section} className="mb-1">
            <div className="text-[10px] font-semibold tracking-widest text-muted-foreground/60 uppercase px-3 pt-4 pb-2">
              {section.section}
            </div>
            {section.items.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all duration-200 text-[13px] font-medium text-left rounded-xl mb-0.5 border-none ${
                    activePage === item.id
                      ? 'text-primary bg-primary/[0.08] shadow-[0_0_0_1px_hsl(var(--primary)/0.12)]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="w-[18px] h-[18px] flex-shrink-0" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      item.isWarning
                        ? 'bg-destructive/10 text-destructive'
                        : 'bg-primary/10 text-primary'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[hsl(230,80%,56%)] to-[hsl(260,70%,60%)] flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-foreground truncate">{displayName}</div>
            <div className="text-[10px] text-muted-foreground truncate">{user?.email}</div>
          </div>
        </div>
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="mt-3 w-full flex items-center justify-center gap-2 text-[11px] font-medium text-muted-foreground hover:text-destructive transition-all bg-secondary hover:bg-destructive/[0.06] border border-border rounded-xl py-2.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
