import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

const TEXT_FIELDS = [
  { key: "about_hero_title", label: "Titlu hero", placeholder: "Hai pe la noi", rows: 1 },
  { key: "about_hero_subtitle", label: "Subtitlu hero", placeholder: "Suntem pe DN 68, la Totești — o pauză caldă...", rows: 2 },
  { key: "about_story_title", label: "Titlu secțiune poveste", placeholder: "Povestea Metanoia", rows: 1 },
  { key: "about_story_text", label: "Text poveste (paragraf 1)", placeholder: "Metanoia înseamnă transformare...", rows: 4 },
  { key: "about_story_subtitle", label: "Subtitlu poveste", placeholder: "Mai mult decât o băcănie", rows: 1 },
  { key: "about_story_p1", label: "Paragraf poveste 1", placeholder: "Am pornit de la ideea că drumul spre Hațeg...", rows: 4 },
  { key: "about_story_p2", label: "Paragraf poveste 2", placeholder: "Fiecare produs spune o poveste...", rows: 4 },
  { key: "about_quote", label: "Citat final", placeholder: "Metanoia — acolo unde sufletul se odihnește...", rows: 2 },
  { key: "about_quote_author", label: "Autor citat", placeholder: "— Hațeg Alternativ · DN 68 · Totești", rows: 1 },
] as const;

type FieldValues = Record<string, string>;

export default function AboutAdmin() {
  const content = useQuery(api.cms.listSiteContent, {});
  const upsertContent = useMutation(api.cms.upsertSiteContent);
  const [values, setValues] = useState<FieldValues>({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Populate fields from DB
  useEffect(() => {
    if (content && !loaded) {
      const map: FieldValues = {};
      for (const item of content) {
        map[item.key] = item.value;
      }
      setValues(map);
      setLoaded(true);
    }
  }, [content, loaded]);

  const handleSave = async () => {
    setSaving(true);
    for (const field of TEXT_FIELDS) {
      const val = values[field.key]?.trim();
      if (val) {
        await upsertContent({ key: field.key, value: val });
      }
    }
    toast.success("Conținutul paginii Despre a fost salvat!");
    setSaving(false);
  };

  if (!content) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 size={20} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif text-xl text-[#14253a]">Pagina Despre / Contact</h3>
        <button
          onClick={handleSave}
          disabled={saving}
          className="cursor-pointer flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase px-4 py-2.5 bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          {saving ? "Se salvează..." : "Salvează"}
        </button>
      </div>

      <div className="space-y-4">
        {TEXT_FIELDS.map((field) => (
          <div key={field.key}>
            <label className="text-xs font-medium text-[#14253a]/70 tracking-wide uppercase mb-1.5 block">
              {field.label}
            </label>
            {field.rows > 1 ? (
              <textarea
                value={values[field.key] ?? ""}
                onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                rows={field.rows}
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
        Lasă câmpurile goale pentru a păstra textul implicit.
      </p>
    </div>
  );
}
