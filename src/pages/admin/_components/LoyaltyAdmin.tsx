import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { toast } from "sonner";
import { Award, ChevronDown, ChevronUp, Users, Gift, Star } from "lucide-react";

export default function LoyaltyAdmin() {
  const config = useQuery(api.loyalty.getConfig, {});
  const cards = useQuery(api.loyalty.listAllCards, {});
  const rewards = useQuery(api.loyalty.listAllRewards, {});
  const upsertConfig = useMutation(api.loyalty.upsertConfig);

  const [expanded, setExpanded] = useState(false);
  const [stampsRequired, setStampsRequired] = useState(config?.stampsRequired ?? 10);
  const [rewardTitle, setRewardTitle] = useState(config?.rewardTitle ?? "Cafea gratuită");
  const [rewardDescription, setRewardDescription] = useState(
    config?.rewardDescription ?? "O cafea la alegere, pe noi!"
  );
  const [active, setActive] = useState(config?.active ?? true);
  const [initialized, setInitialized] = useState(false);

  // Sync from DB on first load
  if (config && !initialized) {
    setStampsRequired(config.stampsRequired);
    setRewardTitle(config.rewardTitle);
    setRewardDescription(config.rewardDescription);
    setActive(config.active);
    setInitialized(true);
  }

  const handleSave = async () => {
    if (!rewardTitle.trim()) {
      toast.error("Adaugă un titlu pentru recompensă.");
      return;
    }
    if (stampsRequired < 2 || stampsRequired > 50) {
      toast.error("Numărul de ștampile trebuie să fie între 2 și 50.");
      return;
    }
    await upsertConfig({
      stampsRequired,
      rewardTitle: rewardTitle.trim(),
      rewardDescription: rewardDescription.trim(),
      active,
    });
    toast.success("Configurare salvată!");
  };

  const totalStamps = cards?.reduce((sum, c) => sum + c.totalStampsEarned, 0) ?? 0;
  const availableRewards = rewards?.filter((r) => r.status === "available").length ?? 0;
  const redeemedRewards = rewards?.filter((r) => r.status === "redeemed").length ?? 0;

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="cursor-pointer w-full flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-2">
          <Award size={18} className="text-primary" />
          <h3 className="font-serif text-lg text-[#14253a]">Fidelitate</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {cards?.length ?? 0} membrii
          </span>
        </div>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && (
        <div className="space-y-5">
          {/* Config section */}
          <div className="border border-border bg-muted/20 p-5 space-y-4">
            <h4 className="text-[10px] font-bold tracking-[3px] uppercase text-primary/70">
              Configurare program
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1 block">
                  Ștampile necesare
                </label>
                <input
                  type="number"
                  min={2}
                  max={50}
                  value={stampsRequired}
                  onChange={(e) => setStampsRequired(Number(e.target.value))}
                  className="w-full border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1 block">
                  Titlu recompensă
                </label>
                <input
                  value={rewardTitle}
                  onChange={(e) => setRewardTitle(e.target.value)}
                  placeholder="Ex: Cafea gratuită"
                  className="w-full border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1 block">
                Descriere recompensă
              </label>
              <input
                value={rewardDescription}
                onChange={(e) => setRewardDescription(e.target.value)}
                placeholder="Ex: O cafea la alegere, pe noi!"
                className="w-full border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
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
                <span className="text-sm text-foreground">Program activ</span>
              </label>

              <button
                onClick={handleSave}
                className="cursor-pointer bg-[#14253a] text-white text-[11px] font-bold tracking-widest uppercase px-6 py-2.5 hover:bg-primary transition-colors"
              >
                Salvează
              </button>
            </div>
          </div>

          {/* Stats overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-muted/30 p-3 text-center">
              <Users size={14} className="text-muted-foreground mx-auto mb-1" />
              <div className="text-lg font-serif text-[#14253a]">{cards?.length ?? 0}</div>
              <div className="text-[9px] text-muted-foreground tracking-wider uppercase">Membrii</div>
            </div>
            <div className="bg-muted/30 p-3 text-center">
              <Star size={14} className="text-muted-foreground mx-auto mb-1" />
              <div className="text-lg font-serif text-[#14253a]">{totalStamps}</div>
              <div className="text-[9px] text-muted-foreground tracking-wider uppercase">Ștampile</div>
            </div>
            <div className="bg-muted/30 p-3 text-center">
              <Gift size={14} className="text-[#f5a06a] mx-auto mb-1" />
              <div className="text-lg font-serif text-[#f5a06a]">{availableRewards}</div>
              <div className="text-[9px] text-muted-foreground tracking-wider uppercase">Active</div>
            </div>
            <div className="bg-muted/30 p-3 text-center">
              <Gift size={14} className="text-green-500 mx-auto mb-1" />
              <div className="text-lg font-serif text-green-600">{redeemedRewards}</div>
              <div className="text-[9px] text-muted-foreground tracking-wider uppercase">Folosite</div>
            </div>
          </div>

          {/* Members list */}
          {cards && cards.length > 0 && (
            <div>
              <h4 className="text-[10px] font-bold tracking-[3px] uppercase text-primary/70 mb-3">
                Membrii program
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {cards.map((card) => (
                  <div
                    key={card._id}
                    className="flex items-center justify-between py-2.5 px-3 bg-muted/30 rounded-sm"
                  >
                    <div>
                      <span className="text-sm text-foreground font-medium">{card.userName}</span>
                      {card.userEmail && (
                        <span className="text-xs text-muted-foreground ml-2">{card.userEmail}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-muted-foreground">
                        <Star size={10} className="inline mr-0.5" />
                        {card.currentStamps}/{stampsRequired}
                      </span>
                      <span className="text-muted-foreground">
                        <Gift size={10} className="inline mr-0.5" />
                        {card.totalRewardsRedeemed}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
