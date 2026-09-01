-- RLS는 "어떤 행을 볼지"만 거른다. 역할이 테이블에 접근하려면 테이블 레벨 GRANT가 별도로 필요하다.
-- GRANT가 없으면 정책과 무관하게 42501 (permission denied for table)이 난다.
-- 각 테이블의 RLS 정책이 허용하는 동작만 authenticated 역할에 부여한다. (행 제한은 RLS가 담당)

-- profile: 본인 행 읽기/생성/수정
grant select, insert, update on public.profile to authenticated;

-- place: 전역 읽기 + 생성만 (update/delete는 정책 없음 → 차단 유지)
grant select, insert on public.place to authenticated;

-- visit: 본인 CRUD
grant select, insert, update, delete on public.visit to authenticated;

-- tag: 읽기 전용
grant select on public.tag to authenticated;

-- user_tag: 본인 CRUD
grant select, insert, update, delete on public.user_tag to authenticated;

-- place_tag: 읽기 + 생성/삭제
grant select, insert, delete on public.place_tag to authenticated;
