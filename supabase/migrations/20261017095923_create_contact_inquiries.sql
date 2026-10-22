/*
# Create contact_inquiries table (single-tenant, no auth)

1. New Tables
- `contact_inquiries`
  - `id` (uuid, primary key)
  - `name` (text, not null) — visitor's full name
  - `email` (text, not null) — visitor's business email, used as Reply-To
  - `company` (text, nullable) — company name
  - `phone` (text, nullable) — phone number
  - `website` (text, nullable) — business website
  - `message` (text, not null) — what the AI agent should handle
  - `status` (text, default 'new') — inquiry status
  - `ip_hash` (text, nullable) — hashed IP for rate limiting
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `contact_inquiries`.
- Do not grant anonymous direct INSERT: all public submissions pass through the rate-limited, validated Edge Function.
- A service-role-only Edge Function handles writes; clients cannot read, update, or delete submissions.
*/

CREATE TABLE IF NOT EXISTS contact_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text,
  phone text,
  website text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  ip_hash text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_inquiries" ON contact_inquiries;
-- No public INSERT policy: the service-role-backed Edge Function is the only writer.

CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created_at ON contact_inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_ip_hash ON contact_inquiries (ip_hash);
