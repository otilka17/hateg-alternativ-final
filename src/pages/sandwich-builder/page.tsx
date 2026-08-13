import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useCartStore } from "@/lib/cart-store.ts";
import Navbar from "@/components/Navbar.tsx";
import Footer from "@/components/Footer.tsx";
import { toast } from "sonner";
import { ShoppingCart, ChevronRight, Check, Plus, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import type { Id } from "@/convex/_generated/dataModel.d.ts";

type Ingredient = {
  _id: Id<"sandwichIngredients">;
  category: string;
  name: string;
  price: number;
  emoji: string;
  sortOrder: number;
  active: boolean;
};

const CATEGORY_INFO = {
  paine: { label: "Alege pâinea", emoji: "🍞", required: true, multi: false },
  proteina: { label: "Alege proteina", emoji: "🥩", required: true, multi: false },
  legume: { label: "Adaugă legume", emoji: "🥬", required: false, multi: true },
  sos: { label: "Alege sosul", emoji: "🫙", required: false, multi: true },
  extra: { label: "Extra toppings", emoji: "✨", required: false, multi: true },
} as const;

const CATEGORIES = ["paine", "proteina", "legume", "sos", "extra"] as const;
type Category = typeof CATEGORIES[number];

// Visual sandwich colors for each category layer
const LAYER_COLORS: Record<string, string> = {
  paine: "bg-amber-200",
  proteina: "bg-rose-300",
  legume: "bg-green-300",
  sos: "bg-yellow-300",
  extra: "bg-orange-200",
};

const LAYER_HEIGHTS: Record<string, string> = {
  paine: "h-8",
  proteina: "h-6",
  legume: "h-4",
  sos: "h-3",
  extra: "h-5",
};

export default function SandwichBuilderPage() {
  const ingredients = useQuery(api.sandwichBuilder.listIngredients, {});
  const addItem = useCartStore((s) => s.addItem);

  const [selections, setSelections] = useState<Record<string, Id<"sandwichIngredients">[]>>({
    paine: [],
    proteina: [],
    legume: [],
    sos: [],
    extra: [],
  });

  const [step, setStep] = useState(0);
  const [added, setAdded] = useState(false);

  const currentCategory = CATEGORIES[step];
  const categoryInfo = CATEGORY_INFO[currentCategory];
  const categoryIngredients = ingredients?.[currentCategory] ?? [];

  // Calculate total price
  const totalPrice = useMemo(() => {
    if (!ingredients) return 0;
    let total = 0;
    for (const cat of CATEGORIES) {
      const catIngredients = ingredients[cat] ?? [];
      for (const selId of selections[cat]) {
        const ing = catIngredients.find((i: Ingredient) => i._id === selId);
        if (ing) total += ing.price;
      }
    }
    return total;
  }, [selections, ingredients]);

  // Get selected ingredient names for cart
  const selectedNames = useMemo(() => {
    if (!ingredients) return [];
    const names: string[] = [];
    for (const cat of CATEGORIES) {
      const catIngredients = ingredients[cat] ?? [];
      for (const selId of selections[cat]) {
        const ing = catIngredients.find((i: Ingredient) => i._id === selId);
        if (ing) names.push(ing.name);
      }
    }
    return names;
  }, [selections, ingredients]);

  // Get all selected ingredients for visual
  const allSelected = useMemo(() => {
    if (!ingredients) return [];
    const result: { category: string; name: string; emoji: string }[] = [];
    for (const cat of CATEGORIES) {
      const catIngredients = ingredients[cat] ?? [];
      for (const selId of selections[cat]) {
        const ing = catIngredients.find((i: Ingredient) => i._id === selId);
        if (ing) result.push({ category: cat, name: ing.name, emoji: ing.emoji });
      }
    }
    return result;
  }, [selections, ingredients]);

  const toggleIngredient = (id: Id<"sandwichIngredients">) => {
    const cat = currentCategory;
    const info = CATEGORY_INFO[cat];

    setSelections((prev) => {
      const current = prev[cat];
      if (current.includes(id)) {
        // Remove
        return { ...prev, [cat]: current.filter((x) => x !== id) };
      }
      if (info.multi) {
        // Multi-select: add
        return { ...prev, [cat]: [...current, id] };
      }
      // Single-select: replace
      return { ...prev, [cat]: [id] };
    });
  };

  const canGoNext = () => {
    const info = CATEGORY_INFO[currentCategory];
    if (info.required && selections[currentCategory].length === 0) return false;
    return true;
  };

  const handleAddToCart = () => {
    if (selections.paine.length === 0 || selections.proteina.length === 0) {
      toast.error("Alege cel puțin pâinea și proteina!");
      return;
    }

    const desc = selectedNames.join(", ");
    const cartName = `Sandwich personalizat (${desc})`;
    addItem(cartName, totalPrice);
    toast.success("Sandwich adăugat în coș!");
    setAdded(true);
  };

  const handleReset = () => {
    setSelections({ paine: [], proteina: [], legume: [], sos: [], extra: [] });
    setStep(0);
    setAdded(false);
  };

  if (!ingredients) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-pulse text-muted-foreground">Se încarcă ingredientele...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <section className="bg-[#14253a] px-[5%] md:px-[8%] pt-24 pb-12 text-center">
        <h1 className="font-serif text-3xl md:text-5xl text-white mb-3">
          Sandwich <em className="text-[#f5a06a] italic">personalizat</em>
        </h1>
        <p className="text-white/60 text-sm md:text-base max-w-md mx-auto">
          Construiește-ți sandwich-ul perfect, ingrediente alese de tine. Comandă pentru ziua următoare.
        </p>
      </section>

      <div className="px-[5%] md:px-[8%] py-8 md:py-12">
        <div className="max-w-5xl mx-auto grid md:grid-cols-[1fr_300px] gap-8">
          {/* Left: Steps & selections */}
          <div>
            {/* Progress steps */}
            <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
              {CATEGORIES.map((cat, i) => (
                <button
                  key={cat}
                  onClick={() => setStep(i)}
                  className={`cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    i === step
                      ? "bg-[#14253a] text-white"
                      : i < step && selections[cat].length > 0
                      ? "bg-green-100 text-green-700"
                      : "bg-foreground/5 text-muted-foreground"
                  }`}
                >
                  {i < step && selections[cat].length > 0 ? (
                    <Check size={12} />
                  ) : (
                    <span>{CATEGORY_INFO[cat].emoji}</span>
                  )}
                  {CATEGORY_INFO[cat].label.replace("Alege ", "").replace("Adaugă ", "")}
                </button>
              ))}
            </div>

            {/* Current step */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-4">
                  <h2 className="font-serif text-2xl text-[#14253a] mb-1">
                    {categoryInfo.emoji} {categoryInfo.label}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {categoryInfo.required ? "Obligatoriu" : "Opțional"} ·{" "}
                    {categoryInfo.multi ? "Poți alege mai multe" : "Alege una"}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {categoryIngredients.map((ing: Ingredient) => {
                    const selected = selections[currentCategory].includes(ing._id);
                    return (
                      <button
                        key={ing._id}
                        onClick={() => toggleIngredient(ing._id)}
                        className={`cursor-pointer flex items-center gap-3 p-4 border rounded-sm text-left transition-all ${
                          selected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-foreground/10 hover:border-foreground/20 bg-white"
                        }`}
                      >
                        <span className="text-2xl">{ing.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-[#14253a]">{ing.name}</div>
                          <div className="text-xs text-muted-foreground">+{ing.price} lei</div>
                        </div>
                        {selected ? (
                          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                            <Check size={14} className="text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-foreground/15 flex items-center justify-center">
                            <Plus size={12} className="text-foreground/30" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8">
                  {step > 0 ? (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      ← Înapoi
                    </button>
                  ) : (
                    <div />
                  )}

                  {step < CATEGORIES.length - 1 ? (
                    <button
                      onClick={() => {
                        if (!canGoNext()) {
                          toast.error(`Alege cel puțin o opțiune pentru ${CATEGORY_INFO[currentCategory].label.toLowerCase()}`);
                          return;
                        }
                        setStep(step + 1);
                      }}
                      className="cursor-pointer flex items-center gap-1 bg-[#14253a] hover:bg-primary text-white px-5 py-2.5 text-xs font-bold tracking-[1.5px] uppercase transition-colors"
                    >
                      Următorul <ChevronRight size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={handleAddToCart}
                      disabled={added}
                      className="cursor-pointer flex items-center gap-2 bg-primary hover:bg-[#f5a06a] text-white px-5 py-2.5 text-xs font-bold tracking-[1.5px] uppercase transition-colors disabled:opacity-50"
                    >
                      <ShoppingCart size={14} />
                      {added ? "Adăugat!" : "Adaugă în coș"}
                    </button>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right: Visual sandwich preview + price */}
          <div className="md:sticky md:top-24">
            <div className="bg-[#f5f0e8] border border-foreground/8 rounded-sm p-6">
              <h3 className="text-xs font-bold tracking-[2px] uppercase text-foreground/50 mb-4 text-center">
                Sandwich-ul tău
              </h3>

              {/* Visual sandwich */}
              <div className="flex flex-col items-center justify-center min-h-[200px] mb-4">
                {allSelected.length === 0 ? (
                  <div className="text-center text-muted-foreground text-sm">
                    <span className="text-4xl block mb-2">🥪</span>
                    Alege ingredientele...
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-0.5 w-full max-w-[200px]">
                    {/* Top bun */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full h-8 bg-amber-300 rounded-t-[40px] border border-amber-400/50 shadow-sm"
                    />

                    {/* Ingredient layers */}
                    <AnimatePresence>
                      {allSelected.map((ing, i) => (
                        <motion.div
                          key={`${ing.category}-${ing.name}-${i}`}
                          initial={{ opacity: 0, scaleX: 0.5 }}
                          animate={{ opacity: 1, scaleX: 1 }}
                          exit={{ opacity: 0, scaleX: 0.5 }}
                          transition={{ duration: 0.3, delay: i * 0.05 }}
                          className={`w-full ${LAYER_HEIGHTS[ing.category] ?? "h-4"} ${LAYER_COLORS[ing.category] ?? "bg-gray-200"} border-x border-foreground/5 flex items-center justify-center`}
                        >
                          <span className="text-xs">{ing.emoji}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Bottom bun */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full h-6 bg-amber-200 rounded-b-[20px] border border-amber-400/50 shadow-sm"
                    />
                  </div>
                )}
              </div>

              {/* Selected items list */}
              {allSelected.length > 0 && (
                <div className="border-t border-foreground/8 pt-4 space-y-1.5">
                  {allSelected.map((ing, i) => (
                    <div key={`${ing.name}-${i}`} className="flex items-center gap-2 text-xs">
                      <span>{ing.emoji}</span>
                      <span className="text-foreground/70">{ing.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Price */}
              <div className="border-t border-foreground/8 mt-4 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[#14253a]">Total:</span>
                  <span className="text-xl font-bold text-primary">{totalPrice} lei</span>
                </div>
              </div>

              {/* Cart actions */}
              {added && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 space-y-2"
                >
                  <Link
                    to="/checkout"
                    className="cursor-pointer block w-full text-center bg-[#14253a] hover:bg-primary text-white px-4 py-3 text-[11px] font-bold tracking-[1.5px] uppercase no-underline transition-colors"
                  >
                    Finalizează comanda
                  </Link>
                  <button
                    onClick={handleReset}
                    className="cursor-pointer w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    Fă alt sandwich
                  </button>
                </motion.div>
              )}
            </div>

            {/* Info about next-day delivery */}
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-sm p-4 text-center">
              <p className="text-xs text-amber-800 font-medium">
                📅 Sandwich-urile personalizate se pregătesc pentru <strong>ziua următoare</strong>.
                La checkout poți alege data de ridicare/livrare.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
