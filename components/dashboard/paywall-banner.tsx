export function PaywallBanner() {
  return (
    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h3 className="font-semibold text-amber-900 text-sm">
          ⚠️ Masa Sewa / Trial Anda Telah Berakhir
        </h3>
        <p className="text-xs text-amber-700 mt-0.5">
          Fitur input dan edit antrean dikunci sementara. Perpanjang sewa toko Anda hanya Rp20.000/bulan untuk melanjutkan.
        </p>
      </div>
      <a
        href="https://wa.me/6281234567890?text=Halo%20Admin%20benangku.id,%20saya%20ingin%20perpanjang%20sewa%20toko"
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition whitespace-nowrap"
      >
        Hubungi Admin WA
      </a>
    </div>
  );
}
