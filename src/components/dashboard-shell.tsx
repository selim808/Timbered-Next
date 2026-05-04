import Image from "next/image";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-timber-line bg-white px-4 py-3">
        <Image
          src="https://timberedgroup.com/wp-content/uploads/2024/04/Asset-14.png"
          alt="Timbered"
          width={94}
          height={26}
          priority
        />
        <div className="text-sm font-bold text-timber-brown">Order Pipeline</div>
        <div className="ml-auto rounded-full bg-timber-tan px-3 py-1 text-xs font-bold text-timber-brown">
          Supabase live
        </div>
      </header>
      {children}
    </main>
  );
}
