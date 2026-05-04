export type OrderItem = {
  id: string;
  order_id: number;
  wc_line_item_id: number;
  product_id: number | null;
  name: string;
  quantity: number;
  image_url: string | null;
  phase: string;
  entered_at: string;
};

export type Order = {
  id: number;
  status: string;
  number: string | null;
  customer_name: string | null;
  phone: string | null;
  state: string | null;
  address: string | null;
  total: number;
  customer_note: string | null;
  date_created: string | null;
  order_items: OrderItem[];
};
