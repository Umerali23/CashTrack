import { useState, useMemo } from 'react';
import { Plus, X, Pencil, Trash2, Users } from 'lucide-react';
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

export default function Team({ ctx, toast }) {
  const { data, displayCurrency, toDisplay, addTeamMember, updateTeamMember, deleteTeamMember } = ctx;
  const currency = displayCurrency === 'ORIGINAL' ? 'PKR' : displayCurrency;

  // ✅ CRASH FIX: Safe fallbacks prevent white screens if data is missing
  const team = data?.team || [];
  const transactions = data?.transactions || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  // Calculate earnings per member safely
  const memberStats = useMemo(() => {
    return team.map((m) => {
      let earnings = 0;
      transactions.forEach((t) => {
        if (t.assigneeId === m.id && t.type === 'income') {
          earnings += toDisplay(t.amount, t.currency);
        }
      });
      return { member: m, earnings };
    });
  }, [team, transactions, toDisplay]);

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, avatarColor: AVATAR_GRADIENTS[Math.floor(Math.random() * AVATAR_GRADIENTS.length)] });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (m) => {
    setEditing(m);
    setForm({ name: m.name, role: m.role, avatarColor: m.avatarColor });
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

  const handleSave = () => {
    if (!validate()) return;
    if (editing) {
      updateTeamMember(editing.id, form);
      toast('Team member updated', 'success');
    } else {
      addTeamMember(form);
      toast('Team member added', 'success');
    }
    setModalOpen(false);
  };

  const handleDelete = (m) => {
    if (!window.confirm(`Remove "${m.name}" from the team? Their transactions will be kept but unassigned.`)) return;
    deleteTeamMember(m.id);
    toast('Team member removed', 'info');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Team</h1>
          <p className="text-ink-400 text-sm mt-1">{team.length} members collaborating</p>
        </div>
        <button onClick={openNew} className="btn-primary bg-white text-ink-950 hover:bg-ink-100 hover:scale-[1.02] shadow-lg shadow-white/10">
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          Add Member
        </button>
      </div>

      {team.length === 0 ? (
        <EmptyState
          title="No team members yet"
          description="Add your first team member to start tracking individual contributions."
          action={
            <button onClick={openNew} className="btn-primary bg-white text-ink-950 hover:bg-ink-100">
              <Plus className="h-4 w-4" /> Add Member
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {memberStats.map(({ member, earnings }) => {
            const initials = member.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
            return (
              <div key={member.id} className="glass rounded-2xl p-5 group hover:border-ink-500 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${member.avatarColor} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {initials}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(member)} className="p-1.5 rounded-lg hover:bg-ink-700/50 cursor-pointer">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(member)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400 cursor-pointer">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div className="font-bold text-lg tracking-tight">{member.name}</div>
                <div className="text-xs text-ink-400 mb-4">{member.role}</div>
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
          <div>
            <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Full Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={`input ${errors.name ? 'border-rose-500/60' : ''}`} placeholder="Laiba Khan" />
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
            <button onClick={() => setModalOpen(false)} className="btn-ghost flex-1 border border-ink-600">Cancel</button>
            <button onClick={handleSave} className="btn-primary flex-1 bg-white text-ink-950 hover:bg-ink-100 hover:scale-[1.01]">
              {editing ? 'Save Changes' : 'Add Member'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}