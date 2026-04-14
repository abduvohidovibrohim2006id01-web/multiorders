'use client';

import { useState, useEffect, use, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Order {
  id: string; // Database uuid
  akt: string;
  order_id: string;
  shop_name: string;
  sku: string;
  seller_item_code: string;
  title: string;
  qty: number;
  type: string;
  created_at: string;
}

export default function OrderDetailsPage({ params, searchParams }: { params: Promise<{ shopId: string, groupId: string }>, searchParams: Promise<{ type: string }> }) {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  
  const decodedGroupId = decodeURIComponent(resolvedParams.groupId);
  const tabType = resolvedSearchParams.type || 'yangi';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetails() {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('shop_name', resolvedParams.shopId)
        .eq('type', tabType);

      if (!error && data) {
        // filter exactly matching sku or seller_item_code
        const filtered = data.filter(o => (o.seller_item_code || o.sku) === decodedGroupId);
        setOrders(filtered);
      }
      setLoading(false);
    }
    fetchDetails();
  }, [resolvedParams.shopId, tabType, decodedGroupId]);

  const sample = orders[0];

  return (
    <div className="details-container">
      <Link href={`/shops/${resolvedParams.shopId}`} className="back-link mb-4">← Orqaga ({tabType})</Link>
      
      {loading ? (
         <p style={{ color: 'var(--text-muted)' }}>Yuklanmoqda...</p>
      ) : sample ? (
        <>
          <div className="header-info surface mb-6">
            <div className="flex justify-between items-center mb-2">
              <h1>{decodedGroupId}</h1>
              <span className="qty-badge">Jami: {orders.reduce((acc, o) => acc + o.qty, 0)} ta</span>
            </div>
            <p className="subtitle">{sample.title}</p>
            {sample.seller_item_code && <p className="sku-text">SKU: {sample.sku}</p>}
          </div>

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
                    <td>{new Date(o.created_at).toLocaleString('uz-UZ')}</td>
                    <td className="font-medium">#{o.order_id}</td>
                    <td>{o.akt}</td>
                    <td>{o.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <h1 className="mb-6">Bunday mahsulot topilmadi</h1>
      )}

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
