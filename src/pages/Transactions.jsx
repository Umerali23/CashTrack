import { useState, useMemo, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  Download,
  Pencil,
  Trash2,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import { formatCurrency } from "../lib/currency";
import { exportToCSV } from "../lib/csv";

const CATEGORIES = [
  "Design Work",
  "Development",
  "Subscription",
  "Internet",
  "Food",
  "Software",
  "Other",
];

const EMPTY_FORM = {
  type: "income",
  amount: "",
  currency: "USD",
  clientId: "",
  assigneeId: "",
  category: "Development",
  date: new Date().toISOString().slice(0, 10),
  description: "",
  status: "paid",
};

export default function Transactions({ ctx, toast, newTxTrigger }) {
  const {
    data,
    displayCurrency,
    toDisplay,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = ctx;
  
  const currency = displayCurrency === "ORIGINAL" ? "PKR" : displayCurrency;
  const [filterType, setFilterType] = useState("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const openNewRef = useRef(null);

  // ✅ CRASH FIX: Safe fallbacks prevent white screens if data is missing
  const transactions = data?.transactions || [];
  const clients = data?.clients || [];
  const team = data?.team || [];

  const months = useMemo(() => {
    const set = new Set();
    transactions.forEach((t) => set.add(t.date.slice(0, 7)));
    return Array.from(set).sort().reverse();
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => filterType === "all" || t.type === filterType)
      .filter((t) => filterMonth === "all" || t.date.slice(0, 7) === filterMonth)
      .filter(
        (t) =>
          search.trim() === "" ||
          t.description.toLowerCase().includes(search.toLowerCase()) ||
          t.category.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, filterType, filterMonth, search]);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  };
  
  openNewRef.current = openNew;

  useEffect(() => {
    if (newTxTrigger > 0) openNewRef.current?.();
  }, [newTxTrigger]);

  useEffect(() => {
    const onKey = (e) => {
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.tagName === "SELECT"
      )
        return;
      if (e.key === "n" || e.key === "N") openNewRef.current?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openEdit = (t) => {
    setEditing(t);
    setForm({
      type: t.type,
      amount: String(t.amount),
      currency: t.currency,
      clientId: t.clientId || "",
      assigneeId: t.assigneeId || "",
      category: t.category,
      date: t.date,
      description: t.description,
      status: t.status,
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
      e.amount = "Enter a valid amount";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.date) e.date = "Date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const payload = {
      ...form,
      amount: Number(form.amount),
      clientId: form.clientId || null,
      assigneeId: form.assigneeId || null, // ✅ Ensure null instead of empty string
    };
    if (editing) {
      updateTransaction(editing.id, payload);
      toast("Transaction updated", "success");
    } else {
      addTransaction(payload);
      toast("Transaction added", "success");
    }
    setModalOpen(false);
  };

  const handleDelete = (t) => {
    if (!window.confirm(`Delete "${t.description}"? This cannot be undone.`))
      return;
    deleteTransaction(t.id);
    toast("Transaction deleted", "info");
  };

  const handleExport = () => {
    if (!filtered.length) return toast("Nothing to export", "error");
    exportToCSV(filtered, clients);
    toast(`Exported ${filtered.length} transactions`, "success");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Transactions
          </h1>
          <p className="text-ink-400 text-sm mt-1">
            {filtered.length} of {transactions.length} entries
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="btn-ghost border border-ink-600"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          <button
            onClick={openNew}
            className="btn-primary bg-white text-ink-950 hover:bg-ink-100 hover:scale-[1.02] shadow-lg shadow-white/10"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Add
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
          <input
            type="text"
            placeholder="Search description or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input w-auto"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="input w-auto"
          >
            <option value="all">All Months</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {new Date(m + "-01").toLocaleString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            title="No transactions found"
            description="Try adjusting your filters or add your first transaction."
            action={
              <button
                onClick={openNew}
                className="btn-primary bg-white text-ink-950 hover:bg-ink-100"
              >
                <Plus className="h-4 w-4" /> Add Transaction
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-ink-400 border-b border-ink-600/60">
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Description</th>
                  <th className="px-5 py-3 font-semibold">Client</th>
                  <th className="px-5 py-3 font-semibold">Assignee</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold text-right">Amount</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => {
                  const client = clients.find((c) => c.id === t.clientId);
                  const assignee = team.find((m) => m.id === t.assigneeId);
                  const isIncome = t.type === "income";
                  return (
                    <tr
                      key={t.id}
                      className="border-b border-ink-600/40 last:border-0 hover:bg-ink-700/20 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-ink-300 tabular-nums whitespace-nowrap">
                        {new Date(t.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "2-digit",
                        })}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isIncome
                                ? "bg-emerald-500/10 text-emerald-400"
                                : "bg-rose-500/10 text-rose-400"
                            }`}
                          >
                            {isIncome ? (
                              <ArrowDownRight className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <span className="font-medium truncate max-w-[220px]">
                            {t.description}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-ink-300 whitespace-nowrap">
                        {client?.name || <span className="text-ink-500">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-ink-300 whitespace-nowrap">
                        {assignee ? (
                          <span className="inline-flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full bg-gradient-to-br ${assignee.avatarColor}`} />
                            {assignee.name}
                          </span>
                        ) : (
                          <span className="text-ink-500">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-ink-700/60 border border-ink-600/60">
                          {t.category}
                        </span>
                      </td>
                      <td
                        className={`px-5 py-3.5 text-right font-bold tabular-nums whitespace-nowrap ${
                          isIncome ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(toDisplay(t.amount, t.currency), currency)}
                        {displayCurrency === "ORIGINAL" && (
                          <span className="text-[10px] text-ink-400 ml-1">
                            {t.currency}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${
                            t.status === "paid"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          <span className="h-1 w-1 rounded-full bg-current" />
                          {t.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex gap-1">
                          <button
                            onClick={() => openEdit(t)}
                            className="p-1.5 rounded-lg hover:bg-ink-700/50 text-ink-300 hover:text-white transition-colors cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(t)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-ink-300 hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Transaction" : "New Transaction"}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink-300 mb-1.5 block">
                Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["income", "expense"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm({ ...form, type: t })}
                    className={`py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                      form.type === t
                        ? t === "income"
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                          : "bg-rose-500/15 border-rose-500/40 text-rose-400"
                        : "border-ink-600 text-ink-400 hover:border-ink-500"
                    }`}
                  >
                    {t === "income" ? "Income" : "Expense"}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-300 mb-1.5 block">
                Currency
              </label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="input"
              >
                <option value="USD">USD ($)</option>
                <option value="PKR">PKR (Rs)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-300 mb-1.5 block">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className={`input ${errors.amount ? "border-rose-500/60" : ""}`}
              placeholder="0.00"
            />
            {errors.amount && (
              <div className="text-xs text-rose-400 mt-1">{errors.amount}</div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-ink-300 mb-1.5 block">
              Description
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`input ${errors.description ? "border-rose-500/60" : ""}`}
              placeholder="Landing page for client X"
            />
            {errors.description && (
              <div className="text-xs text-rose-400 mt-1">
                {errors.description}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                value={form.assigneeId || ""}
                onChange={(e) =>
                  setForm({ ...form, assigneeId: e.target.value || null })
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
            <div>
              <label className="text-xs font-semibold text-ink-300 mb-1.5 block">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-ink-300 mb-1.5 block">
                Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className={`input ${errors.date ? "border-rose-500/60" : ""}`}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-ink-300 mb-1.5 block">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="input"
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
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
              {editing ? "Save Changes" : "Add Transaction"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}