import { DashboardShell } from "@/components/dashboard-shell";
import { OrdersDashboard } from "@/components/orders-dashboard";

export default function Home() {
  return (
    <DashboardShell>
      <OrdersDashboard />
    </DashboardShell>
  );
}
