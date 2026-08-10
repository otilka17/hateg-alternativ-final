import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { motion } from "motion/react";
import { Sparkles, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/lib/cart-store.ts";
import { toast } from "sonner";

export default function DailySpecialSection() {
  const special = useQuery(api.dailySpecial.get, {});
  const addItem = useCartStore((s) => s.addItem);
  const navigate = useNavigate();

  // Don't render if no active special
  if (!special) return null;

  const hasDiscount = special.originalPrice && special.discountPrice;
  const discountPercent = hasDiscount
    ? Math.round(((special.originalPrice! - special.discountPrice!) / special.originalPrice!) * 100)
    : null;

  const handleAddToCart = () => {
    const price = special.discountPrice ?? special.originalPrice ?? 0;
    if (price > 0) {
      addItem(special.title, price);
      toast.success(`${special.title} a fost adăugat în coș!`);
      navigate("/checkout");
    } else {
      // No price set, just navigate to menu
      navigate("/meniu");
    }
  };

  return (
    <section className="bg-gradient-to-br from-[#14253a] via-[#1a3350] to-[#14253a] px-[5%] md:px-[8%] py-16 md:py-20 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] right-[5%] w-[200px] h-[200px] rounded-full bg-[#f5a06a]/10 blur-[80px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[150px] h-[150px] rounded-full bg-[#f5a06a]/5 blur-[60px]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-[#f5a06a]" />
            <span className="text-[10px] font-bold tracking-[4px] uppercase text-[#f5a06a]">
              Oferta zilei
            </span>
            <Sparkles className="w-5 h-5 text-[#f5a06a]" />
          </div>
        </motion.div>

        {/* Content card */}
        <motion.div
          className="grid md:grid-cols-2 gap-8 items-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
        >
          {/* Image */}
          {special.imageUrl && (
            <div className="relative rounded-sm overflow-hidden aspect-[4/3] group">
              <img
                src={special.imageUrl}
                alt={special.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              {/* Badge */}
              {special.badge && (
                <div className="absolute top-4 left-4 bg-[#f5a06a] text-white px-3 py-1.5 text-[11px] font-bold tracking-wider uppercase">
                  {special.badge}
                </div>
              )}
              {/* Discount badge if no custom badge */}
              {!special.badge && discountPercent && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 text-[11px] font-bold tracking-wider">
                  -{discountPercent}%
                </div>
              )}
            </div>
          )}

          {/* Text content */}
          <div className={special.imageUrl ? "" : "md:col-span-2 text-center max-w-lg mx-auto"}>
            <h3 className="font-serif text-2xl md:text-3xl text-white leading-tight mb-3">
              {special.title}
            </h3>
            <p className="text-white/70 leading-relaxed mb-6 text-sm md:text-base">
              {special.description}
            </p>

            {/* Pricing */}
            {hasDiscount && (
              <div className="flex items-center gap-3 mb-6">
                <span className="text-white/40 line-through text-lg">
                  {special.originalPrice!.toFixed(2)} lei
                </span>
                <span className="text-[#f5a06a] font-serif text-3xl font-bold">
                  {special.discountPrice!.toFixed(2)} lei
                </span>
                {discountPercent && (
                  <span className="bg-red-500/20 text-red-300 text-xs font-bold px-2 py-1 rounded">
                    -{discountPercent}%
                  </span>
                )}
              </div>
            )}

            {/* CTA */}
            <button
              onClick={handleAddToCart}
              className="cursor-pointer inline-flex items-center gap-2 bg-[#f5a06a] hover:bg-[#e8935d] text-white px-7 py-3.5 text-[11px] font-bold tracking-[2px] uppercase transition-colors duration-300"
            >
              <Tag className="w-4 h-4" />
              Comandă acum
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
