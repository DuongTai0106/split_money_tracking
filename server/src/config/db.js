import pg from 'pg'
import dotenv from "dotenv";

const { Pool } = pg;

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === "true" || { rejectUnauthorized: false }, // Required for most cloud DBs (Render, Neon, etc.)
});

pool.connect((err, client, release) => {
  if (err) {
    return console.error("Lỗi kết nối CSDL:", err.stack);
  }
  console.log("Kết nối PostgreSQL thành công!");
  release();
});

export default pool;