import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { motion, AnimatePresence } from "motion/react";
import { Package, ChevronDown, ChevronUp, Mail, Phone, Crown, User } from "lucide-react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

export default function BoxSubscribersAdmin() {
  const subscribers = useQuery(api.box.listSubscriptions, {});
  const [expanded, setExpanded] = useState(false);

  const activeCount = subscribers?.filter((s) => s.status === "active").length ?? 0;

  return (
    <div className="bg-white border border-border p-5 mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="cursor-pointer w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Package size={18} className="text-[#f5a06a]" />
          <span className="font-serif text-base text-[#14253a]">Cutia Metanoia — Abonați</span>
          <span className="text-xs text-muted-foreground bg-[#f5a06a]/10 text-[#f5a06a] px-2 py-0.5 rounded-full font-semibold">
            {activeCount} activi
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
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {subscribers.map((sub) => (
                    <div key={sub._id} className="flex items-center justify-between py-3 px-4 bg-muted/50 rounded-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          sub.tier === "colecționar" ? "bg-[#f5a06a]/10" : "bg-primary/10"
                        }`}>
                          {sub.tier === "colecționar" ? (
                            <Crown size={14} className="text-[#f5a06a]" />
                          ) : (
                            <User size={14} className="text-primary" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-foreground truncate">{sub.name}</span>
                            <span className={`text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-sm ${
                              sub.tier === "colecționar" ? "bg-[#f5a06a]/10 text-[#f5a06a]" : "bg-primary/10 text-primary"
                            }`}>
                              {sub.tier}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail size={10} /> {sub.email}
                            </span>
                            {sub.phone && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Phone size={10} /> {sub.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <div className={`text-[9px] font-bold tracking-wider uppercase ${
                          sub.status === "active" ? "text-green-600" : "text-muted-foreground"
                        }`}>
                          {sub.status === "active" ? "Activ" : sub.status}
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                          {format(new Date(sub.subscribedAt), "d MMM yyyy", { locale: ro })}
                        </div>
                      </div>
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
