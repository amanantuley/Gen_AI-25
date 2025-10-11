// Home.jsx
import { useState, useEffect, useMemo, useRef } from "react";
import Papa from "papaparse";
import { motion, AnimatePresence } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import { FiSun, FiMoon, FiChevronUp, FiSearch, FiRefreshCw } from "react-icons/fi";
import { GiLaurelCrown } from "react-icons/gi";
import Logo from "./assets/logo.svg";
import "./home.css"; // keep your existing CSS, add styles there if needed

/* ============================
   Utilities
   ============================ */

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function useDebounced(value, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/* ============================
   Small UI atoms & components
   ============================ */

function BadgeYesNo({ value }) {
  if (value === "Yes") {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
        ✅ Yes
      </span>
    );
  }
  if (!value || value === "0" || (value.toLowerCase && value.toLowerCase() === "no")) {
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
        ❌ No
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
      {value}
    </span>
  );
}

/* Animated counter that counts up to `value` */
function CountUp({ value = 0, duration = 900, className = "" }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = Number(value) || 0;
    if (end === 0) {
      setDisplay(0);
      return;
    }
    const stepTime = Math.max(Math.floor(duration / end), 8);
    const timer = setInterval(() => {
      start += 1;
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

/* Progress bar with tooltip (simple) */
function ProgressBar({ percentage = 0 }) {
  const pct = clamp(Number(percentage) || 0, 0, 100);
  return (
    <div className="relative group" title={`${pct.toFixed(1)}% complete`}>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500"
        />
      </div>
    </div>
  );
}

/* Top 3 Card */
function TopCard({ place = 1, user = {}, color = "yellow" }) {
  const medal = place === 1 ? "🥇" : place === 2 ? "🥈" : "🥉";
  const colors = {
    yellow: "from-yellow-400 to-yellow-600",
    red: "from-red-400 to-red-600",
    green: "from-green-400 to-green-600",
    blue: "from-blue-400 to-blue-600",
  };
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      layout
      className={`w-full max-w-xs sm:max-w-sm rounded-2xl shadow-xl p-5 bg-gradient-to-br ${colors[color]} text-white`}
      aria-label={`Top performer #${place}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-full w-12 h-12 flex items-center justify-center text-2xl">{medal}</div>
          <div className="min-w-0">
            <div className="text-sm opacity-90">Rank #{place}</div>
            <div className="text-lg font-bold truncate max-w-[160px]">{user["User Name"] || "—"}</div>
            <div className="text-xs opacity-80 truncate max-w-[160px]">{user["User Email"] || ""}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs opacity-90">Completion</div>
          <div className="text-xl font-bold">{user.percentage ? `${Number(user.percentage).toFixed(0)}%` : "0%"}</div>
        </div>
      </div>
    </motion.div>
  );
}

/* Mobile card view for each participant (shown on small screens) */
function MobileRowCard({ row }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="font-semibold truncate text-sm">{row["User Name"] || "—"}</div>
              <div className="text-xs opacity-70 truncate max-w-[220px]">{row["User Email"] || ""}</div>
            </div>
            <div className="text-right">
              <div className="text-xs opacity-70">Rank</div>
              <div className="font-bold">{row.rank}</div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex-1">
              <div className="text-xs opacity-80 mb-1">Progress</div>
              <ProgressBar percentage={row.percentage} />
            </div>
            <div className="w-16 text-right text-sm opacity-80">{Number(row.percentage || 0).toFixed(0)}%</div>
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs">
            <div><BadgeYesNo value={row["Access Code Redemption Status"]} /></div>
            <div><BadgeYesNo value={row["All Skill Badges & Games Completed"]} /></div>
            <div className="ml-auto text-xs opacity-80">Badges: <b>{row.badgesCompleted}</b></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ============================
   Main Page Component
   ============================ */

export default function Home() {
  // core data
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounced(searchQuery, 250);

  // UI state
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem("gdgc_darkmode");
      if (saved !== null) return saved === "true";
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch (e) {
      return true;
    }
  });
  const [lastUpdated, setLastUpdated] = useState("");
  const [showTop, setShowTop] = useState(true);
  const [filterCompletedOnly, setFilterCompletedOnly] = useState(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState(0); // seconds, 0 = off
  const refreshTimerRef = useRef(null);

  // misc refs
  const tableRef = useRef(null);
  const backToTopRef = useRef(null);

  // initialize AOS animations
  useEffect(() => {
    AOS.init({ duration: 700, offset: 100, once: true });
  }, []);

  // persist theme
  useEffect(() => {
    try {
      localStorage.setItem("gdgc_darkmode", darkMode ? "true" : "false");
    } catch (e) {}
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // parse CSV
  useEffect(() => {
    let cancelled = false;
    Papa.parse("./leaderboard.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (cancelled) return;
        const mapped = result.data
          .map((row) => {
            const badgesCompleted = parseInt(row["# of Skill Badges Completed"], 10) || 0;
            const gamesCompleted = parseInt(row["# of Arcade Games Completed"], 10) || 0;
            const totalItems = 20;
            const percentage = ((badgesCompleted + gamesCompleted) / totalItems) * 100;
            return {
              ...row,
              badgesCompleted,
              gamesCompleted,
              percentage,
            };
          })
          .filter((r) => r["User Name"] || r["User Email"]);

        mapped.sort((a, b) => {
  const pctDiff = b.percentage - a.percentage;
  if (pctDiff !== 0) return pctDiff;

  // Preserve order based on previous leaderboard
  const aPrev = leaderboardData.findIndex((x) => x["User Email"] === a["User Email"]);
  const bPrev = leaderboardData.findIndex((x) => x["User Email"] === b["User Email"]);

  if (aPrev !== -1 && bPrev !== -1) return aPrev - bPrev;

  // Fallback alphabetical if not found
  return (a["User Name"] || "").localeCompare(b["User Name"] || "");
});

mapped.forEach((row, idx) => (row.rank = idx + 1));


        setLeaderboardData(mapped);
        setLastUpdated(new Date().toLocaleString());
      },
      error: (err) => {
        console.error("CSV parse error:", err);
      },
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // auto refresh
  useEffect(() => {
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    if (!autoRefreshInterval || autoRefreshInterval <= 0) return;
    refreshTimerRef.current = setInterval(() => {
      Papa.parse("./leaderboard.csv", {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          const mapped = result.data
            .map((row) => {
              const badgesCompleted = parseInt(row["# of Skill Badges Completed"], 10) || 0;
              const gamesCompleted = parseInt(row["# of Arcade Games Completed"], 10) || 0;
              const totalItems = 16;
              const percentage = ((badgesCompleted + gamesCompleted) / totalItems) * 100;
              return { ...row, badgesCompleted, gamesCompleted, percentage };
            })
            .filter((r) => r["User Name"] || r["User Email"]);

          mapped.sort((a, b) => b.percentage - a.percentage);
          mapped.forEach((row, idx) => (row.rank = idx + 1));
          setLeaderboardData(mapped);
          setLastUpdated(new Date().toLocaleString());
        },
      });
    }, autoRefreshInterval * 1000);

    return () => clearInterval(refreshTimerRef.current);
  }, [autoRefreshInterval]);

  // derived values
  const totalParticipants = leaderboardData.length;
  const totalCompleted = leaderboardData.filter((r) => r["All Skill Badges & Games Completed"] === "Yes").length;
  const topThree = leaderboardData.slice(0, 3);
  const filtered = useMemo(() => {
    const q = (debouncedSearch || "").trim().toLowerCase();
    return leaderboardData.filter((r) => {
      if (filterCompletedOnly && r["All Skill Badges & Games Completed"] !== "Yes") return false;
      if (!q) return true;
      return (
        (r["User Name"] || "").toLowerCase().includes(q) ||
        (r["User Email"] || "").toLowerCase().includes(q) ||
        String(r["rank"]).includes(q)
      );
    });
  }, [leaderboardData, debouncedSearch, filterCompletedOnly]);

  // Back-to-top show/hide
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

  // UI handlers
  const handleRefreshNow = () => {
    Papa.parse("./leaderboard.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const mapped = result.data
          .map((row) => {
            const badgesCompleted = parseInt(row["# of Skill Badges Completed"], 10) || 0;
            const gamesCompleted = parseInt(row["# of Arcade Games Completed"], 10) || 0;
            const totalItems = 16;
            const percentage = ((badgesCompleted + gamesCompleted) / totalItems) * 100;
            return { ...row, badgesCompleted, gamesCompleted, percentage };
          })
          .filter((r) => r["User Name"] || r["User Email"]);

        mapped.sort((a, b) => b.percentage - a.percentage);
        mapped.forEach((row, idx) => (row.rank = idx + 1));
        setLeaderboardData(mapped);
        setLastUpdated(new Date().toLocaleString());
      },
    });
  };

  /* ============================
     Render
     ============================ */

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-slate-100" : "bg-gray-50 text-slate-900"} transition-colors duration-300`}>
      {/* Header */}
      <header
        className={`sticky top-0 z-50 backdrop-blur-md ${darkMode ? "bg-black/50 border-b border-gray-800" : "bg-white/80 border-b border-gray-200"}`}
        style={{ WebkitBackdropFilter: "blur(6px)" }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src={Logo} alt="logo" className="h-10 sm:h-12 w-auto flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-base sm:text-lg font-bold truncate">GDGC-AIKTC · GenAI Study Jams 2025</div>
              <div className="text-xs sm:text-sm opacity-70 truncate">Institute leaderboard & participant progress</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Controls visible on md+ */}
            <div className="hidden md:flex items-center gap-3 bg-transparent rounded-full px-2 py-1">
              <button
                onClick={() => setShowTop((s) => !s)}
                className="flex items-center gap-2 px-3 py-1 rounded-full hover:bg-gray-200/10 transition"
                title="Toggle top performers"
                aria-pressed={showTop}
              >
                <GiLaurelCrown className="text-xl" />
                <span className="text-sm">Top</span>
              </button>

              <button
                onClick={() => setFilterCompletedOnly((s) => !s)}
                className={`px-3 py-1 rounded-full text-sm transition ${filterCompletedOnly ? "bg-green-600/25" : "hover:bg-gray-200/10"}`}
                title="Filter completed only"
                aria-pressed={filterCompletedOnly}
              >
                {filterCompletedOnly ? "Showing: Completed" : "Show Completed Only"}
              </button>

              <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-gray-300/10">
                <FiRefreshCw onClick={handleRefreshNow} className="cursor-pointer" />
                <small className="opacity-80">Updated: <b>{lastUpdated || "—"}</b></small>
              </div>
            </div>

            {/* compact controls for small screens */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setShowTop((s) => !s)}
                className="p-2 rounded-full hover:bg-gray-200/10 transition"
                title="Toggle top performers"
                aria-pressed={showTop}
              >
                <GiLaurelCrown />
              </button>

              <button
                onClick={() => setFilterCompletedOnly((s) => !s)}
                className={`p-2 rounded-full hover:bg-gray-200/10 transition ${filterCompletedOnly ? "bg-green-600/25" : ""}`}
                title="Filter completed only"
                aria-pressed={filterCompletedOnly}
              >
                {filterCompletedOnly ? "✓" : "⚑"}
              </button>

              <button
                onClick={handleRefreshNow}
                className="p-2 rounded-full hover:bg-gray-200/10 transition"
                title="Refresh now"
              >
                <FiRefreshCw />
              </button>
            </div>

            <div className="flex items-center gap-2 border rounded-full px-2 py-1 bg-transparent">
              <button
                onClick={() => setDarkMode((d) => !d)}
                className="p-2 rounded-full hover:bg-gray-200/10 transition"
                title={darkMode ? "Switch to light" : "Switch to dark"}
                aria-label="Toggle theme"
              >
                {darkMode ? <FiSun /> : <FiMoon />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {/* Hero */}
        <section className="text-center" data-aos="fade-up">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Welcome to <span className="text-blue-400">GenAI Study Jams 2025</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-400 max-w-2xl mx-auto px-2">
            Institute-level leaderboard for GDGC AIKTC. Track badges, arcade games and completion status. Updated as of {lastUpdated ? lastUpdated : "—"}.
          </p>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 justify-center">
            <div className="p-3 sm:p-4 bg-white/5 rounded-md shadow-sm text-center">
              <div className="text-xs opacity-80">Eligible Participants</div>
              <div className="text-lg sm:text-2xl font-bold"><CountUp value={100} /></div>
            </div>
            <div className="p-3 sm:p-4 bg-white/5 rounded-md shadow-sm text-center">
              <div className="text-xs opacity-80">Registered</div>
              <div className="text-lg sm:text-2xl font-bold"><CountUp value={totalParticipants} /></div>
            </div>
            <div className="p-3 sm:p-4 bg-white/5 rounded-md shadow-sm text-center">
              <div className="text-xs opacity-80">Qualified</div>
              <div className="text-lg sm:text-2xl font-bold"><CountUp value={totalCompleted} /></div>
            </div>
          </div>

          {/* Search bar */}
          <div className="mt-6 max-w-md mx-auto w-full" data-aos="fade-up" data-aos-delay="100">
            <div className="relative">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full pl-12 pr-4 py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white/5"
                placeholder="Search by name, email or rank..."
                aria-label="Search participants"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 opacity-80">
                <FiSearch />
              </div>
            </div>
          </div>
        </section>

        {/* Top performers */}
        <AnimatePresence>
          {showTop && topThree.length > 0 && (
            <motion.section
              className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 items-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              layout
            >
              <div data-aos="zoom-in" className="flex justify-center">
                <TopCard place={1} user={topThree[0] || {}} color="yellow" />
              </div>
              <div data-aos="zoom-in" className="flex justify-center">
                <TopCard place={2} user={topThree[1] || {}} color="red" />
              </div>
              <div data-aos="zoom-in" className="flex justify-center">
                <TopCard place={3} user={topThree[2] || {}} color="green" />
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Table (desktop) */}
        <section className="mt-10 sm:mt-12" data-aos="fade-up" data-aos-delay="200">
          <div className={`overflow-hidden rounded-2xl shadow-lg ${darkMode ? "bg-black/60" : "bg-white"}`}>
            {/* Desktop table - hidden on small screens */}
            <div className="w-full overflow-x-auto hidden md:block">
              <table ref={tableRef} className="min-w-[760px] text-xs sm:text-sm">
                <thead className={`${darkMode ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-700"} sticky top-0`}>
                  <tr>
                    <th className="px-3 sm:px-4 py-3 text-left w-[6%]">Rank</th>
                    <th className="px-3 sm:px-4 py-3 text-left w-[30%]">Name & Email</th>
                    <th className="px-3 sm:px-4 py-3 text-left w-[14%]">Access Code</th>
                    <th className="px-3 sm:px-4 py-3 text-left w-[14%]">Eligible</th>
                    <th className="px-3 sm:px-4 py-3 text-left w-[8%]">Badges</th>
                    <th className="px-3 sm:px-4 py-3 text-left w-[8%]">Arcade</th>
                    <th className="px-3 sm:px-4 py-3 text-left w-[20%]">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-gray-400">No results. Try another search.</td>
                    </tr>
                  ) : (
                    filtered.map((row, idx) => {
                      const isTop3 = row.rank <= 3;
                      return (
                        <tr
                          key={idx}
                          className={`${isTop3 ? "bg-gradient-to-r from-yellow-50/20" : darkMode ? "bg-black/50" : "bg-white"} border-b border-gray-700/20 transition hover:scale-[1.003]`}
                        >
                          <td className="px-3 sm:px-4 py-4 font-semibold">{row.rank}</td>
                          <td className="px-3 sm:px-4 py-4">
                            <div className="font-semibold truncate max-w-[220px]">{row["User Name"]}</div>
                            <div className="text-xs opacity-70 truncate max-w-[220px]">{row["User Email"]}</div>
                          </td>
                          <td className="px-3 sm:px-4 py-4"><BadgeYesNo value={row["Access Code Redemption Status"]} /></td>
                          <td className="px-3 sm:px-4 py-4"><BadgeYesNo value={row["All Skill Badges & Games Completed"]} /></td>
                          <td className="px-3 sm:px-4 py-4 text-center font-medium">{row.badgesCompleted}</td>
                          <td className="px-3 sm:px-4 py-4 text-center font-medium">{row.gamesCompleted}</td>
                          <td className="px-3 sm:px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1">
                                <ProgressBar percentage={row.percentage} />
                              </div>
                              <div className="w-14 text-right text-sm opacity-80">{Number(row.percentage || 0).toFixed(0)}%</div>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile list - visible on small screens */}
            <div className="md:hidden px-3 py-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="text-center py-6 text-gray-400">No results. Try another search.</div>
              ) : (
                filtered.map((row, idx) => <MobileRowCard key={idx} row={row} />)
              )}
            </div>
          </div>
        </section>

        {/* Controls */}
        <section className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <small className="text-xs opacity-80">Auto-refresh:</small>
            <select
              value={autoRefreshInterval}
              onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
              className="rounded-md px-3 py-1 bg-white/5 text-sm"
              aria-label="Auto refresh interval"
            >
              <option value={0}>Off</option>
              <option value={15}>15s</option>
              <option value={30}>30s</option>
              <option value={60}>1m</option>
              <option value={300}>5m</option>
            </select>

            <button onClick={handleRefreshNow} className="ml-2 px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition text-sm">
              Refresh now
            </button>
          </div>

          <div className="text-sm opacity-80">
            Showing <b>{filtered.length}</b> of <b>{totalParticipants}</b> participants • Last updated: <b>{lastUpdated || "—"}</b>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 py-8 border-t border-gray-700/20 text-center text-sm opacity-80">
          © 2025 GDGC AIKTC · Built with ❤️ ·{" "}
          <a className="underline" href="https://studyjams.netlify.app/" target="_blank" rel="noreferrer">Study Jams tutorials</a>
          <div className="mt-2">Version 4.0</div>
        </footer>
      </main>

      {/* Back to top */}
      <div
        ref={backToTopRef}
        className="fixed right-6 bottom-8 z-50 opacity-0 pointer-events-none transition-opacity"
      >
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="p-3 rounded-full shadow-lg bg-blue-600 text-white hover:scale-105 transition transform"
          aria-label="Back to top"
        >
          <FiChevronUp size={22} />
        </button>
      </div>
    </div>
  );
}
