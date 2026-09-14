-- Indexes for islam.ms PostgreSQL
-- Run: psql -U postgres -d islam_site -f migrations/002_create_indexes.sql

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_post_lang ON post(lang);
CREATE INDEX IF NOT EXISTS idx_post_pub ON post(pub);
CREATE INDEX IF NOT EXISTS idx_post_lang_pub ON post(lang, pub);
CREATE INDEX IF NOT EXISTS idx_post_ord ON post(lang, pub, ord);
CREATE INDEX IF NOT EXISTS idx_messages_lang ON messages(lang);
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(type);
CREATE INDEX IF NOT EXISTS idx_messages_lang_type ON messages(lang, type);
CREATE INDEX IF NOT EXISTS idx_mnumbers_lang ON mnumbers(lang);

-- GIN indexes for full-text search
CREATE INDEX IF NOT EXISTS idx_post_title_fts ON post USING GIN (to_tsvector('simple', title));
CREATE INDEX IF NOT EXISTS idx_post_descr_fts ON post USING GIN (to_tsvector('simple', descr));
CREATE INDEX IF NOT EXISTS idx_post_tags_fts ON post USING GIN (to_tsvector('simple', tags));
CREATE INDEX IF NOT EXISTS idx_post_content_fts ON post USING GIN (to_tsvector('simple', content));

-- GIN indexes for trigram similarity (fuzzy search)
CREATE INDEX IF NOT EXISTS idx_post_title_trgm ON post USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_post_descr_trgm ON post USING GIN (descr gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_post_tags_trgm ON post USING GIN (tags gin_trgm_ops);
