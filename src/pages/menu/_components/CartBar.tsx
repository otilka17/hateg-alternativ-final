import { motion } from "motion/react";
import { useCartStore } from "@/lib/cart-store.ts";
import { ShoppingBag, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function CartBar() {
  const items = useCartStore((s) => s.items);
  const totalQty = useCartStore((s) => s.totalQty);
  const totalPrice = useCartStore((s) => s.totalPrice);
  const clearCart = useCartStore((s) => s.clearCart);

  const qty = totalQty();
  const total = totalPrice();

  return (
    <motion.div
      initial={{ y: 110 }}
      animate={{ y: qty > 0 ? 0 : 110 }}
      transition={{ type: "spring", damping: 22, stiffness: 280 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f1825] text-white flex flex-wrap items-center justify-between gap-3 px-[5%] sm:px-[8%] py-3.5 shadow-[0_-4px_30px_rgba(0,0,0,0.35)]"
    >
      <div className="flex items-center gap-3.5 text-sm">
        <div className="bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
          {qty}
        </div>
        <ShoppingBag size={16} className="text-white/40" />
        <span className="font-serif text-lg text-white/70">{total} lei</span>
      </div>
      <div className="flex gap-3 items-center">
        <button
          onClick={clearCart}
          className="cursor-pointer flex items-center gap-1 text-white/30 text-xs underline font-light hover:text-white/60 transition-colors"
        >
          <X size={12} /> golește
        </button>
        <Link
          to="/checkout"
          className="bg-primary hover:bg-[#e07840] text-white px-6 py-2.5 text-[11px] font-bold tracking-widest uppercase transition-colors"
        >
          Finalizează →
        </Link>
      </div>
    </motion.div>
  );
}
