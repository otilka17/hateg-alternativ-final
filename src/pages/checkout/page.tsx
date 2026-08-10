import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "motion/react";
import { useCartStore, getSandwichPromoDiscount } from "@/lib/cart-store.ts";
import Navbar from "@/components/Navbar.tsx";
import { Trash2, ArrowLeft, CheckCircle, ShoppingCart, Banknote, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

// Make webhook URL from original project
const MAKE_WEBHOOK_URL = "https://hook.eu1.make.com/wwdii8stmyqdul6rnok4p44k2tvtohjt";
const TRANSPORT_RON = 15;
const PAYPAL_CLIENT_ID = "ASaZzZjepNTlqtzGfX7hnQv9ZM8STfYvhfnBuNVE0ruo_-jmMbTOjAagdLEEHT5Cu6bo0QF0IBf6Ry4p";
const RON_TO_EUR = 5.0;

const pickupSchema = z.object({
  fname: z.string().min(1, "Câmp obligatoriu"),
  lname: z.string().min(1, "Câmp obligatoriu"),
  phone: z.string().min(7, "Număr invalid"),
  email: z.string().email("Email invalid"),
  mode: z.literal("pickup"),
  pickupDate: z.string().min(1, "Selectează o dată"),
  pickupTime: z.string().min(1, "Selectează ora"),
  obs: z.string().optional(),
});

const deliverySchema = z.object({
  fname: z.string().min(1, "Câmp obligatoriu"),
  lname: z.string().min(1, "Câmp obligatoriu"),
  phone: z.string().min(7, "Număr invalid"),
  email: z.string().email("Email invalid"),
  mode: z.literal("delivery"),
  address: z.string().min(1, "Câmp obligatoriu"),
  city: z.string().min(1, "Câmp obligatoriu"),
  county: z.string().optional(),
  delDate: z.string().min(1, "Selectează o dată"),
  delTime: z.string().min(1, "Selectează intervalul"),
  obs: z.string().optional(),
});

const formSchema = z.discriminatedUnion("mode", [pickupSchema, deliverySchema]);
type FormData = z.infer<typeof formSchema>;

// Minimum date for orders is tomorrow (sandwich-uri personalizate se pregătesc pt ziua următoare)
const getMinDate = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
};
const minOrderDate = getMinDate();

type OrderConfirmation = {
  items: { name: string; price: number; qty: number }[];
  total: number;
  mode: "pickup" | "delivery";
  pickupDate?: string;
  pickupTime?: string;
  delDate?: string;
  delTime?: string;
  address?: string;
  city?: string;
  fname: string;
  payMethod: "cash" | "card";
};

export default function CheckoutPage() {
  const { items, totalPrice, clearCart, removeItem } = useCartStore();
  const total = totalPrice();
  const promoDiscount = getSandwichPromoDiscount(items);
  const [mode, setMode] = useState<"pickup" | "delivery">("pickup");
  const [payMethod, setPayMethod] = useState<"cash" | "card">("cash");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState<OrderConfirmation | null>(null);
  const createOrder = useMutation(api.orders.create);

  const { register, handleSubmit, formState: { errors }, setValue, watch, trigger } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { mode: "pickup" } as FormData,
  });

  const watchMode = watch("mode");

  const switchMode = (m: "pickup" | "delivery") => {
    setMode(m);
    setValue("mode", m);
  };

  const grandTotal = total - promoDiscount + (mode === "delivery" ? TRANSPORT_RON : 0);

  const sendOrderToWebhookAndDb = async (data: FormData, paymentInfo: { method: string; status: string; orderId?: string; payerEmail?: string }) => {
    const order = {
      timestamp: new Date().toISOString(),
      client: {
        prenume: data.fname,
        nume: data.lname,
        telefon: data.phone,
        email: data.email,
      },
      livrare: data.mode === "pickup"
        ? { tip: "ridicare", data: data.pickupDate, ora: data.pickupTime }
        : { tip: "livrare", adresa: data.address, oras: data.city, judet: data.county, data: data.delDate, interval: data.delTime },
      observatii: data.obs ?? "",
      produse: items.map((i) => ({ nume: i.name, pret: i.price, cant: i.qty })),
      total_ron: grandTotal,
      plata: paymentInfo,
    };

    try {
      await fetch(MAKE_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
        mode: "no-cors",
      });
    } catch {
      // no-cors doesn't return readable response, ignore
    }

    try {
      await createOrder({
        fname: data.fname,
        lname: data.lname,
        phone: data.phone.trim().replace(/\s+/g, ""),
        email: data.email,
        mode: data.mode,
        pickupDate: data.mode === "pickup" ? data.pickupDate : undefined,
        pickupTime: data.mode === "pickup" ? data.pickupTime : undefined,
        address: data.mode === "delivery" ? data.address : undefined,
        city: data.mode === "delivery" ? data.city : undefined,
        county: data.mode === "delivery" ? data.county : undefined,
        delDate: data.mode === "delivery" ? data.delDate : undefined,
        delTime: data.mode === "delivery" ? data.delTime : undefined,
        obs: data.obs,
        items: items.map((i) => ({ name: i.name, price: i.price, qty: i.qty })),
        totalRon: grandTotal,
      });
    } catch {
      // Don't block the user even if db save fails
    }
  };

  // Save order details for confirmation page
  const saveOrderConfirmation = (data: FormData) => {
    setOrderConfirmation({
      items: items.map((i) => ({ name: i.name, price: i.price, qty: i.qty })),
      total: grandTotal,
      mode: data.mode,
      pickupDate: data.mode === "pickup" ? data.pickupDate : undefined,
      pickupTime: data.mode === "pickup" ? data.pickupTime : undefined,
      delDate: data.mode === "delivery" ? data.delDate : undefined,
      delTime: data.mode === "delivery" ? data.delTime : undefined,
      address: data.mode === "delivery" ? data.address : undefined,
      city: data.mode === "delivery" ? data.city : undefined,
      fname: data.fname,
      payMethod,
    });
  };

  // Cash payment submit
  const onSubmitCash = async (data: FormData) => {
    if (items.length === 0) {
      toast.error("Coșul este gol.");
      return;
    }
    setSubmitting(true);
    saveOrderConfirmation(data);
    await sendOrderToWebhookAndDb(data, { method: "cash", status: "PENDING" });
    clearCart();
    setSubmitting(false);
    setSubmitted(true);
  };

  // PayPal validation before creating the order
  const validateForPaypal = async (): Promise<FormData | null> => {
    const valid = await trigger();
    if (!valid) {
      toast.error("Completează toate câmpurile obligatorii.");
      return null;
    }
    return watch() as FormData;
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-2xl mx-auto px-[5%] pt-24 pb-20">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center mb-10"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] text-[#14253a] leading-tight mb-2">
              Mulțumim{orderConfirmation?.fname ? `, ${orderConfirmation.fname}` : ""}!
            </h1>
            <p className="text-muted-foreground text-base max-w-md mx-auto leading-relaxed">
              {payMethod === "card"
                ? "Plata a fost procesată cu succes. Comanda ta este confirmată!"
                : "Comanda ta a fost înregistrată. Te vom contacta pentru confirmare."}
            </p>
          </motion.div>

          {/* Order summary card */}
          {orderConfirmation && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
              className="bg-card border border-border mb-6"
            >
              <div className="p-6 border-b border-border">
                <div className="text-[10px] font-bold tracking-[3px] uppercase text-[#2e4e7e] mb-1">Rezumatul comenzii</div>
                <div className="text-xs text-muted-foreground">
                  {new Date().toLocaleDateString("ro-RO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </div>
              </div>

              {/* Items list */}
              <div className="p-6 border-b border-border">
                <div className="flex flex-col gap-0">
                  {orderConfirmation.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="bg-[#14253a]/10 text-[#14253a] text-xs font-bold w-6 h-6 flex items-center justify-center rounded">
                          {item.qty}
                        </span>
                        <span className="text-sm text-foreground">{item.name}</span>
                      </div>
                      <span className="font-serif text-sm text-[#14253a]">{item.price * item.qty} lei</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center border-t-2 border-[#14253a] mt-4 pt-4">
                  <span className="text-sm font-semibold text-foreground">Total plătit</span>
                  <span className="font-serif text-2xl text-primary">{orderConfirmation.total} lei</span>
                </div>
              </div>

              {/* Delivery / Pickup info */}
              <div className="p-6 border-b border-border">
                <div className="text-[10px] font-bold tracking-[3px] uppercase text-[#2e4e7e] mb-3">
                  {orderConfirmation.mode === "pickup" ? "Ridicare" : "Livrare"}
                </div>
                {orderConfirmation.mode === "pickup" ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">📅 Data:</span>
                      <span className="text-foreground font-medium">
                        {orderConfirmation.pickupDate
                          ? new Date(orderConfirmation.pickupDate).toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" })
                          : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">🕐 Ora:</span>
                      <span className="text-foreground font-medium">{orderConfirmation.pickupTime || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <span className="text-muted-foreground">📍 Locație:</span>
                      <span className="text-foreground font-medium">DN 68, Totești, Țara Hațegului</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">📅 Data:</span>
                      <span className="text-foreground font-medium">
                        {orderConfirmation.delDate
                          ? new Date(orderConfirmation.delDate).toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" })
                          : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">🕐 Interval:</span>
                      <span className="text-foreground font-medium">{orderConfirmation.delTime || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <span className="text-muted-foreground">📍 Adresă:</span>
                      <span className="text-foreground font-medium">
                        {orderConfirmation.address}{orderConfirmation.city ? `, ${orderConfirmation.city}` : ""}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment method */}
              <div className="p-6">
                <div className="text-[10px] font-bold tracking-[3px] uppercase text-[#2e4e7e] mb-3">Plată</div>
                <div className="flex items-center gap-2 text-sm">
                  {orderConfirmation.payMethod === "card" ? (
                    <>
                      <CreditCard size={16} className="text-[#14253a]" />
                      <span className="text-foreground font-medium">Card / PayPal — Plătit</span>
                    </>
                  ) : (
                    <>
                      <Banknote size={16} className="text-[#14253a]" />
                      <span className="text-foreground font-medium">Cash la {orderConfirmation.mode === "pickup" ? "ridicare" : "livrare"}</span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Next steps info */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.35, ease: "easeOut" }}
            className="bg-[#14253a]/5 border border-[#14253a]/10 p-6 mb-8"
          >
            <div className="text-sm font-semibold text-[#14253a] mb-2">Ce urmează?</div>
            <ul className="text-sm text-muted-foreground space-y-1.5 list-none pl-0">
              <li>✓ Vei primi confirmare pe WhatsApp sau email</li>
              {orderConfirmation?.mode === "pickup" && <li>✓ Vino la DN 68, Totești la ora selectată</li>}
              {orderConfirmation?.mode === "delivery" && <li>✓ Livrarea ajunge la adresa ta în intervalul ales</li>}
              <li>✓ Pentru orice întrebare, scrie-ne pe WhatsApp</li>
            </ul>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link to="/tracking" className="bg-[#14253a] hover:bg-primary text-white px-8 py-3.5 text-[11px] font-bold tracking-widest uppercase no-underline transition-colors">
              Urmărește comanda →
            </Link>
            <Link to="/meniu" className="border border-[#14253a] text-[#14253a] hover:bg-[#14253a] hover:text-white px-8 py-3.5 text-[11px] font-bold tracking-widest uppercase no-underline transition-colors">
              ← Înapoi la meniu
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
          <ShoppingCart className="w-14 h-14 text-muted-foreground mb-6" />
          <h1 className="font-serif text-3xl text-[#14253a] mb-3">Coșul e gol</h1>
          <p className="text-muted-foreground mb-8">Nu ai niciun produs în coș. Alege ceva din meniu și revino!</p>
          <Link to="/meniu" className="bg-[#14253a] hover:bg-primary text-white px-8 py-3.5 text-[11px] font-bold tracking-widest uppercase no-underline transition-colors">
            ← Înapoi la meniu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: "EUR", intent: "capture", locale: "ro_RO" }}>
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-5xl mx-auto px-[5%] pt-24 pb-20">
          {/* Back */}
          <Link to="/meniu" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 no-underline transition-colors">
            <ArrowLeft size={14} /> Înapoi la meniu
          </Link>

          <h1 className="font-serif text-[clamp(2rem,4vw,3.2rem)] text-[#14253a] leading-none mb-2">
            Finalizează<br /><em className="text-primary italic">comanda.</em>
          </h1>
          <p className="text-sm text-muted-foreground font-light mb-6">Completează datele, alege metoda de plată și trimite comanda.</p>

          {/* Preorder notice */}
          <div className="bg-amber-50 border-2 border-amber-400 p-4 mb-10 flex items-start gap-3">
            <span className="text-xl leading-none shrink-0">⚠️</span>
            <div>
              <div className="text-sm font-bold text-amber-900 uppercase tracking-wide mb-0.5">Doar cu precomandă</div>
              <p className="text-xs text-amber-800 leading-relaxed m-0">
                Produsele noastre se pregătesc proaspăt pentru tine. Comanda minimă se face cu cel puțin <strong>o zi înainte</strong>. Alege data dorită mai jos.
              </p>
            </div>
          </div>

          {/* Steps */}
          <div className="flex items-center gap-0 mb-10">
            {["Coș", "Date", "Plată"].map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`flex items-center gap-2 text-[11px] font-semibold tracking-wide uppercase ${i === 0 ? "text-green-600" : i === 1 ? "text-[#14253a]" : "text-muted-foreground"}`}>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${i === 0 ? "bg-green-600 border-green-600 text-white" : i === 1 ? "bg-[#14253a] border-[#14253a] text-white" : "border-border text-muted-foreground"}`}>
                    {i === 0 ? "✓" : i + 1}
                  </div>
                  {s}
                </div>
                {i < 2 && <div className="flex-1 h-px bg-border mx-2 w-8" />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmitCash)} noValidate>
            <div className="flex flex-col gap-6 max-w-3xl">

              {/* STEP 1: Cart summary */}
              <div className="bg-card border border-border p-8">
                <div className="text-[10px] font-bold tracking-[3px] uppercase text-[#2e4e7e] mb-5 pb-2.5 border-b border-border">Comanda ta</div>

                <div className="flex flex-col gap-0 mb-5">
                  {items.map((it) => (
                    <div key={it.id} className="flex items-start justify-between gap-3 py-3 border-b border-border last:border-0">
                      <div className="flex-1">
                        <div className="text-sm text-foreground leading-tight">{it.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">× {it.qty}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="font-serif text-base text-[#14253a]">{it.price * it.qty} lei</div>
                        <button
                          type="button"
                          onClick={() => removeItem(it.id)}
                          className="cursor-pointer text-muted-foreground hover:text-destructive transition-colors p-0.5"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between py-2.5 text-sm text-muted-foreground">
                  <span>Subtotal produse</span>
                  <span>{total} lei</span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between py-2.5 text-sm text-green-600 font-medium">
                    <span>Promoție: 2 Sandwich = preț de 1.5</span>
                    <span>-{promoDiscount.toFixed(0)} lei</span>
                  </div>
                )}
                {mode === "delivery" && (
                  <div className="flex justify-between py-2.5 text-sm text-muted-foreground">
                    <span>Transport</span>
                    <span>{TRANSPORT_RON} lei</span>
                  </div>
                )}
                <div className="flex justify-between items-center border-t-2 border-[#14253a] mt-1 pt-4">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="font-serif text-2xl text-primary">{grandTotal} lei</span>
                </div>
              </div>

              {/* STEP 2: Personal data */}
              <div className="bg-card border border-border p-8">
                <div className="text-[10px] font-bold tracking-[3px] uppercase text-[#2e4e7e] mb-5 pb-2.5 border-b border-border">Date personale</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-[11px] font-semibold tracking-wide text-foreground/70 mb-1.5 block">Prenume <span className="text-primary">*</span></label>
                      <input {...register("fname")} placeholder="Ex: Maria" className="w-full border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-[#2e4e7e] transition-colors" />
                      {errors.fname && <p className="text-[11px] text-destructive mt-1">{errors.fname.message}</p>}
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold tracking-wide text-foreground/70 mb-1.5 block">Nume <span className="text-primary">*</span></label>
                      <input {...register("lname")} placeholder="Ex: Popescu" className="w-full border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-[#2e4e7e] transition-colors" />
                      {errors.lname && <p className="text-[11px] text-destructive mt-1">{errors.lname.message}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-semibold tracking-wide text-foreground/70 mb-1.5 block">Telefon <span className="text-primary">*</span></label>
                      <input {...register("phone")} type="tel" placeholder="+40 7xx xxx xxx" className="w-full border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-[#2e4e7e] transition-colors" />
                      {errors.phone && <p className="text-[11px] text-destructive mt-1">{errors.phone.message}</p>}
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold tracking-wide text-foreground/70 mb-1.5 block">Email <span className="text-primary">*</span></label>
                      <input {...register("email")} type="email" placeholder="tu@exemplu.ro" className="w-full border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-[#2e4e7e] transition-colors" />
                      {errors.email && <p className="text-[11px] text-destructive mt-1">{errors.email.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Delivery */}
                <div className="bg-card border border-border p-8">
                  <div className="text-[10px] font-bold tracking-[3px] uppercase text-[#2e4e7e] mb-5 pb-2.5 border-b border-border">Livrare</div>
                  <div className="grid grid-cols-2 gap-px bg-border mb-6">
                    <button
                      type="button"
                      onClick={() => switchMode("pickup")}
                      className={`cursor-pointer py-3.5 text-[11px] font-semibold tracking-wide uppercase transition-all ${watchMode === "pickup" ? "bg-[#14253a] text-white" : "bg-background text-muted-foreground"}`}
                    >
                      🏪 Ridicare pe loc
                    </button>
                    <button
                      type="button"
                      onClick={() => switchMode("delivery")}
                      className={`cursor-pointer py-3.5 text-[11px] font-semibold tracking-wide uppercase transition-all ${watchMode === "delivery" ? "bg-[#14253a] text-white" : "bg-background text-muted-foreground"}`}
                    >
                      🚗 Livrare la adresă
                    </button>
                  </div>

                  {watchMode === "pickup" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-semibold tracking-wide text-foreground/70 mb-1.5 block">Data ridicării <span className="text-primary">*</span></label>
                        <input {...register("pickupDate")} type="date" min={minOrderDate} className="w-full border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-[#2e4e7e] transition-colors" />
                        {"pickupDate" in errors && errors.pickupDate && <p className="text-[11px] text-destructive mt-1">{errors.pickupDate.message}</p>}
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold tracking-wide text-foreground/70 mb-1.5 block">Ora aproximativă <span className="text-primary">*</span></label>
                        <select {...register("pickupTime")} className="w-full border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-[#2e4e7e] transition-colors">
                          <option value="">-- alege --</option>
                          {["08:00 – 09:00","09:00 – 10:00","10:00 – 11:00","11:00 – 12:00","12:00 – 13:00","13:00 – 14:00","14:00 – 15:00","15:00 – 16:00","16:00 – 17:00","17:00 – 18:00"].map((t) => (
                            <option key={t}>{t}</option>
                          ))}
                        </select>
                        {"pickupTime" in errors && errors.pickupTime && <p className="text-[11px] text-destructive mt-1">{errors.pickupTime.message}</p>}
                      </div>
                      <p className="sm:col-span-2 text-xs text-muted-foreground leading-relaxed">📍 DN 68, Totești, Țara Hațegului — lângă intrarea în sat.</p>
                    </div>
                  )}

                  {watchMode === "delivery" && (
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="text-[11px] font-semibold tracking-wide text-foreground/70 mb-1.5 block">Adresă <span className="text-primary">*</span></label>
                        <input {...register("address")} placeholder="Str. Exemplu nr. 10" className="w-full border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-[#2e4e7e] transition-colors" />
                        {"address" in errors && errors.address && <p className="text-[11px] text-destructive mt-1">{errors.address.message}</p>}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-semibold tracking-wide text-foreground/70 mb-1.5 block">Localitate <span className="text-primary">*</span></label>
                          <input {...register("city")} placeholder="Hațeg" className="w-full border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-[#2e4e7e] transition-colors" />
                          {"city" in errors && errors.city && <p className="text-[11px] text-destructive mt-1">{errors.city.message}</p>}
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold tracking-wide text-foreground/70 mb-1.5 block">Județ</label>
                          <input {...register("county")} placeholder="Hunedoara" className="w-full border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-[#2e4e7e] transition-colors" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-semibold tracking-wide text-foreground/70 mb-1.5 block">Data livrării <span className="text-primary">*</span></label>
                          <input {...register("delDate")} type="date" min={minOrderDate} className="w-full border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-[#2e4e7e] transition-colors" />
                          {"delDate" in errors && errors.delDate && <p className="text-[11px] text-destructive mt-1">{errors.delDate.message}</p>}
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold tracking-wide text-foreground/70 mb-1.5 block">Interval orar <span className="text-primary">*</span></label>
                          <select {...register("delTime")} className="w-full border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-[#2e4e7e] transition-colors">
                            <option value="">-- alege --</option>
                            <option>08:00 – 12:00</option>
                            <option>12:00 – 16:00</option>
                            <option>16:00 – 19:00</option>
                          </select>
                          {"delTime" in errors && errors.delTime && <p className="text-[11px] text-destructive mt-1">{errors.delTime.message}</p>}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">🚗 Livrare disponibilă în zona Hațeg. Costul transportului (+{TRANSPORT_RON} lei) este inclus în total.</p>
                    </div>
                  )}
                </div>

                {/* Observations */}
                <div className="bg-card border border-border p-8">
                  <div className="text-[10px] font-bold tracking-[3px] uppercase text-[#2e4e7e] mb-5 pb-2.5 border-b border-border">Observații (opțional)</div>
                  <textarea
                    {...register("obs")}
                    placeholder="Ex: fără gluten la sandwich, livrare la poartă, etc."
                    className="w-full border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-[#2e4e7e] transition-colors resize-y min-h-[80px]"
                  />
                </div>

              {/* STEP 4: Payment */}
              <div className="bg-card border border-border p-8">
                <div className="text-[10px] font-bold tracking-[3px] uppercase text-[#2e4e7e] mb-5 pb-2.5 border-b border-border">Metodă de plată</div>

                <div className="flex flex-col gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => setPayMethod("cash")}
                    className={`cursor-pointer flex items-center gap-3 p-4 border-2 transition-all ${payMethod === "cash" ? "border-[#14253a] bg-[#14253a]/5" : "border-border hover:border-[#14253a]/30"}`}
                  >
                    <Banknote size={20} className={payMethod === "cash" ? "text-[#14253a]" : "text-muted-foreground"} />
                    <div className="text-left">
                      <div className={`text-sm font-semibold ${payMethod === "cash" ? "text-[#14253a]" : "text-foreground"}`}>Cash la ridicare/livrare</div>
                      <div className="text-xs text-muted-foreground">Plătești numerar când primești comanda</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayMethod("card")}
                    className={`cursor-pointer flex items-center gap-3 p-4 border-2 transition-all ${payMethod === "card" ? "border-[#14253a] bg-[#14253a]/5" : "border-border hover:border-[#14253a]/30"}`}
                  >
                    <CreditCard size={20} className={payMethod === "card" ? "text-[#14253a]" : "text-muted-foreground"} />
                    <div className="text-left">
                      <div className={`text-sm font-semibold ${payMethod === "card" ? "text-[#14253a]" : "text-foreground"}`}>Card / PayPal</div>
                      <div className="text-xs text-muted-foreground">Plată securizată online prin PayPal</div>
                    </div>
                  </button>
                </div>

                {/* Cash button */}
                {payMethod === "cash" && (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="cursor-pointer w-full bg-[#14253a] hover:bg-primary disabled:opacity-50 text-white py-4 text-[11px] font-bold tracking-widest uppercase transition-colors"
                  >
                    {submitting ? "Se trimite..." : "Trimite comanda (plată cash) →"}
                  </button>
                )}

                {/* PayPal buttons */}
                {payMethod === "card" && (
                  <div className="mt-2">
                    <PayPalButtons
                      style={{ layout: "vertical", color: "gold", shape: "rect", label: "pay", height: 46 }}
                      createOrder={async (_data, actions) => {
                        const formData = await validateForPaypal();
                        if (!formData) {
                          throw new Error("Completează câmpurile obligatorii.");
                        }
                        const amountEUR = (grandTotal / RON_TO_EUR).toFixed(2);
                        return actions.order.create({
                          intent: "CAPTURE",
                          purchase_units: [{
                            description: "Comandă SOul Meal · Metanoia DN 68",
                            amount: {
                              currency_code: "EUR",
                              value: amountEUR,
                            },
                          }],
                        });
                      }}
                      onApprove={async (_data, actions) => {
                        if (!actions.order) return;
                        const details = await actions.order.capture();
                        const formData = watch() as FormData;
                        saveOrderConfirmation(formData);
                        await sendOrderToWebhookAndDb(formData, {
                          method: "PayPal",
                          status: details.status ?? "COMPLETED",
                          orderId: details.id,
                          payerEmail: details.payer?.email_address,
                        });
                        clearCart();
                        setSubmitted(true);
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

                <div className="flex items-center justify-center gap-5 mt-5 pt-4 border-t border-border flex-wrap">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span>🔒</span> Securizat</div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span>📞</span> Confirmare WhatsApp</div>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                {payMethod === "cash"
                  ? "Plata se face la ridicare sau la livrare. Vei fi contactat pentru confirmare."
                  : "Plata este procesată securizat prin PayPal. Prețul în EUR este orientativ (1 EUR ≈ 5 RON)."}
              </p>
            </div>
          </form>
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
