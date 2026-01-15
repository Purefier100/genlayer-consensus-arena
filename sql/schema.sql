CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE dice_rolls (
  id SERIAL PRIMARY KEY,
  room_id INT,
  wallet TEXT,
  roll INT,
  tx_hash TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE users (
    wallet TEXT PRIMARY KEY,
    xp INT DEFAULT 0
);

CREATE TABLE dice_rolls (
    id SERIAL PRIMARY KEY,
    wallet TEXT,
    roll INT,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE room_players (
    room_id INT,
    wallet TEXT,
    joined_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (room_id, wallet)
);
CREATE TABLE challenges (
    id SERIAL PRIMARY KEY,
    wallet TEXT,
    roll INT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE users (
  wallet TEXT PRIMARY KEY,
  xp INT DEFAULT 0
);
CREATE TABLE users (
  wallet TEXT PRIMARY KEY,
  xp INT DEFAULT 0
);
CREATE TABLE IF NOT EXISTS tx_logs (
  id SERIAL PRIMARY KEY,
  wallet TEXT NOT NULL,
  tx_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
-- users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS last_played TIMESTAMP;

-- tx_logs table
CREATE TABLE IF NOT EXISTS tx_logs (
  id SERIAL PRIMARY KEY,
  wallet TEXT NOT NULL,
  tx_hash TEXT UNIQUE NOT NULL,
  block_number INTEGER,
  contract TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);


