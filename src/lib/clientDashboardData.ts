import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export const PENDING_FUNDING_SNAPSHOT_KEY = 'cs_pending_funding_snapshot';

export interface FundingSnapshot {
  businessName: string;
  email?: string;
  phone?: string;
  website?: string;
  credit: string;
  revenue: string;
  timeInBusiness: string;
  score: number;
  source?: string;
}

const defaultChecklist = [
  { label: 'Business License / Registration', complete: false },
  { label: 'EIN / Tax ID', complete: false },
  { label: 'Business Bank Account', complete: false },
  { label: 'Bank Statements (3 months)', complete: false },
  { label: 'Tax Returns (2 years)', complete: false },
  { label: 'Profit & Loss Statement', complete: false },
  { label: 'Balance Sheet', complete: false },
  { label: 'Business Plan', complete: false },
  { label: 'Financial Projections', complete: false },
  { label: 'Operating Agreement', complete: false },
  { label: 'Debt Schedule', complete: false },
  { label: 'Personal Financial Statement', complete: false },
  { label: 'Insurance Documentation', complete: false },
];

const getTopGap = (snapshot: FundingSnapshot) => {
  if (snapshot.score >= 80) return 'Documentation';
  if (snapshot.score >= 60) return 'Funding package readiness';
  if (snapshot.revenue === 'pre' || snapshot.revenue === 'under100k') return 'Revenue';
  return 'Credit & Documentation';
};

export const savePendingFundingSnapshot = (snapshot: FundingSnapshot) => {
  try {
    localStorage.setItem(PENDING_FUNDING_SNAPSHOT_KEY, JSON.stringify({ ...snapshot, savedAt: Date.now() }));
  } catch { /* ignore */ }
};

export const consumePendingFundingSnapshot = () => {
  try {
    const raw = localStorage.getItem(PENDING_FUNDING_SNAPSHOT_KEY);
    if (!raw) return null;
    localStorage.removeItem(PENDING_FUNDING_SNAPSHOT_KEY);
    return JSON.parse(raw) as FundingSnapshot & { savedAt?: number };
  } catch {
    return null;
  }
};

export const persistFundingSnapshot = async (userId: string, snapshot: FundingSnapshot) => {
  const payload = {
    user_id: userId,
    name: snapshot.businessName || 'My Business',
    industry: null,
    capital_need: null,
    checklist: defaultChecklist as unknown as Json,
    score: snapshot.score || 10,
    status: snapshot.score >= 80 ? 'capital-ready' : 'assessment',
    top_gap: getTopGap(snapshot),
    loan_product: snapshot.score >= 80 ? 'standard' : snapshot.score >= 60 ? 'revenue-based' : 'building',
    notes: [
      `Credit: ${snapshot.credit}`,
      `Revenue: ${snapshot.revenue}`,
      `Time: ${snapshot.timeInBusiness}`,
      `Website: ${snapshot.website || ''}`,
      `Source: ${snapshot.source || 'homepage_ai_flow'}`,
    ].join('. '),
  };

  const { data: existing } = await supabase
    .from('businesses')
    .select('id')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.id) {
    return supabase.from('businesses').update(payload).eq('id', existing.id);
  }

  return supabase.from('businesses').insert(payload);
};
