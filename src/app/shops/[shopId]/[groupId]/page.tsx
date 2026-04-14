'use client';

import { useState, useEffect, use, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  picked_qty: number; // Yig'ilgan mahsulot soni
}

export default function OrderDetailsPage({ params, searchParams }: { params: Promise<{ shopId: string, groupId: string }>, searchParams: Promise<{ type: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  
  const aktNumber = decodeURIComponent(resolvedParams.groupId);
  const tabType = resolvedSearchParams.type || 'yangi';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [navTab, setNavTab] = useState<'barcha' | 'olinmagan' | 'olingan'>('barcha');

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

  // Arxivlash va O'chirish funksiyalari
  async function archiveBatch() {
    if (!confirm("Ushbu to'plamni 'Eski buyurtmalar' ga arxivlaysizmi?")) return;
    setLoading(true);
    await supabase.from('orders').update({ type: 'eski' }).eq('shop_name', resolvedParams.shopId).eq('akt', aktNumber);
    router.push(`/shops/${resolvedParams.shopId}?type=eski`);
  }

  async function deleteBatch() {
    if (!confirm("Diqqat! Ushbu to'plam bazadan butunlay O'CHIRIB YUBORILADI. Davom etasizmi?")) return;
    setLoading(true);
    await supabase.from('orders').delete().eq('shop_name', resolvedParams.shopId).eq('akt', aktNumber);
    router.push(`/shops/${resolvedParams.shopId}`);
  }

  // Qty Increment/Decrement
  async function incrementQty(g: any) {
    const target = g.orders.find((o: any) => (o.picked_qty || 0) < o.qty);
    if (!target) return; // Hammasi yig'ilgan!
    setOrders(prev => prev.map(o => o.id === target.id ? { ...o, picked_qty: (o.picked_qty || 0) + 1 } : o));
    await supabase.from('orders').update({ picked_qty: (target.picked_qty || 0) + 1 }).eq('id', target.id);
  }

  async function decrementQty(g: any) {
    const target = [...g.orders].reverse().find((o: any) => (o.picked_qty || 0) > 0);
    if (!target) return; // Hech narsa yig'ilmagan!
    setOrders(prev => prev.map(o => o.id === target.id ? { ...o, picked_qty: (o.picked_qty || 0) - 1 } : o));
    await supabase.from('orders').update({ picked_qty: (target.picked_qty || 0) - 1 }).eq('id', target.id);
  }

  const groupedProducts = useMemo(() => {
    const map = new Map<string, any>();
    orders.forEach(o => {
      const key = o.seller_item_code || o.sku;
      if (!map.has(key)) {
        map.set(key, { 
            akt: o.akt, seller_item_code: o.seller_item_code, sku: o.sku, title: o.title,
            qty: o.qty, total_picked: o.picked_qty || 0,
            order_ids: new Set([o.order_id]), orders: [o] 
        });
      } else {
        const existing = map.get(key);
        existing.qty += o.qty;
        existing.total_picked += (o.picked_qty || 0);
        existing.order_ids.add(o.order_id);
        existing.orders.push(o);
      }
    });
    
    let array = Array.from(map.values());
    if (navTab === 'olinmagan') array = array.filter(g => g.total_picked < g.qty);
    if (navTab === 'olingan') array = array.filter(g => g.total_picked >= g.qty);
    return array;
  }, [orders, navTab]);

  return (
    <div className="details-container">
      <div className="flex justify-between items-center mb-4">
        <Link href={`/shops/${resolvedParams.shopId}`} className="back-link">← Orqaga</Link>
        <div className="flex gap-2">
          {tabType === 'yangi' && <button onClick={archiveBatch} className="action-btn archive-btn">📦 Arxivlash</button>}
          <button onClick={deleteBatch} className="action-btn delete-btn">🚫 O'chirish</button>
        </div>
      </div>
      
      {loading ? (
         <p style={{ color: 'var(--text-muted)' }}>Yuklanmoqda...</p>
      ) : orders.length > 0 ? (
        <>
          <div className="header-info surface mb-6 flex-col">
            <div className="flex justify-between items-center mb-2">
              <h1>AKT № {aktNumber} to'plami</h1>
              <span className="qty-badge">Jami: {orders.reduce((acc, o) => acc + o.qty, 0)} ta mahsulot</span>
            </div>
            <p className="subtitle">{orders.length} xil mahsulot obyekti birlashdi</p>
          </div>

          <div className="tabs surface p-1 mb-6" style={{ display: 'flex', gap: '0.5rem' }}>
            <button className={`tab-btn ${navTab === 'barcha' ? 'active' : ''}`} onClick={() => setNavTab('barcha')}>Barcha buyurtmalar</button>
            <button className={`tab-btn ${navTab === 'olinmagan' ? 'active' : ''}`} onClick={() => setNavTab('olinmagan')}>Olinmagan buyurtmalar</button>
            <button className={`tab-btn ${navTab === 'olingan' ? 'active' : ''}`} onClick={() => setNavTab('olingan')}>Olingan buyurtmalar</button>
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
                  <th style={{ textAlign: 'right' }}>Topilgan / Jami</th>
                </tr>
              </thead>
              <tbody>
                {groupedProducts.map((g, i) => {
                  const idArr = Array.from(g.order_ids);
                  const idDisplay = idArr.length > 1 ? `${idArr.length} ta buyurtma` : `#${idArr[0]}`;
                  const isDone = g.total_picked >= g.qty;
                  
                  return (
                    <tr key={i} style={isDone ? { opacity: 0.6, backgroundColor: '#f0fdf4' } : {}}>
                      <td>{g.akt}</td>
                      <td className="font-medium" style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        {idDisplay}
                      </td>
                      <td style={{ fontWeight: 600 }}>{g.seller_item_code || "-"}</td>
                      <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{g.sku}</td>
                      <td style={{ maxWidth: '280px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.title}</td>
                      <td className="font-medium text-right" style={{ fontSize: '1.05rem', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                        <button onClick={() => decrementQty(g)} className="counter-btn" disabled={g.total_picked <= 0}>-</button>
                        <span style={{ minWidth: '40px', textAlign: 'center' }}>
                           <span style={{ color: isDone ? 'var(--primary)' : 'inherit' }}>{g.total_picked}</span> / {g.qty}
                        </span>
                        <button onClick={() => incrementQty(g)} className="counter-btn" disabled={g.total_picked >= g.qty}>+</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {groupedProducts.length === 0 && (
              <p className="p-4 text-center" style={{ color: 'var(--text-muted)' }}>Bu bo'limda mahsulot qolmadi.</p>
            )}
          </div>
        </>
      ) : (
        <h1 className="mb-6">Ushbu AKT ga tegishli buyurtmalar topilmadi</h1>
      )}

      <style>{`
        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .flex { display: flex; }
        .flex-col { display: flex; flex-direction: column; }
        .justify-between { justify-content: space-between; }
        .items-center { align-items: center; }
        .gap-2 { gap: 0.5rem; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .p-4 { padding: 1rem; }
        .details-container { max-width: 1200px; margin: 0 auto; padding: 2rem 0; }
        .back-link { display: inline-block; color: var(--text-muted); text-decoration: none; transition: 0.2s; }
        .back-link:hover { color: var(--text-main); transform: translateX(-4px); }
        h1 { font-size: 1.5rem; color: var(--text-main); }
        .subtitle { color: var(--text-muted); margin-top: 0.5rem; }
        .table-wrapper { overflow-x: auto; border-radius: var(--radius); }
        .order-table { width: 100%; border-collapse: collapse; }
        .order-table th { text-align: left; padding: 1rem; background: var(--bg); color: var(--text-muted); font-size: 0.85rem; font-weight: 600; padding-bottom: 1rem; border-bottom: 1px solid #f1f5f9; text-transform: uppercase; }
        .order-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; color: var(--text-main); vertical-align: middle; }
        .order-table tr:last-child td { border-bottom: none; }
        
        .action-btn {
          padding: 8px 16px; border-radius: 8px; border: none; font-weight: 500; cursor: pointer; transition: 0.2s;
        }
        .archive-btn { background: var(--surface); border: 1px solid #e2e8f0; color: var(--text-main); }
        .archive-btn:hover { background: #f8fafc; }
        .delete-btn { background: #fee2e2; color: #ef4444; }
        .delete-btn:hover { background: #fecaca; }
        
        .tab-btn {
          padding: 10px 20px;
          border: none;
          background: transparent;
          border-radius: calc(var(--radius) - 2px);
          font-weight: 500;
          color: var(--text-muted);
          cursor: pointer;
          transition: 0.2s ease;
          flex: 1;
        }
        .tab-btn:hover { color: var(--text-main); }
        .tab-btn.active { background: white; color: var(--text-main); box-shadow: 0 1px 3px rgba(0,0,0,0.05); }

        .counter-btn {
          width: 30px; height: 30px; border-radius: 6px; border: 1px solid #e2e8f0; background: var(--surface);
          display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.1rem;
        }
        .counter-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .counter-btn:hover:not(:disabled) { background: #f8fafc; }
      `}</style>
    </div>
  );
}
