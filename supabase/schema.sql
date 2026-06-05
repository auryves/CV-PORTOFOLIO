-- ============================================================
-- CAHIER DE TEXTE NUMÉRIQUE — Schéma Supabase
-- ============================================================

-- Extension UUID
create extension if not exists "uuid-ossp";

-- ── Profils utilisateurs ──────────────────────────────────────
create table public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  email       text not null,
  nom         text not null,
  role        text not null check (role in ('professeur', 'delegue')),
  classe      text not null default 'BTS SIO 2024/2025',
  created_at  timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Lecture profil propre" on public.profiles
  for select using (auth.uid() = id);

create policy "Mise à jour profil propre" on public.profiles
  for update using (auth.uid() = id);

-- Trigger: créer profil automatiquement à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, nom, role, classe)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nom', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'delegue'),
    coalesce(new.raw_user_meta_data->>'classe', 'BTS SIO 2024/2025')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── Matières ─────────────────────────────────────────────────
create table public.matieres (
  id        uuid default uuid_generate_v4() primary key,
  nom       text not null,
  code      text not null,
  couleur   text not null default '#3B82F6',
  classe    text not null default 'BTS SIO 2024/2025',
  created_at timestamptz default now()
);

alter table public.matieres enable row level security;

create policy "Lecture publique matières" on public.matieres
  for select using (true);

create policy "Insert matières par prof" on public.matieres
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'professeur')
  );

-- Données initiales
insert into public.matieres (nom, code, couleur) values
  ('Mathématiques', 'MATH', '#3B82F6'),
  ('Informatique', 'INFO', '#8B5CF6'),
  ('Français', 'FR', '#10B981'),
  ('Philosophie', 'PHILO', '#F59E0B'),
  ('Anglais', 'ANG', '#EF4444'),
  ('Économie', 'ECO', '#06B6D4');


-- ── Entrées de cours ─────────────────────────────────────────
create table public.entrees_cours (
  id              uuid default uuid_generate_v4() primary key,
  matiere_id      uuid references public.matieres(id) on delete set null,
  date            date not null,
  contenu         text not null,
  professeur_nom  text,
  classe          text not null default 'BTS SIO 2024/2025',
  created_by      uuid references public.profiles(id) on delete set null,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

alter table public.entrees_cours enable row level security;

create policy "Lecture entrées classe" on public.entrees_cours
  for select using (true);

create policy "Insert entrées par prof" on public.entrees_cours
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'professeur')
  );

create policy "Update entrées par prof ou délégué" on public.entrees_cours
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('professeur', 'delegue'))
  );

create policy "Delete entrées par prof" on public.entrees_cours
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'professeur')
  );


-- ── Documents de cours ────────────────────────────────────────
create table public.documents_cours (
  id          uuid default uuid_generate_v4() primary key,
  entree_id   uuid references public.entrees_cours(id) on delete cascade,
  nom         text not null,
  type        text check (type in ('pdf', 'image')) default 'pdf',
  url         text,
  parties     jsonb default '[]'::jsonb,
  created_at  timestamptz default now()
);

alter table public.documents_cours enable row level security;

create policy "Lecture documents" on public.documents_cours
  for select using (true);

create policy "Insert documents par prof" on public.documents_cours
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'professeur')
  );

create policy "Update sections par prof ou délégué" on public.documents_cours
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('professeur', 'delegue'))
  );


-- ── Devoirs ──────────────────────────────────────────────────
create table public.devoirs (
  id               uuid default uuid_generate_v4() primary key,
  entree_id        uuid references public.entrees_cours(id) on delete cascade,
  matiere_id       uuid references public.matieres(id) on delete set null,
  description      text not null,
  echeance         date,
  statut           text check (statut in ('a_faire', 'fait')) default 'a_faire',
  confirme_par     uuid references public.profiles(id) on delete set null,
  confirme_par_nom text,
  confirme_le      timestamptz,
  classe           text not null default 'BTS SIO 2024/2025',
  created_at       timestamptz default now()
);

alter table public.devoirs enable row level security;

create policy "Lecture devoirs" on public.devoirs
  for select using (true);

create policy "Insert devoirs par prof" on public.devoirs
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'professeur')
  );

create policy "Update devoirs par prof ou délégué" on public.devoirs
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('professeur', 'delegue'))
  );

create policy "Delete devoirs par prof" on public.devoirs
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'professeur')
  );


-- ── Storage bucket pour les supports de cours ─────────────────
-- À créer dans le Dashboard Supabase → Storage → New Bucket
-- Nom: "cours-supports" — Public: true
-- Policies: allow authenticated to upload (prof only)


-- ── Fonctions utilitaires ─────────────────────────────────────
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger entrees_updated_at
  before update on public.entrees_cours
  for each row execute procedure update_updated_at();
