-- 1. Felhasználók táblája
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    allow_nsfw BOOLEAN DEFAULT FALSE
);

-- 2. Anime listák táblája (Kedvencek, Megnézendő, Megnézett)
CREATE TABLE IF NOT EXISTS user_anime_lists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    anime_id INTEGER NOT NULL,
    anime_title VARCHAR(255) NOT NULL,
    anime_image VARCHAR(255),
    list_type VARCHAR(20) CHECK (list_type IN ('favorite', 'watched', 'wishlist')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, anime_id, list_type)
);

-- 3. Munkamenetek táblája (connect-pg-simple számára)
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE
) WITH (OIDS=FALSE);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");