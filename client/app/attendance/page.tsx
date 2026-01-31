import { AttendanceContent } from "@/components/attendance-content";

export default function AttendancePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground mt-1">
          Mark and view daily attendance
        </p>
      </div>
      <AttendanceContent />
    </div>
  );
}
