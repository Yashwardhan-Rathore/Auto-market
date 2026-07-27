"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Bot, CreditCard, FileText, Sparkles, WalletCards,
} from "lucide-react";
import {
  CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { parseApiError } from "@/services/api-client";
import { superAdminService } from "@/services/super-admin.service";

const money = (n: number) => new Intl.NumberFormat("en-IN").format(n);

export function SuperAdminUsage({ creditsOnly = false }: { creditsOnly?: boolean }) {
  const query = useQuery({ queryKey: ["sa-billing"], queryFn: superAdminService.billing });

  if (query.isLoading)
    return <div className="h-96 animate-pulse rounded-2xl bg-white" />;
  if (query.isError)
    return <div className="sa-card p-10 text-center text-red-600">{parseApiError(query.error)}</div>;

  const d     = query.data!;
  const total = d.balance + d.consumed;
  const used  = total ? Math.round((d.consumed / total) * 100) : 0;

  const trend = [...d.transactions].reverse().reduce<{ name: string; balance: number }[]>(
    (out, t) => {
      const prev = out.at(-1)?.balance ?? 0;
      out.push({
        name: new Date(t.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
        balance: Math.max(0, prev + (t.type === "CREDIT" ? t.amount : -t.amount)),
      });
      return out;
    },
    [],
  );

  return (
    <div>
      {/* ── Page heading ── */}
      <div className="mb-7">
        <h1 className="sa-title">{creditsOnly ? "AI CREDITS & USAGE" : "BILLING & USAGE"}</h1>
        <p className="sa-subtitle">Real wallet and transaction data from the billing API</p>
      </div>

      {/* ── Top stat cards ── */}
      <div className={`grid gap-5 ${
        creditsOnly
          ? "xl:grid-cols-[1fr_1fr_1.45fr]"
          : "sm:grid-cols-2 xl:grid-cols-3"
      }`}>

        {/* Credits Remaining — dark navy card with hover */}
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
          className="billing-credits-card sa-card relative overflow-hidden p-7 cursor-default"
        >
          {/* Decorative glow orb */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full opacity-0 billing-credits-orb"
            style={{ background: "radial-gradient(ellipse, rgba(37,99,235,.45) 0%, transparent 70%)", filter: "blur(20px)" }}
          />
          {/* Animated shimmer sweep on hover */}
          <div className="billing-credits-shimmer pointer-events-none absolute inset-0"
            style={{ background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,.07) 50%, transparent 70%)" }}
          />

          <div className="relative flex items-center gap-3 text-xs font-bold tracking-[.18em] billing-credits-label">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 billing-credits-icon-wrap">
              <Bot size={22} />
            </span>
            CREDITS REMAINING
          </div>

          <strong className="relative mt-7 block text-5xl font-black tracking-tight billing-credits-value">
            {money(d.balance)}
          </strong>

          {/* Progress bar */}
          <div className="relative mt-7 h-3 overflow-hidden rounded-full bg-slate-200 billing-credits-bar-bg">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${100 - used}%` }}
              transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
              className="h-full rounded-full bg-blue-500"
              style={{ boxShadow: "0 0 10px rgba(96,165,250,.5)" }}
            />
          </div>
          <p className="relative mt-3 text-sm billing-credits-note">
            {100 - used}% of {money(total)} remaining
          </p>
        </motion.article>

        {/* Credits Consumed */}
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="sa-card stat-card p-7"
        >
          <div className="flex items-center gap-3 text-xs font-bold tracking-[.13em] text-slate-500">
            <span className="stat-icon metric-icon bg-violet-50 text-violet-500">
              <Sparkles size={20} />
            </span>
            CREDITS CONSUMED
          </div>
          <strong className="mt-7 block text-5xl font-black tracking-tight text-slate-950">
            {money(d.consumed)}
          </strong>
          <p className="mt-3 text-sm text-slate-500">{used}% used across recorded transactions</p>
        </motion.article>

        {/* Usage trend (credits-only mode) OR Billing Transactions (billing mode) */}
        {creditsOnly ? (
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.10 }}
            className="sa-card p-6"
          >
            <h2 className="font-bold text-slate-900">Usage trend</h2>
            <div className="mt-4 h-52">
              {trend.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={11} />
                    <YAxis fontSize={11} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 12px 30px rgba(15,23,42,.1)" }} />
                    <Line type="monotone" dataKey="balance" stroke="#1670f8" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="grid h-full place-items-center text-sm text-slate-400">
                  No transactions yet
                </div>
              )}
            </div>
          </motion.article>
        ) : (
          /* Billing Transactions — big & prominent */
          <motion.article
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.10 }}
            className="sa-card stat-card p-7"
          >
            <div className="flex items-center gap-3">
              <span className="stat-icon metric-icon bg-blue-50 text-blue-500">
                <CreditCard size={20} />
              </span>
            </div>
            <strong className="mt-5 block text-5xl font-black tracking-tight text-slate-950">
              {d.transaction_count}
            </strong>
            <p className="mt-2 text-base font-semibold text-slate-600">Billing transactions</p>
            <p className="mt-1 text-xs text-slate-400">All recorded credit movements</p>
          </motion.article>
        )}
      </div>

      {/* ── Transaction history table ── */}
      <section className="sa-card mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="font-bold text-slate-950">Transaction history</h2>
            <p className="text-xs text-slate-500">Newest 50 entries</p>
          </div>
          <button
            className="tbl-action tbl-action-view text-slate-400"
            title="Export transactions"
          >
            <FileText size={18} />
          </button>
        </div>

        {d.transactions.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-slate-50/50 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-4 py-3.5">Type</th>
                  <th className="px-4 py-3.5">Description</th>
                  <th className="px-4 py-3.5">Reference</th>
                  <th className="px-4 py-3.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {d.transactions.map(t => (
                  <tr
                    key={t.id}
                    className="border-t border-slate-100 transition-colors duration-150 hover:bg-blue-50/40"
                  >
                    <td className="px-5 py-3.5 text-slate-500">
                      {new Date(t.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold
                        ${t.type === "CREDIT"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                        }`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">{t.description || "—"}</td>
                    <td className="px-4 py-3.5 font-mono text-xs text-slate-400">
                      {t.reference_id || "—"}
                    </td>
                    <td className={`px-4 py-3.5 text-right font-bold tabular-nums
                      ${t.type === "CREDIT" ? "text-emerald-600" : "text-slate-800"}`}>
                      {t.type === "CREDIT" ? "+" : "−"}{money(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <WalletCards className="mx-auto text-slate-300" size={44} />
            <h3 className="mt-3 font-bold text-slate-700">No billing transactions</h3>
            <p className="mt-1 text-sm text-slate-500">
              Usage will appear when credits are consumed or added.
            </p>
          </div>
        )}
      </section>

      {/* ── Unavailable placeholders (billing mode only) ── */}
      {!creditsOnly && (
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Unavailable
            title="Payment methods"
            text="No payment-method model or API exists in the backend."
          />
          <Unavailable
            title="Invoices & plans"
            text="No invoice or subscription contract exists yet."
          />
        </div>
      )}
    </div>
  );
}

function Unavailable({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6
      transition-all duration-200 hover:border-blue-300 hover:bg-blue-50/30">
      <h3 className="font-bold text-slate-800">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{text}</p>
      <span className="mt-4 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
        Backend contract required
      </span>
    </div>
  );
}
