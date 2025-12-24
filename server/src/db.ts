// server/src/db.ts
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// We export a query function that all our routes can use
export const query = (text: string, params: any[]) => {
  return pool.query(text, params);
};