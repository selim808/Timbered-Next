# Timbered Next Dashboard

Next.js replacement scaffold for the Timbered dashboard.

## Stack

- Next.js App Router
- Tailwind CSS
- TanStack Query and TanStack Table
- Supabase Postgres
- WooCommerce webhooks
- Vercel deployment

## Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Copy `.env.example` to `.env.local` and fill the values.
4. Install dependencies with `npm install`.
5. Start locally with `npm run dev`.

## WooCommerce Webhook

Create a WooCommerce webhook for order events and point it to:

```text
https://YOUR_VERCEL_DOMAIN/api/webhooks/woocommerce
```

Recommended topics:

- `Order created`
- `Order updated`
- `Order deleted` can be added later with a soft-delete handler.

Use the same secret in WooCommerce and `WC_WEBHOOK_SECRET`.

## Deploy

Import this folder into Vercel and add the same environment variables. Vercel will build with `npm run build`.
