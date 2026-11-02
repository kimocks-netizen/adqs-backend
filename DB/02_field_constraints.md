# DB Field Length Constraints

> These constraints will be enforced in `00_schema.sql` via `varchar(n)` or `check` constraints.
> Frontend validation should mirror these limits.

---

## admins

| Column          | Max Length | Notes                        |
|-----------------|-----------|------------------------------|
| email           | 254       | RFC 5321 email max           |
| password_hash   | 72        | bcrypt max input             |
| name            | 100       |                              |
| role            | 50        |                              |

---

## articles

| Column             | Max Length | Notes                                      |
|--------------------|-----------|---------------------------------------------|
| title              | 70        | Enforced — max 70 chars including spaces    |
| slug               | 80        | Auto-generated from title                   |
| introduction       | 300       | Excerpt shown on cards                      |
| body               | —         | HTML — no limit (text column)               |
| featured_image_url | 500       | URL                                         |
| category           | 100       |                                             |
| author             | 100       |                                             |
| status             | 10        | 'draft' or 'published'                      |
| seo_title          | 60        | Google truncates at ~60 chars               |
| seo_description    | 160       | Google truncates at ~160 chars              |

---

## categories

| Column | Max Length | Notes              |
|--------|-----------|---------------------|
| name   | 100       |                     |
| slug   | 110       | Generated from name |

---

## services

| Column   | Max Length | Notes                        |
|----------|-----------|------------------------------|
| title    | 100       |                              |
| slug     | 110       |                              |
| summary  | 200       | Short card description       |
| intro    | 1000      | Longer intro paragraph       |
| icon     | 50        | Lucide icon name             |

---

## contact_enquiries

| Column          | Max Length | Notes          |
|-----------------|-----------|----------------|
| name            | 100       |                |
| email           | 254       |                |
| phone           | 20        |                |
| organisation    | 150       |                |
| area_of_enquiry | 100       |                |
| message         | 2000      |                |
| status          | 10        | New/Read/Replied |

---

## document_folders

| Column | Max Length | Notes |
|--------|-----------|-------|
| name   | 100       |       |

---

## documents

| Column | Max Length | Notes                          |
|--------|-----------|--------------------------------|
| title  | 150       |                                |
| type   | 20        | Letter/Contract/Opinion etc.   |
| body   | —         | HTML — no limit (text column)  |
| status | 10        | Draft / Final                  |

---

## page_views

| Column   | Max Length | Notes |
|----------|-----------|-------|
| path     | 300       | URL path e.g. /insights/slug |
| referrer | 500       | Full referrer URL |

---

## article_clicks / service_views

| Column       | Max Length | Notes              |
|--------------|-----------|---------------------|
| service_slug | 110       | Matches services.slug |

---

## Analytics Tracking — How It Works

### Top Services
1. Public frontend fires `POST /api/analytics/service-view` with `{ service_slug }` when user visits `/services/:slug`
2. Backend inserts a row into `service_views`
3. Admin dashboard calls `GET /api/admin/analytics/top-services`
4. Backend runs: `SELECT service_slug, COUNT(*) as views FROM service_views WHERE created_at > now() - interval '30 days' GROUP BY service_slug ORDER BY views DESC LIMIT 6`

### Top Articles
1. Public frontend fires `POST /api/analytics/article-click` with `{ article_id }` when user opens an article
2. Backend inserts a row into `article_clicks`
3. Admin dashboard calls `GET /api/admin/analytics/top-articles`
4. Backend runs: `SELECT a.title, COUNT(ac.id) as clicks FROM article_clicks ac JOIN articles a ON a.id = ac.article_id WHERE ac.created_at > now() - interval '30 days' GROUP BY a.id, a.title ORDER BY clicks DESC LIMIT 5`

### Page Views
1. Frontend fires `POST /api/analytics/pageview` with `{ path, referrer }` on every route change
2. Backend inserts into `page_views`
3. Summary query: `SELECT COUNT(*) FROM page_views WHERE created_at > now() - interval '30 days'`
