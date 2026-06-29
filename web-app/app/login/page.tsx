import Image from "next/image";
import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[1fr_0.9fr]">
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            Demo access
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
            LoanShield Demo Portal
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Basic username and password protection for the hackathon demo.
          </p>
          <div className="mt-8">
            <Suspense fallback={<p className="text-sm text-slate-500">Loading...</p>}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </section>
      <section className="relative hidden overflow-hidden lg:block">
        <Image
          src="/loanshield-hero.png"
          alt="LoanShield dashboard"
          fill
          className="object-cover"
          sizes="50vw"
          priority
        />
        <div className="absolute inset-0 bg-slate-950/30" />
      </section>
    </main>
  );
}
