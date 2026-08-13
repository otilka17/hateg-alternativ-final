import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useCartStore } from "@/lib/cart-store.ts";
import { ShoppingBag, Leaf, Clock, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import AnimatedSection from "@/components/AnimatedSection.tsx";

const BADGE_CONFIG = {
  "Proaspăt zilnic": { icon: Clock, color: "bg-emerald-500/10 text-emerald-700 border-emerald-200" },
  "Artizanal": { icon: Leaf, color: "bg-amber-500/10 text-amber-700 border-amber-200" },
  "Local": { icon: MapPin, color: "bg-sky-500/10 text-sky-700 border-sky-200" },
} as const;

export default function QuickOrder() {
  const products = useQuery(api.cms.listPopularItems, {});
  const addItem = useCartStore((s) => s.addItem);

  if (!products || products.length === 0) return null;

  const handleAdd = (name: string, price: number) => {
    addItem(name, price);
    toast.success(`${name} adăugat!`);
  };

  return (
    <section className="bg-background px-[5%] md:px-[8%] py-16 md:py-28">
      <AnimatedSection className="text-center mb-14">
        <div className="flex items-center justify-center gap-2.5 mb-4 text-primary">
          <span className="w-6 h-px bg-primary" />
          <span className="text-[9px] font-semibold tracking-[4px] uppercase">Comandă rapid</span>
          <span className="w-6 h-px bg-primary" />
        </div>
        <h2 className="font-serif text-3xl md:text-5xl text-[#14253a] leading-tight mb-3">
          Cele mai <em className="text-primary italic">cerute</em>
        </h2>
        <p className="text-muted-foreground text-sm">Adaugă direct în coș, cu un singur click.</p>
        <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-300 px-3 py-1.5 mt-4">
          <span className="text-sm">📅</span>
          <span className="text-[11px] text-amber-900 font-medium">Doar cu precomandă — minim o zi înainte</span>
        </div>
      </AnimatedSection>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 max-w-5xl mx-auto">
        {products.map((product, i) => {
          const badgeKey = product.badge as keyof typeof BADGE_CONFIG;
          const badge = BADGE_CONFIG[badgeKey];
          const BadgeIcon = badge?.icon ?? Leaf;

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: "easeOut" }}
              className="bg-card border border-border overflow-hidden group hover:shadow-lg transition-shadow duration-300"
            >
              {/* Image */}
              <div className="aspect-[4/3] overflow-hidden bg-muted relative">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                    <ShoppingBag size={32} />
                  </div>
                )}

                {/* Badge */}
                {badge && (
                  <div className={`absolute top-2 left-2 flex items-center gap-1 text-[9px] font-semibold tracking-wide uppercase px-2 py-1 border rounded-sm ${badge.color}`}>
                    <BadgeIcon size={10} />
                    {product.badge}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 md:p-5">
                <h3 className="text-sm font-medium text-foreground truncate mb-2">{product.name}</h3>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base font-bold text-[#14253a]">{product.price} lei</span>
                  <button
                    onClick={() => handleAdd(product.name, product.price)}
                    className="cursor-pointer bg-[#14253a] hover:bg-primary text-white text-[9px] font-bold tracking-wider uppercase px-3.5 py-2.5 transition-colors"
                  >
                    Adaugă
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
