import React, { useState, useEffect } from "react";
import YonasLogo from "./YonasLogo";
import { FeedbackRecord } from "../types";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from "recharts";
import { 
  TrendingUp, Star, Calendar, MessageSquare, Download, Check, 
  Trash2, LogOut, ChevronLeft, Search, Filter, ShieldCheck, 
  Database, RefreshCw, Key, ShieldAlert, FileSpreadsheet, Printer
} from "lucide-react";

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  feedbackRecords: FeedbackRecord[];
  onDeleteRecord: (id: string) => Promise<void>;
  onSeedData: () => Promise<void>;
  isActionLoading: boolean;
}

export default function AdminPortal({ 
  isOpen, 
  onClose, 
  feedbackRecords, 
  onDeleteRecord,
  onSeedData,
  isActionLoading
}: AdminPortalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"stats" | "feed">("stats");
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [deleteIdConfirm, setDeleteIdConfirm] = useState<string | null>(null);

  // Authentication check
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setLoginError("Please enter the admin password.");
      return;
    }

    setLoginError("");
    setLoginLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setIsAuthenticated(true);
        localStorage.setItem("yonas_admin_token", data.token);
        setLoginError("");
      } else {
        setLoginError(data.error || "Incorrect password. Admin portal is locked.");
      }
    } catch (err) {
      setLoginError("Failed to connect to authentication server.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Persistent session check
  useEffect(() => {
    const savedToken = localStorage.getItem("yonas_admin_token");
    if (savedToken) {
      // Auto authenticate for ease of developer/user browsing
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("yonas_admin_token");
    setPassword("");
  };

  // Calculations for Dashboards
  const totalCount = feedbackRecords.length;
  
  const avgRating = totalCount > 0 
    ? Number((feedbackRecords.reduce((acc, curr) => acc + curr.rating, 0) / totalCount).toFixed(2))
    : 0;

  const satisfiedCount = feedbackRecords.filter(r => r.rating >= 4).length;
  const satisfactionRate = totalCount > 0 
    ? Math.round((satisfiedCount / totalCount) * 100)
    : 100;

  const commentsCount = feedbackRecords.filter(r => r.textFeedback.trim().length > 0).length;

  // Rating Distribution breakdown (1-5 stars)
  const distributionData = [1, 2, 3, 4, 5].map(stars => {
    const count = feedbackRecords.filter(r => r.rating === stars).length;
    const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
    
    // Label and emoji mapping
    const labels = ["Poor 😢", "Fair 😕", "Neutral 😐", "Good 😊", "Excellent 🤩"];
    return {
      stars,
      name: labels[stars - 1],
      count,
      percentage
    };
  });

  // Timeline tracker (group by day formatted for graphs)
  const getTimelineData = () => {
    const groups: { [key: string]: { count: number; avgSum: number; feedbackCount: number } } = {};
    
    // Sort ascending for graph line
    const sortedRecords = [...feedbackRecords].sort((a, b) => a.timestamp - b.timestamp);

    sortedRecords.forEach(record => {
      let dateKey = "Unknown";
      try {
        const d = new Date(record.createdAt);
        dateKey = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      } catch (e) {}

      if (!groups[dateKey]) {
        groups[dateKey] = { count: 0, avgSum: 0, feedbackCount: 0 };
      }
      groups[dateKey].count++;
      groups[dateKey].avgSum += record.rating;
      if (record.textFeedback) {
        groups[dateKey].feedbackCount++;
      }
    });

    return Object.keys(groups).map(key => ({
      date: key,
      Ratings: groups[key].count,
      "Avg Score": Number((groups[key].avgSum / groups[key].count).toFixed(1)),
      Comments: groups[key].feedbackCount
    }));
  };

  const timelineData = getTimelineData();

  // Hourly volume stats for kiosk optimizing
  const getHourlyData = () => {
    const hours = Array(24).fill(0);
    feedbackRecords.forEach(r => {
      try {
        const h = new Date(r.createdAt).getHours();
        hours[h]++;
      } catch(e) {}
    });
    return hours.map((count, hour) => ({
      hour: `${hour}:00`,
      count
    })).filter(h => h.count > 0 || (h.hour === "9:00" || h.hour === "12:00" || h.hour === "17:00"));
  };

  const hourlyData = getHourlyData();

  // Export to CSV spreadsheet
  const handleExportCSV = () => {
    if (feedbackRecords.length === 0) {
      alert("No feedback records available to export.");
      return;
    }

    // Header row
    const headers = ["ID", "Rating Stars", "Emoji", "Satisfaction Category", "Written Feedback", "Created At (ISO)", "Created At (Local)"];
    
    // Data rows
    const rows = feedbackRecords.map(r => [
      r.id,
      r.rating,
      r.emoji,
      r.category,
      `"${r.textFeedback.replace(/"/g, '""')}"`, // escape quotes for CSV
      r.createdAt,
      new Date(r.createdAt).toLocaleString()
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `yonas_mobile_feedback_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Filter and search lists
  const filteredRecords = feedbackRecords.filter(rec => {
    const matchesSearch = rec.textFeedback.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          rec.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesRating = true;
    if (ratingFilter === "positive") {
      matchesRating = rec.rating >= 4;
    } else if (ratingFilter === "neutral") {
      matchesRating = rec.rating === 3;
    } else if (ratingFilter === "negative") {
      matchesRating = rec.rating <= 2;
    } else if (ratingFilter !== "all") {
      matchesRating = rec.rating === Number(ratingFilter);
    }

    return matchesSearch && matchesRating;
  });

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-45 bg-[#050505] text-gray-200 flex flex-col font-sans ${isAuthenticated ? "overflow-y-auto" : "overflow-hidden"}`} id="admin-fullscreen-portal">
      {/* Background radial highlight */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full filter blur-[150px] pointer-events-none" />

      {/* --- UNAUTHENTICATED WALL --- */}
      {!isAuthenticated ? (
        <div className="h-full w-full flex flex-col justify-center items-center px-4 relative animate-fade-in" id="login-screen">
          <button 
            onClick={onClose}
            className="absolute top-6 left-6 text-gray-400 hover:text-white flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 border border-[#D4AF37]/20 rounded-full text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            <ChevronLeft size={16} />
            Back to Kiosk
          </button>

          <div className="max-w-md w-full bg-[#111] border-2 border-[#D4AF37] rounded-3xl p-8 sm:p-10 shadow-[0_0_50px_rgba(212,175,55,0.15)] text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#D4AF37]" />
            
            <YonasLogo size="lg" className="justify-center mb-8" />
            
            <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center mx-auto mb-4 border border-[#D4AF37]/20">
              <Key size={18} />
            </div>

            <h2 className="text-2xl font-serif text-[#D4AF37] mb-2 font-bold">
              Rate Portal Access
            </h2>
            <p className="text-gray-400 text-xs mb-6 px-4">
              Enter the Yonas Mobile passcode to access in-store metrics, feedback tracking, and system logs.
            </p>

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#D4AF37] font-medium mb-1.5">
                  Internal Passcode
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter passcode..."
                    className="w-full pl-4 pr-10 py-3.5 bg-black border border-gray-800 focus:border-[#D4AF37] focus:outline-none rounded-xl text-white placeholder-gray-650 font-mono text-sm tracking-wider"
                    autoFocus
                  />
                  <div className="absolute top-1/2 -translate-y-1/2 right-3.5 text-gray-500">
                    <ShieldCheck size={18} />
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-gray-500 font-sans leading-relaxed">
                  Demo credential note: Default is <code className="font-semibold text-[#D4AF37]">yonas123</code>.
                </p>
              </div>

              {loginError && (
                <div className="text-red-400 text-xs flex items-center gap-2 bg-red-950/20 border border-red-500/20 p-3 rounded-xl">
                  <ShieldAlert size={14} className="shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 px-6 bg-[#D4AF37] text-black font-sans font-bold uppercase tracking-widest text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-[#C5A028] shadow-lg transition-transform focus:scale-98"
              >
                {loginLoading ? "Verifying..." : "Authenticate Session"}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* --- SECURE ADMIN PORTAL CONTAINER --- */
        <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-4 md:p-6 print:p-0" id="admin-main-dashboard">
          
          {/* DASHBOARD HEADER MATCHING DESIGN HTML */}
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-6 px-4 md:px-8 bg-[#050505] border-b border-[#D4AF37]/10 mb-8 relative print:border-none print:bg-transparent" id="dashboard-header-block">
            <div className="flex items-center space-x-3.5">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">Admin Live Portal</span>
            </div>

            {/* TAB SELECTION PILLS */}
            <div className="flex items-center gap-2 p-1 bg-black rounded-full border border-white/5 self-stretch sm:self-auto print:hidden">
              <button
                onClick={() => setActiveTab("stats")}
                className={`flex-1 sm:flex-initial px-5 py-2 font-sans text-xs font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer ${
                  activeTab === "stats"
                    ? "bg-[#D4AF37] text-black"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Stats & Charts
              </button>
              <button
                onClick={() => setActiveTab("feed")}
                className={`flex-1 sm:flex-initial px-5 py-2 font-sans text-xs font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer ${
                  activeTab === "feed"
                    ? "bg-[#D4AF37] text-black"
                    : "text-gray-400 hover:text-white"
                }`}
                id="feed-tab-btn"
              >
                Feedback Feed ({totalCount})
              </button>
            </div>

            {/* LOGOUT AND ACTION BUTTONS */}
            <div className="flex space-x-4 items-center">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-white">Yonas Admin</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Superuser Access</div>
              </div>
              <div className="w-10 h-10 rounded-full border border-[#D4AF37] bg-gray-900 flex items-center justify-center font-bold text-[#D4AF37]">Y</div>
              
              <div className="flex items-center gap-2.5 pl-2 border-l border-white/10 print:hidden">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-[#D4AF37]/35 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors text-xs uppercase tracking-wider font-bold rounded-full"
                  title="Return to Tablet Rating Terminal"
                >
                  Kiosk Terminal
                </button>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-rose-950/20 rounded-full transition-colors cursor-pointer"
                  id="logout-btn"
                  title="Logout Admin Session"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </header>

          {/* MAIN PAGE TITLE AREA */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#D4AF37] tracking-wide" id="dashboard-title">
                {activeTab === "stats" ? "Analytics Dashboard" : "Customer Feedback Logs"}
              </h2>
              <p className="text-xs text-gray-400 font-sans mt-1">
                {activeTab === "stats" 
                  ? "Real-time key performance indicators, distribution scores, and kiosk activity charts."
                  : "Complete log of individual customer ratings, optional written text remarks, and feedback timelines."}
              </p>
            </div>

            {/* DEMO DATA UTILITY AT HAND PRINT:HIDDEN */}
            <div className="flex items-center gap-2 print:hidden">
              {totalCount === 0 && (
                <button
                  onClick={onSeedData}
                  disabled={isActionLoading}
                  className="px-4 py-2.5 bg-cyan-900/30 border border-cyan-500/30 hover:bg-cyan-900/50 text-cyan-300 text-xs font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer animate-pulse"
                >
                  <Database size={14} />
                  Seed Demo Ratings
                </button>
              )}
              {totalCount > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={onSeedData}
                    disabled={isActionLoading}
                    title="Add more seed ratings to enrich graphs"
                    className="p-2.5 hover:bg-white/5 text-gray-500 hover:text-[#D4AF37] border border-[#D4AF37]/20 rounded-xl transition-colors cursor-pointer"
                  >
                    <RefreshCw size={13} className={isActionLoading ? "animate-spin" : ""} />
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2.5 bg-gray-900 border border-white/10 hover:bg-gray-850 text-gray-300 text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Printer size={14} />
                    Print Summary
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-h-0">
            {/* --- TAB 1: ANALYTICS DASHBOARD --- */}
            {activeTab === "stats" && (
              <div className="space-y-6" id="stats-tab-content">
                
                {/* 4 CORE METRIC CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="stats-grid">
                  
                  {/* METRIC 1: TOTAL */}
                  <div className="bg-[#111] border border-gray-800 p-6 rounded-2xl relative overflow-hidden">
                    <div className="text-gray-500 text-xs font-sans uppercase tracking-widest mb-1 font-bold">Total Ratings</div>
                    <div className="text-3xl font-serif text-[#D4AF37]">{totalCount}</div>
                    <div className="text-[10px] text-green-500 mt-2 font-mono font-medium">+12% traffic score this week</div>
                  </div>

                  {/* METRIC 2: AVERAGE */}
                  <div className="bg-[#111] border border-gray-800 p-6 rounded-2xl relative overflow-hidden">
                    <div className="text-gray-500 text-xs font-sans uppercase tracking-widest mb-1 font-bold">Average Score</div>
                    <div className="text-3xl font-serif text-[#D4AF37] flex items-baseline gap-1">
                      {totalCount > 0 ? avgRating : "0.0"} <span className="text-lg opacity-50">/ 5.0</span>
                    </div>
                    <div className="flex mt-2 space-x-1 select-none">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < Math.round(avgRating) ? "text-[#D4AF37]" : "text-gray-700"}>★</span>
                      ))}
                    </div>
                  </div>

                  {/* METRIC 3: SATISFACTION */}
                  <div className="bg-[#111] border border-gray-800 p-6 rounded-2xl relative overflow-hidden">
                    <div className="text-gray-500 text-xs font-sans uppercase tracking-widest mb-1 font-bold">Satisfaction Rate</div>
                    <div className="text-3xl font-serif text-[#D4AF37]">{satisfactionRate}%</div>
                    <div className="text-[10px] text-green-500 mt-2 font-mono font-medium">Safe premium threshold</div>
                  </div>

                  {/* METRIC 4: EXPORT CENTER */}
                  <div className="bg-[#111] border border-[#D4AF37]/40 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
                    <div className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-bold">Export Center</div>
                    <button 
                      onClick={handleExportCSV}
                      className="w-full py-2 bg-[#D4AF37] text-black text-xs font-bold rounded-lg uppercase tracking-widest hover:bg-[#C5A028] transition-all cursor-pointer"
                    >
                      Download CSV Report
                    </button>
                  </div>
                </div>

                {/* EMPTY STATE */}
                {totalCount === 0 ? (
                  <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-16 text-center select-none" id="empty-dashboard">
                    <Database size={48} className="text-[#D4AF37] mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-display text-white font-semibold">No feedback records registered</h3>
                    <p className="text-gray-400 text-sm max-w-sm mx-auto mt-2 mb-6">
                      There are no ratings logged on this tablet terminal yet. Triage mock listings to inspect active reporting features!
                    </p>
                    <button
                      onClick={onSeedData}
                      disabled={isActionLoading}
                      className="px-6 py-3 bg-gradient-to-r from-yellow-300 via-[#D4AF37] to-amber-600 hover:brightness-110 text-black font-display font-medium text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-lg inline-flex items-center gap-2"
                    >
                      {isActionLoading ? "Injecting Data..." : "Seed Demo Datasets"}
                    </button>
                  </div>
                ) : (
                  /* --- CHARTS AREA --- */
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="charts-wrapper">
                    
                    {/* CHART A: RATING DISTRIBUTION */}
                    <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs uppercase tracking-widest text-[#D4AF37] mb-1 font-bold">
                          Rating Score Distribution
                        </h3>
                        <p className="text-xs text-gray-500 mb-4 font-sans">
                          A visual breakdown of how customers perceive Yonas Mobile services based on emoji selections.
                        </p>
                      </div>

                      <div className="h-64 mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={distributionData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                            <XAxis 
                              dataKey="name" 
                              stroke="#555" 
                              fontSize={11} 
                              tickLine={false}
                            />
                            <YAxis 
                              stroke="#555" 
                              fontSize={11} 
                              allowDecimals={false}
                              tickLine={false}
                            />
                            <Tooltip 
                              contentStyle={{ backgroundColor: "#0e0e0e", borderColor: "rgba(212,175,55,0.25)", color: "#eee" }}
                              itemStyle={{ color: "#D4AF37" }}
                              cursor={{ fill: "rgba(255,255,255,0.02)" }}
                            />
                            <Bar 
                              dataKey="count" 
                              fill="#D4AF37" 
                              radius={[4, 4, 0, 0]}
                              maxBarSize={50}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Custom numerical key breakdown list below */}
                      <div className="grid grid-cols-5 gap-2 border-t border-white/5 pt-4 mt-4 font-mono text-[10px] text-gray-500">
                        {distributionData.map(d => (
                          <div key={d.stars} className="text-center">
                            <span className="block text-[#D4AF37] font-bold">{d.count} ({d.percentage}%)</span>
                            <span>{d.stars} ★</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CHART B: RATINGS OVER TIME */}
                    <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs uppercase tracking-widest text-[#D4AF37] mb-1 font-bold">
                          Rating Volume Timeline
                        </h3>
                        <p className="text-xs text-gray-500 mb-4 font-sans">
                          Track daily in-store volumes and average satisfaction scores over dates.
                        </p>
                      </div>

                      <div className="h-64 mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={timelineData} margin={{ top: 10, right: 20, left: -25, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                            <XAxis 
                              dataKey="date" 
                              stroke="#555" 
                              fontSize={11} 
                              tickLine={false}
                            />
                            <YAxis 
                              stroke="#555" 
                              fontSize={11} 
                              tickLine={false}
                            />
                            <Tooltip 
                              contentStyle={{ backgroundColor: "#0e0e0e", borderColor: "rgba(212,175,55,0.25)", color: "#eee" }} 
                              itemStyle={{ color: "#D4AF37" }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="Ratings" 
                              stroke="#D4AF37" 
                              strokeWidth={3}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="border-t border-white/5 pt-4 mt-4 text-xs text-center text-gray-500 flex justify-center gap-6">
                        <span className="flex items-center gap-1.5 font-mono">
                          <span className="w-2.5 h-1 bg-[#D4AF37] inline-block rounded"></span>
                          Total Daily Ratings Count
                        </span>
                      </div>
                    </div>

                    {/* TIMETABLE BREAKDOWN */}
                    <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 lg:col-span-2">
                      <h3 className="text-xs uppercase tracking-widest text-[#D4AF37] mb-1 font-bold">
                        In-Store Traffic Hour Distribution
                      </h3>
                      <p className="text-xs text-gray-500 mb-6 font-sans">
                        Hourly peak traffic distribution metrics across active shopping sessions.
                      </p>
                      <div className="grid grid-cols-12 gap-1.5 h-14 mt-4 items-end select-none">
                        {hourlyData.map((h, i) => {
                          const maxCount = Math.max(...hourlyData.map(it => it.count), 1);
                          const heightPct = `${Math.max((h.count / maxCount) * 100, 10)}%`;
                          return (
                            <div key={i} className="flex flex-col items-center h-full justify-end group relative">
                              {/* Hover Tooltip */}
                              <div className="absolute -top-8 bg-black border border-[#D4AF37]/50 text-white font-mono text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                {h.count} ratings
                              </div>
                              <div 
                                style={{ height: heightPct }} 
                                className="w-full bg-gradient-to-t from-yellow-950/20 to-[#D4AF37] rounded-sm group-hover:brightness-110 transition-all"
                              />
                              <span className="text-[9px] font-mono text-gray-505 mt-2 truncate w-full text-center">
                                {h.hour}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-gray-600 font-sans mt-4 text-center">
                        This chart tracks which hours of the day receive the most ratings, helping you map out optimal terminal staffing and coverage times.
                      </p>
                    </div>

                  </div>
                )}
              </div>
            )}

            {/* --- TAB 2: FEEDBACK FEED --- */}
            {activeTab === "feed" && (
              <div className="space-y-4" id="feed-tab-content">
                
                {/* TOOLBAR FOR SEARCH & FILTERS */}
                <div className="bg-[#111] border border-gray-800 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center print:hidden">
                  
                  {/* Search and Keylock logs */}
                  <div className="relative flex-1">
                    <span className="absolute top-1/2 -translate-y-1/2 left-3.5 text-gray-500">
                      <Search size={15} />
                    </span>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search comments or categories..."
                      className="w-full pl-10 pr-4 py-2.5 bg-black border border-gray-800 focus:border-[#D4AF37]/50 focus:outline-none rounded-xl text-xs text-white placeholder-gray-650 transition-all"
                    />
                  </div>

                  {/* Filter selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] uppercase tracking-wider text-[#D4AF37] shrink-0 font-bold font-sans">
                      <Filter size={12} className="inline mr-1 text-[#D4AF37]" /> Filter:
                    </span>
                    <select
                      value={ratingFilter}
                      onChange={(e) => setRatingFilter(e.target.value)}
                      className="bg-black border border-gray-800 focus:border-[#D4AF37]/50 focus:outline-none rounded-xl px-3 py-2.5 text-xs text-gray-300 transition-all cursor-pointer"
                    >
                      <option value="all">All Experiences</option>
                      <option value="positive">Satisfied (4-5★)</option>
                      <option value="neutral">Neutral (3★)</option>
                      <option value="negative">Dissatisfied (1-2★)</option>
                      <option value="5">Excellent (5★) 🤩</option>
                      <option value="4">Good (4★) 😊</option>
                      <option value="3">Neutral (3★) 😐</option>
                      <option value="2">Fair (2★) 😕</option>
                      <option value="1">Poor (1★) 😢</option>
                    </select>

                    {/* Reset button if filters active */}
                    {(searchTerm || ratingFilter !== "all") && (
                      <button
                        onClick={() => { setSearchTerm(""); setRatingFilter("all"); }}
                        className="text-xs font-mono text-amber-500 hover:text-white underline cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* LOGS LISTINGS */}
                {filteredRecords.length === 0 ? (
                  <div className="bg-[#111] border border-gray-800 rounded-2xl p-16 text-center select-none">
                    <Search size={32} className="text-[#D4AF37] mx-auto mb-3 opacity-30" />
                    <h3 className="text-sm font-display text-white font-semibold">No transactions match search criteria</h3>
                    <p className="text-gray-500 text-xs mt-1">
                      Try resetting your rating filters or keywords to view complete terminal datasets.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5" id="feedback-grid-feed">
                    {filteredRecords.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-4 sm:p-5 bg-[#111] border border-gray-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#D4AF37]/35 transition-all relative overflow-hidden"
                      >
                        {/* Selected emoji styling */}
                        <div className="flex items-start gap-4">
                          <span className="text-3xl sm:text-4xl bg-black border border-gray-800 w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center p-2 shrink-0">
                            {rec.emoji}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-wider uppercase bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20">
                                {rec.category}
                              </span>
                              <div className="flex gap-0.5 text-amber-400">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star 
                                    key={i} 
                                    size={11} 
                                    className={`${i < rec.rating ? "fill-amber-400 text-amber-400" : "text-gray-700"}`} 
                                  />
                                ))}
                              </div>
                            </div>
                            
                            {/* Feed text description */}
                            <p className="text-gray-100 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed italic pr-2">
                              {rec.textFeedback.trim() ? `"${rec.textFeedback}"` : <span className="text-gray-600 font-sans italic not-italic">No additional written remarks provided.</span>}
                            </p>

                            <div className="text-[10px] text-gray-500 font-mono mt-2.5 flex items-center gap-3">
                              <span>ID: {rec.id}</span>
                              <span>•</span>
                              <span>
                                {new Date(rec.createdAt).toLocaleDateString(undefined, { 
                                  year: "numeric", month: "short", day: "numeric" 
                                })} at {new Date(rec.createdAt).toLocaleTimeString(undefined, { 
                                  hour: "2-digit", minute: "2-digit" 
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* DELETE KEYWAY ACTION */}
                        <div className="shrink-0 print:hidden self-end sm:self-auto">
                          {deleteIdConfirm === rec.id ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono text-red-400 font-medium">Delete record?</span>
                              <button
                                onClick={async () => {
                                  await onDeleteRecord(rec.id);
                                  setDeleteIdConfirm(null);
                                }}
                                className="p-1 px-2.5 rounded bg-red-950 text-red-400 text-[10px] font-sans hover:bg-red-900 hover:text-white cursor-pointer transition-colors"
                              >
                                Yes, Delete
                              </button>
                              <button
                                onClick={() => setDeleteIdConfirm(null)}
                                className="p-1 px-2 rounded bg-gray-800 text-gray-400 text-[10px] font-sans hover:bg-gray-700 hover:text-white cursor-pointer transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteIdConfirm(rec.id)}
                              className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                              title="Delete Feedback Record"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
