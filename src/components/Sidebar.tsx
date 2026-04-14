export default function Sidebar() {
  const routes = [
    { name: 'Zunitech Yandex', path: '/zunitech-yandex' },
    { name: 'Savdo Yandex', path: '/savdo-yandex' },
    { name: 'Zunitech Uzum', path: '/zunitech-uzum' },
    { name: 'Savdo Uzum', path: '/savdo-uzum' },
  ];

  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <h2>Multiorder</h2>
      </div>
      <nav className="flex-col gap-2">
        {routes.map((r) => (
          <a key={r.path} href={r.path} className="sidebar-link">
            {r.name}
          </a>
        ))}
      </nav>
      <style>{`
        .sidebar {
          width: 260px;
          height: 100vh;
          border-radius: 0;
          border-top: none;
          border-bottom: none;
          border-left: none;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .sidebar-header h2 {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          font-size: 1.5rem;
          text-align: center;
        }
        .sidebar-link {
          padding: 12px 16px;
          color: var(--text-muted);
          text-decoration: none;
          border-radius: 8px;
          transition: all 0.2s ease;
          font-weight: 500;
        }
        .sidebar-link:hover {
           background: rgba(255,255,255,0.05);
           color: var(--text-main);
        }
      `}</style>
    </aside>
  );
}
