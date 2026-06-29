import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { DisputeDetailClient } from "@/components/dispute-detail-client";
import { getDisputeBundle } from "@/lib/store";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ externalDisputeId: string }>;
};

export default async function DisputeDetailPage({ params }: PageProps) {
  const { externalDisputeId } = await params;
  const bundle = await getDisputeBundle(externalDisputeId);
  if (!bundle) notFound();

  return (
    <AppShell>
      <DisputeDetailClient initialBundle={bundle} />
    </AppShell>
  );
}
