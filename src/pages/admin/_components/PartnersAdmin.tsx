import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.js";
import { Handshake, Plus, Trash2, Star, StarOff, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

type Partner = {
  _id: Id<"partners">;
  name: string;
  description: string;
  website?: string;
  logoImageId?: Id<"_storage">;
  coverImageId?: Id<"_storage">;
  logoUrl: string | null;
  coverUrl: string | null;
  featured: boolean;
  active: boolean;
  sortOrder: number;
};

export default function PartnersAdmin() {
  const partners = useQuery(api.partners.listAll, {});
  const create = useMutation(api.partners.create);
  const update = useMutation(api.partners.update);
  const remove = useMutation(api.partners.remove);
  const generateUploadUrl = useMutation(api.partners.generateUploadUrl);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [featured, setFeatured] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const uploadFile = async (file: File): Promise<Id<"_storage">> => {
    const url = await generateUploadUrl();
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    const { storageId } = (await response.json()) as { storageId: Id<"_storage"> };
    return storageId;
  };

  const handleCreate = async () => {
    if (!name.trim() || !description.trim()) {
      toast.error("Completează numele și descrierea.");
      return;
    }
    setSaving(true);
    try {
      let logoImageId: Id<"_storage"> | undefined;
      let coverImageId: Id<"_storage"> | undefined;

      if (logoFile) {
        logoImageId = await uploadFile(logoFile);
      }
      if (coverFile) {
        coverImageId = await uploadFile(coverFile);
      }

      await create({
        name: name.trim(),
        description: description.trim(),
        website: website.trim() || undefined,
        logoImageId,
        coverImageId,
        featured,
      });
      toast.success("Partener adăugat!");
      setName("");
      setDescription("");
      setWebsite("");
      setFeatured(false);
      setLogoFile(null);
      setCoverFile(null);
      setShowForm(false);
    } catch {
      toast.error("Eroare la salvare.");
    }
    setSaving(false);
  };

  const handleToggleFeatured = async (id: Id<"partners">, currentFeatured: boolean) => {
    await update({ id, featured: !currentFeatured });
    toast.success(currentFeatured ? "Scos de pe pagina principală" : "Adăugat pe pagina principală");
  };

  const handleToggleActive = async (id: Id<"partners">, currentActive: boolean) => {
    await update({ id, active: !currentActive });
    toast.success(currentActive ? "Partener dezactivat" : "Partener activat");
  };

  const handleDelete = async (id: Id<"partners">) => {
    if (!window.confirm("Sigur vrei să ștergi acest partener?")) return;
    await remove({ id });
    toast.success("Partener șters");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Handshake size={18} className="text-primary" />
          <h3 className="font-serif text-lg text-[#14253a]">Parteneri</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {partners?.length ?? 0}
          </span>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="cursor-pointer flex items-center gap-1.5 bg-[#14253a] text-white text-[10px] font-bold tracking-widest uppercase px-4 py-2 hover:bg-primary transition-colors"
        >
          <Plus size={13} /> Adaugă
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-muted/50 border border-border p-5 mb-6 space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nume partener"
              className="border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
            />
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="Website (opțional)"
              className="border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
            />
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descriere partener"
            rows={3}
            className="w-full border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors resize-none"
          />
          <div className="grid sm:grid-cols-2 gap-3">
            <label className="text-sm text-muted-foreground">
              Logo:
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                className="mt-1 block w-full text-xs"
              />
            </label>
            <label className="text-sm text-muted-foreground">
              Imagine copertă / produs:
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                className="mt-1 block w-full text-xs"
              />
            </label>
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 accent-primary cursor-pointer"
              />
              <span className="text-sm text-foreground">Afișează pe pagina principală</span>
            </label>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="cursor-pointer bg-primary text-white text-[10px] font-bold tracking-widest uppercase px-5 py-2.5 hover:bg-[#f5a06a] transition-colors disabled:opacity-50"
            >
              {saving ? "Se salvează..." : "Salvează"}
            </button>
          </div>
        </div>
      )}

      {/* Partners list */}
      {partners === undefined ? (
        <div className="h-20 bg-muted animate-pulse" />
      ) : partners.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Niciun partener adăugat. Apasă „Adaugă" pentru a crea primul.
        </p>
      ) : (
        <div className="space-y-3">
          {(partners as Partner[]).map((p) => (
            <div
              key={p._id}
              className={`flex items-center gap-4 p-4 border border-border bg-white ${!p.active ? "opacity-50" : ""}`}
            >
              {/* Logo */}
              {p.logoUrl ? (
                <img src={p.logoUrl} alt={p.name} className="w-10 h-10 object-contain rounded-sm shrink-0" />
              ) : (
                <div className="w-10 h-10 bg-muted flex items-center justify-center shrink-0 text-muted-foreground">
                  <Handshake size={16} />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-foreground truncate">{p.name}</div>
                <div className="text-xs text-muted-foreground truncate">{p.description}</div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleToggleFeatured(p._id, p.featured)}
                  className={`cursor-pointer p-1.5 transition-colors ${p.featured ? "text-amber-500 hover:text-amber-600" : "text-muted-foreground hover:text-foreground"}`}
                  title={p.featured ? "Scoate din pagina principală" : "Adaugă pe pagina principală"}
                >
                  {p.featured ? <Star size={16} /> : <StarOff size={16} />}
                </button>
                <button
                  onClick={() => handleToggleActive(p._id, p.active)}
                  className={`cursor-pointer p-1.5 transition-colors ${p.active ? "text-green-600 hover:text-green-700" : "text-muted-foreground hover:text-foreground"}`}
                  title={p.active ? "Dezactivează" : "Activează"}
                >
                  {p.active ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="cursor-pointer p-1.5 text-red-400 hover:text-red-600 transition-colors"
                  title="Șterge"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
