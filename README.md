# DentaCare Pro — Dental Clinic Management

Production-oriented React/Vite dental clinic management application with Supabase authentication and Vercel serverless API routes.

## Stack

- React + TypeScript + Vite
- Supabase Auth and PostgreSQL
- Vercel serverless API functions
- Tailwind CSS
- React Router, React Hook Form, Zod, Recharts

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Add the Supabase project URL and publishable/anon key to the `VITE_*` variables.
3. Add the same project URL and the **server-only** service-role key to `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
4. Run `npm install`.
5. Run `npm run dev`.

Never commit `.env`, `.env.local`, or the Supabase service-role key.

## Supabase authentication and roles

The application uses Supabase Auth for login. API requests require a valid Supabase access token.

A user's clinic role is resolved in this order:

1. `auth.users.app_metadata.role` when it is one of `Admin`, `Dentist`, `Receptionist`, or `Accountant`.
2. An active matching record in the `clinic_staff` table using the authenticated user's email.

Do **not** store roles in `user_metadata` for authorization; clients can modify user metadata. Use `app_metadata` or the server-side `clinic_staff` record.

For a first administrator, create the Supabase Auth user and assign the `role` in `app_metadata` (for example with the Supabase dashboard or a trusted server-side admin process). Then sign in normally.

## API security

All application API routes validate the Supabase bearer token server-side and enforce role permissions. The service-role key is used only by the server-side API and is never exposed to the browser.

Database access from the browser should remain disabled unless explicitly protected by appropriate Supabase RLS policies. The server-side service-role client bypasses RLS, so API authorization remains mandatory.

## Vercel deployment

Import this repository into Vercel. The project uses the existing `vercel.json` build configuration.

Set these Vercel environment variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `APP_ORIGIN` (only when a separate trusted origin is required)

Do not add the old Design Arena variables. The application no longer depends on Design Arena restore/page-view services.

## Important production checklist

- Rotate the previously exposed Supabase service-role key before going live.
- Enable and review RLS on all data tables as defense in depth.
- Create real Supabase Auth users; demo/fallback login has been removed.
- Assign clinic roles through `app_metadata` or active `clinic_staff` records.
- Test each role against every API endpoint after deployment.
- Configure Supabase Storage policies before enabling real patient document uploads.
- Do not use real patient data until authentication, authorization, backups, audit logging, and local legal/privacy requirements have been reviewed.
"# Dentalcare-pro-software" 
