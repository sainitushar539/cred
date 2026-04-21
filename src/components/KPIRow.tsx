import { businesses } from '@/data/businesses';

const KPIRow = () => {
  const total = businesses.length;
  const fundable = businesses.filter(b => b.score >= 75).length;
  const gaps = businesses.reduce((acc, b) => acc + b.checklist.filter(c => !c.complete).length, 0);
  const deployed = businesses.filter(b => b.status === 'funded').reduce((a, b) => a + b.capitalNeed, 0);
  const avgScore = Math.round(businesses.reduce((a, b) => a + b.score, 0) / total);

  const kpis = [
    { value: total, label: 'Total Businesses', change: '↑ +6 this month', color: 'text-primary', border: 'border-t-primary' },
    { value: fundable, label: 'Fundable (Score 75+)', change: '↑ 3 new this week', color: 'text-success', border: 'border-t-success' },
    { value: gaps, label: 'Critical Doc Gaps', change: '↓ Blocking capital', color: 'text-foreground', border: 'border-t-destructive' },
    { value: `$${(deployed / 1000).toFixed(0)}K`, label: 'Capital Deployed', change: '↑ Revolving fund', color: 'text-info', border: 'border-t-info' },
    { value: avgScore, label: 'Avg Fundability Score', change: '↑ +9 pts this month', color: 'text-primary', border: 'border-t-primary' },
  ];

  return (
    <div className="grid grid-cols-5 gap-3 mb-4 max-lg:grid-cols-3">
      {kpis.map((k, i) => (
        <div key={i} className={`bg-card border border-border border-t-[3px] ${k.border} p-4`}>
          <div className={`font-display text-[32px] font-bold ${k.color} leading-none mb-0.5`}>
            {k.value}
          </div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-[1.5px] font-mono">{k.label}</div>
          <div className="text-[10px] text-success mt-0.5 font-semibold">{k.change}</div>
        </div>
      ))}
    </div>
  );
};

export default KPIRow;
