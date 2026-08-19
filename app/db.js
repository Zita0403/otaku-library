import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// PostgreSQL connection setup
const db = new pg.Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: String(process.env.PG_PASSWORD || ''),
    port: Number(process.env.PG_PORT || 5432),
});

db.query('SELECT 1')
    .then(() => console.log("Connected to PostgreSQL"))
    .catch(err => console.error("PostgreSQL connection error:", err));

export default db;