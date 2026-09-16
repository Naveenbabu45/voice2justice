'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';
import { STATUS_CONFIG, COMPLAINT_TYPE_LABELS } from '@/lib/constants';

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const colorMap = { amber: '#f59e0b', blue: '#3b82f6', purple: '#a855f7', green: '#22c55e', gray: '#6b7280', red: '#ef4444' };
  const c = colorMap[cfg.color];
  return (
    <span className="font-cinzel text-xs px-2 py-1 rounded-full"
      style={{ background: `${c}20`, color: c, border: `1px solid ${c}40` }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminComplaintsPage() {
  const router = useRouter();
  const [token, setToken] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ page: 1, status: 'all', language: 'all', search: '' });
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (!t) { router.push('/admin'); return; }
    setToken(t);
  }, []);

  const fetchComplaints = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const params = new URLSearchParams({
      page: filters.page, limit: 15,
      status: filters.status, language: filters.language,
      search: filters.search,
    });
    try {
      const res = await fetch(`/api/complaints?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      setData(d);
    } catch {}
    setLoading(false);
  }, [token, filters]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const setFilter = (key, val) => setFilters(p => ({ ...p, [key]: val, page: 1 }));

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0a0e1a' }}>
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 flex flex-col py-6 px-4 border-r" style={{ background: '#0d1117', borderColor: 'rgba(212,175,55,0.1)' }}>
        <div className="mb-8">
          <div className="text-2xl mb-1">🛡️</div>
          <p className="font-cinzel text-xs font-bold tracking-widest" style={{ color: '#d4af37' }}>ADMIN PANEL</p>
        </div>
        <nav className="flex-1 space-y-1">
          {[
            { href: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
            { href: '/admin/complaints', icon: '📋', label: 'Complaints', active: true },
            { href: '/', icon: '🌐', label: 'Public Portal' },
            { href: '/chat', icon: '💬', label: 'File Complaint' },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-cinzel text-xs tracking-wide"
              style={{
                background: item.active ? 'rgba(212,175,55,0.1)' : 'transparent',
                color: item.active ? '#d4af37' : '#5a6380',
                border: item.active ? '1px solid rgba(212,175,55,0.2)' : '1px solid transparent',
              }}>
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>
        <button onClick={async () => {
          await fetch('/api/auth', { method: 'DELETE' });
          localStorage.removeItem('admin_token');
          router.push('/admin');
        }} className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-cinzel text-xs tracking-wide transition-all hover:bg-red-500/10"
          style={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
          🚪 Sign Out
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-cinzel text-3xl font-bold" style={{ color: '#d4af37' }}>All Complaints</h1>
              <p className="font-crimson text-base mt-1" style={{ color: '#5a6380' }}>
                {data ? `${data.total} total complaints` : 'Loading...'}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="rounded-2xl p-5 mb-6 flex flex-wrap gap-3 items-center"
            style={{ background: '#111827', border: '1px solid rgba(212,175,55,0.15)' }}>
            {/* Search */}
            <div className="flex gap-2 flex-1 min-w-48">
              <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && setFilter('search', searchInput)}
                placeholder="Search by name, phone, ID..."
                className="flex-1 font-crimson text-sm rounded-xl px-4 py-2"
                style={{ background: '#0a0e1a', border: '1px solid rgba(212,175,55,0.2)', color: '#ccd6f6' }}/>
              <button onClick={() => setFilter('search', searchInput)}
                className="font-cinzel text-xs px-4 py-2 rounded-xl"
                style={{ background: '#d4af37', color: '#0a0e1a', border: 'none' }}>Search</button>
            </div>

            {/* Status filter */}
            <select value={filters.status} onChange={e => setFilter('status', e.target.value)}
              className="font-cinzel text-xs rounded-xl px-3 py-2 cursor-pointer"
              style={{ background: '#0a0e1a', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37' }}>
              <option value="all">All Status</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                <option key={k} value={k}>{v.icon} {v.label}</option>
              ))}
            </select>

            {/* Language filter */}
            <select value={filters.language} onChange={e => setFilter('language', e.target.value)}
              className="font-cinzel text-xs rounded-xl px-3 py-2 cursor-pointer"
              style={{ background: '#0a0e1a', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37' }}>
              <option value="all">All Languages</option>
              <option value="en">🇬🇧 English</option>
              <option value="hi">🇮🇳 Hindi</option>
              <option value="te">🌟 Telugu</option>
            </select>

            {(filters.search || filters.status !== 'all' || filters.language !== 'all') && (
              <button onClick={() => { setFilters({ page: 1, status: 'all', language: 'all', search: '' }); setSearchInput(''); }}
                className="font-cinzel text-xs px-3 py-2 rounded-xl"
                style={{ border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', background: 'transparent' }}>
                ✕ Clear
              </button>
            )}
          </div>

          {/* Table */}
          <div className="rounded-2xl overflow-hidden" style={{ background: '#111827', border: '1px solid rgba(212,175,55,0.15)' }}>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="dot-pulse"><span/><span/><span/></div>
              </div>
            ) : !data?.complaints?.length ? (
              <div className="text-center py-20">
                <p className="text-4xl mb-4">📭</p>
                <p className="font-cinzel text-sm tracking-widest" style={{ color: '#4a5380' }}>NO COMPLAINTS FOUND</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: 'rgba(212,175,55,0.05)', borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
                      {['Complaint ID', 'Complainant', 'Type', 'Location', 'Language', 'Status', 'Filed', 'Action'].map(h => (
                        <th key={h} className="font-cinzel text-xs tracking-widest px-4 py-4 text-left"
                          style={{ color: '#4a5380' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.complaints.map(c => (
                      <tr key={c.id} className="border-b transition-colors"
                        style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td className="px-4 py-4">
                          <span className="font-cinzel text-xs font-bold" style={{ color: '#d4af37' }}>{c.complaint_no}</span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-crimson text-sm font-semibold" style={{ color: '#ccd6f6' }}>{c.name}</p>
                          <p className="font-cinzel text-xs" style={{ color: '#4a5380' }}>{c.phone}</p>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-crimson text-sm" style={{ color: '#8892b0' }}>
                            {COMPLAINT_TYPE_LABELS[c.complaint_type] || c.complaint_type}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-crimson text-sm" style={{ color: '#8892b0' }}>
                            {c.incident_location?.substring(0, 25)}{c.incident_location?.length > 25 ? '…' : ''}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-base">{c.language === 'en' ? '🇬🇧' : c.language === 'hi' ? '🇮🇳' : '🌟'}</span>
                        </td>
                        <td className="px-4 py-4"><StatusBadge status={c.status}/></td>
                        <td className="px-4 py-4">
                          <span className="font-cinzel text-xs" style={{ color: '#4a5380' }}>{formatDate(c.created_at)}</span>
                        </td>
                        <td className="px-4 py-4">
                          <Link href={`/admin/complaints/${c.id}`}
                            className="font-cinzel text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                            style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37' }}>
                            Manage
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {data && data.pages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <span className="font-cinzel text-xs" style={{ color: '#4a5380' }}>
                  Page {data.page} of {data.pages} · {data.total} results
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setFilter('page', filters.page - 1)} disabled={filters.page <= 1}
                    className="font-cinzel text-xs px-4 py-2 rounded-lg disabled:opacity-40"
                    style={{ border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37', background: 'transparent' }}>
                    ← Prev
                  </button>
                  <button onClick={() => setFilter('page', filters.page + 1)} disabled={filters.page >= data.pages}
                    className="font-cinzel text-xs px-4 py-2 rounded-lg disabled:opacity-40"
                    style={{ border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37', background: 'transparent' }}>
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
