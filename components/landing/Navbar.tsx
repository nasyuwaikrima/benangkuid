"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Calculator,
  Sparkles,
  ChevronRight,
  ListChecks,
  HelpCircle,
  LogIn,
} from "lucide-react";
import { waLink } from "@/config/site";

const navLinks = [
  { name: "Fitur", href: "/#fitur", icon: Zap },
  { name: "Cara Kerja", href: "/#cara-kerja", icon: ListChecks },
  { name: "Kalkulator", href: "/#kalkulator", icon: Calculator },
  { name: "Harga", href: "/#harga", icon: Sparkles },
  { name: "FAQ", href: "/#faq", icon: HelpCircle },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Deteksi scroll untuk mengubah tampilan Navbar
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll(); // cek posisi awal
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setIsOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);
  
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "pt-4 px-4 sm:px-6" : "pt-0 px-0"
      }`}
    >
      <div
        className={`mx-auto transition-all duration-300 flex items-center justify-between ${
          isScrolled
            ? "max-w-6xl rounded-full bg-slate-900/80 border border-slate-700/60 shadow-lg shadow-blue-950/30 backdrop-blur-xl px-5 py-3"
            : "w-full max-w-full rounded-none bg-slate-900/50 border-b border-slate-800/80 backdrop-blur-md px-6 sm:px-10 py-4"
        }`}
      >
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/logo.svg"
            alt="benangku.id logo"
            width={36}
            height={36}
            className="w-9 h-9 object-contain group-hover:scale-105 transition-transform duration-300"
            priority
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1">
              benangku<span className="text-blue-400">.id</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium -mt-1 tracking-wider uppercase">
              Untuk Penjahit & Konveksi
            </span>
          </div>
        </Link>

        {/* DESKTOP MENU */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-800/40 p-1.5 rounded-full border border-slate-700/40">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-full transition-all duration-200"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* RIGHT ACTION BUTTON (DESKTOP) */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/login"
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors"
          >
            Masuk
          </Link>
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Coba Gratis</span>
          </Link>
        </div>

        {/* ANIMATED HAMBURGER BUTTON (MOBILE) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Buka menu navigasi"
          aria-expanded={isOpen}
          className="md:hidden relative w-10 h-10 rounded-full bg-slate-800/80 border border-slate-700 flex flex-col items-center justify-center gap-1.5 focus:outline-none"
        >
          <motion.span
            animate={isOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.2 }}
            className="w-5 h-0.5 bg-slate-200 rounded-full block origin-center"
          />
          <motion.span
            animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="w-5 h-0.5 bg-slate-200 rounded-full block"
          />
          <motion.span
            animate={isOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.2 }}
            className="w-5 h-0.5 bg-slate-200 rounded-full block origin-center"
          />
        </button>
      </div>

      {/* OFF-CANVAS MOBILE DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-40 md:hidden"
            />

            {/* DRAWER PANEL */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-slate-900 border-l border-slate-800 p-6 z-50 md:hidden flex flex-col justify-between shadow-2xl"
            >
              <div>
                {/* DRAWER HEADER */}
                <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <Image
                      src="/logo.svg"
                      alt="benangku.id logo"
                      width={32}
                      height={32}
                      className="w-8 h-8 object-contain"
                      priority
                    />
                    <span className="font-bold text-white text-base">
                      benangku<span className="text-blue-400">.id</span>
                    </span>
                  </div>
                </div>

                {/* MOBILE NAV LINKS */}
                <div className="mt-6 flex flex-col gap-2">
                  {navLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-slate-200 border border-slate-800/80 hover:border-slate-700 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium">{link.name}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* DRAWER FOOTER CTA */}
              <div className="pt-6 border-t border-slate-800 space-y-3">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Coba Gratis 14 Hari</span>
                </Link>
                {waLink("Halo benangku.id, saya mau tanya sebelum mendaftar.") && (
                  <a
                    href={waLink("Halo benangku.id, saya mau tanya sebelum mendaftar.")!}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    className="block text-center text-xs text-emerald-400 hover:underline"
                  >
                    Tanya dulu via WhatsApp
                  </a>
                )}
                <p className="text-center text-[11px] text-slate-500">
                  Tanpa kartu kredit • Siap pakai dalam 1 menit
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
