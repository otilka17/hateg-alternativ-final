import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { motion } from "motion/react";
import { Star, Gift, Trophy, Coffee, ArrowRight } from "lucide-react";
import Footer from "@/components/Footer.tsx";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import { toast } from "sonner";
import Navbar from "@/components/Navbar.tsx";
import { SignInButton } from "@/components/ui/signin.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import AnimatedSection from "@/components/AnimatedSection.tsx";

function StampCard({
  currentStamps,
  stampsRequired,
}: {
  currentStamps: number;
  stampsRequired: number;
}) {
  const stamps = Array.from({ length: stampsRequired }, (_, i) => i);

  return (
    <div className="bg-gradient-to-br from-[#14253a] to-[#1e3a5c] p-6 md:p-8 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#f5a06a]/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <Coffee size={20} className="text-[#f5a06a]" />
          <div>
            <h3 className="font-serif text-lg leading-tight">Card de fidelitate</h3>
            <p className="text-[10px] text-white/50 tracking-wider uppercase">
              {currentStamps} / {stampsRequired} ștampile
            </p>
          </div>
        </div>

        {/* Stamp grid */}
        <div className="grid grid-cols-5 gap-2 md:gap-3 mb-4">
          {stamps.map((i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 300 }}
              className={`aspect-square rounded-full border-2 flex items-center justify-center transition-all ${
                i < currentStamps
                  ? "bg-[#f5a06a] border-[#f5a06a] shadow-lg shadow-[#f5a06a]/20"
                  : "bg-white/5 border-white/20"
              }`}
            >
              {i < currentStamps ? (
                <Star size={14} className="text-white fill-white" />
              ) : (
                <span className="text-[10px] text-white/30 font-mono">{i + 1}</span>
              )}
            </motion.div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-[#f5a06a] to-[#f5c89a] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStamps / stampsRequired) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>

        <p className="text-xs text-white/60 mt-3">
          {currentStamps >= stampsRequired
            ? "Ai câștigat o recompensă!"
            : `Încă ${stampsRequired - currentStamps} ${stampsRequired - currentStamps === 1 ? "ștampilă" : "ștampile"} până la recompensă`}
        </p>
      </div>
    </div>
  );
}

function RewardCard({
  title,
  status,
  rewardId,
  redeemedAt,
}: {
  title: string;
  status: "available" | "redeemed";
  rewardId: string;
  redeemedAt?: string;
}) {
  const redeemReward = useMutation(api.loyalty.redeemReward);

  const handleRedeem = async () => {
    try {
      await redeemReward({ rewardId: rewardId as never });
      toast.success("Recompensă folosită! Arată-le la casierie.");
    } catch {
      toast.error("Eroare la utilizarea recompensei.");
    }
  };

  return (
    <div
      className={`border p-4 flex items-center justify-between ${
        status === "available"
          ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200"
          : "bg-muted/30 border-border opacity-60"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            status === "available"
              ? "bg-[#f5a06a] text-white"
              : "bg-muted text-muted-foreground"
          }`}
        >
          <Gift size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#14253a]">{title}</p>
          <p className="text-[10px] text-muted-foreground tracking-wider uppercase">
            {status === "available"
              ? "Disponibilă"
              : `Folosită ${redeemedAt ? format(new Date(redeemedAt), "d MMM yyyy", { locale: ro }) : ""}`}
          </p>
        </div>
      </div>

      {status === "available" && (
        <button
          onClick={handleRedeem}
          className="cursor-pointer bg-[#14253a] text-white text-[10px] font-bold tracking-widest uppercase px-4 py-2 hover:bg-primary transition-colors"
        >
          Folosește
        </button>
      )}
    </div>
  );
}

function LoyaltyDashboard() {
  const loyaltyData = useQuery(api.loyalty.getMyCard, {});
  const rewards = useQuery(api.loyalty.getMyRewards, {});

  if (loyaltyData === undefined || rewards === undefined) {
    return (
      <div className="max-w-2xl mx-auto px-[5%] py-12 space-y-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!loyaltyData) {
    return (
      <div className="max-w-2xl mx-auto px-[5%] py-20 text-center">
        <Coffee size={48} className="text-muted-foreground mx-auto mb-4" />
        <h2 className="font-serif text-2xl text-[#14253a] mb-2">Programul de fidelitate</h2>
        <p className="text-muted-foreground text-sm">
          Programul de fidelitate nu este activ momentan. Revino curând!
        </p>
      </div>
    );
  }

  const { card, config } = loyaltyData;

  if (!config || !config.active) {
    return (
      <div className="max-w-2xl mx-auto px-[5%] py-20 text-center">
        <Coffee size={48} className="text-muted-foreground mx-auto mb-4" />
        <h2 className="font-serif text-2xl text-[#14253a] mb-2">Programul de fidelitate</h2>
        <p className="text-muted-foreground text-sm">
          Programul de fidelitate nu este activ momentan. Revino curând!
        </p>
      </div>
    );
  }

  const availableRewards = rewards.filter((r) => r.status === "available");
  const redeemedRewards = rewards.filter((r) => r.status === "redeemed");

  return (
    <div className="max-w-2xl mx-auto px-[5%] py-8 md:py-12 space-y-8">
      {/* Stamp Card */}
      <AnimatedSection>
        <StampCard
          currentStamps={card.currentStamps}
          stampsRequired={config.stampsRequired}
        />
      </AnimatedSection>

      {/* Stats */}
      <AnimatedSection delay={0.1}>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-border p-4 text-center">
            <div className="font-serif text-2xl text-[#14253a]">{card.totalStampsEarned}</div>
            <div className="text-[9px] text-muted-foreground tracking-[2px] uppercase mt-0.5">
              Ștampile total
            </div>
          </div>
          <div className="bg-white border border-border p-4 text-center">
            <div className="font-serif text-2xl text-[#14253a]">{card.totalRewardsRedeemed}</div>
            <div className="text-[9px] text-muted-foreground tracking-[2px] uppercase mt-0.5">
              Recompense
            </div>
          </div>
          <div className="bg-white border border-border p-4 text-center">
            <div className="font-serif text-2xl text-[#f5a06a]">{availableRewards.length}</div>
            <div className="text-[9px] text-muted-foreground tracking-[2px] uppercase mt-0.5">
              Disponibile
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* How it works */}
      <AnimatedSection delay={0.15}>
        <div className="bg-white border border-border p-5">
          <h3 className="font-serif text-base text-[#14253a] mb-3 flex items-center gap-2">
            <Trophy size={16} className="text-[#f5a06a]" />
            Cum funcționează?
          </h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <span className="w-5 h-5 bg-primary/10 text-primary text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5">1</span>
              Plasezi o comandă cu emailul tău de cont
            </p>
            <p className="flex items-start gap-2">
              <span className="w-5 h-5 bg-primary/10 text-primary text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5">2</span>
              Primești automat o ștampilă când comanda este finalizată
            </p>
            <p className="flex items-start gap-2">
              <span className="w-5 h-5 bg-primary/10 text-primary text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5">3</span>
              La {config.stampsRequired} ștampile câștigi: <strong className="text-[#14253a]">{config.rewardTitle}</strong>
            </p>
          </div>
        </div>
      </AnimatedSection>

      {/* Available rewards */}
      {availableRewards.length > 0 && (
        <AnimatedSection delay={0.2}>
          <div>
            <h3 className="font-serif text-lg text-[#14253a] mb-3 flex items-center gap-2">
              <Gift size={18} className="text-[#f5a06a]" />
              Recompense disponibile
            </h3>
            <div className="space-y-2">
              {availableRewards.map((r) => (
                <RewardCard
                  key={r._id}
                  title={r.title}
                  status={r.status}
                  rewardId={r._id}
                  redeemedAt={r.redeemedAt}
                />
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* Redeemed rewards history */}
      {redeemedRewards.length > 0 && (
        <AnimatedSection delay={0.25}>
          <div>
            <h3 className="text-xs font-bold tracking-[2px] uppercase text-muted-foreground mb-3">
              Istoric recompense
            </h3>
            <div className="space-y-2">
              {redeemedRewards.map((r) => (
                <RewardCard
                  key={r._id}
                  title={r.title}
                  status={r.status}
                  rewardId={r._id}
                  redeemedAt={r.redeemedAt}
                />
              ))}
            </div>
          </div>
        </AnimatedSection>
      )}
    </div>
  );
}

export default function LoyaltyPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16 bg-[#14253a]">
        <div className="px-[5%] md:px-[8%] py-16 md:py-24 text-center relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[30%] left-[15%] w-[250px] h-[250px] rounded-full bg-[#f5a06a]/8 blur-[80px]" />
            <div className="absolute bottom-[20%] right-[10%] w-[200px] h-[200px] rounded-full bg-[#1e3a5c]/40 blur-[100px]" />
          </div>

          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as const }}
          >
            <div className="flex items-center justify-center gap-4 mb-6 text-white/40 text-[10px] font-semibold tracking-[5px] uppercase">
              <span className="w-10 h-px bg-white/25" />
              {"Program fidelitate"}
              <span className="w-10 h-px bg-white/25" />
            </div>
            <h1 className="font-serif text-[clamp(2rem,6vw,4rem)] text-white leading-none tracking-tight mb-4">
              Fidelitate <em className="text-[#f5a06a] italic">Metanoia</em>
            </h1>
            <p className="text-white/70 max-w-md mx-auto leading-relaxed text-balance">
              Colectează ștampile la fiecare comandă și câștigă recompense delicioase.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content based on auth state */}
      <AuthLoading>
        <div className="max-w-2xl mx-auto px-[5%] py-12 space-y-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </AuthLoading>

      <Unauthenticated>
        <div className="max-w-md mx-auto px-[5%] py-16 text-center">
          <Star size={48} className="text-[#f5a06a] mx-auto mb-4" />
          <h2 className="font-serif text-2xl text-[#14253a] mb-3">
            Conectează-te pentru a vedea cardul tău
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            Autentifică-te pentru a accesa programul de fidelitate și a colecta ștampile.
          </p>
          <SignInButton />
        </div>
      </Unauthenticated>

      <Authenticated>
        <LoyaltyDashboard />
      </Authenticated>

      {/* Footer */}
      <Footer />
    </div>
  );
}
