import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCartStore } from "@/lib/cart-store.ts";
import type { MenuItem } from "@/lib/menu-data.ts";
import { Check, Plus } from "lucide-react";

type Props = {
  item: MenuItem;
  dark?: boolean;
};

export default function ItemRow({ item, dark }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(item.n, item.p);
    setAdded(true);
    setTimeout(() => setAdded(false), 1100);
  };

  return (
    <motion.div
      className={`flex items-baseline justify-between py-4 border-b gap-5 transition-all duration-200 hover:pl-2 ${
        dark ? "border-white/8" : "border-foreground/10"
      } last:border-0`}
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex-1">
        <div className={`font-serif text-xl leading-tight mb-1 ${dark ? "text-white" : "text-[#14253a]"}`}>
          {item.n}
        </div>
        <div className={`text-sm font-light leading-relaxed ${dark ? "text-white/65" : "text-muted-foreground"}`}>
          {item.d}
        </div>
      </div>
      <div className="flex items-center gap-3.5 shrink-0">
        <div className={`font-serif text-2xl ${dark ? "text-[#f5a06a]" : "text-primary"}`}>
          {item.p}<small className={`text-[10px] ml-0.5 font-sans ${dark ? "text-white/40" : "text-foreground/25"}`}> lei</small>
        </div>
        <button
          onClick={handleAdd}
          className={`cursor-pointer border text-[10px] font-semibold tracking-widest uppercase px-4 py-2.5 min-h-[44px] transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 ${
            added
              ? "bg-green-700 border-green-700 text-white"
              : dark
              ? "bg-transparent border-white/30 text-white/70 hover:bg-white/10 hover:border-white/60"
              : "bg-transparent border-[#2e4e7e] text-[#14253a] hover:bg-[#14253a] hover:text-white"
          }`}
        >
          <AnimatePresence mode="wait">
            {added ? (
              <motion.span key="done" initial={{ scale: 0.7 }} animate={{ scale: 1 }} className="flex items-center gap-1">
                <Check size={11} /> Adăugat
              </motion.span>
            ) : (
              <motion.span key="add" initial={{ scale: 0.7 }} animate={{ scale: 1 }} className="flex items-center gap-1">
                <Plus size={11} /> Adaugă
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
}
