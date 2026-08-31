import { useMemo, useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { profileQueryOptions } from "../lib/profile";
import type { Database } from "../types/database";

type ProfileInsert = Database["public"]["Tables"]["profile"]["Insert"];
type Gender = NonNullable<ProfileInsert["gender"]>;

const FALLBACK_NICKNAME = "기록자";
const CURRENT_YEAR = 2026;

const GENDERS: { value: Gender; label: string }[] = [
  { value: "male", label: "남성" },
  { value: "female", label: "여성" },
  { value: "other", label: "기타" },
  { value: "undisclosed", label: "비공개" },
];

export const Route = createFileRoute("/onboarding")({
  beforeLoad: ({ context }) => {
    if (!context.auth.session) {
      throw redirect({ to: "/login" });
    }
  },
  component: OnboardingPage,
});

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.length > 0 ? v : undefined;
}

function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const meta = useMemo(
    () => (user?.user_metadata ?? {}) as Record<string, unknown>,
    [user],
  );
  const kakaoNickname =
    str(meta.name) ??
    str(meta.nickname) ??
    str(meta.preferred_username) ??
    str(meta.full_name) ??
    str(meta.user_name);
  const avatarUrl = str(meta.avatar_url) ?? str(meta.picture) ?? null;

  const [nickname, setNickname] = useState(
    (kakaoNickname ?? FALLBACK_NICKNAME).slice(0, 12),
  );
  const [birthYear, setBirthYear] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [baseArea, setBaseArea] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = CURRENT_YEAR; y >= 1940; y--) list.push(y);
    return list;
  }, []);

  const save = async (skip: boolean) => {
    if (!user) return;
    setError(null);

    const finalNickname = skip
      ? (kakaoNickname ?? FALLBACK_NICKNAME).slice(0, 12)
      : nickname.trim();

    if (!skip && (finalNickname.length < 1 || finalNickname.length > 12)) {
      setError("닉네임은 1~12자로 입력해 주세요.");
      return;
    }

    const payload: ProfileInsert = {
      nickname: finalNickname,
      avatar_url: avatarUrl,
      birth_year: skip || !birthYear ? null : Number(birthYear),
      gender: skip || !gender ? null : gender,
      base_area: skip || !baseArea.trim() ? null : baseArea.trim(),
      is_onboarded: !skip,
    };

    setSaving(true);
    const { data, error: insertError } = await supabase
      .from("profile")
      .insert(payload)
      .select()
      .single();
    setSaving(false);

    if (insertError) {
      setError("저장에 실패했어요. 잠시 후 다시 시도해 주세요.");
      return;
    }

    // 가드가 다시 조회하지 않도록 캐시에 방금 만든 행을 심는다.
    queryClient.setQueryData(profileQueryOptions(user.id).queryKey, data);
    await navigate({ to: "/" });
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 p-6">
      <header className="mt-4">
        <h1 className="text-xl font-semibold">프로필 설정</h1>
        <p className="mt-1 text-sm text-muted">
          전부 건너뛸 수 있어요. 나중에 설정에서 바꿀 수 있습니다.
        </p>
      </header>

      <div className="flex flex-col gap-5">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">닉네임</span>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={12}
            placeholder="닉네임"
            className="rounded-md border border-border bg-surface px-3 py-2"
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">출생연도</span>
          <select
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-2"
          >
            <option value="">선택 안 함</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="text-sm font-medium">성별</legend>
          <div className="flex flex-wrap gap-2">
            {GENDERS.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setGender((cur) => (cur === g.value ? "" : g.value))}
                className={
                  "rounded-full border px-4 py-1.5 text-sm " +
                  (gender === g.value
                    ? "border-brand bg-brand text-white"
                    : "border-border bg-surface")
                }
              >
                {g.label}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">주 활동 지역</span>
          <input
            value={baseArea}
            onChange={(e) => setBaseArea(e.target.value)}
            placeholder="예: 성수동"
            className="rounded-md border border-border bg-surface px-3 py-2"
          />
        </label>

        <p className="text-xs text-muted">
          출생연도·성별은 지역·연령대에 맞는 태그 추천에만 쓰이며 공개되지 않아요.
        </p>
      </div>

      {error && <p className="text-sm text-never">{error}</p>}

      <div className="mt-auto flex flex-col gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => void save(false)}
          className="rounded-md bg-brand py-3 font-medium text-white disabled:opacity-60"
        >
          {saving ? "저장 중…" : "완료"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => void save(true)}
          className="py-2 text-sm text-muted disabled:opacity-60"
        >
          건너뛰기
        </button>
      </div>
    </div>
  );
}
