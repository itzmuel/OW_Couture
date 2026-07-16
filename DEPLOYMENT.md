# Deployment Checklist

## Pre-Deployment

- [ ] Pull latest `main`
- [ ] Install dependencies (`npm install`)
- [ ] Verify environment variables are configured
- [ ] Run local validation:

```bash
npm run lint
npm run build
```

## Release Steps

1. Confirm release-ready commit is on `main`.
2. Create and push an annotated git tag.
3. Deploy from `main` on hosting provider.

## Post-Deployment Verification

- [ ] Home page loads
- [ ] Catalog route works (`/catalog`)
- [ ] Product details route works (`/catalog/[slug]`)
- [ ] Consultation form submits (`/consultation`)
- [ ] Gallery route and lightbox work (`/gallery`)
- [ ] Admin route opens (`/admin`)

## Rollback Plan

1. Identify last known good tag.
2. Re-deploy that tag/commit.
3. Verify critical routes and form flows.
