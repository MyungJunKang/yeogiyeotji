create table public.profile (
  user_id uuid primary key references auth.users (id) on delete cascade default auth.uid(),
  nickname text not null check (char_length(nickname) between 1 and 12),
  avatar_url text,
  birth_year smallint check (birth_year between 1900 and 2100),
  gender text check (gender in ('male', 'female', 'other', 'undisclosed')),
  base_area text,
  base_lat double precision,
  base_lng double precision,
  is_onboarded boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profile enable row level security;

create policy "profile_select_own"
  on public.profile for select
  using (user_id = auth.uid());

create policy "profile_insert_own"
  on public.profile for insert
  with check (user_id = auth.uid());

create policy "profile_update_own"
  on public.profile for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create view public.profile_public
  with (security_invoker = off) as
  select user_id, nickname, avatar_url
  from public.profile;

grant select on public.profile_public to authenticated;

create function public.set_updated_at()
  returns trigger
  language plpgsql
  set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profile_set_updated_at
  before update on public.profile
  for each row
  execute function public.set_updated_at();
