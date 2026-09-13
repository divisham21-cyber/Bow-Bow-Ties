alter table public.catalog_products
add column if not exists image_urls jsonb not null default '[]'::jsonb;

update public.catalog_products
set image_urls = jsonb_build_array(hero_image_url)
where hero_image_url <> ''
  and (image_urls is null or jsonb_array_length(image_urls) = 0);

notify pgrst, 'reload schema';
