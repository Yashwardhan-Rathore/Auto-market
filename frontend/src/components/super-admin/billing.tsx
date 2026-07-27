"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  Sparkles,
  Mail,
  Check,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ── Static mock data (replace with API calls when backend is ready) ── */

const statCards = [
  {
    label: "LICENSES REMAINING",
    value: "832",
    sub: "of 1,000",
    note: "83% remaining",
    progress: 83,
    color: "blue",
    icon: Users,
  },
  {
    label: "LICENSES EXPIRY DATE",
    value: "31 Dec 2026",
    sub: "160 days remaining",
    note: null,
    progress: null,
    color: "purple",
    icon: Calendar,
  },
  {
    label: "AI CREDITS LEFT",
    value: "4,680",
    sub: "of 10,000",
    note: "47% remaining",
    progress: 47,
    color: "green",
    icon: Sparkles,
  },
  {
    label: "EMAILS LEFT",
    value: "24,567",
    sub: "of 50,000",
    note: "49% remaining",
    progress: 49,
    color: "orange",
    icon: Mail,
  },
];

const plans = [
  {
    tier: "Marketing Automation",
    name: "Basic",
    nameColor: "text-blue-600",
    current: true,
    buttonLabel: "Current Plan",
    buttonClass:
      "w-full mt-6 rounded-xl border-2 border-blue-600 py-2.5 text-sm font-semibold text-blue-600 transition hover:bg-blue-50",
    features: [
      "Audience segmentation",
      "Email, SMS, and WhatsApp campaign",
      "AI post generation with automatic posting",
      "Post scheduling",
    ],
  },
  {
    tier: "Marketing Automation",
    name: "Pro",
    nameColor: "text-purple-600",
    current: false,
    buttonLabel: "Upgrade to Pro",
    buttonClass:
      "w-full mt-6 rounded-xl border-2 border-purple-600 py-2.5 text-sm font-semibold text-purple-600 transition hover:bg-purple-50",
    features: [
      "Audience segmentation",
      "Email, SMS, and WhatsApp campaign",
      "AI post generation with automatic posting",
      "Post scheduling",
      "Meta ads",
    ],
  },
  {
    tier: "Marketing Automation",
    name: "Premium",
    nameColor: "text-amber-500",
    current: false,
    buttonLabel: "Upgrade to Premium",
    buttonClass:
      "w-full mt-6 rounded-xl border-2 border-amber-500 py-2.5 text-sm font-semibold text-amber-500 transition hover:bg-amber-50",
    features: [
      "Audience segmentation",
      "Email, SMS, and WhatsApp campaign",
      "AI post generation with automatic posting",
      "Post scheduling",
      "Meta ads",
      "Premium lead generation",
    ],
  },
];

const ALL_INVOICES = [
  { name: "Marketing Automation – Basic Plan", id: "INV-2026-0724-001", amount: "₹4,999.00", date: "24 Jul 2026, 12:11 AM" },
  { name: "Marketing Automation – Basic Plan", id: "INV-2026-0624-001", amount: "₹4,999.00", date: "24 Jun 2026, 12:11 AM" },
  { name: "Marketing Automation Setup Fee",    id: "INV-2026-0524-001", amount: "₹2,999.00", date: "24 May 2026, 12:11 AM" },
  { name: "Marketing Automation – Basic Plan", id: "INV-2026-0424-001", amount: "₹4,999.00", date: "24 Apr 2026, 12:11 AM" },
  { name: "Marketing Automation – Basic Plan", id: "INV-2026-0324-001", amount: "₹4,999.00", date: "24 Mar 2026, 12:11 AM" },
  { name: "Marketing Automation – Basic Plan", id: "INV-2026-0224-001", amount: "₹4,999.00", date: "24 Feb 2026, 12:11 AM" },
  { name: "Marketing Automation – Basic Plan", id: "INV-2026-0124-001", amount: "₹4,999.00", date: "24 Jan 2026, 12:11 AM" },
  { name: "Marketing Automation Setup Fee",    id: "INV-2025-1224-001", amount: "₹2,999.00", date: "24 Dec 2025, 12:11 AM" },
  { name: "Marketing Automation – Basic Plan", id: "INV-2025-1124-001", amount: "₹4,999.00", date: "24 Nov 2025, 12:11 AM" },
  { name: "Marketing Automation – Basic Plan", id: "INV-2025-1024-001", amount: "₹4,999.00", date: "24 Oct 2025, 12:11 AM" },
  { name: "Marketing Automation – Basic Plan", id: "INV-2025-0924-001", amount: "₹4,999.00", date: "24 Sep 2025, 12:11 AM" },
  { name: "Marketing Automation – Basic Plan", id: "INV-2025-0824-001", amount: "₹4,999.00", date: "24 Aug 2025, 12:11 AM" },
];

const PAGE_SIZE = 5;

/* ── Progress bar color map ── */
const progressColor: Record<string, string> = {
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  green: "bg-emerald-500",
  orange: "bg-orange-400",
};
const noteColor: Record<string, string> = {
  blue: "text-blue-600",
  purple: "text-purple-600",
  green: "text-emerald-600",
  orange: "text-orange-500",
};

export function SuperAdminBilling() {
  const [invoicePage, setInvoicePage] = useState(1);
  const totalPages = Math.ceil(ALL_INVOICES.length / PAGE_SIZE);
  const pageInvoices = ALL_INVOICES.slice(
    (invoicePage - 1) * PAGE_SIZE,
    invoicePage * PAGE_SIZE,
  );

  return (
    <div>
      {/* ── Heading ── */}
      <div className="mb-7">
        <h1 className="sa-title">BILLING &amp; USAGE</h1>
        <p className="sa-subtitle">Real wallet and transaction data from the billing API</p>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.article
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="sa-card p-5"
          >
            <div className="flex items-center gap-2">
              <span
                className={`grid h-9 w-9 place-items-center rounded-lg
                  ${card.color === "blue"   ? "bg-blue-50 text-blue-500"   : ""}
                  ${card.color === "purple" ? "bg-purple-50 text-purple-500" : ""}
                  ${card.color === "green"  ? "bg-emerald-50 text-emerald-500" : ""}
                  ${card.color === "orange" ? "bg-orange-50 text-orange-400" : ""}
                `}
              >
                <card.icon size={18} />
              </span>
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                {card.label}
              </span>
            </div>

            <strong
              className={`mt-4 block text-3xl font-black tracking-tight
                ${card.color === "purple" ? "text-purple-600" : "text-slate-900"}
              `}
            >
              {card.value}
            </strong>

            <p className="mt-1 text-sm text-slate-400">{card.sub}</p>

            {card.progress !== null && (
              <>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${card.progress}%` }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                    className={`h-full rounded-full ${progressColor[card.color]}`}
                  />
                </div>
                <p className={`mt-1.5 text-xs font-semibold ${noteColor[card.color]}`}>
                  {card.note}
                </p>
              </>
            )}
          </motion.article>
        ))}
      </div>

      {/* ── Our Plans ── */}
      <section className="mt-8">
        <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">OUR PLANS</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Choose the plan that best fits your business needs.
        </p>

        <div className="mt-4 grid gap-5 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              className="sa-card p-6"
            >
              {/* Plan header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-400">{plan.tier}</p>
                  <h3 className={`mt-0.5 text-2xl font-black ${plan.nameColor}`}>
                    {plan.name}
                  </h3>
                </div>
                {plan.current && (
                  <span className="rounded-md bg-slate-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    Current Plan
                  </span>
                )}
              </div>

              {/* Features */}
              <ul className="mt-5 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check
                      size={15}
                      className={`mt-0.5 shrink-0 ${
                        plan.nameColor === "text-amber-500"
                          ? "text-amber-500"
                          : plan.nameColor === "text-purple-600"
                          ? "text-purple-500"
                          : "text-blue-500"
                      }`}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              <button className={plan.buttonClass}>{plan.buttonLabel}</button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Previous Invoices ── */}
      <section className="sa-card mt-8 overflow-hidden">
        <div className="px-6 py-5">
          <h2 className="text-base font-black uppercase tracking-wide text-slate-900">
            PREVIOUS INVOICES
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">List of recent payments and invoices.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-y border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
              <tr>
                  <th className="px-5 py-3.5">Transaction Name</th>
                  <th className="px-4 py-3.5">ID</th>
                  <th className="px-4 py-3.5">Amount</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {pageInvoices.map((inv, i) => (
                <motion.tr
                  key={inv.id + i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-t border-slate-100 hover:bg-blue-50/30"
                >
                  <td className="px-5 py-3.5 text-slate-700">{inv.name}</td>
                  <td className="px-4 py-3.5 font-mono text-xs text-slate-500">{inv.id}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-800">{inv.amount}</td>
                  <td className="px-4 py-3.5 text-slate-500">{inv.date}</td>
                  <td className="px-4 py-3.5 text-center">
                    <button
                      title="Download invoice"
                      className="inline-grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                    >
                      <Download size={14} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3.5">
          <p className="text-xs text-slate-400">
            Showing {(invoicePage - 1) * PAGE_SIZE + 1} to{" "}
            {Math.min(invoicePage * PAGE_SIZE, ALL_INVOICES.length)} of {ALL_INVOICES.length}{" "}
            invoices
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={invoicePage <= 1}
              onClick={() => setInvoicePage((p) => p - 1)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pg) => (
              <button
                key={pg}
                onClick={() => setInvoicePage(pg)}
                className={`grid h-8 w-8 place-items-center rounded-lg text-sm font-semibold transition
                  ${
                    invoicePage === pg
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
              >
                {pg}
              </button>
            ))}

            <button
              disabled={invoicePage >= totalPages}
              onClick={() => setInvoicePage((p) => p + 1)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
