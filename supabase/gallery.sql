create table if not exists public.gallery_photos (
  id text primary key,
  title text,
  image_url text not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gallery_photos_active_sort_idx
on public.gallery_photos (active, sort_order);

alter table public.gallery_photos enable row level security;
