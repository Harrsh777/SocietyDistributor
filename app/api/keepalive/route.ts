import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  // simple DB query to keep it alive
  await supabase.from("your_table_name").select("id").limit(1);

  return NextResponse.json({ status: "alive" });
}
