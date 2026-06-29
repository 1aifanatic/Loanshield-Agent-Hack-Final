import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import { caseStages, normalizeCaseStage } from "@/lib/stages";
import { cn } from "@/lib/utils";

export const stages = caseStages;

export function StageStepper({
  currentStage,
  completedStages = [],
  status,
}: {
  currentStage?: string | null;
  completedStages?: string[];
  status?: string | null;
}) {
  const normalizedCurrentStage = normalizeCaseStage(currentStage);
  const completedSet = new Set(
    completedStages
      .map((stage) => normalizeCaseStage(stage))
      .filter((stage): stage is (typeof stages)[number] => Boolean(stage)),
  );
  const currentIndex = Math.max(
    0,
    stages.findIndex((stage) => stage === normalizedCurrentStage),
  );
  const lastCompletedIndex = stages.reduce(
    (max, stage, index) => (completedSet.has(stage) ? Math.max(max, index) : max),
    -1,
  );
  const activeIndex =
    status === "closed"
      ? stages.length - 1
      : Math.max(currentIndex, Math.min(lastCompletedIndex + 1, stages.length - 1));

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stages.map((stage, index) => {
        const done =
          status === "closed" || completedSet.has(stage) || index < activeIndex;
        const active = !done && index === activeIndex;
        const Icon = done ? CheckCircle2 : active ? Loader2 : Circle;

        return (
          <div
            key={stage}
            className={cn(
              "flex min-h-16 items-center gap-3 rounded-lg border bg-white px-4 py-3",
              done && "border-emerald-200 bg-emerald-50",
              active && "border-teal-300 bg-teal-50",
              !done && !active && "border-slate-200",
            )}
          >
            <Icon
              className={cn(
                "size-5 shrink-0",
                done && "text-emerald-700",
                active && "text-teal-700",
                !done && !active && "text-slate-400",
                active && "animate-spin",
              )}
              aria-hidden
            />
            <div>
              <p className="text-sm font-semibold text-slate-950">{stage}</p>
              <p className="text-xs text-slate-500">
                {done ? "Completed" : active ? "Active" : "Waiting"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
