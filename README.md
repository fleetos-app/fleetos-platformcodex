# FleetOS Platform

Clean enterprise SaaS foundation for FleetOS.

## Stack

- Next.js
- TypeScript
- Supabase
- pnpm workspaces

## Workspace

- `apps/web` - FleetOS web application shell
- `packages/database` - Supabase client and database boundary
- `packages/auth` - authentication boundary
- `packages/rbac` - role and permission boundary
- `packages/tenant-router` - tenant resolution boundary
- `packages/ui` - shared UI primitives
- `packages/config` - shared TypeScript and environment configuration
- `supabase/migrations` - database migrations
- `supabase/functions` - Supabase Edge Functions
- `docs` - architecture and rebuild planning

## Getting Started

```bash
pnpm install
pnpm build
```

Copy `.env.example` to `.env.local` for local app configuration.

## Foundation Rule

This repository starts from a clean foundation. Do not import Lovable-generated code or product features into this layer.
