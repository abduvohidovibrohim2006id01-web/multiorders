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
  
  // Bu yerda groupId endi AKT Raqami (masalan 120000799407)
  const aktNumber = decodeURIComponent(resolvedParams.groupId);
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
        .eq('type', tabType)
        .eq('akt', aktNumber)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data);
      }
      setLoading(false);
    }
    fetchDetails();
  }, [resolvedParams.shopId, tabType, aktNumber]);

  const groupedProducts = useMemo(() => {
    const map = new Map<string, any>();
    orders.forEach(o => {
      // Sotuvchi kodi mavjud bo'lsa uni olamiz, aks holda SKU
      const key = o.seller_item_code || o.sku;
      if (!map.has(key)) {
        map.set(key, { ...o, order_ids: new Set([o.order_id]) });
      } else {
        const existing = map.get(key);
        existing.qty += o.qty;
        existing.order_ids.add(o.order_id);
      }
    });
    return Array.from(map.values());
  }, [orders]);

  return (
    <div className="details-container">
      <Link href={`/shops/${resolvedParams.shopId}`} className="back-link mb-4">← Orqaga</Link>
      
      {loading ? (
         <p style={{ color: 'var(--text-muted)' }}>Yuklanmoqda...</p>
      ) : orders.length > 0 ? (
        <>
          <div className="header-info surface mb-6">
            <div className="flex justify-between items-center mb-2">
              <h1>AKT № {aktNumber} to'plami</h1>
              <span className="qty-badge">Jami: {orders.reduce((acc, o) => acc + o.qty, 0)} ta mahsulot</span>
            </div>
            <p className="subtitle">{groupedProducts.length} xil o'ziga xos mahsulot turi</p>
          </div>

          <div className="table-wrapper surface">
            <table className="order-table">
              <thead>
                <tr>
                  <th>AKT Raqami</th>
                  <th>Buyurtma ID</th>
                  <th>Sotuvchi Kodi</th>
                  <th>Tizim SKU</th>
                  <th>Mahsulot nomi</th>
                  <th>Soni</th>
                </tr>
              </thead>
              <tbody>
                {groupedProducts.map((g, i) => {
                  const idArr = Array.from(g.order_ids);
                  const idDisplay = idArr.length > 1 ? `${idArr.length} ta buyurtma` : `#${idArr[0]}`;
                  
                  return (
                    <tr key={i}>
                      <td>{g.akt}</td>
                      <td className="font-medium" style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        {idDisplay}
                      </td>
                      <td style={{ fontWeight: 600 }}>{g.seller_item_code || "-"}</td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{g.sku}</td>
                      <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.title}</td>
                      <td className="font-medium text-right" style={{ fontSize: '1.15rem' }}>{g.qty}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <h1 className="mb-6">Ushbu AKT ga tegishli buyurtmalar topilmadi</h1>
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
