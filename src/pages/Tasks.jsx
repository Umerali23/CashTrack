import { useState, useMemo } from 'react';
import { 
  Plus, Pencil, Trash2, CheckCircle, Clock, AlertCircle, 
  Calendar, User, Briefcase, Tag, Flag, Paperclip, FileText, Download, X 
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
  const { addTask, updateTask, deleteTask, uploadAttachment, deleteAttachment } = ctx;

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [viewingTask, setViewingTask] = useState(null); // ✅ New state for viewing task details
  const [uploading, setUploading] = useState(false);
  
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
    tags: '',
    attachments: []
  });

  const visibleTasks = useMemo(() => {
    if (!user) return [];
    if (user.role === 'admin') return tasks;
    return tasks.filter(t => t.assigneeId === user.id);
  }, [tasks, user]);

  const teamMembers = useMemo(() => profiles.filter(p => p.role !== 'admin'), [profiles]);

  const openNew = () => {
    setEditingTask(null);
    setForm({
      title: '', description: '', clientId: '', assigneeId: '', compensation: '',
      currency: 'USD', dueDate: '', status: 'pending', priority: 'medium', tags: '', attachments: []
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
      tags: Array.isArray(task.tags) ? task.tags.join(', ') : (task.tags || ''),
      attachments: task.attachments || []
    });
    setModalOpen(true);
  };

  // ✅ New: Open task detail view for team members
  const openTaskDetail = (task) => {
    setViewingTask(task);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const taskId = editingTask ? editingTask.id : `temp_${Date.now()}`;
      const newAttachment = await uploadAttachment(file, taskId);
      
      setForm(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), newAttachment]
      }));
      toast('File uploaded successfully', 'success');
    } catch (error) {
      console.error('Upload failed:', error);
      toast('Failed to upload file', 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveAttachment = async (attachmentId) => {
    if (editingTask) {
      await deleteAttachment(editingTask.id, attachmentId, form.attachments);
      toast('Attachment removed', 'info');
    } else {
      setForm(prev => ({
        ...prev,
        attachments: prev.attachments.filter(a => a.id !== attachmentId)
      }));
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast('Task title is required', 'error'); return; }
    if (!form.clientId) { toast('Please select a client', 'error'); return; }
    if (!form.assigneeId) { toast('Please assign to a team member', 'error'); return; }
    
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
        tags: form.tags.split(',').map(t => t.trim()).filter(t => t),
        attachments: form.attachments
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

  // ✅ New: Handle status change from detail view
  const handleStatusChangeFromDetail = async (newStatus) => {
    if (!viewingTask) return;
    try {
      await updateTask(viewingTask.id, { ...viewingTask, status: newStatus });
      toast(`Task marked as ${newStatus}`, 'success');
      setViewingTask({ ...viewingTask, status: newStatus }); // Update local state
    } catch (error) {
      toast('Failed to update task', 'error');
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    try {
      await updateTask(task.id, { ...task, status: newStatus });
      toast(`Task marked as ${newStatus}`, 'success');
    } catch (error) {
      toast('Failed to update task', 'error');
    }
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    try {
      await deleteTask(task.id);
      toast('Task deleted', 'info');
    } catch (error) {
      toast('Failed to delete task', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
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

      {visibleTasks.length === 0 ? (
        <EmptyState
          title={user?.role === 'admin' ? "No tasks yet" : "No tasks assigned"}
          description={user?.role === 'admin' ? "Create your first task to get started." : "You have no active tasks right now."}
          action={user?.role === 'admin' ? <button onClick={openNew} className="btn-primary bg-white text-ink-950 hover:bg-ink-100"><Plus className="h-4 w-4" /> Create Task</button> : null}
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
                      <StatusIcon className="h-3 w-3" />{statusConfig.label}
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
                    {/* ✅ Team members see "View Details" instead of "Mark Done" */}
                    {user?.role !== 'admin' && (
                      <button 
                        onClick={() => openTaskDetail(task)} 
                        className="text-[10px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2 py-1 rounded-md transition-colors"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>

                {/* ✅ Make task card clickable for team members */}
                <div 
                  className={user?.role !== 'admin' ? 'cursor-pointer' : ''}
                  onClick={() => user?.role !== 'admin' && openTaskDetail(task)}
                >
                  <h3 className="font-bold text-lg tracking-tight mb-1 line-clamp-1" title={title}>{title}</h3>
                  <p className="text-xs text-ink-400 mb-3 line-clamp-2 flex-grow whitespace-pre-wrap break-words">{description}</p>
                </div>

                {tagsArray.length > 0 && tagsArray[0] && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {tagsArray.map((tag, tagIndex) => (
                      tag && (
                        <span key={tagIndex} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20">
                          <Tag className="h-2.5 w-2.5" />{tag}
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

                {/* Attachments Section */}
                {task.attachments && task.attachments.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-ink-600/50">
                    <div className="text-[10px] uppercase tracking-wider text-ink-400 mb-2 flex items-center gap-1">
                      <Paperclip className="h-3 w-3" /> Attachments ({task.attachments.length})
                    </div>
                    <div className="space-y-1.5">
                      {task.attachments.map(att => (
                        <a 
                          key={att.id} 
                          href={att.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 rounded-lg bg-ink-900/40 hover:bg-ink-800/60 transition-colors group"
                        >
                          <FileText className="h-3.5 w-3.5 text-ink-400 group-hover:text-emerald-400 flex-shrink-0" />
                          <span className="text-xs text-ink-300 truncate flex-1">{att.name}</span>
                          <Download className="h-3.5 w-3.5 text-ink-500 group-hover:text-emerald-400 flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ NEW: Task Detail Modal for Team Members */}
      {viewingTask && user?.role !== 'admin' && (
        <Modal open={!!viewingTask} onClose={() => setViewingTask(null)} title="Task Details" size="lg">
          <div className="space-y-6">
            {/* Task Header */}
            <div>
              <h2 className="text-2xl font-bold text-ink-100 mb-2">{viewingTask.title}</h2>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5 ${STATUS_CONFIG[viewingTask.status]?.color}`}>
                  {(() => { const Icon = STATUS_CONFIG[viewingTask.status]?.icon || Clock; return <Icon className="h-3 w-3" />; })()}
                  {STATUS_CONFIG[viewingTask.status]?.label}
                </span>
                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${PRIORITY_CONFIG[viewingTask.priority]?.color}`}>
                  {PRIORITY_CONFIG[viewingTask.priority]?.label} Priority
                </span>
              </div>
            </div>

            {/* Task Meta Info */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-ink-900/40 border border-ink-600/50">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-ink-400 mb-1">Client</div>
                <div className="text-sm font-medium text-ink-200">
                  {clients.find(c => c.id === viewingTask.clientId)?.name || 'Unknown'}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-ink-400 mb-1">Assigned To</div>
                <div className="text-sm font-medium text-ink-200">
                  {profiles.find(p => p.id === viewingTask.assigneeId)?.name || 'Unassigned'}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-ink-400 mb-1">Due Date</div>
                <div className="text-sm font-medium text-ink-200">
                  {viewingTask.dueDate ? new Date(viewingTask.dueDate).toLocaleDateString() : 'Not set'}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-ink-400 mb-1">Price</div>
                <div className="text-sm font-bold text-emerald-400">
                  {viewingTask.currency === 'USD' ? '$' : 'Rs'} {viewingTask.compensation || 0} {viewingTask.currency || 'USD'}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="text-xs font-semibold text-ink-300 mb-2">Description</div>
              <div className="p-4 rounded-xl bg-ink-900/40 border border-ink-600/50 text-sm text-ink-200 whitespace-pre-wrap break-words min-h-[100px]">
                {viewingTask.description || 'No description provided.'}
              </div>
            </div>

            {/* Tags */}
            {viewingTask.tags && (() => {
              const tagsArray = Array.isArray(viewingTask.tags) ? viewingTask.tags : viewingTask.tags.split(',').map(t => t.trim());
              return tagsArray.length > 0 && tagsArray[0] ? (
                <div>
                  <div className="text-xs font-semibold text-ink-300 mb-2">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {tagsArray.map((tag, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20">
                        <Tag className="h-3 w-3" />{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            {/* Attachments */}
            {viewingTask.attachments && viewingTask.attachments.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-ink-300 mb-2 flex items-center gap-2">
                  <Paperclip className="h-4 w-4" /> Attachments ({viewingTask.attachments.length})
                </div>
                <div className="space-y-2">
                  {viewingTask.attachments.map(att => (
                    <a 
                      key={att.id} 
                      href={att.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-xl bg-ink-900/40 border border-ink-600/50 hover:bg-ink-800/60 transition-colors group"
                    >
                      <FileText className="h-5 w-5 text-ink-400 group-hover:text-emerald-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-ink-200 truncate">{att.name}</div>
                        <div className="text-xs text-ink-400">{(att.size / 1024).toFixed(1)} KB</div>
                      </div>
                      <Download className="h-5 w-5 text-ink-500 group-hover:text-emerald-400 flex-shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* ✅ Status Change Section - Only for team members */}
            <div className="pt-4 border-t border-ink-600/50">
              <div className="text-xs font-semibold text-ink-300 mb-3">Update Task Status</div>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(STATUS_CONFIG).map(([key, config]) => {
                  const Icon = config.icon;
                  const isSelected = viewingTask.status === key;
                  return (
                    <button
                      key={key}
                      onClick={() => handleStatusChangeFromDetail(key)}
                      disabled={isSelected}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold uppercase transition-all ${
                        isSelected
                          ? `${config.color} cursor-not-allowed opacity-100`
                          : 'bg-ink-900/40 border border-ink-600/50 text-ink-300 hover:bg-ink-800/60 hover:border-ink-500'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Admin Create/Edit Modal */}
      {user?.role === 'admin' && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingTask ? 'Edit Task' : 'Create New Task'} size="md">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Task Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="input" placeholder="e.g. Design Homepage" />
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Description</label>
              <textarea 
                value={form.description} 
                onChange={(e) => setForm({...form, description: e.target.value})} 
                className="input h-24 resize-none" 
                placeholder="Task details, links, requirements..." 
              />
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
                <input type="number" value={form.compensation} onChange={(e) => setForm({...form, compensation: e.target.value})} className="input" placeholder="0.00" min="0" step="0.01" />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Currency</label>
                <select value={form.currency} onChange={(e) => setForm({...form, currency: e.target.value})} className="input">
                  <option value="USD">USD ($)</option>
                  <option value="PKR">PKR (Rs)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Attachments</label>
              <label className="btn-ghost w-full border border-ink-600 cursor-pointer flex items-center justify-center gap-2 py-2.5">
                <Paperclip className="h-4 w-4" />
                {uploading ? 'Uploading...' : 'Choose File'}
                <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
              </label>
              {form.attachments && form.attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {form.attachments.map(att => (
                    <div key={att.id} className="flex items-center justify-between p-2 rounded-lg bg-ink-900/40 border border-ink-600/50">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText className="h-4 w-4 text-ink-400 flex-shrink-0" />
                        <span className="text-xs text-ink-300 truncate">{att.name}</span>
                        <span className="text-[10px] text-ink-500 flex-shrink-0">({(att.size / 1024).toFixed(1)} KB)</span>
                      </div>
                      <button onClick={() => handleRemoveAttachment(att.id)} className="p-1 rounded hover:bg-rose-500/10 text-rose-400 transition-colors">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-ink-300 mb-1.5 block">Status</label>
                <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} className="input">
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