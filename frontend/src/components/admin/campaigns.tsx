"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Eye, Mail, Megaphone, MoreVertical, Plus, Search, Send, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { apiClient, parseApiError } from "@/services/api-client";

type Campaign = {
  id: number;
  campaign_name: string;
  task_id: number;
  task_name: string;
  audience_name: string;
  status: string;
  scheduled_at: string | null;
  created_at: string;
  contacts: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  available_actions: string[];
};
type PageData = { count: number; results: Campaign[] };
type Summary = { total_campaigns: number; total_sent: number; delivered: number; opened: number; clicked: number };
type TeamTask = { id: number; title: string; description?: string; audience?: number; due_date?: string | null };

const statuses = ["All", "DRAFT", "PENDING_APPROVAL", "APPROVED", "SCHEDULED", "SENDING", "COMPLETED", "PAUSED", "REJECTED", "FAILED"];
const emptyForm = { task: "", name: "", description: "" };
const fmt = (value: number) => new Intl.NumberFormat("en-IN").format(value || 0);
const rate = (part: number, total: number) => total ? `${((part / total) * 100).toFixed(2)}%` : "0.00%";
const label = (status: string) => status.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

const statusStyle: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  PENDING_APPROVAL: "bg-amber-50 text-amber-700",
  APPROVED: "bg-indigo-50 text-indigo-700",
  SCHEDULED: "bg-orange-50 text-orange-700",
  SENDING: "bg-blue-50 text-blue-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
  PAUSED: "bg-violet-50 text-violet-700",
  REJECTED: "bg-red-50 text-red-700",
  FAILED: "bg-red-50 text-red-700",
};

export function AdminCampaigns() {
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [details, setDetails] = useState<Campaign | null>(null);
  const [menu, setMenu] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const campaigns = useQuery({
    queryKey: ["admin-campaigns", page, search, status],
    queryFn: async () => (await apiClient.get<PageData>("/api/campaigns/my/", { params: { page, search, status: status === "All" ? undefined : status } })).data,
  });
  const summary = useQuery({
    queryKey: ["admin-campaign-summary"],
    queryFn: async () => (await apiClient.get<Summary>("/api/campaigns/summary/")).data,
  });
  const tasks = useQuery({
    queryKey: ["admin-team-tasks"],
    queryFn: async () => (await apiClient.get<TeamTask[]>("/api/tasks/team/")).data,
    enabled: createOpen,
  });
  const create = useMutation({
    mutationFn: () => apiClient.post("/api/campaigns/create/", { ...form, task: Number(form.task) }),
    onSuccess: () => {
      toast.success("Campaign created successfully");
      setCreateOpen(false);
      setForm(emptyForm);
      void client.invalidateQueries({ queryKey: ["admin-campaigns"] });
      void client.invalidateQueries({ queryKey: ["admin-campaign-summary"] });
    },
    onError: (error) => toast.error(parseApiError(error)),
  });

  const data = campaigns.data;
  const rows = data?.results ?? [];
  const totals = summary.data;
  const cards = useMemo(() => [
    { title: "Total Campaigns", value: totals?.total_campaigns ?? 0, note: "All time", icon: Megaphone, iconClass: "bg-blue-50 text-blue-600", noteClass: "text-blue-600" },
    { title: "Total Sent", value: totals?.total_sent ?? 0, note: "All time", icon: Send, iconClass: "bg-emerald-50 text-emerald-600", noteClass: "text-emerald-600" },
    { title: "Delivered", value: totals?.delivered ?? 0, note: rate(totals?.delivered ?? 0, totals?.total_sent ?? 0), icon: Send, iconClass: "bg-violet-50 text-violet-600", noteClass: "text-violet-600" },
    { title: "Opened", value: totals?.opened ?? 0, note: rate(totals?.opened ?? 0, totals?.total_sent ?? 0), icon: Mail, iconClass: "bg-orange-50 text-orange-600", noteClass: "text-orange-600" },
  ], [totals]);

  return <div>
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><h1 className="sa-title normal-case">Campaigns</h1><p className="sa-subtitle">Campaign workflow and approvals</p></div><button className="primary-button min-h-12 px-5" onClick={() => setCreateOpen(true)}><Plus size={19} />Create Campaign</button></div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, index) => <motion.article initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .06 }} className="sa-card flex min-h-32 items-center gap-5 p-6" key={card.title}><div className={`grid h-16 w-16 shrink-0 place-items-center rounded-full ${card.iconClass}`}><card.icon size={29} /></div><div><p className="text-sm font-semibold text-slate-500">{card.title}</p><strong className="mt-1 block text-2xl font-black tracking-tight text-slate-950">{summary.isLoading ? "—" : fmt(card.value)}</strong><p className={`mt-1 text-sm ${card.noteClass}`}>{card.note}</p></div></motion.article>)}
    </div>

    <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="sa-card mt-6 overflow-visible">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-6"><label className="relative w-full max-w-md"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={19} /><input className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100" placeholder="Search campaigns..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} /></label><label className="relative min-w-52"><span className="absolute left-4 top-2 text-[10px] font-bold text-slate-500">Status</span><select className="h-14 w-full appearance-none rounded-xl border border-slate-200 bg-white pb-1 pl-4 pr-10 pt-5 text-sm font-semibold text-slate-700 outline-none" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="All">All Status</option>{statuses.slice(1).map((item) => <option value={item} key={item}>{label(item)}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={17} /></label></div>

      {campaigns.isLoading ? <div className="space-y-3 p-6">{[1, 2, 3, 4, 5].map((item) => <div className="h-16 animate-pulse rounded-xl bg-slate-100" key={item} />)}</div> : campaigns.isError ? <div className="p-12 text-center text-red-600">{parseApiError(campaigns.error)}</div> : <div className="overflow-x-auto"><table className="w-full min-w-[1120px] text-left text-sm"><thead className="border-b border-slate-200 bg-slate-50/70 text-xs font-bold text-slate-800"><tr><th className="px-7 py-5">Title</th><th>Status</th><th>Start Date</th><th>Contacts</th><th>Sent</th><th>Opened</th><th>Clicked</th><th className="w-16" /></tr></thead><tbody>{rows.map((campaign) => <tr className="border-b border-slate-100 transition last:border-0 hover:bg-blue-50/35" key={campaign.id}><td className="px-7 py-5 font-medium text-slate-800">{campaign.campaign_name}</td><td><span className={`rounded-md px-2.5 py-1 text-xs font-bold ${statusStyle[campaign.status] ?? "bg-slate-100 text-slate-600"}`}>{label(campaign.status)}</span></td><td className="text-slate-700">{new Date(campaign.scheduled_at || campaign.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td><td>{fmt(campaign.contacts)}</td><td>{campaign.sent ? `${fmt(campaign.sent)} (${rate(campaign.sent, campaign.contacts)})` : "—"}</td><td>{campaign.opened ? `${fmt(campaign.opened)} (${rate(campaign.opened, campaign.sent)})` : "—"}</td><td>{campaign.clicked ? `${fmt(campaign.clicked)} (${rate(campaign.clicked, campaign.sent)})` : "—"}</td><td className="relative"><button aria-label={`Actions for ${campaign.campaign_name}`} className="icon-button" onClick={() => setMenu((current) => current === campaign.id ? null : campaign.id)}><MoreVertical size={19} /></button>{menu === campaign.id && <div className="absolute right-7 top-12 z-20 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"><button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-50" onClick={() => { setDetails(campaign); setMenu(null); }}><Eye size={16} />View campaign</button></div>}</td></tr>)}</tbody></table>{!rows.length && <div className="p-14 text-center text-slate-500">No campaigns match your filters.</div>}</div>}
      {data && data.count > 10 && <div className="flex justify-end gap-2 border-t border-slate-100 p-4"><button className="secondary-button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>Previous</button><span className="px-3 py-2 text-sm">Page {page}</span><button className="secondary-button" disabled={page * 10 >= data.count} onClick={() => setPage((value) => value + 1)}>Next</button></div>}
    </motion.section>

    <AnimatePresence>
      {createOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/65 p-4 backdrop-blur-sm"><motion.form initial={{ opacity: 0, scale: .96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: .97 }} className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl" onSubmit={(event) => { event.preventDefault(); create.mutate(); }}><div className="flex items-center justify-between border-b border-slate-100 px-6 py-5"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-600">Campaign workspace</p><h2 className="mt-1 text-2xl font-black">Create campaign</h2></div><button aria-label="Close" type="button" className="icon-button" onClick={() => setCreateOpen(false)}><X /></button></div><div className="space-y-4 p-6"><label className="field"><span>Campaign title *</span><input required minLength={3} placeholder="e.g. Product launch campaign" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label className="field"><span>Team task *</span><select required value={form.task} onChange={(event) => setForm({ ...form, task: event.target.value })}><option value="">Select a task</option>{tasks.data?.map((task) => <option value={task.id} key={task.id}>{task.title}</option>)}</select></label><label className="field"><span>Description</span><textarea rows={4} placeholder="Campaign purpose and instructions" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>{tasks.isError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{parseApiError(tasks.error)}</p>}<button className="primary-button w-full" disabled={create.isPending || tasks.isLoading}>{create.isPending ? "Creating..." : "Create campaign"}</button></div></motion.form></div>}
      {details && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/65 p-4 backdrop-blur-sm"><motion.div initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .97 }} className="w-full max-w-lg rounded-3xl bg-white shadow-2xl"><div className="flex items-start justify-between border-b border-slate-100 p-6"><div><span className={`rounded-md px-2.5 py-1 text-xs font-bold ${statusStyle[details.status] ?? "bg-slate-100"}`}>{label(details.status)}</span><h2 className="mt-3 text-2xl font-black">{details.campaign_name}</h2><p className="mt-1 text-sm text-slate-500">{details.task_name} · {details.audience_name}</p></div><button className="icon-button" onClick={() => setDetails(null)}><X /></button></div><div className="grid grid-cols-2 gap-4 p-6"><Metric name="Contacts" value={details.contacts} /><Metric name="Sent" value={details.sent} /><Metric name="Delivered" value={details.delivered} /><Metric name="Opened" value={details.opened} /><Metric name="Clicked" value={details.clicked} /><Metric name="Created" value={new Date(details.created_at).toLocaleDateString()} /></div></motion.div></div>}
    </AnimatePresence>
  </div>;
}

function Metric({ name, value }: { name: string; value: number | string }) {
  return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{name}</p><strong className="mt-2 block text-xl text-slate-900">{typeof value === "number" ? fmt(value) : value}</strong></div>;
}
