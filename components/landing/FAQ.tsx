import { ChevronDown } from "lucide-react";
import { FAQS } from "@/config/faq";

export default function FAQ() {
  return (
    <section id="faq" className="px-4 sm:px-6 py-16 md:py-24 max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-[26px] sm:text-4xl font-extrabold text-white tracking-tight">
          Pertanyaan yang Sering Diajukan
        </h2>
      </div>

      <div className="space-y-3">
        {FAQS.map((f) => (
          <details
            key={f.q}
            className="group rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-colors open:border-slate-700 open:bg-slate-900"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-semibold text-white [&::-webkit-details-marker]:hidden">
              {f.q}
              <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <p className="mt-3 text-[15px] leading-relaxed text-slate-400">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
