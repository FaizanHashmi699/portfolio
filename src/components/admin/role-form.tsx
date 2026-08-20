"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { updatePersonRole, type AdminActionState } from "@/server/actions/applications";
import type { PersonRole } from "@/server/repositories/types";

const INITIAL: AdminActionState = { status: "idle" };

export function RoleForm({
  personId,
  currentRole,
}: {
  personId: string;
  currentRole: PersonRole;
}) {
  const [state, action, pending] = useActionState(updatePersonRole, INITIAL);

  return (
    <form action={action} className="flex items-center gap-2">
      <input type="hidden" name="personId" value={personId} />
      <label htmlFor={`role-${personId}`} className="sr-only">
        Role
      </label>
      <Select
        id={`role-${personId}`}
        name="role"
        defaultValue={currentRole}
        className="h-9 w-36 py-1.5 text-sm"
      >
        <option value="customer">Customer</option>
        <option value="staff">Staff</option>
        <option value="admin">Admin</option>
      </Select>
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
      {state.message && (
        <span
          role={state.status === "error" ? "alert" : "status"}
          className={
            state.status === "error"
              ? "text-danger-600 dark:text-danger-500 text-xs"
              : "text-success-600 text-xs"
          }
        >
          {state.message}
        </span>
      )}
    </form>
  );
}
