'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Shop {
  id: string;
  name: string;
}

export default function ShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getShops() {
      setLoading(true);
      const { data, error } = await supabase
        .from('shops')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error("Do'konlarni tortishda xatolik:", error);
      } else if (data) {
        setShops(data);
      }
      setLoading(false);
    }
    getShops();
  }, []);

  return (
    <div className="shops-container">
      <h1 className="page-title">Do'konlar Ro'yxati</h1>
      
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Yuklanmoqda...</p>
      ) : (
        <div className="grid">
          {shops.length === 0 && <p>Hozircha do'konlar yo'q</p>}
          {shops.map(shop => (
            <Link href={`/shops/${shop.id}`} key={shop.id} className="shop-card surface">
              <div className="shop-icon">🛒</div>
              <h2>{shop.name}</h2>
              <p>Buyurtmalarni boshqarish</p>
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .page-title {
          font-size: 1.75rem;
          margin-bottom: 2rem;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .shop-card {
          padding: 2rem;
          text-align: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .shop-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
        }
        .shop-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }
        .shop-card h2 {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
          color: var(--text-main);
        }
        .shop-card p {
          color: var(--text-muted);
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
