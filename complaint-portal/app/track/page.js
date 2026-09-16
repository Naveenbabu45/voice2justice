'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LANGUAGES, STATUS_CONFIG, COMPLAINT_TYPE_LABELS } from '@/lib/constants';

const STATUS_STEPS = [
  'pending', 'under_investigation', 'fir_registered', 'resolved', 'closed'
];

function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const colorMap = {
    amber: 'rgba(245,158,11,0.15)', blue: 'rgba(59,130,246,0.15)',
    purple: 'rgba(168,85,247,0.15)', green: 'rgba(34,197,94,0.15)',
    gray: 'rgba(107,114,128,0.15)', red: 'rgba(239,68,68,0.15)',
  };
  const textMap = {
    amber: '#f59e0b', blue: '#3b82f6', purple: '#a855f7',
    green: '#22c55e', gray: '#6b7280', red: '#ef4444',
  };
  return (
    <span className="font-cinzel text-xs tracking-widest px-3 py-1.5 rounded-full"
      style={{ background: colorMap[cfg.color], color: textMap[cfg.color], border: `1px solid ${textMap[cfg.color]}40` }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

function TrackContent() {
  const searchParams = useSearchParams();
  const [lang] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('lang') || 'en' : 'en'));
  const t = LANGUAGES[lang] || LANGUAGES.en;

  const [query, setQuery] = useState(searchParams.get('id') || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchParams.get('id')) trackComplaint(searchParams.get('id'));
  }, []);

  const trackComplaint = async (id) => {
    const trackId = (id || query).trim().toUpperCase();
    if (!trackId) { setError('Please enter a complaint ID.'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await fetch(`/api/complaints/${trackId}`);
      const data = await res.json();
      if (res.ok) setResult(data);
      else setError(data.error || 'Complaint not found.');
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  const currentStep = result ? STATUS_STEPS.indexOf(result.complaint.status) : -1;

  return (
    <div className="min-h-screen" style={{ background: '#0a0e1a' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b"
        style={{ background: '#111827', borderColor: 'rgba(212,175,55,0.15)' }}>
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl">⚖️</span>
          <span className="font-cinzel text-sm tracking-widest" style={{ color: '#d4af37' }}>PORTAL</span>
        </Link>
        <Link href="/chat" className="font-cinzel text-xs tracking-wide px-4 py-2 rounded-lg transition-all hover:border-gold-500"
          style={{ border: '1px solid rgba(212,175,55,0.3)', color: '#d4af37' }}>
          + {t.newComplaint}
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* Search */}
        <div className="animate-fade-in text-center mb-10">
          <h1 className="font-cinzel text-3xl font-bold mb-2" style={{ color: '#d4af37' }}>{t.trackLabel}</h1>
          <p className="font-crimson text-base" style={{ color: '#5a6380' }}>
            {lang === 'en' ? 'Enter your complaint ID to check the status.' :
             lang === 'hi' ? 'स्थिति जानने के लिए शिकायत ID दर्ज करें।' :
             'స్థితి తెలుసుకోవడానికి ఫిర్యాదు ID నమోదు చేయండి.'}
          </p>
        </div>

        <div className="flex gap-3 mb-8">
          <input
            type="text" value={query}
            onChange={e => setQuery(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && trackComplaint()}
            placeholder={t.trackPlaceholder}
            className="flex-1 font-cinzel text-sm rounded-xl px-4 py-3 tracking-widest"
            style={{ background: '#111827', border: '1px solid rgba(212,175,55,0.2)', color: '#d4af37' }}
          />
          <button onClick={() => trackComplaint()} disabled={loading}
            className="font-cinzel text-sm tracking-wide px-6 py-3 rounded-xl font-bold transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: '#d4af37', color: '#0a0e1a', border: 'none' }}>
            {loading ? '...' : t.trackBtn}
          </button>
        </div>

        {error && (
          <div className="rounded-xl px-5 py-4 mb-6 font-crimson text-base text-center"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
            {error}
          </div>
        )}

        {result && (
          <div className="animate-slide-up">
            {/* Header */}
            <div className="rounded-2xl p-6 mb-4"
              style={{ background: '#111827', border: '1px solid rgba(212,175,55,0.2)' }}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-cinzel text-xs tracking-widest mb-1" style={{ color: '#5a6380' }}>COMPLAINT ID</p>
                  <p className="font-cinzel text-2xl font-bold" style={{ color: '#d4af37' }}>{result.complaint.complaint_no}</p>
                </div>
                <StatusBadge status={result.complaint.status}/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Complainant', v: result.complaint.name },
                  { label: 'Type', v: COMPLAINT_TYPE_LABELS[result.complaint.complaint_type] || result.complaint.complaint_type },
                  { label: 'Filed On', v: formatDate(result.complaint.created_at) },
                  { label: 'Last Updated', v: formatDate(result.complaint.updated_at) },
                ].map(({ label, v }) => (
                  <div key={label}>
                    <p className="font-cinzel text-xs tracking-wide mb-0.5" style={{ color: '#4a5380' }}>{label.toUpperCase()}</p>
                    <p className="font-crimson text-sm" style={{ color: '#ccd6f6' }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress tracker */}
            <div className="rounded-2xl p-6 mb-4"
              style={{ background: '#111827', border: '1px solid rgba(212,175,55,0.15)' }}>
              <p className="font-cinzel text-xs tracking-widest mb-5" style={{ color: '#4a5380' }}>COMPLAINT PROGRESS</p>
              <div className="relative">
                {/* Line */}
                <div className="absolute top-4 left-4 right-4 h-0.5" style={{ background: 'rgba(255,255,255,0.06)' }}/>
                <div className="absolute top-4 left-4 h-0.5 transition-all duration-700"
                  style={{
                    background: 'linear-gradient(90deg, #d4af37, #22c55e)',
                    width: currentStep >= 0 ? `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` : '0%',
                  }}/>
                <div className="relative flex justify-between">
                  {STATUS_STEPS.map((step, idx) => {
                    const cfg = STATUS_CONFIG[step];
                    const done = idx <= currentStep;
                    return (
                      <div key={step} className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm z-10 transition-all"
                          style={{
                            background: done ? 'linear-gradient(135deg, #d4af37, #22c55e)' : '#1a2035',
                            border: done ? 'none' : '1px solid rgba(255,255,255,0.1)',
                          }}>
                          {done ? '✓' : cfg.icon}
                        </div>
                        <p className="font-cinzel text-xs text-center max-w-[60px] leading-tight"
                          style={{ color: done ? '#d4af37' : '#3a4060', fontSize: '9px' }}>
                          {cfg.label.toUpperCase()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* History */}
            {result.history?.length > 0 && (
              <div className="rounded-2xl p-6"
                style={{ background: '#111827', border: '1px solid rgba(212,175,55,0.15)' }}>
                <p className="font-cinzel text-xs tracking-widest mb-4" style={{ color: '#4a5380' }}>ACTIVITY LOG</p>
                <div className="relative pl-6 border-l" style={{ borderColor: 'rgba(212,175,55,0.15)' }}>
                  {[...result.history].reverse().map((h, i) => (
                    <div key={h.id} className={`mb-4 ${i === 0 ? '' : 'opacity-70'}`}>
                      <div className="absolute -left-1.5 w-3 h-3 rounded-full"
                        style={{ background: i === 0 ? '#d4af37' : '#2a3050', top: i === 0 ? '4px' : undefined }}/>
                      <p className="font-crimson text-sm font-semibold" style={{ color: '#ccd6f6' }}>
                        {STATUS_CONFIG[h.new_status]?.icon} Status changed to <strong>{STATUS_CONFIG[h.new_status]?.label}</strong>
                      </p>
                      {h.note && <p className="font-crimson text-sm mt-0.5" style={{ color: '#8892b0' }}>{h.note}</p>}
                      <p className="font-cinzel text-xs mt-1" style={{ color: '#4a5380' }}>
                        {formatDate(h.created_at)} · by {h.changed_by}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0e1a' }}>
      <div className="font-cinzel text-sm tracking-widest" style={{ color: '#d4af37' }}>Loading...</div>
    </div>}>
      <TrackContent />
    </Suspense>
  );
}
