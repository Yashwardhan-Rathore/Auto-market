"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight, Eye, GripVertical, Pencil, Plus, RefreshCw, Save, Search, Target, Trash2, UserRound, UsersRound, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/providers/auth-provider";
import { apiClient, parseApiError } from "@/services/api-client";

type Condition = { id: string; field: string; operator: string; value: string; value_to?: string };
type Group = { id: string; operator: "AND" | "OR"; conditions: Condition[] };
type Definition = { type?: string; description?: string; operator?: string; conditions?: Condition[]; groups_operator?: string; groups?: Group[] };
type Audience = { id: number; name: string; customer_upload: number; customer_upload_name: string; definition: Definition; type: string; contacts_count: number; created_at: string; updated_at: string };
type Upload = { id: number; file_name: string; imported_records: number; status: string };
type SegmentForm = { name: string; description: string; type: "DYNAMIC" | "STATIC"; customer_upload: string; groups_operator: "AND" | "OR"; groups: Group[] };

const pageSize = 8;
const fields = ["Name", "Email", "Phone", "City", "Occupation", "Interest", "Country", "Age", "Engagement Score", "Status", "Plan"];
const operators = [
  ["contains", "contains"], ["is", "is"], ["!=", "is not"], ["startswith", "starts with"],
  ["endswith", "ends with"], ["greater_than", "greater than"], ["less_than", "less than"], ["between", "between"],
];
const uid = () => Math.random().toString(36).slice(2, 10);
const newCondition = (): Condition => ({ id: uid(), field: "Occupation", operator: "contains", value: "" });
const newGroup = (): Group => ({ id: uid(), operator: "AND", conditions: [newCondition()] });
const blankForm = (): SegmentForm => ({ name: "", description: "", type: "DYNAMIC", customer_upload: "", groups_operator: "OR", groups: [newGroup()] });

export function AdminAudiences() {
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [building, setBuilding] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [viewing, setViewing] = useState<Audience | null>(null);
  const [form, setForm] = useState<SegmentForm>(blankForm);
  const [previewCount, setPreviewCount] = useState<number | null>(null);

  const audiences = useQuery({ queryKey: ["admin-audiences"], queryFn: async () => (await apiClient.get<Audience[]>("/api/audiences/")).data });
  const uploads = useQuery({ queryKey: ["audience-uploads"], queryFn: async () => (await apiClient.get<Upload[]>("/api/customers/uploads/list/")).data, enabled: building });
  const definition = useMemo(() => ({ type: form.type, description: form.description, groups_operator: form.groups_operator, groups: form.type === "DYNAMIC" ? form.groups.map((group) => ({ ...group, conditions: group.conditions.map(({ id: _id, ...condition }) => condition) })) : [] }), [form]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return (audiences.data ?? []).filter((item) => !needle || [item.name, item.type, item.customer_upload_name].join(" ").toLowerCase().includes(needle));
  }, [audiences.data, search]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const rows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const preview = useMutation({
    mutationFn: async () => {
      if (!form.customer_upload) throw new Error("Select a contact source first.");
      return (await apiClient.post<{ total_customers: number }>("/api/audiences/preview/", { customer_upload: Number(form.customer_upload), audience_definition: definition })).data;
    },
    onSuccess: (data) => setPreviewCount(data.total_customers),
    onError: (error) => toast.error(parseApiError(error)),
  });
  const save = useMutation({
    mutationFn: () => {
      if (!form.name.trim() || !form.customer_upload) throw new Error("Segment name and contact source are required.");
      const payload = { name: form.name.trim(), customer_upload: Number(form.customer_upload), definition };
      return editing ? apiClient.patch(`/api/audiences/${editing}/`, payload) : apiClient.post("/api/audiences/create/", payload);
    },
    onSuccess: () => {
      toast.success(editing ? "Segment updated" : "Segment created");
      closeBuilder();
      void client.invalidateQueries({ queryKey: ["admin-audiences"] });
      void client.invalidateQueries({ queryKey: ["task-audiences"] });
    },
    onError: (error) => toast.error(parseApiError(error)),
  });
  const remove = useMutation({ mutationFn: (id: number) => apiClient.delete(`/api/audiences/${id}/`), onSuccess: () => { toast.success("Segment deleted"); void client.invalidateQueries({ queryKey: ["admin-audiences"] }); }, onError: (error) => toast.error(parseApiError(error)) });

  function closeBuilder() { setBuilding(false); setEditing(null); setForm(blankForm()); setPreviewCount(null); }
  function createSegment() { setEditing(null); setForm(blankForm()); setPreviewCount(null); setBuilding(true); }
  function editSegment(item: Audience) {
    const legacy = item.definition?.conditions?.length ? [{ id: uid(), operator: (item.definition.operator || "AND") as "AND" | "OR", conditions: item.definition.conditions.map((condition) => ({ ...condition, id: uid() })) }] : [];
    setViewing(null); setEditing(item.id); setPreviewCount(item.contacts_count);
    setForm({ name: item.name, description: item.definition?.description || "", type: item.type === "STATIC" ? "STATIC" : "DYNAMIC", customer_upload: String(item.customer_upload), groups_operator: (item.definition?.groups_operator === "AND" ? "AND" : "OR"), groups: item.definition?.groups?.length ? item.definition.groups.map((group) => ({ ...group, id: uid(), conditions: group.conditions.map((condition) => ({ ...condition, id: uid() })) })) : legacy.length ? legacy : [newGroup()] });
    setBuilding(true);
  }

  if (building) return <SegmentBuilder editing={editing !== null} form={form} setForm={(next) => { setForm(next); setPreviewCount(null); }} uploads={uploads.data ?? []} loadingUploads={uploads.isLoading} previewCount={previewCount} previewing={preview.isPending} saving={save.isPending} onCancel={closeBuilder} onPreview={() => preview.mutate()} onSave={() => save.mutate()} />;

  return <div><div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><h1 className="sa-title normal-case">Segmentation</h1><p className="sa-subtitle">Manage and organize your audience segments</p></div><button className="primary-button min-h-12 px-5" onClick={createSegment}><Plus size={19} />Create Segment</button></div>
    <section className="sa-card overflow-hidden"><div className="border-b border-slate-200 p-5"><label className="relative block max-w-md"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} /><input className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100" placeholder="Search segments..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></label></div>
      {audiences.isLoading ? <div className="space-y-3 p-5">{Array.from({ length: 6 }, (_, index) => <div className="h-14 animate-pulse rounded-xl bg-slate-100" key={index} />)}</div> : audiences.isError ? <div className="p-12 text-center text-red-600">{parseApiError(audiences.error)}</div> : <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50/70 text-xs uppercase tracking-wide text-slate-600"><tr><th className="px-6 py-5">Title</th><th>Type</th><th>Contacts</th><th>Created At</th><th className="text-center">Actions</th></tr></thead><tbody>{rows.map((item) => <tr className="border-b border-slate-100 transition last:border-0 hover:bg-blue-50/35" key={item.id}><td className="px-6 py-5 font-semibold text-slate-800">{item.name}</td><td><TypeBadge type={item.type} /></td><td className="font-medium text-slate-700">{item.contacts_count.toLocaleString()}</td><td className="text-slate-600">{formatDate(item.created_at)}</td><td><div className="flex justify-center gap-2"><Action title="View segment" color="blue" onClick={() => setViewing(item)}><Eye size={17} /></Action><Action title="Edit segment" color="orange" onClick={() => editSegment(item)}><Pencil size={17} /></Action><Action title="Delete segment" color="red" onClick={() => { if (confirm(`Delete ${item.name}?`)) remove.mutate(item.id); }}><Trash2 size={17} /></Action></div></td></tr>)}</tbody></table>{!rows.length && <div className="p-14 text-center text-slate-500">No segments match your search.</div>}</div>}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-6 py-4 text-sm text-slate-500"><span>Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} segments</span><div className="flex items-center gap-1.5"><PageButton disabled={currentPage === 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={16} /></PageButton>{Array.from({ length: pages }, (_, index) => index + 1).slice(0, 5).map((number) => <PageButton active={number === currentPage} key={number} onClick={() => setPage(number)}>{number}</PageButton>)}<PageButton disabled={currentPage === pages} onClick={() => setPage((value) => value + 1)}><ChevronRight size={16} /></PageButton></div></div></section>
    <AnimatePresence>{viewing && <SegmentDetails item={viewing} onClose={() => setViewing(null)} onEdit={() => editSegment(viewing)} />}</AnimatePresence></div>;
}

function SegmentBuilder({ editing, form, setForm, uploads, loadingUploads, previewCount, previewing, saving, onCancel, onPreview, onSave }: { editing: boolean; form: SegmentForm; setForm: (form: SegmentForm) => void; uploads: Upload[]; loadingUploads: boolean; previewCount: number | null; previewing: boolean; saving: boolean; onCancel: () => void; onPreview: () => void; onSave: () => void }) {
  const { user } = useAuth();
  const selectedUpload = uploads.find((upload) => String(upload.id) === form.customer_upload);
  const total = selectedUpload?.imported_records || 0;
  const count = previewCount ?? 0;
  const conditions = form.groups.flatMap((group) => group.conditions);
  const updateGroup = (groupId: string, patch: Partial<Group>) => setForm({ ...form, groups: form.groups.map((group) => group.id === groupId ? { ...group, ...patch } : group) });
  const updateCondition = (groupId: string, conditionId: string, patch: Partial<Condition>) => setForm({ ...form, groups: form.groups.map((group) => group.id === groupId ? { ...group, conditions: group.conditions.map((condition) => condition.id === conditionId ? { ...condition, ...patch } : condition) } : group) });
  const removeCondition = (groupId: string, conditionId: string) => setForm({ ...form, groups: form.groups.map((group) => group.id === groupId ? { ...group, conditions: group.conditions.filter((condition) => condition.id !== conditionId) } : group).filter((group) => group.conditions.length) });

  return <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><div className="mb-4 flex items-center gap-2 text-sm font-semibold"><button className="text-blue-600 hover:underline" onClick={onCancel}>Segmentation</button><ChevronRight size={15} className="text-slate-400" /><span>Create Segment</span></div><h1 className="sa-title normal-case">{editing ? "Edit" : "Create"} Segment</h1><p className="sa-subtitle">Build a targeted audience by adding filters and conditions.</p></div><div className="flex flex-wrap gap-3"><button className="secondary-button min-h-12 px-5" onClick={onCancel}>Cancel</button><button className="secondary-button flex min-h-12 items-center gap-2 border-blue-300 px-5 text-blue-600" disabled={previewing || !form.customer_upload} onClick={onPreview}><Eye size={18} />{previewing ? "Calculating..." : "Preview"}</button><button className="primary-button min-h-12 px-6" disabled={saving || loadingUploads} onClick={onSave}><Save size={18} />{saving ? "Saving..." : "Save Segment"}</button></div></div>
    <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_390px]"><div className="space-y-4"><section className="sa-card grid gap-5 p-6 md:grid-cols-2"><label className="field"><span>Segment Name <b className="text-red-500">*</b></span><input placeholder="Sports Persons - Football Campaign" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label className="field"><span>Description (Optional)</span><input placeholder="Describe this targeted audience" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><label className="field"><span>Contact Source <b className="text-red-500">*</b></span><select value={form.customer_upload} onChange={(event) => setForm({ ...form, customer_upload: event.target.value })}><option value="">Select imported contacts</option>{uploads.filter((upload) => upload.status === "COMPLETED").map((upload) => <option value={upload.id} key={upload.id}>{upload.file_name} ({upload.imported_records.toLocaleString()})</option>)}</select></label><div><p className="mb-2 text-sm font-semibold text-slate-800">Segment Type</p><div className="inline-flex overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-1">{(["DYNAMIC", "STATIC"] as const).map((type) => <button className={`rounded-lg px-5 py-2 text-sm font-bold transition ${form.type === type ? "bg-white text-blue-600 shadow-sm ring-1 ring-blue-300" : "text-slate-600"}`} key={type} onClick={() => setForm({ ...form, type })}>{title(type)}</button>)}</div></div></section>
      {form.type === "DYNAMIC" && <div className="space-y-3">{form.groups.map((group, groupIndex) => <div key={group.id}>{groupIndex > 0 && <div className="relative my-3 flex justify-center"><div className="absolute top-1/2 h-px w-full bg-slate-200" /><button className="relative rounded-lg bg-violet-100 px-5 py-1 text-xs font-bold text-violet-700" onClick={() => setForm({ ...form, groups_operator: form.groups_operator === "OR" ? "AND" : "OR" })}>{form.groups_operator}</button></div>}<section className="sa-card overflow-hidden"><div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4"><select className="rounded-lg border border-blue-300 bg-blue-600 px-3 py-2 text-sm font-bold text-white" value={group.operator} onChange={(event) => updateGroup(group.id, { operator: event.target.value as "AND" | "OR" })}><option>AND</option><option>OR</option></select><span className="mr-auto text-sm font-semibold text-slate-700">{group.operator === "AND" ? "All" : "Any"} of the following conditions must be true</span><button className="flex items-center gap-1.5 text-sm font-bold text-blue-600" onClick={() => updateGroup(group.id, { conditions: [...group.conditions, newCondition()] })}><Plus size={16} />Add Condition</button>{form.groups.length > 1 && <button className="icon-button text-red-500" title="Delete group" onClick={() => setForm({ ...form, groups: form.groups.filter((item) => item.id !== group.id) })}><Trash2 size={17} /></button>}</div><div className="space-y-3 p-4">{group.conditions.map((condition) => <div className="grid items-center gap-2 md:grid-cols-[24px_1fr_1fr_1.7fr_36px]" key={condition.id}><GripVertical className="text-slate-400" size={18} /><select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm" value={condition.field} onChange={(event) => updateCondition(group.id, condition.id, { field: event.target.value })}>{fields.map((field) => <option key={field}>{field}</option>)}</select><select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm" value={condition.operator} onChange={(event) => updateCondition(group.id, condition.id, { operator: event.target.value })}>{operators.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><div className="flex items-center gap-2"><input className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm" placeholder="Enter value" value={condition.value} onChange={(event) => updateCondition(group.id, condition.id, { value: event.target.value })} />{condition.operator === "between" && <><span>-</span><input className="h-11 min-w-0 flex-1 rounded-xl border border-slate-200 px-3 text-sm" placeholder="To" value={condition.value_to || ""} onChange={(event) => updateCondition(group.id, condition.id, { value_to: event.target.value })} /></>}</div><button className="icon-button text-red-500" title="Delete condition" onClick={() => removeCondition(group.id, condition.id)}><Trash2 size={18} /></button></div>)}</div></section></div>)}<button className="secondary-button flex items-center gap-2 border-blue-300 px-4 text-blue-600" onClick={() => setForm({ ...form, groups: [...form.groups, newGroup()] })}><Plus size={17} />Add Group</button></div>}
    </div><aside className="sa-card sticky top-24 overflow-hidden"><div className="flex items-center justify-between border-b border-slate-100 p-6"><h2 className="text-lg font-black">Segment Preview</h2><span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">Live count</span></div><div className="p-6"><p className="text-sm text-slate-500">This segment matches</p><div className="mt-3 flex items-end gap-2"><strong className="text-4xl font-black text-emerald-600">{previewCount === null ? "—" : count.toLocaleString()}</strong><span className="pb-1 font-bold">contacts</span></div><p className="mt-2 text-sm text-slate-500">{previewCount === null ? "Click Preview to calculate" : `~ ${total ? ((count / total) * 100).toFixed(1) : 0}% of source contacts`}</p><div className="my-6 h-px bg-slate-200" /><h3 className="font-black">Breakdown</h3><div className="mt-4 space-y-3">{conditions.length ? conditions.map((condition) => <div className="flex justify-between gap-3 text-sm" key={condition.id}><span className="text-slate-600">{condition.field} {operatorLabel(condition.operator)} {condition.value}{condition.value_to ? ` and ${condition.value_to}` : ""}</span></div>) : <p className="text-sm text-slate-400">All contacts in the selected source.</p>}</div><div className="my-6 h-px bg-slate-200" /><div className="space-y-4 text-sm"><Meta icon={<RefreshCw size={17} />} label="Type" value={title(form.type)} /><Meta icon={<CalendarDays size={17} />} label="Last Updated" value="Not saved yet" /><Meta icon={<UserRound size={17} />} label="Created By" value={[user?.first_name, user?.last_name].filter(Boolean).join(" ") || user?.email || "Current admin"} /><Meta icon={<Target size={17} />} label="Used In" value={editing ? "Existing campaigns" : "0 Campaigns"} /></div></div></aside></div></motion.div>;
}

function SegmentDetails({ item, onClose, onEdit }: { item: Audience; onClose: () => void; onEdit: () => void }) { return <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm"><motion.div initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .97 }} className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"><div className="flex items-start justify-between border-b border-slate-100 p-6"><div><TypeBadge type={item.type} /><h2 className="mt-3 text-2xl font-black">{item.name}</h2><p className="mt-1 text-sm text-slate-500">{item.customer_upload_name}</p></div><button className="icon-button" onClick={onClose}><X /></button></div><div className="grid grid-cols-2 gap-4 p-6"><div className="col-span-2 flex items-center gap-4 rounded-2xl bg-blue-50 p-5"><span className="grid h-12 w-12 place-items-center rounded-full bg-white text-blue-600 shadow-sm"><UsersRound /></span><div><p className="text-2xl font-black text-slate-900">{item.contacts_count.toLocaleString()}</p><p className="text-sm text-slate-500">Matching contacts</p></div></div><Detail label="Type" value={title(item.type)} /><Detail label="Created" value={formatDate(item.created_at)} /></div><div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 p-4"><button className="secondary-button" onClick={onClose}>Close</button><button className="primary-button min-h-10 px-5" onClick={onEdit}><Pencil size={16} />Edit segment</button></div></motion.div></div>; }
function Action({ title: label, color, onClick, children }: { title: string; color: string; onClick: () => void; children: React.ReactNode }) { return <button className={`icon-button !border !border-slate-200 ${color === "red" ? "!text-red-500" : color === "orange" ? "!text-orange-500" : "!text-blue-600"}`} title={label} onClick={onClick}>{children}</button>; }
function TypeBadge({ type }: { type: string }) { return <span className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${type === "STATIC" ? "border-blue-200 bg-blue-50 text-blue-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>{title(type)}</span>; }
function PageButton({ active, disabled, onClick, children }: { active?: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) { return <button className={`grid h-9 min-w-9 place-items-center rounded-lg border px-2 text-sm font-semibold transition ${active ? "border-blue-500 bg-blue-600 text-white" : "border-slate-200 bg-white hover:border-blue-300 hover:text-blue-600"}`} disabled={disabled} onClick={onClick}>{children}</button>; }
function Meta({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) { return <div className="grid grid-cols-[20px_105px_1fr] items-center gap-2"><span className="text-slate-600">{icon}</span><span className="font-bold text-slate-700">{label}</span><span>{value}</span></div>; }
function Detail({ label, value }: { label: string; value: string }) { return <div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 font-semibold text-slate-800">{value}</p></div>; }
function operatorLabel(value: string) { return operators.find(([key]) => key === value)?.[1] || value; }
function title(value: string) { return value.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function formatDate(value: string) { return new Date(value).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
