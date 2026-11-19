-- DOERZ — Wall Printing Digital Experience — schéma cible (phase 5)
-- PostgreSQL / Supabase. RLS activé partout : lecture publique limitée aux œuvres publiées.

create extension if not exists "pgcrypto";

create type rights_status as enum ('pending', 'validated', 'refused');
create type print_quality as enum ('unknown', 'sufficient', 'check', 'insufficient', 'vector_regenerable');
create type segment as enum ('particulier', 'professionnel', 'collectivite');
create type lead_status as enum ('nouveau', 'qualifie', 'visite', 'devis_envoye', 'gagne', 'perdu');

-- Œuvres ---------------------------------------------------------------
create table artworks (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text,
  author text,
  source text not null,              -- internal | unsplash | pexels | pixabay | openverse | museum:<nom> | client_upload
  source_url text,
  license text not null,
  commercial_use boolean,            -- null = inconnu
  modification_allowed boolean,
  attribution text,
  width_px int not null,
  height_px int not null,
  orientation text generated always as (case when width_px::numeric/height_px >= 1.9 then 'panoramique' when width_px::numeric/height_px > 1.1 then 'paysage' when width_px::numeric/height_px < 0.9 then 'portrait' else 'carre' end) stored,
  dominant_colors text[] default '{}',
  moods text[] default '{}',
  ai_generated boolean default false,
  original_path text not null,       -- stockage privé (fichier HD)
  preview_path text not null,        -- stockage public (aperçu optimisé)
  rights_status rights_status not null default 'pending',
  rights_validated_by uuid references auth.users,
  rights_validated_at timestamptz,
  rights_evidence_path text,         -- capture licence / contrat
  print_quality_status print_quality not null default 'unknown',
  published boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  -- garde-fou : impossible de publier une œuvre aux droits non validés
  constraint published_requires_rights_or_concept check (not published or rights_status = 'validated' or ai_generated)
);

create table categories (id text primary key, label text not null, sort int default 0);
create table artwork_categories (artwork_id uuid references artworks on delete cascade, category_id text references categories on delete cascade, primary key (artwork_id, category_id));
create table collections (id uuid primary key default gen_random_uuid(), slug text unique, title text, description text, published boolean default false);
create table collection_items (collection_id uuid references collections on delete cascade, artwork_id uuid references artworks on delete cascade, sort int default 0, primary key (collection_id, artwork_id));

-- Réalisations (authentiques uniquement) ---------------------------------
create table realisations (
  id uuid primary key default gen_random_uuid(),
  title text not null, sector text, city text, surface_m2 numeric,
  before_path text, after_path text, video_path text, artwork_id uuid references artworks,
  client_authorization_path text not null,   -- preuve écrite d'autorisation de publication
  testimonial text, testimonial_authorized boolean default false,
  published boolean default false, created_at timestamptz default now()
);

-- Règles tarifaires (moteur administrable) -------------------------------
create table pricing_rules (
  id uuid primary key default gen_random_uuid(),
  mode text not null check (mode in ('demo', 'manual', 'live')),
  config jsonb not null,              -- même forme que pricingConfig (src/config/site.ts)
  active boolean default false,
  created_by uuid references auth.users, created_at timestamptz default now()
);
create unique index one_active_pricing on pricing_rules (active) where active;

create table quality_thresholds (
  id uuid primary key default gen_random_uuid(),
  max_distance_m numeric, optimal_dpi int not null, check_dpi int not null, printer_model text
);

-- Projets Studio & leads -------------------------------------------------
create table projects (
  id uuid primary key default gen_random_uuid(),
  public_ref text unique not null,     -- id client (proj_…)
  artwork_id uuid references artworks,
  custom_art_path text,                -- stockage PRIVÉ
  room_photo_path text,                -- stockage PRIVÉ
  preview_path text,                   -- stockage PRIVÉ
  config jsonb not null,               -- wall, obstacles, placement, dimensions
  created_at timestamptz default now(),
  delete_after timestamptz default now() + interval '12 months'   -- politique de conservation
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  public_ref text unique not null,
  schema_version text not null,
  segment segment not null,
  establishment_type text, organisation text,
  first_name text not null, last_name text not null, email text not null, phone text,
  postal_code text not null, city text,
  project jsonb not null,
  project_id uuid references projects on delete set null,
  artwork_snapshot jsonb,              -- licence/droits au moment de la demande
  estimate jsonb,
  acquisition jsonb,
  consent_processing boolean not null check (consent_processing),
  consent_marketing boolean not null default false,
  consent_text text not null, consent_at timestamptz not null,
  score int, status lead_status default 'nouveau', owner uuid references auth.users,
  crm_ids jsonb default '{}',          -- { hubspot: …, brevo: … }
  created_at timestamptz default now()
);
create index leads_status_idx on leads (status, created_at desc);

create table events (                  -- analytics first-party (uniquement si consentement)
  id bigserial primary key, name text not null, props jsonb, session_id text, created_at timestamptz default now()
);

-- Admins ----------------------------------------------------------------
create table admins (user_id uuid primary key references auth.users, role text not null check (role in ('owner', 'sales', 'editor')));
create or replace function is_admin(r text[] default array['owner','sales','editor']) returns boolean language sql stable security definer as
$$ select exists (select 1 from admins where user_id = auth.uid() and role = any(r)) $$;

-- RLS -------------------------------------------------------------------
alter table artworks enable row level security;
alter table categories enable row level security;
alter table artwork_categories enable row level security;
alter table collections enable row level security;
alter table collection_items enable row level security;
alter table realisations enable row level security;
alter table pricing_rules enable row level security;
alter table quality_thresholds enable row level security;
alter table projects enable row level security;
alter table leads enable row level security;
alter table events enable row level security;
alter table admins enable row level security;

create policy pub_artworks on artworks for select using (published);
create policy pub_categories on categories for select using (true);
create policy pub_artcat on artwork_categories for select using (true);
create policy pub_collections on collections for select using (published);
create policy pub_collitems on collection_items for select using (true);
create policy pub_real on realisations for select using (published);
create policy pub_pricing on pricing_rules for select using (active);
create policy pub_quality on quality_thresholds for select using (true);

create policy admin_all_artworks on artworks for all using (is_admin(array['owner','editor']));
create policy admin_all_real on realisations for all using (is_admin(array['owner','editor']));
create policy admin_pricing on pricing_rules for all using (is_admin(array['owner']));
create policy admin_leads on leads for all using (is_admin(array['owner','sales']));
create policy admin_projects on projects for all using (is_admin(array['owner','sales']));
create policy admin_events on events for select using (is_admin());
-- Les insertions publiques (leads, projets, événements) passent par une Edge Function
-- (service role) qui valide le payload, limite le débit et génère les URL signées d'upload.

-- Stockage : buckets
--   artworks-preview  (public)
--   artworks-original (privé, admins)
--   client-uploads    (privé ; upload via URL signée 10 min ; lecture via URL signée 1 h)
