import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import TrustBar from "@/components/landing/TrustBar";
import Problem from "@/components/landing/Problem";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Calculator from "@/components/landing/Calculator";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import FinalCta from "@/components/landing/FinalCta";
import Footer from "@/components/landing/Footer";
import { FAQS } from "@/config/faq";
import { PRICING_PLANS } from "@/config/pricing";
import { SITE } from "@/config/site";

// Data terstruktur untuk Google (rich result FAQ + SoftwareApplication)
const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    url: SITE.url,
    description: SITE.description,
    inLanguage: "id-ID",
    publisher: { "@type": "Organization", name: SITE.operator, email: SITE.email },
    offers: PRICING_PLANS.map((p) => ({
      "@type": "Offer",
      name: p.name,
      price: p.priceAmount,
      priceCurrency: "IDR",
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <Navbar />
      <div className="relative z-10">
        <Hero />
        <TrustBar />
        <Problem />
        <Features />
        <HowItWorks />
        <Calculator />
        <Pricing />
        <FAQ />
        <FinalCta />
        <Footer />
      </div>
    </main>
  );
}
