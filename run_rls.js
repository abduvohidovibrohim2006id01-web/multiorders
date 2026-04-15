const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:aVDP,q9d-Zefs6C@db.etxnvqjegndfnnbytqxd.supabase.co:5432/postgres'
});

async function run() {
  await client.connect();
  await client.query(`
    CREATE POLICY "Public Update Access orders" ON orders FOR UPDATE USING (true);
    CREATE POLICY "Public Delete Access orders" ON orders FOR DELETE USING (true);
    NOTIFY pgrst, 'reload schema';
  `);
  console.log('Update va Delete ga ruxsat berildi');
  await client.end();
}
run();
