const { Pool } = require('pg');
require('dotenv').config();

(async () => {
  try {
    const pool = new Pool({ connectionString: process.env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
    const res = await pool.query('SELECT 1 AS ok');
    console.log('DB connection successful:', res.rows[0]);
    await pool.end();
  } catch (err) {
    console.error('DB connection error:', err.message);
  }
})();
