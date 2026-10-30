# DB — Database Scripts & Migrations

All Supabase SQL scripts live here.

## Structure

```
DB/
├── 00_schema.sql          ← Full schema — run once on a fresh Supabase project
├── migrations/            ← Incremental changes after initial setup
│   └── 001_*.sql
└── README.md
```

## How to use

1. Open your Supabase project → SQL Editor
2. For a fresh setup: run `00_schema.sql` in full
3. For updates: run migration files in order (`001_`, `002_`, etc.)

## Naming convention for migrations

```
migrations/001_add_hidden_to_articles.sql
migrations/002_add_analytics_tables.sql
```

Always increment the number prefix.
