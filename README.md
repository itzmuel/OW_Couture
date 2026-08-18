# OW Couture

This workspace is initialized as a Next.js App Router project with TypeScript and Tailwind CSS.

## Stack

- Next.js 16
- TypeScript
- Tailwind CSS v4
- ESLint

## Scripts

- `npm run dev` - Start local development server
- `npm run build` - Build production bundle
- `npm run start` - Run production server
- `npm run lint` - Run lint checks

## Getting Started

1. Install dependencies (already completed during setup): `npm install`
2. Start dev server: `npm run dev`
3. Open http://localhost:3000

## Stripe Consultation Checkout Setup

1. Add these environment variables in `.env.local`:
	- `NEXT_PUBLIC_SITE_URL` (for local, use `http://localhost:3000`)
	- `STRIPE_SECRET_KEY`
	- `STRIPE_WEBHOOK_SECRET`
2. In Stripe Dashboard, create a webhook endpoint pointing to:
	- `https://your-domain.com/api/stripe/webhook`
	- For local testing with Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Subscribe webhook to `checkout.session.completed`.
	- Recommended additional events: `checkout.session.expired`, `checkout.session.async_payment_failed`.
4. Consultation flow now creates a checkout session from:
	- `POST /api/consultation/checkout`
5. Payment return state is verified through:
	- `GET /api/consultation/payment-status`
6. On successful payment, webhook updates consultation status to `confirmed`.
7. Payment audit fields are stored on `consultation_submissions`:
	- `stripe_checkout_session_id`
	- `stripe_payment_status`
	- `consultation_fee_amount_cents`
	- `paid_at`
