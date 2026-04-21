import { Link } from 'react-router-dom';
import { Bell, Brain, ChevronDown, Menu, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface TopbarProps {
  title: string;
  subtitle?: string;
  onLoanQueue?: () => void;
  onMenuToggle?: () => void;
}

const Topbar = ({ title, subtitle, onLoanQueue, onMenuToggle }: TopbarProps) => {
  const { user } = useAuth();
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#1A2233] bg-[#0B0F19] px-4 py-3 md:px-7">
      <div className="flex min-w-0 items-center gap-3">
        {onMenuToggle && (
          <button onClick={onMenuToggle} className="rounded-md p-2 text-[#9CA3AF] transition-colors hover:bg-[#111827] hover:text-[#E5E7EB]" aria-label="Toggle menu">
            <Menu className="h-5 w-5" />
          </button>
        )}
        <Link to="/" className="group flex shrink-0 items-center gap-2 no-underline">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[#D4AF37]/25 bg-[#111827] transition-colors group-hover:border-[#D4AF37]/45">
            <Brain className="h-4 w-4 text-[#D4AF37]" />
          </div>
        </Link>
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold tracking-tight text-[#E5E7EB] md:text-base">{title}</h1>
          {subtitle && <p className="mt-0.5 truncate text-[11px] text-[#9CA3AF]">{subtitle}</p>}
        </div>
      </div>

      <div className="mx-8 hidden max-w-md flex-1 lg:flex">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5F6B7D]" />
          <input
            type="search"
            placeholder="Search businesses, leads, loans..."
            className="h-10 w-full rounded-md border border-[#1A2233] bg-[#111827] pl-10 pr-3 text-sm text-[#E5E7EB] outline-none transition placeholder:text-[#5F6B7D] focus:border-[#D4AF37]/45"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {onLoanQueue && (
          <button
            onClick={onLoanQueue}
            className="cursor-pointer rounded-md border border-[#D4AF37]/30 bg-[#D4AF37] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#0B0F19] transition-all hover:bg-[#C9A633] active:scale-[0.99]"
          >
            Review Loans
          </button>
        )}
        <button className="relative h-10 w-10 rounded-md border border-[#1A2233] bg-[#111827] text-[#9CA3AF] transition hover:border-[#D4AF37]/25 hover:text-[#E5E7EB]" aria-label="Notifications">
          <Bell className="m-auto h-4 w-4" />
          <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[#D4AF37]" />
        </button>
        <button className="hidden h-10 items-center gap-2 rounded-md border border-[#1A2233] bg-[#111827] px-2.5 text-left transition hover:border-[#D4AF37]/25 md:flex">
          <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#1A2233] text-[10px] font-bold text-[#E5E7EB]">{initials}</span>
          <span className="max-w-[120px] truncate text-xs font-medium text-[#E5E7EB]">{displayName}</span>
          <ChevronDown className="h-3.5 w-3.5 text-[#5F6B7D]" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
