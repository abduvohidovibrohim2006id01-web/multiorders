'use client';

import { useState, useMemo } from 'react';

const DUMMY_ORDERS = [
  { id: '101951650', akt: '120000799407', sku: 'KEMEI-KEMEITRIMMER-МЕНТОЛ', sellerItemCode: 'KM-J03', title: 'Soch olish mashinkasi Kemei professional trimmer', date: '2024-04-14 09:00', qty: 1, type: 'yangi' },
  { id: '101951651', akt: '120000799407', sku: 'KEMEI-KEMEITRIMMER-МЕНТОЛ', sellerItemCode: 'KM-J03', title: 'Soch olish mashinkasi Kemei professional trimmer', date: '2024-04-14 09:02', qty: 1, type: 'yangi' },
  { id: '101951652', akt: '120000799408', sku: 'KEMEI-KEMEITRIMMER-МЕНТОЛ', sellerItemCode: 'KM-J03', title: 'Soch olish mashinkasi Kemei professional trimmer', date: '2024-04-14 09:05', qty: 1, type: 'eski' },
  { id: '101912514', akt: '120000799407', sku: 'UAKEENA-UAKEENMIKSER001-АЛЫЙ', sellerItemCode: '', title: 'UAKEEN ZL-2303 800W Qo‘l Mikseri', date: '2024-04-14 09:10', qty: 1, type: 'yangi' },
  { id: '101912515', akt: '120000799408', sku: 'UAKEENA-UAKEENMIKSER001-АЛЫЙ', sellerItemCode: '', title: 'UAKEEN ZL-2303 800W Qo‘l Mikseri', date: '2024-04-14 09:12', qty: 1, type: 'yangi' },
  { id: '101912516', akt: '120000799409', sku: 'BEAUTY-CREAM-001', sellerItemCode: 'BC-101', title: 'Yuz uchun oqartiruvchi krem', date: '2024-04-13 18:00', qty: 2, type: 'yangi' }
];

export default function StorePage({ params }: { params: { store: string } }) {
  const [activeTab, setActiveTab] = useState<'yangi' | 'eski'>('yangi');
  const [selectedGroup, setSelectedGroup] = useState<any[] | null>(null);

  // Ismni chiroyli formatlash: zunitech-yandex -> Zunitech Yandex
  const storeName = params.store.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  // Filter and Group Data
  const groupedOrders = useMemo(() => {
    const filtered = DUMMY_ORDERS.filter(o => o.type === activeTab);
    const groups: Record<string, typeof DUMMY_ORDERS> = {};
    
    filtered.forEach(o => {
      const key = o.sellerItemCode || o.sku;
      if (!groups[key]) groups[key] = [];
      groups[key].push(o);
    });

    return Object.values(groups);
  }, [activeTab]);

  return (
    <div className="store-container">
      <header className="flex justify-between items-center mb-8">
        <h1>{storeName}</h1>
        <div className="tabs glass-panel">
          <button 
            className={`tab-btn ${activeTab === 'yangi' ? 'active' : ''}`}
            onClick={() => setActiveTab('yangi')}
          >
            Yangi buyurtmalar
          </button>
          <button 
            className={`tab-btn ${activeTab === 'eski' ? 'active' : ''}`}
            onClick={() => setActiveTab('eski')}
          >
            Eski buyurtmalar
          </button>
        </div>
      </header>

      <div className="grid">
        {groupedOrders.length === 0 && (
          <p style={{ color: 'var(--text-muted)' }}>Hozircha buyurtmalar yo'q.</p>
        )}
        
        {groupedOrders.map((group, idx) => {
          const sample = group[0];
          const totalQty = group.reduce((sum, o) => sum + o.qty, 0);
          const primaryCode = sample.sellerItemCode || sample.sku;
          const secondaryCode = sample.sellerItemCode ? sample.sku : null;
          
          return (
            <div key={idx} className="order-card glass-panel flex-col justify-between" onClick={() => setSelectedGroup(group)}>
              <div className="card-top flex justify-between">
                <div className="flex-col">
                  <span className="primary-code">{primaryCode}</span>
                  {secondaryCode && <span className="secondary-code">{secondaryCode}</span>}
                </div>
                <div className="akt-badge">
                  AKT: {sample.akt}
                </div>
              </div>
              
              <div className="card-bottom flex justify-between items-center">
                <span className="product-title">{sample.title}</span>
                <span className="qty-badge">Soni: {totalQty} ta</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {selectedGroup && (
        <div className="modal-overlay flex justify-center items-center" onClick={() => setSelectedGroup(null)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center modal-header">
              <h2>{selectedGroup[0].sellerItemCode || selectedGroup[0].sku}</h2>
              <button className="close-btn" onClick={() => setSelectedGroup(null)}>✕</button>
            </div>
            
            <p className="modal-subtitle">{selectedGroup[0].title}</p>
            
            <div className="table-wrapper">
              <table className="order-table">
                <thead>
                  <tr>
                    <th>Sana</th>
                    <th>Buyurtma ID</th>
                    <th>AKT Raqami</th>
                    <th>Soni</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedGroup.map((o, i) => (
                    <tr key={i}>
                      <td>{o.date}</td>
                      <td>#{o.id}</td>
                      <td>{o.akt}</td>
                      <td>{o.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .mb-8 { margin-bottom: 2rem; }
        
        .tabs {
          display: flex;
          padding: 4px;
          border-radius: 12px;
        }
        .tab-btn {
          padding: 8px 16px;
          color: var(--text-muted);
          border-radius: 8px;
          font-weight: 600;
        }
        .tab-btn.active {
          background: rgba(255,255,255,0.1);
          color: var(--text-main);
        }
        .tab-btn:hover:not(.active) {
          color: var(--text-main);
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .order-card {
          padding: 1.5rem;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
          min-height: 160px;
        }
        .order-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 40px rgba(59, 130, 246, 0.15);
          border-color: rgba(59, 130, 246, 0.4);
        }

        .primary-code {
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--accent-color);
          line-height: 1.2;
        }
        .secondary-code {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: 4px;
        }
        
        .akt-badge {
          background: rgba(255,255,255,0.05);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          color: var(--text-muted);
          height: fit-content;
        }

        .product-title {
          font-size: 0.95rem;
          color: #cbd5e1;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          padding-right: 1rem;
        }

        .qty-badge {
          background: rgba(16, 185, 129, 0.15);
          color: var(--success);
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 0.9rem;
          white-space: nowrap;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          z-index: 100;
        }
        .modal-content {
          width: 90%;
          max-width: 600px;
          padding: 2rem;
          max-height: 85vh;
          overflow-y: auto;
        }
        .modal-header h2 {
          color: var(--accent-color);
          font-size: 2rem;
        }
        .close-btn {
          font-size: 1.5rem;
          color: var(--text-muted);
        }
        .close-btn:hover { color: white; }
        .modal-subtitle {
          color: var(--text-muted);
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
        }

        .table-wrapper {
          background: rgba(0,0,0,0.2);
          border-radius: 12px;
          overflow: hidden;
        }
        .order-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .order-table th {
          background: rgba(255,255,255,0.05);
          padding: 12px 16px;
          font-weight: 600;
          color: var(--text-muted);
          font-size: 0.85rem;
          text-transform: uppercase;
        }
        .order-table td {
          padding: 12px 16px;
          border-top: 1px solid rgba(255,255,255,0.05);
        }
        .order-table tr:hover td {
          background: rgba(255,255,255,0.03);
        }
      `}</style>
    </div>
  );
}
