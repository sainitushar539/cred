import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SettingsPage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState({ full_name: '', email: '', phone: '', title: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('full_name, email, phone, title')
      .eq('user_id', user.id).single()
      .then(({ data }) => {
        if (data) setProfile({
          full_name: data.full_name || '',
          email: data.email || user.email || '',
          phone: data.phone || '',
          title: data.title || '',
        });
      });
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles')
      .update({ full_name: profile.full_name, phone: profile.phone, title: profile.title })
      .eq('user_id', user.id);
    setSaving(false);
    if (error) { toast.error('Failed to save profile'); return; }
    toast.success('Profile saved!');
  };

  const fields = [
    { label: 'Full Name', key: 'full_name' as const },
    { label: 'Title', key: 'title' as const },
    { label: 'Email', key: 'email' as const, disabled: true },
    { label: 'Phone', key: 'phone' as const },
  ];

  return (
    <div className="animate-fade-up grid grid-cols-2 gap-4 max-lg:grid-cols-1">
      {/* Profile */}
      <div className="bg-card border border-border p-5">
        <div className="text-[9px] font-bold tracking-[2px] uppercase text-primary font-mono mb-3.5">Your Profile</div>
        {fields.map((f, i) => (
          <div key={i}>
            <label className="block text-[9px] font-bold tracking-[1.5px] uppercase text-muted-foreground mb-1 font-mono">{f.label}</label>
            <input
              value={profile[f.key]}
              disabled={f.disabled}
              onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
              className="w-full bg-foreground/[0.04] border border-border text-foreground font-body text-[13px] px-3 py-2.5 outline-none rounded-sm mb-3 transition-colors focus:border-primary disabled:opacity-50"
            />
          </div>
        ))}
        <button
          onClick={saveProfile}
          disabled={saving}
          className="bg-gradient-to-br from-primary to-gold-lt text-primary-foreground border-none font-body text-[11px] font-extrabold px-5 py-2.5 cursor-pointer tracking-[1.5px] uppercase rounded-sm transition-all hover:brightness-110 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>

      {/* Platform Info */}
      <div className="bg-card border border-border p-5">
        <div className="text-[9px] font-bold tracking-[2px] uppercase text-primary font-mono mb-3.5">Platform Info</div>
        <div className="space-y-2 text-xs text-foreground/65">
          <div>Platform: <span className="text-foreground font-semibold"><div>Platform: <span className="text-foreground font-semibold">Credibility Suite</span></div></span></div>
          <div>Built by: <span className="text-foreground font-semibold">She Wins With AI</span></div>
          <div>Support: <a href="mailto:charisma@shewinswithai.com" className="text-primary font-bold hover:text-gold-lt transition-colors">charisma@shewinswithai.com</a></div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
