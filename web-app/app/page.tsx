import Image from "next/image";
import { ArrowRight, BellDot, FilePlus2, Webhook } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { LinkButton } from "@/components/ui/button";

const explanation = [
  {
    title: "Create dispute or scam report",
    text: "Launch synthetic cases with masked loan data and evidence metadata.",
    icon: FilePlus2,
  },
  {
    title: "Send webhook to UiPath",
    text: "The Next.js server stores the case, then calls the UiPath webhook with secrets server-side.",
    icon: Webhook,
  },
  {
    title: "Receive live stage updates",
    text: "UiPath callbacks update the case timeline, actors, evidence, decisions, and status panels.",
    icon: BellDot,
  },
];

export default function Home() {
  return (
    <AppShell>
      <div className="space-y-10">
        <section className="relative min-h-[560px] overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
          <Image
            src="/loanshield-hero.png"
            alt="LoanShield operations dashboard workstation"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1280px) 1216px, 100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.92),rgba(15,23,42,0.72),rgba(15,23,42,0.16))]" />
          <div className="relative flex min-h-[560px] max-w-3xl flex-col justify-center px-6 py-14 sm:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-200">
              UiPath Maestro Case Demo
            </p>
            <h1 className="mt-4 text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              LoanShield Demo Portal
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-100">
              External loan-dispute system for UiPath Maestro Case orchestration.
              Create synthetic disputes, trigger a secure webhook, and watch the
              case timeline update through callbacks.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href="/disputes/new">
                Create New Dispute <ArrowRight className="size-4" aria-hidden />
              </LinkButton>
              <LinkButton href="/demo" variant="secondary">
                Run Demo Scenario
              </LinkButton>
              <LinkButton href="/dashboard" variant="secondary">
                View Case Dashboard
              </LinkButton>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {explanation.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="rounded-lg border border-slate-200 bg-white p-5"
              >
                <div className="flex size-10 items-center justify-center rounded-md bg-teal-50 text-teal-700">
                  <Icon className="size-5" aria-hidden />
                </div>
                <h2 className="mt-4 text-base font-semibold text-slate-950">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
              </article>
            );
          })}
        </section>
      </div>
    </AppShell>
  );
}
