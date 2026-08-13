import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X, User, LogIn, ChevronDown } from "lucide-react";
import { useCartStore } from "@/lib/cart-store.ts";
import { motion, AnimatePresence } from "motion/react";
import { OpenStatusBadge } from "@/components/ScheduleStatus.tsx";
import { Authenticated, Unauthenticated } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useAuth } from "@/hooks/use-auth.ts";

// Inline SVG logo matching original
function MetanoiaLogo({ size = 38 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 500 500">
      <defs>
        <linearGradient id="LG2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#c2daf2" />
          <stop offset="0.55" stopColor="#8fb8e4" />
          <stop offset="1" stopColor="#6d9cce" />
        </linearGradient>
      </defs>
      <circle cx="250" cy="250" r="215" fill="none" stroke="url(#LG2)" strokeWidth="9" />
      <circle cx="250" cy="250" r="190" fill="none" stroke="url(#LG2)" strokeWidth="3" opacity="0.75" />
      <polygon points="168,190 252,292 84,292" fill="#7ba6d4" />
      <polygon points="332,196 416,292 248,292" fill="#7ba6d4" />
      <polygon points="250,138 352,292 148,292" fill="url(#LG2)" />
      <path d="M250,138 L278,180 L262,172 L250,186 L238,172 L222,180 Z" fill="#ffffff" />
      <text x="250" y="352" fill="#6d9cce" fontFamily="DM Serif Display,Georgia,serif" fontSize="40" fontWeight="600" letterSpacing="10" textAnchor="middle">METANOIA</text>
      <text x="250" y="386" fill="#8fb8e4" fontFamily="DM Sans,Arial,sans-serif" fontSize="15" fontWeight="600" letterSpacing="7" textAnchor="middle">HAȚEG ALTERNATIV</text>
      <circle cx="250" cy="408" r="4" fill="#8fb8e4" />
    </svg>
  );
}

const navLinks = [
  { href: "/", label: "Acasă" },
  { href: "/meniu", label: "Meniu" },
  { href: "/sandwich-builder", label: "Creează Sandwich" },
  { href: "/borcane", label: "Borcane" },
  { href: "/pachete", label: "Pachete" },
  { href: "/cutia-metanoia", label: "Cutia Metanoia" },
  { href: "/despre", label: "Despre" },
  { href: "/galerie", label: "Galerie" },
  { href: "/blog", label: "Blog" },
  { href: "/parteneri", label: "Parteneri" },
  { href: "/contact", label: "Contact" },
];

// Mobile menu groups
type MobileNavItem = { href: string; label: string };
type MobileNavGroup = { label: string; items: MobileNavItem[] };
type MobileNavEntry = MobileNavItem | MobileNavGroup;

const mobileNav: MobileNavEntry[] = [
  { href: "/", label: "Acasă" },
  {
    label: "Produse",
    items: [
      { href: "/meniu", label: "Meniu" },
      { href: "/sandwich-builder", label: "Creează Sandwich" },
      { href: "/borcane", label: "Borcane" },
      { href: "/pachete", label: "Pachete" },
      { href: "/cutia-metanoia", label: "Cutia Metanoia ✨" },
    ],
  },
  {
    label: "Descoperă",
    items: [
      { href: "/despre", label: "Despre noi" },
      { href: "/galerie", label: "Galerie" },
      { href: "/blog", label: "Blog" },
      { href: "/parteneri", label: "Parteneri" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

function MobileNavGroupItem({ group, onClose }: { group: MobileNavGroup; onClose: () => void }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="w-full flex flex-col items-center">
      <button
        onClick={() => setExpanded(!expanded)}
        className="cursor-pointer font-serif text-2xl text-white py-2.5 tracking-wide hover:text-primary transition-colors flex items-center gap-2 bg-transparent border-none"
      >
        {group.label}
        <ChevronDown
          size={18}
          className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden flex flex-col items-center"
          >
            {group.items.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className="font-sans text-base text-white/70 no-underline py-1.5 tracking-wide hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UserMenu() {
  const user = useQuery(api.users.getCurrentUser, {});
  const { signout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!user) return null;

  const isAdmin = user.role === "admin";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="cursor-pointer flex items-center gap-1.5 text-foreground/60 hover:text-foreground transition-colors"
      >
        <User size={18} />
        <span className="hidden sm:inline text-[11px] font-medium tracking-wide">
          {user.name?.split(" ")[0] || "Cont"}
        </span>
      </button>
      {open && (
        <div className="absolute right-0 top-full pt-2 z-50">
          <div className="bg-white border border-border shadow-lg min-w-[160px] py-2">
            <div className="px-4 py-2 border-b border-border mb-1">
              <div className="text-sm font-medium text-[#14253a] truncate">{user.name || "Utilizator"}</div>
              <div className="text-[10px] text-muted-foreground truncate">{user.email}</div>
            </div>
            {isAdmin && (
              <Link to="/admin" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-foreground hover:bg-muted/50 no-underline transition-colors">
                Panou Admin
              </Link>
            )}
            <Link to="/contul-meu" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-foreground hover:bg-muted/50 no-underline transition-colors">
              Contul meu
            </Link>
            <Link to="/fidelitate" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-foreground hover:bg-muted/50 no-underline transition-colors">
              Fidelitate
            </Link>
            <button
              onClick={() => { signout(); setOpen(false); }}
              className="cursor-pointer w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Deconectare
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LoginButton() {
  return (
    <Link
      to="/contul-meu"
      className="cursor-pointer flex items-center gap-1.5 text-foreground/60 hover:text-foreground transition-colors no-underline"
      title="Conectare"
    >
      <LogIn size={18} />
      <span className="hidden sm:inline text-[11px] font-medium tracking-wide">Conectare</span>
    </Link>
  );
}

function MobileLoginButton({ onClose }: { onClose: () => void }) {
  return (
    <Link
      to="/contul-meu"
      onClick={onClose}
      className="font-serif text-2xl text-white/70 no-underline py-2.5 tracking-wide hover:text-primary transition-colors"
    >
      Conectare
    </Link>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const qty = useCartStore((s) => s.totalQty());
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <>
      <motion.nav
        className={`fixed top-0 w-full z-[999] flex items-center justify-between px-[5%] h-16 transition-all duration-300 ${
          scrolled
            ? "bg-background/98 backdrop-blur-lg border-b border-foreground/10 shadow-sm"
            : "bg-background/96 backdrop-blur-md border-b border-foreground/10"
        }`}
        initial={{ y: -64 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <Link to="/" className="flex items-center gap-2.5 no-underline">
          <MetanoiaLogo size={38} />
          <div>
            <div className="font-serif text-[1.05rem] text-[#14253a] tracking-wide leading-tight">Metanoia</div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] tracking-[2.5px] uppercase text-muted-foreground font-medium">Hațeg Alternativ</span>
              <span className="hidden sm:block"><OpenStatusBadge /></span>
            </div>
          </div>
        </Link>

        <ul className="hidden md:flex gap-6 list-none items-center">
          <li>
            <Link to="/" className="text-[11px] font-medium tracking-[1.5px] uppercase text-muted-foreground hover:text-foreground transition-colors no-underline">
              Acasă
            </Link>
          </li>
          <li className="relative group">
            <button className="cursor-pointer text-[11px] font-medium tracking-[1.5px] uppercase text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none flex items-center gap-1">
              Produse
              <ChevronDown size={12} className="transition-transform duration-200 group-hover:rotate-180" />
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-white border border-border shadow-lg py-2 min-w-[180px]">
                {[
                  { href: "/meniu", label: "Meniu" },
                  { href: "/sandwich-builder", label: "Creează Sandwich" },
                  { href: "/borcane", label: "Borcane" },
                  { href: "/pachete", label: "Pachete" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="block px-4 py-2 text-sm text-foreground hover:bg-muted/50 no-underline transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </li>
          <li className="relative group">
            <button className="cursor-pointer text-[11px] font-medium tracking-[1.5px] uppercase text-muted-foreground hover:text-foreground transition-colors bg-transparent border-none flex items-center gap-1">
              Descoperă
              <ChevronDown size={12} className="transition-transform duration-200 group-hover:rotate-180" />
            </button>
            <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="bg-white border border-border shadow-lg py-2 min-w-[180px]">
                {[
                  { href: "/despre", label: "Despre noi" },
                  { href: "/galerie", label: "Galerie" },
                  { href: "/blog", label: "Blog" },
                  { href: "/parteneri", label: "Parteneri" },
                  { href: "/contact", label: "Contact" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="block px-4 py-2 text-sm text-foreground hover:bg-muted/50 no-underline transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </li>
        </ul>

        <div className="flex items-center gap-3">
          <Authenticated>
            <UserMenu />
          </Authenticated>
          <Unauthenticated>
            <LoginButton />
          </Unauthenticated>
          <Link to="/checkout" className="relative">
            <ShoppingBag size={20} className="text-foreground/60 hover:text-foreground transition-colors" />
            {qty > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{qty}</span>
            )}
          </Link>
          <Link to="/checkout" className="hidden md:block bg-[#14253a] hover:bg-primary text-white text-[11px] font-semibold tracking-widest uppercase px-5 py-2.5 transition-colors no-underline">
            Comandă →
          </Link>
          <button className="md:hidden cursor-pointer p-2" onClick={() => setOpen(true)}>
            <Menu size={22} className="text-foreground" />
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[9998] bg-[#0f1825] flex flex-col items-center justify-center gap-0 overflow-y-auto py-16"
          >
            <button
              className="absolute top-5 right-[6%] text-white/40 text-3xl cursor-pointer bg-none border-none"
              onClick={() => setOpen(false)}
            >
              <X size={28} />
            </button>
            {mobileNav.map((entry, i) =>
              "items" in entry ? (
                <MobileNavGroupItem key={i} group={entry} onClose={() => setOpen(false)} />
              ) : (
                <Link
                  key={entry.href}
                  to={entry.href}
                  onClick={() => setOpen(false)}
                  className="font-serif text-2xl text-white no-underline py-2.5 tracking-wide hover:text-primary transition-colors"
                >
                  {entry.label}
                </Link>
              )
            )}
            <Authenticated>
              <Link
                to="/contul-meu"
                onClick={() => setOpen(false)}
                className="font-serif text-2xl text-white no-underline py-2.5 tracking-wide hover:text-primary transition-colors"
              >
                Contul meu
              </Link>
            </Authenticated>
            <Unauthenticated>
              <MobileLoginButton onClose={() => setOpen(false)} />
            </Unauthenticated>
            <Link
              to="/checkout"
              onClick={() => setOpen(false)}
              className="mt-4 bg-primary text-white px-8 py-3 text-[11px] font-bold tracking-widest uppercase no-underline"
            >
              Comandă →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export { MetanoiaLogo };
