import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Search, Filter, Plus, Mail, Phone, Building2, ChevronDown, Eye, KeyRound, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Lead {
  id: string;
  contact_name: string;
  email: string;
  phone: string | null;
  company_name: string;
  industry: string | null;
  credit_score_range: string | null;
  amount_seeking: number | null;
  needs: string[] | null;
  funnel: string | null;
  status: string;
  created_at: string;
  responses: any;
}

const funnelStages = ['unassigned', 'new', 'contacted', 'qualified', 'nurturing', 'converted', 'lost'];

const statusColors: Record<string, string> = {
  new: 'bg-info/10 text-info',
  contacted: 'bg-primary/10 text-primary',
  qualified: 'bg-success/10 text-success',
  nurturing: 'bg-warning/10 text-warning',
  converted: 'bg-success/10 text-success',
  lost: 'bg-destructive/10 text-destructive',
  unassigned: 'bg-muted text-muted-foreground',
};

const LeadsCRMPage = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFunnel, setFilterFunnel] = useState('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newLead, setNewLead] = useState({ contact_name: '', email: '', phone: '', company_name: '', industry: '', amount_seeking: '' });
  const [creating, setCreating] = useState(false);

  const createLead = async () => {
    if (!newLead.contact_name || !newLead.email || !newLead.company_name) {
      toast.error('Name, email, and company are required');
      return;
    }
    setCreating(true);
    const { error } = await supabase.from('leads').insert({
      contact_name: newLead.contact_name,
      email: newLead.email.toLowerCase().trim(),
      phone: newLead.phone || null,
      company_name: newLead.company_name,
      industry: newLead.industry || null,
      amount_seeking: newLead.amount_seeking ? Number(newLead.amount_seeking) : null,
      funnel: 'new',
      status: 'new',
    });
    setCreating(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Lead created');
    setShowNew(false);
    setNewLead({ contact_name: '', email: '', phone: '', company_name: '', industry: '', amount_seeking: '' });
  };

  const generateCode = async (lead: Lead) => {
    setGeneratingCode(true);
    setGeneratedCode(null);
    setCopied(false);
    try {
      const { data, error } = await supabase.rpc('generate_approval_code', {
        _email: lead.email,
        _notes: `${lead.contact_name} — ${lead.company_name}`,
      });
      if (error) throw error;
      setGeneratedCode(data as string);
      toast.success('Approval code generated');
    } catch (e: any) {
      toast.error(e.message || 'Failed to generate code');
    } finally {
      setGeneratingCode(false);
    }
  };

  const copyCode = async () => {
    if (!generatedCode) return;
    await navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    fetchLeads();
    const channel = supabase
      .channel('leads-crm-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setLeads(prev => [payload.new as Lead, ...prev.filter(l => l.id !== (payload.new as Lead).id)]);
          toast.success(`New lead: ${(payload.new as Lead).contact_name}`);
        } else if (payload.eventType === 'UPDATE') {
          setLeads(prev => prev.map(l => l.id === (payload.new as Lead).id ? payload.new as Lead : l));
        } else if (payload.eventType === 'DELETE') {
          setLeads(prev => prev.filter(l => l.id !== (payload.old as Lead).id));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchLeads = async () => {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (data) setLeads(data as Lead[]);
    setLoading(false);
  };

  const updateLeadFunnel = async (leadId: string, funnel: string) => {
    await supabase.from('leads').update({ funnel }).eq('id', leadId);
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, funnel } : l));
  };

  const updateLeadStatus = async (leadId: string, status: string) => {
    await supabase.from('leads').update({ status }).eq('id', leadId);
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
  };

  const filtered = leads.filter(l => {
    const matchSearch = l.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFunnel = filterFunnel === 'all' || l.funnel === filterFunnel;
    return matchSearch && matchFunnel;
  });

  const funnelCounts = funnelStages.reduce((acc, stage) => {
    acc[stage] = leads.filter(l => l.funnel === stage).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="animate-fade-up space-y-4">
      {/* Funnel overview */}
      <div className="grid grid-cols-7 gap-2 max-lg:grid-cols-4 max-sm:grid-cols-2">
        {funnelStages.map(stage => (
          <button
            key={stage}
            onClick={() => setFilterFunnel(filterFunnel === stage ? 'all' : stage)}
            className={`bg-card border border-border p-3 text-left cursor-pointer transition-all rounded-lg ${
              filterFunnel === stage ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/30'
            }`}
          >
            <div className="text-xl font-bold text-primary font-display">{funnelCounts[stage] || 0}</div>
            <div className="text-[9px] uppercase tracking-[1px] text-muted-foreground font-mono capitalize">{stage}</div>
          </button>
        ))}
      </div>

      {/* Search & filters */}
      <div className="flex gap-3 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search leads by name, company, or email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-border text-foreground text-sm pl-10 pr-4 py-2.5 rounded-xl outline-none focus:border-primary transition-colors"
          />
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="bg-gradient-to-r from-primary to-[hsl(260,70%,60%)] text-white text-xs font-bold px-4 py-2.5 rounded-xl border-none cursor-pointer flex items-center gap-1.5 hover:shadow-md transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" /> New Lead
        </button>
      </div>

      {/* Leads table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-background border-b border-border flex justify-between items-center">
          <span className="text-[9px] font-bold tracking-[2px] uppercase text-primary font-mono">
            📋 All Leads ({filtered.length})
          </span>
          <span className="flex items-center gap-1.5 text-[9px] font-bold tracking-[2px] uppercase text-success font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Live
          </span>
        </div>
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm animate-pulse">Loading leads...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No leads found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Contact', 'Company', 'Industry', 'Amount', 'Funnel', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="bg-secondary/50 text-muted-foreground text-[8px] font-bold tracking-[2px] uppercase px-3 py-2.5 text-left border-b border-border font-mono">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(lead => (
                  <tr key={lead.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-3 py-2.5 border-b border-border/40">
                      <div className="text-xs font-bold text-foreground">{lead.contact_name}</div>
                      <div className="text-[10px] text-muted-foreground">{lead.email}</div>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-foreground/70 border-b border-border/40">{lead.company_name}</td>
                    <td className="px-3 py-2.5 text-[11px] text-muted-foreground border-b border-border/40">{lead.industry || '—'}</td>
                    <td className="px-3 py-2.5 text-xs font-bold text-primary font-mono border-b border-border/40">
                      {lead.amount_seeking ? `$${lead.amount_seeking.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-3 py-2.5 border-b border-border/40">
                      <select
                        value={lead.funnel || 'unassigned'}
                        onChange={e => updateLeadFunnel(lead.id, e.target.value)}
                        className="text-[10px] bg-secondary border border-border rounded-lg px-2 py-1 text-foreground cursor-pointer outline-none"
                      >
                        {funnelStages.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2.5 border-b border-border/40">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${statusColors[lead.status] || statusColors.unassigned}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[10px] text-muted-foreground font-mono border-b border-border/40">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2.5 border-b border-border/40">
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="text-primary text-[10px] font-bold bg-transparent border-none cursor-pointer hover:underline"
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lead detail modal */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-4" onClick={() => { setSelectedLead(null); setGeneratedCode(null); setCopied(false); }}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">{selectedLead.contact_name}</h2>
                <p className="text-sm text-muted-foreground">{selectedLead.company_name}</p>
              </div>
              <button onClick={() => { setSelectedLead(null); setGeneratedCode(null); setCopied(false); }} className="text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer text-lg">✕</button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <a href={`mailto:${selectedLead.email}`} className="text-primary no-underline">{selectedLead.email}</a>
              </div>
              {selectedLead.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{selectedLead.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{selectedLead.industry || 'No industry specified'}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Credit Score</div>
                  <div className="text-sm font-semibold text-foreground">{selectedLead.credit_score_range || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Amount Seeking</div>
                  <div className="text-sm font-semibold text-primary">{selectedLead.amount_seeking ? `$${selectedLead.amount_seeking.toLocaleString()}` : 'N/A'}</div>
                </div>
              </div>

              {selectedLead.needs && selectedLead.needs.length > 0 && (
                <div className="pt-3 border-t border-border">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Needs</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLead.needs.map((need, i) => (
                      <span key={i} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{need}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Approval code section */}
              <div className="pt-3 border-t border-border">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <KeyRound className="w-3 h-3" /> Client Portal Access
                </div>
                {generatedCode ? (
                  <div className="bg-success/10 border border-success/30 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <code className="text-base font-mono font-bold text-foreground tracking-widest">{generatedCode}</code>
                      <button
                        onClick={copyCode}
                        className="text-[10px] font-bold bg-background border border-border rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-primary text-foreground flex items-center gap-1"
                      >
                        {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      Share this code with <strong>{selectedLead.email}</strong>. They'll use it on the Client Login page to activate their account. Single-use.
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => generateCode(selectedLead)}
                    disabled={generatingCode}
                    className="w-full bg-gradient-to-r from-primary to-[hsl(260,70%,60%)] text-white text-xs font-bold py-2.5 rounded-xl border-none cursor-pointer hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    {generatingCode ? 'Generating...' : 'Approve & Generate Access Code'}
                  </button>
                )}
              </div>

              <div className="pt-3 border-t border-border flex gap-2">
                <select
                  value={selectedLead.status}
                  onChange={e => {
                    updateLeadStatus(selectedLead.id, e.target.value);
                    setSelectedLead({ ...selectedLead, status: e.target.value });
                  }}
                  className="flex-1 text-sm bg-secondary border border-border rounded-xl px-3 py-2 text-foreground cursor-pointer outline-none"
                >
                  {['new', 'contacted', 'qualified', 'nurturing', 'converted', 'lost'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <select
                  value={selectedLead.funnel || 'unassigned'}
                  onChange={e => {
                    updateLeadFunnel(selectedLead.id, e.target.value);
                    setSelectedLead({ ...selectedLead, funnel: e.target.value });
                  }}
                  className="flex-1 text-sm bg-secondary border border-border rounded-xl px-3 py-2 text-foreground cursor-pointer outline-none"
                >
                  {funnelStages.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Lead modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-4" onClick={() => setShowNew(false)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-bold text-foreground">Create New Lead</h2>
              <button onClick={() => setShowNew(false)} className="text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer text-lg">✕</button>
            </div>
            <div className="space-y-3">
              {[
                { k: 'contact_name', label: 'Contact Name *', type: 'text' },
                { k: 'email', label: 'Email *', type: 'email' },
                { k: 'phone', label: 'Phone', type: 'tel' },
                { k: 'company_name', label: 'Company *', type: 'text' },
                { k: 'industry', label: 'Industry', type: 'text' },
                { k: 'amount_seeking', label: 'Amount Seeking ($)', type: 'number' },
              ].map(f => (
                <div key={f.k}>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    value={(newLead as any)[f.k]}
                    onChange={e => setNewLead({ ...newLead, [f.k]: e.target.value })}
                    className="w-full bg-secondary border border-border text-foreground text-sm px-3 py-2 rounded-xl outline-none focus:border-primary transition-colors"
                  />
                </div>
              ))}
              <button
                onClick={createLead}
                disabled={creating}
                className="w-full bg-gradient-to-r from-primary to-[hsl(260,70%,60%)] text-white text-sm font-bold py-2.5 rounded-xl border-none cursor-pointer disabled:opacity-50 mt-2"
              >
                {creating ? 'Creating...' : 'Create Lead'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsCRMPage;
