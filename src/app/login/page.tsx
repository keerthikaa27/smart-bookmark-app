"use client";

import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/dashboard",
      },
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: #050d1a;
        }

        .login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #050d1a 0%, #071428 40%, #0a1c3a 70%, #071428 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        /* Ambient orbs */
        .orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          z-index: 0;
          animation: floatOrb 12s ease-in-out infinite alternate;
        }
        .orb-1 {
          width: 560px; height: 560px;
          background: radial-gradient(circle, rgba(29,78,216,0.18) 0%, transparent 70%);
          top: -140px; left: -120px;
          animation-delay: 0s;
        }
        .orb-2 {
          width: 420px; height: 420px;
          background: radial-gradient(circle, rgba(14,116,144,0.14) 0%, transparent 70%);
          bottom: -80px; right: -80px;
          animation-delay: -5s;
        }
        .orb-3 {
          width: 280px; height: 280px;
          background: radial-gradient(circle, rgba(29,78,216,0.10) 0%, transparent 70%);
          top: 55%; left: 55%;
          animation-delay: -9s;
        }
        @keyframes floatOrb {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, 40px) scale(1.08); }
        }

        /* Subtle grid */
        .grid-overlay {
          position: fixed;
          inset: 0;
          z-index: 0;
          opacity: 0.025;
          background-image:
            linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        /* Card */
        .login-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 440px;
          margin: 24px;
          background: rgba(226,217,200,0.04);
          border: 1px solid rgba(226,217,200,0.10);
          border-radius: 28px;
          padding: 52px 44px 44px;
          backdrop-filter: blur(24px);
          box-shadow:
            0 32px 80px rgba(0,0,0,0.5),
            0 0 0 1px rgba(255,255,255,0.04) inset,
            0 1px 0 rgba(255,255,255,0.08) inset;
          animation: cardIn 0.7s cubic-bezier(0.34, 1.4, 0.64, 1) both;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* Logo at top of card */
        .card-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 36px;
        }
        .card-logo-icon {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, #1d4ed8, #0e7490);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 24px rgba(29,78,216,0.45);
          flex-shrink: 0;
        }
        .card-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 700;
          color: #e2d9c8;
          letter-spacing: 0.3px;
        }

        /* Headline */
        .card-title {
          font-family: 'Playfair Display', serif;
          font-size: 30px;
          font-weight: 700;
          color: #e2d9c8;
          line-height: 1.2;
          margin-bottom: 10px;
          letter-spacing: -0.3px;
        }
        .card-title-accent {
          background: linear-gradient(90deg, #60a5fa, #38bdf8, #60a5fa);
          background-size: 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmerText 4s linear infinite;
        }
        @keyframes shimmerText {
          0%   { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        .card-sub {
          font-size: 14px;
          color: rgba(226,217,200,0.38);
          line-height: 1.65;
          margin-bottom: 36px;
          font-weight: 300;
        }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 28px;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.07);
        }
        .divider-text {
          font-size: 11px;
          color: rgba(226,217,200,0.22);
          text-transform: uppercase;
          letter-spacing: 1.5px;
          white-space: nowrap;
        }

        /* Google button */
        .google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: rgba(226,217,200,0.06);
          border: 1px solid rgba(226,217,200,0.14);
          border-radius: 14px;
          padding: 15px 20px;
          color: #e2d9c8;
          font-size: 15px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: 0.2px;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        .google-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(29,78,216,0.15), rgba(14,116,144,0.10));
          opacity: 0;
          transition: opacity 0.25s;
        }
        .google-btn:hover::before {
          opacity: 1;
        }
        .google-btn:hover {
          border-color: rgba(59,130,246,0.4);
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.3), 0 0 0 1px rgba(59,130,246,0.15);
        }
        .google-btn:active {
          transform: translateY(0);
        }

        .google-icon {
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }
        .google-btn-text {
          position: relative;
          z-index: 1;
        }

        /* Trust badges */
        .trust-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-top: 28px;
          flex-wrap: wrap;
        }
        .trust-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: rgba(226,217,200,0.22);
          letter-spacing: 0.3px;
        }
        .trust-dot {
          width: 14px; height: 14px;
          border-radius: 50%;
          background: rgba(29,78,216,0.25);
          border: 1px solid rgba(29,78,216,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 8px;
        }

        /* Floating quote on the side */
        .side-quote {
          position: fixed;
          bottom: 48px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 5;
          text-align: center;
          animation: fadeUp 1s 0.6s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .side-quote-text {
          font-family: 'Playfair Display', serif;
          font-size: 13px;
          color: rgba(226,217,200,0.15);
          font-style: italic;
          letter-spacing: 0.3px;
        }

        /* Decorative dots pattern top-right */
        .dots-pattern {
          position: fixed;
          top: 60px; right: 60px;
          z-index: 1;
          opacity: 0.06;
          pointer-events: none;
          display: grid;
          grid-template-columns: repeat(6, 10px);
          gap: 10px;
        }
        .dot-item {
          width: 3px; height: 3px;
          border-radius: 50%;
          background: #e2d9c8;
        }
      `}</style>

      <div className="login-page">
        {/* Orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* Grid overlay */}
        <div className="grid-overlay" />

        {/* Decorative dot grid */}
        <div className="dots-pattern">
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} className="dot-item" />
          ))}
        </div>

        {/* Login Card */}
        <div className="login-card">

          {/* Logo */}
          <div className="card-logo">
            <div className="card-logo-icon">
              <svg width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17 3H7a2 2 0 0 0-2 2v16l7-3 7 3V5a2 2 0 0 0-2-2z"
                  fill="rgba(255,255,255,0.15)" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="card-logo-text">Markly</span>
          </div>

          {/* Headline */}
          <h1 className="card-title">
            Your links,{" "}
            <span className="card-title-accent">always safe.</span>
          </h1>
          <p className="card-sub">
            Sign in to access your personal bookmark vault.
            Everything you save stays private, synced, and beautiful.
          </p>

          {/* Divider */}
          <div className="divider">
            <div className="divider-line" />
            <span className="divider-text">continue with</span>
            <div className="divider-line" />
          </div>

          {/* Google Sign In — original logic untouched */}
          <button className="google-btn" onClick={handleGoogleLogin}>
            <span className="google-icon">
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
              </svg>
            </span>
            <span className="google-btn-text">Sign in with Google</span>
          </button>

          {/* Trust badges */}
          <div className="trust-row">
            <div className="trust-item">
              <div className="trust-dot">🔒</div>
              Encrypted
            </div>
            <div className="trust-item">
              <div className="trust-dot">⚡</div>
              Instant Access
            </div>
          </div>
        </div>

        {/* Bottom quote */}
        <div className="side-quote">
          <p className="side-quote-text">
            The web is vast. Keep what matters.
          </p>
        </div>
      </div>
    </>
  );
}
