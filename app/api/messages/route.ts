import { NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase";

export async function GET() {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase.from("test_messages").select("*");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
