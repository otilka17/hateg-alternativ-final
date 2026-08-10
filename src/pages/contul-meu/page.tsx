import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useAuth } from "@/hooks/use-auth.ts";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { User, Mail, Shield, Heart, ShoppingBag, LogIn } from "lucide-react";
import { motion } from "motion/react";

function AccountContent() {
  const user = useQuery(api.users.getCurrentUser, {});
  const { signout } = useAuth();

  if (!user) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const isAdmin = user.role === "admin";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Profile card */}
      <div className="bg-card border border-border p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-[#14253a]/10 rounded-full flex items-center justify-center">
            <User size={24} className="text-[#14253a]" />
          </div>
          <div>
            <h2 className="font-serif text-xl text-[#14253a]">{user.name || "Utilizator"}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <Mail size={12} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{user.email || "—"}</span>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2.5 mb-4">
            <Shield size={14} className="text-amber-700" />
            <span className="text-xs font-semibold text-amber-700 tracking-wide uppercase">Administrator</span>
          </div>
        )}

        <div className="text-[10px] font-bold tracking-[3px] uppercase text-[#2e4e7e] mb-3 mt-6">Acțiuni rapide</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-3 p-4 border border-border hover:border-[#14253a]/30 transition-colors no-underline"
            >
              <Shield size={18} className="text-[#14253a]" />
              <div>
                <div className="text-sm font-semibold text-[#14253a]">Panou Admin</div>
                <div className="text-[11px] text-muted-foreground">Gestionează comenzile și produsele</div>
              </div>
            </Link>
          )}
          <Link
            to="/fidelitate"
            className="flex items-center gap-3 p-4 border border-border hover:border-[#14253a]/30 transition-colors no-underline"
          >
            <Heart size={18} className="text-primary" />
            <div>
              <div className="text-sm font-semibold text-[#14253a]">Program fidelitate</div>
              <div className="text-[11px] text-muted-foreground">Vezi ștampilele și recompensele tale</div>
            </div>
          </Link>
          <Link
            to="/tracking"
            className="flex items-center gap-3 p-4 border border-border hover:border-[#14253a]/30 transition-colors no-underline"
          >
            <ShoppingBag size={18} className="text-[#14253a]" />
            <div>
              <div className="text-sm font-semibold text-[#14253a]">Urmărire comandă</div>
              <div className="text-[11px] text-muted-foreground">Verifică statusul comenzii</div>
            </div>
          </Link>
          <Link
            to="/meniu"
            className="flex items-center gap-3 p-4 border border-border hover:border-[#14253a]/30 transition-colors no-underline"
          >
            <ShoppingBag size={18} className="text-[#14253a]" />
            <div>
              <div className="text-sm font-semibold text-[#14253a]">Comandă nouă</div>
              <div className="text-[11px] text-muted-foreground">Alege din meniu</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Logout */}
      <div className="flex justify-center">
        <button
          onClick={() => signout()}
          className="cursor-pointer text-sm text-red-600 hover:text-red-800 transition-colors font-medium"
        >
          Deconectare
        </button>
      </div>
    </motion.div>
  );
}

export default function AccountPage() {
  const { signinRedirect } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-[5%] pt-24 pb-20">
        <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] text-[#14253a] leading-tight mb-2">
          Contul meu
        </h1>
        <p className="text-sm text-muted-foreground font-light mb-8">Gestionează contul tău Metanoia.</p>

        <AuthLoading>
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </AuthLoading>

        <Unauthenticated>
          <div className="bg-card border border-border p-12 text-center">
            <LogIn size={32} className="text-muted-foreground mx-auto mb-4" />
            <h2 className="font-serif text-xl text-[#14253a] mb-2">Conectează-te</h2>
            <p className="text-sm text-muted-foreground mb-6">Intră în contul tău pentru a vedea detaliile și beneficiile tale.</p>
            <button
              onClick={() => signinRedirect()}
              className="cursor-pointer bg-[#14253a] hover:bg-primary text-white px-8 py-3.5 text-[11px] font-bold tracking-widest uppercase transition-colors"
            >
              Conectare
            </button>
          </div>
        </Unauthenticated>

        <Authenticated>
          <AccountContent />
        </Authenticated>
      </div>
    </div>
  );
}
