"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Phone,
  Ruler,
  Search,
  Check,
  Camera,
  AlertCircle,
  Shirt,
  Loader2,
  X,
  Save,
  UserPlus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

/* ------------------------------------------------------------------ */
/* Types & konstanta                                                   */
/* ------------------------------------------------------------------ */

interface Measurement {
  id: string;
  label: string | null;
  chest: number | null;
  waist: number | null;
  hip: number | null;
  shoulder: number | null;
  sleeve: number | null;
  pants_length: number | null;
  notes: string | null;
}

interface CustomerWithMeasurements {
  id: string;
  name: string;
  phone_number: string;
  customer_measurements?: Measurement[];
}

type CategoryType = "baju" | "celana" | "setelan" | "permak_potong";
type MKey = "chest" | "waist" | "hip" | "shoulder" | "sleeve" | "pants_length";

const PHOTO_BUCKET = "order-photos"; // buat bucket public dengan nama ini di Supabase Storage

const CATEGORIES: {
  id: CategoryType;
  emoji: string;
  title: string;
  hint: string;
  service: string;
  items: string[];
}[] = [
  { id: "baju", emoji: "👕", title: "Atasan", hint: "Kemeja, blouse, kaos", service: "Jahit Baru", items: ["Kemeja", "Blouse", "Kaos", "Batik"] },
  { id: "celana", emoji: "👖", title: "Bawahan", hint: "Celana, rok", service: "Jahit Baru", items: ["Celana Bahan", "Rok", "Celana Pendek", "Celana Jeans"] },
  { id: "setelan", emoji: "👗", title: "Setelan", hint: "Gamis, jas, kebaya", service: "Jahit Baru", items: ["Gamis", "Jas", "Setelan Batik", "Kebaya"] },
  { id: "permak_potong", emoji: "✂️", title: "Permak", hint: "Potong, kelim, kecilkan", service: "Permak / Alterasi", items: ["Celana", "Rok", "Kemeja", "Seragam"] },
];

const MEASURE_FIELDS: Record<Exclude<CategoryType, "permak_potong">, { key: MKey; label: string }[]> = {
  baju: [
    { key: "chest", label: "Lingkar dada" },
    { key: "waist", label: "Lingkar pinggang" },
    { key: "shoulder", label: "Lebar bahu" },
    { key: "sleeve", label: "Panjang lengan" },
  ],
  celana: [
    { key: "waist", label: "Lingkar pinggang" },
    { key: "hip", label: "Lingkar pinggul" },
    { key: "pants_length", label: "Panjang celana / rok" },
  ],
  setelan: [
    { key: "chest", label: "Lingkar dada" },
    { key: "waist", label: "Lingkar pinggang" },
    { key: "hip", label: "Lingkar pinggul" },
    { key: "shoulder", label: "Lebar bahu" },
    { key: "sleeve", label: "Panjang lengan" },
    { key: "pants_length", label: "Panjang celana / rok" },
  ],
};



const PERMAK_QUICK = ["Kelim ori", "Kecilkan pinggang", "Kecilkan paha", "Pendekkan lengan", "Ganti resleting"];
const DEADLINE_QUICK = [
  { label: "3 hari", days: 3 },
  { label: "1 minggu", days: 7 },
  { label: "2 minggu", days: 14 },
  { label: "1 bulan", days: 30 },
];

const EMPTY_MEASURE: Record<MKey, string> = {
  chest: "",
  waist: "",
  hip: "",
  shoulder: "",
  sleeve: "",
  pants_length: "",
};

/* ------------------------------------------------------------------ */
/* Helper                                                              */
/* ------------------------------------------------------------------ */

const toNum = (s: string): number | null => {
  const n = parseFloat(s.replace(",", "."));
  return Number.isNaN(n) ? null : n;
};

const onlyDigits = (s: string) => s.replace(/\D/g, "");
const rupiah = (n: number) => "Rp " + n.toLocaleString("id-ID");
const cleanPhone = (s: string) => s.replace(/[^\d+]/g, "");

const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const addDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toISO(d);
};

const prettyDate = (iso: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Perkecil foto HP (bisa 5-10 MB) sebelum diunggah
async function resizeImage(file: File, max = 1280): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Gagal memproses foto."))), "image/jpeg", 0.8)
  );
}

/* ------------------------------------------------------------------ */
/* Komponen kecil                                                      */
/* ------------------------------------------------------------------ */

const inputCls =
  "w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-3 text-base text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition disabled:opacity-60";

function Section({
  icon,
  tone,
  title,
  hint,
  right,
  children,
}: {
  icon: React.ReactNode;
  tone: string;
  title: string;
  hint: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-[#161F30] border border-slate-800 rounded-2xl p-4 md:p-5 space-y-4">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-10 h-10 shrink-0 rounded-xl border flex items-center justify-center ${tone}`}>{icon}</div>
          <div className="min-w-0">
            <h2 className="text-base font-bold text-white">{title}</h2>
            <p className="text-xs text-slate-400">{hint}</p>
          </div>
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-semibold text-slate-300">{label}</span>
      {children}
      {hint && <span className="block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3.5 py-2 rounded-full text-sm font-medium border transition active:scale-95 ${
        active
          ? "bg-blue-600 border-blue-500 text-white"
          : "bg-[#0F172A] border-slate-700 text-slate-300 hover:border-slate-500"
      }`}
    >
      {children}
    </button>
  );
}

function MoneyInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-base">Rp</span>
      <input
        inputMode="numeric"
        placeholder={placeholder ?? "0"}
        value={value ? Number(value).toLocaleString("id-ID") : ""}
        onChange={(e) => onChange(onlyDigits(e.target.value))}
        className={`${inputCls} pl-11`}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Form utama                                                          */
/* ------------------------------------------------------------------ */

export default function NewOrderForm({
  existingCustomers,
  shopId,
}: {
  existingCustomers: CustomerWithMeasurements[];
  shopId: string;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const errorRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pelanggan
  const [customerMode, setCustomerMode] = useState<"existing" | "new">(
    existingCustomers.length > 0 ? "existing" : "new"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // Kategori & ukuran
  const [category, setCategory] = useState<CategoryType>("baju");
  const [label, setLabel] = useState("Standar");
  const [measure, setMeasure] = useState<Record<MKey, string>>(EMPTY_MEASURE);
  const [lastMeasure, setLastMeasure] = useState<Record<MKey, string> | null>(null);
  const [permakTarget, setPermakTarget] = useState("");

  // Pesanan
  const [order, setOrder] = useState({
    item_name: "",
    service_type: "Jahit Baru",
    detail_instruksi: "",
    photo_before_url: "",
    total: "",
    dp: "",
    deadline: "",
  });
  const setO = (patch: Partial<typeof order>) => setOrder((o) => ({ ...o, ...patch }));

  const cat = CATEGORIES.find((c) => c.id === category)!;
  const total = Number(order.total) || 0;
  const dp = Number(order.dp) || 0;
  const sisa = Math.max(total - dp, 0);

  /* ---------- Pelanggan ---------- */

  const filteredCustomers = existingCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone_number.includes(searchQuery)
  );

  // Deteksi nomor yang sudah terdaftar saat input pelanggan baru
  const duplicateCustomer = useMemo(() => {
    if (customerMode !== "new" || selectedCustomerId) return null;
    const p = onlyDigits(customerPhone);
    if (p.length < 8) return null;
    return existingCustomers.find((c) => onlyDigits(c.phone_number).endsWith(p.slice(-9))) ?? null;
  }, [customerPhone, customerMode, selectedCustomerId, existingCustomers]);

  const selectCustomer = (c: CustomerWithMeasurements) => {
    setCustomerMode("existing");
    setSelectedCustomerId(c.id);
    setCustomerName(c.name);
    setCustomerPhone(c.phone_number);

    const m = c.customer_measurements?.[0];
    if (m) {
      const filled: Record<MKey, string> = {
        chest: m.chest?.toString() ?? "",
        waist: m.waist?.toString() ?? "",
        hip: m.hip?.toString() ?? "",
        shoulder: m.shoulder?.toString() ?? "",
        sleeve: m.sleeve?.toString() ?? "",
        pants_length: m.pants_length?.toString() ?? "",
      };
      setMeasure(filled);
      setLastMeasure(filled);
      setLabel(m.label || "Standar");
    } else {
      setMeasure(EMPTY_MEASURE);
      setLastMeasure(null);
    }
  };

  const resetCustomer = () => {
    setSelectedCustomerId(null);
    setCustomerMode("new");
    setCustomerName("");
    setCustomerPhone("");
    setMeasure(EMPTY_MEASURE);
    setLastMeasure(null);
    setLabel("Standar");
  };

  /* ---------- Kategori ---------- */

  const pickCategory = (c: (typeof CATEGORIES)[number]) => {
    setCategory(c.id);
    setO({ service_type: c.service });
  };

  const addPermakNote = (text: string) => {
    const cur = order.detail_instruksi.trim();
    if (cur.toLowerCase().includes(text.toLowerCase())) return;
    setO({ detail_instruksi: cur ? `${cur}, ${text}` : text });
  };

  /* ---------- Foto ---------- */

  const handlePhoto = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setErrorMsg(null);
    try {
      const blob = await resizeImage(file);
      const path = `${shopId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
      const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, blob, { contentType: "image/jpeg" });
      if (error) throw error;
      const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
      setO({ photo_before_url: data.publicUrl });
    } catch (err: any) {
      showError(`Foto gagal diunggah (${err.message ?? "coba lagi"}). Pesanan tetap bisa disimpan tanpa foto.`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  /* ---------- Simpan ---------- */

  const showError = (msg: string) => {
    setErrorMsg(msg);
    setTimeout(() => errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

  const measureChanged =
    !lastMeasure || (Object.keys(EMPTY_MEASURE) as MKey[]).some((k) => measure[k] !== lastMeasure[k]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || uploading) return;
    setErrorMsg(null);

    const name = customerName.trim();
    const phone = cleanPhone(customerPhone);

    if (!name) return showError("Nama pelanggan belum diisi.");
    if (!selectedCustomerId && onlyDigits(phone).length < 9)
      return showError("Nomor WhatsApp tidak valid. Contoh: 081234567890.");
    if (!order.item_name.trim()) return showError("Nama barang belum diisi. Contoh: Kemeja batik.");
    if (dp > total && total > 0) return showError("DP lebih besar dari total biaya. Periksa lagi angkanya.");

    setLoading(true);
    try {
      let customerId = selectedCustomerId;

      if (!customerId) {
        const { data, error } = await supabase
          .from("customers")
          .insert({ shop_id: shopId, name, phone_number: phone })
          .select("id")
          .single();
        if (error) throw error;
        customerId = data.id;
      }

      // Untuk permak, target potong ikut ke instruksi (bukan ke ukuran badan)
      const instruksi =
        category === "permak_potong" && permakTarget.trim()
          ? `Target: ${permakTarget.trim()}${order.detail_instruksi ? " — " + order.detail_instruksi : ""}`
          : order.detail_instruksi.trim();

      const { error: orderErr } = await supabase.from("orders").insert({
        shop_id: shopId,
        customer_id: customerId,
        item_name: order.item_name.trim(),
        service_type: order.service_type,
        detail_instruksi: instruksi,
        photo_before_url: order.photo_before_url || null,
        total_biaya: total,
        dp_dibayar: dp,
        status_pengerjaan: "antrean",
        tgl_deadline: order.deadline || null,
      });
      if (orderErr) throw orderErr;

      // Ukuran badan: hanya disimpan bila ada isi dan berbeda dari ukuran terakhir.
      // Gagal simpan ukuran tidak membatalkan pesanan.
      if (category !== "permak_potong" && measureChanged) {
        const keys = MEASURE_FIELDS[category].map((f) => f.key);
        const payload: Record<string, number | null> = {};
        keys.forEach((k) => (payload[k] = toNum(measure[k])));
        if (Object.values(payload).some((v) => v !== null)) {
          const { error: mErr } = await supabase
            .from("customer_measurements")
            .insert({ customer_id: customerId, label: label.trim() || "Standar", ...payload, notes: null });
          if (mErr) console.warn("Ukuran tidak tersimpan:", mErr.message);
        }
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      showError(err?.message || "Pesanan gagal disimpan. Periksa koneksi lalu coba lagi.");
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */

  const lockedCustomer = customerMode === "existing" && !!selectedCustomerId;

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-4">
      <header>
        <h1 className="text-2xl font-bold text-white tracking-tight">Pesanan baru</h1>
        <p className="text-sm text-slate-400 mt-1">Isi dari atas ke bawah. Kolom bertanda * wajib diisi.</p>
      </header>

      {errorMsg && (
        <div
          ref={errorRef}
          role="alert"
          className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span className="flex-1">{errorMsg}</span>
          <button type="button" onClick={() => setErrorMsg(null)} aria-label="Tutup pesan">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. PELANGGAN */}
      <Section
        icon={<User className="w-5 h-5" />}
        tone="bg-blue-600/20 border-blue-500/30 text-blue-400"
        title="Pelanggan"
        hint="Cari pelanggan lama atau isi data baru"
        right={
          <div className="flex bg-[#0F172A] p-1 rounded-xl border border-slate-800 shrink-0">
            {(["existing", "new"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => (m === "new" ? resetCustomer() : setCustomerMode("existing"))}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  customerMode === m ? "bg-blue-600 text-white" : "text-slate-400"
                }`}
              >
                {m === "existing" ? "Lama" : "Baru"}
              </button>
            ))}
          </div>
        }
      >
        {customerMode === "existing" && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="search"
                placeholder="Ketik nama atau nomor WhatsApp"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${inputCls} pl-11`}
              />
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2">
              {filteredCustomers.length === 0 ? (
                <div className="text-center py-4 space-y-2">
                  <p className="text-sm text-slate-400">Tidak ada yang cocok.</p>
                  <button
                    type="button"
                    onClick={resetCustomer}
                    className="text-sm text-blue-400 font-semibold inline-flex items-center gap-1.5"
                  >
                    <UserPlus className="w-4 h-4" /> Tambah sebagai pelanggan baru
                  </button>
                </div>
              ) : (
                filteredCustomers.map((c) => {
                  const active = selectedCustomerId === c.id;
                  const hasMeasure = (c.customer_measurements?.length ?? 0) > 0;
                  return (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => selectCustomer(c)}
                      className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between gap-3 transition ${
                        active
                          ? "bg-blue-600/15 border-blue-500/60"
                          : "bg-[#0F172A]/60 border-slate-800 hover:border-slate-600"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-white truncate">{c.name}</span>
                        <span className="block text-xs text-slate-400">
                          {c.phone_number}
                          {hasMeasure && " · ukuran tersimpan"}
                        </span>
                      </span>
                      {active && <Check className="w-5 h-5 text-blue-400 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {(customerMode === "new" || selectedCustomerId) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Nama pelanggan *">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  autoComplete="off"
                  placeholder="Pak Slamet / Bu Rina"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  disabled={lockedCustomer}
                  className={`${inputCls} pl-11`}
                />
              </div>
            </Field>
            <Field label="Nomor WhatsApp *">
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  inputMode="tel"
                  autoComplete="off"
                  placeholder="081234567890"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  disabled={lockedCustomer}
                  className={`${inputCls} pl-11`}
                />
              </div>
            </Field>
          </div>
        )}

        {duplicateCustomer && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm text-amber-200 flex items-center justify-between gap-3">
            <span>
              Nomor ini sudah terdaftar atas nama <b>{duplicateCustomer.name}</b>.
            </span>
            <button
              type="button"
              onClick={() => selectCustomer(duplicateCustomer)}
              className="shrink-0 px-3 py-2 rounded-lg bg-amber-500 text-slate-900 font-semibold text-sm"
            >
              Pakai data ini
            </button>
          </div>
        )}

        {lockedCustomer && (
          <button type="button" onClick={resetCustomer} className="text-sm text-blue-400 font-medium">
            Ganti pelanggan
          </button>
        )}
      </Section>

      {/* 2. JENIS PESANAN & UKURAN */}
      <Section
        icon={<Shirt className="w-5 h-5" />}
        tone="bg-purple-600/20 border-purple-500/30 text-purple-400"
        title="Jenis pesanan"
        hint="Kolom ukuran menyesuaikan pilihan Anda"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => pickCategory(c)}
              className={`p-3.5 rounded-xl border text-left transition active:scale-[0.98] ${
                category === c.id
                  ? "bg-blue-600/15 border-blue-500 text-white"
                  : "bg-[#0F172A] border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="block text-sm font-bold">
                {c.emoji} {c.title}
              </span>
              <span className="block text-xs text-slate-500 mt-0.5">{c.hint}</span>
            </button>
          ))}
        </div>

        <Field label="Nama barang *">
          <input
            type="text"
            placeholder={`Contoh: ${cat.items[0]} warna hitam`}
            value={order.item_name}
            onChange={(e) => setO({ item_name: e.target.value })}
            className={inputCls}
          />
        </Field>
        <div className="flex flex-wrap gap-2 -mt-2">
          {cat.items.map((i) => (
            <Chip key={i} active={order.item_name === i} onClick={() => setO({ item_name: i })}>
              {i}
            </Chip>
          ))}
        </div>

        {/* Ukuran */}
        <div className="pt-1 space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <Ruler className="w-4 h-4 text-blue-400" />
            {category === "permak_potong" ? "Target permak" : "Ukuran badan (cm)"}
          </h3>

          {category === "permak_potong" ? (
            <Field label="Target potong / panjang" hint="Boleh diisi bebas, mis. potong 5 cm atau jadi 95 cm">
              <input
                type="text"
                placeholder="Potong 5 cm"
                value={permakTarget}
                onChange={(e) => setPermakTarget(e.target.value)}
                className={inputCls}
              />
            </Field>
          ) : (
            <>
              {lastMeasure && (
                <p className="text-xs text-emerald-400/90">
                  Ukuran terakhir pelanggan sudah terisi otomatis. Ubah bila ada perubahan.
                </p>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {MEASURE_FIELDS[category].map((f) => (
                  <Field key={f.key} label={f.label}>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="decimal"
                        placeholder="0"
                        value={measure[f.key]}
                        onChange={(e) => setMeasure({ ...measure, [f.key]: e.target.value.replace(/[^\d.,]/g, "") })}
                        className={`${inputCls} pr-12`}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">cm</span>
                    </div>
                  </Field>
                ))}
              </div>
              <Field label="Nama set ukuran" hint="Mis. Standar, Lebaran 2026, Setelah diet">
                <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} className={inputCls} />
              </Field>
            </>
          )}
        </div>
      </Section>

      {/* 3. DETAIL & FOTO */}
      <Section
        icon={<Camera className="w-5 h-5" />}
        tone="bg-pink-600/20 border-pink-500/30 text-pink-400"
        title="Catatan & foto"
        hint="Model, bahan, atau permintaan khusus"
      >
        <Field label="Catatan pengerjaan">
          <textarea
            rows={3}
            placeholder="Contoh: lengan panjang, kancing tersembunyi, kain dari pelanggan"
            value={order.detail_instruksi}
            onChange={(e) => setO({ detail_instruksi: e.target.value })}
            className={`${inputCls} resize-none`}
          />
        </Field>

        {category === "permak_potong" && (
          <div className="flex flex-wrap gap-2 -mt-2">
            {PERMAK_QUICK.map((t) => (
              <Chip key={t} onClick={() => addPermakNote(t)}>
                + {t}
              </Chip>
            ))}
          </div>
        )}

        <div>
          <span className="text-sm font-semibold text-slate-300 block mb-1.5">Foto barang / contoh model</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handlePhoto(e.target.files?.[0])}
          />
          {order.photo_before_url ? (
            <div className="relative w-40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={order.photo_before_url}
                alt="Foto barang"
                className="w-40 h-40 object-cover rounded-xl border border-slate-700"
              />
              <button
                type="button"
                onClick={() => setO({ photo_before_url: "" })}
                aria-label="Hapus foto"
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-slate-900 border border-slate-600 flex items-center justify-center text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
  <button
    type="button"
    onClick={() => setShowAlert(true)}
    className="w-full md:w-auto px-5 py-3.5 rounded-xl border-2 border-dashed border-slate-700 text-slate-300 text-sm font-medium inline-flex items-center justify-center gap-2 hover:border-amber-500/60 hover:text-amber-300 transition"
  >
    <Camera className="w-4 h-4" />
    <span>Ambil atau pilih foto</span>
  </button>

  {showAlert && (
    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-amber-300 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="flex items-center gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <span>Fitur unggah foto belum tersedia (Segera Hadir).</span>
      </div>
      <button
        type="button"
        onClick={() => setShowAlert(false)}
        className="text-amber-400 hover:text-amber-200 p-1 rounded-lg hover:bg-amber-500/20 transition"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )}
</div>
          )}
        </div>
      </Section>

      {/* 4. BIAYA & DEADLINE */}
      <Section
        icon={<span className="text-lg">💰</span>}
        tone="bg-emerald-600/20 border-emerald-500/30 text-emerald-400"
        title="Biaya & tanggal selesai"
        hint="Sisa pembayaran dihitung otomatis"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Total biaya">
            <MoneyInput value={order.total} onChange={(v) => setO({ total: v })} placeholder="150.000" />
          </Field>
          <Field label="DP dibayar">
            <MoneyInput value={order.dp} onChange={(v) => setO({ dp: v })} />
          </Field>
        </div>

        {total > 0 && (
          <div className="flex flex-wrap gap-2 -mt-1">
            <Chip active={dp === Math.round(total * 0.25)} onClick={() => setO({ dp: String(Math.round(total * 0.25)) })}>
              DP 25%
            </Chip>
            <Chip active={dp === Math.round(total * 0.5)} onClick={() => setO({ dp: String(Math.round(total * 0.5)) })}>
              DP 50%
            </Chip>
            <Chip active={dp === total} onClick={() => setO({ dp: String(total) })}>
              Lunas
            </Chip>
          </div>
        )}

        <Field label="Tanggal selesai (deadline)">
          <input
            type="date"
            min={toISO(new Date())}
            value={order.deadline}
            onChange={(e) => setO({ deadline: e.target.value })}
            className={inputCls}
          />
        </Field>
        <div className="flex flex-wrap gap-2 -mt-2">
          {DEADLINE_QUICK.map((d) => (
            <Chip key={d.days} active={order.deadline === addDays(d.days)} onClick={() => setO({ deadline: addDays(d.days) })}>
              {d.label}
            </Chip>
          ))}
        </div>
        {order.deadline && <p className="text-sm text-slate-400">Selesai: {prettyDate(order.deadline)}</p>}
      </Section>

      {/* BAR RINGKASAN + SIMPAN */}
      <div className="sticky bottom-0 -mx-4 px-4 py-3 bg-[#0B1220]/95 backdrop-blur border-t border-slate-800 z-10">
        <div className="flex items-center justify-between gap-4 max-w-3xl mx-auto">
          <div className="min-w-0">
            <p className="text-xs text-slate-400">{total > 0 && sisa === 0 ? "Status" : "Sisa bayar"}</p>
            <p className={`text-lg font-bold truncate ${total > 0 && sisa === 0 ? "text-emerald-400" : "text-white"}`}>
              {total === 0 ? "—" : sisa === 0 ? "Lunas" : rupiah(sisa)}
            </p>
          </div>
          <button
            type="submit"
            disabled={loading || uploading}
            className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold text-base inline-flex items-center gap-2 transition active:scale-95"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {loading ? "Menyimpan…" : "Simpan pesanan"}
          </button>
        </div>
      </div>
    </form>
  );
}
