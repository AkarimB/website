-- Search function for islam.ms PostgreSQL
-- Run: psql -U postgres -d islam_site -f migrations/003_search_function.sql

CREATE OR REPLACE FUNCTION search_posts(
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
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.title, p.url, p.descr, p.ord,
    (
      CASE WHEN to_tsvector('simple', p.title) @@ plainto_tsquery('simple', query_text)
           THEN 10.0 ELSE 0.0 END
      +
      CASE WHEN to_tsvector('simple', p.descr) @@ plainto_tsquery('simple', query_text)
           THEN 5.0 ELSE 0.0 END
      +
      CASE WHEN to_tsvector('simple', p.tags) @@ plainto_tsquery('simple', query_text)
           THEN 3.0 ELSE 0.0 END
      +
      CASE WHEN to_tsvector('simple', p.content) @@ plainto_tsquery('simple', query_text)
           THEN 1.0 ELSE 0.0 END
      +
      GREATEST(
        similarity(p.title, query_text) * 8,
        similarity(p.descr, query_text) * 4,
        similarity(p.tags, query_text) * 2,
        similarity(p.content, query_text) * 0.5
      )
    )::FLOAT AS rank_score
  FROM post p
  WHERE p.lang = lang_code AND p.pub = 'p'
    AND (
      to_tsvector('simple', p.title) @@ plainto_tsquery('simple', query_text)
      OR to_tsvector('simple', p.descr) @@ plainto_tsquery('simple', query_text)
      OR to_tsvector('simple', p.tags) @@ plainto_tsquery('simple', query_text)
      OR to_tsvector('simple', p.content) @@ plainto_tsquery('simple', query_text)
      OR similarity(p.title || ' ' || p.descr || ' ' || p.tags, query_text) > 0.1
    )
  ORDER BY rank_score DESC
  LIMIT page_limit OFFSET page_offset;
END;
$$ LANGUAGE plpgsql;
