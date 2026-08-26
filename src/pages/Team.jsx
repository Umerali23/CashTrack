import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { formatCurrency } from '../lib/currency';

const AVATAR_GRADIENTS = [
  'from-blue-400 to-indigo-500',
  'from-pink-400 to-rose-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-violet-400 to-fuchsia-500',
];

const EMPTY_FORM = { name: '', role: '', avatarColor: AVATAR_GRADIENTS[0] };

// Helper to generate credentials
const generateCredentials = (name) => {
  const cleanName = name.toLowerCase().replace(/\s+/g, '');
  const randomNum = Math.floor(Math.random() * 9000) + 1000;
  return {
    email: `${cleanName}${randomNum}@cashtrack.com`,
    password: `Cash${randomNum}!`
  };
};

export default function Team({ ctx, toast }) {
  const { createTeamMember } = useAuth();
  const { data, displayCurrency, toDisplay, addTeamMember, updateTeamMember, deleteTeamMember } = ctx;
  const currency = displayCurrency === 'ORIGINAL' ? 'PKR' : displayCurrency;
  const team = data?.profiles || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [generatedCreds, setGeneratedCreds] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [errors, setErrors] = useState({});

  const memberStats = useMemo(() => {
    return team.map((m) => {
      let earnings = 0;
      (data.transactions || []).forEach((t) => {
        if (t.assigneeId === m.id && t.type === 'income') earnings += toDisplay(t.amount, t.currency);
      });
      return { member: m, earnings };
    });
  }, [team, data.transactions, toDisplay]);

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, avatarColor: AVATAR_GRADIENTS[Math.floor(Math.random() * AVATAR_GRADIENTS.length)] });
    setGeneratedCreds(null);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (m) => {
    setEditing(m);
    setForm({ name: m.name, role: m.role, avatarColor: m.avatarColor });
    setGeneratedCreds(null);
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.role.trim()) e.role = 'Role is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    // If editing existing member, just update the profile table
    if (editing) {
      const payload = { ...form };
      await updateTeamMember(editing.id, payload);
      toast('Team member updated', 'success');
      setModalOpen(false);
      return;
    }

    // If NEW member, we must create their Auth account
    const creds = generateCredentials(form.name);
    const payload = { ...form, ...creds };

    // 1. Create the real user account
    const result = await createTeamMember(creds.email, creds.password, form.name, form.role, form.avatarColor);

    if (result.success) {
      toast('Member added! Credentials generated.', 'success');
      setGeneratedCreds(creds); // Show credentials to Admin
      // Note: Supabase might log you in as the new user.
      // If the screen changes, just log out and log back in as Admin!
    } else {
      toast(result.error || 'Failed to create user', 'error');
    }
  };

  const handleDelete = async (m) => {
    if (!window.confirm(`Remove "${m.name}"?`)) return;
    await deleteTeamMember(m.id);
    toast('Team member removed', 'info');
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Team</h1>
          <p className="text-ink-400 text-sm mt-1">{team.length} members collaborating</p>
        </div>
        <button onClick={openNew} className="btn-primary bg-white text-ink-950 hover:bg-ink-100 hover:scale-[1.02] shadow-lg shadow-white/10">
          <Plus className="h-4 w-4" strokeWidth={2.5} /> Add Member
        </button>
      </div>

      {team.length === 0 ? (
        <EmptyState title="No team members yet" description="Add your first team member." action={<button onClick={openNew} className="btn-primary bg-white text-ink-950 hover:bg-ink-100"><Plus className="h-4 w-4" /> Add Member</button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {memberStats.map(({ member, earnings }) => {
            const initials = member.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
            return (
              <div key={member.id} className="glass rounded-2xl p-5 group hover:border-ink-500 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${member.avatarColor} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>{initials}</div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(member)} className="p-1.5 rounded-lg hover:bg-ink-700/50 cursor-pointer"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDelete(member)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400 cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <div className="font-bold text-lg tracking-tight">{member.name}</div>
                <div className="text-xs text-ink-400 mb-4">{member.role}</div>

                {/* Display Auto-Generated Credentials */}
                {member.email && member.password && (
                  <div className="mb-4 p-3 rounded-xl bg-ink-900/60 border border-ink-600/50 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-ink-400 truncate mr-2">{member.email}</span>
                      <button onClick={() => copyToClipboard(member.email, 'email')} className="text-ink-300 hover:text-white cursor-pointer">
                        {copiedField === 'email' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-ink-400 font-mono truncate mr-2">{member.password}</span>
                      <button onClick={() => copyToClipboard(member.password, 'pass')} className="text-ink-300 hover:text-white cursor-pointer">
                        {copiedField === 'pass' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-ink-600/50">
                  <div className="text-[10px] uppercase tracking-wider text-ink-400 mb-1">Total Earnings</div>
                  <div className="text-xl font-bold text-emerald-400">{formatCurrency(earnings, currency, true)}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Member' : 'New Team Member'}>
        <div className="space-y-4">
          {/* Show Generated Credentials if just created */}
          {generatedCreds && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 animate-scale-in">
              <h3 className="text-sm font-bold text-emerald-400 mb-2">Credentials Generated!</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center bg-ink-900/50 p-2 rounded-lg">
                  <span className="text-ink-300 truncate mr-2">{generatedCreds.email}</span>
                  <button onClick={() => copyToClipboard(generatedCreds.email, 'modal-email')} className="text-emerald-400 cursor-pointer">{copiedField === 'modal-email' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button>
                </div>
                <div className="flex justify-between items-center bg-ink-900/50 p-2 rounded-lg">
                  <span className="text-ink-300 font-mono truncate mr-2">{generatedCreds.password}</span>
                  <button onClick={() => copyToClipboard(generatedCreds.password, 'modal-pass')} className="text-emerald-400 cursor-pointer">{copiedField === 'modal-pass' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}</button>
                </div>
              </div>
              <p className="text-[10px] text-ink-400 mt-2">Share these with the team member. They can use them to log in immediately.</p>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Full Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`input ${errors.name ? 'border-rose-500/60' : ''}`} placeholder="John Doe" />
            {errors.name && <div className="text-xs text-rose-400 mt-1">{errors.name}</div>}
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Role</label>
            <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={`input ${errors.role ? 'border-rose-500/60' : ''}`} placeholder="UI/UX Designer" />
            {errors.role && <div className="text-xs text-rose-400 mt-1">{errors.role}</div>}
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Avatar Color</label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_GRADIENTS.map((g) => (
                <button key={g} type="button" onClick={() => setForm({ ...form, avatarColor: g })} className={`h-9 w-9 rounded-xl bg-gradient-to-br ${g} transition-all cursor-pointer ${form.avatarColor === g ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'}`} />
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button onClick={() => setModalOpen(false)} className="btn-ghost flex-1 border border-ink-600">{generatedCreds ? 'Close' : 'Cancel'}</button>
            {!generatedCreds && <button onClick={handleSave} className="btn-primary flex-1 bg-white text-ink-950 hover:bg-ink-100 hover:scale-[1.01]">{editing ? 'Save Changes' : 'Add Member'}</button>}
          </div>
        </div>
      </Modal>
    </div>
  );
}