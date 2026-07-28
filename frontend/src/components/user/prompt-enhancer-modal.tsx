"use client";

/**
 * AI Prompt Enhancer Modal
 *
 * Flow:
 *  1. Call POST /api/content/content-drafts/analyze_prompt/ → {content_spec, questions[]}
 *  2. Walk user through each question (single_select | multi_select | text)
 *  3. On finish call POST /api/content/content-drafts/{draftId}/enhance_prompt/
 *     → {enhanced_prompt} which is set back into the textarea
 *
 * The component is self-contained; parent passes:
 *   prompt       – current raw prompt text
 *   draftId      – created draft id (null until first draft is created)
 *   onClose      – cancel
 *   onEnhanced   – receives the new enhanced_prompt string
 */

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronLeft, ChevronRight, Loader2, Sparkles, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { apiClient, parseApiError } from "@/services/api-client";

/* ─── Types matching the backend JSON schema ─────────────── */
type QuestionType = "single_select" | "multi_select" | "text";

interface Question {
  question_text: string;
  type: QuestionType;
  options?: string[];
}

interface AnalyzeResponse {
  content_spec: Record<string, unknown>;
  questions: Question[];
}

interface Props {
  prompt: string;
  draftId: string | null;
  onClose: () => void;
  onEnhanced: (enhanced: string) => void;
}

/* ─── Progress bar ───────────────────────────────────────── */
function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = total > 0 ? ((current + 1) / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-slate-200">
        <motion.div
          className="h-full rounded-full bg-blue-600"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>
      <span className="shrink-0 text-xs font-semibold text-slate-500">
        {current + 1} out of {total}
      </span>
    </div>
  );
}

/* ─── Single question card ───────────────────────────────── */
function QuestionCard({
  question,
  index,
  answer,
  onChange,
}: {
  question: Question;
  index: number;
  answer: string | string[];
  onChange: (val: string | string[]) => void;
}) {
  const isSingle = question.type === "single_select";
  const isMulti  = question.type === "multi_select";
  const isText   = question.type === "text";

  const toggleOption = (opt: string) => {
    const arr = Array.isArray(answer) ? answer : [];
    onChange(arr.includes(opt) ? arr.filter(o => o !== opt) : [...arr, opt]);
  };

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25 }}
    >
      <p className="text-base font-bold leading-snug text-slate-900 mb-5">
        {question.question_text}
      </p>

      {(isSingle || isMulti) && (
        <div className="space-y-2.5">
          {(question.options ?? []).map(opt => {
            const selected = isMulti
              ? (Array.isArray(answer) ? answer : []).includes(opt)
              : answer === opt;

            return (
              <button
                key={opt}
                type="button"
                onClick={() =>
                  isMulti ? toggleOption(opt) : onChange(selected ? "" : opt)
                }
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all
                  ${selected
                    ? "border-blue-500 bg-blue-50 text-blue-800 shadow-[inset_0_0_0_1.5px_#3b82f6]"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-slate-50"
                  }`}
              >
                {/* checkbox / radio visual */}
                <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-${isMulti ? "md" : "full"} border-2 transition-colors
                  ${selected ? "border-blue-500 bg-blue-500" : "border-slate-300 bg-white"}`}>
                  {selected && <Check size={11} className="text-white" strokeWidth={3} />}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {isText && (
        <textarea
          rows={3}
          placeholder="Type your answer here…"
          value={typeof answer === "string" ? answer : ""}
          onChange={e => onChange(e.target.value)}
          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
        />
      )}
    </motion.div>
  );
}

/* ─── Main modal ─────────────────────────────────────────── */
export function PromptEnhancerModal({ prompt, draftId, onClose, onEnhanced }: Props) {
  const [phase, setPhase]         = useState<"loading" | "questions" | "enhancing">("loading");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [contentSpec, setContentSpec] = useState<Record<string, unknown>>({});
  const [step, setStep]           = useState(0);
  const [answers, setAnswers]     = useState<Record<number, string | string[]>>({});
  const [error, setError]         = useState<string | null>(null);

  /* ── Step 1 – fetch questions on mount ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.post<AnalyzeResponse>(
          "/api/content/content-drafts/analyze_prompt/",
          { prompt: prompt.trim() },
        );
        if (cancelled) return;
        setContentSpec(res.data.content_spec ?? {});
        setQuestions(res.data.questions ?? []);
        setPhase("questions");
      } catch (e) {
        if (!cancelled) setError(parseApiError(e));
      }
    })();
    return () => { cancelled = true; };
  }, [prompt]);

  /* ── Answer helpers ── */
  const currentQ  = questions[step];
  const answer    = answers[step] ?? (currentQ?.type === "multi_select" ? [] : "");
  const setAnswer = (val: string | string[]) => setAnswers(prev => ({ ...prev, [step]: val }));

  const canNext = useMemo(() => {
    if (!currentQ) return false;
    if (currentQ.type === "multi_select") return (Array.isArray(answer) ? answer : []).length > 0;
    if (currentQ.type === "text") return (typeof answer === "string" ? answer : "").trim().length > 0;
    return (typeof answer === "string" ? answer : "").length > 0;
  }, [currentQ, answer]);

  const isLast = step === questions.length - 1;

  /* ── Step 2 – submit answers and get enhanced prompt ── */
  const handleFinish = async () => {
    // Build user_answers dict keyed by question text
    const userAnswers: Record<string, string | string[]> = {};
    questions.forEach((q, i) => {
      const ans = answers[i] ?? (q.type === "multi_select" ? [] : "");
      userAnswers[q.question_text] = ans;
    });

    if (!draftId) {
      // No draft yet — merge spec + answers locally, instant, no API call needed
      const lines: string[] = [];

      // Spec fields
      Object.entries(contentSpec).forEach(([key, val]) => {
        if (val === null || val === "" || val === undefined) return;
        const k = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        const v = Array.isArray(val) ? val.join(", ") : String(val);
        lines.push(`${k} = ${v}`);
      });

      // User answers
      Object.entries(userAnswers).forEach(([question, ans]) => {
        if (!ans || ans === "" || (Array.isArray(ans) && ans.length === 0)) return;
        const words = question.replace(/\?$/, "").split(/\s+/);
        const k = words.slice(0, 5).join(" ").replace(/\b\w/g, c => c.toUpperCase());
        const v = Array.isArray(ans) ? ans.join(", ") : String(ans);
        lines.push(`${k} = ${v}`);
      });

      const merged = lines.join("\n");
      onEnhanced(merged || prompt);
      toast.success("Prompt enhanced");
      return;
    }

    // Draft exists — call backend (now instant: no extra AI call)
    setPhase("enhancing");
    try {
      const res = await apiClient.post<{ enhanced_prompt: string }>(
        `/api/content/content-drafts/${draftId}/enhance_prompt/`,
        { content_spec: contentSpec, user_answers: userAnswers },
      );
      onEnhanced(res.data.enhanced_prompt);
      toast.success("Prompt enhanced successfully");
    } catch (e) {
      toast.error(parseApiError(e));
      setPhase("questions");
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        {/* ── Loading overlay ── */}
        {(phase === "loading" || phase === "enhancing") && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-white/90 backdrop-blur-sm">
            <div className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200">
                <Loader2 size={26} className="animate-spin text-white" />
              </div>
              <p className="mt-4 font-bold text-slate-800">
                {phase === "loading" ? "Analyzing your prompt…" : "Enhancing your prompt…"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {phase === "loading" ? "Generating tailored questions with AI" : "Crafting the perfect prompt for you"}
              </p>
            </div>
          </div>
        )}

        {/* ── Error state ── */}
        {error && (
          <div className="p-8 text-center">
            <p className="font-bold text-red-600">Something went wrong</p>
            <p className="mt-1 text-sm text-slate-500">{error}</p>
            <button className="primary-button mt-5 px-6" onClick={onClose}>Close</button>
          </div>
        )}

        {/* ── Questions UI ── */}
        {phase === "questions" && !error && questions.length > 0 && (
          <>
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2">
                  <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600">
                    <Sparkles size={15} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600">AI Prompt Enhancer</p>
                    <h2 className="text-base font-black text-slate-900">
                      Question {step + 1} of {questions.length}
                    </h2>
                  </div>
                </div>
                <div className="mt-3">
                  <ProgressBar current={step} total={questions.length} />
                </div>
              </div>
              <button
                onClick={onClose}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Question body */}
            <div className="min-h-[280px] overflow-hidden px-6 py-6">
              <AnimatePresence mode="wait">
                <QuestionCard
                  key={step}
                  question={currentQ}
                  index={step}
                  answer={answer}
                  onChange={setAnswer}
                />
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
              <button
                disabled={step === 0}
                onClick={() => setStep(s => s - 1)}
                className="secondary-button flex items-center gap-1.5 px-4 disabled:opacity-30"
              >
                <ChevronLeft size={16} /> Previous
              </button>

              {isLast ? (
                <button
                  className="primary-button flex items-center gap-2 px-6"
                  onClick={handleFinish}
                >
                  <Sparkles size={15} /> Enhance Prompt
                </button>
              ) : (
                <button
                  disabled={!canNext}
                  onClick={() => setStep(s => s + 1)}
                  className="primary-button flex items-center gap-1.5 px-5 disabled:opacity-40"
                >
                  Next Question <ChevronRight size={16} />
                </button>
              )}
            </div>
          </>
        )}

        {/* ── Fallback: no questions returned ── */}
        {phase === "questions" && !error && questions.length === 0 && (
          <div className="p-8 text-center">
            <p className="font-bold text-slate-700">No questions generated</p>
            <p className="mt-1 text-sm text-slate-500">Your prompt has enough detail — go ahead and generate content.</p>
            <button className="primary-button mt-5 px-6" onClick={onClose}>Got it</button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
