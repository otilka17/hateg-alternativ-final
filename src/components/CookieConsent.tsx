import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Cookie, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const CONSENT_KEY = "metanoia_cookie_consent";

type ConsentState = "accepted" | "rejected" | null;

function getStoredConsent(): ConsentState {
  try {
    const val = localStorage.getItem(CONSENT_KEY);
    if (val === "accepted" || val === "rejected") return val;
    return null;
  } catch {
    return null;
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Small delay so it doesn't flash on page load
    const timer = setTimeout(() => {
      if (getStoredConsent() === null) {
        setVisible(true);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem(CONSENT_KEY, "rejected");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6"
        >
          <div className="max-w-2xl mx-auto bg-white border border-border shadow-2xl shadow-black/10">
            {/* Main content */}
            <div className="p-5 md:p-6">
              <div className="flex items-start gap-3 mb-3">
                <div className="shrink-0 w-9 h-9 bg-[#14253a]/10 rounded-full flex items-center justify-center mt-0.5">
                  <Cookie size={16} className="text-[#14253a]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-base text-[#14253a] mb-1">Respectăm confidențialitatea ta</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Folosim cookie-uri esențiale pentru funcționarea site-ului și cookie-uri analitice pentru a îmbunătăți experiența ta.
                    Nu vindem date personale terților.
                  </p>
                </div>
              </div>

              {/* Expandable details */}
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-border pt-4 mt-3 mb-4">
                      <div className="space-y-3">
                        <div className="flex items-start gap-2.5">
                          <Shield size={14} className="text-green-600 mt-0.5 shrink-0" />
                          <div>
                            <div className="text-xs font-semibold text-[#14253a]">Cookie-uri esențiale</div>
                            <div className="text-[11px] text-muted-foreground">Necesare funcționării site-ului (autentificare, coș, preferințe). Nu pot fi dezactivate.</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <Shield size={14} className="text-blue-600 mt-0.5 shrink-0" />
                          <div>
                            <div className="text-xs font-semibold text-[#14253a]">Cookie-uri analitice</div>
                            <div className="text-[11px] text-muted-foreground">Ne ajută să înțelegem cum este folosit site-ul pentru a-l îmbunătăți. Datele sunt anonimizate.</div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          Conform GDPR (Regulamentul General privind Protecția Datelor), ai dreptul să accesezi, rectifici sau ștergi datele tale personale.
                          Pentru orice solicitare, scrie-ne la{" "}
                          <a href="mailto:hategalternativ@gmail.com" className="text-primary hover:underline">hategalternativ@gmail.com</a>{" "}
                          sau vizitează <Link to="/contact" className="text-primary hover:underline">pagina de contact</Link>.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <button
                  onClick={handleAccept}
                  className="cursor-pointer bg-[#14253a] hover:bg-primary text-white text-[11px] font-bold tracking-widest uppercase px-6 py-3 transition-colors"
                >
                  Accept toate
                </button>
                <button
                  onClick={handleReject}
                  className="cursor-pointer border border-border hover:border-[#14253a]/30 text-[#14253a] text-[11px] font-bold tracking-widest uppercase px-6 py-3 transition-colors"
                >
                  Doar esențiale
                </button>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="cursor-pointer text-[11px] text-muted-foreground hover:text-foreground font-medium tracking-wide transition-colors ml-auto"
                >
                  {showDetails ? "Ascunde detalii" : "Mai multe detalii"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
