import { useState } from "react";
import { motion } from "motion/react";
import { Check, Plus, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar.tsx";
import CartBar from "@/pages/menu/_components/CartBar.tsx";
import { PACHETE } from "@/lib/pachete-data.ts";
import { useCartStore } from "@/lib/cart-store.ts";

function PachetCard({ item, index }: { item: (typeof PACHETE)[number]; index: number }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(item.n, item.p);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.25, 0.1, 0.25, 1] as const }}
      className="relative bg-[#0f2035] flex flex-col overflow-hidden"
    >
      {item.tag && (
        <div className="absolute top-4 right-4 text-[9px] font-semibold tracking-[3px] uppercase px-2.5 py-1 bg-[#f5a06a] text-[#0f2035]">
          {item.tag}
        </div>
      )}

      {/* Icon area */}
      <div className="bg-[#1e3a5c]/60 flex items-center justify-center py-10 text-6xl select-none border-b border-white/5">
        {item.ico}
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-serif text-2xl text-white leading-tight mb-3">{item.n}</h3>
        <p className="text-sm text-white/70 leading-relaxed font-light mb-5">{item.d}</p>

        {/* Includes list */}
        <ul className="space-y-1.5 mb-6">
          {item.includes.map((inc) => (
            <li key={inc} className="flex items-center gap-2 text-[11px] text-white/80 font-light">
              <span className="w-3.5 h-px bg-[#f5a06a]/50 shrink-0" />
              {inc}
            </li>
          ))}
        </ul>

        {item.saves && (
          <div className="flex items-center gap-1.5 text-[10px] text-[#f5a06a] font-semibold tracking-wider uppercase mb-4">
            <Sparkles size={10} />
            Economisești {item.saves} lei față de prețul individual
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/8">
          <div className="font-serif text-3xl text-[#f5a06a]">
            {item.p}<small className="text-[10px] font-sans text-white/50 ml-0.5"> lei</small>
          </div>
          <button
            onClick={handleAdd}
            className={`cursor-pointer flex items-center gap-2 text-[10px] font-semibold tracking-widest uppercase px-5 py-3 border transition-all duration-200 ${
              added
                ? "bg-green-700 border-green-700 text-white"
                : "bg-transparent border-white/30 text-white/70 hover:bg-white/10 hover:border-white/60"
            }`}
          >
            {added ? <><Check size={11} /> Adăugat</> : <><Plus size={11} /> Adaugă</>}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function PachetePage() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[55vh] overflow-hidden flex items-end">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(160deg,#0f2035 0%,#1e3a5c 50%,#2a4a6a 100%)" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top,rgba(15,24,37,.92) 0%,rgba(15,24,37,.3) 60%,transparent 100%)" }}
        />

        {/* Decorative */}
        <div className="absolute top-12 right-[10%] text-[110px] opacity-[0.05] select-none">🎒</div>
        <div className="absolute top-20 right-[26%] text-[70px] opacity-[0.04] select-none">☕</div>

        <div className="relative z-10 pb-[8vh] px-[6%] w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] as const }}
          >
            <div className="flex items-center gap-3 mb-4 text-[#f5a06a] text-[10px] font-semibold tracking-[4px] uppercase">
              <span className="w-8 h-px bg-[#f5a06a]" />
              Combo-uri · Oferte speciale
            </div>
            <h1 className="font-serif text-[clamp(3rem,7vw,6rem)] text-white leading-none tracking-tight mb-5">
              Pachete<br /><em className="text-[#f5a06a]">cu valoare.</em>
            </h1>
            <p className="text-[clamp(0.9rem,1.5vw,1.1rem)] text-white/80 max-w-lg leading-relaxed font-light">
              Combinații gândite cu cap — pentru drum, pentru familie sau pentru seara de acasă. Mai mult, cu mai puțin.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Grid */}
      <section className="px-[6%] py-20 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5 mb-3 text-primary">
          <span className="w-6 h-px bg-primary" />
          <span className="text-[9px] font-semibold tracking-[4px] uppercase">Toate pachetele</span>
        </div>
        <h2 className="font-serif text-4xl md:text-5xl text-[#14253a] mb-14 leading-none">
          Gata de plecare.
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PACHETE.map((item, i) => (
            <PachetCard key={item.n} item={item} index={i} />
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section
        className="mx-[6%] mb-32 p-10 md:p-14 flex flex-col md:flex-row gap-6 md:gap-0 items-start md:items-center justify-between"
        style={{ background: "linear-gradient(135deg,#0f2035 0%,#1e3a5c 100%)" }}
      >
        <div>
          <p className="text-[10px] font-semibold tracking-[4px] uppercase text-[#f5a06a] mb-2">Personalizat</p>
          <h3 className="font-serif text-3xl text-white leading-tight">Vrei un pachet custom?</h3>
          <p className="text-white/70 font-light text-sm mt-2 max-w-sm">
            Scrie-ne în comandă ce vrei să combini și îți facem noi prețul.
          </p>
        </div>
        <a
          href="/pachet-custom"
          className="cursor-pointer inline-flex items-center gap-2 bg-[#f5a06a] text-[#0f2035] font-semibold text-[11px] tracking-widest uppercase px-8 py-4 transition-all duration-200 hover:bg-white shrink-0"
        >
          Comandă acum →
        </a>
      </section>

      <CartBar />
    </div>
  );
}
