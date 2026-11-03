import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Pricing from "@/components/landing/Pricing";
import Calculator from "@/components/landing/Calculator";
import Features from "@/components/landing/Features";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden font-sans">
      <Navbar />
      <div className="relative z-10">
        <Hero />
        <Features />
        <Calculator />
        <Pricing />
      </div>
    </main>
  );
}