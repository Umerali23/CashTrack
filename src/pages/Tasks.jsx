import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, CheckCircle, Clock, AlertCircle, Calendar, User, Briefcase, Tag, Flag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';

const STATUS_CONFIG = {
  'pending': { label: 'Pending', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Clock },
  'in-progress': { label: 'In Progress', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: AlertCircle },
  'completed': { label: 'Completed', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle },
};

const PRIORITY_CONFIG = {
  'low': { label: 'Low', color: 'bg-slate-500/10 text-slate-400' },
  'medium': { label: 'Medium', color: 'bg-blue-500/10 text-blue-400' },
  'high': { label: 'High', color: 'bg-amber-500/10 text-amber-400', icon: Flag },
  'urgent': { label: 'Urgent', color: 'bg-rose-500/10 text-rose-400', icon: Flag },
};

export default function Tasks({ ctx, toast }) {
  const { user } = useAuth();
  
  // Extract data and functions from context
  const tasks = ctx.data?.tasks || [];
  const clients = ctx.data?.clients || [];
  const profiles = ctx.data?.profiles || [];
  const { addTask, updateTask, deleteTask } = ctx;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    clientId: '', 
    assigneeId: '', 
    compensation: '', 
    dueDate: '', 
    status: 'pending',
    priority: 'medium',
    tags: '',
    currency: 'USD'
  });

  // Filter tasks based on user role
  const visibleTasks = useMemo(() => {
    if (user?.role === 'admin') return tasks;
    return tasks.filter(t => t.assigneeId === user.id);
  }, [tasks, user]);

  // Get only team members (not admins) for task assignment
  const teamMembers = useMemo(() => {
    return profiles.filter(p => p.role !== 'admin');
  }, [profiles]);

  const openNew = () => {
    setEditingTask(null);
    setForm({ 
      title: '', 
      description: '', 
      clientId: '', 
      assigneeId: '', 
      compensation: '', 
      dueDate: '', 
      status: 'pending',
      priority: 'medium',
      tags: '',
      currency: 'USD'
    });
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      clientId: task.clientId || '',
      assigneeId: task.assigneeId || '',
      compensation: task.compensation || '',
      dueDate: task.dueDate || '',
      status: task.status || 'pending',
      priority: task.priority || 'medium',
      tags: Array.isArray(task.tags) ? task.tags.join(', ') : (task.tags || ''),
      currency: task.currency || 'USD'
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return toast('Task title is required', 'error');
    if (!form.clientId) return toast('Please select a client', 'error');
    if (!form.assigneeId) return toast('Please assign to a team member', 'error');
    
    try {
      const taskData = {
        title: form.title,
        description: form.description,
        status: form.status,
        dueDate: form.dueDate,
        compensation: parseFloat(form.compensation) || 0,
        currency: form.currency,
        clientId: form.clientId,
        assigneeId: form.assigneeId,
        priority: form.priority,
        tags: form.tags.split(',').map(t => t.trim()).filter(t => t)
      };

      if (editingTask) {
        await updateTask(editingTask.id, taskData);
        toast('Task updated successfully', 'success');
      } else {
        await addTask(taskData);
        toast('Task created and assigned', 'success');
      }
      setModalOpen(false);
    } catch (error) {
      console.error('Error saving task:', error);
      toast('Failed to save task', 'error');
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await updateTask(task.id, { ...task, status: newStatus });
      toast(`Task marked as ${newStatus}`, 'success');
    } catch (error) {
      console.error('Error updating status:', error);
      toast('Failed to update task status', 'error');
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Are you sure you want to delete "${task.title}"? This cannot be undone.`)) return;
    try {
      await deleteTask(task.id);
      toast('Task deleted successfully', 'info');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast('Failed to delete task', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            {user?.role === 'admin' ? 'All Tasks' : 'My Tasks'}
          </h1>
          <p className="text-ink-400 text-sm mt-1">
            {visibleTasks.length} task{visibleTasks.length !== 1 ? 's' : ''} found
          </p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={openNew} className="btn-primary bg-white text-ink-950 hover:bg-ink-100 hover:scale-[1.02] shadow-lg shadow-white/10">
            <Plus className="h-4 w-4" strokeWidth={2.5} /> New Task
          </button>
        )}
      </div>

      {/* Task Grid */}
      {visibleTasks.length === 0 ? (
        <EmptyState 
          title={user?.role === 'admin' ? "No tasks yet" : "No tasks assigned"} 
          description={user?.role === 'admin' ? "Create your first task to get started." : "You have no active tasks right now. Check back later!"} 
          action={user?.role === 'admin' ? <button onClick={openNew} className="btn-primary bg-white text-ink-950 hover:bg-ink-100"><Plus className="h-4 w-4" /> New Task</button> : null} 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleTasks.map((task) => {
            const StatusIcon = STATUS_CONFIG[task.status]?.icon || Clock;
            const client = clients.find(c => c.id === task.clientId);
            const assignee = profiles.find(p => p.id === task.assigneeId);
            const priorityConfig = PRIORITY_CONFIG[task.priority || 'medium'];

            return (
              <div key={task.id} className="glass rounded-2xl p-5 hover:border-ink-500 transition-all duration-300 flex flex-col h-full">
                {/* Top Row: Status & Priority Badges */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-2 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${STATUS_CONFIG[task.status]?.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {STATUS_CONFIG[task.status]?.label}
                    </span>
                    {priorityConfig && (
                      <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase flex items-center gap-1 ${priorityConfig.color}`}>
                        {priorityConfig.icon && <priorityConfig.icon className="h-2.5 w-2.5" />}
                        {priorityConfig.label}
                      </span>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-1">
                    {user?.role === 'admin' && (
                      <>
                        <button 
                          onClick={() => openEdit(task)} 
                          className="p-1.5 rounded-lg hover:bg-ink-700/50 text-ink-400 hover:text-white cursor-pointer transition-colors"
                          title="Edit task"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(task)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400 cursor-pointer transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                    {user?.role !== 'admin' && task.status !== 'completed' && (
                      <button 
                        onClick={() => handleStatusChange(task, 'completed')}
                        className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-md cursor-pointer transition-colors"
                      >
                        Mark Done
                      </button>
                    )}
                  </div>
                </div>

                {/* Task Content */}
                <h3 className="font-bold text-lg tracking-tight mb-1 line-clamp-1" title={task.title}>
                  {task.title}
                </h3>
                <p className="text-xs text-ink-400 mb-3 line-clamp-2 flex-grow">
                  {task.description || 'No description provided.'}
                </p>

                {/* Tags */}
                {task.tags && task.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {task.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        <Tag className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Meta Data */}
                <div className="space-y-2 pt-3 border-t border-ink-600/50 text-xs">
                  {client && (
                    <div className="flex items-center gap-2 text-ink-300">
                      <Briefcase className="h-3.5 w-3.5 text-ink-500 flex-shrink-0" />
                      <span className="truncate" title={client.name}>{client.name}</span>
                    </div>
                  )}
                  {assignee && (
                    <div className="flex items-center gap-2 text-ink-300">
                      <User className="h-3.5 w-3.5 text-ink-500 flex-shrink-0" />
                      <span>{assignee.name}</span>
                    </div>
                  )}
                  {task.dueDate && (
                    <div className="flex items-center gap-2 text-ink-300">
                      <Calendar className="h-3.5 w-3.5 text-ink-500 flex-shrink-0" />
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-emerald-400 font-bold pt-1">
                    ${task.compensation} {task.currency}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal (Admin Only) */}
      {user?.role === 'admin' && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingTask ? 'Edit Task' : 'Create New Task'}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Task Title *</label>
              <input 
                type="text" 
                value={form.title} 
                onChange={(e) => setForm({...form, title: e.target.value})} 
                className="input" 
                placeholder="e.g. Design Homepage" 
              />
            </div>
            
            <div>
              <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Description</label>
              <textarea 
                value={form.description} 
                onChange={(e) => setForm({...form, description: e.target.value})} 
                className="input h-20 resize-none" 
                placeholder="Task details, requirements, etc..." 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Client *</label>
                {clients.length === 0 && (
                  <div className="text-xs text-amber-400 mb-2 p-2 bg-amber-500/10 rounded border border-amber-500/20">
                    ⚠️ No clients found. Add a client first.
                  </div>
                )}
                <select 
                  value={form.clientId} 
                  onChange={(e) => setForm({...form, clientId: e.target.value})} 
                  className="input"
                  disabled={clients.length === 0}
                >
                  <option value="">Select Client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Assign To *</label>
                {teamMembers.length === 0 && (
                  <div className="text-xs text-amber-400 mb-2 p-2 bg-amber-500/10 rounded border border-amber-500/20">
                    ⚠️ No team members. Add a member first.
                  </div>
                )}
                <select 
                  value={form.assigneeId} 
                  onChange={(e) => setForm({...form, assigneeId: e.target.value})} 
                  className="input"
                  disabled={teamMembers.length === 0}
                >
                  <option value="">Select Member</option>
                  {teamMembers.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Priority</label>
                <select value={form.priority} onChange={(e) => setForm({...form, priority: e.target.value})} className="input">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Tags (comma separated)</label>
                <input 
                  type="text" 
                  value={form.tags} 
                  onChange={(e) => setForm({...form, tags: e.target.value})} 
                  className="input" 
                  placeholder="Design, Frontend, React" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Compensation</label>
                <input 
                  type="number" 
                  value={form.compensation} 
                  onChange={(e) => setForm({...form, compensation: e.target.value})} 
                  className="input" 
                  placeholder="0.00" 
                  min="0" 
                  step="0.01" 
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Due Date</label>
                <input 
                  type="date" 
                  value={form.dueDate} 
                  onChange={(e) => setForm({...form, dueDate: e.target.value})} 
                  className="input" 
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button 
                onClick={() => setModalOpen(false)} 
                className="btn-ghost flex-1 border border-ink-600 hover:bg-ink-800/50"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave} 
                className="btn-primary flex-1 bg-white text-ink-950 hover:bg-ink-100 disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={!form.title || !form.clientId || !form.assigneeId}
              >
                {editingTask ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}