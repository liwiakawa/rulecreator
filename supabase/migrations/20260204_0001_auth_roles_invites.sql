-- Roles and invite-based registration
create extension if not exists "pgcrypto";
create extension if not exists "citext";

create table if not exists public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'super_admin', 'invites')),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create table if not exists public.invites (
  id uuid primary key default gen_random_uuid(),
  email citext not null,
  role text not null check (role in ('admin')),
  token text not null unique default encode(gen_random_bytes(32), 'hex'),
  invited_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  used_at timestamptz,
  revoked_at timestamptz
);

create index if not exists invites_email_idx on public.invites (email);
create index if not exists invites_token_idx on public.invites (token);

create or replace function public.is_super_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'super_admin'
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role in ('admin', 'super_admin')
  );
$$;

create or replace function public.can_manage_invites()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role in ('invites', 'super_admin')
  );
$$;

alter table public.user_roles enable row level security;
alter table public.invites enable row level security;

drop policy if exists "user_roles_self_read" on public.user_roles;
create policy "user_roles_self_read" on public.user_roles
  for select
  using (user_id = auth.uid() or public.is_super_admin());

drop policy if exists "user_roles_super_admin_insert" on public.user_roles;
create policy "user_roles_super_admin_insert" on public.user_roles
  for insert
  with check (public.is_super_admin());

drop policy if exists "user_roles_super_admin_update" on public.user_roles;
create policy "user_roles_super_admin_update" on public.user_roles
  for update
  using (public.is_super_admin());

drop policy if exists "user_roles_super_admin_delete" on public.user_roles;
create policy "user_roles_super_admin_delete" on public.user_roles
  for delete
  using (public.is_super_admin());

drop policy if exists "invites_managers_select" on public.invites;
create policy "invites_managers_select" on public.invites
  for select
  using (public.can_manage_invites());

drop policy if exists "invites_managers_insert" on public.invites;
create policy "invites_managers_insert" on public.invites
  for insert
  with check (public.can_manage_invites());

drop policy if exists "invites_managers_update" on public.invites;
create policy "invites_managers_update" on public.invites
  for update
  using (public.can_manage_invites());

drop policy if exists "invites_managers_delete" on public.invites;
create policy "invites_managers_delete" on public.invites
  for delete
  using (public.can_manage_invites());

create or replace function public.validate_invite(p_token text, p_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email citext;
begin
  select email into v_email
  from public.invites
  where token = p_token
    and used_at is null
    and revoked_at is null;

  if not found then
    return false;
  end if;

  return lower(v_email) = lower(p_email);
end;
$$;

revoke all on function public.validate_invite(text, text) from public;
grant execute on function public.validate_invite(text, text) to anon, authenticated;

create or replace function public.accept_invite(p_token text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.invites%rowtype;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  select * into v_invite
  from public.invites
  where token = p_token
    and used_at is null
    and revoked_at is null
  for update;

  if not found then
    raise exception 'invalid_invite';
  end if;

  if lower(v_invite.email) <> lower(auth.email()) then
    raise exception 'email_mismatch';
  end if;

  insert into public.user_roles (user_id, role, created_by)
  values (auth.uid(), v_invite.role, v_invite.invited_by)
  on conflict (user_id) do update set role = excluded.role;

  update public.invites
  set used_at = now()
  where id = v_invite.id;

  return v_invite.role;
end;
$$;

revoke all on function public.accept_invite(text) from public;
grant execute on function public.accept_invite(text) to authenticated;

-- Secure rules table for admin-only access
DO $$
BEGIN
  IF to_regclass('public.rules') IS NOT NULL THEN
    ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "rules_admin_select" ON public.rules;
    CREATE POLICY "rules_admin_select" ON public.rules
      FOR SELECT
      USING (public.is_admin());

    DROP POLICY IF EXISTS "rules_admin_insert" ON public.rules;
    CREATE POLICY "rules_admin_insert" ON public.rules
      FOR INSERT
      WITH CHECK (public.is_admin());

    DROP POLICY IF EXISTS "rules_admin_update" ON public.rules;
    CREATE POLICY "rules_admin_update" ON public.rules
      FOR UPDATE
      USING (public.is_admin());

    DROP POLICY IF EXISTS "rules_admin_delete" ON public.rules;
    CREATE POLICY "rules_admin_delete" ON public.rules
      FOR DELETE
      USING (public.is_admin());
  END IF;
END $$;

-- Optional migration from legacy admin_users table
DO $$
BEGIN
  IF to_regclass('public.admin_users') IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    SELECT user_id, 'admin' FROM public.admin_users
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
END $$;
