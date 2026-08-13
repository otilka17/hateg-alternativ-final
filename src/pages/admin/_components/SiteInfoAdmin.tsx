import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

const FIELDS = [
  { key: "address", label: "Adresă", placeholder: "DN 68, Totești, Județul Hunedoara" },
  { key: "phone", label: "Telefon", placeholder: "+40 749 229 686" },
  { key: "email", label: "Email", placeholder: "hategalternativ@gmail.com" },
  { key: "whatsapp", label: "WhatsApp (număr)", placeholder: "40749229686" },
  { key: "instagram", label: "Instagram (URL)", placeholder: "https://www.instagram.com/metanoia.hateg/" },
  { key: "facebook", label: "Facebook (URL)", placeholder: "https://www.facebook.com/metanoia.hateg" },
  { key: "companyName", label: "Denumire firmă", placeholder: "DAKAMIGOS MARKT SRL" },
  { key: "cui", label: "CUI", placeholder: "38324829" },
  { key: "regCom", label: "Reg. Com.", placeholder: "J2017001477205" },
  { key: "mapUrl", label: "Google Maps embed URL", placeholder: "https://www.google.com/maps/embed?pb=..." },
] as const;

type FieldValues = Record<string, string>;

export default function SiteInfoAdmin() {
  const entries = useQuery(api.siteInfo.getAll, {});
  const bulkUpsert = useMutation(api.siteInfo.bulkUpsert);
  const [values, setValues] = useState<FieldValues>({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Populate fields from DB
  useEffect(() => {
    if (entries && !loaded) {
      const map: FieldValues = {};
      for (const entry of entries) {
        map[entry.key] = entry.value;
      }
      setValues(map);
      setLoaded(true);
    }
  }, [entries, loaded]);

  const handleSave = async () => {
    setSaving(true);
    const entriesToSave = FIELDS
      .filter((f) => values[f.key]?.trim())
      .map((f) => ({ key: f.key, value: values[f.key]!.trim() }));
    await bulkUpsert({ entries: entriesToSave });
    toast.success("Informațiile au fost salvate!");
    setSaving(false);
  };

  if (!entries) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 size={20} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-xl text-[#14253a]">Informații restaurant</h3>
        <button
          onClick={handleSave}
          disabled={saving}
          className="cursor-pointer flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase px-4 py-2.5 bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          {saving ? "Se salvează..." : "Salvează tot"}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {FIELDS.map((field) => (
          <div key={field.key} className={field.key === "mapUrl" ? "md:col-span-2" : ""}>
            <label className="text-xs font-medium text-[#14253a]/70 tracking-wide uppercase mb-1.5 block">
              {field.label}
            </label>
            {field.key === "mapUrl" ? (
              <textarea
                value={values[field.key] ?? ""}
                onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                rows={2}
                className="w-full px-3 py-2.5 text-sm border border-foreground/15 bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            ) : (
              <input
                value={values[field.key] ?? ""}
                onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                className="w-full px-3 py-2.5 text-sm border border-foreground/15 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
              />
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Aceste date apar pe pagina de Contact, în footer, și pe întregul site.
      </p>
    </div>
  );
}
