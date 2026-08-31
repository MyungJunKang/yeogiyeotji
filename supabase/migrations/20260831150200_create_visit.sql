-- 방문 기록. Place : Visit = 1 : N (같은 장소 여러 번 방문 가능).
-- revisit_intent 필수, rating 선택. 표시 기준은 항상 가장 최근 방문.
create table public.visit (
  id uuid primary key default gen_random_uuid(),
  place_id uuid not null references public.place (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  visited_at date not null default current_date,
  memo text,
  revisit_intent text not null check (revisit_intent in ('again', 'okay', 'never')),
  rating smallint check (rating between 1 and 5),
  visibility text not null default 'private' check (visibility in ('private', 'public')),
  created_at timestamptz not null default now()
);

create index visit_place_id_idx on public.visit (place_id);
create index visit_user_id_idx on public.visit (user_id);
-- 가장 최근 방문 조회용 (place_id, user_id 별 최신순)
create index visit_latest_idx on public.visit (place_id, user_id, visited_at desc, created_at desc);

alter table public.visit enable row level security;

-- 읽기: 본인 전부 + 타인은 visibility='public'
create policy "visit_select"
  on public.visit for select
  using (user_id = auth.uid() or visibility = 'public');

-- 쓰기: 본인만
create policy "visit_insert"
  on public.visit for insert
  with check (user_id = auth.uid());

create policy "visit_update"
  on public.visit for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "visit_delete"
  on public.visit for delete
  using (user_id = auth.uid());
