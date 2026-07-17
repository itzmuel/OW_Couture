# Supabase Integration Setup (CLI)

This project now includes Supabase client scaffolding in:

- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/admin.ts`
- `src/lib/supabase/env.ts`

## 1. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill values from your Supabase project:

```bash
cp .env.example .env.local
```

Required keys:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `ADMIN_EMAILS` (comma-separated emails allowed to open `/admin` data)

## 2. Login and Link Project via CLI

From repository root:

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
```

`project-ref` is the short project ID in your Supabase URL.

## 3. Apply Migrations

Migration file:

- `supabase/migrations/202607170001_initial_auth_and_consultations.sql`

Apply to linked project:

```bash
npx supabase db push
```

## 4. Optional Local Stack

If Docker is available:

```bash
npx supabase start
```

Stop local stack:

```bash
npx supabase stop
```

## 5. Next Integration Steps

- Replace local account auth with Supabase Auth in `auth-context`.
- Move consultation submission storage from localStorage to `consultation_submissions` table.
- Update admin page to query Supabase with server-side/service-role client.

## Security Notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser/client code.
- Keep service-role access in server-only modules/routes.
- Use RLS policies for user-facing reads/writes.
