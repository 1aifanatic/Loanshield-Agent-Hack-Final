import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { formatDateTime, formatMoney, humanize } from "@/lib/format";
import type { DisputeRecord } from "@/lib/store";

export function DisputeTable({ disputes }: { disputes: DisputeRecord[] }) {
  if (disputes.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="font-semibold text-slate-950">No disputes yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Launch a demo scenario or create one manually.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
            <tr>
              <th className="px-4 py-3">Dispute</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Loan</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Stage</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">SLA</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3" aria-label="Open" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {disputes.map((dispute) => (
              <tr key={dispute.externalDisputeId} className="hover:bg-slate-50">
                <td className="px-4 py-4">
                  <p className="font-semibold text-slate-950">
                    {dispute.externalDisputeId}
                  </p>
                  <p className="text-xs text-slate-500">
                    {humanize(dispute.disputeType)}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <p className="font-medium text-slate-900">
                    {dispute.customerName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {dispute.customerSegment}
                  </p>
                </td>
                <td className="px-4 py-4">
                  <p>{humanize(dispute.loanType)}</p>
                  <p className="text-xs text-slate-500">{dispute.loanIdMasked}</p>
                </td>
                <td className="px-4 py-4 font-medium">
                  {formatMoney(dispute.disputedAmount)}
                </td>
                <td className="px-4 py-4">{dispute.currentStage}</td>
                <td className="px-4 py-4">
                  <StatusBadge value={dispute.status} />
                </td>
                <td className="px-4 py-4">
                  <StatusBadge value={dispute.slaStatus} />
                </td>
                <td className="px-4 py-4 text-slate-500">
                  {formatDateTime(dispute.updatedAt)}
                </td>
                <td className="px-4 py-4">
                  <Link
                    href={`/disputes/${dispute.externalDisputeId}`}
                    className="inline-flex size-9 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                    aria-label={`Open ${dispute.externalDisputeId}`}
                  >
                    <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
