--
-- PostgreSQL database dump
--

\restrict 8LHTYE8n2r00wD5eLVF4k5i0JmOxGQq5keeADMNOWHvUlKGVsVrafxoDUUNaVku

-- Dumped from database version 18.6 (Ubuntu 18.6-1.pgdg26.04+2)
-- Dumped by pg_dump version 18.6 (Ubuntu 18.6-1.pgdg26.04+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: search_posts(text, character varying, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.search_posts(query_text text, lang_code character varying, page_limit integer, page_offset integer) RETURNS TABLE(id integer, title text, url character varying, descr text, ord numeric, rank_score double precision)
    LANGUAGE plpgsql
    AS $$
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
      OR similarity(p.title, query_text) > 0.1
      OR similarity(p.descr, query_text) > 0.1
      OR similarity(p.tags, query_text) > 0.1
    )
  ORDER BY rank_score DESC
  LIMIT page_limit OFFSET page_offset;
END;
$$;


ALTER FUNCTION public.search_posts(query_text text, lang_code character varying, page_limit integer, page_offset integer) OWNER TO postgres;

--
-- Name: trg_post_before_insert(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trg_post_before_insert() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE post_seq SET next_id = next_id + 1 WHERE lang = NEW.lang;
    NEW.id := (SELECT next_id FROM post_seq WHERE lang = NEW.lang);
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.trg_post_before_insert() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.messages (
    id integer NOT NULL,
    title text DEFAULT ''::text,
    audio text DEFAULT ''::text,
    content text DEFAULT ''::text,
    url text DEFAULT ''::text,
    pub character varying(10) DEFAULT 'd'::character varying,
    lang character varying(5) DEFAULT 'fr'::character varying NOT NULL,
    type character varying(20) DEFAULT 'msg'::character varying NOT NULL,
    ord numeric DEFAULT 0,
    ver integer DEFAULT 1,
    date timestamp without time zone DEFAULT now()
);


ALTER TABLE public.messages OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.messages_id_seq OWNER TO postgres;

--
-- Name: messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;


--
-- Name: mnumbers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mnumbers (
    id integer NOT NULL,
    ord numeric DEFAULT 0,
    nb text DEFAULT ''::text,
    nbd text DEFAULT ''::text,
    nbm text DEFAULT ''::text,
    pub character varying(10) DEFAULT 'd'::character varying,
    lang character varying(5) DEFAULT 'fr'::character varying NOT NULL,
    date timestamp without time zone DEFAULT now()
);


ALTER TABLE public.mnumbers OWNER TO postgres;

--
-- Name: mnumbers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mnumbers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mnumbers_id_seq OWNER TO postgres;

--
-- Name: mnumbers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mnumbers_id_seq OWNED BY public.mnumbers.id;


--
-- Name: post; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post (
    id integer NOT NULL,
    title text DEFAULT ''::text,
    descr text DEFAULT ''::text,
    content text DEFAULT ''::text,
    url character varying(255) NOT NULL,
    tags text DEFAULT ''::text,
    pub character varying(10) DEFAULT 'd'::character varying,
    lang character varying(5) DEFAULT 'fr'::character varying NOT NULL,
    ord numeric DEFAULT 0,
    date timestamp without time zone DEFAULT now()
);


ALTER TABLE public.post OWNER TO postgres;

--
-- Name: post_seq; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.post_seq (
    lang character varying(5) NOT NULL,
    next_id integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.post_seq OWNER TO postgres;

--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.site_settings (
    id integer NOT NULL,
    title text DEFAULT ''::text,
    descr text DEFAULT ''::text,
    footer text DEFAULT ''::text,
    lang character varying(5) NOT NULL
);


ALTER TABLE public.site_settings OWNER TO postgres;

--
-- Name: site_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.site_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.site_settings_id_seq OWNER TO postgres;

--
-- Name: site_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.site_settings_id_seq OWNED BY public.site_settings.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    password_hash text NOT NULL,
    email character varying(255) NOT NULL,
    full_name text DEFAULT ''::text,
    role character varying(20) DEFAULT 'user'::character varying,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    last_login timestamp without time zone,
    is_active boolean DEFAULT true
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);


--
-- Name: mnumbers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mnumbers ALTER COLUMN id SET DEFAULT nextval('public.mnumbers_id_seq'::regclass);


--
-- Name: site_settings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_settings ALTER COLUMN id SET DEFAULT nextval('public.site_settings_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: mnumbers mnumbers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mnumbers
    ADD CONSTRAINT mnumbers_pkey PRIMARY KEY (id);


--
-- Name: post post_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT post_pkey PRIMARY KEY (id, lang);


--
-- Name: post_seq post_seq_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post_seq
    ADD CONSTRAINT post_seq_pkey PRIMARY KEY (lang);


--
-- Name: post post_url_lang_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.post
    ADD CONSTRAINT post_url_lang_key UNIQUE (url, lang);


--
-- Name: site_settings site_settings_lang_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_lang_key UNIQUE (lang);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_messages_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_lang ON public.messages USING btree (lang);


--
-- Name: idx_messages_lang_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_lang_type ON public.messages USING btree (lang, type);


--
-- Name: idx_messages_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_messages_type ON public.messages USING btree (type);


--
-- Name: idx_mnumbers_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_mnumbers_lang ON public.mnumbers USING btree (lang);


--
-- Name: idx_post_content_fts; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_content_fts ON public.post USING gin (to_tsvector('simple'::regconfig, content));


--
-- Name: idx_post_descr_fts; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_descr_fts ON public.post USING gin (to_tsvector('simple'::regconfig, descr));


--
-- Name: idx_post_descr_trgm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_descr_trgm ON public.post USING gin (descr public.gin_trgm_ops);


--
-- Name: idx_post_lang; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_lang ON public.post USING btree (lang);


--
-- Name: idx_post_lang_pub; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_lang_pub ON public.post USING btree (lang, pub);


--
-- Name: idx_post_ord; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_ord ON public.post USING btree (lang, pub, ord);


--
-- Name: idx_post_pub; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_pub ON public.post USING btree (pub);


--
-- Name: idx_post_tags_fts; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_tags_fts ON public.post USING gin (to_tsvector('simple'::regconfig, tags));


--
-- Name: idx_post_tags_trgm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_tags_trgm ON public.post USING gin (tags public.gin_trgm_ops);


--
-- Name: idx_post_title_fts; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_title_fts ON public.post USING gin (to_tsvector('simple'::regconfig, title));


--
-- Name: idx_post_title_trgm; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_title_trgm ON public.post USING gin (title public.gin_trgm_ops);


--
-- Name: idx_post_url; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_post_url ON public.post USING btree (url);


--
-- Name: post trg_post_before_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_post_before_insert BEFORE INSERT ON public.post FOR EACH ROW EXECUTE FUNCTION public.trg_post_before_insert();


--
-- PostgreSQL database dump complete
--

\unrestrict 8LHTYE8n2r00wD5eLVF4k5i0JmOxGQq5keeADMNOWHvUlKGVsVrafxoDUUNaVku

