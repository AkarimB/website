-- Islam.ms Schema for PostgreSQL
-- Run: psql -U postgres -d islam_site -f migrations/001_create_tables.sql
-- Export the entire schema structure without data to a file named islam_site_structure.sql
--sudo -u postgres pg_dump -d islam_site --schema-only > islam_site_structure.sql

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Post table
CREATE TABLE IF NOT EXISTS post (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  descr TEXT DEFAULT '',
  content TEXT DEFAULT '',
  url TEXT DEFAULT '',
  tags TEXT DEFAULT '',
  pub VARCHAR(10) DEFAULT 'd',
  lang VARCHAR(5) NOT NULL DEFAULT 'fr',
  ord NUMERIC DEFAULT 0,
  date TIMESTAMP DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  title TEXT DEFAULT '',
  audio TEXT DEFAULT '',
  content TEXT DEFAULT '',
  url TEXT DEFAULT '',
  pub VARCHAR(10) DEFAULT 'd',
  lang VARCHAR(5) NOT NULL DEFAULT 'fr',
  type VARCHAR(20) NOT NULL DEFAULT 'msg',
  ord NUMERIC DEFAULT 0,
  ver INT DEFAULT 1,
  date TIMESTAMP DEFAULT NOW()
);

-- Mnumbers table
CREATE TABLE IF NOT EXISTS mnumbers (
  id SERIAL PRIMARY KEY,
  ord NUMERIC DEFAULT 0,
  nb TEXT DEFAULT '',
  nbd TEXT DEFAULT '',
  nbm TEXT DEFAULT '',
  pub VARCHAR(10) DEFAULT 'd',
  lang VARCHAR(5) NOT NULL DEFAULT 'fr',
  date TIMESTAMP DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name TEXT DEFAULT '',
  role VARCHAR(20) DEFAULT 'user'
);

-- Site settings table
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  title TEXT DEFAULT '',
  descr TEXT DEFAULT '',
  footer TEXT DEFAULT '',
  lang VARCHAR(5) UNIQUE NOT NULL
);
