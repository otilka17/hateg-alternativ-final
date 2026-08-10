import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Database, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CAFEA, SPEC, LIM, SANATATE, SAND, DULCE } from "@/lib/menu-data.ts";
import { BORCANE } from "@/lib/borcane-data.ts";
import { PACHETE } from "@/lib/pachete-data.ts";

export default function SeedDataAdmin() {
  const [seeding, setSeeding] = useState(false);
  const [done, setDone] = useState(false);

  const menuItems = useQuery(api.cms.listMenuItems, {});
  const borcaneItems = useQuery(api.cms.listBorcaneItems, {});
  const pacheteItems = useQuery(api.cms.listPacheteItems, {});

  const seedMenu = useMutation(api.cms.seedMenuItems);
  const seedBorcane = useMutation(api.cms.seedBorcaneItems);
  const seedPachete = useMutation(api.cms.seedPacheteItems);

  const hasMenuData = (menuItems?.length ?? 0) > 0;
  const hasBorcaneData = (borcaneItems?.length ?? 0) > 0;
  const hasPacheteData = (pacheteItems?.length ?? 0) > 0;

  const allSeeded = hasMenuData && hasBorcaneData && hasPacheteData;

  const handleSeed = async () => {
    setSeeding(true);
    try {
      // Seed menu items
      if (!hasMenuData) {
        const categories: { items: typeof CAFEA; cat: string }[] = [
          { items: CAFEA, cat: "cafea" },
          { items: SPEC, cat: "specialitati" },
          { items: LIM, cat: "limonada" },
          { items: SANATATE, cat: "sanatate" },
          { items: SAND, cat: "sandwich" },
          { items: DULCE, cat: "dulce" },
        ];

        for (const { items, cat } of categories) {
          await seedMenu({
            items: items.map((item, i) => ({
              category: cat,
              name: item.n,
              description: item.d,
              price: item.p,
              sortOrder: i,
            })),
          });
        }
      }

      // Seed borcane
      if (!hasBorcaneData) {
        await seedBorcane({
          items: BORCANE.map((item, i) => ({
            name: item.n,
            description: item.d,
            info: item.info,
            price: item.p,
            emoji: "",
            tag: item.tag,
            sortOrder: i,
          })),
        });
      }

      // Seed pachete
      if (!hasPacheteData) {
        await seedPachete({
          items: PACHETE.map((item, i) => ({
            name: item.n,
            description: item.d,
            includes: item.includes,
            price: item.p,
            emoji: item.ico,
            tag: item.tag,
            saves: item.saves,
            sortOrder: i,
          })),
        });
      }

      setDone(true);
      toast.success("Datele au fost importate cu succes!");
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      toast.error("Eroare la importarea datelor", { description: detail, duration: 15000 });
    } finally {
      setSeeding(false);
    }
  };

  if (allSeeded || done) {
    return (
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-sm">
        <CheckCircle size={18} className="text-green-600 shrink-0" />
        <div>
          <div className="text-sm font-medium text-green-800">Datele sunt importate</div>
          <div className="text-xs text-green-600">Meniu: {menuItems?.length ?? 0} produse · Borcane: {borcaneItems?.length ?? 0} · Pachete: {pacheteItems?.length ?? 0}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-sm">
      <div className="flex items-start gap-3">
        <Database size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="text-sm font-medium text-amber-800 mb-1">Importă datele existente</div>
          <p className="text-xs text-amber-700 mb-3">
            Produsele sunt salvate local în cod. Apasă butonul de mai jos pentru a le importa în baza de date, astfel încât să le poți edita din admin.
          </p>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="cursor-pointer flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase px-4 py-2.5 bg-amber-600 text-white hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            {seeding ? <Loader2 size={12} className="animate-spin" /> : <Database size={12} />}
            {seeding ? "Se importă..." : "Importă toate datele"}
          </button>
        </div>
      </div>
    </div>
  );
}
