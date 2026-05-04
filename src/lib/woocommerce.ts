import crypto from "node:crypto";
import { EG_STATES } from "./constants";

type WooLineItem = {
  id: number;
  product_id?: number;
  name: string;
  quantity?: number;
  image?: { src?: string };
};

export type WooOrder = {
  id: number;
  number?: string;
  status?: string;
  total?: string;
  date_created?: string;
  customer_note?: string;
  billing?: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    state?: string;
    address_1?: string;
    address_2?: string;
  };
  line_items?: WooLineItem[];
};

export function verifyWooSignature(rawBody: string, signature: string | null) {
  const secret = process.env.WC_WEBHOOK_SECRET;
  if (!secret) throw new Error("Missing WC_WEBHOOK_SECRET.");
  if (!signature) return false;

  const digest = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("base64");

  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export function mapWooOrder(order: WooOrder) {
  const billing = order.billing ?? {};
  const customerName = [billing.first_name, billing.last_name].filter(Boolean).join(" ");
  const state = EG_STATES[billing.state ?? ""] ?? billing.state ?? "";
  const address = [billing.address_1, billing.address_2].filter(Boolean).join(", ");

  return {
    orderRow: {
      id: order.id,
      status: order.status ?? "processing",
      number: order.number ?? String(order.id),
      customer_name: customerName || null,
      phone: billing.phone ?? null,
      state: state || null,
      address: address || null,
      total: Number(order.total ?? 0),
      customer_note: order.customer_note ?? null,
      date_created: order.date_created ?? null,
      raw: order,
      updated_at: new Date().toISOString()
    },
    itemRows: (order.line_items ?? []).map((item) => ({
      id: `${order.id}_${item.id}`,
      order_id: order.id,
      wc_line_item_id: item.id,
      product_id: item.product_id ?? null,
      name: item.name,
      quantity: item.quantity ?? 1,
      image_url: item.image?.src ?? null,
      raw: item,
      updated_at: new Date().toISOString()
    }))
  };
}
