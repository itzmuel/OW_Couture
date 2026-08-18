# Deployment Checklist

## Pre-Deployment

- [ ] Pull latest `main`
- [ ] Install dependencies (`npm install`)
- [ ] Verify environment variables are configured in Vercel (Production):
	- `NEXT_PUBLIC_SUPABASE_URL`
	- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
	- `SUPABASE_SERVICE_ROLE_KEY`
	- `ADMIN_EMAILS`
	- `NEXT_PUBLIC_SITE_URL` (set to your production domain, no trailing slash)
	- `STRIPE_SECRET_KEY`
	- `STRIPE_WEBHOOK_SECRET`
- [ ] Run local validation:

```bash
npm run lint
npm run build
```

## Release Steps

1. Confirm release-ready commit is on `main`.
2. Create and push an annotated git tag.
3. Deploy from `main` on hosting provider.
4. In Stripe Dashboard, verify webhook endpoint is set to:
	- `https://<your-vercel-domain>/api/stripe/webhook`
5. Confirm webhook events include:
	- `checkout.session.completed`
	- `checkout.session.expired`
	- `checkout.session.async_payment_failed`

## Post-Deployment Verification

- [ ] Home page loads
- [ ] Catalog route works (`/catalog`)
- [ ] Product details route works (`/catalog/[slug]`)
- [ ] Consultation form submits (`/consultation`)
- [ ] Stripe checkout opens from consultation form
- [ ] Successful Stripe payment returns to `/consultation` and marks consultation paid/confirmed
- [ ] Gallery route and lightbox work (`/gallery`)
- [ ] Admin route opens (`/admin`)
- [ ] Admin consultations view shows payment status badges and payment details

## Rollback Plan

1. Identify last known good tag.
2. Re-deploy that tag/commit.
3. Verify critical routes and form flows.
