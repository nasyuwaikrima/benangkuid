"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  User, 
  Phone, 
  Ruler, 
  Scissors, 
  FileText, 
  DollarSign, 
  Calendar, 
  Save, 
  Search, 
  Plus, 
  Check, 
  Image as ImageIcon,
  AlertCircle,
  Shirt,
  Sparkles
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface CustomerWithMeasurements {
  id: string;
  name: string;
  phone_number: string;
  customer_measurements?: Array<{
    id: string;
    label: string | null;
    chest: number | null;
    waist: number | null;
    hip: number | null;
    shoulder: number | null;
    sleeve: number | null;
    pants_length: number | null;
    notes: string | null;
  }>;
}

// Jenis Kategori Pakaian untuk Filter Input Ukuran Dinamis
type CategoryType = "baju" | "celana" | "setelan" | "permak_potong";

export default function NewOrderForm({
  existingCustomers,
  shopId,
}: {
  existingCustomers: CustomerWithMeasurements[];
  shopId: string;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modus Pelanggan
  const [customerMode, setCustomerMode] = useState<"existing" | "new">("new");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Form Pelanggan
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Kategori Pakaian (Untuk Menyesuaikan Form Ukuran)
  const [orderCategory, setOrderCategory] = useState<CategoryType>("baju");

  // Form Ukuran Badan (customer_measurements)
  const [measurements, setMeasurements] = useState({
    label: "Standar",
    chest: "",
    waist: "",
    hip: "",
    shoulder: "",
    sleeve: "",
    pants_length: "",
    notes: "",
  });

  // Form Pesanan (orders)
  const [orderData, setOrderData] = useState({
    item_name: "",
    service_type: "Jahit Baru",
    detail_instruksi: "",
    photo_before_url: "",
    total_biaya: "",
    dp_dibayar: "",
    tgl_deadline: "",
  });

  // Pilih Pelanggan Lama
  const handleSelectCustomer = (customer: CustomerWithMeasurements) => {
    setSelectedCustomerId(customer.id);
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone_number);

    const lastMeasurement = customer.customer_measurements?.[0];
    if (lastMeasurement) {
      setMeasurements({
        label: lastMeasurement.label || "Standar",
        chest: lastMeasurement.chest?.toString() || "",
        waist: lastMeasurement.waist?.toString() || "",
        hip: lastMeasurement.hip?.toString() || "",
        shoulder: lastMeasurement.shoulder?.toString() || "",
        sleeve: lastMeasurement.sleeve?.toString() || "",
        pants_length: lastMeasurement.pants_length?.toString() || "",
        notes: lastMeasurement.notes || "",
      });
    }
  };

  const handleResetToNewCustomer = () => {
    setSelectedCustomerId(null);
    setCustomerMode("new");
    setCustomerName("");
    setCustomerPhone("");
    setMeasurements({
      label: "Standar",
      chest: "",
      waist: "",
      hip: "",
      shoulder: "",
      sleeve: "",
      pants_length: "",
      notes: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      let finalCustomerId = selectedCustomerId;

      // 1. Simpan/Dapatkan ID Pelanggan
      if (!finalCustomerId) {
        if (!customerName || !customerPhone) {
          throw new Error("Nama dan nomor WhatsApp pelanggan wajib diisi.");
        }

        const { data: newCust, error: custErr } = await supabase
          .from("customers")
          .insert({
            shop_id: shopId,
            name: customerName,
            phone_number: customerPhone,
          })
          .select("id")
          .single();

        if (custErr) throw custErr;
        finalCustomerId = newCust.id;
      }

      // 2. Simpan Ukuran Badan (Hanya yang diisi)
      if (finalCustomerId) {
        const { error: measErr } = await supabase
          .from("customer_measurements")
          .insert({
            customer_id: finalCustomerId,
            label: measurements.label || "Standar",
            chest: (orderCategory === "baju" || orderCategory === "setelan") && measurements.chest ? parseFloat(measurements.chest) : null,
            waist: (orderCategory === "celana" || orderCategory === "baju" || orderCategory === "setelan") && measurements.waist ? parseFloat(measurements.waist) : null,
            hip: (orderCategory === "celana" || orderCategory === "setelan") && measurements.hip ? parseFloat(measurements.hip) : null,
            shoulder: (orderCategory === "baju" || orderCategory === "setelan") && measurements.shoulder ? parseFloat(measurements.shoulder) : null,
            sleeve: (orderCategory === "baju" || orderCategory === "setelan") && measurements.sleeve ? parseFloat(measurements.sleeve) : null,
            pants_length: measurements.pants_length ? parseFloat(measurements.pants_length) : null,
            notes: measurements.notes || null,
          });

        if (measErr) throw measErr;
      }

      // 3. Simpan Pesanan (orders)
      const { error: orderErr } = await supabase
        .from("orders")
        .insert({
          shop_id: shopId,
          customer_id: finalCustomerId,
          item_name: orderData.item_name,
          service_type: orderData.service_type,
          detail_instruksi: orderData.detail_instruksi,
          photo_before_url: orderData.photo_before_url || null,
          total_biaya: parseFloat(orderData.total_biaya) || 0,
          dp_dibayar: parseFloat(orderData.dp_dibayar) || 0,
          status_pengerjaan: "antrean",
          tgl_deadline: orderData.tgl_deadline || null,
        });

      if (orderErr) throw orderErr;

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan pesanan baru.");
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = existingCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone_number.includes(searchQuery)
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6 select-none">
      
      {/* HEADER */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
          Tambah Pesanan Baru
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Formulir dinamis sesuai kebutuhan jenis pesanan penjahit.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs md:text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* SECTION 1: PELANGGAN */}
      <div className="bg-[#161F30] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">1. Data Pelanggan</h2>
              <p className="text-[11px] text-slate-400">Pilih pelanggan terdaftar atau buat baru</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-[#0F172A] p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setCustomerMode("new")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                customerMode === "new" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Baru
            </button>
            <button
              type="button"
              onClick={() => setCustomerMode("existing")}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                customerMode === "existing" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
              }`}
            >
              Cari Pelanggan
            </button>
          </div>
        </div>

        {customerMode === "existing" && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Cari nama atau nomor WhatsApp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#0F172A] border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
              />
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((cust) => {
                  const isSelected = selectedCustomerId === cust.id;
                  return (
                    <div
                      key={cust.id}
                      onClick={() => handleSelectCustomer(cust)}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition ${
                        isSelected
                          ? "bg-blue-600/15 border-blue-500/50 text-white"
                          : "bg-[#0F172A]/60 border-slate-800/80 hover:border-slate-700 text-slate-300"
                      }`}
                    >
                      <div>
                        <h4 className="text-xs font-bold">{cust.name}</h4>
                        <span className="text-[11px] text-slate-400">{cust.phone_number}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-500 text-center py-3">Pelanggan tidak ditemukan.</p>
              )}
            </div>

            {selectedCustomerId && (
              <button
                type="button"
                onClick={handleResetToNewCustomer}
                className="text-xs text-blue-400 hover:underline flex items-center gap-1 pt-1"
              >
                <Plus className="w-3.5 h-3.5" /> Buat Pelanggan Baru
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" /> Nama Pelanggan *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Pak Slamet / Bu Rina"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              disabled={customerMode === "existing" && !!selectedCustomerId}
              className="w-full bg-[#0F172A] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition disabled:opacity-60"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" /> Nomor WhatsApp *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: 081234567890"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              disabled={customerMode === "existing" && !!selectedCustomerId}
              className="w-full bg-[#0F172A] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition disabled:opacity-60"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: PEMILIHAN KATEGORI PESANAN (MENU DINAMIS) */}
      <div className="bg-[#161F30] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3">
          <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Shirt className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">2. Kategori Pesanan & Form Ukuran Dinamis</h2>
            <p className="text-[11px] text-slate-400">Pilih jenis pakaian agar kolom ukuran menyesuaikan</p>
          </div>
        </div>

        {/* SELECTOR KATEGORI PAKAIAN */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => {
              setOrderCategory("baju");
              setOrderData({ ...orderData, service_type: "Jahit Baru" });
            }}
            className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
              orderCategory === "baju"
                ? "bg-blue-600/15 border-blue-500 text-white shadow-md"
                : "bg-[#0F172A] border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="text-xs font-bold block">👕 Atasan / Baju</span>
            <span className="text-[10px] text-slate-500 mt-1">Kemeja, Kaos, Blouse</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setOrderCategory("celana");
              setOrderData({ ...orderData, service_type: "Jahit Baru" });
            }}
            className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
              orderCategory === "celana"
                ? "bg-blue-600/15 border-blue-500 text-white shadow-md"
                : "bg-[#0F172A] border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="text-xs font-bold block">👖 Bawahan / Celana</span>
            <span className="text-[10px] text-slate-500 mt-1">Celana, Rok, Short</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setOrderCategory("setelan");
              setOrderData({ ...orderData, service_type: "Jahit Baru" });
            }}
            className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
              orderCategory === "setelan"
                ? "bg-blue-600/15 border-blue-500 text-white shadow-md"
                : "bg-[#0F172A] border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="text-xs font-bold block">👗 Setelan / Gamis / Jas</span>
            <span className="text-[10px] text-slate-500 mt-1">Ukuran Lengkap Badan</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setOrderCategory("permak_potong");
              setOrderData({ ...orderData, service_type: "Permak / Alterasi" });
            }}
            className={`p-3 rounded-xl border text-left flex flex-col justify-between transition ${
              orderCategory === "permak_potong"
                ? "bg-blue-600/15 border-blue-500 text-white shadow-md"
                : "bg-[#0F172A] border-slate-800 text-slate-400 hover:text-slate-200"
            }`}
          >
            <span className="text-xs font-bold block">✂️ Permak Ringkas / Potong</span>
            <span className="text-[10px] text-slate-500 mt-1">Hanya Target Potong & Catatan</span>
          </button>
        </div>

        {/* INPUT UKURAN BADAN YANG ADAPTIF / DINAMIS */}
        <div className="pt-2">
          <h3 className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-1.5">
            <Ruler className="w-3.5 h-3.5 text-blue-400" />
            Kolom Ukuran ({orderCategory === "baju" ? "Atasan" : orderCategory === "celana" ? "Bawahan" : orderCategory === "setelan" ? "Ukuran Full" : "Permak Potong"})
          </h3>

          {/* JIKA PERMAK POTONG: HANYA TAMPILKAN 1 INPUT PANJANG + CATATAN */}
          {orderCategory === "permak_potong" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#0F172A] p-4 rounded-xl border border-slate-800">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Target Panjang / Potong (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="Contoh: Potong 5cm / Jadi 95cm"
                  value={measurements.pants_length}
                  onChange={(e) => setMeasurements({ ...measurements, pants_length: e.target.value })}
                  className="w-full bg-[#161F30] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300">Catatan Permak (Kelim/Lipat)</label>
                <input
                  type="text"
                  placeholder="Contoh: Kelim ori, kecilkan paha 2cm..."
                  value={measurements.notes}
                  onChange={(e) => setMeasurements({ ...measurements, notes: e.target.value })}
                  className="w-full bg-[#161F30] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>
          ) : (
            /* JIKA JAHIT ATASAN / BAWAHAN / SETELAN: TAMPILKAN HANYA YANG RELEVAN */
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {/* Lingkar Dada (Tampil di Baju & Setelan) */}
                {(orderCategory === "baju" || orderCategory === "setelan") && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Lingkar Dada (Chest)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="0.0 cm"
                      value={measurements.chest}
                      onChange={(e) => setMeasurements({ ...measurements, chest: e.target.value })}
                      className="w-full bg-[#0F172A] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                )}

                {/* Lebar Bahu (Tampil di Baju & Setelan) */}
                {(orderCategory === "baju" || orderCategory === "setelan") && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Lebar Bahu (Shoulder)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="0.0 cm"
                      value={measurements.shoulder}
                      onChange={(e) => setMeasurements({ ...measurements, shoulder: e.target.value })}
                      className="w-full bg-[#0F172A] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                )}

                {/* Panjang Lengan (Tampil di Baju & Setelan) */}
                {(orderCategory === "baju" || orderCategory === "setelan") && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Panjang Lengan (Sleeve)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="0.0 cm"
                      value={measurements.sleeve}
                      onChange={(e) => setMeasurements({ ...measurements, sleeve: e.target.value })}
                      className="w-full bg-[#0F172A] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                )}

                {/* Lingkar Pinggang (Tampil di Celana, Baju & Setelan) */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">Lingkar Pinggang (Waist)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0.0 cm"
                    value={measurements.waist}
                    onChange={(e) => setMeasurements({ ...measurements, waist: e.target.value })}
                    className="w-full bg-[#0F172A] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>

                {/* Lingkar Pinggul (Tampil di Celana & Setelan) */}
                {(orderCategory === "celana" || orderCategory === "setelan") && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-400">Lingkar Pinggul (Hip)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="0.0 cm"
                      value={measurements.hip}
                      onChange={(e) => setMeasurements({ ...measurements, hip: e.target.value })}
                      className="w-full bg-[#0F172A] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                    />
                  </div>
                )}

                {/* Panjang Baju / Celana */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-400">
                    Panjang {orderCategory === "celana" ? "Celana/Rok" : orderCategory === "baju" ? "Baju" : "Pakaian"}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0.0 cm"
                    value={measurements.pants_length}
                    onChange={(e) => setMeasurements({ ...measurements, pants_length: e.target.value })}
                    className="w-full bg-[#0F172A] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400">Catatan Khusus Ukuran</label>
                <input
                  type="text"
                  placeholder="Contoh: Pinggang agak longgar, lingkar ketiak agak lega..."
                  value={measurements.notes}
                  onChange={(e) => setMeasurements({ ...measurements, notes: e.target.value })}
                  className="w-full bg-[#0F172A] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 3: DETAIL PESANAN */}
      <div className="bg-[#161F30] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">3. Detail Pesanan & Pengerjaan</h2>
            <p className="text-[11px] text-slate-400">Nama item dan instruksi kerja penjahit</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-slate-400" /> Nama Item / Pakaian *
            </label>
            <input
              type="text"
              required
              placeholder={
                orderCategory === "permak_potong"
                  ? "Contoh: Potong Celana Jeans Levis"
                  : orderCategory === "baju"
                  ? "Contoh: Kemeja Batik Lengan Panjang"
                  : "Contoh: Celana Bahan Hitam"
              }
              value={orderData.item_name}
              onChange={(e) => setOrderData({ ...orderData, item_name: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Tipe Layanan *
            </label>
            <select
              value={orderData.service_type}
              onChange={(e) => setOrderData({ ...orderData, service_type: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition"
            >
              <option value="Jahit Baru">Jahit Baru</option>
              <option value="Permak / Alterasi">Permak / Alterasi</option>
              <option value="Jahit & Bahan">Jahit & Bahan (Kain dari Toko)</option>
              <option value="Custom / Designer">Custom / Designer</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" /> Detail Instruksi Penjahit *
          </label>
          <textarea
            rows={3}
            required
            placeholder="Contoh: Kerah Sanghai, potong bawah 4cm, pasang kancing 5 buah..."
            value={orderData.detail_instruksi}
            onChange={(e) => setOrderData({ ...orderData, detail_instruksi: e.target.value })}
            className="w-full bg-[#0F172A] border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-slate-400" /> Link Foto / Sampel Model (Opsional)
          </label>
          <input
            type="url"
            placeholder="https://..."
            value={orderData.photo_before_url}
            onChange={(e) => setOrderData({ ...orderData, photo_before_url: e.target.value })}
            className="w-full bg-[#0F172A] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      {/* SECTION 4: KEUANGAN & TENGGAT */}
      <div className="bg-[#161F30] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-lg">
        <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3">
          <div className="w-9 h-9 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">4. Biaya & Tenggat Waktu</h2>
            <p className="text-[11px] text-slate-400">Pencatatan DP dan estimasi tgl selesai</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" /> Total Biaya (Rp) *
            </label>
            <input
              type="number"
              required
              placeholder="0"
              value={orderData.total_biaya}
              onChange={(e) => setOrderData({ ...orderData, total_biaya: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-400" /> DP / Uang Muka (Rp)
            </label>
            <input
              type="number"
              placeholder="0"
              value={orderData.dp_dibayar}
              onChange={(e) => setOrderData({ ...orderData, dp_dibayar: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Tanggal Selesai (Deadline)
            </label>
            <input
              type="date"
              value={orderData.tgl_deadline}
              onChange={(e) => setOrderData({ ...orderData, tgl_deadline: e.target.value })}
              className="w-full bg-[#0F172A] border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500 transition"
            />
          </div>
        </div>
      </div>

      {/* SIMPAN */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={loading}
          className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white text-xs md:text-sm font-semibold px-8 py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? "Menyimpan..." : "Simpan Pesanan"}</span>
        </button>
      </div>

    </form>
  );
}
