'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

const liveStats = [
  { label: 'TOTAL COMPLAINTS', key: 'total',    icon: '📁', color: '#d4af37' },
  { label: 'PENDING ACTION',   key: 'pending',   icon: '⏳', color: '#f59e0b' },
  { label: 'UNDER REVIEW',     key: 'active',    icon: '🔍', color: '#3b82f6' },
  { label: 'RESOLVED',         key: 'resolved',  icon: '✅', color: '#22c55e' },
];

const features = [
  { icon: '📊', title: 'Live Dashboard',      desc: 'Real-time analytics — complaints by type, status, language, and date range.' },
  { icon: '🔎', title: 'Case Management',     desc: 'Search, filter, assign, and update any complaint with full audit trail.' },
  { icon: '🔄', title: 'Status Workflow',     desc: 'Move cases through Pending → Investigation → FIR → Resolved with notes.' },
  { icon: '📋', title: 'Officer Notes',       desc: 'Add internal notes, assign officers, set priority — all in one place.' },
  { icon: '🌐', title: 'Multilingual View',   desc: 'See complaints filed in Telugu, Hindi, or English — all in one interface.' },
  { icon: '🔒', title: 'Secure Access',       desc: 'JWT-authenticated with role-based access. Every action is logged.' },
];

// Animated counter
function Counter({ target, duration = 1200 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      start = Math.min(start + step, target);
      setCount(Math.floor(start));
      if (start >= target) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [target, duration]);
  return <>{count}</>;
}

export default function PolicePage() {
  const router = useRouter();
  const [stats, setStats]   = useState(null);
  const [clock, setClock]   = useState('');
  const [scanPct, setScanPct] = useState(0);

  // Live clock
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-IN', { hour12: false }));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch live stats (unauthenticated summary is fine — just total counts)
  useEffect(() => {
    // Use dummy preview data while unauthenticated
    setStats({ total: 0, pending: 0, active: 0, resolved: 0 });
    const token = localStorage.getItem('admin_token');
    if (!token) return;
    fetch('/api/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStats(d); })
      .catch(() => {});
  }, []);

  // Scanning animation
  useEffect(() => {
    const t = setInterval(() => setScanPct(p => p >= 100 ? 0 : p + 0.5), 50);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#060a0f', color: '#c8d6e5', fontFamily: 'monospace' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&display=swap');
        * { box-sizing:border-box; }
        .p-nav { background:rgba(6,10,15,0.95); backdrop-filter:blur(12px); border-bottom:1px solid rgba(212,175,55,0.2); position:sticky; top:0; z-index:50; }
        .p-stat-card { background:rgba(255,255,255,0.03); border:1px solid rgba(212,175,55,0.15); border-radius:12px; padding:20px; transition:all 0.3s; position:relative; overflow:hidden; }
        .p-stat-card::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(212,175,55,0.03),transparent); }
        .p-stat-card:hover { border-color:rgba(212,175,55,0.4); background:rgba(212,175,55,0.04); transform:translateY(-2px); }
        .p-feature-card { background:rgba(255,255,255,0.02); border:1px solid rgba(212,175,55,0.1); border-radius:14px; padding:24px; transition:all 0.3s; }
        .p-feature-card:hover { background:rgba(212,175,55,0.04); border-color:rgba(212,175,55,0.3); transform:translateY(-3px); box-shadow:0 12px 40px rgba(212,175,55,0.08); }
        .p-btn-primary { background:linear-gradient(135deg,#d4af37,#b8962e); color:#060a0f; border:none; padding:16px 44px; border-radius:8px; font-family:'Cinzel',serif; font-size:12px; letter-spacing:3px; cursor:pointer; transition:all 0.3s; font-weight:700; box-shadow:0 8px 32px rgba(212,175,55,0.35); }
        .p-btn-primary:hover { transform:translateY(-3px); box-shadow:0 16px 48px rgba(212,175,55,0.5); }
        .p-btn-ghost { background:transparent; color:#d4af37; border:1px solid rgba(212,175,55,0.4); padding:16px 44px; border-radius:8px; font-family:'Cinzel',serif; font-size:12px; letter-spacing:3px; cursor:pointer; transition:all 0.3s; }
        .p-btn-ghost:hover { background:rgba(212,175,55,0.08); transform:translateY(-3px); }
        @keyframes scanH { 0%{left:-100%} 100%{left:200%} }
        .scan-h { position:absolute; top:0; bottom:0; width:40%; background:linear-gradient(90deg,transparent,rgba(212,175,55,0.06),transparent); animation:scanH 3s linear infinite; pointer-events:none; }
        @keyframes gridPulse { 0%,100%{opacity:0.03} 50%{opacity:0.07} }
        .grid-bg { background-image:linear-gradient(rgba(212,175,55,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(212,175,55,0.1) 1px,transparent 1px); background-size:48px 48px; animation:gridPulse 4s ease-in-out infinite; }
        .amber-text { color:#d4af37; }
        .mono { font-family:'Share Tech Mono',monospace; }
        .rajdhani { font-family:'Rajdhani',sans-serif; }
        .cinzel { font-family:'Cinzel',serif; }
        @keyframes pFadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .p-hero { animation:pFadeIn 0.7s ease forwards; }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .blink { animation:blink 1s step-end infinite; }
        .badge-online { display:inline-flex; align-items:center; gap:6px; background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.3); border-radius:4px; padding:4px 12px; }
        .dot-green { width:6px; height:6px; border-radius:50%; background:#22c55e; animation:blink 1.5s ease-in-out infinite; }
      `}</style>

      {/* Nav */}
      <nav className="p-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => router.push('/')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#5a6380', fontSize: '16px' }}>←</button>
          <span style={{ fontSize: '18px' }}>🛡️</span>
          <div>
            <div className="cinzel amber-text" style={{ fontSize: '12px', letterSpacing: '3px' }}>POLICE COMMAND PORTAL</div>
            <div className="mono" style={{ fontSize: '9px', color: '#3a4060', letterSpacing: '1px' }}>AP POLICE · COMPLAINT MANAGEMENT SYSTEM v2.0</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="badge-online">
            <div className="dot-green"/>
            <span className="mono" style={{ fontSize: '10px', color: '#22c55e', letterSpacing: '2px' }}>SYSTEM ONLINE</span>
          </div>
          <div className="mono amber-text" style={{ fontSize: '14px', letterSpacing: '2px' }}>{clock}</div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', padding: '80px 32px 60px', textAlign: 'center', overflow: 'hidden' }}>
        <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.5, pointerEvents: 'none' }}/>
        <div className="scan-h"/>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(212,175,55,0.04) 0%, transparent 100%)', pointerEvents: 'none' }}/>

        <div className="p-hero" style={{ position: 'relative', zIndex: 1 }}>
          {/* Terminal badge */}
          <div style={{ display: 'inline-block', background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '4px', padding: '6px 16px', marginBottom: '32px' }}>
            <span className="mono" style={{ fontSize: '11px', color: '#d4af37', letterSpacing: '2px' }}>
              [AUTHORIZED PERSONNEL ONLY]<span className="blink">_</span>
            </span>
          </div>

          {/* Ashoka Chakra */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <svg width="72" height="72" viewBox="0 0 72 72" style={{ animation: 'spin 18s linear infinite' }}>
              <style>{'@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}'}</style>
              <circle cx="36" cy="36" r="34" fill="none" stroke="#d4af37" strokeWidth="1.2" opacity="0.5"/>
              <circle cx="36" cy="36" r="9"  fill="none" stroke="#d4af37" strokeWidth="1.2" opacity="0.5"/>
              {Array.from({length:24},(_,i) => {
                const a = (i*15)*Math.PI/180;
                return <line key={i} x1={36+9*Math.cos(a)} y1={36+9*Math.sin(a)} x2={36+33*Math.cos(a)} y2={36+33*Math.sin(a)} stroke="#d4af37" strokeWidth="0.7" opacity="0.4"/>;
              })}
            </svg>
          </div>

          <h1 className="cinzel" style={{ fontSize: 'clamp(24px,4vw,52px)', fontWeight: 900, color: '#d4af37', letterSpacing: '4px', lineHeight: 1.2, marginBottom: '14px', textShadow: '0 0 60px rgba(212,175,55,0.3)' }}>
            POLICE COMMAND CENTER
          </h1>
          <p className="rajdhani" style={{ fontSize: 'clamp(13px,1.8vw,17px)', color: 'rgba(200,214,229,0.45)', maxWidth: '520px', margin: '0 auto 16px', letterSpacing: '1px', lineHeight: 1.7 }}>
            Centralized AI-powered complaint management system for law enforcement officers and supervisors.
          </p>
          <p className="mono" style={{ fontSize: '11px', color: 'rgba(212,175,55,0.35)', marginBottom: '40px', letterSpacing: '1px' }}>
            పోలీస్ కమాండ్ సెంటర్ · पुलिस कमांड सेंटर
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="p-btn-primary" onClick={() => router.push('/admin')}>
              🔑 OFFICER LOGIN
            </button>
            <button className="p-btn-ghost" onClick={() => router.push('/admin/dashboard')}>
              📊 VIEW DASHBOARD
            </button>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section style={{ padding: '20px 32px 50px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span className="cinzel" style={{ fontSize: '10px', letterSpacing: '4px', color: '#4a5380' }}>SYSTEM METRICS</span>
          <span className="mono" style={{ fontSize: '10px', color: '#22c55e', letterSpacing: '1px' }}>● LIVE</span>
        </div>

        {/* Progress bar (scan) */}
        <div style={{ height: '2px', background: 'rgba(212,175,55,0.1)', borderRadius: '1px', marginBottom: '20px', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg,transparent,#d4af37,transparent)', width: '30%', transform: `translateX(${scanPct * 2.3}%)`, transition: 'none' }}/>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '14px' }}>
          {liveStats.map(s => (
            <div key={s.key} className="p-stat-card" style={{ borderColor: `${s.color}25` }}>
              <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px' }}>{s.icon}</span>
                <span className="cinzel" style={{ fontSize: '26px', fontWeight: 900, color: s.color }}>
                  {stats ? <Counter target={stats[s.key] || 0}/> : '—'}
                </span>
              </div>
              <span className="cinzel" style={{ fontSize: '9px', letterSpacing: '2px', color: '#3a4060' }}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '20px 32px 60px', maxWidth: '900px', margin: '0 auto' }}>
        <div className="cinzel" style={{ fontSize: '10px', letterSpacing: '5px', color: '#4a5380', textAlign: 'center', marginBottom: '28px' }}>
          SYSTEM CAPABILITIES
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '14px' }}>
          {features.map(f => (
            <div key={f.title} className="p-feature-card">
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>{f.icon}</div>
              <h3 className="cinzel amber-text" style={{ fontSize: '11px', letterSpacing: '2px', marginBottom: '8px' }}>{f.title.toUpperCase()}</h3>
              <p className="rajdhani" style={{ fontSize: '14px', color: 'rgba(200,214,229,0.45)', lineHeight: 1.65, letterSpacing: '0.3px' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Access Levels */}
      <section style={{ padding: '20px 32px 60px', maxWidth: '900px', margin: '0 auto' }}>
        <div className="cinzel" style={{ fontSize: '10px', letterSpacing: '5px', color: '#4a5380', textAlign: 'center', marginBottom: '24px' }}>
          ACCESS CREDENTIALS
        </div>
        <div style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: '14px', padding: '28px 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '20px' }}>
            {[
              { role: 'SUPERADMIN', icon: '👑', perms: ['Full system access', 'Manage officers', 'View all data', 'System settings'] },
              { role: 'OFFICER',    icon: '👮', perms: ['View complaints', 'Update status', 'Add notes', 'Assign cases'] },
              { role: 'SUPERVISOR', icon: '🎖️', perms: ['All officer access', 'Priority override', 'Reports export', 'Analytics view'] },
            ].map(r => (
              <div key={r.role}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <span style={{ fontSize: '18px' }}>{r.icon}</span>
                  <span className="cinzel amber-text" style={{ fontSize: '11px', letterSpacing: '2px' }}>{r.role}</span>
                </div>
                {r.perms.map(p => (
                  <div key={p} className="mono" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '11px', color: 'rgba(200,214,229,0.4)' }}>
                    <span style={{ color: '#22c55e' }}>✓</span> {p}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Login CTA */}
      <div style={{ background: 'rgba(212,175,55,0.04)', borderTop: '1px solid rgba(212,175,55,0.12)', padding: '48px 32px', textAlign: 'center' }}>
        <div className="mono" style={{ fontSize: '11px', color: 'rgba(212,175,55,0.4)', letterSpacing: '2px', marginBottom: '16px' }}>
          $ authenticate --portal=police --role=officer
        </div>
        <h3 className="cinzel" style={{ fontSize: '20px', color: '#d4af37', marginBottom: '8px' }}>
          Ready to access the system?
        </h3>
        <p className="rajdhani" style={{ fontSize: '15px', color: 'rgba(200,214,229,0.4)', marginBottom: '28px' }}>
          Use your authorized credentials to log in.
        </p>
        <button className="p-btn-primary" onClick={() => router.push('/admin')} style={{ fontSize: '13px', padding: '18px 56px' }}>
          🔑 OFFICER LOGIN →
        </button>
        <div className="mono" style={{ marginTop: '16px', fontSize: '10px', color: '#2a3050', letterSpacing: '1px' }}>
          [AUTHORIZED ACCESS ONLY · ALL SESSIONS LOGGED · VIOLATIONS PROSECUTED]
        </div>
      </div>
    </div>
  );
}
