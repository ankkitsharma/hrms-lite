import { EmployeesContent } from "@/components/employees-content";

export default function EmployeesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Employees</h1>
        <p className="text-muted-foreground mt-1">Manage employee records</p>
      </div>
      <EmployeesContent />
    </div>
  );
}
