import { ImageResponse } from "next/og";

export const alt = "benangku.id — Aplikasi Catatan Order Penjahit & Konveksi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #020617 0%, #0f172a 55%, #1e3a8a 100%)",
          color: "#f8fafc",
        }}
      >
        <div style={{ display: "flex", fontSize: 44, fontWeight: 800, letterSpacing: -1 }}>
          benangku<span style={{ color: "#60a5fa" }}>.id</span>
        </div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 800, lineHeight: 1.1, marginTop: 36, maxWidth: 980 }}>
          Dari ukuran sampai lunas, semua jahitan tercatat rapi
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#94a3b8", marginTop: 36 }}>
          Ukuran pelanggan · Antrean · DP & pelunasan · Coba gratis 14 hari
        </div>
      </div>
    ),
    size
  );
}
