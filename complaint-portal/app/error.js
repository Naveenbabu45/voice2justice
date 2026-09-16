'use client';

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center text-center p-6" style={{ background: '#0a0e1a' }}>
      <div>
        <p className="text-5xl mb-6">⚠️</p>
        <h2 className="font-cinzel text-2xl font-bold mb-4" style={{ color: '#ef4444' }}>Something went wrong</h2>
        <p className="font-crimson text-base mb-8" style={{ color: '#5a6380' }}>
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <div className="flex gap-4 justify-center">
          <button onClick={reset}
            className="font-cinzel text-sm px-6 py-3 rounded-xl"
            style={{ background: '#d4af37', color: '#0a0e1a', border: 'none', cursor: 'pointer' }}>
            Try Again
          </button>
          <a href="/" className="font-cinzel text-sm px-6 py-3 rounded-xl"
            style={{ border: '1px solid rgba(212,175,55,0.3)', color: '#d4af37' }}>
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
