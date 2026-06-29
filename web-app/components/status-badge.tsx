import { Badge } from "@/components/ui/badge";
import { humanize } from "@/lib/format";

export function StatusBadge({ value }: { value?: string | null }) {
  const normalized = value ?? "unknown";
  const variant =
    normalized.includes("closed") || normalized.includes("sent")
      ? "green"
      : normalized.includes("pending") || normalized.includes("review")
        ? "amber"
        : normalized.includes("failed") || normalized.includes("risk")
          ? "rose"
          : normalized.includes("progress") || normalized.includes("submitted")
            ? "teal"
            : "neutral";

  return <Badge variant={variant}>{humanize(normalized)}</Badge>;
}
