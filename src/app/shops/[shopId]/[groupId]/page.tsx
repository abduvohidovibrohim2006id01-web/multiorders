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
  image_url?: string;
}

export default function OrderDetailsPage({ params, searchParams }: { params: Promise<{ shopId: string, groupId: string }>, searchParams: Promise<{ type: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);
  
  // Bu yerda groupId endi 171... millisekundlik vaqt intervali
  const intervalKey = Number(decodeURIComponent(resolvedParams.groupId));
  const INTERVAL = 5 * 60 * 1000;
  const startDate = new Date(intervalKey).toISOString();
  const endDate = new Date(intervalKey + INTERVAL).toISOString();
  
  const tabType = resolvedSearchParams.type || 'yangi';

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [navTab, setNavTab] = useState<'barcha' | 'olinmagan' | 'olingan'>('barcha');
  const [selectedBrand, setSelectedBrand] = useState<string>('Barchasi');
  const [selectedAkt, setSelectedAkt] = useState<string>('Barchasi');

  useEffect(() => {
    async function fetchDetails() {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('shop_name', resolvedParams.shopId)
        .eq('type', tabType)
        .gte('created_at', startDate)
        .lt('created_at', endDate)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data);
      }
      setLoading(false);
    }
    fetchDetails();
  }, [resolvedParams.shopId, tabType, startDate, endDate]);

  // Arxivlash va O'chirish funksiyalari
  async function archiveBatch() {
    if (!confirm("Ushbu to'plamni 'Eski buyurtmalar' ga arxivlaysizmi?")) return;
    setLoading(true);
    await supabase.from('orders').update({ type: 'eski' })
        .eq('shop_name', resolvedParams.shopId)
        .gte('created_at', startDate)
        .lt('created_at', endDate);
    router.push(`/shops/${resolvedParams.shopId}?type=eski`);
  }

  async function deleteBatch() {
    if (!confirm("Diqqat! Ushbu to'plam bazadan butunlay O'CHIRIB YUBORILADI. Davom etasizmi?")) return;
    setLoading(true);
    await supabase.from('orders').delete()
        .eq('shop_name', resolvedParams.shopId)
        .gte('created_at', startDate)
        .lt('created_at', endDate);
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

  const extractBrand = (sku: string) => {
    if (!sku) return "Boshqa";
    const parts = sku.split('-');
    return parts.length > 1 ? parts[0] : "Boshqa";
  };

  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    orders.forEach(o => brands.add(extractBrand(o.sku)));
    return Array.from(brands).sort();
  }, [orders]);

  const availableAKTs = useMemo(() => {
    const akts = new Set<string>();
    orders.forEach(o => akts.add(o.akt));
    return Array.from(akts).sort();
  }, [orders]);

  const groupedProducts = useMemo(() => {
    const map = new Map<string, any>();
    orders.forEach(o => {
      // AKT va SKU bo'yicha to'liq ajratib guruhlash (har xil AKT dagi bir xil tovar qo'shilib ketmasligi uchun)
      const key = `${o.akt}_${o.seller_item_code || o.sku}`;
      if (!map.has(key)) {
        map.set(key, { 
            akt: o.akt, seller_item_code: o.seller_item_code, sku: o.sku, title: o.title,
            image_url: o.image_url,
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
    
    // Brend filtri
    if (selectedBrand !== 'Barchasi') {
      array = array.filter(g => extractBrand(g.sku) === selectedBrand);
    }
    
    // AKT filtri
    if (selectedAkt !== 'Barchasi') {
      array = array.filter(g => g.akt === selectedAkt);
    }
    
    // Alifbo tartibida saralash (Sotuvchi kodi => bo'lmasa SKU)
    array.sort((a, b) => {
      const codeA = (a.seller_item_code && a.seller_item_code !== '-') ? a.seller_item_code : a.sku;
      const codeB = (b.seller_item_code && b.seller_item_code !== '-') ? b.seller_item_code : b.sku;
      return String(codeA).localeCompare(String(codeB));
    });
    
    return array;
  }, [orders, navTab, selectedBrand, selectedAkt]);

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
              <h1>Yuklangan To'plam</h1>
              <span className="qty-badge">Jami: {orders.reduce((acc, o) => acc + o.qty, 0)} ta mahsulot</span>
            </div>
            <p className="subtitle">AKTlar: {availableAKTs.join(', ')}</p>
            <p className="subtitle" style={{fontSize: '0.85rem', marginTop: '4px'}}>{orders.length} xil mahsulot obyekti birlashdi</p>
          </div>

          <div className="filters-wrapper" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', justifyContent: 'space-between' }}>
            <div className="tabs surface p-1" style={{ display: 'flex', gap: '0.5rem', flex: '1 1 auto', minWidth: '280px' }}>
              <button className={`tab-btn ${navTab === 'barcha' ? 'active' : ''}`} onClick={() => setNavTab('barcha')}>Barcha</button>
              <button className={`tab-btn ${navTab === 'olinmagan' ? 'active' : ''}`} onClick={() => setNavTab('olinmagan')}>Olinmagan</button>
              <button className={`tab-btn ${navTab === 'olingan' ? 'active' : ''}`} onClick={() => setNavTab('olingan')}>Olinganlar</button>
            </div>
            
            <div className="brand-select surface" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', padding: '0 1rem', borderRadius: 'calc(var(--radius) - 2px)', flex: '0 1 auto', minHeight: '44px', gap: '0.5rem' }}>
              <select 
                value={selectedBrand} 
                onChange={e => setSelectedBrand(e.target.value)}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}
              >
                <option value="Barchasi">Barcha Guruhlar</option>
                {availableBrands.map(b => <option key={b} value={b}>{b}</option>)}
              </select>

              <div style={{ width: '1px', height: '20px', background: 'var(--border-color)', margin: '0 4px' }}></div>

              <select 
                value={selectedAkt} 
                onChange={e => setSelectedAkt(e.target.value)}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer', maxWidth: '140px' }}
              >
                <option value="Barchasi">Hamma AKTlar</option>
                {availableAKTs.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>

          <div className="table-wrapper surface">
            <table className="order-table">
              <thead>
                <tr>
                  <th>Buyurtma ID</th>
                  <th>Sotuvchi Kodi / SKU</th>
                  <th style={{ width: '40%' }}>Mahsulot nomi</th>
                  <th style={{ textAlign: 'right' }}>Holat</th>
                </tr>
              </thead>
              <tbody>
                {groupedProducts.map((g, i) => {
                  const idArr = Array.from(g.order_ids);
                  const idDisplay = idArr.length > 1 ? `${idArr.length} ta buyurtma` : `#${idArr[0]}`;
                  const isDone = g.total_picked >= g.qty;
                  
                  return (
                    <tr key={i} className={isDone ? 'done-row' : ''}>
                      <td data-label="ID" className="font-medium" style={{ color: "var(--text-muted)", fontSize: "0.85rem", verticalAlign: 'top' }}>
                        {idDisplay}
                      </td>
                      <td data-label="KOD" style={{ verticalAlign: 'top' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                          {(g.image_url && g.image_url !== '-') && (
                            <img src={g.image_url.includes('/original') ? g.image_url : `${g.image_url.replace(/\/$/, '')}/original`} alt={g.sku} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                          )}
                          <div>
                            <div style={{ fontWeight: 600 }}>
                               {(g.seller_item_code && g.seller_item_code !== '-') ? g.seller_item_code : g.sku}
                            </div>
                            {((g.seller_item_code && g.seller_item_code !== '-') && g.seller_item_code !== g.sku) && (
                               <div style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginTop: '4px', wordBreak: 'break-all' }}>{g.sku}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td data-label="NOMI" style={{ whiteSpace: 'normal', verticalAlign: 'top', lineHeight: '1.4' }}>
                        {g.title}
                      </td>
                      <td data-label="SONI" className="font-medium text-right picker-cell">
                        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                          <button onClick={() => decrementQty(g)} className="counter-btn" disabled={g.total_picked <= 0}>-</button>
                          <span style={{ minWidth: '45px', textAlign: 'center', fontSize: '1.1rem' }}>
                             <strong style={{ color: isDone ? 'var(--success-text)' : 'inherit' }}>{g.total_picked}</strong> <span style={{color: 'var(--text-muted)', fontSize: '0.9rem'}}>/ {g.qty}</span>
                          </span>
                          <button onClick={() => incrementQty(g)} className="counter-btn" disabled={g.total_picked >= g.qty}>+</button>
                        </div>
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
        
        .table-wrapper { border-radius: var(--radius); }
        .order-table { width: 100%; border-collapse: collapse; }
        .order-table th { text-align: left; padding: 1rem; background: var(--bg); color: var(--text-muted); font-size: 0.85rem; font-weight: 600; border-bottom: 1px solid #f1f5f9; text-transform: uppercase; }
        .order-table td { padding: 1rem; border-bottom: 1px solid #eaebed; color: var(--text-main); }
        .order-table tr:last-child td { border-bottom: none; }
        .done-row { opacity: 0.6; background-color: #f8fafc; transition: 0.3s; }
        
        .action-btn {
          padding: 8px 16px; border-radius: 8px; border: none; font-weight: 500; cursor: pointer; transition: 0.2s;
        }
        .archive-btn { background: var(--surface); border: 1px solid #e2e8f0; color: var(--text-main); }
        .archive-btn:hover { background: #f8fafc; }
        .delete-btn { background: #fee2e2; color: #ef4444; }
        .delete-btn:hover { background: #fecaca; }
        
        .tab-btn {
          padding: 10px 20px; border: none; background: transparent; border-radius: calc(var(--radius) - 2px);
          font-weight: 500; color: var(--text-muted); cursor: pointer; transition: 0.2s ease; flex: 1;
        }
        .tab-btn:hover { color: var(--text-main); }
        .tab-btn.active { background: white; color: var(--text-main); box-shadow: 0 1px 3px rgba(0,0,0,0.05); }

        .counter-btn {
          width: 34px; height: 34px; border-radius: 6px; border: 1px solid #e2e8f0; background: var(--surface);
          display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.2rem; transition: 0.2s;
        }
        .counter-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .counter-btn:active:not(:disabled) { transform: scale(0.95); }
        .counter-btn:hover:not(:disabled) { background: #f8fafc; border-color: #cbd5e1; }
      `}</style>
    </div>
  );
}
