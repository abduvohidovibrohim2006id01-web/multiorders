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
  type: string; // 'yangi' or 'eski'
  created_at: string;
}

export default function ShopOrdersPage({ params }: { params: Promise<{ shopId: string }> }) {
  const [activeTab, setActiveTab] = useState<'yangi' | 'eski'>('yangi');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  const resolvedParams = use(params);
  
  // Format shop name: "zunitech-yandex" -> "Zunitech Yandex"
  const shopName = resolvedParams.shopId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('shop_name', resolvedParams.shopId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Baza xatosi:', error);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    }
    fetchOrders();
  }, [resolvedParams.shopId]);

  const groupedOrders = useMemo(() => {
    const filtered = orders.filter(o => o.type === activeTab);
    const groups: Record<string, typeof orders> = {};
    const INTERVAL = 1 * 60 * 1000; // 1 minutlik oyna (toplamlar ajralishi uchun)
    
    filtered.forEach(o => {
      const ts = new Date(o.created_at).getTime();
      const intervalKey = Math.floor(ts / INTERVAL) * INTERVAL;
      const key = String(intervalKey);
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(o);
    });

    return Object.entries(groups)
      .sort(([keyA], [keyB]) => Number(keyB) - Number(keyA))
      .map(([groupId, ordersList]) => ({
        groupId, // Bu endi 171... millisekundlik vaqt belgisidir
        orders: ordersList
    }));
  }, [orders, activeTab]);

  return (
    <div className="store-container">
      <header className="flex justify-between items-center mb-8">
        <div>
           <Link href="/shops" className="back-link">← Orqaga</Link>
           <h1>{shopName}</h1>
        </div>
        <div className="tabs surface p-1">
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

      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Yuklanmoqda...</p>
      ) : (
        <div className="grid">
          {groupedOrders.length === 0 && (
            <p style={{ color: 'var(--text-muted)' }}>Hozircha buyurtmalar yo'q.</p>
          )}
          
          {groupedOrders.map(({ groupId, orders }) => {
            const sample = orders[0];
            const ts = new Date(sample.created_at);
            const totalQty = orders.reduce((sum, o) => sum + o.qty, 0);
            
            // Unikal AKT raqamlarini jamlash
            const akts = Array.from(new Set(orders.map(o => o.akt)));
            const aktDisplay = akts.length > 2 ? `${akts[0]}, ${akts[1]} va yana ${akts.length - 2} ta` : akts.join(', ');
            
            return (
              <Link 
                 href={`/shops/${resolvedParams.shopId}/${groupId}?type=${activeTab}`} 
                 key={groupId} 
                 className="order-card surface flex-col justify-between"
              >
                <div className="card-top flex-col gap-2">
                  <span className="primary-code" style={{ fontSize: '1.35rem' }}>
                    {ts.toLocaleDateString("ru-RU", { day: '2-digit', month: '2-digit', year: 'numeric' })} | {ts.toLocaleTimeString("ru-RU", {hour: '2-digit', minute:'2-digit'})}
                  </span>
                  <span className="secondary-code">AKTlar: {aktDisplay}</span>
                </div>
                
                <div className="card-bottom flex justify-between items-center mt-4">
                  <span className="product-title">{orders.length} xil mahsulot</span>
                  <span className="qty-badge">Jami {totalQty} ta buyurtma</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <style>{`
        .mb-8 { margin-bottom: 2rem; }
        .mt-4 { margin-top: 1rem; }
        .p-1 { padding: 4px; border-radius: 8px; display: flex; gap: 4px; }
        
        .back-link {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-bottom: 8px;
          display: inline-block;
        }
        .back-link:hover { color: var(--text-main); }
        
        .tab-btn {
          padding: 8px 16px;
          color: var(--text-muted);
          border-radius: 6px;
          font-weight: 500;
        }
        .tab-btn.active {
          background: white;
          color: var(--text-main);
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .order-card {
          padding: 1.5rem;
          transition: border-color 0.2s, box-shadow 0.2s;
          display: flex;
          min-height: 140px;
        }
        .order-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .primary-code {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-main);
          line-height: 1.2;
        }
        .secondary-code {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: 2px;
        }
        
        .akt-badge {
          background: var(--bg-color);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          color: var(--text-muted);
          height: fit-content;
          border: 1px solid var(--border-color);
        }

        .product-title {
          font-size: 0.9rem;
          color: var(--text-muted);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          padding-right: 1rem;
        }

        .qty-badge {
          background: var(--text-main);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 0.85rem;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}
