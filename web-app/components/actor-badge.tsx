import {
  Bot,
  CircleUser,
  Cpu,
  Globe2,
  UserCheck,
  Webhook,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { humanize } from "@/lib/format";

const actorIcons: Record<string, LucideIcon> = {
  customer: CircleUser,
  portal: Globe2,
  webhook: Webhook,
  uipath: Cpu,
  agent: Bot,
  robot: Wrench,
  human: UserCheck,
  system: Cpu,
};

export function ActorBadge({ actor }: { actor?: string | null }) {
  const value = actor ?? "system";
  const Icon = actorIcons[value] ?? Cpu;
  return (
    <Badge variant="indigo" className="gap-1.5">
      <Icon className="size-3.5" aria-hidden />
      {humanize(value)}
    </Badge>
  );
}
