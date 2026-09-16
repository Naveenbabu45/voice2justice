'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { STATUS_CONFIG, COMPLAINT_TYPE_LABELS } from '@/lib/constants';
import AdminSidebar from '@/components/AdminSidebar';

function StatCard({ icon, label, value, sub, color='#d4af37' }) {
  return (
    <div className="rounded-2xl p-6 flex flex-col gap-2"
      style={{ background:'#111827', border:`1px solid ${color}25` }}>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className="font-cinzel text-2xl font-black" style={{ color }}>{value}</span>
      </div>
      <p className="font-cinzel text-xs tracking-widest" style={{ color:'#4a5380' }}>{label}</p>
      {sub && <p className="font-crimson text-xs" style={{ color:'#3a4560' }}>{sub}</p>}
    </div>
  );
}

function MiniBar({ label, count, max, color }) {
  const pct = max > 0 ? (count/max)*100 : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="font-crimson text-sm" style={{ color:'#8892b0' }}>{label}</span>
        <span className="font-cinzel text-xs font-bold" style={{ color }}>{count}</span>
      </div>
      <div className="h-1.5 rounded-full" style={{ background:'rgba(255,255,255,0.06)' }}>
        <div className="h-1.5 rounded-full transition-all duration-700"
          style={{ width:`${pct}%`, background:color }}/>
      </div>
    </div>
  );
}

function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const colorMap = { amber:'#f59e0b', blue:'#3b82f6', purple:'#a855f7', green:'#22c55e', gray:'#6b7280', red:'#ef4444' };
  const c = colorMap[cfg.color];
  return (
    <span className="font-cinzel text-xs px-2 py-1 rounded-full"
      style={{ background:`${c}20`, color:c, border:`1px solid ${c}40` }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

export default function DashboardPage() {
  const [token, setToken]   = useState(null);
  const [user, setUser]     = useState(null);
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    const u = localStorage.getItem('admin_user');
    setToken(t);
    setUser(u ? JSON.parse(u) : {});
  }, []);

  useEffect(() => {
    if (!token) return;
    fetch('/api/stats', { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background:'#0a0e1a' }}>
        <div className="dot-pulse"><span/><span/><span/></div>
      </div>
    );
  }

  const maxTypeCount   = stats?.byType?.[0]?.count || 1;
  const maxStatusCount = Math.max(...(stats?.byStatus?.map(s=>s.count)||[1]));
  const colorMap = { amber:'#f59e0b', blue:'#3b82f6', purple:'#a855f7', green:'#22c55e', gray:'#6b7280', red:'#ef4444' };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background:'#0a0e1a' }}>
      <AdminSidebar user={user}/>
      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-cinzel text-3xl font-bold" style={{ color:'#d4af37' }}>Dashboard</h1>
              <p className="font-crimson text-base mt-1" style={{ color:'#5a6380' }}>Overview of all complaint activities</p>
            </div>
            <Link href="/admin/complaints"
              className="font-cinzel text-xs tracking-wide px-5 py-2.5 rounded-xl transition-all hover:opacity-90"
              style={{ background:'#d4af37', color:'#0a0e1a' }}>
              VIEW ALL →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <StatCard icon="📁" label="TOTAL"    value={stats?.total   || 0} color="#d4af37"/>
            <StatCard icon="⏳" label="PENDING"  value={stats?.pending || 0} color="#f59e0b"/>
            <StatCard icon="🔍" label="ACTIVE"   value={stats?.active  || 0} color="#3b82f6"/>
            <StatCard icon="✅" label="RESOLVED" value={stats?.resolved|| 0} color="#22c55e"/>
            <StatCard icon="📅" label="TODAY"    value={stats?.today   || 0} sub="Filed today" color="#a855f7"/>
            <StatCard icon="📆" label="THIS WEEK" value={stats?.thisWeek||0} sub="Last 7 days" color="#06b6d4"/>
            <StatCard icon="🌐" label="LANGUAGES" value="3" sub="EN · HI · TE" color="#d4af37"/>
            <StatCard icon="🤖" label="AI ASSISTED" value={stats?.total||0} sub="100% AI guided" color="#22c55e"/>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="rounded-2xl p-6" style={{ background:'#111827', border:'1px solid rgba(212,175,55,0.15)' }}>
              <h3 className="font-cinzel text-sm tracking-widest mb-5" style={{ color:'#d4af37' }}>BY COMPLAINT TYPE</h3>
              {stats?.byType?.length ? stats.byType.map(row=>(
                <MiniBar key={row.complaint_type}
                  label={COMPLAINT_TYPE_LABELS[row.complaint_type]||row.complaint_type}
                  count={row.count} max={maxTypeCount} color="#d4af37"/>
              )) : <p className="font-crimson text-sm" style={{ color:'#4a5380' }}>No data yet.</p>}
            </div>

            <div className="rounded-2xl p-6" style={{ background:'#111827', border:'1px solid rgba(212,175,55,0.15)' }}>
              <h3 className="font-cinzel text-sm tracking-widest mb-5" style={{ color:'#d4af37' }}>BY STATUS</h3>
              {stats?.byStatus?.map(row=>{
                const cfg=STATUS_CONFIG[row.status];
                return <MiniBar key={row.status}
                  label={`${cfg?.icon||''} ${cfg?.label||row.status}`}
                  count={row.count} max={maxStatusCount} color={colorMap[cfg?.color]||'#d4af37'}/>;
              })}
              <h3 className="font-cinzel text-sm tracking-widest mb-4 mt-6" style={{ color:'#d4af37' }}>BY LANGUAGE</h3>
              {stats?.byLanguage?.map(row=>(
                <MiniBar key={row.language}
                  label={row.language==='en'?'🇬🇧 English':row.language==='hi'?'🇮🇳 Hindi':'🌟 Telugu'}
                  count={row.count} max={stats.total||1} color="#06b6d4"/>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-6" style={{ background:'#111827', border:'1px solid rgba(212,175,55,0.15)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-cinzel text-sm tracking-widest" style={{ color:'#d4af37' }}>RECENT COMPLAINTS</h3>
              <Link href="/admin/complaints" className="font-cinzel text-xs" style={{ color:'#5a6380' }}>View All →</Link>
            </div>
            {stats?.recent?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor:'rgba(255,255,255,0.06)' }}>
                      {['Complaint ID','Name','Type','Status','Filed',''].map(h=>(
                        <th key={h} className="font-cinzel text-xs tracking-widest pb-3 text-left pr-4" style={{ color:'#3a4060' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recent.map(c=>(
                      <tr key={c.id} className="border-b" style={{ borderColor:'rgba(255,255,255,0.04)' }}>
                        <td className="py-3 pr-4"><span className="font-cinzel text-xs" style={{ color:'#d4af37' }}>{c.complaint_no}</span></td>
                        <td className="py-3 pr-4"><span className="font-crimson text-sm" style={{ color:'#ccd6f6' }}>{c.name}</span></td>
                        <td className="py-3 pr-4"><span className="font-crimson text-sm" style={{ color:'#8892b0' }}>{COMPLAINT_TYPE_LABELS[c.complaint_type]||c.complaint_type}</span></td>
                        <td className="py-3 pr-4"><StatusBadge status={c.status}/></td>
                        <td className="py-3 pr-4"><span className="font-cinzel text-xs" style={{ color:'#4a5380' }}>{formatDate(c.created_at)}</span></td>
                        <td className="py-3">
                          <Link href={`/admin/complaints/${c.id}`}
                            className="font-cinzel text-xs px-3 py-1.5 rounded-lg"
                            style={{ border:'1px solid rgba(212,175,55,0.2)', color:'#d4af37' }}>
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-4xl mb-3">📭</p>
                <p className="font-crimson text-base" style={{ color:'#4a5380' }}>No complaints yet. They will appear once citizens file them.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
