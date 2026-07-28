"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/providers/theme-provider";

export function DarkModeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <motion.button
      type="button"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={toggle}
      whileTap={{ scale: 0.88 }}
      className="dm-toggle"
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        borderRadius: "50%",
        cursor: "pointer",
        border: isDark
          ? "1px solid rgba(96,165,250,0.35)"
          : "1px solid rgba(100,116,139,0.22)",
        background: isDark
          ? "linear-gradient(135deg,rgba(30,58,138,0.7),rgba(15,23,42,0.85))"
          : "linear-gradient(135deg,rgba(255,255,255,0.9),rgba(241,245,249,0.8))",
        boxShadow: isDark
          ? "0 0 14px rgba(96,165,250,0.28), 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)"
          : "0 2px 12px rgba(15,23,42,0.10), inset 0 1px 0 rgba(255,255,255,0.9)",
        transition: "border-color 0.35s, background 0.35s, box-shadow 0.35s",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {/* Neon ring pulse on dark */}
      {isDark && (
        <motion.span
          style={{
            position: "absolute",
            inset: -4,
            borderRadius: "50%",
            border: "1.5px solid rgba(96,165,250,0.22)",
            pointerEvents: "none",
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Icon swap */}
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.span
            key="moon"
            initial={{ rotate: -40, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 40, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.30, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ display: "flex", color: "#93c5fd", filter: "drop-shadow(0 0 6px #60a5fa)" }}
          >
            <Moon size={18} fill="#93c5fd" />
          </motion.span>
        ) : (
          <motion.span
            key="sun"
            initial={{ rotate: 40, opacity: 0, scale: 0.6 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -40, opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.30, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ display: "flex", color: "#f59e0b", filter: "drop-shadow(0 0 5px #fbbf24)" }}
          >
            <Sun size={18} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
