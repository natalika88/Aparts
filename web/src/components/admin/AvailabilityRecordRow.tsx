"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { deleteAvailabilityRecord } from "@/app/admin/pricing/actions";

export function AvailabilityRecordRow({
  id,
  propertyId,
  dateStart,
  dateEnd,
  status,
  canDelete,
}: {
  id: string;
  propertyId: string;
  dateStart: Date;
  dateEnd: Date;
  status: string;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <li className="flex flex-wrap items-center justify-between gap-2 py-2">
      <span>
        {format(dateStart, "dd.MM.yyyy")} — {format(dateEnd, "dd.MM.yyyy")}
      </span>
      <span className="flex items-center gap-2">
        <span className="rounded-full bg-slate-100 px-2 text-xs">{status}</span>
        {canDelete ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (!confirm("Удалить запись?")) return;
              startTransition(async () => {
                await deleteAvailabilityRecord(id, propertyId);
                router.refresh();
              });
            }}
            className="text-xs text-red-700 underline disabled:opacity-50"
          >
            Удалить
          </button>
        ) : null}
      </span>
    </li>
  );
}
