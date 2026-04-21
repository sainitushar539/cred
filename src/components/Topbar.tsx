import { Link } from 'react-router-dom';
import { Bell, Brain, ChevronDown, Menu, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface TopbarProps {
  title: string;
  subtitle?: string;
  onLoanQueue?: () => void;
  onMenuToggle?: () => void;
  variant?: 'admin' | 'client';
}

const Topbar = ({ title, subtitle, onLoanQueue, onMenuToggle, variant = 'admin' }: TopbarProps) => {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const isAdmin = variant === 'admin';

  return (
    <header className={`sticky top-0 z-50 flex items-center justify-between px-4 py-3 md:px-7 border-b ${isAdmin ? 'border-[#1A2233] bg-[#0B0F19]' : 'border-[hsl(var(--border))] bg-white/90 backdrop-blur-xl'}`}>
      <div className="flex min-w-0 items-center gap-3">
        {onMenuToggle && (
          <button onClick={onMenuToggle} className={`rounded-md p-2 transition-colors ${isAdmin ? 'text-[#9CA3AF] hover:bg-[#111827] hover:text-[#E5E7EB]' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`} aria-label="Toggle menu">
            <Menu className="h-5 w-5" />
          </button>
        )}
        <Link to="/" className="group flex shrink-0 items-center gap-2 no-underline">
          <div className={`flex h-8 w-8 items-center justify-center rounded-md border transition-colors ${isAdmin ? 'border-[#D4AF37]/25 bg-[#111827] group-hover:border-[#D4AF37]/45' : 'border-slate-200 bg-white group-hover:border-primary/35'}`}>
            <Brain className={`h-4 w-4 ${isAdmin ? 'text-[#D4AF37]' : 'text-primary'}`} />
          </div>
        </Link>
        <div className="min-w-0">
          <h1 className={`truncate text-sm font-semibold tracking-tight md:text-base ${isAdmin ? 'text-[#E5E7EB]' : 'text-slate-900'}`}>{title}</h1>
          {subtitle && <p className={`mt-0.5 truncate text-[11px] ${isAdmin ? 'text-[#9CA3AF]' : 'text-slate-500'}`}>{subtitle}</p>}
        </div>
      </div>

      <div className="mx-8 hidden max-w-md flex-1 lg:flex">
        <div className="relative w-full">
          <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${isAdmin ? 'text-[#5F6B7D]' : 'text-slate-400'}`} />
          <input
            type="search"
            placeholder="Search businesses, leads, loans..."
            className={`h-10 w-full rounded-md pl-10 pr-3 text-sm outline-none transition ${isAdmin ? 'border border-[#1A2233] bg-[#111827] text-[#E5E7EB] placeholder:text-[#5F6B7D] focus:border-[#D4AF37]/45' : 'border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary/35'}`}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {onLoanQueue && (
          <button
            onClick={onLoanQueue}
            className={`cursor-pointer rounded-md px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] transition-all active:scale-[0.99] ${isAdmin ? 'border border-[#D4AF37]/30 bg-[#D4AF37] text-[#0B0F19] hover:bg-[#C9A633]' : 'border border-primary/20 bg-primary text-primary-foreground hover:brightness-110'}`}
          >
            Review Loans
          </button>
        )}
        <button className={`relative h-10 w-10 rounded-md border transition ${isAdmin ? 'border-[#1A2233] bg-[#111827] text-[#9CA3AF] hover:border-[#D4AF37]/25 hover:text-[#E5E7EB]' : 'border-slate-200 bg-white text-slate-500 hover:border-primary/25 hover:text-slate-900'}`} aria-label="Notifications">
          <Bell className="m-auto h-4 w-4" />
          <span className={`absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full ${isAdmin ? 'bg-[#D4AF37]' : 'bg-primary'}`} />
        </button>
        <button className={`hidden h-10 items-center gap-2 rounded-md border px-2.5 text-left transition md:flex ${isAdmin ? 'border-[#1A2233] bg-[#111827] hover:border-[#D4AF37]/25' : 'border-slate-200 bg-white hover:border-primary/25'}`}>
          <span className={`flex h-7 w-7 items-center justify-center rounded-sm text-[10px] font-bold ${isAdmin ? 'bg-[#1A2233] text-[#E5E7EB]' : 'bg-slate-100 text-slate-700'}`}>{initials}</span>
          <span className={`max-w-[120px] truncate text-xs font-medium ${isAdmin ? 'text-[#E5E7EB]' : 'text-slate-900'}`}>{displayName}</span>
          <ChevronDown className={`h-3.5 w-3.5 ${isAdmin ? 'text-[#5F6B7D]' : 'text-slate-400'}`} />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
