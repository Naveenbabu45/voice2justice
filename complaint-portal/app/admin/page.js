'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.user));
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('Network error. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#0a0e1a' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 70%)' }}/>
      </div>

      <div className="animate-slide-up w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🛡️</div>
          <h1 className="font-cinzel text-2xl font-bold tracking-widest mb-1" style={{ color: '#d4af37' }}>
            ADMIN PORTAL
          </h1>
          <p className="font-cinzel text-xs tracking-widest" style={{ color: '#4a5380' }}>
            POLICE COMPLAINT MANAGEMENT SYSTEM
          </p>
        </div>

        {/* Form */}
        <form onSubmit={login} className="rounded-2xl p-8"
          style={{ background: '#111827', border: '1px solid rgba(212,175,55,0.2)' }}>
          {error && (
            <div className="rounded-lg px-4 py-3 mb-5 font-crimson text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
              ⚠️ {error}
            </div>
          )}

          <div className="mb-4">
            <label className="font-cinzel text-xs tracking-widest block mb-2" style={{ color: '#5a6380' }}>
              USERNAME
            </label>
            <input
              type="text" value={form.username}
              onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
              placeholder="admin"
              className="w-full font-crimson text-base rounded-xl px-4 py-3"
              style={{ background: '#0a0e1a', border: '1px solid rgba(212,175,55,0.2)', color: '#ccd6f6' }}
              required
            />
          </div>

          <div className="mb-6">
            <label className="font-cinzel text-xs tracking-widest block mb-2" style={{ color: '#5a6380' }}>
              PASSWORD
            </label>
            <input
              type="password" value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="••••••••"
              className="w-full font-crimson text-base rounded-xl px-4 py-3"
              style={{ background: '#0a0e1a', border: '1px solid rgba(212,175,55,0.2)', color: '#ccd6f6' }}
              required
            />
          </div>

          <button type="submit" disabled={loading}
            className="w-full font-cinzel text-sm tracking-widest py-4 rounded-xl font-bold transition-all hover:opacity-90 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #d4af37, #b8962e)', color: '#0a0e1a', border: 'none' }}>
            {loading ? '⏳ AUTHENTICATING...' : '🔑 SIGN IN'}
          </button>

          <p className="font-cinzel text-xs text-center mt-4" style={{ color: '#2a3050' }}>
            Default: admin / Admin@2024 (change in .env)
          </p>
        </form>

        <div className="text-center mt-6">
          <a href="/" className="font-cinzel text-xs tracking-widest" style={{ color: '#3a4060' }}>
            ← Back to Portal
          </a>
        </div>
      </div>
    </div>
  );
}
