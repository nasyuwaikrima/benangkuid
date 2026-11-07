import Link from "next/link";
import { Home, LifeBuoy } from "lucide-react";
import SiteFooter from "@/components/SiteFooter";

export const metadata = { title: "Halaman tidak ditemukan" };

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="text-6xl font-extrabold text-blue-500">404</p>
        <h1 className="mt-4 text-2xl font-bold text-white">Halaman tidak ditemukan</h1>
        <p className="mt-2 max-w-sm text-sm text-slate-400">
          Alamat yang kamu buka tidak ada atau sudah dipindahkan.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500">
            <Home className="h-4 w-4" /> Ke beranda
          </Link>
          <Link href="/bantuan" className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-800 bg-slate-900 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800">
            <LifeBuoy className="h-4 w-4" /> Pusat bantuan
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
