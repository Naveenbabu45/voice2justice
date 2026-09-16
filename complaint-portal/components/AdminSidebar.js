'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminSidebar({ user }) {
  const pathname = usePathname();
  const router   = useRouter();

  const logout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/admin');
  };

  const navItems = [
    { href: '/admin/dashboard',   icon: '📊', label: 'Dashboard'    },
    { href: '/admin/complaints',  icon: '📋', label: 'Complaints'   },
    { href: '/',                  icon: '🌐', label: 'Public Portal' },
    { href: '/chat',              icon: '💬', label: 'File Complaint'},
  ];

  return (
    <aside
      className="w-56 flex-shrink-0 flex flex-col py-6 px-4 border-r"
      style={{ background: '#0d1117', borderColor: 'rgba(212,175,55,0.1)' }}
    >
      {/* Logo */}
      <div className="mb-8">
        <div className="text-3xl mb-1">🛡️</div>
        <p className="font-cinzel text-xs font-bold tracking-widest" style={{ color: '#d4af37' }}>
          ADMIN PANEL
        </p>
        {user && (
          <p className="font-cinzel text-xs mt-0.5" style={{ color: '#3a4060' }}>
            {user.name || user.username}
          </p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {navItems.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/') && item.href !== '/';
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-cinzel text-xs tracking-wide"
              style={{
                background: active ? 'rgba(212,175,55,0.1)' : 'transparent',
                color:      active ? '#d4af37' : '#5a6380',
                border:     active ? '1px solid rgba(212,175,55,0.2)' : '1px solid transparent',
              }}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={logout}
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-cinzel text-xs tracking-wide transition-all hover:bg-red-500/10"
        style={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', background: 'transparent', cursor: 'pointer' }}
      >
        🚪 Sign Out
      </button>
    </aside>
  );
}
