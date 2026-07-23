"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown, Download, Eye,
  Pencil, Plus, Search, Tags, Trash2, Upload, X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { apiClient, parseApiError } from "@/services/api-client";

type RecordRow = { id: number; data: Record<string, unknown>; created_at: string };
type Contact = {
  name: string; email: string; phone_no: string; tags: string[];
  list: string; score: number; status: string; activity: string;
};

const blank: Contact = { name: "", email: "", phone_no: "", tags: [], list: "General", score: 50, status: "Active", activity: "Just added" };

function val(data: Record<string, unknown>, keys: string[], fallback = "") {
  for (const k of keys) { const v = data[k]; if (v !== undefined && v !== null && String(v).trim()) return String(v); }
  return fallback;
}
function normalize(row: RecordRow): Contact {
  const rawTags = row.data.tags;
  const src = row.data.__source__;
  return {
    name:     val(row.data, ["name","full_name","Name","Full Name"], "Unnamed contact"),
    email:    val(row.data, ["email","Email","email_address"]),
    phone_no: val(row.data, ["phone_no","phone","Phone","mobile_no","mobile","Phone No"]),
    tags:     Array.isArray(rawTags) ? rawTags.map(String) : val(row.data, ["tags","Tags"]).split(",").map(t => t.trim()).filter(Boolean),
    list:     val(row.data, ["list","List","segment"], "General"),
    score:    Number(val(row.data, ["score","Score"], "0")) || 0,
    status:   val(row.data, ["status","Status"], "Active"),
    activity: src === "created" ? "Created" : src === "imported" ? "Imported" : val(row.data, ["activity","Activity"], "Imported contact"),
  };
}

export function AdminContacts() {
  const client = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("All");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [viewing, setViewing] = useState<{ row: RecordRow; contact: Contact } | null>(null);
  const [form, setForm] = useState<Contact>(blank);
  // selection
  const [selected, setSelected] = useState<Set<number>>(new Set());
  // tag options (global, persisted in localStorage)
  const [tagOptions, setTagOptionsState] = useState<string[]>(loadTagOptions);

  function setTagOptions(opts: string[]) {
    setTagOptionsState(opts);
    saveTagOptions(opts);
  }
  // confirmation modals
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);      // single
  const [confirmBulk, setConfirmBulk] = useState(false);                        // selected

  const query = useQuery({
    queryKey: ["admin-contacts"],
    queryFn: async () => (await apiClient.get<RecordRow[]>("/api/customers/", { params: { size: 2000 } })).data,
  });
  const rows = useMemo(() => query.data ?? [], [query.data]);
  const normalized = useMemo(() => rows.map(row => ({ row, contact: normalize(row) })), [rows]);
  const allTags = useMemo(() => Array.from(new Set(normalized.flatMap(({ contact }) => contact.tags))).sort(), [normalized]);

  // Derive column keys from actual data — respecting original CSV order via __col_order__
  const dynamicColumns = useMemo(() => {
    if (!rows.length) return [];
    // Use __col_order__ from first row that has it
    const orderRow = rows.find(r => Array.isArray(r.data.__col_order__));
    if (orderRow) {
      return (orderRow.data.__col_order__ as string[]).filter(k => k !== "__col_order__");
    }
    // Fallback: union of all keys preserving first-seen order
    const seen = new Set<string>();
    const cols: string[] = [];
    for (const row of rows) {
      for (const key of Object.keys(row.data)) {
        if (key !== "__col_order__" && !seen.has(key)) { seen.add(key); cols.push(key); }
      }
    }
    return cols;
  }, [rows]);

  const contacts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return normalized.filter(({ contact }) => {
      const txt = [contact.name, contact.email, contact.phone_no, ...contact.tags].join(" ").toLowerCase();
      return (!q || txt.includes(q))
        && (tagFilter === "All" || contact.tags.includes(tagFilter));
    });
  }, [normalized, search, tagFilter]);

  // ── derived selection state ──────────────────────────────────────────────────
  const visibleIds = useMemo(() => contacts.map(c => c.row.id), [contacts]);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every(id => selected.has(id));
  const someSelected = selected.size > 0;

  function toggleAll() {
    if (allVisibleSelected) setSelected(prev => { const n = new Set(prev); visibleIds.forEach(id => n.delete(id)); return n; });
    else setSelected(prev => { const n = new Set(prev); visibleIds.forEach(id => n.add(id)); return n; });
  }
  function toggleOne(id: number) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  // ── mutations ─────────────────────────────────────────────────────────────────
  const save = useMutation({
    mutationFn: () => editing
      ? apiClient.patch(`/api/customers/${editing}/`, form)
      : apiClient.post("/api/customers/", form),
    onSuccess: () => {
      toast.success(editing ? "Contact updated" : "Contact added");
      setEditorOpen(false); setEditing(null); setForm(blank);
      void client.invalidateQueries({ queryKey: ["admin-contacts"] });
    },
    onError: err => toast.error(parseApiError(err)),
  });

  const remove = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/customers/${id}/`),
    onSuccess: (_, id) => {
      toast.success("Contact deleted");
      setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
      void client.invalidateQueries({ queryKey: ["admin-contacts"] });
    },
    onError: err => toast.error(parseApiError(err)),
  });

  const bulkDelete = useMutation({
    mutationFn: (payload: { ids?: number[]; all?: boolean }) =>
      apiClient.post("/api/customers/bulk-delete/", payload),
    onSuccess: (_, payload) => {
      toast.success(payload.all ? "All contacts deleted" : `${selected.size} contact(s) deleted`);
      setSelected(new Set());
      void client.invalidateQueries({ queryKey: ["admin-contacts"] });
    },
    onError: err => toast.error(parseApiError(err)),
  });

  // ── helpers ───────────────────────────────────────────────────────────────────
  async function importFile(file?: File) {
    if (!file) return;
    const body = new FormData(); body.append("file", file);
    try {
      await apiClient.post("/api/customers/uploads/", body);
      toast.success("Contacts imported");
      void client.invalidateQueries({ queryKey: ["admin-contacts"] });
    } catch (e) { toast.error(parseApiError(e)); }
    finally { if (fileRef.current) fileRef.current.value = ""; }
  }

  function exportCsv() {
    const header = ["Name","Email","Phone No","Tags","Activity"];
    const lines = rows.map(row => {
      const c = normalize(row);
      return [c.name, c.email, c.phone_no, c.tags.join(";"), c.activity]
        .map(v => `"${String(v).replaceAll('"','""')}"`).join(",");
    });
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "contacts.csv"; a.click();
  }

  function beginAdd() { setEditing(null); setForm(blank); setEditorOpen(true); }
  function beginEdit(row: RecordRow) { setViewing(null); setEditing(row.id); setForm(normalize(row)); setEditorOpen(true); }

  return (
    <div>
      {/* ── Header ── */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[.24em] text-blue-600">Audience workspace</p>
          <h1 className="sa-title mt-4">CONTACTS</h1>
          <p className="sa-subtitle">{rows.length} contacts{someSelected ? ` · ${selected.size} selected` : ""}</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <input ref={fileRef} className="hidden" type="file" accept=".csv,.xlsx,.xls" onChange={e => void importFile(e.target.files?.[0])} />
          <button className="secondary-button flex min-h-12 items-center gap-2 px-5" onClick={() => fileRef.current?.click()}><Upload size={18} />Import</button>
          <button className="secondary-button flex min-h-12 items-center gap-2 px-5" disabled={!rows.length} onClick={exportCsv}><Download size={18} />Export</button>
          {someSelected && (
            <button
              className="flex min-h-12 items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-5 text-sm font-semibold text-red-600 hover:bg-red-100 transition"
              onClick={() => setConfirmBulk(true)}
            >
              <Trash2 size={17} />Delete Selected ({selected.size})
            </button>
          )}
          <button className="primary-button min-h-12 px-5" onClick={beginAdd}><Plus size={19} />Add Contact</button>
        </div>
      </div>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="sa-card overflow-hidden">
        {/* ── Filters ── */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white p-5">
          <label className="relative min-w-64 flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
            <input className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100" placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)} />
          </label>
          <div className="relative">
            <Tags className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
            <select aria-label="Filter by tag" className="h-12 appearance-none rounded-xl border border-slate-200 bg-white py-0 pl-11 pr-11 text-sm font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-400" value={tagFilter} onChange={e => setTagFilter(e.target.value)}>
              <option value="All">Tags: All</option>
              {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          </div>
        </div>

        {/* ── Table ── */}
        {query.isLoading ? (
          <div className="space-y-3 p-5">{[1,2,3,4,5].map(i => <div className="h-16 animate-pulse rounded-xl bg-slate-100" key={i} />)}</div>
        ) : query.isError ? (
          <div className="p-12 text-center text-red-600">{parseApiError(query.error)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" style={{ minWidth: Math.max(800, dynamicColumns.length * 160 + 200) }}>
              <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-[.13em] text-slate-500">
                <tr>
                  <th className="px-5 py-4 w-10">
                    <input
                      type="checkbox"
                      aria-label="Select all contacts"
                      checked={allVisibleSelected}
                      onChange={toggleAll}
                      className="h-4 w-4 cursor-pointer accent-blue-600"
                    />
                  </th>
                  {dynamicColumns.map(col => (
                    <th key={col} className="px-3 py-4 whitespace-nowrap">
                      {col.replace(/_/g, " ")}
                    </th>
                  ))}
                  <th className="sticky right-0 bg-slate-50/80 px-4 py-4 text-center shadow-[-8px_0_12px_-4px_rgba(15,23,42,.06)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map(({ row, contact }) => (
                  <tr
                    className={`group border-b border-slate-100 transition-colors last:border-0 hover:bg-blue-50/40 ${selected.has(row.id) ? "bg-blue-50/60" : ""}`}
                    key={row.id}
                  >
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        aria-label={`Select ${contact.name}`}
                        checked={selected.has(row.id)}
                        onChange={() => toggleOne(row.id)}
                        className="h-4 w-4 cursor-pointer accent-blue-600"
                      />
                    </td>
                    {dynamicColumns.filter(col => col !== "__col_order__").map(col => {
                      const raw = row.data[col];
                      const isTags = col.toLowerCase() === "tags";
                      const tags = isTags
                        ? (Array.isArray(raw) ? raw.map(String) : String(raw ?? "").split(",").map(t => t.trim()).filter(Boolean))
                        : [];
                      return (
                        <td key={col} className="px-3 py-4 max-w-[220px]">
                          {isTags ? (
                            <div className="flex flex-wrap gap-1.5">
                              {tags.length
                                ? tags.map(tag => <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700" key={tag}>{tag}</span>)
                                : <span className="text-slate-400">—</span>}
                            </div>
                          ) : (
                            <span className="block truncate text-slate-700" title={String(raw ?? "")}>
                              {raw !== undefined && raw !== null && String(raw).trim() ? String(raw) : "—"}
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td className="sticky right-0 bg-white px-3 py-4 shadow-[-8px_0_12px_-4px_rgba(15,23,42,.06)] group-hover:bg-blue-50/40">
                      <div className="flex justify-center gap-2">
                        <button className="icon-button !text-blue-600" title="View contact" onClick={() => setViewing({ row, contact })}><Eye size={18} /></button>
                        <button className="icon-button !text-slate-800" title="Edit contact" onClick={() => beginEdit(row)}><Pencil size={17} /></button>
                        <button className="icon-button !text-red-500" title="Delete contact" onClick={() => setConfirmDelete(row.id)}><Trash2 size={17} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!contacts.length && <div className="p-14 text-center text-slate-500">No contacts match your filters.</div>}
          </div>
        )}
      </motion.section>

      {/* ── Modals ── */}
      <AnimatePresence>
        {viewing && <ContactDetails contact={viewing.contact} onClose={() => setViewing(null)} onEdit={() => beginEdit(viewing.row)} />}
        {editorOpen && <ContactEditor editing={editing !== null} form={form} pending={save.isPending} setForm={setForm} tagOptions={tagOptions} setTagOptions={setTagOptions} onClose={() => setEditorOpen(false)} onSubmit={() => save.mutate()} />}

        {/* Single delete confirmation */}
        {confirmDelete !== null && (
          <ConfirmModal
            key="confirm-single"
            icon={<Trash2 size={28} className="text-red-500" />}
            title="Delete contact?"
            description="This action cannot be undone. The contact will be permanently removed."
            confirmLabel="Delete"
            danger
            pending={remove.isPending}
            onCancel={() => setConfirmDelete(null)}
            onConfirm={() => { remove.mutate(confirmDelete); setConfirmDelete(null); }}
          />
        )}

        {/* Bulk delete confirmation */}
        {confirmBulk && (
          <ConfirmModal
            key="confirm-bulk"
            icon={<Trash2 size={28} className="text-red-500" />}
            title={`Delete ${selected.size} contact${selected.size > 1 ? "s" : ""}?`}
            description="All selected contacts will be permanently deleted. This cannot be undone."
            confirmLabel={`Delete ${selected.size} contact${selected.size > 1 ? "s" : ""}`}
            danger
            pending={bulkDelete.isPending}
            onCancel={() => setConfirmBulk(false)}
            onConfirm={() => { bulkDelete.mutate({ ids: Array.from(selected) }); setConfirmBulk(false); }}
          />
        )}

      </AnimatePresence>
    </div>
  );
}

// ─── Confirm Modal ─────────────────────────────────────────────────────────────

function ConfirmModal({ icon, title, description, confirmLabel, danger, pending, onCancel, onConfirm }: {
  icon: React.ReactNode; title: string; description: string;
  confirmLabel: string; danger?: boolean; pending?: boolean;
  onCancel: () => void; onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/65 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: .95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: .97 }}
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="grid h-16 w-16 place-items-center rounded-full bg-red-50">{icon}</div>
          <h2 className="text-xl font-black text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          <button className="secondary-button px-6" onClick={onCancel} disabled={pending}>Cancel</button>
          <button
            className={`flex min-h-10 items-center gap-2 rounded-xl px-6 text-sm font-semibold text-white transition ${danger ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"} disabled:opacity-50`}
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function ContactDetails({ contact, onClose, onEdit }: { contact: Contact; onClose: () => void; onEdit: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/65 p-4 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: .96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .97 }} className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-600">Contact details</p><h2 className="mt-1 text-2xl font-black text-slate-950">{contact.name}</h2></div><button className="icon-button" onClick={onClose}><X /></button></div>
        <dl className="grid gap-5 p-6 sm:grid-cols-2"><Detail label="Email" value={contact.email} /><Detail label="Phone number" value={contact.phone_no || "—"} /><Detail label="Status" value={contact.status} /><Detail label="List" value={contact.list} /><div className="sm:col-span-2"><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Tags</dt><dd className="mt-2 flex flex-wrap gap-2">{contact.tags.length ? contact.tags.map(tag => <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700" key={tag}>{tag}</span>) : "—"}</dd></div><Detail label="Activity" value={contact.activity} /></dl>
        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4"><button className="secondary-button" onClick={onClose}>Close</button><button className="primary-button min-h-10 px-5" onClick={onEdit}><Pencil size={16} />Edit contact</button></div>
      </motion.div>
    </div>
  );
}

function Detail({ label, value: detail }: { label: string; value: string }) {
  return <div><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</dt><dd className="mt-1 font-semibold text-slate-800">{detail || "—"}</dd></div>;
}

const DEFAULT_TAGS = ["VIP", "SaaS", "Lead", "Customer", "Partner", "Prospect", "Newsletter", "Inactive"];
const TAG_STORAGE_KEY = "ma_contact_tag_options";

function loadTagOptions(): string[] {
  if (typeof window === "undefined") return DEFAULT_TAGS;
  try {
    const stored = localStorage.getItem(TAG_STORAGE_KEY);
    if (stored) return JSON.parse(stored) as string[];
  } catch {}
  return DEFAULT_TAGS;
}

function saveTagOptions(opts: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TAG_STORAGE_KEY, JSON.stringify(opts));
}

function TagDropdown({ selected, options, onToggle, onAddOption, onDeleteOption }: {
  selected: string[];
  options: string[];
  onToggle: (tag: string) => void;
  onAddOption: (tag: string) => void;
  onDeleteOption: (tag: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");

  function addCustom() {
    const tag = custom.trim();
    if (!tag) return;
    if (!options.includes(tag)) onAddOption(tag);   // add to global list
    if (!selected.includes(tag)) onToggle(tag);      // also select it
    setCustom("");
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex min-h-[42px] w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
      >
        <div className="flex flex-wrap gap-1.5">
          {selected.length ? selected.map(tag => (
            <span key={tag} className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
              {tag}
              <span className="cursor-pointer text-blue-400 hover:text-blue-700" onClick={e => { e.stopPropagation(); onToggle(tag); }}>×</span>
            </span>
          )) : <span className="text-slate-400">Select tags…</span>}
        </div>
        <ChevronDown size={15} className={`ml-2 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="absolute z-30 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-xl"
          >
            <ul className="max-h-48 overflow-y-auto py-1">
              {options.map(tag => {
                const checked = selected.includes(tag);
                return (
                  <li key={tag} className="group flex items-center gap-1 pr-2 hover:bg-slate-50">
                    <button
                      type="button"
                      onClick={() => onToggle(tag)}
                      className="flex flex-1 items-center gap-3 px-4 py-2.5 text-sm"
                    >
                      <span className={`grid h-4 w-4 shrink-0 place-items-center rounded border text-[10px] font-bold transition ${checked ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"}`}>
                        {checked ? "✓" : ""}
                      </span>
                      <span className={checked ? "font-semibold text-blue-700" : "text-slate-700"}>{tag}</span>
                    </button>
                    {/* Delete option from list */}
                    <button
                      type="button"
                      title={`Remove "${tag}" from list`}
                      onClick={e => { e.stopPropagation(); onDeleteOption(tag); if (checked) onToggle(tag); }}
                      className="invisible flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-300 transition hover:bg-red-50 hover:text-red-500 group-hover:visible"
                    >
                      <Trash2 size={13} />
                    </button>
                  </li>
                );
              })}
              {!options.length && <li className="px-4 py-3 text-xs text-slate-400">No tags yet. Add one below.</li>}
            </ul>
            {/* Custom tag input */}
            <div className="border-t border-slate-100 p-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={custom}
                  onChange={e => setCustom(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
                  placeholder="Type custom tag…"
                  className="h-9 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={addCustom}
                  disabled={!custom.trim()}
                  className="h-9 rounded-lg bg-blue-600 px-3 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-40"
                >
                  Add
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ContactEditor({ editing, form, pending, setForm, tagOptions, setTagOptions, onClose, onSubmit }: {
  editing: boolean; form: Contact; pending: boolean;
  setForm: (c: Contact) => void;
  tagOptions: string[]; setTagOptions: (opts: string[]) => void;
  onClose: () => void; onSubmit: () => void;
}) {
  function toggleTag(tag: string) {
    const has = form.tags.includes(tag);
    setForm({ ...form, tags: has ? form.tags.filter(t => t !== tag) : [...form.tags, tag] });
  }
  function addOption(tag: string) {
    setTagOptions([...tagOptions, tag]);
  }
  function deleteOption(tag: string) {
    setTagOptions(tagOptions.filter(t => t !== tag));
    // also remove from current selection if present
    setForm({ ...form, tags: form.tags.filter(t => t !== tag) });
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/65 p-4 backdrop-blur-sm">
      <motion.form initial={{ opacity: 0, scale: .96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .97 }} className="max-h-[94vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl" onSubmit={e => { e.preventDefault(); onSubmit(); }}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-600">Audience workspace</p><h2 className="mt-1 text-2xl font-black">{editing ? "Edit" : "Add"} contact</h2></div><button type="button" className="icon-button" onClick={onClose}><X /></button></div>
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <label className="field"><span>Full name *</span><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
          <label className="field"><span>Phone number</span><input type="tel" value={form.phone_no} onChange={e => setForm({ ...form, phone_no: e.target.value })} /></label>
          <label className="field sm:col-span-2"><span>Email address *</span><input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>

          {/* Tags multi-select dropdown */}
          <div className="field sm:col-span-2">
            <span>Tags</span>
            <TagDropdown selected={form.tags} options={tagOptions} onToggle={toggleTag} onAddOption={addOption} onDeleteOption={deleteOption} />
          </div>

          <button className="primary-button mt-2 sm:col-span-2" disabled={pending}>{pending ? "Saving..." : editing ? "Save changes" : "Add contact"}</button>
        </div>
      </motion.form>
    </div>
  );
}
