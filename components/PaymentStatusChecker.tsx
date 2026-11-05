'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  invoiceId: string;
  status: string;
}

export default function PaymentStatusChecker({ invoiceId, status }: Props) {
  const router = useRouter();

  useEffect(() => {
    // Jika status sudah paid, tidak perlu polling
    if (status === 'paid') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/check?id=${invoiceId}`);
        const data = await res.json();

        if (data.status === 'paid') {
          clearInterval(interval);
          router.refresh(); // Refresh Halaman untuk menampilkan status Berhasil
        }
      } catch (error) {
        console.error('Auto check error:', error);
      }
    }, 5000); // Cek tiap 5 detik

    return () => clearInterval(interval);
  }, [invoiceId, status, router]);

  return null;
}
