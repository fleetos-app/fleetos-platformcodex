# Seeding FleetOS Locally

This seed is designed for beginners using the Supabase SQL Editor.

It assumes you already created this Supabase Auth user:

```text
admin@fleetos.local
```

The seed file is:

```text
supabase/seed.sql
```

## What It Creates

- demo organization: `Jindal Transport`
- default FleetOS roles
- default FleetOS permissions
- owner membership for `admin@fleetos.local`
- platform super admin access for `admin@fleetos.local`
- sample customer
- sample pickup and delivery locations
- sample fleet vehicles
- sample jobs
- sample runs
- sample run stops
- sample allocations
- sample status history

## Step 1: Apply Migrations

Run all Supabase migrations first. If you use the Supabase CLI locally:

```bash
supabase db reset
```

If you are using a hosted Supabase project, apply the migration files in `supabase/migrations` before running the seed.

## Step 2: Create The Auth User

In Supabase:

1. Open your Supabase project.
2. Go to `Authentication`.
3. Go to `Users`.
4. Click `Add user`.
5. Enter:
   - Email: `admin@fleetos.local`
   - Password: choose any local password you want
6. Make sure the user is confirmed, or use a local Auth setting that allows login.

## Step 3: Run The Seed In SQL Editor

1. Open Supabase.
2. Go to `SQL Editor`.
3. Click `New query`.
4. Open [supabase/seed.sql](supabase/seed.sql) in this repo.
5. Copy the entire file.
6. Paste it into the SQL Editor.
7. Click `Run`.

If you see this error:

```text
Missing Supabase Auth user: admin@fleetos.local
```

Create the Auth user first, then run the seed again.

## Step 4: Sign In

Start FleetOS:

```bash
corepack pnpm dev
```

Open:

```text
http://localhost:3000/login
```

Sign in with:

```text
admin@fleetos.local
```

Use the password you set when you created the Supabase Auth user.

After sign-in, the user should be able to access:

- `/app/dashboard`
- `/app/control-tower`
- `/app/jobs`
- `/app/runs`
- `/app/fleet`
- `/app/users`
- `/app/settings`
- `/admin/organizations`
- `/admin/users`
- `/admin/billing`
- `/admin/support`
- `/admin/system-health`
