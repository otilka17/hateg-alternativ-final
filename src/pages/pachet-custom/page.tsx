import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { motion } from "motion/react";
import { Plus, Minus, ShoppingBag, CheckCircle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar.tsx";
import Footer from "@/components/Footer.tsx";
import { Button } from "@/components/ui/button.tsx";
import { CAFEA, SPEC, LIM, SANATATE, SAND, DULCE, JARS } from "@/lib/menu-data.ts";

type ProductOption = {
  name: string;
  price: number;
  category: string;
};

// Build product list from menu data
const ALL_PRODUCTS: ProductOption[] = [
  ...SAND.map((s) => ({ name: s.n, price: s.p, category: "Sandwich-uri" })),
  ...CAFEA.map((c) => ({ name: c.n, price: c.p, category: "Cafea" })),
  ...SPEC.map((s) => ({ name: s.n, price: s.p, category: "Cafea Specială" })),
  ...LIM.map((l) => ({ name: l.n, price: l.p, category: "Limonade & Sucuri" })),
  ...SANATATE.map((s) => ({ name: s.n, price: s.p, category: "Sănătate" })),
  ...DULCE.map((d) => ({ name: d.n, price: d.p, category: "Dulciuri" })),
  ...JARS.filter((j) => j.p).map((j) => ({ name: j.n, price: j.p!, category: "Borcane" })),
];

// Group by category
const CATEGORIES = [...new Set(ALL_PRODUCTS.map((p) => p.category))];

type SelectedItem = {
  name: string;
  price: number;
  qty: number;
};

export default function PachetCustomPage() {
  const createOrder = useMutation(api.orders.create);
  const [selected, setSelected] = useState<SelectedItem[]>([]);
  const [step, setStep] = useState<"select" | "contact" | "done">("select");
  const [submitting, setSubmitting] = useState(false);

  // Contact form
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [obs, setObs] = useState("");

  const addProduct = (product: ProductOption) => {
    setSelected((prev) => {
      const existing = prev.find((s) => s.name === product.name);
      if (existing) {
        return prev.map((s) => s.name === product.name ? { ...s, qty: s.qty + 1 } : s);
      }
      return [...prev, { name: product.name, price: product.price, qty: 1 }];
    });
  };

  const removeProduct = (name: string) => {
    setSelected((prev) => {
      const existing = prev.find((s) => s.name === name);
      if (existing && existing.qty > 1) {
        return prev.map((s) => s.name === name ? { ...s, qty: s.qty - 1 } : s);
      }
      return prev.filter((s) => s.name !== name);
    });
  };

  const total = selected.reduce((sum, item) => sum + item.price * item.qty, 0);
  const itemCount = selected.reduce((sum, item) => sum + item.qty, 0);

  const handleSubmit = async () => {
    if (!fname.trim() || !phone.trim()) {
      toast.error("Te rugăm completează numele și telefonul.");
      return;
    }
    if (selected.length === 0) {
      toast.error("Adaugă cel puțin un produs.");
      return;
    }

    setSubmitting(true);
    try {
      await createOrder({
        fname: fname.trim(),
        lname: lname.trim(),
        phone: phone.trim(),
        email: email.trim() || "pachet-custom@metanoia.ro",
        mode: "pickup",
        obs: obs.trim() ? `[PACHET CUSTOM] ${obs.trim()}` : "[PACHET CUSTOM]",
        items: selected.map((s) => ({ name: s.name, price: s.price, qty: s.qty })),
        totalRon: total,
      });
      setStep("done");
    } catch {
      toast.error("A apărut o eroare. Te rugăm încearcă din nou.");
    } finally {
      setSubmitting(false);
    }
  };

  const getQty = (name: string) => selected.find((s) => s.name === name)?.qty ?? 0;

  if (step === "done") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-32 pb-20 px-[5%] md:px-[8%] text-center max-w-lg mx-auto">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
            <h1 className="font-serif text-3xl text-[#14253a] mb-4">Comanda a fost trimisă!</h1>
            <p className="text-muted-foreground mb-8">
              Pachetul tău custom a fost trimis. Te vom contacta curând pentru confirmare.
            </p>
            <Link
              to="/"
              className="cursor-pointer inline-flex items-center gap-2 bg-primary text-white px-6 py-3 font-semibold text-sm no-underline hover:bg-primary/90 transition-colors"
            >
              Înapoi acasă
            </Link>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-20 px-[5%] md:px-[8%] max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <p className="text-[10px] font-semibold tracking-[4px] uppercase text-primary mb-3">
            Personalizat
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-[#14253a] mb-3">
            Creează-ți pachetul
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Alege produsele dorite, completează datele și comanda ajunge direct la noi.
          </p>
        </motion.div>

        {step === "select" && (
          <div className="grid lg:grid-cols-[1fr_320px] gap-8">
            {/* Product selection */}
            <div className="space-y-8">
              {CATEGORIES.map((cat) => (
                <motion.div
                  key={cat}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <h2 className="font-serif text-xl text-[#14253a] mb-4 border-b border-foreground/10 pb-2">
                    {cat}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ALL_PRODUCTS.filter((p) => p.category === cat).map((product) => {
                      const qty = getQty(product.name);
                      return (
                        <div
                          key={product.name}
                          className={`flex items-center justify-between p-4 border transition-colors ${
                            qty > 0 ? "border-primary/30 bg-primary/5" : "border-foreground/10 bg-background"
                          }`}
                        >
                          <div>
                            <p className="font-medium text-sm text-[#14253a]">{product.name}</p>
                            <p className="text-xs text-muted-foreground">{product.price} lei</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {qty > 0 && (
                              <>
                                <button
                                  onClick={() => removeProduct(product.name)}
                                  className="cursor-pointer w-7 h-7 flex items-center justify-center border border-foreground/20 text-foreground/70 hover:bg-foreground/5 transition-colors"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-sm font-semibold w-5 text-center">{qty}</span>
                              </>
                            )}
                            <button
                              onClick={() => addProduct(product)}
                              className="cursor-pointer w-7 h-7 flex items-center justify-center border border-primary/40 text-primary hover:bg-primary/10 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Sticky cart summary */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="bg-[#0f2035] p-6 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingBag className="w-5 h-5 text-[#f5a06a]" />
                  <h3 className="font-serif text-lg">Pachetul tău</h3>
                </div>

                {selected.length === 0 ? (
                  <p className="text-white/50 text-sm">Adaugă produse din stânga.</p>
                ) : (
                  <div className="space-y-2 mb-4 max-h-[300px] overflow-y-auto">
                    {selected.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <span className="text-white/80">
                          {item.qty}x {item.name}
                        </span>
                        <span className="text-[#f5a06a] font-medium">{item.price * item.qty} lei</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-white/10 pt-4 mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white/60 text-sm">{itemCount} produse</span>
                    <span className="text-xl font-bold text-[#f5a06a]">{total} lei</span>
                  </div>
                  <Button
                    onClick={() => setStep("contact")}
                    disabled={selected.length === 0}
                    className="cursor-pointer w-full bg-[#f5a06a] text-[#0f2035] hover:bg-[#f5a06a]/90 font-semibold tracking-wide"
                  >
                    Continuă →
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === "contact" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-lg mx-auto"
          >
            <button
              onClick={() => setStep("select")}
              className="cursor-pointer flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Înapoi la produse
            </button>

            <div className="bg-[#0f2035] p-6 text-white mb-6">
              <h3 className="font-serif text-lg mb-3">Rezumat comandă</h3>
              <div className="space-y-1.5 mb-3">
                {selected.map((item) => (
                  <div key={item.name} className="flex justify-between text-sm">
                    <span className="text-white/70">{item.qty}x {item.name}</span>
                    <span className="text-[#f5a06a]">{item.price * item.qty} lei</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between">
                <span className="font-medium">Total</span>
                <span className="text-xl font-bold text-[#f5a06a]">{total} lei</span>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-serif text-xl text-[#14253a]">Datele tale</h3>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Prenume *"
                  value={fname}
                  onChange={(e) => setFname(e.target.value)}
                  className="border border-foreground/15 px-4 py-3 text-sm bg-background focus:border-primary outline-none"
                />
                <input
                  type="text"
                  placeholder="Nume"
                  value={lname}
                  onChange={(e) => setLname(e.target.value)}
                  className="border border-foreground/15 px-4 py-3 text-sm bg-background focus:border-primary outline-none"
                />
              </div>
              <input
                type="tel"
                placeholder="Telefon *"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-foreground/15 px-4 py-3 text-sm bg-background focus:border-primary outline-none"
              />
              <input
                type="email"
                placeholder="Email (opțional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-foreground/15 px-4 py-3 text-sm bg-background focus:border-primary outline-none"
              />
              <textarea
                placeholder="Observații (opțional)"
                rows={3}
                value={obs}
                onChange={(e) => setObs(e.target.value)}
                className="w-full border border-foreground/15 px-4 py-3 text-sm bg-background focus:border-primary outline-none resize-none"
              />
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="cursor-pointer w-full bg-primary text-white py-6 font-semibold text-sm tracking-wide"
              >
                {submitting ? "Se trimite..." : "Trimite comanda"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Comanda va fi confirmată telefonic de echipa noastră.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}
