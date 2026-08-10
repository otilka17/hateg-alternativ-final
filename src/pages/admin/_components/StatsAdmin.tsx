import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { ShoppingBag, Star, Users, Mail, TrendingUp, Package, Clock, CheckCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton.tsx";

function StatCard({ icon: Icon, label, value, subtitle, color }: {
  icon: typeof ShoppingBag;
  label: string;
  value: string | number;
  subtitle?: string;
  color: string;
}) {
  return (
    <div className="bg-white border border-foreground/8 p-5">
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${color}`}>
          <Icon size={16} className="text-white" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mb-1">{label}</div>
          <div className="font-serif text-2xl text-[#14253a] leading-tight">{value}</div>
          {subtitle && <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>}
        </div>
      </div>
    </div>
  );
}

export default function StatsAdmin() {
  const stats = useQuery(api.stats.getStats, {});

  if (!stats) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview stats */}
      <div>
        <h3 className="font-serif text-xl text-[#14253a] mb-4">Statistici generale</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard
            icon={ShoppingBag}
            label="Total comenzi"
            value={stats.totalOrders}
            subtitle={`${stats.recentOrders} în ultimele 7 zile`}
            color="bg-blue-500"
          />
          <StatCard
            icon={TrendingUp}
            label="Venituri totale"
            value={`${stats.totalRevenue} lei`}
            subtitle={`${stats.recentRevenue} lei în 7 zile`}
            color="bg-green-500"
          />
          <StatCard
            icon={Star}
            label="Recenzii"
            value={stats.totalReviews}
            subtitle={`${stats.avgStars}/5 medie · ${stats.pendingReviews} în așteptare`}
            color="bg-amber-500"
          />
          <StatCard
            icon={Mail}
            label="Newsletter"
            value={stats.totalSubscribers}
            subtitle="abonați"
            color="bg-purple-500"
          />
          <StatCard
            icon={Users}
            label="Utilizatori"
            value={stats.totalUsers}
            subtitle="conturi create"
            color="bg-indigo-500"
          />
          <StatCard
            icon={Clock}
            label="Comenzi noi"
            value={stats.newOrders}
            subtitle="nefinalizate"
            color="bg-orange-500"
          />
          <StatCard
            icon={Package}
            label="În lucru"
            value={stats.inProgressOrders}
            subtitle="se pregătesc"
            color="bg-cyan-500"
          />
          <StatCard
            icon={CheckCheck}
            label="Finalizate"
            value={stats.doneOrders}
            subtitle="livrate/ridicate"
            color="bg-emerald-500"
          />
        </div>
      </div>

      {/* Daily chart (simple bar) */}
      <div className="bg-white border border-foreground/8 p-5">
        <h4 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4">
          Comenzi ultimele 7 zile
        </h4>
        <div className="flex items-end gap-2 h-32">
          {stats.dailyOrders.map((day) => {
            const maxCount = Math.max(...stats.dailyOrders.map((d) => d.count), 1);
            const height = (day.count / maxCount) * 100;
            return (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-semibold text-[#14253a]">{day.count}</span>
                <div
                  className="w-full bg-primary/80 rounded-t-sm transition-all duration-300"
                  style={{ height: `${Math.max(height, 4)}%` }}
                />
                <span className="text-[9px] text-muted-foreground">{day.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Popular products */}
      {stats.popularProducts.length > 0 && (
        <div className="bg-white border border-foreground/8 p-5">
          <h4 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4">
            Top 10 produse vândute
          </h4>
          <div className="space-y-2">
            {stats.popularProducts.map((product, i) => {
              const maxQty = stats.popularProducts[0]?.qty ?? 1;
              const width = (product.qty / maxQty) * 100;
              return (
                <div key={product.name} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground w-5 text-right shrink-0">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#14253a] truncate">{product.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">{product.qty} buc</span>
                    </div>
                    <div className="h-1.5 mt-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary/70 rounded-full transition-all duration-300"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
