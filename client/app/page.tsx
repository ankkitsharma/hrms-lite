import { DashboardContent } from "@/components/dashboard-content";

export default function Home() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of employees and attendance
        </p>
      </div>
      <DashboardContent />
    </div>
  );
}
