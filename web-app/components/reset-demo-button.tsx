"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ResetDemoButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function reset() {
    const token = window.prompt("Demo admin token");
    if (!token) return;
    setBusy(true);
    await fetch("/api/dev/reset", {
      method: "POST",
      headers: { "x-demo-admin-token": token },
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <Button type="button" variant="danger" onClick={reset} disabled={busy}>
      <Trash2 className="size-4" aria-hidden />
      Reset Demo Data
    </Button>
  );
}
