import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

/** Active l’agence PrintSpace (is_active=true) après login guyhoquet-print.fr. */
export async function POST(request: Request) {
  const url = process.env.PRINTSPACE_SUPABASE_URL?.trim();
  const key = process.env.PRINTSPACE_SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) {
    return NextResponse.json({ skipped: true, reason: "printspace_env_missing" });
  }

  let body: { email?: string };
  try {
    body = (await request.json()) as { email?: string };
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  if (!email.includes("@")) {
    return NextResponse.json({ error: "email_required" }, { status: 400 });
  }

  const admin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: profile } = await admin
    .from("profiles")
    .select("agency_id, platform_role")
    .ilike("email", email)
    .maybeSingle();

  if (profile?.platform_role === "agency" && profile.agency_id) {
    await admin
      .from("agencies")
      .update({ is_active: true, updated_at: new Date().toISOString() })
      .eq("id", profile.agency_id);
    return NextResponse.json({ ok: true, via: "profile" });
  }

  const { error } = await admin
    .from("agencies")
    .update({ is_active: true, updated_at: new Date().toISOString() })
    .ilike("email", email);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, via: "email" });
}
