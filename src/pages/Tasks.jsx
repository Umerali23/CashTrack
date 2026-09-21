import { useState, useMemo } from 'react';
import { 
  Plus, Pencil, Trash2, CheckCircle, Clock, AlertCircle, 
  Calendar, User, Briefcase, Tag, Flag, X, Filter 
} from 'lucide-react';
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
  const tasks = ctx.data?.tasks || [];
  const clients = ctx.data?.clients || [];
  const profiles = ctx.data?.profiles || [];
  const { addTask, updateTask, deleteTask } = ctx;

  // Filter State
  const [filters, setFilters] = useState({
    status: [],
    priority: [],
    assignee: [],
    client: []
  });
  const [showFilters, setShowFilters] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    clientId: '',
    assigneeId: '',
    compensation: '',
    currency: 'USD',
    dueDate: '',
    status: 'pending',
    priority: 'medium',
    tags: ''
  });

  const visibleTasks = useMemo(() => {
    if (!user) return [];
    let filtered = user.role === 'admin' ? [...tasks] : tasks.filter(t => t.assigneeId === user.id);

    // Apply Status Filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(t => filters.status.includes(t.status));
    }

    // Apply Priority Filter
    if (filters.priority.length > 0) {
      filtered = filtered.filter(t => filters.priority.includes(t.priority));
    }

    // Apply Assignee Filter
    if (filters.assignee.length > 0) {
      filtered = filtered.filter(t => filters.assignee.includes(t.assigneeId));
    }

    // Apply Client Filter
    if (filters.client.length > 0) {
      filtered = filtered.filter(t => filters.client.includes(t.clientId));
    }

    return filtered;
  }, [tasks, user, filters]);

  const teamMembers = useMemo(() => profiles.filter(p => p.role !== 'admin'), [profiles]);

  // Filter Handlers
  const toggleFilter = (type, value) => {
    setFilters(prev => {
      const current = prev[type];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  const clearFilters = () => {
    setFilters({ status: [], priority: [], assignee: [], client: [] });
  };

  const hasActiveFilters = 
    filters.status.length > 0 ||
    filters.priority.length > 0 ||
    filters.assignee.length > 0 ||
    filters.client.length > 0;

  const getActiveFilterCount = () => {
    return filters.status.length + filters.priority.length + 
           filters.assignee.length + filters.client.length;
  };

  // Task Modal Handlers
  const openNew = () => {
    setEditingTask(null);
    setForm({
      title: '',
      description: '',
      clientId: '',
      assigneeId: '',
      compensation: '',
      currency: 'USD',
      dueDate: '',
      status: 'pending',
      priority: 'medium',
      tags: ''
    });
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title || '',
      description: task.description || '',
      clientId: task.clientId || '',
      assigneeId: task.assigneeId || '',
      compensation: task.compensation?.toString() || '',
      currency: task.currency || 'USD',
      dueDate: task.dueDate || '',
      status: task.status || 'pending',
      priority: task.priority || 'medium',
      tags: Array.isArray(task.tags) ? task.tags.join(', ') : (task.tags || '')
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast('Task title is required', 'error');
      return;
    }
    if (!form.clientId) {
      toast('Please select a client', 'error');
      return;
    }
    if (!form.assigneeId) {
      toast('Please assign to a team member', 'error');
      return;
    }
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
        toast('Task created successfully', 'success');
      }
      setModalOpen(false);
    } catch (error) {
      console.error('Error saving task:', error);
      toast('Failed to save task: ' + error.message, 'error');
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await updateTask(task.id, { ...task, status: newStatus });
      toast(`Task marked as ${newStatus}`, 'success');
    } catch (error) {
      console.error('Error updating status:', error);
      toast('Failed to update task', 'error');
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    try {
      await deleteTask(task.id);
      toast('Task deleted', 'info');
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
            {hasActiveFilters && ` (filtered from ${tasks.length})`}
          </p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={openNew} className="btn-primary bg-white text-ink-950 hover:bg-ink-100 hover:scale-[1.02] shadow-lg shadow-white/10">
            <Plus className="h-4 w-4" strokeWidth={2.5} /> New Task
          </button>
        )}
      </div>

      {/* Filter Bar - No Search */}
      <div className="glass rounded-2xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
              showFilters || hasActiveFilters
                ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                : 'border-ink-600 text-ink-300 hover:bg-ink-800/50'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            {getActiveFilterCount() > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-bold">
                {getActiveFilterCount()}
              </span>
            )}
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/50 text-rose-400 hover:bg-rose-500/10 transition-all"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-ink-600/50">
            {/* Status Filter */}
            <div>
              <label className="text-xs font-semibold text-ink-300 mb-2 block">Status</label>
              <div className="space-y-2">
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => toggleFilter('status', key)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      filters.status.includes(key)
                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                        : 'bg-ink-900/40 border border-ink-600/50 text-ink-300 hover:bg-ink-800/50'
                    }`}
                  >
                    <config.icon className="h-3.5 w-3.5" />
                    {config.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="text-xs font-semibold text-ink-300 mb-2 block">Priority</label>
              <div className="space-y-2">
                {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => toggleFilter('priority', key)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      filters.priority.includes(key)
                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                        : 'bg-ink-900/40 border border-ink-600/50 text-ink-300 hover:bg-ink-800/50'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      key === 'low' ? 'bg-slate-400' :
                      key === 'medium' ? 'bg-blue-400' :
                      key === 'high' ? 'bg-amber-400' : 'bg-rose-400'
                    }`} />
                    {config.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignee Filter */}
            <div>
              <label className="text-xs font-semibold text-ink-300 mb-2 block">Assignee</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {teamMembers.map(member => (
                  <button
                    key={member.id}
                    onClick={() => toggleFilter('assignee', member.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      filters.assignee.includes(member.id)
                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                        : 'bg-ink-900/40 border border-ink-600/50 text-ink-300 hover:bg-ink-800/50'
                    }`}
                  >
                    <div className={`h-5 w-5 rounded-full bg-gradient-to-br ${member.avatarColor} flex items-center justify-center text-[8px] font-bold text-white`}>
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <span className="truncate">{member.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Client Filter */}
            <div>
              <label className="text-xs font-semibold text-ink-300 mb-2 block">Client</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {clients.map(client => (
                  <button
                    key={client.id}
                    onClick={() => toggleFilter('client', client.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      filters.client.includes(client.id)
                        ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                        : 'bg-ink-900/40 border border-ink-600/50 text-ink-300 hover:bg-ink-800/50'
                    }`}
                  >
                    <div className={`h-5 w-5 rounded-full bg-gradient-to-br ${client.avatarColor} flex items-center justify-center text-[8px] font-bold text-white`}>
                      {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <span className="truncate">{client.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-ink-600/50">
            {filters.status.map(status => (
              <span key={status} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                {STATUS_CONFIG[status].label}
                <button onClick={() => toggleFilter('status', status)} className="hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {filters.priority.map(priority => (
              <span key={priority} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                {PRIORITY_CONFIG[priority].label}
                <button onClick={() => toggleFilter('priority', priority)} className="hover:text-white">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            {filters.assignee.map(assigneeId => {
              const member = profiles.find(p => p.id === assigneeId);
              return member ? (
                <span key={assigneeId} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                  {member.name}
                  <button onClick={() => toggleFilter('assignee', assigneeId)} className="hover:text-white">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : null;
            })}
            {filters.client.map(clientId => {
              const client = clients.find(c => c.id === clientId);
              return client ? (
                <span key={clientId} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                  {client.name}
                  <button onClick={() => toggleFilter('client', clientId)} className="hover:text-white">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Task Grid */}
      {visibleTasks.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? "No tasks match your filters" : (user?.role === 'admin' ? "No tasks yet" : "No tasks assigned")}
          description={hasActiveFilters 
            ? "Try adjusting your filters to see more tasks."
            : (user?.role === 'admin' ? "Create your first task to get started." : "You have no active tasks right now.")
          }
          action={!hasActiveFilters && user?.role === 'admin' ? (
            <button onClick={openNew} className="btn-primary bg-white text-ink-950 hover:bg-ink-100">
              <Plus className="h-4 w-4" /> Create Task
            </button>
          ) : null}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleTasks.map((task, index) => {
            const status = task.status || 'pending';
            const priority = task.priority || 'medium';
            const title = task.title || 'Untitled Task';
            const description = task.description || 'No description';
            const compensation = task.compensation || 0;
            const currency = task.currency || 'USD';
            const dueDate = task.dueDate;
            const StatusIcon = STATUS_CONFIG[status]?.icon || Clock;
            const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
            const priorityConfig = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
            const client = clients.find(c => c.id === task.clientId);
            const assignee = profiles.find(p => p.id === task.assigneeId);
            let tagsArray = [];
            if (task.tags) {
              tagsArray = Array.isArray(task.tags) ? task.tags : task.tags.split(',').map(t => t.trim());
            }

            return (
              <div key={task.id || index} className="glass rounded-2xl p-5 hover:border-ink-500 transition-all duration-300 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-2 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${statusConfig.color}`}>
                      <StatusIcon className="h-3 w-3" />
                      {statusConfig.label}
                    </span>
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-bold uppercase ${priorityConfig.color}`}>
                      {priorityConfig.label}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {user?.role === 'admin' && (
                      <>
                        <button onClick={() => openEdit(task)} className="p-1.5 rounded-lg hover:bg-ink-700/50 text-ink-400 hover:text-white transition-colors" title="Edit">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDelete(task)} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400 transition-colors" title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                    {user?.role !== 'admin' && status !== 'completed' && (
                      <button onClick={() => handleStatusChange(task, 'completed')} className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-md transition-colors">
                        Mark Done
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-lg tracking-tight mb-1 line-clamp-1" title={title}>{title}</h3>
                <p className="text-xs text-ink-400 mb-3 line-clamp-2 flex-grow">{description}</p>

                {tagsArray.length > 0 && tagsArray[0] && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {tagsArray.map((tag, tagIndex) => (
                      tag && (
                        <span key={tagIndex} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20">
                          <Tag className="h-2.5 w-2.5" />
                          {tag}
                        </span>
                      )
                    ))}
                  </div>
                )}

                <div className="space-y-2 pt-3 border-t border-ink-600/50 text-xs">
                  {client && (
                    <div className="flex items-center gap-2 text-ink-300">
                      <Briefcase className="h-3.5 w-3.5 text-ink-500 flex-shrink-0" />
                      <span className="truncate">{client.name}</span>
                    </div>
                  )}
                  {assignee && (
                    <div className="flex items-center gap-2 text-ink-300">
                      <User className="h-3.5 w-3.5 text-ink-500 flex-shrink-0" />
                      <span>{assignee.name}</span>
                    </div>
                  )}
                  {dueDate && (
                    <div className="flex items-center gap-2 text-ink-300">
                      <Calendar className="h-3.5 w-3.5 text-ink-500 flex-shrink-0" />
                      <span>Due: {new Date(dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-emerald-400 font-bold pt-1">
                    {currency === 'USD' ? '$' : 'Rs'} {compensation} {currency}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {user?.role === 'admin' && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingTask ? 'Edit Task' : 'Create New Task'}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Task Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="input" placeholder="e.g. Design Homepage" />
            </div>
            
            <div>
              <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="input h-20 resize-none" placeholder="Task details..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Client *</label>
                <select value={form.clientId} onChange={(e) => setForm({...form, clientId: e.target.value})} className="input">
                  <option value="">Select Client</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Assign To *</label>
                <select value={form.assigneeId} onChange={(e) => setForm({...form, assigneeId: e.target.value})} className="input">
                  <option value="">Select Member</option>
                  {teamMembers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
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
                <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Tags</label>
                <input type="text" value={form.tags} onChange={(e) => setForm({...form, tags: e.target.value})} className="input" placeholder="Design, React" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Price *</label>
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
                <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Currency</label>
                <select
                  value={form.currency}
                  onChange={(e) => setForm({...form, currency: e.target.value})}
                  className="input"
                >
                  <option value="USD">USD ($)</option>
                  <option value="PKR">PKR (Rs)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({...form, status: e.target.value})}
                  className="input"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Due Date</label>
                <input type="date" value={form.dueDate} onChange={(e) => setForm({...form, dueDate: e.target.value})} className="input" />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setModalOpen(false)} className="btn-ghost flex-1 border border-ink-600">Cancel</button>
              <button onClick={handleSave} className="btn-primary flex-1 bg-white text-ink-950 hover:bg-ink-100">
                {editingTask ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}