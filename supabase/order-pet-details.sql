alter table public.orders
add column if not exists pet_details jsonb;
