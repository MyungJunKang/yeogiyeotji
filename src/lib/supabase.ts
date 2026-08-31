import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error(
    "Supabase 환경변수가 없습니다. .env.local의 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY를 확인하세요.",
  );
}

export const supabase = createClient<Database>(url, anonKey);
