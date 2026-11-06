'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Download, RefreshCw, Copy, Check, QrCode } from 'lucide-react';
import { Subscription } from '@/types/database';

interface QrisCardProps {
  transaction: Subscription;
  formattedAmount: string;
}

export default function QrisCardClient({ transaction, formattedAmount }: QrisCardProps) {
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [copied, setCopied] = useState(false);

  // 1. Fungsi Unduh Gambar QRIS
  const handleDownloadQris = async () => {
    if (!transaction.qris_image) return;
    setDownloading(true);
    try {
      const response = await fetch(transaction.qris_image);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `QRIS-Benangku-${transaction.invoice_id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Gagal mengunduh QRIS:', err);
      // Fallback: Buka gambar di tab baru jika CORS memblokir blob download
      window.open(transaction.qris_image, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  // 2. Fungsi Cek Status Manual (Refresh Data Server)
  const handleManualCheck = () => {
    setChecking(true);
    router.refresh();
    setTimeout(() => {
      setChecking(false);
    }, 1000);
  };

  // 3. Fungsi Salin Invoice ID
  const handleCopyInvoice = () => {
    navigator.clipboard.writeText(transaction.invoice_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-6">
      {/* Box Gambar QRIS */}
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative p-4 bg-white rounded-2xl shadow-xl border-4 border-slate-800 group">
          <img
            src={transaction.qris_image!}
            alt={`QRIS Invoice ${transaction.invoice_id}`}
            className="w-64 h-64 md:w-72 md:h-72 object-contain mx-auto"
          />
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
            <button
              onClick={handleDownloadQris}
              disabled={downloading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-lg flex items-center gap-2 transition"
            >
              <Download className="w-4 h-4" />
              <span>Simpan Gambar</span>
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center max-w-xs leading-relaxed">
          Pindai QRIS dengan aplikasi <span className="text-white font-medium">m-Banking</span> atau{' '}
          <span className="text-white font-medium">e-Wallet</span> (GoPay, OVO, ShopeePay, Dana, LinkAja).
        </p>
      </div>

      {/* Tombol Aksi: Download QRIS & Cek Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        <button
          onClick={handleDownloadQris}
          disabled={downloading}
          className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700/80 flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-blue-400" />
          <span>{downloading ? 'Mengunduh...' : 'Unduh Gambar QRIS'}</span>
        </button>

        <button
          onClick={handleManualCheck}
          disabled={checking}
          className="w-full py-3 px-4 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-bold text-xs rounded-xl border border-blue-500/30 flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin' : ''}`} />
          <span>{checking ? 'Mengecek Status...' : 'Cek Status Pembayaran'}</span>
        </button>
      </div>

      {/* Salin ID Invoice */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
        <span>No. Tagihan:</span>
        <button
          onClick={handleCopyInvoice}
          className="flex items-center gap-1.5 font-mono text-slate-300 hover:text-white transition"
        >
          <span>#{transaction.invoice_id}</span>
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-slate-500" />
          )}
        </button>
      </div>
    </div>
  );
}
