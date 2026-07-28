"use client";

import { CalendarDays } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

function toInputDate(d: Date) {
  return d.toISOString().slice(0, 10);
}
function fmtRange(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
function getDefaultRange(days = 30) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));
  return { start: toInputDate(start), end: toInputDate(end) };
}

/** Shared hook – returns startDate, endDate, and the picker UI element */
export function useDateRange(days = 30) {
  const defaults = useMemo(() => getDefaultRange(days), [days]);
  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const picker = (
    <div className="relative" ref={ref}>
      <button
        className="secondary-button flex min-h-11 items-center gap-2 px-4"
        onClick={() => setOpen((v) => !v)}
      >
        <CalendarDays size={16} />
        {fmtRange(startDate)} – {fmtRange(endDate)}
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
          <h3 className="mb-3 text-sm font-bold text-slate-700">Filter by Date Range</h3>
          <label className="field mb-3">
            <span className="text-xs">Start Date</span>
            <input
              type="date"
              value={startDate}
              max={endDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </label>
          <label className="field">
            <span className="text-xs">End Date</span>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </label>
          <div className="mt-4 flex justify-end gap-2">
            <button
              className="secondary-button text-xs"
              onClick={() => { setStartDate(defaults.start); setEndDate(defaults.end); }}
            >
              Reset
            </button>
            <button className="primary-button text-xs" onClick={() => setOpen(false)}>
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return { startDate, endDate, picker };
}
