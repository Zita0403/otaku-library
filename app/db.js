import 'dotenv/config';
import pg from 'pg';

// PostgreSQL connection setup
const db = new pg.Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

db.connect()
    .then(() => console.log("Connected to PostgreSQL"))
    .catch(err => console.error("PostgreSQL connection error:", err));

export default db;