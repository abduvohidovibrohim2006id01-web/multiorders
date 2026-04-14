'use client';

import { use, useMemo } from 'react';
import Link from 'next/link';

// Mock DB
const DUMMY_ORDERS = [
  { id: '101951650', akt: '120000799407', sku: 'KEMEI-KEMEITRIMMER-МЕНТОЛ', sellerItemCode: 'KM-J03', title: 'Soch olish mashinkasi Kemei professional trimmer', date: '2024-04-14 09:00', qty: 1, type: 'yangi' },
  { id: '101951651', akt: '120000799407', sku: 'KEMEI-KEMEITRIMMER-МЕНТОЛ', sellerItemCode: 'KM-J03', title: 'Soch olish mashinkasi Kemei professional trimmer', date: '2024-04-14 09:02', qty: 1, type: 'yangi' },
  { id: '101951652', akt: '120000799408', sku: 'KEMEI-KEMEITRIMMER-МЕНТОЛ', sellerItemCode: 'KM-J03', title: 'Soch olish mashinkasi Kemei professional trimmer', date: '2024-04-14 09:05', qty: 1, type: 'eski' },
  { id: '101912514', akt: '120000799407', sku: 'UAKEENA-UAKEENMIKSER001-АЛЫЙ', sellerItemCode: '', title: 'UAKEEN ZL-2303 800W Qo‘l Mikseri', date: '2024-04-14 09:10', qty: 1, type: 'yangi' },
  { id: '101912515', akt: '120000799408', sku: 'UAKEENA-UAKEENMIKSER001-АЛЫЙ', sellerItemCode: '', title: 'UAKEEN ZL-2303 800W Qo‘l Mikseri', date: '2024-04-14 09:12', qty: 1, type: 'yangi' },
  { id: '101912516', akt: '120000799409', sku: 'BEAUTY-CREAM-001', sellerItemCode: 'BC-101', title: 'Yuz uchun oqartiruvchi krem', date: '2024-04-13 18:00', qty: 2, type: 'yangi' }
];

export default function OrderDetailsPage({ params, searchParams }: { params: Promise<{ shopId: string, groupId: string }>, searchParams: Promise<{ type: string }> }) {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  
  const decodedGroupId = decodeURIComponent(resolvedParams.groupId);
  const tabType = resolvedSearchParams.type || 'yangi';

  const orders = useMemo(() => {
    return DUMMY_ORDERS.filter(o => {
      const gId = o.sellerItemCode || o.sku;
      return gId === decodedGroupId && o.type === tabType;
    });
  }, [decodedGroupId, tabType]);

  const sample = orders[0];

  return (
    <div className="details-container">
      <Link href={`/shops/${resolvedParams.shopId}`} className="back-link mb-4">← Orqaga ({tabType})</Link>
      
      {sample ? (
        <div className="header-info surface mb-6">
          <div className="flex justify-between items-center mb-2">
            <h1>{decodedGroupId}</h1>
            <span className="qty-badge">Jami: {orders.reduce((acc, o) => acc + o.qty, 0)} ta</span>
          </div>
          <p className="subtitle">{sample.title}</p>
          {sample.sellerItemCode && <p className="sku-text">SKU: {sample.sku}</p>}
        </div>
      ) : (
        <h1 className="mb-6">Bunday mahsulot topilmadi</h1>
      )}

      <div className="table-wrapper surface">
        <table className="order-table">
          <thead>
            <tr>
              <th>Sana / Vaqt</th>
              <th>Buyurtma ID</th>
              <th>AKT Raqami</th>
              <th>Soni</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o, i) => (
              <tr key={i}>
                <td>{o.date}</td>
                <td className="font-medium">#{o.id}</td>
                <td>{o.akt}</td>
                <td>{o.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style>{`
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .mb-2 { margin-bottom: 0.5rem; }
        
        .back-link {
          color: var(--text-muted);
          font-size: 0.9rem;
          display: inline-block;
        }
        .back-link:hover { color: var(--text-main); }
        
        .header-info {
          padding: 1.5rem;
        }
        .header-info h1 {
          font-size: 1.5rem;
          color: var(--text-main);
        }
        .qty-badge {
          background: var(--text-main);
          color: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.9rem;
        }
        .subtitle {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin-bottom: 0.25rem;
        }
        .sku-text {
          color: #94a3b8;
          font-size: 0.8rem;
        }

        .table-wrapper {
          overflow: hidden;
        }
        .order-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .order-table th {
          background: var(--bg-color);
          padding: 12px 16px;
          font-weight: 600;
          color: var(--text-muted);
          font-size: 0.85rem;
          text-transform: uppercase;
          border-bottom: 1px solid var(--border-color);
        }
        .order-table td {
          padding: 14px 16px;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-main);
          font-size: 0.9rem;
        }
        .order-table tr:last-child td {
          border-bottom: none;
        }
        .order-table tr:hover td {
          background: var(--bg-color);
        }
        .font-medium {
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
