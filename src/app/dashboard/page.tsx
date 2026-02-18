"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState(false);
  const [search, setSearch] = useState("");

  // logged-in user
  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      window.location.href = "/login";
    } else {
      setUser(data.user);
    }
  };

  // Fetch bookmarks
  const fetchBookmarks = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false });

    setBookmarks(data || []);
    setLoading(false);
  };

  useEffect(() => {
    getUser();
    fetchBookmarks();

    const channel = supabase
      .channel("realtime-bookmarks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookmarks" },
        () => {
          fetchBookmarks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Add bookmark
  const addBookmark = async () => {
  if (!url || !title) {
    alert("Please enter both title and URL");
    return;
  }

  if (!url.startsWith("http")) {
    alert("URL must start with http or https");
    return;
  }

  setAdding(true);

  const { data: userData } = await supabase.auth.getUser();

  const { data: newBookmark } = await supabase
    .from("bookmarks")
    .insert([
      {
        url,
        title,
        user_id: userData.user?.id,
      },
    ])
    .select()  // to get the inserted bookmark back
    .single(); // Get just the one bookmark

  // Manually add to local state immediately
  if (newBookmark) {
    setBookmarks([newBookmark, ...bookmarks]);
  }

  setUrl("");
  setTitle("");
  setAdding(false);

  // Show toast
  setToast(true);
  setTimeout(() => setToast(false), 2500);
};
  // Delete bookmark
  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id);
  };

  // Logout
  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  // Extract first name from email
  const getFirstName = () => {
    if (!user) return "";
    const name = user.user_metadata?.full_name || user.user_metadata?.name;
    if (name) return name.split(" ")[0];
    return user.email?.split("@")[0] || "";
  };

  // Filter bookmarks by search query
  const filteredBookmarks = bookmarks.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; }

        body {
          margin: 0;
          font-family: 'DM Sans', sans-serif;
          background: #050d1a;
        }

        .page-wrapper {
          min-height: 100vh;
          background: linear-gradient(135deg, #050d1a 0%, #071428 40%, #0a1c3a 70%, #071428 100%);
          position: relative;
          overflow-x: hidden;
        }

        /* Animated orbs */
        .orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          z-index: 0;
          animation: floatOrb 12s ease-in-out infinite alternate;
        }
        .orb-1 {
          width: 520px; height: 520px;
          background: radial-gradient(circle, rgba(29,78,216,0.18) 0%, transparent 70%);
          top: -120px; left: -100px;
          animation-delay: 0s;
        }
        .orb-2 {
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(14,116,144,0.14) 0%, transparent 70%);
          top: 40%; right: -80px;
          animation-delay: -4s;
        }
        .orb-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(29,78,216,0.10) 0%, transparent 70%);
          bottom: 10%; left: 20%;
          animation-delay: -8s;
        }
        @keyframes floatOrb {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, 40px) scale(1.08); }
        }

        /* Navbar */
        .navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 18px 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(5, 13, 26, 0.6);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .nav-logo-icon {
          width: 34px; height: 34px;
          background: linear-gradient(135deg, #1d4ed8, #0e7490);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 20px rgba(29,78,216,0.4);
        }
        .nav-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 20px;
          font-weight: 700;
          color: #e2d9c8;
          letter-spacing: 0.3px;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .greeting-pill {
          background: rgba(29,78,216,0.15);
          border: 1px solid rgba(29,78,216,0.3);
          border-radius: 999px;
          padding: 6px 16px;
          color: #93c5fd;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.2px;
        }
        .greeting-pill span {
          color: #e2d9c8;
          font-weight: 600;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.10);
          color: rgba(255,255,255,0.45);
          border-radius: 10px;
          padding: 8px 18px;
          font-size: 13px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.25s ease;
          letter-spacing: 0.2px;
        }
        .logout-btn:hover {
          background: rgba(239,68,68,0.12);
          border-color: rgba(239,68,68,0.3);
          color: #fca5a5;
          transform: translateY(-1px);
        }

        /* ── Hero / Landing ── */
        .hero {
          position: relative;
          z-index: 1;
          padding: 160px 48px 120px;
          max-width: 900px;
          margin: 0 auto;
          text-align: center;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(29,78,216,0.12);
          border: 1px solid rgba(29,78,216,0.35);
          border-radius: 999px;
          padding: 6px 18px;
          color: #93c5fd;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          margin-bottom: 32px;
        }
        .hero-badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #3b82f6;
          animation: pulseDot 2s ease-in-out infinite;
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }

        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(40px, 6vw, 68px);
          font-weight: 700;
          color: #e2d9c8;
          line-height: 1.15;
          margin: 0 0 20px;
          letter-spacing: -0.5px;
        }
        .hero-title-accent {
          background: linear-gradient(90deg, #60a5fa, #38bdf8, #60a5fa);
          background-size: 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmerText 4s linear infinite;
        }
        @keyframes shimmerText {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .hero-sub {
          font-size: 18px;
          color: rgba(226,217,200,0.5);
          line-height: 1.7;
          max-width: 540px;
          margin: 0 auto 16px;
          font-weight: 300;
        }

        .hero-stats {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin-top: 56px;
          flex-wrap: wrap;
        }
        .hero-stat {
          text-align: center;
        }
        .hero-stat-number {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          color: #e2d9c8;
        }
        .hero-stat-label {
          font-size: 12px;
          color: rgba(226,217,200,0.35);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 2px;
        }

        .hero-divider {
          width: 1px;
          height: 40px;
          background: rgba(255,255,255,0.08);
          align-self: center;
        }

        /* Features row */
        .features-row {
          position: relative;
          z-index: 1;
          max-width: 860px;
          margin: 0 auto 100px;
          padding: 0 48px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 640px) {
          .features-row { grid-template-columns: 1fr; padding: 0 24px; }
          .hero { padding: 140px 24px 80px; }
          .navbar { padding: 16px 20px; }
        }

        .feature-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 28px 24px;
          transition: all 0.3s ease;
          cursor: default;
        }
        .feature-card:hover {
          background: rgba(29,78,216,0.08);
          border-color: rgba(29,78,216,0.25);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        .feature-icon {
          width: 40px; height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(29,78,216,0.3), rgba(14,116,144,0.3));
          border: 1px solid rgba(29,78,216,0.2);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px;
          font-size: 18px;
        }
        .feature-title {
          font-size: 15px;
          font-weight: 600;
          color: #e2d9c8;
          margin-bottom: 6px;
        }
        .feature-desc {
          font-size: 13px;
          color: rgba(226,217,200,0.38);
          line-height: 1.6;
        }

        /* ── Add Bookmark Section ── */
        .section {
          position: relative;
          z-index: 1;
          max-width: 760px;
          margin: 0 auto;
          padding: 0 48px 80px;
        }
        @media (max-width: 640px) {
          .section { padding: 0 24px 60px; }
        }

        .section-label {
          font-size: 11px;
          font-weight: 600;
          color: rgba(147,197,253,0.6);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }

        .add-card {
          background: rgba(226,217,200,0.04);
          border: 1px solid rgba(226,217,200,0.10);
          border-radius: 24px;
          padding: 36px;
          backdrop-filter: blur(12px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06);
          margin-bottom: 60px;
        }

        .add-card-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          color: #e2d9c8;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .add-card-sub {
          font-size: 13px;
          color: rgba(226,217,200,0.35);
          margin-bottom: 28px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 20px;
        }

        .input-wrapper {
          position: relative;
        }
        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(226,217,200,0.25);
          pointer-events: none;
        }

        .fancy-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(226,217,200,0.12);
          border-radius: 14px;
          padding: 14px 16px 14px 44px;
          color: #e2d9c8;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          outline: none;
          transition: all 0.25s ease;
          letter-spacing: 0.2px;
        }
        .fancy-input::placeholder {
          color: rgba(226,217,200,0.22);
        }
        .fancy-input:focus {
          background: rgba(29,78,216,0.08);
          border-color: rgba(59,130,246,0.5);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.08), 0 4px 16px rgba(0,0,0,0.2);
        }
        .fancy-input:hover:not(:focus) {
          border-color: rgba(226,217,200,0.22);
          background: rgba(255,255,255,0.06);
        }

        .save-btn {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 50%, #0e7490 100%);
          color: #fff;
          border: none;
          border-radius: 14px;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: 0.3px;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 4px 24px rgba(29,78,216,0.35);
          position: relative;
          overflow: hidden;
        }
        .save-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .save-btn:hover:not(:disabled)::before {
          opacity: 1;
        }
        .save-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(29,78,216,0.5);
        }
        .save-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .save-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Toast */
        .toast {
          position: fixed;
          bottom: 36px;
          left: 50%;
          transform: translateX(-50%) translateY(80px);
          background: linear-gradient(135deg, #1d4ed8, #0e7490);
          color: #fff;
          padding: 14px 28px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          box-shadow: 0 8px 32px rgba(29,78,216,0.5);
          z-index: 999;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
          opacity: 0;
          pointer-events: none;
          white-space: nowrap;
        }
        .toast.show {
          transform: translateX(-50%) translateY(0);
          opacity: 1;
        }

        /* Bookmarks section */
        .bookmarks-label {
          font-size: 11px;
          font-weight: 600;
          color: rgba(147,197,253,0.6);
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .bookmarks-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.06);
        }

        .bookmarks-count {
          font-size: 11px;
          color: rgba(226,217,200,0.2);
          font-weight: 400;
          letter-spacing: 0;
          text-transform: none;
          margin-left: auto;
          margin-right: 0;
          flex-shrink: 0;
        }

        /* Skeleton loader */
        .skeleton {
          background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.04) 75%);
          background-size: 200% 100%;
          animation: shimmerLoad 1.5s infinite;
          border-radius: 18px;
          height: 76px;
          margin-bottom: 12px;
        }
        @keyframes shimmerLoad {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Empty state */
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: rgba(255,255,255,0.02);
          border: 1px dashed rgba(255,255,255,0.08);
          border-radius: 24px;
        }
        .empty-icon {
          font-size: 40px;
          margin-bottom: 16px;
          opacity: 0.5;
        }
        .empty-title {
          color: rgba(226,217,200,0.4);
          font-size: 15px;
          font-weight: 500;
          margin-bottom: 6px;
        }
        .empty-sub {
          color: rgba(226,217,200,0.2);
          font-size: 13px;
        }

        /* Bookmark card */
        .bookmark-card {
          background: rgba(226,217,200,0.04);
          border: 1px solid rgba(226,217,200,0.08);
          border-radius: 18px;
          padding: 18px 20px;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 16px;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
          cursor: default;
        }
        .bookmark-card::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: linear-gradient(180deg, #1d4ed8, #0e7490);
          opacity: 0;
          transition: opacity 0.25s ease;
        }
        .bookmark-card:hover {
          background: rgba(29,78,216,0.08);
          border-color: rgba(29,78,216,0.22);
          transform: translateX(4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2), -4px 0 16px rgba(29,78,216,0.15);
        }
        .bookmark-card:hover::before {
          opacity: 1;
        }

        .favicon-box {
          flex-shrink: 0;
          width: 42px; height: 42px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: all 0.25s ease;
        }
        .bookmark-card:hover .favicon-box {
          background: rgba(29,78,216,0.2);
          border-color: rgba(29,78,216,0.35);
        }

        .bookmark-info {
          flex: 1;
          min-width: 0;
        }
        .bookmark-title-link {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #e2d9c8;
          text-decoration: none;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.2s;
          margin-bottom: 3px;
        }
        .bookmark-title-link:hover {
          color: #93c5fd;
        }
        .bookmark-url {
          font-size: 12px;
          color: rgba(226,217,200,0.25);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .bookmark-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          opacity: 0;
          transition: opacity 0.2s ease;
          flex-shrink: 0;
        }
        .bookmark-card:hover .bookmark-actions {
          opacity: 1;
        }

        .action-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 9px;
          padding: 7px;
          cursor: pointer;
          color: rgba(226,217,200,0.35);
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .action-btn:hover {
          background: rgba(59,130,246,0.15);
          border-color: rgba(59,130,246,0.3);
          color: #93c5fd;
        }
        .action-btn.delete:hover {
          background: rgba(239,68,68,0.12);
          border-color: rgba(239,68,68,0.3);
          color: #fca5a5;
        }

        /* Scroll hint arrow */
        .scroll-hint {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          color: rgba(226,217,200,0.2);
          font-size: 11px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-top: 48px;
          animation: bounce 2s ease-in-out infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(6px); }
        }

        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Search bar */
        .search-wrapper {
          position: relative;
          margin-bottom: 20px;
        }
        .search-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(226,217,200,0.25);
          pointer-events: none;
        }
        .search-input {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(226,217,200,0.10);
          border-radius: 14px;
          padding: 13px 42px 13px 44px;
          color: #e2d9c8;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
          outline: none;
          transition: all 0.25s ease;
          letter-spacing: 0.2px;
        }
        .search-input::placeholder {
          color: rgba(226,217,200,0.2);
        }
        .search-input:focus {
          background: rgba(29,78,216,0.07);
          border-color: rgba(59,130,246,0.4);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.07);
        }
        .search-input:hover:not(:focus) {
          border-color: rgba(226,217,200,0.18);
        }
        .search-clear {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.07);
          border: none;
          border-radius: 6px;
          color: rgba(226,217,200,0.35);
          cursor: pointer;
          padding: 3px 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .search-clear:hover {
          background: rgba(239,68,68,0.15);
          color: #fca5a5;
        }
        .search-no-results {
          text-align: center;
          padding: 48px 20px;
          color: rgba(226,217,200,0.25);
          font-size: 14px;
        }
        .search-no-results-icon {
          font-size: 32px;
          margin-bottom: 12px;
          opacity: 0.5;
        }
        .search-highlight {
          background: rgba(59,130,246,0.25);
          color: #93c5fd;
          border-radius: 3px;
          padding: 0 2px;
        }
      `}</style>

      <div className="page-wrapper">
        {/* Ambient orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* Toast notification */}
        <div className={`toast ${toast ? "show" : ""}`}>
          <span>🎉</span>
          Yayyy! Your bookmark is saved!
        </div>

        {/* Navbar */}
        <nav className="navbar">
          <div className="nav-logo">
            <div className="nav-logo-icon">
              <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2z" fill="rgba(255,255,255,0.15)" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="nav-logo-text">Markly</span>
          </div>

          <div className="nav-right">
            {user && (
              <div className="greeting-pill">
                Hey, <span>{getFirstName()}</span> 👋
              </div>
            )}
            <button className="logout-btn" onClick={logout}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Sign Out
            </button>
          </div>
        </nav>

        {/* ── HERO / LANDING ── */}
        <section className="hero">
          <div className="hero-badge">
            <div className="hero-badge-dot" />
            Secure · Smart · Instant
          </div>

          <h1 className="hero-title">
            Your bookmarks,{" "}
            <span className="hero-title-accent">stored forever.</span>
          </h1>

          <p className="hero-sub">
            Every link you love, safe in one place.
            Just a beautifully organized vault that travels with you.
          </p>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-number">100%</div>
              <div className="hero-stat-label">Private</div>
            </div>
            <div className="hero-divider" />
            <div className="hero-stat">
              <div className="hero-stat-number">∞</div>
              <div className="hero-stat-label">Links</div>
            </div>
            <div className="hero-divider" />
            <div className="hero-stat">
              <div className="hero-stat-number">Real-time</div>
              <div className="hero-stat-label">Sync</div>
            </div>
          </div>

          <div className="scroll-hint">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            scroll to save
          </div>
        </section>

        {/* Feature cards */}
        <div className="features-row">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <div className="feature-title">Bank-level Security</div>
            <div className="feature-desc">Your links are encrypted and stored safely. Only you can access them.</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <div className="feature-title">Instant Sync</div>
            <div className="feature-desc">Save once, access anywhere. Real-time sync across all your devices.</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <div className="feature-title">Smart & Clean</div>
            <div className="feature-desc">Auto-fetches favicons and keeps everything organized beautifully.</div>
          </div>
        </div>

        {/* ── ADD BOOKMARK ── */}
        <div className="section">
          <div className="section-label">Save a link</div>

          <div className="add-card">
            <div className="add-card-title">Add a New Bookmark</div>
            <div className="add-card-sub">Paste any URL and give it a name. We will take care of the rest.</div>

            <div className="input-group">
              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a2 2 0 012-2z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <input
                  className="fancy-input"
                  placeholder="Give it a title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="input-wrapper">
                <span className="input-icon">
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <input
                  className="fancy-input"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addBookmark()}
                />
              </div>
            </div>

            <button className="save-btn" onClick={addBookmark} disabled={adding}>
              {adding ? (
                <>
                  <div className="spinner" />
                  Saving...
                </>
              ) : (
                <>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path d="M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Save Bookmark
                </>
              )}
            </button>
          </div>

          {/* ── SAVED BOOKMARKS ── */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "rgba(147,197,253,0.6)", textTransform: "uppercase", letterSpacing: "2px" }}>
              Saved Bookmarks
            </div>
            {!loading && (
              <div style={{ fontSize: "11px", color: "rgba(226,217,200,0.2)", marginLeft: "auto" }}>
                {search ? `${filteredBookmarks.length} of ${bookmarks.length}` : `${bookmarks.length} total`}
              </div>
            )}
          </div>

          {/* Search bar — only show when there are bookmarks */}
          {!loading && bookmarks.length > 0 && (
            <div className="search-wrapper">
              <span className="search-icon">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <input
                className="search-input"
                placeholder="Search by title or URL..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="search-clear" onClick={() => setSearch("")} title="Clear search">
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <>
              <div className="skeleton" />
              <div className="skeleton" style={{ opacity: 0.7 }} />
              <div className="skeleton" style={{ opacity: 0.4 }} />
            </>
          )}

          {/* Empty state */}
          {!loading && bookmarks.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🔖</div>
              <div className="empty-title">No bookmarks yet</div>
              <div className="empty-sub">Save your first link above and it will appear here instantly.</div>
            </div>
          )}

          {/* Bookmark list */}
          {!loading && bookmarks.length > 0 && (
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {filteredBookmarks.length === 0 && (
                <div className="search-no-results">
                  <div className="search-no-results-icon">🔍</div>
                  No bookmarks match <strong style={{ color: "rgba(226,217,200,0.5)" }}>{search}</strong>
                </div>
              )}
              {filteredBookmarks.map((b) => (
                <li key={b.id} className="bookmark-card">
                  {/* Favicon */}
                  <div className="favicon-box">
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${b.url}&sz=32`}
                      alt="favicon"
                      width={22}
                      height={22}
                      style={{ objectFit: "contain" }}
                    />
                  </div>

                  {/* Info */}
                  <div className="bookmark-info">
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bookmark-title-link"
                    >
                      {b.title}
                    </a>
                    <div className="bookmark-url">{b.url}</div>
                  </div>

                  {/* Actions */}
                  <div className="bookmark-actions">
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-btn"
                      title="Open"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                    <button
                      className="action-btn delete"
                      onClick={() => deleteBookmark(b.id)}
                      title="Delete"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", paddingBottom: "48px", color: "rgba(226,217,200,0.12)", fontSize: "12px", fontFamily: "'DM Sans', sans-serif", position: "relative", zIndex: 1 }}>
          Markly — Keep what matters.
        </div>
      </div>
    </>
  );
}
