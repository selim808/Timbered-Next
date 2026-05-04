import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await params;
  const { phase } = await request.json();

  if (!phase || typeof phase !== "string") {
    return NextResponse.json({ error: "Phase is required." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: current, error: readError } = await supabase
    .from("order_items")
    .select("phase, entered_at, history")
    .eq("id", itemId)
    .single();

  if (readError) {
    return NextResponse.json({ error: readError.message }, { status: 404 });
  }

  const now = new Date().toISOString();
  const enteredAt = current.entered_at ?? now;
  const durationMin = Math.round(((Date.now() - new Date(enteredAt).getTime()) / 60000) * 10) / 10;
  const history = Array.isArray(current.history) ? current.history : [];

  const { error } = await supabase
    .from("order_items")
    .update({
      phase,
      entered_at: now,
      history: [
        ...history,
        {
          phase: current.phase,
          entered_at: enteredAt,
          exited_at: now,
          duration_min: durationMin
        }
      ],
      updated_at: now
    })
    .eq("id", itemId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
