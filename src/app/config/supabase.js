// import { createClient } from "@supabase/supabase-js";

// export const supabase = createClient(
//   https://tldxduzaosaifpxibcxx.supabase.co,
//   sb_publishable_pzlikSJDba1PyeZiw8B0sQ_ccWcbNml
// );



import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);
