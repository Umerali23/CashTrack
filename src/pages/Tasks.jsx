import { useState, useMemo } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    icon: Clock,
  },
  "in-progress": {
    label: "In Progress",
    color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    icon: AlertCircle,
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: CheckCircle2,
  },
};

const EMPTY_FORM = {
  title: "",
  description: "",
  clientId: "",
  assigneeId: "",
  status: "pending",
  dueDate: new Date().toISOString().slice(0, 10),
};

export default function Tasks({ ctx, toast, user }) {
  const { data, toDisplay, addTask, updateTask, deleteTask } = ctx;

  // ✅ CRASH FIX: Safe fallbacks
  const tasks = ctx.tasks || [];
  const clients = data?.clients || [];
  const team = data?.team || [];

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // If user is a member, only show their tasks. Admin sees all.
  const visibleTasks = useMemo(() => {
    let filtered = tasks;
    if (user?.role === "member") {
      filtered = tasks.filter((t) => t.assigneeId === user.id);
    }
    return filtered
      .filter((t) => filterStatus === "all" || t.status === filterStatus)
      .filter(
        (t) =>
          search.trim() === "" ||
          t.title.toLowerCase().includes(search.toLowerCase()),
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [tasks, filterStatus, search, user]);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({
      title: t.title,
      description: t.description,
      clientId: t.clientId || "",
      assigneeId: t.assigneeId || "",
      status: t.status,
      dueDate: t.dueDate,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return toast("Title is required", "error");
    const payload = {
      ...form,
      clientId: form.clientId || null,
      assigneeId: form.assigneeId || null,
    };
    if (editing) {
      updateTask(editing.id, payload);
      toast("Task updated", "success");
    } else {
      addTask(payload);
      toast("Task created", "success");
    }
    setModalOpen(false);
  };

  const handleDelete = (t) => {
    if (!window.confirm(`Delete task "${t.title}"?`)) return;
    deleteTask(t.id);
    toast("Task deleted", "info");
  };

  const handleStatusChange = (taskId, newStatus) => {
    updateTask(taskId, { status: newStatus });
    toast(`Task marked as ${STATUS_CONFIG[newStatus].label}`, "success");
  };

  // Calculate stats
  const stats = useMemo(() => {
    const total = visibleTasks.length;
    const completed = visibleTasks.filter(
      (t) => t.status === "completed",
    ).length;
    const inProgress = visibleTasks.filter(
      (t) => t.status === "in-progress",
    ).length;
    const pending = visibleTasks.filter((t) => t.status === "pending").length;
    return { total, completed, inProgress, pending };
  }, [visibleTasks]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Tasks & Projects
          </h1>
          <p className="text-ink-400 text-sm mt-1">
            {user?.role === "admin"
              ? "Manage team workload"
              : "Your assigned tasks"}
          </p>
        </div>
        <button
          onClick={openNew}
          className="btn-primary bg-white text-ink-950 hover:bg-ink-100 hover:scale-[1.02] shadow-lg shadow-white/10"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} /> New Task
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass rounded-xl p-4">
          <div className="text-[10px] uppercase tracking-wider text-ink-400">
            Total
          </div>
          <div className="text-xl font-bold mt-1">{stats.total}</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-[10px] uppercase tracking-wider text-ink-400">
            Completed
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            {stats.completed}
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-[10px] uppercase tracking-wider text-ink-400">
            In Progress
          </div>
          <div className="text-xl font-bold text-blue-400 mt-1">
            {stats.inProgress}
          </div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-[10px] uppercase tracking-wider text-ink-400">
            Pending
          </div>
          <div className="text-xl font-bold text-amber-400 mt-1">
            {stats.pending}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input w-auto"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="glass rounded-2xl overflow-hidden">
        {visibleTasks.length === 0 ? (
          <EmptyState
            title="No tasks found"
            description="Create a new task to get started."
            action={
              <button
                onClick={openNew}
                className="btn-primary bg-white text-ink-950 hover:bg-ink-100"
              >
                <Plus className="h-4 w-4" /> New Task
              </button>
            }
          />
        ) : (
          <div className="divide-y divide-ink-600/40">
            {visibleTasks.map((t) => {
              const client = clients.find((c) => c.id === t.clientId);
              const assignee = team.find((m) => m.id === t.assigneeId);
              const StatusIcon = STATUS_CONFIG[t.status].icon;
              const isOverdue =
                t.status !== "completed" && new Date(t.dueDate) < new Date();

              return (
                <div
                  key={t.id}
                  className="p-5 hover:bg-ink-700/20 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base truncate">
                          {t.title}
                        </h3>
                        {isOverdue && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                            Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-ink-400 line-clamp-2 mb-3">
                        {t.description || "No description provided."}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        {client && (
                          <span className="flex items-center gap-1.5 text-ink-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-ink-500" />
                            {client.name}
                          </span>
                        )}
                        {assignee && (
                          <span className="flex items-center gap-1.5 text-ink-300">
                            <span
                              className={`h-4 w-4 rounded-full bg-gradient-to-br ${assignee.avatarColor} flex items-center justify-center text-[8px] text-white font-bold`}
                            >
                              {assignee.name[0]}
                            </span>
                            {assignee.name}
                          </span>
                        )}
                        <span className="text-ink-500">
                          Due: {new Date(t.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <select
                        value={t.status}
                        onChange={(e) =>
                          handleStatusChange(t.id, e.target.value)
                        }
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer ${STATUS_CONFIG[t.status].color}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>

                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(t)}
                          className="p-1.5 rounded-lg hover:bg-ink-700/50 text-ink-400 hover:text-white cursor-pointer"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(t)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-ink-400 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Task" : "New Task"}
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-ink-300 mb-1.5 block">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input"
              placeholder="Design Homepage UI"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-300 mb-1.5 block">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="input min-h-[80px]"
              placeholder="Brief details about the task..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink-300 mb-1.5 block">
                Client
              </label>
              <select
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                className="input"
              >
                <option value="">— None —</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-300 mb-1.5 block">
                Assignee
              </label>
              <select
                value={form.assigneeId}
                onChange={(e) =>
                  setForm({ ...form, assigneeId: e.target.value })
                }
                className="input"
              >
                <option value="">— Unassigned —</option>
                {team.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink-300 mb-1.5 block">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="input"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-300 mb-1.5 block">
                Due Date
              </label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="input"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setModalOpen(false)}
              className="btn-ghost flex-1 border border-ink-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-primary flex-1 bg-white text-ink-950 hover:bg-ink-100 hover:scale-[1.01]"
            >
              {editing ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
