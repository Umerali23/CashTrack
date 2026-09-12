import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Copy, Check, X, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../lib/currency';

const AVATAR_GRADIENTS = [
  'from-blue-400 to-indigo-500', 'from-pink-400 to-rose-500',
  'from-emerald-400 to-teal-500', 'from-amber-400 to-orange-500',
  'from-violet-400 to-fuchsia-500',
];

const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
  return Array.from({length: 12}, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
};

const generateEmail = (name) => {
  const cleanName = name.toLowerCase().replace(/\s+/g, '');
  return `${cleanName}${Math.floor(Math.random() * 9000) + 1000}@cashtrack.com`;
};

export default function Team({ ctx, user }) {
  const { data, displayCurrency, toDisplay, updateTeamMember, deleteTeamMember, addTeamMember } = ctx;
  const team = data?.profiles?.filter(p => p.role !== 'admin') || [];
  const tasks = data?.tasks || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', role: '', avatarColor: AVATAR_GRADIENTS[0] });
  const [generatedCreds, setGeneratedCreds] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isDark = ctx.theme === 'dark' || ctx.theme === 'midnight';

  const memberStats = useMemo(() => {
    return team.map((m) => {
      const completedTasks = tasks.filter(t => t.assigneeId === m.id && t.status === 'completed');
      const earnings = completedTasks.reduce((sum, t) => sum + toDisplay(parseFloat(t.compensation) || 0, t.currency || 'USD'), 0);
      return { member: m, earnings, completedTasksCount: completedTasks.length };
    });
  }, [team, tasks, toDisplay]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', role: '', avatarColor: AVATAR_GRADIENTS[Math.floor(Math.random() * AVATAR_GRADIENTS.length)] });
    setGeneratedCreds(null);
    setErrors({});
    setShowPassword(false);
    setModalOpen(true);
  };

  const openEdit = (m) => {
    setEditing(m);
    setForm({ name: m.name, role: m.role, avatarColor: m.avatarColor });
    setGeneratedCreds(null);
    setErrors({});
    setModalOpen(true);
  };

  const handleSave = async () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.role.trim()) e.role = 'Role is required';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    try {
      if (editing) {
        await updateTeamMember(editing.id, form);
        setModalOpen(false);
      } else {
        const password = generatePassword();
        const email = generateEmail(form.name);
        const result = await addTeamMember({ email, password, name: form.name, role: form.role, avatarColor: form.avatarColor });
        if (result.success) {
          setGeneratedCreds({ email, password });
        }
      }
    } catch (error) {
      alert(error.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (m) => {
    if (!window.confirm(`Remove "${m.name}" from the team?`)) return;
    await deleteTeamMember(m.id);
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">Team</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">{team.length} members collaborating</p>
        </div>
        <button onClick={openNew} className="btn-primary px-4 py-2.5 rounded-xl font-medium flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Member
        </button>
      </div>

      {team.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="h-16 w-16 rounded-full bg-[var(--bg-input)] flex items-center justify-center mx-auto mb-4">
            <Plus className="h-8 w-8 text-[var(--text-muted)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-1">No team members yet</h3>
          <p className="text-[var(--text-muted)] text-sm mb-4">Add your first team member to start collaborating.</p>
          <button onClick={openNew} className="btn-primary px-4 py-2 rounded-xl font-medium inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {memberStats.map(({ member, earnings, completedTasksCount }) => {
            const initials = (member.name || 'User').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
            return (
              <div key={member.id} className="glass rounded-2xl p-5 group hover:border-[var(--accent-color)] transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${member.avatarColor} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {initials}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(member)} className="p-1.5 rounded-lg hover:bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(member)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 cursor-pointer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                
                <div className="font-bold text-lg text-[var(--text-primary)] tracking-tight">{member.name || 'Unnamed'}</div>
                <div className="text-xs text-[var(--text-muted)] mb-4">{member.role || 'Team Member'}</div>

                {member.email && (
                  <div className="mb-4 p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)]">
                    <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Login Email</div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text-secondary)] truncate mr-2 flex-1">{member.email}</span>
                      <button onClick={() => copyToClipboard(member.email, `email-${member.id}`)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer flex-shrink-0">
                        {copiedField === `email-${member.id}` ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-[var(--border-color)]">
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Total Earnings</div>
                  <div className="text-xl font-bold text-emerald-500">{formatCurrency(earnings, 'USD', displayCurrency, true)}</div>
                  <div className="text-xs text-[var(--text-muted)] mt-1">{completedTasksCount} completed task{completedTasksCount !== 1 ? 's' : ''}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Member Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 animate-scale-in ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">{editing ? 'Edit Member' : 'New Team Member'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg hover:bg-[var(--bg-input)] text-[var(--text-muted)]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {generatedCreds && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mb-4 animate-scale-in">
                <h3 className="text-sm font-bold text-emerald-500 mb-2">✅ Member Created!</h3>
                <p className="text-xs text-[var(--text-secondary)] mb-3">Share these credentials:</p>
                <div className="space-y-2">
                  <div className="bg-[var(--bg-input)] p-2 rounded-lg flex items-center justify-between">
                    <span className="text-xs text-[var(--text-primary)] font-mono truncate mr-2">{generatedCreds.email}</span>
                    <button onClick={() => copyToClipboard(generatedCreds.email, 'modal-email')} className="text-emerald-500 cursor-pointer flex-shrink-0">
                      {copiedField === 'modal-email' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="bg-[var(--bg-input)] p-2 rounded-lg flex items-center justify-between">
                    <span className="text-xs text-[var(--text-primary)] font-mono truncate mr-2">
                      {showPassword ? generatedCreds.password : '••••••••••••'}
                    </span>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => setShowPassword(!showPassword)} className="text-[var(--text-muted)] cursor-pointer">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button onClick={() => copyToClipboard(generatedCreds.password, 'modal-pass')} className="text-emerald-500 cursor-pointer">
                        {copiedField === 'modal-pass' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-amber-500 mt-2">️ Save these credentials securely!</p>
              </div>
            )}

            {!generatedCreds && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Full Name *</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`input w-full px-4 py-2.5 rounded-xl ${errors.name ? 'border-rose-500' : ''}`} placeholder="John Doe" />
                  {errors.name && <div className="text-xs text-rose-500 mt-1">{errors.name}</div>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Role *</label>
                  <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={`input w-full px-4 py-2.5 rounded-xl ${errors.role ? 'border-rose-500' : ''}`} placeholder="UI/UX Designer" />
                  {errors.role && <div className="text-xs text-rose-500 mt-1">{errors.role}</div>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Avatar Color</label>
                  <div className="flex flex-wrap gap-2">
                    {AVATAR_GRADIENTS.map((g) => (
                      <button key={g} type="button" onClick={() => setForm({ ...form, avatarColor: g })} className={`h-9 w-9 rounded-xl bg-gradient-to-br ${g} transition-all cursor-pointer ${form.avatarColor === g ? 'ring-2 ring-emerald-500 scale-110' : 'opacity-70 hover:opacity-100'}`} />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setModalOpen(false)} className="btn-ghost flex-1 px-4 py-2.5 rounded-xl" disabled={loading}>Cancel</button>
                  <button onClick={handleSave} className="btn-primary flex-1 px-4 py-2.5 rounded-xl disabled:opacity-50" disabled={loading}>
                    {loading ? 'Creating...' : (editing ? 'Save Changes' : 'Add Member')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}