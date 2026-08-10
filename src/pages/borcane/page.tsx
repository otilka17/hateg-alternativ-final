import { useState } from "react";
import { motion } from "motion/react";
import { Check, Plus, ShoppingBag, Leaf } from "lucide-react";
import Navbar from "@/components/Navbar.tsx";
import CartBar from "@/pages/menu/_components/CartBar.tsx";
import { BORCANE } from "@/lib/borcane-data.ts";
import { useCartStore } from "@/lib/cart-store.ts";

function BorcanCard({ item, index }: { item: (typeof BORCANE)[number]; index: number }) {
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
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.25, 0.1, 0.25, 1] as const }}
      className="relative bg-white border border-foreground/8 flex flex-col"
    >
      {item.tag && (
        <div className="absolute top-4 right-4 text-[9px] font-semibold tracking-[3px] uppercase px-2.5 py-1 bg-primary text-white">
          {item.tag}
        </div>
      )}

      {/* Jar visual area */}
      <div className="bg-[#f5f0e8] aspect-square overflow-hidden relative">
        <img
          src={item.img}
          alt={item.n}
          className="w-full h-full object-cover hover:scale-[1.05] transition-transform duration-500"
        />
      </div>

      <div className="p-6 flex flex-col flex-1">
        <p className="text-[9px] font-semibold tracking-[3px] uppercase text-primary/70 mb-2">{item.info}</p>
        <h3 className="font-serif text-2xl text-[#14253a] leading-tight mb-3">{item.n}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed font-light flex-1">{item.d}</p>

        <div className="flex items-center justify-between mt-6 pt-5 border-t border-foreground/8">
          <div className="font-serif text-3xl text-[#14253a]">
            {item.p}<small className="text-[10px] font-sans text-foreground/30 ml-0.5"> lei</small>
          </div>
          <button
            onClick={handleAdd}
            className={`cursor-pointer flex items-center gap-2 text-[10px] font-semibold tracking-widest uppercase px-5 py-3 border transition-all duration-200 ${
              added
                ? "bg-green-700 border-green-700 text-white"
                : "bg-transparent border-[#2e4e7e] text-[#14253a] hover:bg-[#14253a] hover:text-white"
            }`}
          >
            {added ? <><Check size={11} /> Adăugat</> : <><Plus size={11} /> Adaugă</>}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function BorcanePage() {
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

        {/* Decorative elements */}
        <div className="absolute top-16 right-[8%] w-[120px] h-[120px] rounded-full border border-white/5 opacity-30" />
        <div className="absolute top-8 right-[22%] w-[80px] h-[80px] rounded-full border border-white/5 opacity-20" />

        <div className="relative z-10 pb-[8vh] px-[6%] w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] as const }}
          >
            <div className="flex items-center gap-3 mb-4 text-[#f5a06a] text-[10px] font-semibold tracking-[4px] uppercase">
              <span className="w-8 h-px bg-[#f5a06a]" />
              Produs local · Rețete de acasă
            </div>
            <h1 className="font-serif text-[clamp(3rem,7vw,6rem)] text-white leading-none tracking-tight mb-5">
              Borcane<br /><em className="text-[#f5a06a]">cu suflet.</em>
            </h1>
            <p className="text-[clamp(0.9rem,1.5vw,1.1rem)] text-white/80 max-w-lg leading-relaxed font-light">
              Zacuscă, dulcețuri de sezon, bulion și miere — produse după rețete de familie, fără conservanți, de ridicat de pe drum.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Grid */}
      <section className="px-[6%] py-20 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5 mb-3 text-primary">
          <span className="w-6 h-px bg-primary" />
          <span className="text-[9px] font-semibold tracking-[4px] uppercase">Produsele noastre</span>
        </div>
        <h2 className="font-serif text-4xl md:text-5xl text-[#14253a] mb-14 leading-none">
          Din grădina Hațegului.
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BORCANE.map((item, i) => (
            <BorcanCard key={item.n} item={item} index={i} />
          ))}
        </div>
      </section>

      {/* Note */}
      <section className="px-[6%] pb-32 max-w-7xl mx-auto">
        <div className="border-t border-foreground/8 pt-10 flex flex-col md:flex-row gap-8 items-start">
          <div className="flex gap-3 items-start flex-1">
            <ShoppingBag size={18} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#14253a] mb-1">Disponibil pentru ridicare</p>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">Borcanele se ridică de la băcănia noastră de pe DN 68. Adaugă-le în coș și trimite comanda — îți pregătim tot.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start flex-1">
            <Leaf size={18} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-[#14253a] mb-1">Fără conservanți adăugați</p>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">Toate produsele sunt realizate în cantități mici, după rețete tradiționale, cu ingrediente din zona Hațegului.</p>
            </div>
          </div>
        </div>
      </section>

      <CartBar />
    </div>
  );
}
