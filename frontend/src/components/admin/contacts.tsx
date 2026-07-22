"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  Download,
  Eye,
  Filter,
  Pencil,
  Plus,
  Search,
  Tags,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { apiClient, parseApiError } from "@/services/api-client";

type RecordRow = { id: number; data: Record<string, unknown>; created_at: string };
type Contact = {
  name: string;
  email: string;
  phone_no: string;
  tags: string[];
  list: string;
  score: number;
  status: string;
  activity: string;
};

const blank: Contact = {
  name: "",
  email: "",
  phone_no: "",
  tags: [],
  list: "General",
  score: 50,
  status: "Active",
  activity: "Just added",
};

function value(data: Record<string, unknown>, keys: string[], fallback = "") {
  for (const key of keys) {
    const found = data[key];
    if (found !== undefined && found !== null && String(found).trim()) return String(found);
  }
  return fallback;
}

function normalize(row: RecordRow): Contact {
  const rawTags = row.data.tags;
  return {
    name: value(row.data, ["name", "full_name", "Name", "Full Name"], "Unnamed contact"),
    email: value(row.data, ["email", "Email", "email_address"]),
    phone_no: value(row.data, ["phone_no", "phone", "Phone", "mobile_no", "mobile", "Phone No"]),
    tags: Array.isArray(rawTags)
      ? rawTags.map(String)
      : value(row.data, ["tags", "Tags"]).split(",").map((tag) => tag.trim()).filter(Boolean),
    list: value(row.data, ["list", "List", "segment"], "General"),
    score: Number(value(row.data, ["score", "Score"], "0")) || 0,
    status: value(row.data, ["status", "Status"], "Active"),
    activity: value(row.data, ["activity", "Activity"], "Imported contact"),
  };
}

export function AdminContacts() {
  const client = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [tagFilter, setTagFilter] = useState("All");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [viewing, setViewing] = useState<{ row: RecordRow; contact: Contact } | null>(null);
  const [form, setForm] = useState<Contact>(blank);

  const query = useQuery({
    queryKey: ["admin-contacts"],
    queryFn: async () => (await apiClient.get<RecordRow[]>("/api/customers/")).data,
  });
  const rows = useMemo(() => query.data ?? [], [query.data]);
  const normalized = useMemo(() => rows.map((row) => ({ row, contact: normalize(row) })), [rows]);
  const allTags = useMemo(
    () => Array.from(new Set(normalized.flatMap(({ contact }) => contact.tags))).sort(),
    [normalized],
  );
  const contacts = useMemo(() => {
    const queryText = search.trim().toLowerCase();
    return normalized.filter(({ contact }) => {
      const searchable = [contact.name, contact.email, contact.phone_no, ...contact.tags].join(" ").toLowerCase();
      return (!queryText || searchable.includes(queryText))
        && (statusFilter === "All" || contact.status === statusFilter)
        && (tagFilter === "All" || contact.tags.includes(tagFilter));
    });
  }, [normalized, search, statusFilter, tagFilter]);

  const save = useMutation({
    mutationFn: () => editing
      ? apiClient.patch(`/api/customers/${editing}/`, form)
      : apiClient.post("/api/customers/", form),
    onSuccess: () => {
      toast.success(editing ? "Contact updated" : "Contact added");
      setEditorOpen(false);
      setEditing(null);
      setForm(blank);
      void client.invalidateQueries({ queryKey: ["admin-contacts"] });
    },
    onError: (error) => toast.error(parseApiError(error)),
  });
  const remove = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/api/customers/${id}/`),
    onSuccess: () => {
      toast.success("Contact deleted");
      void client.invalidateQueries({ queryKey: ["admin-contacts"] });
    },
    onError: (error) => toast.error(parseApiError(error)),
  });

  async function importFile(file?: File) {
    if (!file) return;
    const body = new FormData();
    body.append("file", file);
    try {
      await apiClient.post("/api/customers/uploads/", body);
      toast.success("Contacts imported");
      void client.invalidateQueries({ queryKey: ["admin-contacts"] });
    } catch (error) {
      toast.error(parseApiError(error));
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function exportCsv() {
    const header = ["Name", "Email", "Phone No", "Tags", "Activity"];
    const lines = rows.map((row) => {
      const contact = normalize(row);
      return [contact.name, contact.email, contact.phone_no, contact.tags.join(";"), contact.activity]
        .map((item) => `"${String(item).replaceAll('"', '""')}"`).join(",");
    });
    const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "contacts.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function beginAdd() {
    setEditing(null);
    setForm(blank);
    setEditorOpen(true);
  }
  function beginEdit(row: RecordRow) {
    setViewing(null);
    setEditing(row.id);
    setForm(normalize(row));
    setEditorOpen(true);
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[.24em] text-blue-600">Audience workspace</p>
          <h1 className="sa-title mt-4">CONTACTS</h1>
          <p className="sa-subtitle">{rows.length} contacts</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <input ref={fileRef} className="hidden" type="file" accept=".csv,.xlsx,.xls" onChange={(event) => void importFile(event.target.files?.[0])} />
          <button className="secondary-button flex min-h-12 items-center gap-2 px-5" onClick={() => fileRef.current?.click()}><Upload size={18} />Import</button>
          <button className="secondary-button flex min-h-12 items-center gap-2 px-5" disabled={!rows.length} onClick={exportCsv}><Download size={18} />Export</button>
          <button className="primary-button min-h-12 px-5" onClick={beginAdd}><Plus size={19} />Add Contact</button>
        </div>
      </div>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="sa-card overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white p-5">
          <label className="relative min-w-64 flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} />
            <input className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100" placeholder="Search contacts..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </label>
          <button className={`secondary-button flex min-h-12 items-center gap-2 px-4 ${statusFilter !== "All" ? "!border-blue-300 !text-blue-600" : ""}`} onClick={() => setStatusFilter((current) => current === "All" ? "Active" : current === "Active" ? "Inactive" : "All")}>
            <Filter size={18} />Filter: {statusFilter}
          </button>
          <div className="relative">
            <Tags className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
            <select aria-label="Filter by tag" className="h-12 appearance-none rounded-xl border border-slate-200 bg-white py-0 pl-11 pr-11 text-sm font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-400" value={tagFilter} onChange={(event) => setTagFilter(event.target.value)}>
              <option value="All">Tags: All</option>
              {allTags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          </div>
        </div>

        {query.isLoading ? (
          <div className="space-y-3 p-5">{[1, 2, 3, 4, 5].map((item) => <div className="h-16 animate-pulse rounded-xl bg-slate-100" key={item} />)}</div>
        ) : query.isError ? (
          <div className="p-12 text-center text-red-600">{parseApiError(query.error)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] uppercase tracking-[.13em] text-slate-500">
                <tr><th className="px-6 py-4">Name</th><th>Email</th><th>Phone No</th><th>Tags</th><th>Activity</th><th className="text-center">Actions</th></tr>
              </thead>
              <tbody>
                {contacts.map(({ row, contact }) => (
                  <tr className="border-b border-slate-100 transition-colors last:border-0 hover:bg-blue-50/40" key={row.id}>
                    <td className="px-6 py-5 font-bold text-slate-950">{contact.name}</td>
                    <td className="text-slate-600">{contact.email || "—"}</td>
                    <td className="font-medium text-slate-700">{contact.phone_no || "—"}</td>
                    <td><div className="flex max-w-56 flex-wrap gap-1.5">{contact.tags.length ? contact.tags.map((tag) => <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700" key={tag}>{tag}</span>) : <span className="text-slate-400">—</span>}</div></td>
                    <td className="text-slate-500">{contact.activity}</td>
                    <td><div className="flex justify-center gap-2">
                      <button className="icon-button !text-blue-600" title="View contact" onClick={() => setViewing({ row, contact })}><Eye size={18} /></button>
                      <button className="icon-button !text-slate-800" title="Edit contact" onClick={() => beginEdit(row)}><Pencil size={17} /></button>
                      <button className="icon-button !text-red-500" title="Delete contact" onClick={() => { if (confirm(`Delete ${contact.name}?`)) remove.mutate(row.id); }}><Trash2 size={17} /></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!contacts.length && <div className="p-14 text-center text-slate-500">No contacts match your filters.</div>}
          </div>
        )}
      </motion.section>

      <AnimatePresence>
        {viewing && <ContactDetails contact={viewing.contact} onClose={() => setViewing(null)} onEdit={() => beginEdit(viewing.row)} />}
        {editorOpen && <ContactEditor editing={editing !== null} form={form} pending={save.isPending} setForm={setForm} onClose={() => setEditorOpen(false)} onSubmit={() => save.mutate()} />}
      </AnimatePresence>
    </div>
  );
}

function ContactDetails({ contact, onClose, onEdit }: { contact: Contact; onClose: () => void; onEdit: () => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/65 p-4 backdrop-blur-sm"><motion.div initial={{ opacity: 0, scale: .96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .97 }} className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b border-slate-100 px-6 py-5"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-600">Contact details</p><h2 className="mt-1 text-2xl font-black text-slate-950">{contact.name}</h2></div><button className="icon-button" onClick={onClose}><X /></button></div><dl className="grid gap-5 p-6 sm:grid-cols-2"><Detail label="Email" value={contact.email} /><Detail label="Phone number" value={contact.phone_no || "—"} /><Detail label="Status" value={contact.status} /><Detail label="List" value={contact.list} /><div className="sm:col-span-2"><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Tags</dt><dd className="mt-2 flex flex-wrap gap-2">{contact.tags.length ? contact.tags.map((tag) => <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700" key={tag}>{tag}</span>) : "—"}</dd></div><Detail label="Activity" value={contact.activity} /></dl><div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4"><button className="secondary-button" onClick={onClose}>Close</button><button className="primary-button min-h-10 px-5" onClick={onEdit}><Pencil size={16} />Edit contact</button></div></motion.div></div>;
}

function Detail({ label, value: detail }: { label: string; value: string }) {
  return <div><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</dt><dd className="mt-1 font-semibold text-slate-800">{detail || "—"}</dd></div>;
}

function ContactEditor({ editing, form, pending, setForm, onClose, onSubmit }: { editing: boolean; form: Contact; pending: boolean; setForm: (contact: Contact) => void; onClose: () => void; onSubmit: () => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/65 p-4 backdrop-blur-sm"><motion.form initial={{ opacity: 0, scale: .96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .97 }} className="max-h-[94vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white shadow-2xl" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}><div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-600">Audience workspace</p><h2 className="mt-1 text-2xl font-black">{editing ? "Edit" : "Add"} contact</h2></div><button type="button" className="icon-button" onClick={onClose}><X /></button></div><div className="grid gap-4 p-6 sm:grid-cols-2"><label className="field"><span>Full name *</span><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label className="field"><span>Phone number</span><input type="tel" value={form.phone_no} onChange={(event) => setForm({ ...form, phone_no: event.target.value })} /></label><label className="field sm:col-span-2"><span>Email address *</span><input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label><label className="field"><span>Tags</span><input placeholder="VIP, SaaS" value={form.tags.join(", ")} onChange={(event) => setForm({ ...form, tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) })} /></label><label className="field"><span>List</span><input value={form.list} onChange={(event) => setForm({ ...form, list: event.target.value })} /></label><label className="field"><span>Status</span><select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option>Active</option><option>Inactive</option></select></label><label className="field"><span>Activity</span><input value={form.activity} onChange={(event) => setForm({ ...form, activity: event.target.value })} /></label><button className="primary-button mt-2 sm:col-span-2" disabled={pending}>{pending ? "Saving..." : editing ? "Save changes" : "Add contact"}</button></div></motion.form></div>;
}
