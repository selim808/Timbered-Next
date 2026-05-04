"use client";

import { PHASES } from "@/lib/constants";
import type { Order, OrderItem } from "@/lib/types";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable
} from "@tanstack/react-table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, MessageCircle, Phone, Search } from "lucide-react";
import { useMemo, useState } from "react";

type Row = OrderItem & {
  order: Order;
  days: number;
};

function daysSince(date: string | null) {
  if (!date) return 0;
  return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
}

function whatsappUrl(phone: string | null, name: string | null, orderId: number) {
  if (!phone) return "#";
  const wa = phone.replace(/\D/g, "").replace(/^0/, "20");
  const message = encodeURIComponent(
    `Hello ${name ?? ""}, your Timbered order #${orderId} has been received. Please send delivery location.`
  );
  return `https://wa.me/${wa}?text=${message}`;
}

export function OrdersDashboard() {
  const [phase, setPhase] = useState(PHASES[0]);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to load orders.");
      return (await res.json()) as Order[];
    }
  });

  const phaseMutation = useMutation({
    mutationFn: async ({ itemId, nextPhase }: { itemId: string; nextPhase: string }) => {
      const res = await fetch(`/api/order-items/${itemId}/phase`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase: nextPhase })
      });
      if (!res.ok) throw new Error("Failed to update phase.");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] })
  });

  const rows = useMemo<Row[]>(() => {
    return (ordersQuery.data ?? []).flatMap((order) =>
      order.order_items.map((item) => ({
        ...item,
        order,
        days: daysSince(order.date_created)
      }))
    );
  }, [ordersQuery.data]);

  const phaseCounts = useMemo(() => {
    return rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.phase] = (acc[row.phase] ?? 0) + 1;
      return acc;
    }, {});
  }, [rows]);

  const columns = useMemo<ColumnDef<Row>[]>(() => [
    {
      header: "Order",
      accessorFn: (row) => row.order.id,
      cell: ({ row }) => (
        <button
          className="flex w-full items-center gap-2 text-left"
          onClick={() => setExpanded((current) => ({
            ...current,
            [row.original.order.id]: !current[row.original.order.id]
          }))}
        >
          <span className={[
            "rounded px-1.5 py-0.5 text-[11px] font-bold text-white",
            row.original.days >= 14 ? "bg-red-500" : row.original.days >= 7 ? "bg-orange-500" : "bg-timber-brown"
          ].join(" ")}>
            {row.original.days}d
          </span>
          <span className="text-xs text-stone-400">#{row.original.order.id}</span>
          <ChevronDown className="h-4 w-4 text-stone-400" />
        </button>
      )
    },
    {
      header: "Customer",
      accessorFn: (row) => row.order.customer_name ?? "",
      cell: ({ row }) => (
        <div className="min-w-44">
          <div className="text-sm font-bold">{row.original.order.customer_name || "No name"}</div>
          <div className="truncate text-xs text-stone-500">{row.original.order.address || row.original.order.state}</div>
        </div>
      )
    },
    {
      header: "Item",
      accessorKey: "name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.image_url ? (
            <img className="h-10 w-10 rounded-md border border-timber-line object-cover" src={row.original.image_url} alt="" />
          ) : (
            <div className="h-10 w-10 rounded-md bg-timber-tan" />
          )}
          <div>
            <div className="max-w-80 truncate text-sm font-semibold">{row.original.name}</div>
            <div className="text-xs text-stone-500">Qty {row.original.quantity}</div>
          </div>
        </div>
      )
    },
    {
      header: "Contact",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <a className="rounded-md border border-timber-line p-2 text-green-600" href={whatsappUrl(row.original.order.phone, row.original.order.customer_name, row.original.order.id)} target="_blank">
            <MessageCircle className="h-4 w-4" />
          </a>
          {row.original.order.phone ? (
            <a className="rounded-md border border-timber-line p-2 text-stone-600" href={`tel:${row.original.order.phone}`}>
              <Phone className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      )
    },
    {
      header: "Phase",
      accessorKey: "phase",
      cell: ({ row }) => (
        <select
          className="w-44 rounded-md border border-timber-line bg-white px-2 py-1 text-sm"
          value={row.original.phase}
          onChange={(event) => phaseMutation.mutate({ itemId: row.original.id, nextPhase: event.target.value })}
        >
          {PHASES.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
      )
    }
  ], [phaseMutation]);

  const table = useReactTable({
    data: rows.filter((row) => row.phase === phase),
    columns,
    state: { globalFilter: query },
    onGlobalFilterChange: setQuery,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel()
  });

  return (
    <div>
      <nav className="sticky top-[51px] z-20 flex gap-1 overflow-x-auto border-b border-timber-line bg-white px-3 py-2">
        {PHASES.map((name) => (
          <button
            key={name}
            className={[
              "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs font-bold",
              name === phase ? "bg-timber-brown text-white" : "text-stone-500 hover:bg-timber-tan"
            ].join(" ")}
            onClick={() => setPhase(name)}
          >
            {name}
            <span className={name === phase ? "text-white" : "text-timber-brown"}>{phaseCounts[name] ?? 0}</span>
          </button>
        ))}
      </nav>

      <section className="sticky top-[102px] z-10 flex items-center gap-3 border-b border-timber-line bg-white px-4 py-3">
        <Search className="h-4 w-4 text-stone-400" />
        <input
          className="w-full bg-transparent text-sm outline-none"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search order, customer, phone, product..."
        />
      </section>

      <section className="p-3">
        <div className="overflow-x-auto rounded-lg border border-timber-line bg-white">
          <table className="w-full min-w-[920px] border-collapse text-left">
            <thead className="bg-timber-paper text-xs uppercase text-stone-500">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="border-b border-timber-line px-3 py-2 font-bold">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {ordersQuery.isLoading ? (
                <tr><td className="px-3 py-10 text-center text-sm text-stone-500" colSpan={columns.length}>Loading orders...</td></tr>
              ) : table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-timber-line align-top last:border-b-0">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      {cell.column.id === "customer_name" && expanded[row.original.order.id] && row.original.order.customer_note ? (
                        <div className="mt-2 rounded-md bg-timber-tan p-2 text-xs text-stone-600">{row.original.order.customer_note}</div>
                      ) : null}
                    </td>
                  ))}
                </tr>
              )) : (
                <tr><td className="px-3 py-10 text-center text-sm text-stone-500" colSpan={columns.length}>No items in this phase.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
