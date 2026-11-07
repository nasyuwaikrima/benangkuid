import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SITE } from "@/config/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = SITE.url;

export const viewport: Viewport = {
  themeColor: "#0f172a", // Warna header browser mobile (Slate-900)
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Benangku - Aplikasi Catatan Order Penjahit & Konveksi",
    template: "%s | Benangku",
  },
  description:
    "Solusi digital serba praktis untuk penjahit. Kelola antrean pesanan, simpan ukuran badan pelanggan, catat keuangan, dan kirim nota otomatis via WhatsApp.",
  keywords: [
    "aplikasi penjahit",
    "software usaha jahit",
    "catat ukuran baju",
    "manajemen antrean jahit",
    "nota whatsapp penjahit",
    "benangku",
    "benangku id",
  ],
  authors: [{ name: SITE.operator, url: siteUrl }],
  creator: "Benangku",
  publisher: "Benangku",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  applicationName: "Benangku",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Benangku - Aplikasi Catatan Order Penjahit & Konveksi",
    description:
      "Kelola antrean jahit, simpan ukuran pelanggan, dan kirim nota otomatis via WhatsApp dalam satu platform praktis.",
    url: siteUrl,
    siteName: "Benangku",
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Benangku - Aplikasi Manajemen Usaha Penjahit",
    description:
      "Kelola antrean jahit & ukuran badan pelanggan dengan mudah. Kirim update status via WA otomatis.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-50 font-sans selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
