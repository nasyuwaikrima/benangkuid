"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { SITE } from "@/config/site";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center text-slate-100">
      <h1 className="text-2xl font-bold text-white">Ups, ada yang tidak beres</h1>
      <p className="mt-2 max-w-sm text-sm text-slate-400">
        Terjadi kendala di sisi kami. Coba muat ulang. Kalau masih berlanjut, hubungi{" "}
        <a href={`mailto:${SITE.email}`} className="text-blue-400 hover:underline">{SITE.email}</a>
        {error.digest ? ` dan sebutkan kode ${error.digest}` : ""}.
      </p>
      <div className="mt-6 flex gap-3">
        <button onClick={reset} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500">
          <RotateCcw className="h-4 w-4" /> Coba lagi
        </button>
        <Link href="/" className="rounded-lg border border-slate-800 bg-slate-900 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800">
          Beranda
        </Link>
      </div>
    </div>
  );
}
