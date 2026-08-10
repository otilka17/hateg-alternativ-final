import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { ConvexError } from "convex/values";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Gift, Lock, Star, Sparkles, Package, Check, ChevronRight, Banknote, CreditCard } from "lucide-react";
import Navbar from "@/components/Navbar.tsx";
import Footer from "@/components/Footer.tsx";
import AnimatedSection from "@/components/AnimatedSection.tsx";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PAYPAL_CLIENT_ID = "ASaZzZjepNTlqtzGfX7hnQv9ZM8STfYvhfnBuNVE0ruo_-jmMbTOjAagdLEEHT5Cu6bo0QF0IBf6Ry4p";
const RON_TO_EUR = 5.0;

const TIERS = [
  {
    id: "gurmand",
    name: "Gurmand",
    price: 79,
    emoji: "🧑‍🍳",
    description: "Gustul lunii",
    features: [
      "1 borcan exclusiv (nu se vinde în magazin)",
      "1 produs surpriză de sezon",
      "Cartonaș cu povestea producătorului",
      "Acces anticipat produse noi",
    ],
    highlight: false,
  },
  {
    id: "colecționar",
    name: "Colecționar",
    price: 149,
    emoji: "👑",
    description: "Experiența completă",
    features: [
      "3 borcane exclusive (ediție limitată)",
      "Produs artizanal surpriză",
      "Rețetă scrisă de mână",
      "Acces anticipat + vot produse viitoare",
      "Livrare gratuită",
      "Invitație la degustări private",
    ],
    highlight: true,
  },
];

function Countdown({ closesAt }: { closesAt: string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(closesAt).getTime();

    const update = () => {
      const now = Date.now();
      const diff = Math.max(0, target - now);

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [closesAt]);

  const units = [
    { value: timeLeft.days, label: "zile" },
    { value: timeLeft.hours, label: "ore" },
    { value: timeLeft.minutes, label: "min" },
    { value: timeLeft.seconds, label: "sec" },
  ];

  return (
    <div className="flex gap-3 justify-center">
      {units.map((unit) => (
        <div key={unit.label} className="text-center">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 w-16 h-16 flex items-center justify-center rounded-sm">
            <span className="font-serif text-2xl text-white font-bold">{unit.value}</span>
          </div>
          <span className="text-[9px] tracking-[2px] uppercase text-white/50 mt-2 block">{unit.label}</span>
        </div>
      ))}
    </div>
  );
}

function SlotsIndicator({ remaining, total }: { remaining: number; total: number }) {
  const percentage = ((total - remaining) / total) * 100;
  const isLow = remaining <= 10;

  return (
    <div className="max-w-sm mx-auto">
      <div className="flex justify-between items-baseline mb-2">
        <span className={`text-sm font-bold ${isLow ? "text-red-400" : "text-[#f5a06a]"}`}>
          {remaining} locuri rămase
        </span>
        <span className="text-xs text-white/40">din {total}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${isLow ? "bg-red-400" : "bg-[#f5a06a]"}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function SneakPeek({ items }: { items: Array<{ label: string; revealedAt?: string | null; imageUrl?: string | null }> }) {
  const now = new Date().toISOString();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
      {items.map((item, i) => {
        const isRevealed = item.revealedAt && item.revealedAt <= now;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15, duration: 0.5 }}
            className={`aspect-square rounded-sm overflow-hidden border relative group ${
              isRevealed ? "border-[#f5a06a]/30" : "border-white/10"
            }`}
          >
            {isRevealed ? (
              <>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.label} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#f5a06a]/10 flex items-center justify-center">
                    <Gift className="w-8 h-8 text-[#f5a06a]" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <span className="text-xs text-white font-medium">{item.label}</span>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-white/5 flex flex-col items-center justify-center gap-2 cursor-default">
                <Lock className="w-6 h-6 text-white/20" />
                <span className="text-[9px] tracking-[1.5px] uppercase text-white/30">Săpt. {i + 1}</span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}

function SubscribeForm({ onSuccess }: { onSuccess: () => void }) {
  const subscribe = useMutation(api.box.subscribe);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tier, setTier] = useState("colecționar");
  const [payMethod, setPayMethod] = useState<"cash" | "card">("cash");
  const [submitting, setSubmitting] = useState(false);

  const selectedTier = TIERS.find((t) => t.id === tier);
  const price = selectedTier?.price ?? 149;

  const validateForm = (): boolean => {
    if (!name.trim()) {
      toast.error("Te rugăm să completezi numele.");
      return false;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Te rugăm să completezi un email valid.");
      return false;
    }
    return true;
  };

  const saveSubscription = async () => {
    await subscribe({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      tier,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      await saveSubscription();
      toast.success("Felicitări! Te-ai abonat la Cutia Metanoia!");
      onSuccess();
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("A apărut o eroare. Încearcă din nou.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "EUR" }}>
      <form onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto">
        {/* Tier selection */}
        <div className="grid grid-cols-2 gap-3">
          {TIERS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTier(t.id)}
              className={`cursor-pointer p-4 border rounded-sm text-left transition-all ${
                tier === t.id
                  ? "border-[#f5a06a] bg-[#f5a06a]/10"
                  : "border-foreground/10 hover:border-foreground/20"
              }`}
            >
              <div className="text-xl mb-1">{t.emoji}</div>
              <div className="text-sm font-semibold text-foreground">{t.name}</div>
              <div className="text-xs text-muted-foreground">{t.price} lei/lună</div>
            </button>
          ))}
        </div>

        <div>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Numele tău"
            className="w-full bg-white border border-foreground/10 px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="adresa@email.com"
            className="w-full bg-white border border-foreground/10 px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Telefon (opțional, pentru livrare)"
            className="w-full bg-white border border-foreground/10 px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Payment method selection */}
        <div className="space-y-3">
          <div className="text-[10px] font-bold tracking-[2px] uppercase text-muted-foreground">Metodă de plată</div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setPayMethod("cash")}
              className={`cursor-pointer flex flex-col items-center gap-2 p-4 border rounded-sm transition-all ${
                payMethod === "cash" ? "border-[#14253a] bg-[#14253a]/5" : "border-foreground/10 hover:border-foreground/20"
              }`}
            >
              <Banknote size={20} className={payMethod === "cash" ? "text-[#14253a]" : "text-muted-foreground"} />
              <span className={`text-xs font-semibold ${payMethod === "cash" ? "text-[#14253a]" : "text-muted-foreground"}`}>Cash la livrare</span>
            </button>
            <button
              type="button"
              onClick={() => setPayMethod("card")}
              className={`cursor-pointer flex flex-col items-center gap-2 p-4 border rounded-sm transition-all ${
                payMethod === "card" ? "border-[#14253a] bg-[#14253a]/5" : "border-foreground/10 hover:border-foreground/20"
              }`}
            >
              <CreditCard size={20} className={payMethod === "card" ? "text-[#14253a]" : "text-muted-foreground"} />
              <span className={`text-xs font-semibold ${payMethod === "card" ? "text-[#14253a]" : "text-muted-foreground"}`}>Card / PayPal</span>
            </button>
          </div>
        </div>

        {/* Cash submit button */}
        {payMethod === "cash" && (
          <button
            type="submit"
            disabled={submitting}
            className="cursor-pointer w-full bg-[#14253a] hover:bg-primary text-white px-8 py-4 text-[11px] font-bold tracking-[2px] uppercase transition-colors disabled:opacity-50"
          >
            {submitting ? "Se procesează..." : "Vreau cutia mea (plată la livrare)"}
          </button>
        )}

        {/* PayPal buttons */}
        {payMethod === "card" && (
          <div className="pt-1">
            <PayPalButtons
              style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay", height: 46 }}
              createOrder={(_data, actions) => {
                if (!validateForm()) {
                  return Promise.reject(new Error("Completează câmpurile obligatorii."));
                }
                const amountEUR = (price / RON_TO_EUR).toFixed(2);
                return actions.order.create({
                  intent: "CAPTURE",
                  purchase_units: [{
                    description: `Cutia Metanoia · ${selectedTier?.name ?? "Abonament"}`,
                    amount: {
                      currency_code: "EUR",
                      value: amountEUR,
                    },
                  }],
                });
              }}
              onApprove={async (_data, actions) => {
                if (!actions.order) return;
                await actions.order.capture();
                try {
                  await saveSubscription();
                  toast.success("Plata a fost procesată! Te-ai abonat la Cutia Metanoia!");
                  onSuccess();
                } catch (error) {
                  if (error instanceof ConvexError) {
                    const { message } = error.data as { code: string; message: string };
                    toast.error(message);
                  } else {
                    toast.error("Plata a reușit, dar a apărut o eroare la salvare. Contactează-ne.");
                  }
                }
              }}
              onError={(err) => {
                console.error("PayPal error:", err);
                toast.error("Plata nu a reușit. Încearcă din nou sau alege plata cash.");
              }}
              onCancel={() => {
                toast("Plata a fost anulată. Poți încerca din nou.");
              }}
            />
          </div>
        )}

        <p className="text-xs text-muted-foreground/60 text-center">
          {payMethod === "cash"
            ? "Plata se face la livrare. Te poți dezabona oricând."
            : `Plata de ${(price / RON_TO_EUR).toFixed(0)} EUR este procesată securizat prin PayPal (1 EUR ≈ ${RON_TO_EUR} RON).`}
        </p>
      </form>
    </PayPalScriptProvider>
  );
}

export default function CutiaMetanoiaPage() {
  const boxConfig = useQuery(api.box.getActiveBox, {});
  const [subscribed, setSubscribed] = useState(false);

  // Fallback data when no config exists in DB
  const defaultConfig = {
    month: "2026-08",
    totalSlots: 50,
    closesAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    remainingSlots: 43,
    takenSlots: 7,
    revealItems: [
      { label: "Borcan exclusiv", revealedAt: new Date(Date.now() - 86400000).toISOString(), imageUrl: null },
      { label: "???", revealedAt: null, imageUrl: null },
      { label: "???", revealedAt: null, imageUrl: null },
      { label: "???", revealedAt: null, imageUrl: null },
    ],
  };

  const config = boxConfig ?? defaultConfig;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero - Dark, premium, exclusive */}
      <section className="relative bg-[#14253a] pt-28 pb-20 md:pt-36 md:pb-32 px-[5%] md:px-[8%] overflow-hidden">
        {/* Subtle grain texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px",
          }}
        />

        {/* Decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#f5a06a]/5 blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as const }}
          >
            <div className="inline-flex items-center gap-2 bg-[#f5a06a]/10 border border-[#f5a06a]/20 px-4 py-2 rounded-sm mb-8">
              <Sparkles className="w-3.5 h-3.5 text-[#f5a06a]" />
              <span className="text-[9px] font-bold tracking-[2px] uppercase text-[#f5a06a]">Ediție limitată · Doar 50 de cutii</span>
            </div>

            <h1 className="font-serif text-4xl md:text-6xl text-white leading-tight mb-4">
              Cutia <em className="text-[#f5a06a] italic">Metanoia</em>
            </h1>
            <p className="text-white/60 text-sm md:text-base max-w-md mx-auto leading-relaxed mb-10">
              Abonament lunar cu produse exclusive din Țara Hațegului. Surprize artizanale livrate la ușa ta.
            </p>

            {/* Countdown */}
            <div className="mb-8">
              <p className="text-[9px] tracking-[3px] uppercase text-white/40 mb-4">Înscrierile se închid în</p>
              <Countdown closesAt={config.closesAt} />
            </div>

            {/* Slots indicator */}
            <SlotsIndicator remaining={config.remainingSlots} total={config.totalSlots} />
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-background px-[5%] md:px-[8%] py-16 md:py-28">
        <AnimatedSection className="text-center mb-14">
          <div className="flex items-center justify-center gap-2.5 mb-4 text-primary">
            <span className="w-6 h-px bg-primary" />
            <span className="text-[9px] font-semibold tracking-[4px] uppercase">Cum funcționează</span>
            <span className="w-6 h-px bg-primary" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-[#14253a] leading-tight">
            Simplu ca <em className="text-primary italic">bună ziua</em>
          </h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            { icon: Package, step: "01", title: "Alegi cutia", desc: "Gurmand sau Colecționar — tu decizi." },
            { icon: Gift, step: "02", title: "Primești surpriza", desc: "Lunar, la ușa ta. Produse pe care nu le găsești altundeva." },
            { icon: Star, step: "03", title: "Descoperi gusturi", desc: "Fiecare lună, o experiență nouă din Țara Hațegului." },
          ].map((item, i) => (
            <AnimatedSection key={item.step} delay={i * 0.15}>
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="text-[#f5a06a]/40 font-serif text-sm">{item.step}</span>
                <h3 className="font-serif text-lg text-[#14253a] mt-1 mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Tiers */}
      <section className="bg-[#f5f0e8] px-[5%] md:px-[8%] py-16 md:py-28">
        <AnimatedSection className="text-center mb-14">
          <div className="flex items-center justify-center gap-2.5 mb-4 text-primary">
            <span className="w-6 h-px bg-primary" />
            <span className="text-[9px] font-semibold tracking-[4px] uppercase">Alege cutia ta</span>
            <span className="w-6 h-px bg-primary" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-[#14253a] leading-tight">
            Două experiențe, <em className="text-primary italic">un singur scop</em>
          </h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {TIERS.map((tier, i) => (
            <AnimatedSection key={tier.id} delay={i * 0.15}>
              <div className={`bg-white border p-8 md:p-10 h-full relative ${
                tier.highlight ? "border-[#f5a06a] shadow-lg" : "border-foreground/10"
              }`}>
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#f5a06a] text-white text-[8px] font-bold tracking-[2px] uppercase px-3 py-1">
                    Cel mai popular
                  </div>
                )}
                <div className="text-3xl mb-3">{tier.emoji}</div>
                <h3 className="font-serif text-2xl text-[#14253a] mb-1">{tier.name}</h3>
                <p className="text-xs text-muted-foreground mb-4">{tier.description}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-serif text-3xl text-[#14253a]">{tier.price}</span>
                  <span className="text-sm text-muted-foreground">lei/lună</span>
                </div>
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-foreground/80">
                      <Check className="w-4 h-4 text-[#f5a06a] mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Sneak Peek */}
      <section className="bg-[#14253a] px-[5%] md:px-[8%] py-16 md:py-28">
        <AnimatedSection className="text-center mb-12">
          <div className="flex items-center justify-center gap-2.5 mb-4 text-[#f5a06a]">
            <span className="w-6 h-px bg-[#f5a06a]" />
            <span className="text-[9px] font-semibold tracking-[4px] uppercase">Sneak peek</span>
            <span className="w-6 h-px bg-[#f5a06a]" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-white leading-tight mb-3">
            Ce vine în <em className="text-[#f5a06a] italic">cutie?</em>
          </h2>
          <p className="text-white/50 text-sm">Se dezvăluie săptămânal. Abonează-te ca să nu ratezi.</p>
        </AnimatedSection>

        <SneakPeek items={config.revealItems} />
      </section>

      {/* Social proof */}
      <section className="bg-background px-[5%] md:px-[8%] py-16 md:py-24">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection className="text-center mb-10">
            <h2 className="font-serif text-2xl md:text-3xl text-[#14253a]">
              De ce <em className="text-primary italic">Cutia Metanoia?</em>
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { emoji: "🔒", title: "Exclusivitate", desc: "Produse create special, indisponibile altundeva." },
              { emoji: "🎁", title: "Surpriză", desc: "Fiecare lună, o experiență culinară nouă." },
              { emoji: "🤝", title: "Comunitate", desc: "Faci parte dintr-un club select de gurmanzi." },
            ].map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 0.1}>
                <div className="text-center">
                  <div className="text-2xl mb-3">{item.emoji}</div>
                  <h3 className="text-sm font-semibold text-[#14253a] mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Subscribe form */}
      <section className="bg-[#f5f0e8] px-[5%] md:px-[8%] py-16 md:py-28" id="subscribe">
        <AnimatedSection className="text-center mb-10">
          <div className="flex items-center justify-center gap-2.5 mb-4 text-primary">
            <span className="w-6 h-px bg-primary" />
            <span className="text-[9px] font-semibold tracking-[4px] uppercase">Înscrie-te acum</span>
            <span className="w-6 h-px bg-primary" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-[#14253a] leading-tight mb-3">
            Rezervă-ți <em className="text-primary italic">cutia</em>
          </h2>
          <p className="text-muted-foreground text-sm">Doar {config.remainingSlots} locuri rămase din {config.totalSlots}.</p>
        </AnimatedSection>

        {subscribed ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto text-center bg-white border border-emerald-200 p-8 rounded-sm"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Check className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="font-serif text-xl text-[#14253a] mb-2">Bine ai venit în club!</h3>
            <p className="text-sm text-muted-foreground">Vei primi un email cu toate detaliile. Prima cutie ajunge luna viitoare.</p>
          </motion.div>
        ) : (
          <SubscribeForm onSuccess={() => setSubscribed(true)} />
        )}
      </section>

      {/* Final CTA */}
      <section className="bg-primary px-[5%] md:px-[8%] py-14 md:py-20 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px",
          }}
        />
        <AnimatedSection className="relative">
          <blockquote className="font-serif italic text-xl md:text-2xl text-white leading-relaxed max-w-lg mx-auto mb-6">
            {"\"Nu e doar o cutie. E o poveste din Țara Hațegului, livrată la tine acasă.\""}
          </blockquote>
          <a
            href="#subscribe"
            className="cursor-pointer inline-flex items-center gap-2 text-[11px] font-bold tracking-[2px] uppercase text-white border-b border-white/50 pb-1 hover:border-white transition-colors no-underline"
          >
            Vreau cutia mea <ChevronRight size={14} />
          </a>
        </AnimatedSection>
      </section>

      <Footer />
    </div>
  );
}
