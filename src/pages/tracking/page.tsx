import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { motion, AnimatePresence } from "motion/react";
import Footer from "@/components/Footer.tsx";
import {
  Search,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  MapPin,
  History,
  Receipt,
  ChevronDown,
  ChevronUp,
  CalendarDays,
  Phone,
} from "lucide-react";
import Navbar from "@/components/Navbar.tsx";
import AnimatedSection from "@/components/AnimatedSection.tsx";

type OrderStatus = "new" | "in_progress" | "done" | "cancelled";
type FilterStatus = "all" | OrderStatus;

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; icon: typeof Package; bgColor: string }
> = {
  new: { label: "Comandă nouă", color: "text-blue-600", icon: Package, bgColor: "bg-blue-100" },
  in_progress: { label: "În pregătire", color: "text-amber-600", icon: Clock, bgColor: "bg-amber-100" },
  done: { label: "Finalizată", color: "text-green-600", icon: CheckCircle2, bgColor: "bg-green-100" },
  cancelled: { label: "Anulată", color: "text-red-500", icon: XCircle, bgColor: "bg-red-100" },
};

const FILTER_TABS: { key: FilterStatus; label: string }[] = [
  { key: "all", label: "Toate" },
  { key: "new", label: "Noi" },
  { key: "in_progress", label: "În pregătire" },
  { key: "done", label: "Finalizate" },
  { key: "cancelled", label: "Anulate" },
];

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: "new", label: "Primită" },
  { key: "in_progress", label: "În pregătire" },
  { key: "done", label: "Gata" },
];

function getStepIndex(status: OrderStatus): number {
  if (status === "cancelled") return -1;
  return STEPS.findIndex((s) => s.key === status);
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "short",
  });
}

const STORAGE_KEY = "metanoia_tracking_phone";

export default function TrackingPage() {
  const [phone, setPhone] = useState("");
  const [searchPhone, setSearchPhone] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  // Load saved phone from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setPhone(saved);
      setSearchPhone(saved);
    }
  }, []);

  const orders = useQuery(
    api.orders.getByPhone,
    searchPhone ? { phone: searchPhone } : "skip"
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phone.trim().replace(/\s+/g, "");
    if (cleaned.length >= 8) {
      setSearchPhone(cleaned);
      localStorage.setItem(STORAGE_KEY, cleaned);
      setFilter("all");
    }
  };

  const handleClearPhone = () => {
    setPhone("");
    setSearchPhone(null);
    localStorage.removeItem(STORAGE_KEY);
    setFilter("all");
  };

  const toggleExpand = (orderId: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  const hasSearched = searchPhone !== null;
  const isLoading = hasSearched && orders === undefined;

  // Filter orders
  const filteredOrders =
    orders && filter !== "all"
      ? orders.filter((o) => o.status === filter)
      : orders;

  // Stats
  const totalOrders = orders?.length ?? 0;
  const totalSpent = orders?.reduce((sum, o) => sum + o.totalRon, 0) ?? 0;
  const activeOrders = orders?.filter((o) => o.status === "new" || o.status === "in_progress").length ?? 0;

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16 bg-[#14253a]">
        <div className="px-[5%] md:px-[8%] py-16 md:py-24 text-center relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[30%] left-[20%] w-[300px] h-[300px] rounded-full bg-[#1e3a5c]/40 blur-[100px]" />
            <div className="absolute bottom-[20%] right-[10%] w-[200px] h-[200px] rounded-full bg-[#f5a06a]/8 blur-[80px]" />
          </div>

          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] as const }}
          >
            <div className="flex items-center justify-center gap-4 mb-5 text-white/40 text-[10px] font-semibold tracking-[5px] uppercase">
              <span className="w-10 h-px bg-white/25" />
              {"Istoric comenzi"}
              <span className="w-10 h-px bg-white/25" />
            </div>
            <h1 className="font-serif text-[clamp(2rem,6vw,4rem)] text-white leading-tight mb-4">
              Istoricul <em className="text-[#f5a06a] italic">comenzilor</em>
            </h1>
            <p className="text-white/70 max-w-md mx-auto leading-relaxed mb-10 text-balance">
              Introdu numărul de telefon folosit la comandă pentru a vedea toate comenzile tale și statusul acestora.
            </p>

            {/* Search form */}
            <form onSubmit={handleSearch} className="max-w-md mx-auto">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="07xx xxx xxx"
                    className="w-full bg-white/10 border border-white/15 pl-11 pr-5 py-4 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-[#f5a06a]/40 focus:border-[#f5a06a]/40 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="cursor-pointer bg-[#f5a06a] hover:bg-[#e8935d] text-white px-6 py-4 text-[11px] font-bold tracking-[1.5px] uppercase transition-colors flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Caută</span>
                </button>
              </div>
              {searchPhone && (
                <button
                  type="button"
                  onClick={handleClearPhone}
                  className="cursor-pointer text-white/40 hover:text-white/70 text-xs mt-3 transition-colors underline underline-offset-2"
                >
                  Schimbă numărul
                </button>
              )}
            </form>
          </motion.div>
        </div>
      </section>

      {/* Results */}
      <section className="px-[5%] md:px-[8%] py-16 md:py-24 max-w-4xl mx-auto">
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground mt-4 text-sm">Se caută comenzile...</p>
            </motion.div>
          )}

          {hasSearched && orders && orders.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Package className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="font-serif text-xl text-[#14253a] mb-2">Nicio comandă găsită</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                Nu am găsit comenzi asociate cu numărul <strong>{searchPhone}</strong>.
                Verifică dacă ai introdus corect numărul.
              </p>
            </motion.div>
          )}

          {hasSearched && orders && orders.length > 0 && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Stats summary */}
              <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
                <div className="bg-card border border-border rounded-sm p-4 text-center">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 mx-auto mb-2">
                    <Receipt className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-lg md:text-xl font-bold text-[#14253a]">{totalOrders}</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wide">Comenzi</p>
                </div>
                <div className="bg-card border border-border rounded-sm p-4 text-center">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-green-100 mx-auto mb-2">
                    <History className="w-4 h-4 text-green-600" />
                  </div>
                  <p className="text-lg md:text-xl font-bold text-[#14253a]">{totalSpent.toFixed(0)} lei</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wide">Total cheltuit</p>
                </div>
                <div className="bg-card border border-border rounded-sm p-4 text-center">
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-100 mx-auto mb-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-lg md:text-xl font-bold text-[#14253a]">{activeOrders}</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wide">Active</p>
                </div>
              </div>

              {/* Filter tabs */}
              <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-foreground/8">
                {FILTER_TABS.map((tab) => {
                  const count =
                    tab.key === "all"
                      ? orders.length
                      : orders.filter((o) => o.status === tab.key).length;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setFilter(tab.key)}
                      className={`cursor-pointer px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                        filter === tab.key
                          ? "bg-primary text-white"
                          : "bg-foreground/5 text-foreground/60 hover:bg-foreground/10"
                      }`}
                    >
                      {tab.label} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Orders count */}
              <div className="flex items-center gap-2.5 mb-4 text-primary">
                <span className="w-6 h-px bg-primary" />
                <span className="text-[9px] font-semibold tracking-[4px] uppercase">
                  {filteredOrders?.length ?? 0}{" "}
                  {(filteredOrders?.length ?? 0) === 1 ? "comandă" : "comenzi"}
                </span>
              </div>

              {/* Orders list */}
              <div className="space-y-4">
                {filteredOrders?.map((order, i) => {
                  const config = STATUS_CONFIG[order.status];
                  const StatusIcon = config.icon;
                  const stepIndex = getStepIndex(order.status);
                  const isCancelled = order.status === "cancelled";
                  const isExpanded = expandedOrders.has(order._id);

                  return (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.4, ease: "easeOut" }}
                      className="bg-card border border-border rounded-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Collapsed header - clickable */}
                      <button
                        type="button"
                        onClick={() => toggleExpand(order._id)}
                        className="cursor-pointer w-full p-4 md:p-6 flex items-center justify-between gap-3 text-left"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${config.bgColor}`}>
                            <StatusIcon className={`w-4 h-4 ${config.color}`} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-[#14253a] truncate">
                                {order.totalRon.toFixed(2)} lei
                              </span>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${config.bgColor} ${config.color}`}>
                                {config.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <CalendarDays className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {formatShortDate(order._creationTime)}
                              </span>
                              <span className="text-muted-foreground/30">·</span>
                              <span className="text-xs text-muted-foreground">
                                {order.items.length} {order.items.length === 1 ? "produs" : "produse"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex-shrink-0 text-muted-foreground">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      </button>

                      {/* Expanded details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 md:px-6 pb-5 border-t border-foreground/6 pt-4">
                              {/* Full date & mode */}
                              <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  <CalendarDays className="w-3.5 h-3.5" />
                                  <span>{formatDate(order._creationTime)}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                  {order.mode === "delivery" ? (
                                    <Truck className="w-3.5 h-3.5" />
                                  ) : (
                                    <MapPin className="w-3.5 h-3.5" />
                                  )}
                                  <span>{order.mode === "delivery" ? "Livrare" : "Ridicare din magazin"}</span>
                                </div>
                              </div>

                              {/* Delivery details */}
                              {order.mode === "delivery" && order.address && (
                                <div className="bg-foreground/3 rounded-sm p-3 mb-4 text-xs text-foreground/70">
                                  <span className="font-medium text-foreground/90">Adresă:</span>{" "}
                                  {order.address}
                                  {order.city && `, ${order.city}`}
                                  {order.county && `, ${order.county}`}
                                  {order.delDate && (
                                    <span className="block mt-1">
                                      <span className="font-medium text-foreground/90">Data livrare:</span>{" "}
                                      {order.delDate} {order.delTime && `la ${order.delTime}`}
                                    </span>
                                  )}
                                </div>
                              )}

                              {order.mode === "pickup" && order.pickupDate && (
                                <div className="bg-foreground/3 rounded-sm p-3 mb-4 text-xs text-foreground/70">
                                  <span className="font-medium text-foreground/90">Ridicare:</span>{" "}
                                  {order.pickupDate} {order.pickupTime && `la ${order.pickupTime}`}
                                </div>
                              )}

                              {/* Progress steps */}
                              {!isCancelled && (
                                <div className="mb-5">
                                  <div className="flex items-center justify-between relative">
                                    <div className="absolute top-3 left-0 right-0 h-0.5 bg-foreground/10" />
                                    <div
                                      className="absolute top-3 left-0 h-0.5 bg-primary transition-all duration-500"
                                      style={{ width: `${(stepIndex / (STEPS.length - 1)) * 100}%` }}
                                    />
                                    {STEPS.map((step, si) => {
                                      const isActive = si <= stepIndex;
                                      const isCurrent = si === stepIndex;
                                      return (
                                        <div key={step.key} className="relative flex flex-col items-center z-10">
                                          <div
                                            className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                                              isActive
                                                ? "bg-primary border-primary"
                                                : "bg-background border-foreground/20"
                                            } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}
                                          >
                                            {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                          </div>
                                          <span
                                            className={`text-[10px] mt-2 font-medium tracking-wide ${
                                              isActive ? "text-[#14253a]" : "text-muted-foreground"
                                            }`}
                                          >
                                            {step.label}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Items */}
                              <div className="border-t border-foreground/8 pt-3">
                                <div className="space-y-1.5">
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                      <span className="text-foreground/80">
                                        {item.qty}x {item.name}
                                      </span>
                                      <span className="text-muted-foreground font-medium">
                                        {(item.price * item.qty).toFixed(2)} lei
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-foreground/8">
                                  <span className="text-sm font-semibold text-[#14253a]">Total</span>
                                  <span className="text-sm font-bold text-primary">
                                    {order.totalRon.toFixed(2)} lei
                                  </span>
                                </div>
                              </div>

                              {/* Notes */}
                              {order.obs && (
                                <div className="mt-3 bg-amber-50 border border-amber-200 rounded-sm p-3 text-xs text-amber-800">
                                  <span className="font-medium">Observații:</span> {order.obs}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              {/* Empty filter result */}
              {filteredOrders && filteredOrders.length === 0 && filter !== "all" && (
                <div className="text-center py-10">
                  <p className="text-muted-foreground text-sm">
                    Nu ai comenzi cu statusul „{FILTER_TABS.find((t) => t.key === filter)?.label}".
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Not searched yet state */}
        {!hasSearched && (
          <AnimatedSection className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <History className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-serif text-xl text-[#14253a] mb-2">Istoricul comenzilor</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Introdu numărul de telefon pe care l-ai folosit la plasarea comenzii
              pentru a vedea toate comenzile tale și statusul lor.
            </p>
          </AnimatedSection>
        )}
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
