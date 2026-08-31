-- 전역 단일 태그 세트. 사용자별로 분리하지 않는다(갈라지면 집계 불가).
-- 카테고리(음식점/카페/술집)는 태그로 만들지 않는다 — 카카오가 이미 준다.
create table public.tag (
  id smallint primary key,
  "group" text not null check ("group" in ('companion', 'situation', 'condition')),
  key text not null unique,
  label text not null,
  sort_order smallint not null default 0
);

alter table public.tag enable row level security;

-- 읽기: 전체. 쓰기: 정책 없음 → 차단.
create policy "tag_select"
  on public.tag for select
  using (true);

insert into public.tag (id, "group", key, label, sort_order) values
  (1,  'companion', 'alone',        '혼자',       10),
  (2,  'companion', 'duo',          '둘이서',     20),
  (3,  'companion', 'group',        '여럿이서',   30),
  (4,  'companion', 'parents',      '부모님',     40),
  (5,  'situation', 'quiet_talk',   '조용히 얘기', 50),
  (6,  'situation', 'long_stay',    '오래 앉기',   60),
  (7,  'situation', 'quick_eat',    '빨리 먹기',   70),
  (8,  'situation', 'special_day',  '특별한 날',   80),
  (9,  'condition', 'parking',      '주차',       90),
  (10, 'condition', 'reservation',  '예약 필요',   100),
  (11, 'condition', 'waiting',      '웨이팅 있음', 110),
  (12, 'condition', 'late_night',   '늦게까지',    120);

-- 개인의 태그 사용 집계. use_count는 save_visit에서만 갱신(클라이언트/트리거 금지).
create table public.user_tag (
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  tag_id smallint not null references public.tag (id) on delete cascade,
  use_count integer not null default 0,
  pinned boolean not null default false,
  primary key (user_id, tag_id)
);

alter table public.user_tag enable row level security;

create policy "user_tag_select"
  on public.user_tag for select
  using (user_id = auth.uid());

create policy "user_tag_insert"
  on public.user_tag for insert
  with check (user_id = auth.uid());

create policy "user_tag_update"
  on public.user_tag for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "user_tag_delete"
  on public.user_tag for delete
  using (user_id = auth.uid());

-- 태그는 장소의 속성이 아니라 개인의 평가다 → user_id 포함, 복합 PK.
create table public.place_tag (
  place_id uuid not null references public.place (id) on delete cascade,
  tag_id smallint not null references public.tag (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade default auth.uid(),
  primary key (place_id, tag_id, user_id)
);

create index place_tag_user_place_idx on public.place_tag (user_id, place_id);

alter table public.place_tag enable row level security;

-- 읽기: 전체. 쓰기: 본인만.
create policy "place_tag_select"
  on public.place_tag for select
  using (true);

create policy "place_tag_insert"
  on public.place_tag for insert
  with check (user_id = auth.uid());

create policy "place_tag_delete"
  on public.place_tag for delete
  using (user_id = auth.uid());
