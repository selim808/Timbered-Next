import { mapWooOrder, verifyWooSignature, type WooOrder } from "@/lib/woocommerce";
import { createServiceClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-wc-webhook-signature");

  if (!verifyWooSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid WooCommerce signature." }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as WooOrder;
  const { orderRow, itemRows } = mapWooOrder(payload);
  const supabase = createServiceClient();

  const { error: orderError } = await supabase
    .from("orders")
    .upsert(orderRow, { onConflict: "id" });

  if (orderError) {
    return NextResponse.json({ error: orderError.message }, { status: 500 });
  }

  if (itemRows.length) {
    const { error: itemsError } = await supabase
      .from("order_items")
      .upsert(itemRows, {
        onConflict: "id",
        ignoreDuplicates: false
      });

    if (itemsError) {
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
