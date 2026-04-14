'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname() || '';

  const navItems = [
    { name: 'Barcha Do\'konlar', path: '/shops' },
  ];

  return (
    <aside className="sidebar surface">
      <div className="sidebar-header">
        <h2>Multiorder</h2>
      </div>
      <nav className="flex-col gap-2">
        {navItems.map((r) => {
          const isActive = pathname.startsWith(r.path);
          return (
            <Link key={r.path} href={r.path} className={`sidebar-link ${isActive ? 'active' : ''}`}>
              {r.name}
            </Link>
          )
        })}
      </nav>
      <style>{`
        .sidebar {
          width: 250px;
          height: 100vh;
          border-radius: 0;
          border-top: none;
          border-bottom: none;
          border-left: none;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          position: sticky;
          top: 0;
        }
        .sidebar-header h2 {
          color: var(--text-main);
          font-size: 1.25rem;
          font-weight: 700;
          padding-left: 8px;
        }
        .sidebar-link {
          padding: 10px 14px;
          color: var(--text-muted);
          border-radius: 8px;
          font-weight: 500;
          font-size: 0.95rem;
        }
        .sidebar-link:hover {
           background: var(--bg-color);
           color: var(--text-main);
        }
        .sidebar-link.active {
          background: var(--text-main);
          color: white;
        }
      `}</style>
    </aside>
  );
}
