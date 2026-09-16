'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';
import { STATUS_CONFIG, COMPLAINT_TYPE_LABELS } from '@/lib/constants';

const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([k, v]) => ({ value: k, label: `${v.icon} ${v.label}` }));

function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const colorMap = { amber: '#f59e0b', blue: '#3b82f6', purple: '#a855f7', green: '#22c55e', gray: '#6b7280', red: '#ef4444' };
  const c = colorMap[cfg.color];
  return (
    <span className="font-cinzel text-sm px-4 py-2 rounded-full"
      style={{ background: `${c}20`, color: c, border: `1px solid ${c}40` }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

export default function ComplaintDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [token, setToken] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ status: '', note: '', priority: '', assigned_to: '', officer_notes: '' });
  const [flash, setFlash] = useState('');

  useEffect(() => {
    const t = localStorage.getItem('admin_token');
    if (!t) { router.push('/admin'); return; }
    setToken(t);
  }, []);

  useEffect(() => {
    if (!token || !params.id) return;
    fetch(`/api/complaints/${params.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.complaint) {
          setData(d);
          setForm(f => ({
            ...f,
            status: d.complaint.status,
            priority: d.complaint.priority || 'normal',
            assigned_to: d.complaint.assigned_to || '',
            officer_notes: d.complaint.officer_notes || '',
          }));
        }
        setLoading(false);
      });
  }, [token, params.id]);

  const showFlash = (msg) => { setFlash(msg); setTimeout(() => setFlash(''), 3000); };

  const updateStatus = async () => {
    setSaving(true);
    const res = await fetch(`/api/complaints/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: 'update_status', status: form.status, note: form.note }),
    });
    const d = await res.json();
    if (d.success) {
      setData(prev => ({ ...prev, complaint: d.complaint }));
      showFlash('✅ Status updated successfully!');
      setForm(f => ({ ...f, note: '' }));
      // Refresh history
      fetch(`/api/complaints/${params.id}`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => setData(d));
    }
    setSaving(false);
  };

  const updateDetails = async () => {
    setSaving(true);
    const res = await fetch(`/api/complaints/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action: 'update_details', priority: form.priority, assigned_to: form.assigned_to, officer_notes: form.officer_notes }),
    });
    const d = await res.json();
    if (d.success) showFlash('✅ Details updated!');
    setSaving(false);
  };

  if (!token || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0e1a' }}>
        <div className="dot-pulse"><span/><span/><span/></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0e1a' }}>
        <div className="text-center">
          <p className="font-cinzel text-xl" style={{ color: '#ef4444' }}>Complaint not found</p>
          <Link href="/admin/complaints" className="font-cinzel text-sm mt-4 block" style={{ color: '#d4af37' }}>← Back</Link>
        </div>
      </div>
    );
  }

  const c = data.complaint;

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
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Flash */}
          {flash && (
            <div className="mb-4 rounded-xl px-5 py-3 font-cinzel text-sm animate-fade-in"
              style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: '#22c55e' }}>
              {flash}
            </div>
          )}

          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <Link href="/admin/complaints" className="font-cinzel text-xs mb-3 flex items-center gap-1" style={{ color: '#5a6380' }}>
                ← All Complaints
              </Link>
              <h1 className="font-cinzel text-2xl font-bold" style={{ color: '#d4af37' }}>{c.complaint_no}</h1>
              <p className="font-crimson text-base mt-1" style={{ color: '#5a6380' }}>
                Filed {formatDate(c.created_at)} · {c.language.toUpperCase()}
              </p>
            </div>
            <StatusBadge status={c.status}/>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: complaint info */}
            <div className="lg:col-span-2 space-y-5">
              {/* Complainant */}
              <div className="rounded-2xl p-6" style={{ background: '#111827', border: '1px solid rgba(212,175,55,0.15)' }}>
                <h3 className="font-cinzel text-xs tracking-widest mb-4" style={{ color: '#d4af37' }}>COMPLAINANT DETAILS</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name', v: c.name },
                    { label: 'Phone', v: c.phone },
                    { label: 'Address', v: c.address },
                    { label: 'Language', v: c.language === 'en' ? '🇬🇧 English' : c.language === 'hi' ? '🇮🇳 Hindi' : '🌟 Telugu' },
                  ].map(({ label, v }) => (
                    <div key={label}>
                      <p className="font-cinzel text-xs tracking-wide mb-1" style={{ color: '#4a5380' }}>{label.toUpperCase()}</p>
                      <p className="font-crimson text-sm" style={{ color: '#ccd6f6' }}>{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Incident */}
              <div className="rounded-2xl p-6" style={{ background: '#111827', border: '1px solid rgba(212,175,55,0.15)' }}>
                <h3 className="font-cinzel text-xs tracking-widest mb-4" style={{ color: '#d4af37' }}>INCIDENT DETAILS</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {[
                    { label: 'Complaint Type', v: COMPLAINT_TYPE_LABELS[c.complaint_type] || c.complaint_type },
                    { label: 'Date / Time', v: c.incident_date },
                    { label: 'Location', v: c.incident_location },
                    { label: 'Priority', v: c.priority?.toUpperCase() || 'NORMAL' },
                  ].map(({ label, v }) => (
                    <div key={label}>
                      <p className="font-cinzel text-xs tracking-wide mb-1" style={{ color: '#4a5380' }}>{label.toUpperCase()}</p>
                      <p className="font-crimson text-sm" style={{ color: '#ccd6f6' }}>{v}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-cinzel text-xs tracking-wide mb-2" style={{ color: '#4a5380' }}>INCIDENT DESCRIPTION</p>
                  <p className="font-crimson text-base leading-relaxed p-4 rounded-xl"
                    style={{ background: '#0a0e1a', color: '#ccd6f6', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {c.incident_description}
                  </p>
                </div>
              </div>

              {/* Activity Log */}
              {data.history?.length > 0 && (
                <div className="rounded-2xl p-6" style={{ background: '#111827', border: '1px solid rgba(212,175,55,0.15)' }}>
                  <h3 className="font-cinzel text-xs tracking-widest mb-4" style={{ color: '#d4af37' }}>ACTIVITY LOG</h3>
                  <div className="relative pl-6 border-l" style={{ borderColor: 'rgba(212,175,55,0.15)' }}>
                    {data.history.map((h, i) => (
                      <div key={h.id} className="mb-4 relative">
                        <div className="absolute -left-8 top-1 w-3 h-3 rounded-full"
                          style={{ background: i === data.history.length - 1 ? '#d4af37' : '#2a3050' }}/>
                        <p className="font-crimson text-sm font-semibold" style={{ color: '#ccd6f6' }}>
                          {STATUS_CONFIG[h.new_status]?.icon} Changed to <strong>{STATUS_CONFIG[h.new_status]?.label}</strong>
                          {h.old_status && <span style={{ color: '#4a5380' }}> (from {STATUS_CONFIG[h.old_status]?.label})</span>}
                        </p>
                        {h.note && <p className="font-crimson text-sm mt-0.5 italic" style={{ color: '#8892b0' }}>"{h.note}"</p>}
                        <p className="font-cinzel text-xs mt-1" style={{ color: '#3a4060' }}>
                          {formatDate(h.created_at)} · {h.changed_by}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Actions */}
            <div className="space-y-5">
              {/* Update Status */}
              <div className="rounded-2xl p-5" style={{ background: '#111827', border: '1px solid rgba(212,175,55,0.2)' }}>
                <h3 className="font-cinzel text-xs tracking-widest mb-4" style={{ color: '#d4af37' }}>UPDATE STATUS</h3>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full font-cinzel text-xs rounded-xl px-3 py-2.5 mb-3 cursor-pointer"
                  style={{ background: '#0a0e1a', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37' }}>
                  {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="Add a note (optional)..."
                  rows={3} className="w-full font-crimson text-sm rounded-xl px-3 py-2 mb-3 resize-none"
                  style={{ background: '#0a0e1a', border: '1px solid rgba(255,255,255,0.1)', color: '#ccd6f6' }}/>
                <button onClick={updateStatus} disabled={saving}
                  className="w-full font-cinzel text-xs tracking-widest py-3 rounded-xl font-bold transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: '#d4af37', color: '#0a0e1a', border: 'none' }}>
                  {saving ? '⏳ Saving...' : 'UPDATE STATUS'}
                </button>
              </div>

              {/* Officer Details */}
              <div className="rounded-2xl p-5" style={{ background: '#111827', border: '1px solid rgba(212,175,55,0.15)' }}>
                <h3 className="font-cinzel text-xs tracking-widest mb-4" style={{ color: '#d4af37' }}>OFFICER DETAILS</h3>

                <label className="font-cinzel text-xs tracking-wide block mb-1" style={{ color: '#4a5380' }}>PRIORITY</label>
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                  className="w-full font-cinzel text-xs rounded-xl px-3 py-2 mb-3 cursor-pointer"
                  style={{ background: '#0a0e1a', border: '1px solid rgba(255,255,255,0.1)', color: '#ccd6f6' }}>
                  <option value="low">🟢 Low</option>
                  <option value="normal">🟡 Normal</option>
                  <option value="high">🟠 High</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>

                <label className="font-cinzel text-xs tracking-wide block mb-1" style={{ color: '#4a5380' }}>ASSIGNED TO</label>
                <input value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}
                  placeholder="Officer name or badge no."
                  className="w-full font-crimson text-sm rounded-xl px-3 py-2 mb-3"
                  style={{ background: '#0a0e1a', border: '1px solid rgba(255,255,255,0.1)', color: '#ccd6f6' }}/>

                <label className="font-cinzel text-xs tracking-wide block mb-1" style={{ color: '#4a5380' }}>OFFICER NOTES</label>
                <textarea value={form.officer_notes} onChange={e => setForm(f => ({ ...f, officer_notes: e.target.value }))}
                  placeholder="Internal notes (not visible to public)..."
                  rows={4} className="w-full font-crimson text-sm rounded-xl px-3 py-2 mb-3 resize-none"
                  style={{ background: '#0a0e1a', border: '1px solid rgba(255,255,255,0.1)', color: '#ccd6f6' }}/>

                <button onClick={updateDetails} disabled={saving}
                  className="w-full font-cinzel text-xs tracking-widest py-3 rounded-xl transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: '#d4af37' }}>
                  {saving ? '⏳ Saving...' : 'SAVE DETAILS'}
                </button>
              </div>

              {/* Quick actions */}
              <div className="rounded-2xl p-5" style={{ background: '#111827', border: '1px solid rgba(212,175,55,0.15)' }}>
                <h3 className="font-cinzel text-xs tracking-widest mb-4" style={{ color: '#d4af37' }}>QUICK ACTIONS</h3>
                <div className="space-y-2">
                  <Link href={`/track?id=${c.complaint_no}`} target="_blank"
                    className="flex items-center gap-2 font-cinzel text-xs px-4 py-2.5 rounded-xl transition-all hover:opacity-80"
                    style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#8892b0', background: 'transparent' }}>
                    🔍 View Public Tracking
                  </Link>
                  <button onClick={() => window.print()}
                    className="w-full flex items-center gap-2 font-cinzel text-xs px-4 py-2.5 rounded-xl transition-all hover:opacity-80"
                    style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#8892b0', background: 'transparent' }}>
                    🖨️ Print Complaint
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
