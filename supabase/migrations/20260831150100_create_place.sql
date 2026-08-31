-- 전역 장소 테이블. user_id 없음. 같은 장소는 kakao_place_id 기준 한 행.
-- status 필드 없음: 상태는 Visit / Intent 자식 레코드 유무로 파생한다.
create table public.place (
  id uuid primary key default gen_random_uuid(),
  kakao_place_id text unique,
  name text not null,
  category text,
  address text,
  location extensions.geography(Point, 4326) not null,
  is_custom boolean not null default false,
  created_by uuid references auth.users (id) default auth.uid(),
  created_at timestamptz not null default now()
);

create index place_location_gix on public.place using gist (location);
create index place_created_by_idx on public.place (created_by);

alter table public.place enable row level security;

-- 읽기: 전역 공유(is_custom=false) 또는 본인이 만든 커스텀 장소
create policy "place_select"
  on public.place for select
  using (is_custom = false or created_by = auth.uid());

-- 쓰기: insert만. update/delete 정책 없음 → 차단.
-- 전역 테이블이므로 직접 update 하면 남의 장소를 덮어쓴다. 갱신은 upsert_place RPC 경유.
create policy "place_insert"
  on public.place for insert
  with check (created_by = auth.uid());
