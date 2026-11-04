'use client';

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl p-6 text-center space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">benangku.id</h1>
          <p className="text-slate-500 text-sm mt-1">Aplikasi Manajemen Penjahit & Konveksi</p>
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
