
  # Visual Trigger Rules Editor

  This is a code bundle for Visual Trigger Rules Editor. The original project is available at https://www.figma.com/design/HbvQSy4nyOrhSCOhdKcQkv/Visual-Trigger-Rules-Editor.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Auth & Security (Supabase)

  This project uses invite-only registration with roles:

  - `super_admin`: pełny dostęp, zaproszenia i reguły
  - `admin`: zarządzanie regułami
  - `invites`: zarządzanie zaproszeniami

  Apply the SQL migration in `supabase/migrations/20260204_0001_auth_roles_invites.sql`.

  Then seed your initial super admin (run in SQL editor once):

  ```sql
  insert into public.user_roles (user_id, role)
  values ('<AUTH_USER_ID>', 'super_admin')
  on conflict (user_id) do update set role = excluded.role;
  ```

  Required environment variables:

  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

  Optional email sending (Resend) for invitations:

  - `RESEND_API_KEY`
  - `RESEND_FROM_EMAIL`
  - `APP_BASE_URL` (e.g. `https://your-domain.com`)

  Panel zaproszeń jest pod `/invites` i jest dostępny dla ról `invites` oraz `super_admin`.
  
