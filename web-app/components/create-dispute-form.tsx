"use client";

import type { FormEvent, ReactNode } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  customerSegments,
  disputeTypes,
  initialEventTypes,
  loanTypes,
  priorities,
} from "@/lib/validators";
import { humanize } from "@/lib/format";

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputClass =
  "h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100";

export function CreateDisputeForm() {
  const router = useRouter();
  const [hasEvidence, setHasEvidence] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const formData = new FormData(event.currentTarget);
    const evidence = hasEvidence
      ? [
          {
            documentType: String(formData.get("documentType") || "bank_statement"),
            fileName: String(formData.get("fileName") || "evidence.pdf"),
            description: String(formData.get("evidenceDescription") || ""),
          },
        ]
      : [];

    const payload = {
      eventType: formData.get("eventType"),
      disputeType: formData.get("disputeType"),
      customerName: formData.get("customerName"),
      customerSegment: formData.get("customerSegment"),
      vulnerableCustomerFlag: formData.get("vulnerableCustomerFlag") === "on",
      loanType: formData.get("loanType"),
      loanIdMasked: formData.get("loanIdMasked"),
      transactionId: formData.get("transactionId"),
      disputedAmount: Number(formData.get("disputedAmount")),
      currency: "USD",
      priority: formData.get("priority"),
      narrative: formData.get("narrative"),
      hasEvidence,
      evidence,
    };

    const response = await fetch("/api/disputes", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await response.json();
    setLoading(false);
    if (!response.ok || !json.ok) {
      setError(json.error?.message ?? "Unable to create dispute");
      return;
    }
    router.push(json.data.detailUrl);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-5 lg:grid-cols-2">
      <Field label="Event type">
        <select name="eventType" className={inputClass}>
          {initialEventTypes.map((item) => (
            <option key={item} value={item}>
              {humanize(item)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Dispute type">
        <select name="disputeType" className={inputClass}>
          {disputeTypes.map((item) => (
            <option key={item} value={item}>
              {humanize(item)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Customer name">
        <input
          name="customerName"
          defaultValue="Maya Thompson"
          className={inputClass}
          required
        />
      </Field>
      <Field label="Customer segment">
        <select name="customerSegment" className={inputClass}>
          {customerSegments.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Loan type">
        <select name="loanType" className={inputClass}>
          {loanTypes.map((item) => (
            <option key={item} value={item}>
              {humanize(item)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Masked loan ID">
        <input
          name="loanIdMasked"
          defaultValue="LN-****-2049"
          className={inputClass}
          required
        />
      </Field>
      <Field label="Transaction/payment ID">
        <input
          name="transactionId"
          defaultValue="PMT-883920"
          className={inputClass}
        />
      </Field>
      <Field label="Disputed amount">
        <input
          name="disputedAmount"
          type="number"
          step="0.01"
          defaultValue="640.12"
          className={inputClass}
          required
        />
      </Field>
      <Field label="Priority">
        <select name="priority" className={inputClass}>
          {priorities.map((item) => (
            <option key={item} value={item}>
              {humanize(item)}
            </option>
          ))}
        </select>
      </Field>
      <div className="flex items-center gap-3 pt-7">
        <input
          id="vulnerableCustomerFlag"
          name="vulnerableCustomerFlag"
          type="checkbox"
          className="size-4 rounded border-slate-300 text-teal-600"
        />
        <label
          htmlFor="vulnerableCustomerFlag"
          className="text-sm font-semibold text-slate-700"
        >
          Vulnerable customer flag
        </label>
      </div>
      <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 lg:col-span-2">
        <input
          type="checkbox"
          checked={hasEvidence}
          onChange={(event) => setHasEvidence(event.target.checked)}
          className="size-4 rounded border-slate-300 text-teal-600"
        />
        <span className="text-sm font-semibold text-slate-700">
          Include initial evidence metadata
        </span>
      </label>
      {hasEvidence ? (
        <div className="grid gap-5 rounded-lg border border-slate-200 bg-white p-4 lg:col-span-2 lg:grid-cols-3">
          <Field label="Document type">
            <input
              name="documentType"
              defaultValue="bank_statement"
              className={inputClass}
            />
          </Field>
          <Field label="File name">
            <input
              name="fileName"
              defaultValue="checking_statement_june.pdf"
              className={inputClass}
            />
          </Field>
          <Field label="Evidence description">
            <input
              name="evidenceDescription"
              defaultValue="Shows two ACH debits for the same payment."
              className={inputClass}
            />
          </Field>
        </div>
      ) : null}
      <label className="block lg:col-span-2">
        <span className="text-sm font-semibold text-slate-700">Narrative</span>
        <textarea
          name="narrative"
          rows={5}
          defaultValue="Customer states the June autopay was debited twice from her checking account."
          className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          required
        />
      </label>
      {error ? (
        <p className="text-sm font-semibold text-rose-600 lg:col-span-2">
          {error}
        </p>
      ) : null}
      <div className="lg:col-span-2">
        <Button disabled={loading}>
          <Send className="size-4" aria-hidden />
          {loading ? "Creating..." : "Create and Send Webhook"}
        </Button>
      </div>
    </form>
  );
}
