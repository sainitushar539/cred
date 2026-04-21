import { Link } from 'react-router-dom';
import { Sparkles, Brain, Menu } from 'lucide-react';

interface TopbarProps {
  title: string;
  subtitle?: string;
  onLoanQueue?: () => void;
  onMenuToggle?: () => void;
}

const Topbar = ({ title, subtitle, onLoanQueue, onMenuToggle }: TopbarProps) => {
  return (
    <header className="bg-background/80 backdrop-blur-xl border-b border-border px-4 md:px-6 py-3 md:py-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button onClick={onMenuToggle} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-foreground" aria-label="Toggle menu">
            <Menu className="w-5 h-5" />
          </button>
        )}
        <Link to="/" className="no-underline flex items-center gap-2 shrink-0 group">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-primary to-[hsl(260,70%,60%)] flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
            <Brain className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
          </div>
        </Link>
        <div className="min-w-0">
          <h1 className="text-sm md:text-base font-bold text-foreground tracking-tight truncate">{title}</h1>
          {subtitle && <p className="text-[10px] md:text-[11px] text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <div className="hidden sm:flex items-center gap-1.5 bg-primary/[0.06] rounded-full text-primary text-[10px] font-semibold px-3 py-1.5">
          <Sparkles className="w-3 h-3" />
          AI Active
        </div>
        {onLoanQueue && (
          <button
            onClick={onLoanQueue}
            className="bg-gradient-to-r from-primary to-[hsl(260,70%,60%)] text-white border-none text-[11px] font-semibold px-4 py-2 cursor-pointer rounded-lg transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            Review Loans →
          </button>
        )}
      </div>
    </header>
  );
};

export default Topbar;
