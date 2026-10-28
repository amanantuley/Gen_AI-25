import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Papa from "papaparse";
import { motion, AnimatePresence } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  FiSun,
  FiMoon,
  FiChevronUp,
  FiSearch,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiUsers,
  FiTarget,
  FiCheckCircle,
  FiExternalLink,
  FiAward,
  FiChevronDown,
} from "react-icons/fi";
import Logo from "./assets/logo.svg";

/* ==========================================================================
   GDGC Graphic Poster Shapes (Matching GDGC AIKTC Official Design System)
   ========================================================================== */
function SparkleStar({ className = "", fill = "#ea4335" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill={fill}>
      <path d="M50 0 C50 27.6 27.6 50 0 50 C27.6 50 50 72.4 50 100 C50 72.4 72.4 50 100 50 C72.4 50 50 27.6 50 0 Z" />
    </svg>
  );
}

function Sunburst({ className = "", fill = "#4285f4" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill={fill}>
      <path d="M50 0 L58 15 L74 6 L77 24 L94 22 L89 39 L100 47 L89 56 L94 73 L77 71 L74 89 L58 80 L50 95 L42 80 L26 89 L23 71 L6 73 L11 56 L0 47 L11 39 L6 22 L23 24 L26 6 L42 15 Z" />
    </svg>
  );
}

function SteppedBlock({ className = "", fill = "#4285f4" }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill={fill}>
      <path d="M0 0 H65 V45 H100 V100 H0 Z" />
    </svg>
  );
}

function GeoArch({ className = "", fill = "#ea4335" }) {
  return (
    <svg viewBox="0 0 100 120" className={className} fill={fill}>
      <path d="M0 50 C0 22.38 22.38 0 50 0 C77.62 0 100 22.38 100 50 V120 H0 Z" />
    </svg>
  );
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase();
}

function useDebounced(value, delay = 200) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* Animated Counter */
function CountUp({ value = 0, duration = 800, className = "" }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const end = Number(value);
    if (!Number.isFinite(end) || end <= 0) {
      setDisplay(0);
      return;
    }

    let start = 0;
    const stepTime = Math.max(Math.floor(duration / Math.min(end, 50)), 12);
    const stepIncrement = Math.max(1, Math.floor(end / (duration / stepTime)));

    const timer = setInterval(() => {
      start += stepIncrement;
      if (start >= end) {
        clearInterval(timer);
        setDisplay(end);
      } else {
        setDisplay(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span className={className}>{display}</span>;
}

/* ==========================================================================
   Participant Details Modal (Exact Screenshot & Highly Organised)
   ========================================================================== */
function ParticipantModal({ participant, onClose }) {
  const [showBadges, setShowBadges] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!participant) return null;

  const isRedeemed = String(participant["Access Code Redemption Status"]).trim().toLowerCase() === "yes";
  const isEligible = String(participant["All Skill Badges & Games Completed"]).trim().toLowerCase() === "yes";
  const pct = clamp(Number(participant.percentage) || 0, 0, 100);
  const profileUrl = participant["Google Cloud Skills Boost Profile URL"] || "";

  // Badges list parsing
  const skillBadgesList = (participant["Names of Completed Skill Badges"] || "")
    .split("|")
    .map((s) => s.trim().replace(/\[Skill Badge\]/gi, "").trim())
    .filter(Boolean);

  const arcadeGamesList = (participant["Names of Completed Arcade Games"] || "")
    .split("|")
    .map((s) => s.trim().replace(/\[Game\]/gi, "").trim())
    .filter(Boolean);

  const totalBadgesEarned = skillBadgesList.length + arcadeGamesList.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg bg-white dark:bg-[#202124] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#e8eaed] dark:border-[#3c4043] overflow-hidden my-auto max-h-[90vh] flex flex-col"
      >
        {/* Top 4-Color Accent Line */}
        <div className="google-gradient-bar h-[3.5px] w-full flex-shrink-0" />

        {/* Scrollable Content Container */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5">
          {/* Header Bar: Badges + Close Button */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Rank Pill */}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black shadow-xs ${
                participant.rank === 1
                  ? "bg-gradient-to-br from-[#fde047] to-[#eab308] text-[#713f12] ring-1 ring-amber-400"
                  : participant.rank === 2
                  ? "bg-gradient-to-br from-[#f8fafc] to-[#cbd5e1] text-[#1e293b] ring-1 ring-slate-400"
                  : participant.rank === 3
                  ? "bg-gradient-to-br from-[#fed7aa] to-[#fb923c] text-[#431407] ring-1 ring-orange-400"
                  : "bg-[#e8f0fe] text-[#1a73e8] border border-[#c2e7ff] dark:bg-[#1c3829]/50 dark:text-[#8ab4f8] dark:border-[#29563c]"
              }`}>
                Rank #{participant.rank}
              </span>

              {/* Status Pill */}
              {isEligible ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0] dark:bg-[#1c3829] dark:text-[#86efac] dark:border-[#29563c]">
                  <FiCheck className="w-3.5 h-3.5 stroke-[3]" />
                  Qualified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
                  In Progress
                </span>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#5f6368] dark:text-[#9aa0a6] hover:bg-[#f1f3f4] dark:hover:bg-[#35373a] hover:text-[#202124] dark:hover:text-[#e8eaed] transition-colors"
              aria-label="Close dialog"
            >
              <FiX className="w-5 h-5 stroke-[2.2]" />
            </button>
          </div>

          {/* Participant Name & Email */}
          <div className="pt-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#202124] dark:text-[#e8eaed] tracking-tight">
              {participant["User Name"] || "—"}
            </h2>
            <p className="text-xs sm:text-sm text-[#5f6368] dark:text-[#9aa0a6] font-medium mt-0.5">
              {participant["User Email"] || ""}
            </p>
          </div>

          {/* Main Card: Google Cloud Study Jams 2026 Completion */}
          <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5 bg-[#f8f9fa] dark:bg-[#28292a] border border-[#e8eaed] dark:border-[#3c4043] shadow-xs space-y-4">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="uppercase tracking-wider text-[#5f6368] dark:text-[#9aa0a6]">
                Google Cloud Study Jams 2026 Completion
              </span>
              <span className="text-sm font-black text-[#1a73e8] dark:text-[#8ab4f8]">
                {pct.toFixed(0)}%
              </span>
            </div>

            {/* Gradient Progress Bar */}
            <div className="w-full h-2.5 rounded-full overflow-hidden bg-[#e8eaed] dark:bg-[#3c4043]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#4285f4] via-[#34a853] to-[#34a853] transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>

            {/* 3 Metrics: Badges | Arcade | Access Code */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#e8eaed]/70 dark:border-[#3c4043]/70 text-center">
              <div>
                <div className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] font-medium">Skill Badges</div>
                <div className="text-sm sm:text-base font-extrabold text-[#202124] dark:text-[#e8eaed] mt-0.5">
                  {participant.badgesCompleted ?? 0} <span className="text-xs font-normal text-[#5f6368] dark:text-[#9aa0a6]">/ 19</span>
                </div>
              </div>

              <div>
                <div className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] font-medium">Arcade Games</div>
                <div className="text-sm sm:text-base font-extrabold text-[#202124] dark:text-[#e8eaed] mt-0.5">
                  {participant.gamesCompleted ?? 0} <span className="text-xs font-normal text-[#5f6368] dark:text-[#9aa0a6]">/ 1</span>
                </div>
              </div>

              <div>
                <div className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] font-medium">Access Code</div>
                <div className="mt-0.5 flex items-center justify-center">
                  {isRedeemed ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#15803d] dark:text-[#86efac]">
                      <FiCheck className="w-3.5 h-3.5 stroke-[3]" />
                      Redeemed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#b91c1c] dark:text-[#fca5a5]">
                      <FiX className="w-3.5 h-3.5 stroke-[3]" />
                      Not Redeemed
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Profile Card */}
          <div className="rounded-xl sm:rounded-2xl p-3.5 sm:p-4 bg-[#f8f9fa] dark:bg-[#28292a] border border-[#e8eaed] dark:border-[#3c4043] flex items-center justify-between gap-3 shadow-xs">
            <div className="min-w-0 pr-1">
              <div className="font-bold text-xs sm:text-sm text-[#202124] dark:text-[#e8eaed]">
                Google Cloud Skills Boost
              </div>
              <div className="text-[11px] text-[#5f6368] dark:text-[#9aa0a6] truncate font-medium mt-0.5" title={profileUrl}>
                {profileUrl ? profileUrl.replace(/^https?:\/\//, "") : "No public profile link provided"}
              </div>
            </div>

            {profileUrl ? (
              <a
                href={profileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#1a73e8] hover:bg-[#1557b0] text-white shadow-sm transition-all duration-150 flex-shrink-0 active:scale-95"
              >
                <span>View Profile</span>
                <FiExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-xs text-[#5f6368] dark:text-[#9aa0a6] italic px-2">
                Unavailable
              </span>
            )}
          </div>

          {/* Organized Badge Details Breakdown */}
          {totalBadgesEarned > 0 && (
            <div className="rounded-xl sm:rounded-2xl border border-[#e8eaed] dark:border-[#3c4043] overflow-hidden bg-white dark:bg-[#242526]">
              <button
                type="button"
                onClick={() => setShowBadges((v) => !v)}
                className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-[#202124] dark:text-[#e8eaed] hover:bg-[#f8f9fa] dark:hover:bg-[#28292a] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FiAward className="w-4 h-4 text-[#1a73e8] dark:text-[#8ab4f8]" />
                  <span>Completed Badges & Games ({totalBadgesEarned})</span>
                </div>
                <FiChevronDown
                  className={`w-4 h-4 text-[#5f6368] transition-transform duration-200 ${
                    showBadges ? "rotate-180" : ""
                  }`}
                />
              </button>

              {showBadges && (
                <div className="p-3.5 pt-0 max-h-56 overflow-y-auto space-y-2 border-t border-[#e8eaed] dark:border-[#3c4043]">
                  {/* Skill Badges */}
                  {skillBadgesList.length > 0 && (
                    <div className="space-y-1 pt-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#5f6368] dark:text-[#9aa0a6]">
                        Skill Badges ({skillBadgesList.length})
                      </div>
                      <div className="space-y-1">
                        {skillBadgesList.map((badge, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 p-1.5 rounded-lg bg-[#f8f9fa] dark:bg-[#28292a] text-[11px] text-[#202124] dark:text-[#e8eaed]"
                          >
                            <span className="w-4 h-4 rounded-full bg-[#dcfce7] dark:bg-[#1c3829] text-[#15803d] dark:text-[#86efac] flex items-center justify-center flex-shrink-0 mt-0.5">
                              <FiCheck className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                            <span>{badge}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Arcade Games */}
                  {arcadeGamesList.length > 0 && (
                    <div className="space-y-1 pt-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#5f6368] dark:text-[#9aa0a6]">
                        Arcade Games ({arcadeGamesList.length})
                      </div>
                      <div className="space-y-1">
                        {arcadeGamesList.map((game, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2 p-1.5 rounded-lg bg-[#f8f9fa] dark:bg-[#28292a] text-[11px] text-[#202124] dark:text-[#e8eaed]"
                          >
                            <span className="w-4 h-4 rounded-full bg-[#dcfce7] dark:bg-[#1c3829] text-[#15803d] dark:text-[#86efac] flex items-center justify-center flex-shrink-0 mt-0.5">
                              <FiCheck className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                            <span>{game}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

/* ==========================================================================
   Plain White Leaderboard Box (Exact Content from Reference Screenshot)
   Columns: Rank | Name & Email | Access Code | Eligible | Badges | Arcade | Progress
   ========================================================================== */
function LeaderboardBox({ row = {}, onSelect }) {
  const isRedeemed = String(row["Access Code Redemption Status"]).trim().toLowerCase() === "yes";
  const isEligible = String(row["All Skill Badges & Games Completed"]).trim().toLowerCase() === "yes";
  const pct = clamp(Number(row.percentage) || 0, 0, 100);

  // Top 3 specific outline & inner shade styles
  const rankTheme = useMemo(() => {
    if (row.rank === 1) {
      return {
        box: "border-2 border-[#f59e0b] dark:border-[#fbbf24] shadow-[inset_0_1px_10px_rgba(245,158,11,0.14)] dark:shadow-[inset_0_1px_12px_rgba(251,191,36,0.12)] bg-gradient-to-r from-[#fffdf0] via-white to-white dark:from-[#352a14]/50 dark:via-[#28292a] dark:to-[#28292a]",
        badgeDesktop: "bg-gradient-to-br from-[#fde047] to-[#eab308] text-[#713f12] ring-1 ring-amber-400",
        badgeMobile: "bg-gradient-to-br from-[#fde047] to-[#eab308] text-[#713f12]",
      };
    }
    if (row.rank === 2) {
      return {
        box: "border-2 border-[#94a3b8] dark:border-[#94a3b8] shadow-[inset_0_1px_10px_rgba(148,163,184,0.18)] dark:shadow-[inset_0_1px_12px_rgba(148,163,184,0.12)] bg-gradient-to-r from-[#f8fafc] via-white to-white dark:from-[#2c323d]/50 dark:via-[#28292a] dark:to-[#28292a]",
        badgeDesktop: "bg-gradient-to-br from-[#f8fafc] to-[#cbd5e1] text-[#1e293b] ring-1 ring-slate-400",
        badgeMobile: "bg-gradient-to-br from-[#f8fafc] to-[#cbd5e1] text-[#1e293b]",
      };
    }
    if (row.rank === 3) {
      return {
        box: "border-2 border-[#ea580c] dark:border-[#f97316] shadow-[inset_0_1px_10px_rgba(234,88,12,0.14)] dark:shadow-[inset_0_1px_12px_rgba(249,115,22,0.12)] bg-gradient-to-r from-[#fff7ed] via-white to-white dark:from-[#362319]/50 dark:via-[#28292a] dark:to-[#28292a]",
        badgeDesktop: "bg-gradient-to-br from-[#fed7aa] to-[#fb923c] text-[#431407] ring-1 ring-orange-400",
        badgeMobile: "bg-gradient-to-br from-[#fed7aa] to-[#fb923c] text-[#431407]",
      };
    }
    return {
      box: "border border-[#e8eaed] dark:border-[#3c4043] bg-white dark:bg-[#28292a]",
      badgeDesktop: "",
      badgeMobile: "",
    };
  }, [row.rank]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      onClick={() => onSelect?.(row)}
      title="Click to view participant details"
      className={`w-full rounded-xl sm:rounded-2xl px-3 sm:px-6 py-2.5 sm:py-4 ${rankTheme.box} shadow-sm sm:shadow-md hover:shadow-md sm:hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.002] active:scale-[0.998]`}
    >
      {/* Desktop Grid Layout (Exact Match to User Screenshot) */}
      <div className="hidden md:grid grid-cols-12 items-center gap-3 text-xs sm:text-sm">
        {/* 1. Rank */}
        <div className="col-span-1 pl-1 flex items-center">
          {row.rank <= 3 ? (
            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-black text-xs shadow-sm ${rankTheme.badgeDesktop}`}>
              {row.rank}
            </span>
          ) : (
            <span className="font-bold text-sm sm:text-base text-[#202124] dark:text-[#e8eaed]">
              {row.rank}
            </span>
          )}
        </div>

        {/* 2. Name & Email */}
        <div className="col-span-3 min-w-0 pr-2">
          <div className="font-bold text-sm sm:text-base text-[#202124] dark:text-[#e8eaed] truncate" title={row["User Name"]}>
            {row["User Name"] || "—"}
          </div>
          <div className="text-xs text-[#5f6368] dark:text-[#9aa0a6] truncate font-medium mt-0.5" title={row["User Email"]}>
            {row["User Email"] || ""}
          </div>
        </div>

        {/* 3. Access Code */}
        <div className="col-span-2 flex items-center justify-center">
          {isRedeemed ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0] dark:bg-[#1c3829] dark:text-[#86efac] dark:border-[#29563c]">
              <FiCheck className="w-3.5 h-3.5 stroke-[3]" />
              Yes
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca] dark:bg-[#482024] dark:text-[#fca5a5] dark:border-[#6f2c33]">
              <FiX className="w-3.5 h-3.5 stroke-[3]" />
              No
            </span>
          )}
        </div>

        {/* 4. Eligible */}
        <div className="col-span-2 flex items-center justify-center">
          {isEligible ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0] dark:bg-[#1c3829] dark:text-[#86efac] dark:border-[#29563c]">
              <FiCheck className="w-3.5 h-3.5 stroke-[3]" />
              Yes
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca] dark:bg-[#482024] dark:text-[#fca5a5] dark:border-[#6f2c33]">
              <FiX className="w-3.5 h-3.5 stroke-[3]" />
              No
            </span>
          )}
        </div>

        {/* 5. Badges */}
        <div className="col-span-1 text-center font-bold text-sm sm:text-base text-[#202124] dark:text-[#e8eaed]">
          {row.badgesCompleted ?? 0}
        </div>

        {/* 6. Arcade */}
        <div className="col-span-1 text-center font-bold text-sm sm:text-base text-[#202124] dark:text-[#e8eaed]">
          {row.gamesCompleted ?? 0}
        </div>

        {/* 7. Progress */}
        <div className="col-span-2 flex items-center justify-end gap-3 pr-1">
          <div className="flex-1 h-2 rounded-full overflow-hidden bg-[#f1f3f4] dark:bg-[#3c4043]">
            <div
              className="h-full rounded-full bg-[#4285f4] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs font-bold text-[#202124] dark:text-[#e8eaed] w-10 text-right">
            {pct.toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Mobile Card View (Minimal, compact & crisp) */}
      <div className="md:hidden space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {row.rank <= 3 ? (
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-black text-[11px] flex-shrink-0 shadow-xs ${rankTheme.badgeMobile}`}>
                #{row.rank}
              </span>
            ) : (
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-800 font-bold text-[11px] text-[#202124] dark:text-[#e8eaed] flex-shrink-0">
                #{row.rank}
              </span>
            )}
            <div className="min-w-0">
              <div className="font-bold text-xs text-[#202124] dark:text-[#e8eaed] truncate" title={row["User Name"]}>{row["User Name"]}</div>
              <div className="text-[10px] text-[#5f6368] dark:text-[#9aa0a6] truncate font-medium" title={row["User Email"]}>{row["User Email"]}</div>
            </div>
          </div>
          <span className="font-bold text-xs text-[#202124] dark:text-[#e8eaed] flex-shrink-0">{pct.toFixed(0)}%</span>
        </div>

        <div className="w-full h-1.5 rounded-full overflow-hidden bg-[#f1f3f4] dark:bg-[#3c4043]">
          <div className="h-full rounded-full bg-[#4285f4]" style={{ width: `${pct}%` }} />
        </div>

        <div className="flex items-center justify-between text-[10px] pt-0.5">
          <div className="flex items-center gap-1.5">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${isRedeemed ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#fee2e2] text-[#b91c1c]"}`}>
              Code: {isRedeemed ? "Yes" : "No"}
            </span>
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${isEligible ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#fee2e2] text-[#b91c1c]"}`}>
              Eligible: {isEligible ? "Yes" : "No"}
            </span>
          </div>
          <span className="font-medium text-[#5f6368] dark:text-[#9aa0a6]">
            Badges: <b className="text-[#202124] dark:text-[#e8eaed]">{row.badgesCompleted ?? 0}</b> · Arcade: <b className="text-[#202124] dark:text-[#e8eaed]">{row.gamesCompleted ?? 0}</b>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ==========================================================================
   Main Leaderboard Application
   ========================================================================== */

export default function Home() {
  // Core Data
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounced(searchQuery, 200);

  // Selected participant for popup modal
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  // UI State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");

  // Theme: Default to FALSE (Light Theme)
  const [darkMode, setDarkMode] = useState(false);

  // Refs
  const backToTopRef = useRef(null);
  const searchInputRef = useRef(null);

  // AOS
  useEffect(() => {
    AOS.init({ duration: 500, once: true });
  }, []);

  // Sync theme
  useEffect(() => {
    try {
      localStorage.setItem("gdgc_darkmode", darkMode ? "true" : "false");
    } catch (e) {}

    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Keyboard shortcut '/'
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Scroll listener for back-to-top
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 400) {
        backToTopRef.current?.classList.remove("opacity-0", "pointer-events-none");
      } else {
        backToTopRef.current?.classList.add("opacity-0", "pointer-events-none");
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Load CSV function
  const loadLeaderboardData = useCallback((showSpinner = false) => {
    if (showSpinner) setIsRefreshing(true);

    Papa.parse("./leaderboard.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const mapped = result.data
          .map((row) => {
            const badgesCompleted = parseInt(row["# of Skill Badges Completed"], 10) || 0;
            const gamesCompleted = parseInt(row["# of Arcade Games Completed"], 10) || 0;
            const totalItems = 20; // 19 skill badges + 1 arcade game
            const percentage = clamp(((badgesCompleted + gamesCompleted) / totalItems) * 100, 0, 100);

            return {
              ...row,
              badgesCompleted,
              gamesCompleted,
              percentage,
            };
          })
          .filter((r) => r["User Name"] || r["User Email"]);

        // Sort: percentage desc, badges desc, name asc
        mapped.sort((a, b) => {
          const pctDiff = b.percentage - a.percentage;
          if (pctDiff !== 0) return pctDiff;
          const badgeDiff = b.badgesCompleted - a.badgesCompleted;
          if (badgeDiff !== 0) return badgeDiff;
          return (a["User Name"] || "").localeCompare(b["User Name"] || "");
        });

        // Assign Rank
        mapped.forEach((row, idx) => {
          row.rank = idx + 1;
        });

        setLeaderboardData(mapped);
        setLastUpdated(
          new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        );
        if (showSpinner) {
          setTimeout(() => setIsRefreshing(false), 350);
        }
      },
      error: (err) => {
        console.error("CSV parse error:", err);
        if (showSpinner) setIsRefreshing(false);
      },
    });
  }, []);

  // Initial CSV load
  useEffect(() => {
    loadLeaderboardData(false);
  }, [loadLeaderboardData]);

  // Top 3 performers for podium
  const topOne = leaderboardData[0];
  const topTwo = leaderboardData[1];
  const topThreeUser = leaderboardData[2];

  // Filtered rows by search query
  const filtered = useMemo(() => {
    const q = (debouncedSearch || "").trim().toLowerCase();
    if (!q) return leaderboardData;

    return leaderboardData.filter((r) => {
      const nameMatch = (r["User Name"] || "").toLowerCase().includes(q);
      const emailMatch = (r["User Email"] || "").toLowerCase().includes(q);
      const rankMatch = String(r.rank).includes(q);

      return nameMatch || emailMatch || rankMatch;
    });
  }, [leaderboardData, debouncedSearch]);

  return (
    <div className={`min-h-screen relative overflow-x-hidden bg-white dark:bg-[#1e1f20] gdgc-graph-grid ${darkMode ? "text-[#e8eaed]" : "text-[#202124]"} transition-colors duration-200`}>
      {/* GDGC Poster Background: Faint Clean Graph Paper Grid + Subtle Geometric Brand Accents (Minimal on Mobile) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none" aria-hidden="true">
        {/* TOP-LEFT CLUSTER (Arch & Stepped Block hidden on mobile; gentle soft green circle kept) */}
        <div className="hidden sm:block absolute -top-10 -left-12 w-64 h-72 opacity-[0.09] dark:opacity-[0.07] animate-ambient-float">
          <GeoArch className="w-full h-full" fill="#ea4335" />
        </div>
        <div className="absolute top-4 left-6 sm:top-8 sm:left-28 w-14 h-14 sm:w-28 sm:h-28 rounded-full bg-[#34a853] opacity-[0.08] dark:opacity-[0.06] animate-ambient-float-reverse" />
        <div className="hidden sm:block absolute top-44 -left-6 w-24 h-24 opacity-[0.07] dark:opacity-[0.06]">
          <SteppedBlock className="w-full h-full" fill="#4285f4" />
        </div>

        {/* TOP-RIGHT CLUSTER (Corner disc & yellow arc hidden on mobile; single subtle sparkle kept) */}
        <div className="hidden sm:block absolute -top-8 -right-8 w-44 h-44 rounded-full bg-[#4285f4] opacity-[0.08] dark:opacity-[0.06] animate-ambient-float" />
        <div className="absolute top-14 right-6 sm:top-20 sm:right-24 w-8 h-8 sm:w-16 sm:h-16 opacity-[0.14] dark:opacity-[0.10] animate-ambient-float-reverse">
          <SparkleStar className="w-full h-full" fill="#ea4335" />
        </div>
        <div className="hidden sm:block absolute top-48 -right-4 w-28 h-20 rounded-l-full bg-[#fbbc04] opacity-[0.11] dark:opacity-[0.08] animate-ambient-float" />

        {/* MID-PAGE LEFT CLUSTER (Desktop only to prevent clutter on mobile) */}
        <div className="hidden sm:block absolute top-[48%] -left-12 sm:-left-8 w-36 h-36 sm:w-48 sm:h-48 opacity-[0.07] dark:opacity-[0.05] animate-spin-slow">
          <Sunburst className="w-full h-full" fill="#4285f4" />
        </div>
        <div className="hidden sm:block absolute top-[58%] left-10 w-24 h-8 rounded-full bg-[#fbbc04] opacity-[0.12] dark:opacity-[0.09] rotate-[-8deg] animate-ambient-float" />

        {/* MID-PAGE RIGHT CLUSTER (Desktop only) */}
        <div className="hidden sm:block absolute top-[52%] right-6 sm:right-16 w-10 h-10 sm:w-14 sm:h-14 opacity-[0.16] dark:opacity-[0.12] animate-ambient-float">
          <SparkleStar className="w-full h-full" fill="#ea4335" />
        </div>
        <div className="hidden sm:block absolute top-[62%] -right-6 w-32 h-12 rounded-l-full bg-[#34a853] opacity-[0.09] dark:opacity-[0.07] animate-ambient-float-reverse" />

        {/* BOTTOM / LOWER CLUSTER (Desktop only) */}
        <div className="hidden sm:block absolute bottom-16 left-12 w-14 h-14 opacity-[0.14] dark:opacity-[0.10] animate-ambient-float">
          <SparkleStar className="w-full h-full" fill="#ea4335" />
        </div>
        <div className="hidden sm:block absolute bottom-8 right-12 w-28 h-28 opacity-[0.07] dark:opacity-[0.05] animate-spin-slow">
          <Sunburst className="w-full h-full" fill="#4285f4" />
        </div>
      </div>

      {/* Official Google 4-Color Accent Strip */}
      <div className="google-gradient-bar h-[3.5px] w-full sticky top-0 z-50" />

      {/* Header Bar */}
      <header
        className={`sticky top-[3.5px] z-40 transition-colors duration-200 border-b ${
          darkMode ? "bg-[#1e1f20]/80 border-[#3c4043]" : "bg-white/80 border-[#e8eaed]"
        } backdrop-blur-md`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center">
            <img src={Logo} alt="GDGC Logo" className="h-8 sm:h-9 w-auto flex-shrink-0" />
          </div>

          {/* Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Refresh */}
            <button
              onClick={() => loadLeaderboardData(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-[#e8eaed] dark:border-[#3c4043] bg-white/90 dark:bg-[#28292a]/90 text-[#5f6368] dark:text-[#9aa0a6] hover:bg-[#f1f3f4] dark:hover:bg-[#35373a] shadow-sm transition-colors"
              title="Refresh Leaderboard"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#1a73e8] dark:text-[#8ab4f8]" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => setDarkMode((d) => !d)}
              className="p-2 rounded-full border border-[#e8eaed] dark:border-[#3c4043] bg-white/90 dark:bg-[#28292a]/90 text-[#5f6368] dark:text-[#9aa0a6] hover:bg-[#f1f3f4] dark:hover:bg-[#35373a] shadow-sm transition-colors"
              title={darkMode ? "Switch to Light Theme" : "Switch to Dark Theme"}
              aria-label="Toggle Theme"
            >
              {darkMode ? <FiSun className="w-4 h-4 text-[#fdd663]" /> : <FiMoon className="w-4 h-4 text-[#1a73e8]" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-7 pb-4 sm:py-8">
        {/* Hero Section */}
        <section className="text-center pt-2 sm:pt-0 mb-5 sm:mb-8" data-aos="fade-up">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-white/80 dark:bg-[#28292a]/80 backdrop-blur-sm border border-[#e8eaed] dark:border-[#3c4043] text-[#5f6368] dark:text-[#9aa0a6] shadow-sm mb-2 sm:mb-3">
            <span className="w-2 h-2 rounded-full bg-[#34a853] animate-pulse" />
            <span>Google Developer Groups on Campus · AIKTC</span>
          </div>

          <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            <span className="text-[#4285f4]">GenAI</span>{" "}
            <span className="text-[#ea4335]">Study</span>{" "}
            <span className="text-[#fbbc04] dark:text-[#fdd663]">Jams</span>{" "}
            <span className="text-[#34a853]">2026</span>{" "}
            <span className="text-[#4285f4] dark:text-[#8ab4f8]">Leaderboard</span>
          </h1>
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-base text-[#5f6368] dark:text-[#9aa0a6] max-w-2xl mx-auto font-medium">
            Institute-level leaderboard for GDGC AIKTC. Track badges, arcade games and completion status.
          </p>

          {/* Top 3 Podium: Side-by-Side (2 - 1 - 3) on Both Mobile & Desktop (Minimal & Proportional) */}
          {topOne && (
            <div className="mt-4 sm:mt-7 grid grid-cols-3 gap-2 sm:gap-5 max-w-[340px] sm:max-w-2xl mx-auto items-end pt-2 sm:pt-4 pb-1 sm:pb-2">
              {/* Rank 2 (Left) - Silver Outline & Inner Shade */}
              {topTwo && (
                <div
                  onClick={() => setSelectedParticipant(topTwo)}
                  role="button"
                  tabIndex={0}
                  title={`Click to view ${topTwo["User Name"]}'s details`}
                  className="order-1 relative rounded-xl sm:rounded-2xl p-1.5 sm:p-4 border-2 border-[#94a3b8] dark:border-[#94a3b8]/80 shadow-[inset_0_2px_14px_rgba(148,163,184,0.22)] dark:shadow-[inset_0_2px_16px_rgba(148,163,184,0.15)] bg-gradient-to-b from-[#f8fafc] via-white to-[#f1f5f9] dark:from-[#2c323d] dark:via-[#28292a] dark:to-[#28292a] shadow-md shadow-slate-500/10 hover:shadow-xl hover:shadow-slate-500/20 transition-all duration-200 text-center cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="absolute -top-1.5 -right-1.5 sm:-top-2.5 sm:-right-2.5 w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-[#f8fafc] via-[#cbd5e1] to-[#94a3b8] text-[#1e293b] border sm:border-2 border-white dark:border-[#28292a] font-black text-[9px] sm:text-xs flex items-center justify-center shadow-sm ring-1 ring-slate-400/40">
                    2
                  </div>
                  <div className="w-7 h-7 sm:w-13 sm:h-13 rounded-full mx-auto bg-gradient-to-br from-[#f1f5f9] to-[#e2e8f0] text-[#334155] dark:text-[#e2e8f0] border-2 border-[#94a3b8] ring-2 ring-[#f1f5f9] dark:ring-[#334155]/50 flex items-center justify-center text-[10px] sm:text-lg font-bold shadow-sm mb-1 sm:mb-2.5">
                    {getInitials(topTwo["User Name"])}
                  </div>
                  <div className="font-extrabold text-[#1a73e8] dark:text-[#60a5fa] text-[10px] sm:text-sm truncate px-0.5" title={topTwo["User Name"]}>
                    {topTwo["User Name"]}
                  </div>
                  <div className="text-[8.5px] sm:text-xs font-semibold text-[#5f6368] dark:text-[#9aa0a6] mt-0.5 sm:mt-1">
                    {(topTwo.badgesCompleted || 0) + (topTwo.gamesCompleted || 0)}/20 pts
                  </div>
                  <div className="text-[8px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-300 mt-0.5 sm:mt-2">
                    Level: Qualified
                  </div>
                </div>
              )}

              {/* Rank 1 (Center - Elevated) - Gold Outline & Inner Shade */}
              <div
                onClick={() => setSelectedParticipant(topOne)}
                role="button"
                tabIndex={0}
                title={`Click to view ${topOne["User Name"]}'s details`}
                className="order-2 relative rounded-xl sm:rounded-2xl p-2 sm:p-5 border-2 border-[#f59e0b] dark:border-[#fbbf24] shadow-[inset_0_2px_16px_rgba(245,158,11,0.22)] dark:shadow-[inset_0_2px_18px_rgba(251,191,36,0.18)] bg-gradient-to-b from-[#fffdf0] via-white to-[#fffbf0] dark:from-[#352a14] dark:via-[#28292a] dark:to-[#28292a] shadow-lg sm:shadow-xl shadow-amber-500/15 hover:shadow-2xl hover:shadow-amber-500/25 transition-all duration-200 text-center -translate-y-1.5 sm:-translate-y-3 cursor-pointer hover:scale-[1.03] active:scale-[0.98]"
              >
                <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#fde047] via-[#eab308] to-[#ca8a04] text-[#713f12] border sm:border-2 border-white dark:border-[#28292a] font-black text-[10px] sm:text-sm flex items-center justify-center shadow-md ring-1 ring-amber-400/50">
                  1
                </div>
                <div className="w-9 h-9 sm:w-16 sm:h-16 rounded-full mx-auto bg-gradient-to-br from-[#fef3c7] to-[#fde68a] text-[#b45309] border-2 border-[#f59e0b] ring-2 ring-[#fef3c7] dark:ring-[#78350f]/50 flex items-center justify-center text-xs sm:text-xl font-black shadow-sm mb-1 sm:mb-2.5">
                  {getInitials(topOne["User Name"])}
                </div>
                <div className="font-extrabold text-[#1a73e8] dark:text-[#60a5fa] text-[11px] sm:text-base truncate px-0.5" title={topOne["User Name"]}>
                  {topOne["User Name"]}
                </div>
                <div className="text-[9px] sm:text-xs font-semibold text-[#5f6368] dark:text-[#9aa0a6] mt-0.5 sm:mt-1">
                  {(topOne.badgesCompleted || 0) + (topOne.gamesCompleted || 0)}/20 pts
                </div>
                <div className="text-[8.5px] sm:text-xs font-bold text-amber-700 dark:text-amber-300 mt-0.5 sm:mt-2">
                  Level: Qualified
                </div>
              </div>

              {/* Rank 3 (Right) - Bronze Outline & Inner Shade */}
              {topThreeUser && (
                <div
                  onClick={() => setSelectedParticipant(topThreeUser)}
                  role="button"
                  tabIndex={0}
                  title={`Click to view ${topThreeUser["User Name"]}'s details`}
                  className="order-3 relative rounded-xl sm:rounded-2xl p-1.5 sm:p-4 border-2 border-[#ea580c] dark:border-[#f97316] shadow-[inset_0_2px_14px_rgba(234,88,12,0.18)] dark:shadow-[inset_0_2px_16px_rgba(249,115,22,0.15)] bg-gradient-to-b from-[#fff7ed] via-white to-[#ffedd5] dark:from-[#362319] dark:via-[#28292a] dark:to-[#28292a] shadow-md shadow-orange-500/10 hover:shadow-xl hover:shadow-orange-500/20 transition-all duration-200 text-center cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="absolute -top-1.5 -right-1.5 sm:-top-2.5 sm:-right-2.5 w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-[#ffedd5] via-[#fb923c] to-[#ea580c] text-[#431407] border sm:border-2 border-white dark:border-[#28292a] font-black text-[9px] sm:text-xs flex items-center justify-center shadow-sm ring-1 ring-orange-400/40">
                    3
                  </div>
                  <div className="w-7 h-7 sm:w-13 sm:h-13 rounded-full mx-auto bg-gradient-to-br from-[#ffedd5] to-[#fed7aa] text-[#9a3412] dark:text-[#ffedd5] border-2 border-[#ea580c] ring-2 ring-[#ffedd5] dark:ring-[#7c2d12]/50 flex items-center justify-center text-[10px] sm:text-lg font-bold shadow-sm mb-1 sm:mb-2.5">
                    {getInitials(topThreeUser["User Name"])}
                  </div>
                  <div className="font-extrabold text-[#1a73e8] dark:text-[#60a5fa] text-[10px] sm:text-sm truncate px-0.5" title={topThreeUser["User Name"]}>
                    {topThreeUser["User Name"]}
                  </div>
                  <div className="text-[8.5px] sm:text-xs font-semibold text-[#5f6368] dark:text-[#9aa0a6] mt-0.5 sm:mt-1">
                    {(topThreeUser.badgesCompleted || 0) + (topThreeUser.gamesCompleted || 0)}/20 pts
                  </div>
                  <div className="text-[8px] sm:text-[11px] font-bold text-orange-800 dark:text-orange-300 mt-0.5 sm:mt-2">
                    Level: Qualified
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Search Bar (Centered in middle, compact width, with Google 4-Color gradient outline) */}
        <section className="mt-14 sm:mt-20 mb-7 sm:mb-9 flex justify-center px-4">
          <div className="w-full max-w-sm sm:max-w-md p-[1.5px] rounded-full google-border-pill shadow-sm sm:shadow-md hover:shadow-md transition-shadow">
            <div className="relative w-full rounded-full bg-white dark:bg-[#28292a] flex items-center">
              <div className="absolute inset-y-0 left-0 pl-3.5 sm:pl-4 flex items-center pointer-events-none text-[#5f6368] dark:text-[#9aa0a6]">
                <FiSearch className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4285f4]" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email or rank..."
                className="w-full pl-9 sm:pl-10 pr-8 sm:pr-9 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm bg-transparent text-[#202124] dark:text-[#e8eaed] placeholder-[#80868b] dark:placeholder-[#9aa0a6] focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 sm:pr-3.5 flex items-center text-[#5f6368] dark:text-[#9aa0a6] hover:text-[#202124] dark:hover:text-[#e8eaed]"
                  title="Clear search"
                >
                  <FiX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Header Bar Above Boxes (Exact Columns as Screenshot) */}
        <div className="hidden md:grid grid-cols-12 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#5f6368] dark:text-[#9aa0a6] mb-2">
          <div className="col-span-1 pl-1">Rank</div>
          <div className="col-span-3">Name & Email</div>
          <div className="col-span-2 text-center">Access Code</div>
          <div className="col-span-2 text-center">Eligible</div>
          <div className="col-span-1 text-center">Badges</div>
          <div className="col-span-1 text-center">Arcade</div>
          <div className="col-span-2 text-right pr-1">Progress</div>
        </div>

        {/* List of Leaderboard Boxes (White Box with Drop Shadow) */}
        <section className="space-y-2 sm:space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white dark:bg-[#28292a] rounded-2xl p-12 text-center border border-[#e8eaed] dark:border-[#3c4043] shadow-md text-[#5f6368] dark:text-[#9aa0a6]">
              <FiSearch className="w-8 h-8 mx-auto opacity-40 mb-2" />
              <div className="text-base font-bold text-[#202124] dark:text-[#e8eaed]">No matching participants found</div>
              <div className="text-xs opacity-75 mt-1">Try searching with a different name, email, or clearing filters</div>
            </div>
          ) : (
            filtered.map((row) => (
              <LeaderboardBox
                key={row["User Email"] || row.rank}
                row={row}
                onSelect={setSelectedParticipant}
              />
            ))
          )}
        </section>

        {/* Footer */}
        <footer className="mt-12 py-8 border-t border-[#e8eaed] dark:border-[#3c4043] text-center text-xs text-[#5f6368] dark:text-[#9aa0a6] space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4285f4]" />
            <span className="w-2 h-2 rounded-full bg-[#ea4335]" />
            <span className="w-2 h-2 rounded-full bg-[#fbbc04]" />
            <span className="w-2 h-2 rounded-full bg-[#34a853]" />
            <span className="font-bold text-[#202124] dark:text-[#e8eaed] ml-1">
              Google Developer Groups on Campus (GDGC) · AIKTC
            </span>
          </div>
          <p>
            Anjuman-I-Islam&apos;s Kalsekar Technical Campus · GenAI Study Jams 2026
          </p>
          <div className="pt-2 flex items-center justify-center gap-4 text-xs font-semibold">
            <a
              href="https://studyjams.netlify.app/"
              target="_blank"
              rel="noreferrer"
              className="text-[#1a73e8] dark:text-[#8ab4f8] hover:underline"
            >
              Study Jams Tutorials
            </a>
            <span>•</span>
            <a
              href="https://www.cloudskillsboost.google/"
              target="_blank"
              rel="noreferrer"
              className="text-[#1a73e8] dark:text-[#8ab4f8] hover:underline"
            >
              Google Cloud Skills Boost
            </a>
          </div>
        </footer>
      </main>

      {/* Back to top button */}
      <div
        ref={backToTopRef}
        className="fixed right-6 bottom-6 z-50 opacity-0 pointer-events-none transition-all duration-200"
      >
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="p-3 rounded-full shadow-lg bg-[#1a73e8] text-white hover:bg-[#1765cc] dark:bg-[#8ab4f8] dark:text-[#202124] dark:hover:bg-[#a8c7fa] transition-all transform hover:scale-105"
          aria-label="Back to top"
          title="Back to top"
        >
          <FiChevronUp className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Participant Details Modal Dialog */}
      <AnimatePresence>
        {selectedParticipant && (
          <ParticipantModal
            participant={selectedParticipant}
            onClose={() => setSelectedParticipant(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
