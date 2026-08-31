-- upsert_place: 카카오 장소를 전역 테이블에 멱등 삽입.
-- 이미 있으면 기존 행을 건드리지 않고 id만 반환. 없으면 insert 후 id 반환.
-- 전역 테이블이라 클라이언트 직접 update를 막고 여기로만 갱신 경로를 연다.
create function public.upsert_place(
  p_kakao_place_id text,
  p_name text,
  p_category text,
  p_address text,
  p_lat double precision,
  p_lng double precision
) returns uuid
  language plpgsql
  security definer
  set search_path = ''
as $$
declare
  v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select id into v_id from public.place where kakao_place_id = p_kakao_place_id;
  if v_id is not null then
    return v_id;
  end if;

  insert into public.place (kakao_place_id, name, category, address, location, created_by)
  values (
    p_kakao_place_id, p_name, p_category, p_address,
    extensions.st_setsrid(extensions.st_makepoint(p_lng, p_lat), 4326)::extensions.geography,
    auth.uid()
  )
  on conflict (kakao_place_id) do nothing
  returning id into v_id;

  -- 동시 삽입 경쟁으로 do nothing 되면 기존 행을 다시 조회
  if v_id is null then
    select id into v_id from public.place where kakao_place_id = p_kakao_place_id;
  end if;

  return v_id;
end;
$$;

grant execute on function public.upsert_place(text, text, text, text, double precision, double precision) to authenticated;

-- save_visit: Visit insert + PlaceTag insert + UserTag.use_count 증가를 한 트랜잭션으로.
-- security invoker: 전부 본인 소유 행이라 RLS로 충분. use_count는 여기서만 증가시킨다.
create function public.save_visit(
  p_place_id uuid,
  p_revisit_intent text,
  p_tag_ids smallint[] default '{}',
  p_visited_at date default current_date,
  p_memo text default null,
  p_rating smallint default null,
  p_visibility text default 'private'
) returns uuid
  language plpgsql
  security invoker
  set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_visit_id uuid;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  insert into public.visit (place_id, user_id, visited_at, memo, revisit_intent, rating, visibility)
  values (
    p_place_id, v_uid, coalesce(p_visited_at, current_date),
    p_memo, p_revisit_intent, p_rating, coalesce(p_visibility, 'private')
  )
  returning id into v_visit_id;

  if p_tag_ids is not null and array_length(p_tag_ids, 1) is not null then
    insert into public.place_tag (place_id, tag_id, user_id)
    select p_place_id, t, v_uid from unnest(p_tag_ids) as t
    on conflict (place_id, tag_id, user_id) do nothing;

    insert into public.user_tag (user_id, tag_id, use_count)
    select v_uid, t, 1 from unnest(p_tag_ids) as t
    on conflict (user_id, tag_id)
    do update set use_count = user_tag.use_count + 1;
  end if;

  return v_visit_id;
end;
$$;

grant execute on function public.save_visit(uuid, text, smallint[], date, text, smallint, text) to authenticated;

-- places_in_bounds: 뷰포트 안의 "내가 방문한" 장소.
-- 장소마다 가장 최근 Visit의 revisit_intent / visited_at + 총 방문 횟수.
-- tag_ids가 여러 개면 AND 조건(전부 만족). 빈 배열/null이면 태그 필터 미적용.
create function public.places_in_bounds(
  min_lat double precision,
  min_lng double precision,
  max_lat double precision,
  max_lng double precision,
  tag_ids smallint[] default '{}'
) returns table (
  id uuid,
  name text,
  category text,
  address text,
  lat double precision,
  lng double precision,
  latest_revisit_intent text,
  latest_visited_at date,
  visit_count bigint
)
  language sql
  security invoker
  set search_path = ''
as $$
  with my_visits as (
    select v.place_id,
           count(*) as visit_count,
           max(v.visited_at) as latest_visited_at
    from public.visit v
    where v.user_id = auth.uid()
    group by v.place_id
  ),
  latest as (
    select distinct on (v.place_id)
           v.place_id, v.revisit_intent
    from public.visit v
    where v.user_id = auth.uid()
    order by v.place_id, v.visited_at desc, v.created_at desc
  )
  select p.id, p.name, p.category, p.address,
         extensions.st_y(p.location::extensions.geometry) as lat,
         extensions.st_x(p.location::extensions.geometry) as lng,
         l.revisit_intent as latest_revisit_intent,
         mv.latest_visited_at,
         mv.visit_count
  from public.place p
  join my_visits mv on mv.place_id = p.id
  join latest l on l.place_id = p.id
  where p.location operator(extensions.&&) extensions.st_makeenvelope(min_lng, min_lat, max_lng, max_lat, 4326)::extensions.geography
    and (
      tag_ids is null
      or array_length(tag_ids, 1) is null
      or p.id in (
        select pt.place_id
        from public.place_tag pt
        where pt.user_id = auth.uid()
          and pt.tag_id = any (tag_ids)
        group by pt.place_id
        having count(distinct pt.tag_id) = array_length(tag_ids, 1)
      )
    );
$$;

grant execute on function public.places_in_bounds(double precision, double precision, double precision, double precision, smallint[]) to authenticated;
