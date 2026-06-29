"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

export function JsonViewer({
  label = "Payload",
  value,
}: {
  label?: string;
  value: unknown;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-950"
      >
        {open ? (
          <ChevronDown className="size-3.5" aria-hidden />
        ) : (
          <ChevronRight className="size-3.5" aria-hidden />
        )}
        {label}
      </button>
      {open ? (
        <pre className="mt-2 max-h-80 overflow-auto rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-100">
          {JSON.stringify(value, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
