# FleetOS Working Prototype Test Checklist

Use this checklist after migrations and `supabase/seed.sql` have run successfully.

Demo login:

- Email: `admin@fleetos.local`
- Password after local `supabase db reset`: `Password123!`

## 1. Login

1. Open `/login`.
2. Enter `admin@fleetos.local`.
3. Enter `Password123!`.
4. Submit the form.
5. Expected: you land on `/app/dashboard` with no raw Supabase or runtime error.

Also verify:

- `/login/staff`
- `/login/driver`
- `/login/subcontractor`
- `/login/client`

Each page should render the same stable login flow.

## 2. Dashboard

1. Open `/app/dashboard`.
2. Confirm the organization dashboard loads.
3. Confirm job, run, vehicle, and role cards render.
4. Expected: no blank page, no redirect loop, no browser console error.

## 3. Create Vehicle

1. Open `/app/fleet`.
2. Click `Add vehicle`.
3. Enter a unique registration, name, type, and status.
4. Submit.
5. Expected: the page refreshes with a success message and the vehicle appears in the table.

## 4. Duplicate Vehicle Error

1. Open `/app/fleet`.
2. Click `Add vehicle`.
3. Reuse an existing registration number.
4. Submit.
5. Expected: a friendly duplicate-registration error appears. No raw Postgres duplicate-key error should be shown.

## 5. Create Driver

Current prototype driver onboarding is through organization user management.

1. Open `/app/users`.
2. Enter a new email.
3. Enter a temporary password for local testing.
4. Select role `driver`.
5. Submit.
6. Expected: the user membership is saved and the new user appears in the user table.

Note: a full driver profile editor is not part of the current prototype. The seeded database includes a sample driver profile for assignment testing.

## 6. Create Subcontractor

Current prototype subcontractor onboarding is through organization user management.

1. Open `/app/users`.
2. Enter a new email.
3. Enter a temporary password for local testing.
4. Select role `subcontractor`.
5. Submit.
6. Expected: the user membership is saved and the new user appears in the user table.

Note: a full subcontractor company profile editor is not part of the current prototype. The seeded database includes a sample subcontractor record.

## 7. Customer Availability

Current prototype customer creation UI is not built yet. Do not add a customer module during stabilisation.

1. Open `/app/jobs`.
2. Click `Create job`.
3. Open the customer dropdown.
4. Confirm seeded customer `Harbour Fresh Foods` is available.
5. Expected: customer data loads without missing-table, RLS, or ambiguous-join errors.

## 8. Create Job

1. Open `/app/jobs`.
2. Click `Create job`.
3. Select the seeded customer.
4. Enter a title.
5. Optionally select pickup, delivery, run, driver, vehicle, and subcontractor values from the dropdowns.
6. Submit.
7. Expected: you are redirected to the new job detail page with a success message.

## 9. Create Run

1. Open `/app/runs`.
2. Click `Create run`.
3. Enter a unique run number and title.
4. Optionally select driver, vehicle, and subcontractor values from the dropdowns.
5. Submit.
6. Expected: you are redirected to the new run detail page with a success message.

## 10. Admin Organization Page

1. Open `/admin/organizations`.
2. Confirm the page loads for `admin@fleetos.local`.
3. Create a test organization with a unique slug.
4. Try creating another organization with the same slug.
5. Expected: the first save succeeds, and the duplicate shows a friendly error.

## 11. Admin Users

1. Open `/admin/users`.
2. Create or invite a user into Jindal Transport with a temporary password.
3. Reuse the same email.
4. Expected: the existing Auth user is reused and membership is upserted. No duplicate-user crash should appear.

## 12. Admin Billing

1. Open `/admin/billing`.
2. Change plan limits for Jindal Transport.
3. Submit.
4. Expected: values save with a success message. This remains a plan-limit/status foundation, not a payment integration.

## 13. Admin Support

1. Open `/admin/support`.
2. Select an organization and target user.
3. Enter a reason.
4. Submit.
5. Expected: the audited support-access record is created with a success message.

## 14. Admin System Health

1. Open `/admin/system-health`.
2. Confirm shared Supabase infrastructure status loads.
3. Expected: empty state or seeded infrastructure records render without crashing.

## 15. Logout

1. Open the profile menu in the top navigation.
2. Click `Sign out`.
3. Expected: you are redirected to `/login`.
4. Open `/app/dashboard`.
5. Expected: unauthenticated access redirects back to `/login?next=/app/dashboard`.

## Quality Gate Commands

Run from the repository root:

```bash
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm test
corepack pnpm build
corepack pnpm dev
```

Run database reset when Docker Desktop is available:

```bash
supabase db reset
```
