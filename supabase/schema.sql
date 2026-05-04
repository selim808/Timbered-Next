create table if not exists public.orders (
  id bigint primary key,
  status text not null default 'processing',
  number text,
  customer_name text,
  phone text,
  state text,
  address text,
  total numeric(12, 2) default 0,
  customer_note text,
  date_created timestamptz,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id text primary key,
  order_id bigint not null references public.orders(id) on delete cascade,
  wc_line_item_id bigint not null,
  product_id bigint,
  name text not null,
  quantity integer not null default 1,
  image_url text,
  phase text not null default 'Created',
  entered_at timestamptz not null default now(),
  history jsonb not null default '[]'::jsonb,
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(order_id, wc_line_item_id)
);

create index if not exists orders_status_date_idx on public.orders(status, date_created desc);
create index if not exists order_items_phase_idx on public.order_items(phase);
create index if not exists order_items_order_id_idx on public.order_items(order_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Read orders with anon key"
  on public.orders for select
  using (true);

create policy "Read order items with anon key"
  on public.order_items for select
  using (true);

-- Writes are performed by Next.js API routes with the service role key.
