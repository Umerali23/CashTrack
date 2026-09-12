import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, CheckCircle, Clock, AlertCircle, Calendar, User, Briefcase, Tag, Flag, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../lib/currency';

const STATUS_CONFIG = {
  'pending': { label: 'Pending', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Clock },
  'in-progress': { label: 'In Progress', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: AlertCircle },
  'completed': { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle },
};

const PRIORITY_CONFIG = {
  'low': { label: 'Low', color: 'bg-slate-500/10 text-slate-500' },
  'medium': { label: 'Medium', color: 'bg-blue-500/10 text-blue-500' },
  'high': { label: 'High', color: 'bg-amber-500/10 text-amber-500', icon: Flag },
  'urgent': { label: 'Urgent', color: 'bg-rose-500/10 text-rose-500', icon: Flag },
};

export default function Tasks({ ctx, user }) {
  const { data, addTask, updateTask, deleteTask, displayCurrency } = ctx;
  const tasks = data?.tasks || [];
  const clients = data?.clients || [];
  const profiles = data?.profiles || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({ 
    title: '', description: '', clientId: '', assigneeId: '', 
    compensation: '', currency: 'USD', dueDate: '', 
    status: 'pending', priority: 'medium', tags: ''
  });

  const isDark = ctx.theme === 'dark' || ctx.theme === 'midnight';

  const visibleTasks = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return tasks;
    return tasks.filter(t => t.assigneeId === user.id);
  }, [tasks, user]);

  const teamMembers = useMemo(() => profiles.filter(p => p.role !== 'admin'), [profiles]);

  const openNew = () => {
    setEditingTask(null);
    setForm({ title: '', description: '', clientId: '', assigneeId: '', compensation: '', currency: 'USD', dueDate: '', status: 'pending', priority: 'medium', tags: '' });
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title || '', description: task.description || '', clientId: task.clientId || '',
      assigneeId: task.assigneeId || '', compensation: task.compensation?.toString() || '',
      currency: task.currency || 'USD', dueDate: task.dueDate || '',
      status: task.status || 'pending', priority: task.priority || 'medium',
      tags: Array.isArray(task.tags) ? task.tags.join(', ') : (task.tags || '')
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return alert('Task title is required');
    if (!form.clientId) return alert('Please select a client');
    if (!form.assigneeId) return alert('Please assign to a team member');
    
    try {
      const taskData = {
        title: form.title, description: form.description, status: form.status,
        dueDate: form.dueDate, compensation: parseFloat(form.compensation) || 0,
        currency: form.currency, clientId: form.clientId, assigneeId: form.assigneeId,
        priority: form.priority, tags: form.tags.split(',').map(t => t.trim()).filter(t => t)
      };

      if (editingTask) {
        await updateTask(editingTask.id, taskData);
      } else {
        await addTask(taskData);
      }
      setModalOpen(false);
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task');
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    await updateTask(task.id, { ...task, status: newStatus });
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    await deleteTask(task.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
            {user?.role === 'admin' ? 'All Tasks' : 'My Tasks'}
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            {visibleTasks.length} task{visibleTasks.length !== 1 ? 's' : ''} found
          </p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={openNew} className="btn-primary px-4 py-2.5 rounded-xl font-medium flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Task
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleTasks.map((task) => {
          const status = task.status || 'pending';
          const priority = task.priority || 'medium';
          const StatusIcon = STATUS_CONFIG[status]?.icon || Clock;
          const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
          const priorityConfig = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
          const client = clients.find(c => c.id === task.clientId);
          const assignee = profiles.find(p => p.id === task.assigneeId);
          let tagsArray = task.tags ? (Array.isArray(task.tags) ? task.tags : task.tags.split(',').map(t => t.trim())) : [];

          return (
            <div key={task.id} className="glass rounded-2xl p-5 flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div className="flex gap-2 flex-wrap">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${statusConfig.color}`}>
                    <StatusIcon className="h-3 w-3" />{statusConfig.label}
                  </span>
                  <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase ${priorityConfig.color}`}>
                    {priorityConfig.label}
                  </span>
                </div>
                <div className="flex gap-1">
                  {user?.role === 'admin' && (
                    <>
                      <button onClick={() => openEdit(task)} className="p-1.5 rounded-lg hover:bg-[var(--bg-input)] text-[var(--text-muted)]"><Pencil className="h-3.5 w-3.5" /></button>
                      <button onClick={() => handleDelete(task)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500"><Trash2 className="h-3.5 w-3.5" /></button>
                    </>
                  )}
                  {user?.role !== 'admin' && status !== 'completed' && (
                    <button onClick={() => handleStatusChange(task, 'completed')} className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">Mark Done</button>
                  )}
                </div>
              </div>

              <h3 className="font-bold text-lg text-[var(--text-primary)] mb-1">{task.title}</h3>
              <p className="text-xs text-[var(--text-muted)] mb-3 line-clamp-2 flex-grow">{task.description}</p>

              {tagsArray.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {tagsArray.map((tag, idx) => tag && (
                    <span key={idx} className="px-2 py-0.5 rounded text-[9px] font-medium bg-violet-500/10 text-violet-500 border border-violet-500/20">{tag}</span>
                  ))}
                </div>
              )}

              <div className="space-y-2 pt-3 border-t border-[var(--border-color)] text-xs">
                {client && <div className="flex items-center gap-2 text-[var(--text-secondary)]"><Briefcase className="h-3.5 w-3.5" />{client.name}</div>}
                {assignee && <div className="flex items-center gap-2 text-[var(--text-secondary)]"><User className="h-3.5 w-3.5" />{assignee.name}</div>}
                {task.dueDate && <div className="flex items-center gap-2 text-[var(--text-secondary)]"><Calendar className="h-3.5 w-3.5" />Due: {new Date(task.dueDate).toLocaleDateString()}</div>}
                <div className="font-bold text-emerald-500 pt-1">{formatCurrency(task.compensation || 0, task.currency || 'USD', displayCurrency, true)}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ✅ FIXED: Modal with proper centering, backdrop, and scrolling */}
      {user?.role === 'admin' && modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl my-8 animate-scale-in ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">
                {editingTask ? 'Edit Task' : 'Create New Task'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-lg hover:bg-[var(--bg-input)] text-[var(--text-muted)]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Task Title *</label>
                <input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="input w-full px-4 py-2.5 rounded-xl" placeholder="e.g. Design Homepage" />
              </div>
              
              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="input w-full px-4 py-2.5 rounded-xl h-20 resize-none" placeholder="Task details..." />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Client *</label>
                  <select value={form.clientId} onChange={(e) => setForm({...form, clientId: e.target.value})} className="input w-full px-4 py-2.5 rounded-xl">
                    <option value="">Select Client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Assign To *</label>
                  <select value={form.assigneeId} onChange={(e) => setForm({...form, assigneeId: e.target.value})} className="input w-full px-4 py-2.5 rounded-xl">
                    <option value="">Select Member</option>
                    {teamMembers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value})} className="input w-full px-4 py-2.5 rounded-xl">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Tags</label>
                  <input type="text" value={form.tags} onChange={(e) => setForm({...form, tags: e.target.value})} className="input w-full px-4 py-2.5 rounded-xl" placeholder="Design, React" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Price *</label>
                  <input type="number" value={form.compensation} onChange={(e) => setForm({...form, compensation: e.target.value})} className="input w-full px-4 py-2.5 rounded-xl" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Currency</label>
                  <select value={form.currency} onChange={(e) => setForm({...form, currency: e.target.value})} className="input w-full px-4 py-2.5 rounded-xl">
                    <option value="USD">USD ($)</option>
                    <option value="PKR">PKR (Rs)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={(e) => setForm({...form, dueDate: e.target.value})} className="input w-full px-4 py-2.5 rounded-xl" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[var(--text-secondary)] mb-1.5 block">Status</label>
                <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="input w-full px-4 py-2.5 rounded-xl">
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-[var(--border-color)] bg-[var(--bg-input)]/30 rounded-b-2xl">
              <button onClick={() => setModalOpen(false)} className="btn-ghost flex-1 px-4 py-2.5 rounded-xl">Cancel</button>
              <button onClick={handleSave} className="btn-primary flex-1 px-4 py-2.5 rounded-xl">
                {editingTask ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}