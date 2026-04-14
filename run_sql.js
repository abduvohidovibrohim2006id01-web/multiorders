const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:aVDP,q9d-Zefs6C@db.etxnvqjegndfnnbytqxd.supabase.co:5432/postgres'
});

async function run() {
  try {
    await client.connect();
    console.log('Postgres bazasiga ulandi! Jadval yaratilmoqda...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS shops (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      INSERT INTO shops (id, name) VALUES 
      ('zunitech-yandex', 'Zunitech Yandex'),
      ('savdo-yandex', 'Savdo Yandex'),
      ('zunitech-uzum', 'Zunitech Uzum'),
      ('savdo-uzum', 'Savdo Uzum')
      ON CONFLICT DO NOTHING;
      
      ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Public Read Access" ON shops;
      CREATE POLICY "Public Read Access" ON shops FOR SELECT USING (true);
      
      CREATE TABLE IF NOT EXISTS orders (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        akt TEXT NOT NULL,
        order_id TEXT NOT NULL,
        shop_name TEXT NOT NULL,
        sku TEXT NOT NULL,
        seller_item_code TEXT,
        title TEXT,
        qty INTEGER DEFAULT 1,
        type TEXT DEFAULT 'yangi',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Public Read Access orders" ON orders;
      CREATE POLICY "Public Read Access orders" ON orders FOR SELECT USING (true);
      
      NOTIFY pgrst, 'reload schema';
    `);
    
    console.log('✅ BAAAAZAAAAA YANGILANDI!!! Hamma jadval tayyor!');
  } catch (err) {
    console.error('XATO:', err);
  } finally {
    await client.end();
  }
}

run();
