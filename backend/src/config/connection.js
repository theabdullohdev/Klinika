import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for some Supabase/Managed DB connections
  }
});

// Helper to execute queries with RLS support
export const query = async (text, params, userRole = null) => {
  const client = await pool.connect();
  try {
    if (userRole) {
      // Set the app.user_role for Row Level Security
      await client.query(`SET app.user_role = '${userRole}'`);
    }
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
};

export default pool;
