# Islam.ms v2

Multilingual Islamic content website — server-side rendered with Node.js/Express.

## Architecture

```
                    ┌─────────────────────────────────────┐
                    │           Nginx / Cloudflare         │
                    └──────┬──────────┬──────────┬────────┘
                           │          │          │
                    ┌──────▼───┐ ┌────▼────┐ ┌───▼──────┐
                    │  Site    │ │   API   │ │  Admin   │
                    │  :8000   │ │  :8010  │ │  :8020   │
                    └──────┬───┘ └────┬────┘ └───┬──────┘
                           │          │          │
                    ┌──────▼──────────▼──────────▼──────┐
                    │              MySQL X DevAPI        │
                    │            (port 33060)            │
                    └───────────────────────────────────┘
                           │
                    ┌──────▼──────────┐
                    │      Redis      │
                    │ (session store) │
                    └─────────────────┘
```

| Server | Port | Purpose |
|--------|------|---------|
| **Site** | 8000 | Public-facing site with SSR HTML, i18n, pagination |
| **API** | 8010 | JSON REST API with CORS for content data |
| **Admin** | 8020 | Admin dashboard with auth, CRUD, uploads |
| **Search** | 8002 | *Experimental* — Vector search microservice (not active) |

## Directory Structure

```
site/
├── server/                  # Entry-point Express apps
│   ├── site.js              # Public site (port 8000)
│   ├── api.js               # JSON API (port 8010)
│   ├── admin.js             # Admin dashboard (port 8020)
│   └── search.js            # Search microservice (port 8002, experimental)
│
├── shared/                  # Shared modules
│   ├── database.js          # MySQL X DevAPI connection pool
│   ├── constants.js         # Languages, content types, domain
│   └── alert.js             # Email error alerts via sendmail
│
├── modules/
│   ├── site/                # Public site module
│   │   ├── routes/site.js   # /, /:lang, /:lang/:slug, /:lang/p/:pageId
│   │   ├── controllers/     # siteController.js (list, get, pagination)
│   │   └── utils/           # html.js (SSR templates), helpers.js, menuConfig.js
│   │
│   ├── api/                 # JSON API module
│   │   ├── routes/api.js    # /list/post/:lang, /:type/:lang/:id, /elevation
│   │   └── controllers/     # apiController.js
│   │
│   └── admin/               # Admin module
│       ├── routes/
│       │   ├── auth.js      # /idara/login, /register, /logout, /captcha
│       │   ├── post.js      # /idara/admin/posts/list/:type/:lang
│       │   ├── upload.js    # /idara/admin/upload
│       │   ├── data.js      # /idara/admin/data, /purge
│       │   └── api.js       # /idara/admin/api
│       ├── controllers/     # auth, post, upload, data, apiEdit, apiList
│       └── utils/           # cloudflare.js, htmlTemplates.js, helpers.js
│
├── scripts/
│   ├── on-deploy.sh         # Post-deploy script (npm ci, chown)
│   └── sync.js              # MySQL → Qdrant vector sync (experimental)
│
├── locales/                 # i18n translations
│   ├── fr.json              # French
│   ├── en.json              # English
│   ├── ar.json              # Arabic
│   ├── es.json              # Spanish
│   └── pt.json              # Portuguese
│
└── public/                  # Static assets
    ├── app/                 # Prayer times/Qiblah app (Leaflet maps)
    ├── clavier/             # Arabic keyboard tool
    ├── editor/              # CKEditor 4 rich text editor
    ├── data/                # Static data (PDFs, tafsir DBs)
    ├── fonts/               # Quranic fonts (AmiriQuran, HAFS, Uthmanic)
    ├── images/              # Site images (gitignored)
    └── *.js, *.css          # Frontend JS/CSS
```

## Features

### Content Types

| Code | Type |
|------|------|
| `post` | Blog posts / articles |
| `msg` | Messages / hadiths |
| `date` | Dates / historical events |
| `nmbr` | Numbers / statistics |
| `invoc` | Invocations / prayers |
| `dars` | Lessons / courses |
| `dua` | Supplications |
| `hajj` | Hajj / pilgrimage content |
| `salat` | Prayer / worship content |

### Multilingual (5 languages)

| Code | Language | Direction |
|------|----------|-----------|
| `fr` | Français | LTR |
| `en` | English | LTR |
| `ar` | العربية | RTL |
| `es` | Español | LTR |
| `pt` | Português | LTR |

### Admin Dashboard

- **Authentication**: bcrypt password hashing, CSRF tokens, SVG CAPTCHA
- **Sessions**: Redis-backed with `connect-redis`
- **CRUD**: Create, edit, list posts with CKEditor 4
- **Uploads**: Multer-based file upload to `public/images/`
- **Cache Purge**: Cloudflare API integration for cache invalidation

### Public Site

- Server-side rendered HTML (no client-side framework)
- SEO metadata (Open Graph tags)
- Per-language navigation menus
- Pagination with query support

### API

- CORS enabled for cross-origin access
- Content listing and single item retrieval
- Versioning support
- Google Maps Elevation API integration

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js (ES Modules) |
| Web Framework | Express.js |
| Database | MySQL 8.x via `@mysql/xdevapi` (X Protocol) |
| Session Store | Redis via `connect-redis` + `express-session` |
| Authentication | bcrypt, CSRF (`csrf`), SVG CAPTCHA (`svg-captcha`) |
| File Uploads | Multer |
| i18n | `i18n` package |
| Rich Text Editor | CKEditor 4 |
| Maps | Leaflet.js |
| Error Alerts | sendmail (local Postfix) |

## Environment Variables

Required `.env` file in project root:

```env
# Sessions
SESSION_SECRET=<random-hex-string>

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=<redis-password>

# MySQL (X DevAPI protocol, port 33060)
MYSQL_HOST=127.0.0.1
MYSQL_PORT=33060
MYSQL_USER=islam_user
MYSQL_PASSWORD=<mysql-password>
MYSQL_DATABASE=islam_site

# Environment
NODE_ENV=production

# Cloudflare (cache purge)
CLOUDFLARE_API_TOKEN=<cloudflare-token>
ZONE_ID=<cloudflare-zone-id>

# Error alerts (optional)
ALERT_EMAIL_TO=site.islam.ms@gmail.com
ALERT_EMAIL_FROM=alerts@mail.islam.ms
ALERT_ENABLED=true
```

## Deployment

### Git Workflow

```bash
# Work in dev clone
cd /srv/site-dev
vim server/site.js

# Commit
git add . && git commit -m "fix: description"

# Deploy to production (triggers post-receive hook)
git push vmi main

# Push to GitHub
git push origin main

# Restart production (manual — do this after reviewing changes)
systemctl restart site
```

### Post-Receive Hook

When you `git push vmi main`, the bare repo (`/srv/site.git`) runs:

1. `git checkout -f main` → `/srv/site`
2. `on-deploy.sh`:
   - `npm ci` if `package.json`/`package-lock.json` changed
   - `chown -R nodeapp:nodeapp /srv/site`
   - Prints restart instructions (no auto-restart)

### Service Management

```bash
# Check status
systemctl status site

# Restart after deploy
systemctl restart site

# View logs
journalctl -u site -f
```

## Development

### Working Directory

| Path | Purpose |
|------|---------|
| `/srv/site` | Production (owned by `nodeapp`) |
| `/srv/site-dev` | Development clone (root-owned) |
| `/srv/site.git` | Bare repo (deployment target) |

### Git Remotes (in `/srv/site-dev`)

```
origin  git@github.com-site:AkarimB/website.git  (GitHub)
vmi     /srv/site.git                              (local bare repo)
```

### Getting Started

```bash
cd /srv/site-dev
npm ci           # Install dependencies
cp /srv/site/.env .env  # Copy production env (or create your own)
npm run site     # Start site server on :8000
npm run api      # Start API server on :8010
npm run admin    # Start admin server on :8020
```

### npm Scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `npm run site` | `node server/site.js` | Start public site |
| `npm run api` | `node server/api.js` | Start JSON API |
| `npm run admin` | `node server/admin.js` | Start admin dashboard |
| `npm run search` | `node server/search.js` | Start search microservice |
| `npm run sync` | `node scripts/sync.js` | Sync MySQL → Qdrant |

## API Endpoints

### Site (port 8000)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | Home page (French default) |
| GET | `/:lang` | Home page in language |
| GET | `/:lang/:slug` | Single post by slug |
| GET | `/:lang/p/:pageId` | Paginated post list |
| GET | `/p/:pageId` | Paginated list (French) |

### API (port 8010)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/list/post/:lang` | List posts |
| GET | `/list/post/:lang/:pageId` | List posts with pagination |
| GET | `/:type/:lang/:id` | Get single item |
| GET | `/:type/:lang` | Get version info |
| GET | `/elevation?lat=&lng=` | Google Maps elevation |

### Admin (port 8020)

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/idara/login` | Login page |
| POST | `/idara/login` | Submit login |
| GET | `/idara/register` | Register page |
| POST | `/idara/register` | Submit registration |
| GET | `/idara/logout` | Logout |
| GET | `/idara/captcha` | SVG CAPTCHA image |
| GET | `/idara/admin/logged` | Check auth status |
| GET | `/idara/admin/posts/list/:type/:lang` | List posts |
| GET | `/idara/admin/posts/edit/:type/:lang/:id` | Edit post |
| GET | `/idara/admin/posts/add/:type/:lang` | New post |
| POST | `/idara/admin/upload` | Upload file |
| POST | `/idara/admin/data` | Submit data |
| POST | `/idara/admin/data/purge` | Purge Cloudflare cache |

## Experimental

The following features exist in the codebase but are **not active in production**:

### Vector Search (`server/search.js`)
- BGE-M3 embeddings + BGE-reranker-base
- Qdrant vector database
- Dual-vector search (title + text)
- Reranking for relevance

### Vector Sync (`scripts/sync.js`)
- Extracts posts from MySQL
- Chunks text (500 words, 50 overlap)
- Generates embeddings and upserts to Qdrant

To test: `npm run search` (requires QDRANT_URL in `.env`)
