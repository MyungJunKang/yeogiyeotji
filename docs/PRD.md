# place-log 기획안

개인용 장소 기록 PWA

---

## 1. 문제 정의

네이버 지도나 카카오맵의 "저장" 목록은 저장은 쉬운데 맥락이 남지 않는다. 몇 달 뒤에 목록을 열면 왜 저장했는지, 갔는지 안 갔는지, 좋았는지 별로였는지 알 수 없다. 반대로 메모 앱은 맥락은 남지만 지도가 없어서 위치 기반으로 꺼내 쓸 수가 없다.

그래서 실제로 필요한 순간 — 친구가 "이 근처에서 저녁 뭐 먹지?"라고 물었을 때 — 아무것도 못 꺼낸다.

### 왜 이건 될 만한가

비슷한 기록형 서비스(냉장고 재고 관리 등)가 대부분 실패하는 이유는 두 가지다.

1. **대체재가 무료이고 완벽하다** — 냉장고는 문을 열면 된다
2. **한 번 밀리면 복구가 안 된다** — 과거 상태가 현재 상태를 결정한다
   장소 기록은 둘 다 해당하지 않는다. 6개월 전에 간 가게 이름은 정말로 기억이 안 나고(대체재 없음), 두 달 안 쓰다 다시 써도 과거 기록은 그대로 유효하다(정합성 문제 없음).

### 핵심 데이터는 재방문 의사다

별점만 남기면 나중에 해석이 안 된다. "3.5점이 뭐였지?"가 된다. 게다가 검색이 안 된다. "이 근처에서 저녁 뭐 먹지"에 답하려면 결국 "또 갈 만한 곳"을 골라야 하는데, 별점으로는 4점부터인지 4.5점부터인지 매번 임의로 정해야 한다. 인플레도 심해서 좋았던 곳은 다 4~5점이 되고 변별력이 사라진다.

그래서 **재방문 의사 3단계를 필수**로 받는다.

- 또 갈래
- 괜찮았음
- 안 갈래
  셋 다 같은 축이라 순서가 서고, 그 자체가 결론이라 해석이 필요 없다. 그리고 그 자체가 필터다.

조건부 평가("부모님이랑이면 갈 만함")를 별도 단계로 두지 않는 이유는 태그가 이미 담당하기 때문이다. `companion` 태그 + "또 갈래"면 같은 정보가 나온다.

### 별점은 선택이다

둘은 다른 걸 측정한다. 별점은 "얼마나 좋았나", 재방문 의사는 "다시 갈 건가". 비싸서 다시 안 갈 곳도 훌륭할 수 있다.

- 1~5 정수, 입력하지 않아도 저장된다
- 기록 화면에서 기본으로 접혀 있다. 필수 입력을 늘리면 기록이 밀린다
- 마커 색·필터·검색은 전부 재방문 의사 기준이다. 별점은 상세 화면에서 보조 정보로만 쓴다
- 나중에 소셜을 붙일 때 의미가 커진다. 남에게 보여줄 땐 별점이 더 빨리 읽힌다

---

## 2. 핵심 원칙

1. **기록 추가는 탭 5번 이내로 끝나야 한다.** 여기가 느리면 앱이 죽는다.
2. **필수 입력을 최소화한다.** 메모는 선택, 방문일은 오늘 기본값.
3. **지도는 결과를 보는 곳이지 입력하는 곳이 아니다.**
4. **모바일 우선.** 375~430px 기준. 데스크톱은 나중.

---

## 3. 범위

### MVP

- 카카오 로그인 + 온보딩
- 방문 기록 추가 (장소 검색 → 재방문의사 → 태그 → 저장, 별점은 선택)
- 지도에 방문한 곳 마커 + 태그 필터
- 장소 상세 (방문 이력 타임라인)
- 검색 (텍스트 + 태그 조합)

### 이번에 만들지 않음

- 가보고 싶은 곳(wish) UI — 테이블만 생성
- 이메일 회원가입 / 비밀번호 재설정
- 소셜 기능 (팔로우, 피드, 장소별 집계) — 스키마만 대비
- 사진 업로드 / EXIF 파싱
- 통계, 회고, 공유
- 데스크톱 레이아웃

### 확장 여지 (스키마에 자리만 확보)

- **wish** — `Intent` 테이블. 지도 필터에 모드 전환 자리
- **소셜** — `Place` 전역화, `Visit.visibility`, `PlaceTag.user_id`
- **인구통계 기반 태그 개인화** — `Profile.birth_year` / `gender`. 컬럼만 받아두고 프리셋 로직은 데이터가 쌓인 뒤

---

## 4. 데이터 모델

### 설계 원칙

**`Place`에 status 필드를 두지 않는다.** 상태는 자식 레코드 유무로 파생한다.

| 조건                           | 상태                      |
| ------------------------------ | ------------------------- |
| Visit 있음                     | 방문한 곳                 |
| Intent 있고 `resolved_at` null | 가고 싶은 곳              |
| 둘 다 있음                     | 갔다 왔고 또 가고 싶은 곳 |

status enum으로 시작하면 "갔다 왔는데 또 가고 싶은" 상태를 표현할 수 없고, 나중에 반드시 스키마를 뜯게 된다.

**`Place`는 전역이다.** `user_id`를 붙이지 않는다. 사용자마다 Place 행을 따로 만들면 나중에 "이 장소를 5명이 다녀갔다"가 계산되지 않는다.

**태그는 장소의 속성이 아니라 개인의 평가다.** `PlaceTag`에 `user_id`가 있어야 "78%가 조용하다고 함" 같은 집계가 가능하다.

### 테이블

```
Place       id
            kakao_place_id (unique, nullable)
            name, category, address
            location (geography POINT, 4326)
            is_custom (bool, default false)
            created_by, created_at
```

전역 장소 마스터. 같은 장소는 `kakao_place_id` 기준 하나의 행.
`is_custom = true`(한강 잔디밭처럼 카카오에 없는 장소)는 전역 공유 대상이 아니며 `created_by`만 접근.

```
Profile     user_id (PK, auth.users FK)
            nickname            공개 표시명
            avatar_url
            birth_year (nullable)
            gender (nullable)   male / female / other / undisclosed
            home_area (nullable)
            home_lat, home_lng (nullable)
            created_at
```

연령대 대신 출생연도를 받는다. 연령대는 시간이 지나면 틀려진다.

```
Visit       id, place_id, user_id
            visited_at
            memo (nullable)
            revisit_intent      again / okay / never   (필수)
            rating (nullable)   1~5 정수, 선택 입력
            visibility          private / public (default private)
            created_at
```

`Place : Visit = 1 : N`. 같은 장소를 여러 번 방문할 수 있고, 그 변화가 보이는 게 이 서비스의 값어치다.
메모에 사적인 내용이 들어가므로 기본 비공개.

```
PlaceTag    place_id, tag_id, user_id   (복합 PK)
Tag         id, group, key, label, sort_order
UserTag     user_id, tag_id, use_count, pinned   (복합 PK: user_id + tag_id)
Intent      id, place_id, user_id, saved_at, reason, source_url, resolved_at (nullable)
```

`UserTag.use_count`는 `save_visit` RPC 안에서 함께 증가시킨다. 클라이언트에서 별도 호출하거나 DB 트리거로 처리하지 않는다.

### 태그 세트 (전역 단일)

태그를 사용자 속성별로 분리하지 않는다. 갈라지면 집계가 불가능해진다. 개인화는 **노출 순서**로만 한다.

| 그룹      | 태그                                            |
| --------- | ----------------------------------------------- |
| companion | 혼자 / 둘이서 / 여럿이서 / 부모님               |
| situation | 조용히 얘기 / 오래 앉기 / 빨리 먹기 / 특별한 날 |
| condition | 주차 / 예약 필요 / 웨이팅 있음 / 늦게까지       |

- 자유 입력 금지. 오타와 유사 태그로 3개월이면 망가진다
- 카테고리(음식점/카페/술집)는 태그로 만들지 않는다. 카카오가 이미 준다
- 기록 화면에서 상위 6개만 먼저 노출 + 더보기
- **상위 6개 결정 (현재)**: `sort_order` 순서 그대로. 사용 이력이 쌓이면 `use_count` 내림차순으로 교체
- **인구통계(`birth_year`/`gender`) 기반 프리셋은 추후 구현.** 사용자 데이터가 없는 상태에서 프리셋을 정하면 근거 없는 하드코딩이 된다. 데이터가 모인 뒤에 정한다. 컬럼은 지금 받아둔다

### RLS

모든 테이블에 `enable row level security`를 **마이그레이션에 명시**한다. 대시보드 설정에 의존하면 다른 환경에 스키마를 올릴 때 따라가지 않는다.

| 테이블   | 읽기                                                      | 쓰기                                  |
| -------- | --------------------------------------------------------- | ------------------------------------- |
| Place    | 전체 (`is_custom = false` 또는 `created_by = auth.uid()`) | insert만 허용, **update/delete 차단** |
| Profile  | 본인 전체 + 타인은 공개 필드만                            | 본인만                                |
| Visit    | 본인 전부 + 타인은 `visibility = 'public'`                | 본인만                                |
| PlaceTag | 전체                                                      | `user_id = auth.uid()`                |
| Intent   | 본인만                                                    | 본인만                                |
| Tag      | 전체                                                      | 차단                                  |

- `user_id` 컬럼 기본값을 `default auth.uid()`로 두고 클라이언트에서 넣지 않는다
- `location`에 GiST 인덱스

### RPC

**`places_in_bounds(min_lat, min_lng, max_lat, max_lng, tag_ids[])`**

지도 뷰포트 안의 "내가 방문한" 장소를 반환. PostgREST 필터로 표현할 수 없으므로 RPC로 만든다.

- `tag_ids`가 여러 개면 **AND 조건**이다. "부모님 + 주차"는 둘 다 만족하는 장소만 나와야 한다

```sql
  -- OR 이 아니라 AND 임에 주의
  group by p.id
  having count(distinct pt.tag_id) = array_length(tag_ids, 1)
```

- `tag_ids`가 빈 배열이거나 null이면 필터를 적용하지 않는다
- 각 장소마다 **가장 최근 Visit의 `revisit_intent`와 `visited_at`, 총 방문 횟수**를 함께 반환한다.
  마커 색과 하단 시트가 이 값을 쓴다
  **`upsert_place(kakao_place_id, name, category, address, lat, lng)` → place_id**

`Place`는 전역 테이블이므로 클라이언트가 직접 update 하면 한 명이 남의 장소 정보를 덮어쓸 수 있다. 반드시 이 RPC를 거친다.

- `kakao_place_id`가 이미 있으면 **기존 행을 건드리지 않고 id만 반환**
- 없으면 새로 insert 하고 id 반환
- `security definer`로 선언하되 `search_path`를 고정할 것
  **`save_visit(...)`**

Visit insert + PlaceTag insert + `UserTag.use_count` 증가를 한 트랜잭션으로 처리한다.
`use_count` 갱신을 클라이언트나 트리거에 맡기지 말고 여기서 함께 한다.

```sql
insert into user_tag (user_id, tag_id, use_count)
values (auth.uid(), unnest(tag_ids), 1)
on conflict (user_id, tag_id)
do update set use_count = user_tag.use_count + 1;
```

---

## 5. 인증

Supabase Auth 사용. 직접 구현하지 않는다.

### 이번엔 카카오만

이메일 회원가입을 같이 붙이면 두 가지 비용이 생긴다.

1. **중복 계정** — 카카오로 가입한 걸 잊고 이메일로 재가입하면 별개 계정이 되어 기록이 통째로 안 보인다
2. **메일 발송** — Supabase 기본 SMTP는 테스트용이라 발송량 제한이 낮다. 실사용하려면 외부 SMTP + 도메인 인증(SPF/DKIM)이 붙는다
   이 둘을 처리하는 시간이 기록 추가 화면 만드는 시간보다 길다. 카카오로 앱을 돌아가게 한 뒤 나중에 얹는다. 나중에 붙여도 기존 계정에 영향이 없다.

다만 로그인 로직을 `signInWithKakao()` 하나에 가두지 말고 프로바이더 추가가 쉬운 형태로 둔다.

### 라우트

```
_auth.tsx                 인증 필요 레이아웃 (pathless)
_auth/index.tsx           지도
_auth/record.tsx          기록 추가
_auth/places.$id.tsx      장소 상세
_auth/search.tsx          검색
_auth/settings.tsx        프로필 수정, 로그아웃
login.tsx
auth.callback.tsx         OAuth 리다이렉트 수신
onboarding.tsx            Profile 없을 때
```

- `_auth.tsx` beforeLoad — 세션 없으면 `/login?redirect=<원래경로>`
- `_auth.tsx` beforeLoad — 세션 있는데 Profile 없으면 `/onboarding`
- `login.tsx` beforeLoad — 이미 로그인 상태면 `/`

### 세션

- `supabase.auth.onAuthStateChange` 구독
- 라우터 context에 세션 주입해서 beforeLoad에서 접근
- 로그아웃 시 `queryClient.clear()`
- 초기 세션 확인 중 스플래시. 로그인 화면이 깜빡였다 사라지지 않게

### 온보딩

닉네임(카카오 값 기본), 출생연도, 성별, 주 활동 지역.
**전부 건너뛸 수 있어야 한다.** 건너뛴 항목은 설정에서 나중에 채운다.
성별/출생연도는 개인정보이므로 수집 목적을 한 줄로 표기.

**건너뛰기를 눌러도 반드시 Profile 행을 생성한다.** nickname은 카카오 값으로 채우고 나머지는 null. 행이 없으면 `_auth.tsx`의 가드가 다시 `/onboarding`으로 보내 무한 리다이렉트가 된다.

- 온보딩 완료 판정은 "Profile 행 존재 여부"이지 "필드가 다 찼는지"가 아니다
- 카카오 닉네임을 못 받은 경우를 대비해 기본값 폴백을 둘 것

---

## 6. 화면

### 지도 (홈)

- 전체 화면 지도, 방문한 곳 마커
- 상단 태그 필터 칩 가로 스크롤
- 우하단 기록 추가 FAB
- 마커 탭 → 하단 시트 (이름 / 방문 횟수 / 마지막 방문일 / 재방문의사)
- 시트를 위로 끌면 장소 상세로
  **한 장소에 Visit이 여러 개일 때 표시 기준은 항상 "가장 최근 방문"이다.** 최빈값이나 평균이 아니다. 마커 색, 하단 시트의 재방문의사, 검색 결과 모두 동일하게 최신 기준. 예전엔 좋았지만 최근에 별로였다면 최근이 결론이다.

### 기록 추가

이 앱의 핵심. 목표는 탭 5번 이내.

```
장소 검색 (1) → 선택 (1) → 재방문의사 (1) → 태그 (1~2) → 저장 (1)
```

- 방문일 기본값 오늘, 탭하면 변경
- 메모는 접혀 있음
- 재방문의사는 큰 버튼 3개(또 갈래 / 괜찮았음 / 안 갈래). 필수.
  색으로 구분하되 신호등(빨강/노랑/초록)은 피한다 — 너무 평가적
- 별점은 메모와 함께 접혀 있다. 선택 입력이며 건너뛰어도 저장된다
- 기존 Place가 있으면 재사용하고 Visit만 추가

### 장소 상세

- 상단 장소 정보 + 미니맵
- 방문 이력 타임라인 (최신순)
- 여러 번 방문한 경우 변화가 보여야 한다 (예전엔 "또 감" → 최근엔 "안 감")
- 하단 방문 추가 버튼

### 검색

- 텍스트 + 태그 조합
- 리스트 / 지도 토글
- 리스트 아이템: 장소명, 태그, 마지막 방문일, 재방문의사 (별점은 표시하지 않음)

---

## 7. 기술 스택

```
Vite + React + TypeScript
TanStack Router      파일 기반 라우팅, autoCodeSplitting
TanStack Query       서버 상태 전담
Tailwind CSS v4      @tailwindcss/vite, config 파일 없음
zod + react-hook-form
카카오맵 JS SDK       래퍼 없이 직접 제어
Supabase             Postgres + PostGIS + Auth + Storage
vite-plugin-pwa
Vercel               정적 SPA
```

### Next.js를 쓰지 않는 이유

전부 로그인 뒤에 있어 SEO가 필요 없고, 서버에서 하는 일이 카카오 REST 프록시 하나뿐이다. App Router의 서버/클라이언트 경계, 캐싱 모델, 하이드레이션 규칙을 짊어질 이유가 없다.

오히려 손해가 명확하다.

- PWA — `vite-plugin-pwa`는 설정 몇 줄, Next.js는 여전히 껄끄럽다
- 카카오 SDK — `window`를 붙잡고 DOM을 직접 조작하는 물건이라 SSR 환경에서 계속 신경 써야 한다
- dev 서버 속도

### 레포 구조

프론트와 Supabase를 한 레포에 둔다. 스키마가 바뀌면 프론트 타입도 바뀌므로 커밋 하나에 묶이는 게 자연스럽다. 배포 파이프라인은 독립적이다 — Vercel은 `src/`만 빌드하고 `supabase/`는 무시한다.

```
place-log/
  src/
    routes/
    features/       map/ record/ place/
    components/
    lib/            supabase.ts  kakao.ts  cn.ts  auth.ts
    hooks/
    types/          database.ts (gen 결과물, 직접 수정 금지)
    styles.css
  supabase/
    config.toml
    migrations/
    functions/kakao-search/index.ts
  vercel.json
  CLAUDE.md
```

### 환경변수

```
# .env.local
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_KAKAO_JS_KEY=

# Supabase Edge Function secret
KAKAO_REST_KEY=
```

Vercel 대시보드에는 `VITE_` 접두사 붙은 것만 등록.

### 배포 주의

`vercel.json`에 SPA fallback이 없으면 `/places/123` 새로고침 시 404가 난다.

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

카카오 개발자 콘솔에 도메인을 등록해야 JS SDK가 뜬다. 프리뷰 URL은 배포마다 바뀌어 등록할 수 없으므로 **프리뷰에서는 지도가 안 뜬다. 정상이다.**

---

## 8. 구현 순서

각 단계가 끝나면 멈추고 확인한다.

| 단계 | 내용                                                            |
| ---- | --------------------------------------------------------------- |
| 1    | Tailwind `@theme` 토큰, `cn()` 유틸, 라우팅 뼈대, `vercel.json` |
| 2    | DB 스키마 마이그레이션 (테이블 + RLS + 인덱스 + 시드 + RPC)     |
| 3    | 카카오 로그인 + 온보딩 + 라우트 가드                            |
| 4    | 카카오 로컬 API 프록시 Edge Function                            |
| 5    | 기록 추가                                                       |
| 6    | 지도                                                            |
| 7    | 장소 상세                                                       |
| 8    | 검색                                                            |

3단계가 앞에 있어야 하는 이유는 RLS 때문이다. 로그인 없이는 그 뒤 단계를 테스트할 수 없다.

5단계까지 되면 이미 쓸 수 있는 앱이다.

### 시작 전 수동 작업

1. Supabase 대시보드 → Database → Extensions → `postgis` 활성화
2. Supabase Data API 설정: Enable Data API **켜기** / Automatically expose new tables **끄기** / Enable automatic RLS **켜기**
3. 카카오 개발자 콘솔 → 카카오 로그인 활성화, Redirect URI `https://<ref>.supabase.co/auth/v1/callback`, Client Secret 발급
4. Supabase Authentication → Providers → Kakao에 REST 키 + Secret 등록
5. `npx supabase link --project-ref <ref>`

---

## 9. 카카오맵 주의사항

- `index.html`에서 `autoload=false`로 로드하고 `kakao.maps.load()` 콜백 안에서 초기화. 빼먹으면 `kakao is not defined`가 난다
- 한국어 블로그 자료는 대부분 Next.js Pages Router 기준이니 그대로 따라하지 않는다
- 마커는 React 컴포넌트로 만들지 말고 명령형으로 관리 (수백 개 대비)
- 커스텀 오버레이 HTML에 Tailwind 클래스 문자열을 박지 말고 `styles.css`에 실제 클래스를 정의해 쓴다
- JS 키는 클라이언트, REST 키는 Edge Function 환경변수. 절대 섞지 않는다

---

## 10. 미결 사항

만들면서 정한다. 스키마를 바꾸지 않아도 되는 것들이다.

**사진 EXIF로 입력 줄이기**
찍은 사진에 GPS와 시각이 박혀 있다. 사진 몇 장 고르면 장소와 날짜가 자동으로 채워지는 흐름이 가능하다. 입력 마찰을 가장 크게 줄이는 방법이지만 저장 비용과 권한이 붙는다. `exifr`로 클라이언트에서 파싱하면 업로드 없이 좌표만 뽑을 수 있다.

**검색이 태그보다 위치 중심일 가능성**
실제 상황은 "강남에서 저녁 뭐 먹지?"다. 이때 필요한 건 지역 + 카테고리 + "또 감" 필터다. 그렇다면 검색 화면보다 지도 필터가 더 중요해진다.

**기록 시점**
집에 오면 안 한다. 현장 기록은 위치 트리거가 필요한데 백그라운드 권한이 걸린다. 대안은 저녁에 하루치를 몰아 묻는 방식.

**여행 vs 일상**
일상은 반경 5km에 뭉치고 여행은 한 도시에 3일치가 몰린다. `Trip` 개념으로 묶을지, 날짜 근접 마커로 자동 그룹화할지.

**오래된 방문 마커**
2년 전과 지난주가 지도에서 똑같이 보이면 노이즈다. 시간에 따라 투명도를 낮추거나 필터를 두는 방법. 반대로 "여기 다시 가볼까" 트리거가 되기도 한다.

**공유**
"강남 뭐 먹지"에 답하려면 결국 카톡으로 목록을 보낸다. 읽기 전용 링크 하나면 구현 부담이 적어 2차보다 앞당겨질 수 있다.
