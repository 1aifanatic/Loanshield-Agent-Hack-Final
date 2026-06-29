"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setLoading(true);
    setError(null);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        username: formData.get("username"),
        password: formData.get("password"),
      }),
    });
    const json = await response.json();
    setLoading(false);
    if (!response.ok || !json.ok) {
      setError(json.error?.message ?? "Unable to sign in");
      return;
    }
    router.push(searchParams.get("next") ?? "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="text-sm font-semibold text-slate-700" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          name="username"
          defaultValue="demo"
          className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          autoComplete="username"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-slate-700" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          defaultValue="demo123"
          className="mt-1 h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
          autoComplete="current-password"
        />
      </div>
      {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
      <Button className="w-full" disabled={loading}>
        <LockKeyhole className="size-4" aria-hidden />
        {loading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
