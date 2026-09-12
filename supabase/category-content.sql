create table if not exists public.catalog_category_content (
  category_id text primary key,
  eyebrow text not null default '',
  title text not null default '',
  summary text not null default '',
  body text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists catalog_category_content_set_updated_at on public.catalog_category_content;
create trigger catalog_category_content_set_updated_at
before update on public.catalog_category_content
for each row execute function public.set_updated_at();

alter table public.catalog_category_content enable row level security;

drop policy if exists "Public can read category content" on public.catalog_category_content;
create policy "Public can read category content"
on public.catalog_category_content for select
using (true);

create index if not exists catalog_category_content_sort_idx
on public.catalog_category_content(sort_order);

insert into public.catalog_category_content
  (category_id, eyebrow, title, summary, body, sort_order)
values
  (
    'bow-ties',
    'Handmade bow ties',
    'Bow ties for everyday charm, photos, and celebrations',
    'Soft, lightweight bow ties made for collars, portraits, parties, and daily walks.',
    'Each bow tie is handmade in small batches with playful prints and comfortable sizing. Choose Small or Big based on your pet, then add a polished pop of personality for birthdays, holidays, adoption days, family photos, or an ordinary walk that deserves a little flair.',
    1
  ),
  (
    'bandanas',
    'Tie-on style',
    'Bandanas and scarves for pets and their humans',
    'Easy tie-on accessories with soft seasonal patterns and a relaxed, giftable feel.',
    'Our bandanas are designed for flexible everyday styling: tie one on your pet, wear one yourself, or create a matching look. They are simple to adjust, easy to pack for outings, and made for customers who want pet accessories that feel cheerful without being fussy.',
    2
  ),
  (
    'bow-bow-treats',
    'Small batch treats',
    'Oven-baked Dog Treats',
    'Crunchy 5 oz. dog treats in simple flavors, available as one-time orders or subscriptions.',
    'Dog treats are made for easy gifting, restocking, and happy routines. Pick a flavor for a single order, or subscribe monthly or quarterly so your dog has a fresh treat delivery on schedule.',
    3
  ),
  (
    'tabitha-beads',
    'Tabitha Beads',
    'Handcrafted wooden bead necklaces with meaning',
    'Adjustable wooden bead accessories in playful themes for pets and people.',
    'Tabitha Beads honor the collection story with colorful wooden bead designs, themed charms, and a handmade finish. They can be worn as pet necklaces or human accessories, with Small and Big options for the right fit.',
    4
  ),
  (
    'tote-bags',
    'Reusable totes',
    'Pet-themed totes for errands, events, and gifts',
    'Reusable canvas-style totes with pet-inspired designs and everyday utility.',
    'These totes are practical for markets, books, pet supplies, and event days. They keep the Bow-Bow-Ties mission visible while giving customers a useful accessory they can carry often.',
    5
  )
on conflict (category_id) do update set
  eyebrow = excluded.eyebrow,
  title = excluded.title,
  summary = excluded.summary,
  body = excluded.body,
  sort_order = excluded.sort_order;
