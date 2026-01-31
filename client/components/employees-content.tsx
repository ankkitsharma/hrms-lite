"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ErrorState } from "@/components/error-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  useCreateEmployee,
  useDeleteEmployee,
  useEmployees,
  useUpdateEmployee,
} from "@/hooks/use-employees";
import type { Employee, EmployeeCreate } from "@/types";
import { ListFilter as Filter } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const FILTER_DEBOUNCE_MS = 300;

type EmployeeFilterColumn = "name" | "email" | "dept";

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
const DEFAULT_LIMIT = 10;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmployeesContent() {
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [offset, setOffset] = useState(0);
  const [nameFilter, setNameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const debouncedName = useDebouncedValue(nameFilter, FILTER_DEBOUNCE_MS);
  const debouncedEmail = useDebouncedValue(emailFilter, FILTER_DEBOUNCE_MS);
  const debouncedDept = useDebouncedValue(deptFilter, FILTER_DEBOUNCE_MS);

  const {
    data: listData,
    isLoading,
    error,
    refetch,
  } = useEmployees({
    limit,
    offset,
    name: debouncedName || undefined,
    email: debouncedEmail || undefined,
    dept: debouncedDept || undefined,
  });
  const employees = listData?.items;
  const total = listData?.total ?? 0;
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();
  const [open, setOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState<EmployeeCreate>({
    name: "",
    email: "",
    dept: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [openFilterColumn, setOpenFilterColumn] =
    useState<EmployeeFilterColumn | null>(null);
  const filterHeaderRef = useRef<HTMLTableSectionElement>(null);

  useEffect(() => {
    if (!openFilterColumn) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        filterHeaderRef.current &&
        !filterHeaderRef.current.contains(e.target as Node)
      ) {
        setOpenFilterColumn(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openFilterColumn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.name.trim()) {
      setFormError("Full name is required");
      return;
    }
    if (!form.email.trim()) {
      setFormError("Email is required");
      return;
    }
    if (!emailRegex.test(form.email)) {
      setFormError("Please enter a valid email address");
      return;
    }
    if (!form.dept.trim()) {
      setFormError("Department is required");
      return;
    }
    try {
      await createMutation.mutateAsync(form);
      setForm({ name: "", email: "", dept: "" });
      setOpen(false);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to add employee",
      );
    }
  };

  const handleEditOpen = (emp: Employee) => {
    setEditEmployee(emp);
    setForm({ name: emp.name, email: emp.email, dept: emp.dept });
    setFormError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEmployee) return;
    setFormError(null);
    if (!form.name.trim()) {
      setFormError("Full name is required");
      return;
    }
    if (!form.email.trim()) {
      setFormError("Email is required");
      return;
    }
    if (!emailRegex.test(form.email)) {
      setFormError("Please enter a valid email address");
      return;
    }
    if (!form.dept.trim()) {
      setFormError("Department is required");
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id: editEmployee.id,
        data: form,
      });
      setEditEmployee(null);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Failed to update employee",
      );
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const wasOnlyItemOnPage = (employees?.length ?? 0) === 1;
      await deleteMutation.mutateAsync(id);
      if (wasOnlyItemOnPage && offset > 0) {
        setOffset((prev) => Math.max(0, prev - limit));
      }
    } catch {
      // Error handled by mutation state / toast could be added
    }
  };

  if (error) {
    return <ErrorState message={error.message} onRetry={() => refetch()} />;
  }

  const isEmpty = employees?.length === 0 && offset === 0;
  const hasFilters = !!(nameFilter || emailFilter || deptFilter);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>All employees</CardTitle>
          <CardDescription>List of registered employees</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setNameFilter("");
                setEmailFilter("");
                setDeptFilter("");
                setOffset(0);
              }}
            >
              Clear filters
            </Button>
          )}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Add employee</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Add employee</DialogTitle>
                  <DialogDescription>
                    Enter employee details. Employee ID will be assigned
                    automatically.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      placeholder="john@company.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="dept">Department</Label>
                    <Input
                      id="dept"
                      value={form.dept}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, dept: e.target.value }))
                      }
                      placeholder="Engineering"
                    />
                  </div>
                  {formError && (
                    <p className="text-sm text-destructive">{formError}</p>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Adding…" : "Add employee"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog
            open={editEmployee !== null}
            onOpenChange={(open) => !open && setEditEmployee(null)}
          >
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleEditSubmit}>
                <DialogHeader>
                  <DialogTitle>Edit employee</DialogTitle>
                  <DialogDescription>Update employee details</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">Full name</Label>
                    <Input
                      id="edit-name"
                      value={form.name}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, email: e.target.value }))
                      }
                      placeholder="john@company.com"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-dept">Department</Label>
                    <Input
                      id="edit-dept"
                      value={form.dept}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, dept: e.target.value }))
                      }
                      placeholder="Engineering"
                    />
                  </div>
                  {formError && (
                    <p className="text-sm text-destructive">{formError}</p>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditEmployee(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Saving…" : "Save changes"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader ref={filterHeaderRef}>
            <TableRow>
              <TableHead className="relative">
                <div className="flex items-center gap-1">
                  <span>Name</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() =>
                      setOpenFilterColumn((c) => (c === "name" ? null : "name"))
                    }
                    title="Filter by name"
                  >
                    <Filter
                      className={`h-3.5 w-3.5 ${nameFilter ? "text-primary" : ""}`}
                    />
                  </Button>
                  {openFilterColumn === "name" && (
                    <div className="absolute left-0 top-full z-10 mt-1 rounded-md border bg-popover p-2 shadow-md">
                      <Input
                        placeholder="Filter name…"
                        value={nameFilter}
                        onChange={(e) => {
                          setNameFilter(e.target.value);
                          setOffset(0);
                        }}
                        className="h-8 w-44"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              </TableHead>
              <TableHead className="relative">
                <div className="flex items-center gap-1">
                  <span>Email</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() =>
                      setOpenFilterColumn((c) =>
                        c === "email" ? null : "email",
                      )
                    }
                    title="Filter by email"
                  >
                    <Filter
                      className={`h-3.5 w-3.5 ${emailFilter ? "text-primary" : ""}`}
                    />
                  </Button>
                  {openFilterColumn === "email" && (
                    <div className="absolute left-0 top-full z-10 mt-1 rounded-md border bg-popover p-2 shadow-md">
                      <Input
                        placeholder="Filter email…"
                        value={emailFilter}
                        onChange={(e) => {
                          setEmailFilter(e.target.value);
                          setOffset(0);
                        }}
                        className="h-8 w-44"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              </TableHead>
              <TableHead className="relative">
                <div className="flex items-center gap-1">
                  <span>Department</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() =>
                      setOpenFilterColumn((c) => (c === "dept" ? null : "dept"))
                    }
                    title="Filter by department"
                  >
                    <Filter
                      className={`h-3.5 w-3.5 ${deptFilter ? "text-primary" : ""}`}
                    />
                  </Button>
                  {openFilterColumn === "dept" && (
                    <div className="absolute left-0 top-full z-10 mt-1 rounded-md border bg-popover p-2 shadow-md">
                      <Input
                        placeholder="Filter dept…"
                        value={deptFilter}
                        onChange={(e) => {
                          setDeptFilter(e.target.value);
                          setOffset(0);
                        }}
                        className="h-8 w-44"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              </TableHead>
              <TableHead className="w-[180px]">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <>
                {Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-5 w-32 rounded-md" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-44 rounded-md" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24 rounded-md" />
                    </TableCell>
                    <TableCell className="w-[180px]">
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-14 rounded-md" />
                        <Skeleton className="h-8 w-16 rounded-md" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ) : isEmpty ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="font-medium">
                      {hasFilters
                        ? "No employees match filters"
                        : "No employees yet"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {hasFilters
                        ? "Try different filters or add an employee"
                        : "Add your first employee to get started"}
                    </p>
                    {hasFilters ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setNameFilter("");
                          setEmailFilter("");
                          setDeptFilter("");
                          setOffset(0);
                        }}
                      >
                        Clear filters
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => setOpen(true)}>
                        Add employee
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              employees?.map((emp) => (
                <TableRow key={emp.id}>
                  <TableCell className="font-medium">{emp.name}</TableCell>
                  <TableCell>{emp.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{emp.dept}</Badge>
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditOpen(emp)}
                    >
                      Edit
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete employee</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {emp.name}? This
                            will also remove their attendance records.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => handleDelete(emp.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {!isLoading &&
          !isEmpty &&
          total > 10 &&
          (offset > 0 || (employees?.length ?? 0) > 0) && (
            <div className="flex items-center justify-between border-t pt-4 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Rows per page
                </span>
                <Select
                  value={String(limit)}
                  onValueChange={(v) => {
                    setLimit(Number(v));
                    setOffset(0);
                  }}
                >
                  <SelectTrigger className="w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Page {Math.floor(offset / limit) + 1} of{" "}
                  {Math.ceil(total / limit) || 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={offset === 0}
                  onClick={() => setOffset((o) => Math.max(0, o - limit))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={offset + (employees?.length ?? 0) >= total}
                  onClick={() => setOffset((o) => o + limit)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
