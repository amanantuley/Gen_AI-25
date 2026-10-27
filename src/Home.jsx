// Home.jsx - Google Material Design with White Card Boxes (Exact Screenshot Columns)
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Papa from "papaparse";
import { motion } from "framer-motion";
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
} from "react-icons/fi";
import Logo from "./assets/logo.svg";

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
   Plain White Leaderboard Box (Exact Content from Reference Screenshot)
   Columns: Rank | Name & Email | Access Code | Eligible | Badges | Arcade | Progress
   ========================================================================== */
function LeaderboardBox({ row = {} }) {
  const isRedeemed = String(row["Access Code Redemption Status"]).trim().toLowerCase() === "yes";
  const isEligible = String(row["All Skill Badges & Games Completed"]).trim().toLowerCase() === "yes";
  const pct = clamp(Number(row.percentage) || 0, 0, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className="w-full rounded-xl sm:rounded-2xl px-3 sm:px-6 py-2.5 sm:py-4 bg-white dark:bg-[#28292a] border border-[#e8eaed] dark:border-[#3c4043] shadow-sm sm:shadow-md hover:shadow-md sm:hover:shadow-lg transition-all duration-200"
    >
      {/* Desktop Grid Layout (Exact Match to User Screenshot) */}
      <div className="hidden md:grid grid-cols-12 items-center gap-3 text-xs sm:text-sm">
        {/* 1. Rank */}
        <div className="col-span-1 font-bold text-sm sm:text-base text-[#202124] dark:text-[#e8eaed] pl-1">
          {row.rank}
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
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-800 font-bold text-[11px] text-[#202124] dark:text-[#e8eaed] flex-shrink-0">
              #{row.rank}
            </span>
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
    <div className={`min-h-screen relative overflow-x-hidden bg-white dark:bg-[#1e1f20] ${darkMode ? "text-[#e8eaed]" : "text-[#202124]"} transition-colors duration-200`}>
      {/* Very Very Light Faded Blended Spots of 4 Google Colors on Clean White */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* Very Light Google Blue Spot (Top Left) */}
        <div className="absolute top-[5%] left-[6%] w-72 h-72 rounded-full bg-[#4285f4]/[0.07] dark:bg-[#4285f4]/[0.10] blur-[75px] animate-ambient-float" />

        {/* Very Light Google Red Spot (Top Right) */}
        <div className="absolute top-[8%] right-[8%] w-64 h-64 rounded-full bg-[#ea4335]/[0.06] dark:bg-[#ea4335]/[0.08] blur-[75px] animate-ambient-float-reverse" />

        {/* Very Light Google Yellow Spot (Mid-Right) */}
        <div className="absolute top-[50%] right-[10%] w-72 h-72 rounded-full bg-[#fbbc04]/[0.07] dark:bg-[#fbbc04]/[0.09] blur-[80px] animate-ambient-float" />

        {/* Very Light Google Green Spot (Mid-Left) */}
        <div className="absolute top-[56%] left-[8%] w-64 h-64 rounded-full bg-[#34a853]/[0.06] dark:bg-[#34a853]/[0.09] blur-[75px] animate-ambient-float-reverse" />
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
      <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Hero Section */}
        <section className="text-center mb-5 sm:mb-8" data-aos="fade-up">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 sm:px-3.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-white/80 dark:bg-[#28292a]/80 backdrop-blur-sm border border-[#e8eaed] dark:border-[#3c4043] text-[#5f6368] dark:text-[#9aa0a6] shadow-sm mb-2 sm:mb-3">
            <span className="w-2 h-2 rounded-full bg-[#34a853] animate-pulse" />
            <span>Google Developer Groups on Campus · AIKTC</span>
          </div>

          <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#202124] dark:text-[#e8eaed]">
            GenAI Study Jams 2026 Leaderboard
          </h1>
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-base text-[#5f6368] dark:text-[#9aa0a6] max-w-2xl mx-auto font-medium">
            Institute-level leaderboard for GDGC AIKTC. Track badges, arcade games and completion status.
          </p>

          {/* Top 3 Podium: Side-by-Side (2 - 1 - 3) on Both Mobile & Desktop (Minimal & Proportional) */}
          {topOne && (
            <div className="mt-4 sm:mt-7 grid grid-cols-3 gap-2 sm:gap-5 max-w-[340px] sm:max-w-2xl mx-auto items-end pt-2 sm:pt-4 pb-1 sm:pb-2">
              {/* Rank 2 (Left) */}
              {topTwo && (
                <div className="order-1 relative bg-white dark:bg-[#28292a] rounded-xl sm:rounded-2xl p-1.5 sm:p-4 border border-[#e8eaed] dark:border-[#3c4043] shadow-sm sm:shadow-md hover:shadow-lg transition-all duration-200 text-center">
                  <div className="absolute -top-1.5 -right-1.5 sm:-top-2.5 sm:-right-2.5 w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-[#f1f5f9] to-[#94a3b8] text-[#1e293b] border sm:border-2 border-white dark:border-[#28292a] font-black text-[9px] sm:text-xs flex items-center justify-center shadow-sm">
                    2
                  </div>
                  <div className="w-7 h-7 sm:w-13 sm:h-13 rounded-full mx-auto bg-[#e8f0fe] text-[#1a73e8] border border-[#c2e7ff] flex items-center justify-center text-[10px] sm:text-lg font-bold shadow-sm mb-1 sm:mb-2.5">
                    {getInitials(topTwo["User Name"])}
                  </div>
                  <div className="font-extrabold text-[#1a73e8] dark:text-[#60a5fa] text-[10px] sm:text-sm truncate px-0.5" title={topTwo["User Name"]}>
                    {topTwo["User Name"]}
                  </div>
                  <div className="text-[8.5px] sm:text-xs font-semibold text-[#5f6368] dark:text-[#9aa0a6] mt-0.5 sm:mt-1">
                    {(topTwo.badgesCompleted || 0) + (topTwo.gamesCompleted || 0)}/20 pts
                  </div>
                  <div className="text-[8px] sm:text-[11px] font-bold text-[#202124] dark:text-[#e8eaed] mt-0.5 sm:mt-2">
                    Level: Qualified
                  </div>
                </div>
              )}

              {/* Rank 1 (Center - Elevated) */}
              <div className="order-2 relative bg-white dark:bg-[#28292a] rounded-xl sm:rounded-2xl p-2 sm:p-5 border-2 border-[#fbbc04]/60 dark:border-[#fbbc04]/40 shadow-md sm:shadow-xl hover:shadow-2xl transition-all duration-200 text-center -translate-y-1.5 sm:-translate-y-3">
                <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-[#fef08a] to-[#eab308] text-[#713f12] border sm:border-2 border-white dark:border-[#28292a] font-black text-[10px] sm:text-sm flex items-center justify-center shadow-md">
                  1
                </div>
                <div className="w-9 h-9 sm:w-16 sm:h-16 rounded-full mx-auto bg-[#fef3c7] text-[#b45309] border border-[#fde68a] flex items-center justify-center text-xs sm:text-xl font-black shadow-sm mb-1 sm:mb-2.5">
                  {getInitials(topOne["User Name"])}
                </div>
                <div className="font-extrabold text-[#1a73e8] dark:text-[#60a5fa] text-[11px] sm:text-base truncate px-0.5" title={topOne["User Name"]}>
                  {topOne["User Name"]}
                </div>
                <div className="text-[9px] sm:text-xs font-semibold text-[#5f6368] dark:text-[#9aa0a6] mt-0.5 sm:mt-1">
                  {(topOne.badgesCompleted || 0) + (topOne.gamesCompleted || 0)}/20 pts
                </div>
                <div className="text-[8.5px] sm:text-xs font-bold text-[#202124] dark:text-[#e8eaed] mt-0.5 sm:mt-2">
                  Level: Qualified
                </div>
              </div>

              {/* Rank 3 (Right) */}
              {topThreeUser && (
                <div className="order-3 relative bg-white dark:bg-[#28292a] rounded-xl sm:rounded-2xl p-1.5 sm:p-4 border border-[#e8eaed] dark:border-[#3c4043] shadow-sm sm:shadow-md hover:shadow-lg transition-all duration-200 text-center">
                  <div className="absolute -top-1.5 -right-1.5 sm:-top-2.5 sm:-right-2.5 w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-gradient-to-br from-[#ffedd5] to-[#f97316] text-[#7c2d12] border sm:border-2 border-white dark:border-[#28292a] font-black text-[9px] sm:text-xs flex items-center justify-center shadow-sm">
                    3
                  </div>
                  <div className="w-7 h-7 sm:w-13 sm:h-13 rounded-full mx-auto bg-[#ffedd5] text-[#c2410c] border border-[#fed7aa] flex items-center justify-center text-[10px] sm:text-lg font-bold shadow-sm mb-1 sm:mb-2.5">
                    {getInitials(topThreeUser["User Name"])}
                  </div>
                  <div className="font-extrabold text-[#1a73e8] dark:text-[#60a5fa] text-[10px] sm:text-sm truncate px-0.5" title={topThreeUser["User Name"]}>
                    {topThreeUser["User Name"]}
                  </div>
                  <div className="text-[8.5px] sm:text-xs font-semibold text-[#5f6368] dark:text-[#9aa0a6] mt-0.5 sm:mt-1">
                    {(topThreeUser.badgesCompleted || 0) + (topThreeUser.gamesCompleted || 0)}/20 pts
                  </div>
                  <div className="text-[8px] sm:text-[11px] font-bold text-[#202124] dark:text-[#e8eaed] mt-0.5 sm:mt-2">
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
              <LeaderboardBox key={row["User Email"] || row.rank} row={row} />
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
    </div>
  );
}
