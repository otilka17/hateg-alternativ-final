import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function PromoBanner() {
  const banner = useQuery(api.promoBanner.get, {});
  const [dismissed, setDismissed] = useState(false);

  if (!banner || !banner.active || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed top-16 left-0 right-0 bg-primary text-white text-center z-[998] overflow-hidden"
      >
        <div className="flex items-center justify-center gap-2 px-10 py-2 text-[11px] sm:text-xs font-medium tracking-wide">
          {banner.emoji && <span>{banner.emoji}</span>}
          <span>{banner.text}</span>
          {banner.emoji && <span>{banner.emoji}</span>}
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-1"
          aria-label="Închide"
        >
          <X size={14} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
