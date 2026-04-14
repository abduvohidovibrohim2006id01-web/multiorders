const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:aVDP,q9d-Zefs6C@db.etxnvqjegndfnnbytqxd.supabase.co:5432/postgres'
});

async function run() {
  await client.connect();
  await client.query(`
    ALTER TABLE orders ADD COLUMN IF NOT EXISTS picked_qty INTEGER DEFAULT 0;
    NOTIFY pgrst, 'reload schema';
  `);
  console.log('Ustun qoshildi');
  await client.end();
}
run();
