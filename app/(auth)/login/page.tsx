'use client';

import { createClient } from '@/lib/supabase/client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

function AuthErrorAlert() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const error = params.get('error');
    if (!error) return;

    alert(
      `Login gagal (${error})\n\n${params.get('message') ?? 'Tidak ada detail'}`
    );

    // Bersihkan query supaya alert tidak muncul lagi saat refresh
    router.replace(pathname);
  }, [params, router, pathname]);

  return null;
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    // Kalau sukses, browser langsung pindah ke Google.
    // Kalau gagal, tampilkan errornya dan aktifkan tombol lagi.
    if (error) {
      console.error('[login] signInWithOAuth gagal:', error);
      alert(`Gagal memulai login Google\n\n${error.name}: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <Suspense fallback={null}>
        <AuthErrorAlert />
      </Suspense>

      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 text-center space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">benangku.id</h1>
          <p className="text-slate-500 text-sm mt-1">
            Aplikasi Manajemen Penjahit & Konveksi
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white font-medium py-3 rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
        >
          {loading ? 'Menghubungkan...' : 'Masuk dengan Google'}
        </button>
      </div>
    </div>
  );
}