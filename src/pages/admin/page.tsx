import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation, Authenticated } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.js";
import { motion, AnimatePresence } from "motion/react";
import { Lock, Phone, Mail, MapPin, Clock, Package, CheckCheck, X, ChevronDown, ChevronUp, AlertCircle, Megaphone, Users, Trash2, Volume2, VolumeX, Bell, BellOff, BellRing, CalendarClock, ShoppingBag, FileText, Settings, Sparkles, Warehouse, BarChart3 } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications.ts";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { MetanoiaLogo } from "@/components/Navbar.tsx";
import { toast } from "sonner";
import { DAY_NAMES_RO } from "@/components/ScheduleStatus.tsx";
import type { ScheduleEntry } from "@/components/ScheduleStatus.tsx";
import MenuAdmin from "./_components/MenuAdmin.tsx";
import BorcaneAdmin from "./_components/BorcaneAdmin.tsx";
import PacheteAdmin from "./_components/PacheteAdmin.tsx";
import SeedDataAdmin from "./_components/SeedDataAdmin.tsx";
import GalleryAdmin from "./_components/GalleryAdmin.tsx";
import DailySpecialAdmin from "./_components/DailySpecialAdmin.tsx";
import BlogAdmin from "./_components/BlogAdmin.tsx";
import BlogCommentsAdmin from "./_components/BlogCommentsAdmin.tsx";
import LoyaltyAdmin from "./_components/LoyaltyAdmin.tsx";
import ReviewsAdmin from "./_components/ReviewsAdmin.tsx";
import AiAdmin from "./_components/AiAdmin.tsx";
import PartnersAdmin from "./_components/PartnersAdmin.tsx";
import InventoryAdmin from "./_components/InventoryAdmin.tsx";
import SlidesAdmin from "./_components/SlidesAdmin.tsx";
import SiteInfoAdmin from "./_components/SiteInfoAdmin.tsx";
import AboutAdmin from "./_components/AboutAdmin.tsx";
import StatsAdmin from "./_components/StatsAdmin.tsx";
import BoxSubscribersAdmin from "./_components/BoxSubscribersAdmin.tsx";

// Simple PIN lock — not cryptographic, just keeps casual visitors out
const ADMIN_PIN = "Beyourself17";

type OrderStatus = "new" | "in_progress" | "done" | "cancelled";

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  new: { label: "Nouă", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  in_progress: { label: "În lucru", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  done: { label: "Finalizată", color: "text-green-700", bg: "bg-green-50 border-green-200" },
  cancelled: { label: "Anulată", color: "text-red-600", bg: "bg-red-50 border-red-200" },
};

type Order = {
  _id: Id<"orders">;
  _creationTime: number;
  fname: string;
  lname: string;
  phone: string;
  email: string;
  mode: "pickup" | "delivery";
  pickupDate?: string;
  pickupTime?: string;
  address?: string;
  city?: string;
  county?: string;
  delDate?: string;
  delTime?: string;
  obs?: string;
  items: { name: string; price: number; qty: number }[];
  totalRon: number;
  status: OrderStatus;
};

function OrderCard({ order }: { order: Order }) {
  const updateStatus = useMutation(api.orders.updateStatus);
  const removeOrder = useMutation(api.orders.remove);
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  const cfg = STATUS_CONFIG[order.status];
  const createdAt = new Date(order._creationTime);

  const setStatus = async (status: OrderStatus) => {
    setUpdating(true);
    await updateStatus({ id: order._id, status });
    setUpdating(false);
  };

  const handleDelete = async () => {
    if (!window.confirm("Sigur vrei să ștergi această comandă? Acțiunea este ireversibilă.")) return;
    setUpdating(true);
    await removeOrder({ id: order._id });
    toast.success("Comanda a fost ștearsă");
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-none bg-white overflow-hidden ${order.status === "done" ? "opacity-60" : ""}`}
    >
      {/* Header row */}
      <div className="flex items-start gap-4 p-5">
        {/* Status badge */}
        <div className={`shrink-0 text-[10px] font-bold tracking-[2px] uppercase px-2.5 py-1 border ${cfg.bg} ${cfg.color}`}>
          {cfg.label}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-serif text-lg text-[#14253a] leading-tight">{order.fname} {order.lname}</span>
            <span className="text-[10px] text-muted-foreground tracking-wider font-mono">
              #{order._id.slice(-6).toUpperCase()}
            </span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone size={10} /> {order.phone}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Mail size={10} /> {order.email}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock size={10} /> {format(createdAt, "d MMM yyyy, HH:mm", { locale: ro })}
            </span>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className="font-serif text-2xl text-[#14253a]">{order.totalRon} <small className="text-xs font-sans text-muted-foreground">lei</small></div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
            {order.mode === "pickup" ? "🏪 Ridicare" : "🚗 Livrare"}
          </div>
        </div>
      </div>

      {/* Items summary bar */}
      <div className="px-5 pb-3 flex flex-wrap gap-1.5">
        {order.items.map((it) => (
          <span key={it.name} className="text-[11px] bg-[#f0ebe2] text-[#14253a] px-2 py-0.5 font-medium">
            {it.qty}× {it.name}
          </span>
        ))}
      </div>

      {/* Expandable details */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="cursor-pointer w-full flex items-center justify-between px-5 py-2.5 text-[11px] font-semibold tracking-wide uppercase text-muted-foreground border-t border-border hover:bg-muted/30 transition-colors"
      >
        <span className="flex items-center gap-1.5"><Package size={12} /> Detalii comandă</span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-border pt-4 grid md:grid-cols-2 gap-5">
              {/* Delivery info */}
              <div>
                <p className="text-[10px] font-bold tracking-[3px] uppercase text-primary/70 mb-3">
                  {order.mode === "pickup" ? "Ridicare" : "Livrare"}
                </p>
                {order.mode === "pickup" ? (
                  <div className="text-sm text-foreground space-y-1">
                    <p className="flex items-center gap-2"><Clock size={12} className="text-muted-foreground" /> {order.pickupDate} la {order.pickupTime}</p>
                    <p className="flex items-center gap-2"><MapPin size={12} className="text-muted-foreground" /> DN 68, Totești</p>
                  </div>
                ) : (
                  <div className="text-sm text-foreground space-y-1">
                    <p className="flex items-center gap-2"><MapPin size={12} className="text-muted-foreground" /> {order.address}, {order.city}{order.county ? `, ${order.county}` : ""}</p>
                    <p className="flex items-center gap-2"><Clock size={12} className="text-muted-foreground" /> {order.delDate}, {order.delTime}</p>
                  </div>
                )}
                {order.obs && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-100 text-xs text-amber-800">
                    <strong>Observații:</strong> {order.obs}
                  </div>
                )}
              </div>

              {/* Items breakdown */}
              <div>
                <p className="text-[10px] font-bold tracking-[3px] uppercase text-primary/70 mb-3">Produse</p>
                <div className="space-y-1.5">
                  {order.items.map((it) => (
                    <div key={it.name} className="flex justify-between text-sm">
                      <span className="text-foreground">{it.qty}× {it.name}</span>
                      <span className="text-muted-foreground font-mono">{it.price * it.qty} lei</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-semibold border-t border-border pt-2 mt-2">
                    <span>Total</span>
                    <span className="text-primary">{order.totalRon} lei</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action bar */}
      <div className="flex gap-0 border-t border-border">
        {(["new", "in_progress", "done", "cancelled"] as OrderStatus[])
          .filter((s) => s !== order.status)
          .map((s) => {
            const c = STATUS_CONFIG[s];
            return (
              <button
                key={s}
                disabled={updating}
                onClick={() => setStatus(s)}
                className={`cursor-pointer flex-1 py-2.5 text-[10px] font-bold tracking-wider uppercase transition-all border-r border-border hover:opacity-80 disabled:opacity-40 ${c.bg} ${c.color}`}
              >
                {s === "done" && <CheckCheck size={11} className="inline mr-1" />}
                {s === "cancelled" && <X size={11} className="inline mr-1" />}
                {c.label}
              </button>
            );
          })}
        <button
          disabled={updating}
          onClick={handleDelete}
          className="cursor-pointer px-3 py-2.5 text-[10px] font-bold tracking-wider uppercase transition-all hover:opacity-80 disabled:opacity-40 bg-red-50 border-red-200 text-red-600"
          title="Șterge comanda"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  );
}

function NewsletterAdmin() {
  const subscribers = useQuery(api.newsletter.list, {});
  const removeSubscriber = useMutation(api.newsletter.remove);
  const [expanded, setExpanded] = useState(false);

  const handleRemove = async (id: Id<"newsletter">) => {
    await removeSubscriber({ id });
    toast.success("Abonat șters");
  };

  return (
    <div className="bg-white border border-border p-5 mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="cursor-pointer w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Users size={18} className="text-primary" />
          <span className="font-serif text-base text-[#14253a]">Newsletter</span>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {subscribers?.length ?? 0} abonați
          </span>
        </div>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 border-t border-border pt-4">
              {!subscribers || subscribers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Niciun abonat încă.
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {subscribers.map((sub) => (
                    <div key={sub._id} className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-sm">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-muted-foreground" />
                        <span className="text-sm text-foreground">{sub.email}</span>
                      </div>
                      <button
                        onClick={() => handleRemove(sub._id)}
                        className="cursor-pointer text-red-400 hover:text-red-600 transition-colors p-1"
                        title="Șterge"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PromoBannerAdmin() {
  const banner = useQuery(api.promoBanner.get, {});
  const upsert = useMutation(api.promoBanner.upsert);
  const [text, setText] = useState("");
  const [emoji, setEmoji] = useState("");
  const [active, setActive] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Sync initial values from DB
  if (banner && !initialized) {
    setText(banner.text);
    setEmoji(banner.emoji ?? "");
    setActive(banner.active);
    setInitialized(true);
  }

  const handleSave = async () => {
    if (!text.trim()) {
      toast.error("Scrie un text pentru banner.");
      return;
    }
    await upsert({ text: text.trim(), active, emoji: emoji.trim() || undefined });
    toast.success("Banner actualizat!");
  };

  return (
    <div className="bg-white border border-border p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Megaphone size={16} className="text-primary" />
        <h3 className="font-serif text-lg text-[#14253a]">Banner Promoțional</h3>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={emoji}
            onChange={(e) => setEmoji(e.target.value)}
            placeholder="Emoji (ex: 🎉)"
            className="w-20 border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-[#2e4e7e] transition-colors text-center"
          />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Textul bannerului (ex: -20% la toate borcanele!)"
            className="flex-1 border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-[#2e4e7e] transition-colors"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="w-4 h-4 accent-primary cursor-pointer"
            />
            <span className="text-sm text-foreground">Activ pe site</span>
          </label>

          <button
            onClick={handleSave}
            className="cursor-pointer bg-[#14253a] text-white text-[11px] font-bold tracking-widest uppercase px-6 py-2.5 hover:bg-primary transition-colors"
          >
            Salvează
          </button>
        </div>

        {banner && (
          <div className="text-xs text-muted-foreground mt-1">
            Status actual: <span className={banner.active ? "text-green-600 font-semibold" : "text-red-500 font-semibold"}>{banner.active ? "Activ" : "Inactiv"}</span>
            {banner.text && <> — „{banner.text}"</>}
          </div>
        )}
      </div>
    </div>
  );
}

function ScheduleAdmin() {
  const schedule = useQuery(api.schedule.get, {});
  const updateSchedule = useMutation(api.schedule.update);
  const [localSchedule, setLocalSchedule] = useState<ScheduleEntry[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync schedule from DB to local state on first load
  if (schedule && !initialized) {
    setLocalSchedule(schedule);
    setInitialized(true);
  }

  const handleTimeChange = (dayOfWeek: number, field: "openTime" | "closeTime", value: string) => {
    setLocalSchedule((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d))
    );
  };

  const handleClosedToggle = (dayOfWeek: number) => {
    setLocalSchedule((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, isClosed: !d.isClosed } : d))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    await updateSchedule({ schedule: localSchedule });
    setSaving(false);
    toast.success("Programul a fost actualizat!");
  };

  return (
    <div className="bg-white border border-border p-6 mb-8">
      <div className="flex items-center gap-2 mb-5">
        <CalendarClock size={16} className="text-primary" />
        <h3 className="font-serif text-lg text-[#14253a]">Program de funcționare</h3>
      </div>

      {!schedule ? (
        <div className="h-40 animate-pulse bg-muted" />
      ) : (
        <div className="space-y-2">
          {localSchedule.map((day) => (
            <div key={day.dayOfWeek} className="flex items-center gap-3 py-2 px-3 bg-muted/30 rounded-sm">
              <span className="w-24 text-sm font-medium text-[#14253a]">
                {DAY_NAMES_RO[day.dayOfWeek]}
              </span>

              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={day.isClosed}
                  onChange={() => handleClosedToggle(day.dayOfWeek)}
                  className="w-4 h-4 accent-red-500 cursor-pointer"
                />
                <span className="text-xs text-muted-foreground">Închis</span>
              </label>

              {!day.isClosed && (
                <div className="flex items-center gap-2 ml-auto">
                  <input
                    type="time"
                    value={day.openTime}
                    onChange={(e) => handleTimeChange(day.dayOfWeek, "openTime", e.target.value)}
                    className="border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-primary transition-colors"
                  />
                  <span className="text-muted-foreground text-sm">–</span>
                  <input
                    type="time"
                    value={day.closeTime}
                    onChange={(e) => handleTimeChange(day.dayOfWeek, "closeTime", e.target.value)}
                    className="border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
              )}

              {day.isClosed && (
                <span className="ml-auto text-xs text-red-500 font-medium">Închis toată ziua</span>
              )}
            </div>
          ))}

          <div className="pt-3 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="cursor-pointer bg-[#14253a] text-white text-[11px] font-bold tracking-widest uppercase px-6 py-2.5 hover:bg-primary transition-colors disabled:opacity-50"
            >
              {saving ? "Se salvează..." : "Salvează programul"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminDashboard() {
  const orders = useQuery(api.orders.listAll, {});
  const removeAllOrders = useMutation(api.orders.removeAll);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "settings" | "ai" | "inventory" | "stats">("orders");
  const prevNewCountRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const { status: pushStatus, subscribe: pushSubscribe, unsubscribe: pushUnsubscribe } = usePushNotifications();

  // Play a pleasant chime using Web Audio API
  const playNotificationSound = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      // Two-note chime (C5 + E5)
      const notes = [523.25, 659.25];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + i * 0.15);
        gain.gain.linearRampToValueAtTime(0.3, now + i * 0.15 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.15);
        osc.stop(now + i * 0.15 + 0.5);
      });
    } catch {
      // Audio context may not be available
    }
  }, []);

  // Detect new orders and play sound
  const newCount = orders?.filter((o) => o.status === "new").length ?? 0;

  useEffect(() => {
    if (prevNewCountRef.current === null) {
      // First load, just store the count
      prevNewCountRef.current = newCount;
      return;
    }

    if (newCount > prevNewCountRef.current && soundEnabled) {
      playNotificationSound();
      toast("Comandă nouă!", {
        icon: "🔔",
        description: "O nouă comandă a fost primită.",
      });
    }

    prevNewCountRef.current = newCount;
  }, [newCount, soundEnabled, playNotificationSound]);

  const filtered = orders?.filter((o) => filter === "all" || o.status === filter) ?? [];
  const counts = {
    new: orders?.filter((o) => o.status === "new").length ?? 0,
    in_progress: orders?.filter((o) => o.status === "in_progress").length ?? 0,
    done: orders?.filter((o) => o.status === "done").length ?? 0,
    cancelled: orders?.filter((o) => o.status === "cancelled").length ?? 0,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-[#0f2035] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MetanoiaLogo size={36} />
          <div>
            <div className="font-serif text-white text-base">Metanoia Admin</div>
            <div className="text-[9px] tracking-[2.5px] uppercase text-white/40">Panou administrare</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* New orders badge */}
          {newCount > 0 && (
            <div className="flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-3 py-1.5 rounded-full">
              <Bell size={13} className="text-blue-300 animate-pulse" />
              <span className="text-[10px] font-bold tracking-wider text-blue-200">
                {newCount} {newCount === 1 ? "nouă" : "noi"}
              </span>
            </div>
          )}
          {/* Push notifications toggle */}
          <button
            onClick={async () => {
              if (pushStatus === "subscribed") {
                await pushUnsubscribe();
                toast.success("Notificările push au fost dezactivate");
              } else if (pushStatus === "unsubscribed") {
                const result = await pushSubscribe();
                if (result && "subscribed" in result && result.subscribed) {
                  toast.success("Notificările push au fost activate!");
                }
              }
            }}
            className="cursor-pointer flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors"
            title={pushStatus === "subscribed" ? "Dezactivează notificări push" : pushStatus === "denied" ? "Notificări blocate în browser" : pushStatus === "iframe" ? "Publică app-ul pentru a testa" : "Activează notificări push"}
          >
            {pushStatus === "subscribed" ? (
              <BellRing size={18} className="text-green-400" />
            ) : pushStatus === "denied" ? (
              <BellOff size={18} className="text-red-400" />
            ) : (
              <BellOff size={18} />
            )}
            <span className="text-[9px] tracking-wider uppercase hidden sm:inline">
              {pushStatus === "subscribed" ? "Push activ" : pushStatus === "denied" ? "Blocat" : pushStatus === "iframe" ? "Publică pt. test" : "Push oprit"}
            </span>
          </button>
          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="cursor-pointer flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors"
            title={soundEnabled ? "Dezactivează sunetul" : "Activează sunetul"}
          >
            {soundEnabled ? (
              <Volume2 size={18} className="text-[#f5a06a]" />
            ) : (
              <VolumeX size={18} />
            )}
            <span className="text-[9px] tracking-wider uppercase hidden sm:inline">
              {soundEnabled ? "Sunet activ" : "Sunet oprit"}
            </span>
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-white border-b-2 border-border px-2 sm:px-6 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto flex gap-0">
          {([
            { id: "orders" as const, label: "Comenzi", icon: ShoppingBag, count: orders?.length },
            { id: "stats" as const, label: "Statistici", icon: BarChart3 },
            { id: "inventory" as const, label: "Stocuri", icon: Warehouse },
            { id: "products" as const, label: "Produse", icon: FileText },
            { id: "settings" as const, label: "Setări", icon: Settings },
            { id: "ai" as const, label: "AI", icon: Sparkles },
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-sm font-bold tracking-wide uppercase border-b-3 transition-colors ${
                activeTab === tab.id
                  ? "border-[#f5a06a] text-[#14253a] bg-[#f5a06a]/10"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30"
              }`}
            >
              <tab.icon size={18} className="sm:w-4 sm:h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded-full">{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* ─── ORDERS TAB ─── */}
        {activeTab === "orders" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              {(["new", "in_progress", "done", "cancelled"] as OrderStatus[]).map((s) => {
                const c = STATUS_CONFIG[s];
                return (
                  <button
                    key={s}
                    onClick={() => setFilter(filter === s ? "all" : s)}
                    className={`cursor-pointer text-left p-4 border-2 transition-all ${filter === s ? `${c.bg} ${c.color} border-current` : "bg-white border-transparent hover:border-border"}`}
                  >
                    <div className="text-2xl font-serif text-[#14253a] mb-0.5">{counts[s]}</div>
                    <div className={`text-[10px] font-bold tracking-[2px] uppercase ${filter === s ? c.color : "text-muted-foreground"}`}>{c.label}</div>
                  </button>
                );
              })}
            </div>

            {/* Filters */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl text-[#14253a]">
                {filter === "all" ? "Toate comenzile" : `Comenzi — ${STATUS_CONFIG[filter].label}`}
              </h2>
              <div className="flex items-center gap-3">
                {filter !== "all" && (
                  <button onClick={() => setFilter("all")} className="cursor-pointer text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                    <X size={12} /> Resetează filtrul
                  </button>
                )}
                {orders && orders.length > 0 && (
                  <button
                    onClick={async () => {
                      if (!window.confirm(`Sigur vrei să ștergi TOATE cele ${orders.length} comenzi? Acțiunea este ireversibilă!`)) return;
                      await removeAllOrders({});
                      toast.success("Toate comenzile au fost șterse");
                    }}
                    className="cursor-pointer text-xs text-red-500 hover:text-red-700 flex items-center gap-1 bg-red-50 px-2.5 py-1.5 border border-red-200 font-semibold"
                  >
                    <Trash2 size={12} /> Șterge toate
                  </button>
                )}
              </div>
            </div>

            {/* Orders list */}
            {orders === undefined ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-white animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white border border-border p-12 text-center">
                <AlertCircle size={32} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Nu există comenzi{filter !== "all" ? ` cu statusul „${STATUS_CONFIG[filter].label}"` : ""} momentan.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((o) => (
                  <OrderCard key={o._id} order={o as Order} />
                ))}
              </div>
            )}
          </>
        )}

        {/* ─── INVENTORY TAB ─── */}
        {activeTab === "inventory" && (
          <div className="bg-white border border-border p-6">
            <InventoryAdmin />
          </div>
        )}

        {/* ─── STATS TAB ─── */}
        {activeTab === "stats" && (
          <StatsAdmin />
        )}

        {/* ─── PRODUCTS TAB ─── */}
        {activeTab === "products" && (
          <div className="space-y-8">
            <div className="bg-white border border-border p-6">
              <SlidesAdmin />
            </div>
            <SeedDataAdmin />
            <div className="bg-white border border-border p-6">
              <MenuAdmin />
            </div>
            <div className="bg-white border border-border p-6">
              <BorcaneAdmin />
            </div>
            <div className="bg-white border border-border p-6">
              <PacheteAdmin />
            </div>
            <div className="bg-white border border-border p-6">
              <GalleryAdmin />
            </div>
            <div className="bg-white border border-border p-6">
              <BlogAdmin />
            </div>
            <div className="bg-white border border-border p-6">
              <BlogCommentsAdmin />
            </div>
            <div className="bg-white border border-border p-6">
              <PartnersAdmin />
            </div>
          </div>
        )}

        {/* ─── SETTINGS TAB ─── */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <div className="bg-white border border-border p-6">
              <SiteInfoAdmin />
            </div>
            <div className="bg-white border border-border p-6">
              <AboutAdmin />
            </div>
            <div className="bg-white border border-border p-6">
              <ReviewsAdmin />
            </div>
            <div className="bg-white border border-border p-6">
              <DailySpecialAdmin />
            </div>
            <div className="bg-white border border-border p-6">
              <LoyaltyAdmin />
            </div>
            <PromoBannerAdmin />
            <ScheduleAdmin />
            <BoxSubscribersAdmin />
            <NewsletterAdmin />
          </div>
        )}

        {/* ─── AI TAB ─── */}
        {activeTab === "ai" && (
          <div className="bg-white border border-border p-6">
            <AiAdmin />
          </div>
        )}
      </div>
    </div>
  );
}

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      onUnlock();
    } else {
      setError(true);
      setPin("");
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f2035] flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        <MetanoiaLogo size={56} />
        <div className="mt-6 mb-2 font-serif text-white text-3xl">Admin</div>
        <div className="text-white/40 text-sm mb-10 tracking-wider">Panou comenzi Metanoia</div>

        <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4">
          <div className="relative">
            <Lock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN acces"
              maxLength={100}
              autoFocus
              className={`pl-10 pr-4 py-3.5 bg-white/10 border text-white placeholder-white/30 text-center text-xl tracking-[0.5em] outline-none w-72 transition-all ${
                error ? "border-red-400 animate-pulse" : "border-white/20 focus:border-white/50"
              }`}
            />
          </div>
          {error && <p className="text-red-400 text-sm">PIN incorect</p>}
          <button
            type="submit"
            className="cursor-pointer bg-[#f5a06a] text-[#0f2035] font-bold text-[11px] tracking-widest uppercase px-10 py-3.5 hover:bg-white transition-colors"
          >
            Intră →
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);

  return (
    <Authenticated>
      <AdminPageInner unlocked={unlocked} setUnlocked={setUnlocked} />
    </Authenticated>
  );
}

function AdminPageInner({ unlocked, setUnlocked }: { unlocked: boolean; setUnlocked: (v: boolean) => void }) {
  const user = useQuery(api.users.getCurrentUser, {});
  const promoteToAdmin = useMutation(api.users.promoteToAdmin);

  // If user is admin, skip PIN
  const isAdmin = user?.role === "admin";

  // Auto-promote after PIN unlock (for first-time setup)
  useEffect(() => {
    if (unlocked && user && user.role !== "admin") {
      promoteToAdmin().catch(() => {});
    }
  }, [unlocked, user, promoteToAdmin]);

  if (!isAdmin && !unlocked) {
    return <PinGate onUnlock={() => setUnlocked(true)} />;
  }

  return <AdminDashboard />;
}
