import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center p-6" style={{ background: '#0a0e1a' }}>
      <div>
        <p className="text-6xl mb-6">⚖️</p>
        <h1 className="font-cinzel text-5xl font-black mb-4" style={{ color: '#d4af37' }}>404</h1>
        <p className="font-cinzel text-sm tracking-widest mb-8" style={{ color: '#5a6380' }}>
          PAGE NOT FOUND
        </p>
        <Link href="/" className="font-cinzel text-sm tracking-widest px-6 py-3 rounded-xl"
          style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: '#d4af37' }}>
          ← RETURN TO PORTAL
        </Link>
      </div>
    </div>
  );
}
