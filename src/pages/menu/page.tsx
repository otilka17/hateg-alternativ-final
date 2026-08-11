import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { motion, AnimatePresence } from "motion/react";
import Navbar from "@/components/Navbar.tsx";
import SEO from "@/components/SEO.tsx";
import CartBar from "./_components/CartBar.tsx";
import { useCartStore } from "@/lib/cart-store.ts";
import { CAFEA, SPEC, LIM, SANATATE, SAND, DULCE, COMBO, JARS } from "@/lib/menu-data.ts";
import type { MenuItem as StaticMenuItem, ComboItem, JarItem } from "@/lib/menu-data.ts";
import { Check, Plus, ShoppingBag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton.tsx";

const CATEGORIES = [
  { id: "cafea", label: "Cafea", icon: "☕" },
  { id: "specialitati", label: "Specialități", icon: "✨" },
  { id: "limonada", label: "Limonade", icon: "🍋" },
  { id: "sanatate", label: "Sănătate", icon: "🥤" },
  { id: "sandwich", label: "Sandwich", icon: "🥖" },
  { id: "dulce", label: "Dulce", icon: "🍰" },
  { id: "pachete", label: "Pachete", icon: "🎒" },
  { id: "borcane", label: "Borcane", icon: "🫙" },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

// Unified item shape for display
type DisplayItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  oldPrice?: number;
  badge?: string;
};

// Fallback: convert static data to DisplayItem
function getStaticItems(id: CategoryId): DisplayItem[] {
  const toDisplay = (items: (StaticMenuItem | ComboItem | JarItem)[]): DisplayItem[] =>
    items.map((item, idx) => ({
      id: `${id}-${idx}`,
      name: item.n,
      description: item.d,
      price: item.p ?? 0,
      imageUrl: item.img ?? null,
      oldPrice: "oldPrice" in item ? item.oldPrice : undefined,
      badge: "badge" in item ? item.badge : undefined,
    }));

  switch (id) {
    case "cafea": return toDisplay(CAFEA);
    case "specialitati": return toDisplay(SPEC);
    case "limonada": return toDisplay(LIM);
    case "sanatate": return toDisplay(SANATATE);
    case "sandwich": return toDisplay(SAND);
    case "dulce": return toDisplay(DULCE);
    case "pachete": return toDisplay(COMBO);
    case "borcane": return toDisplay(JARS);
  }
}

function ProductCard({ item, outOfStock }: { item: DisplayItem; outOfStock: boolean }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (item.price && !outOfStock) {
      addItem(item.name, item.price);
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center gap-4 bg-white border border-foreground/8 p-3 hover:shadow-md transition-shadow group ${outOfStock ? "opacity-60" : ""}`}
    >
      {/* Product image */}
      {item.imageUrl && (
        <div className="w-20 h-20 sm:w-24 sm:h-24 overflow-hidden shrink-0 bg-muted relative">
          <img
            src={item.imageUrl}
            alt={item.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${outOfStock ? "grayscale" : ""}`}
          />
          {outOfStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-[9px] font-bold text-white uppercase tracking-wider bg-red-600 px-2 py-0.5">Epuizat</span>
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm sm:text-base text-foreground truncate">{item.name}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed mt-0.5">{item.description}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-bold text-primary text-sm sm:text-base">{item.price ? `${item.price}lei` : "la tejghea"}</span>
          {item.oldPrice && (
            <span className="text-xs text-muted-foreground line-through">{item.oldPrice}lei</span>
          )}
          {outOfStock && <span className="text-[10px] font-bold text-red-600 uppercase">Indisponibil</span>}
        </div>
      </div>

      {/* Add button */}
      {item.price > 0 && !outOfStock && (
        <button
          onClick={handleAdd}
          className={`cursor-pointer shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all duration-200 ${
            added
              ? "bg-green-500 text-white scale-105"
              : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
          }`}
          aria-label={`Adaugă ${item.name}`}
        >
          {added ? <Check size={16} /> : <Plus size={16} />}
          <span className="hidden sm:inline">{added ? "Adăugat" : "Adaugă"}</span>
        </button>
      )}
    </motion.div>
  );
}

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("cafea");
  const totalQty = useCartStore((s) => s.totalQty);
  const qty = totalQty();
  const inventory = useQuery(api.inventory.list, {});

  // Fetch database items for menu categories
  const isMenuCategory = activeCategory !== "pachete" && activeCategory !== "borcane";
  const dbMenuItems = useQuery(
    api.cms.listMenuItems,
    isMenuCategory ? { category: activeCategory } : "skip"
  );
  const dbBorcane = useQuery(api.cms.listBorcaneItems, activeCategory === "borcane" ? {} : "skip");
  const dbPachete = useQuery(api.cms.listPacheteItems, activeCategory === "pachete" ? {} : "skip");

  // Convert DB items to DisplayItem
  const getItems = (): DisplayItem[] | undefined => {
    if (isMenuCategory) {
      if (dbMenuItems === undefined) return undefined;
      if (dbMenuItems.length > 0) {
        return dbMenuItems
          .filter((item) => item.active)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((item) => ({
            id: item._id,
            name: item.name,
            description: item.description,
            price: item.price,
            imageUrl: item.imageUrl,
          }));
      }
      // Fallback to static data if DB is empty
      return getStaticItems(activeCategory);
    }
    if (activeCategory === "borcane") {
      if (dbBorcane === undefined) return undefined;
      if (dbBorcane.length > 0) {
        return dbBorcane
          .filter((item) => item.active)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((item) => ({
            id: item._id,
            name: item.name,
            description: item.description,
            price: item.price,
            imageUrl: item.imageUrl,
          }));
      }
      return getStaticItems("borcane");
    }
    if (activeCategory === "pachete") {
      if (dbPachete === undefined) return undefined;
      if (dbPachete.length > 0) {
        return dbPachete
          .filter((item) => item.active)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((item) => ({
            id: item._id,
            name: item.name,
            description: item.description,
            price: item.price,
            imageUrl: item.imageUrl,
          }));
      }
      return getStaticItems("pachete");
    }
    return getStaticItems(activeCategory);
  };

  const items = getItems();
  const isLoading = items === undefined;

  // Build a set of out-of-stock product names
  const outOfStockNames = new Set<string>();
  if (inventory) {
    for (const inv of inventory) {
      if (inv.quantity <= 0) {
        outOfStockNames.add(inv.productName.toLowerCase());
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Meniu"
        description="Cafea, sandwich-uri calde, limonade și dulciuri artizanale — comandă online de la Metanoia, băcănia-butic de pe DN 68, Totești."
      />
      <Navbar />

      {/* Header */}
      <header className="bg-white border-b border-foreground/8 pt-20 pb-4 px-4 sm:px-6 sticky top-0 z-30">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl text-foreground font-bold">Meniu</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Soul Meal · Metanoia</p>
            </div>
            {qty > 0 && (
              <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5">
                <ShoppingBag size={16} className="text-primary" />
                <span className="text-sm font-semibold text-primary">{qty}</span>
              </div>
            )}
          </div>

          {/* Category pills - scrollable */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`cursor-pointer shrink-0 flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeCategory === cat.id
                    ? "bg-primary text-white shadow-sm"
                    : "bg-[#f0ece6] text-foreground/70 hover:bg-[#e8e3db]"
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Products grid */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-28">
        {/* Preorder notice */}
        <div className="bg-amber-50 border border-amber-300 p-3 mb-5 flex items-center gap-3">
          <span className="text-lg leading-none shrink-0">📅</span>
          <p className="text-xs text-amber-900 leading-relaxed m-0">
            <strong>Doar cu precomandă</strong> — Produsele se pregătesc proaspăt. Comanda se face cu minim o zi înainte.
          </p>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">{CATEGORIES.find((c) => c.id === activeCategory)?.icon}</span>
          <h2 className="font-semibold text-lg text-foreground">
            {CATEGORIES.find((c) => c.id === activeCategory)?.label}
          </h2>
          {!isLoading && (
            <span className="text-xs text-muted-foreground ml-auto">{items.length} produse</span>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {items.map((item) => (
                <ProductCard key={item.id} item={item} outOfStock={outOfStockNames.has(item.name.toLowerCase())} />
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <CartBar />
    </div>
  );
}
