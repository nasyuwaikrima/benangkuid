'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Save } from 'lucide-react';
import { updateShopProfile } from '@/app/dashboard/actions';

type Props = { ownerName: string; shopName: string; whatsapp: string };

const input =
  'w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30';

export default function ProfileEditForm({ ownerName, shopName, whatsapp }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const data = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await updateShopProfile(data);
      if (!res.success) return setError(res.error ?? 'Gagal menyimpan.');
      router.push('/dashboard/profile');
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-slate-800 bg-[#161F30] p-5 md:p-6">
      <div>
        <label htmlFor="owner_name" className="mb-1.5 block text-xs font-semibold text-slate-300">Nama pemilik</label>
        <input id="owner_name" name="owner_name" defaultValue={ownerName} required minLength={2} maxLength={100} className={input} />
      </div>
      <div>
        <label htmlFor="shop_name" className="mb-1.5 block text-xs font-semibold text-slate-300">Nama toko</label>
        <input id="shop_name" name="shop_name" defaultValue={shopName} required minLength={3} maxLength={100} className={input} />
      </div>
      <div>
        <label htmlFor="whatsapp_number" className="mb-1.5 block text-xs font-semibold text-slate-300">Nomor WhatsApp bisnis</label>
        <input
          id="whatsapp_number"
          name="whatsapp_number"
          defaultValue={whatsapp}
          required
          inputMode="tel"
          placeholder="081234567890"
          className={input}
        />
        <p className="mt-1.5 text-[11px] text-slate-500">Format: 08xxxxxxxxxx atau 628xxxxxxxxxx</p>
      </div>

      {error && (
        <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      <div className="flex items-center justify-end gap-3 pt-1">
        <Link href="/dashboard/profile" className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white">
          Batal
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Simpan perubahan
        </button>
      </div>
    </form>
  );
}
