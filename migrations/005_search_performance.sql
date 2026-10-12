-- website/migrations/005_search_performance.sql
-- Migration: Make post full-text search index-driven
-- Run: psql -U postgres -d islam_site -f migrations/005_search_performance.sql
--
-- Problem: search_posts() filtered on to_tsvector(...) @@ ... OR similarity(...) > 0.1
-- across title/descr/tags/content. The similarity() terms have no usable index, so the
-- planner fell back to scanning every row of the language via idx_post_lang and
-- re-tokenising content per row. A single 'ar' search took ~2.5s and, under
-- concurrent load, held pool slots long enough to trip the 5s checkout timeout.
--
-- Fix: store the tsvectors as generated columns so GIN indexes can serve both the
-- filter and the ranking, and stop scoring similarity() on content (its weight was
-- 0.5, the smallest term, and it was the dominant cost).

BEGIN;

-- 1. Materialised tsvector columns
ALTER TABLE post
  ADD COLUMN IF NOT EXISTS title_tsv   tsvector GENERATED ALWAYS AS (to_tsvector('simple', title))   STORED,
  ADD COLUMN IF NOT EXISTS descr_tsv   tsvector GENERATED ALWAYS AS (to_tsvector('simple', descr))   STORED,
  ADD COLUMN IF NOT EXISTS tags_tsv    tsvector GENERATED ALWAYS AS (to_tsvector('simple', tags))    STORED,
  ADD COLUMN IF NOT EXISTS content_tsv tsvector GENERATED ALWAYS AS (to_tsvector('simple', content)) STORED;

-- 2. GIN indexes on the generated columns (these replace the expression indexes below)
CREATE INDEX IF NOT EXISTS idx_post_title_tsv   ON post USING GIN (title_tsv);
CREATE INDEX IF NOT EXISTS idx_post_descr_tsv   ON post USING GIN (descr_tsv);
CREATE INDEX IF NOT EXISTS idx_post_tags_tsv    ON post USING GIN (tags_tsv);
CREATE INDEX IF NOT EXISTS idx_post_content_tsv ON post USING GIN (content_tsv);

-- 3. Search function: plain SQL so the planner inlines it and picks the indexes.
--    similarity() is kept for ranking (title/descr/tags only) but dropped from the
--    WHERE clause, which is what forced the sequential scan.
--    The return type changes (url was varchar in the deployed version), so the old
--    function must be dropped rather than replaced.
DROP FUNCTION IF EXISTS search_posts(TEXT, VARCHAR, INT, INT);

CREATE FUNCTION search_posts(
  query_text TEXT,
  lang_code VARCHAR(5),
  page_limit INT,
  page_offset INT
)
RETURNS TABLE (
  id INT,
  title TEXT,
  url TEXT,
  descr TEXT,
  ord NUMERIC,
  rank_score FLOAT
)
LANGUAGE sql STABLE AS $$
  SELECT p.id, p.title, p.url, p.descr, p.ord,
    (
      CASE WHEN p.title_tsv   @@ plainto_tsquery('simple', query_text) THEN 10.0 ELSE 0.0 END
      +
      CASE WHEN p.descr_tsv   @@ plainto_tsquery('simple', query_text) THEN 5.0 ELSE 0.0 END
      +
      CASE WHEN p.tags_tsv    @@ plainto_tsquery('simple', query_text) THEN 3.0 ELSE 0.0 END
      +
      CASE WHEN p.content_tsv @@ plainto_tsquery('simple', query_text) THEN 1.0 ELSE 0.0 END
      +
      GREATEST(
        similarity(p.title, query_text) * 8,
        similarity(p.descr, query_text) * 4,
        similarity(p.tags,  query_text) * 2
      )
    )::FLOAT AS rank_score
  FROM post p
  WHERE p.lang = lang_code AND p.pub = 'p'
    AND (
      p.title_tsv   @@ plainto_tsquery('simple', query_text)
      OR p.descr_tsv   @@ plainto_tsquery('simple', query_text)
      OR p.tags_tsv    @@ plainto_tsquery('simple', query_text)
      OR p.content_tsv @@ plainto_tsquery('simple', query_text)
    )
  ORDER BY rank_score DESC
  LIMIT page_limit OFFSET page_offset;
$$;

-- 4. Drop the superseded expression indexes (idx_post_content_fts alone was 32 MB)
DROP INDEX IF EXISTS idx_post_title_fts;
DROP INDEX IF EXISTS idx_post_descr_fts;
DROP INDEX IF EXISTS idx_post_tags_fts;
DROP INDEX IF EXISTS idx_post_content_fts;

COMMIT;

-- ANALYZE so the planner has fresh statistics for the new columns
ANALYZE post;