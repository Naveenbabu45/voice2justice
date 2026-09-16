'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AdminLayout({ children }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Login page doesn't need auth
    if (pathname === '/admin') { setChecked(true); return; }

    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin');
      return;
    }

    // Verify token with server
    fetch('/api/auth', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        if (!r.ok) {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_user');
          router.push('/admin');
        } else {
          setChecked(true);
        }
      })
      .catch(() => router.push('/admin'));
  }, [pathname]);

  if (!checked) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#0a0e1a' }}
      >
        <div className="text-center">
          <div className="dot-pulse mx-auto mb-4 flex justify-center">
            <span/><span/><span/>
          </div>
          <p className="font-cinzel text-xs tracking-widest" style={{ color: '#4a5380' }}>
            AUTHENTICATING...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
