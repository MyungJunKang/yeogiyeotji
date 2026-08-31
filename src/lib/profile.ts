import { queryOptions } from "@tanstack/react-query";
import { supabase } from "./supabase";
import type { Database } from "../types/database";

export type Profile = Database["public"]["Tables"]["profile"]["Row"];

// 온보딩 완료 판정은 "행 존재 여부"다. 필드가 다 찼는지는 보지 않는다.
export function profileQueryOptions(userId: string) {
  return queryOptions({
    queryKey: ["profile", userId],
    queryFn: async (): Promise<Profile | null> => {
      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
