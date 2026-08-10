import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.js";
import { toast } from "sonner";
import { ImagePlus, Trash2, Eye, EyeOff, GripVertical, ChevronDown, ChevronUp } from "lucide-react";
import ImageUploader from "./ImageUploader.tsx";

const CATEGORIES = ["Cafea", "Sandwich", "Borcane", "Sucuri", "Magazin", "Altele"];
const SPAN_OPTIONS = [
  { value: "none", label: "Normal" },
  { value: "tall", label: "Înalt (2 rânduri)" },
  { value: "wide", label: "Lat (2 coloane)" },
] as const;

type SpanValue = "none" | "tall" | "wide";

export default function GalleryAdmin() {
  const images = useQuery(api.gallery.listAll, {});
  const createImage = useMutation(api.gallery.create);
  const updateImage = useMutation(api.gallery.update);
  const removeImage = useMutation(api.gallery.remove);

  const [expanded, setExpanded] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newAlt, setNewAlt] = useState("");
  const [newCategory, setNewCategory] = useState("Cafea");
  const [newSpan, setNewSpan] = useState<SpanValue>("none");
  const [newImageId, setNewImageId] = useState<Id<"_storage"> | null>(null);

  const handleAdd = async () => {
    if (!newAlt.trim()) {
      toast.error("Adaugă o descriere pentru imagine.");
      return;
    }
    if (!newImageId) {
      toast.error("Încarcă o imagine.");
      return;
    }
    const nextOrder = (images?.length ?? 0) + 1;
    await createImage({
      alt: newAlt.trim(),
      category: newCategory,
      imageId: newImageId,
      span: newSpan === "none" ? undefined : newSpan,
      sortOrder: nextOrder,
    });
    setNewAlt("");
    setNewCategory("Cafea");
    setNewSpan("none");
    setNewImageId(null);
    setShowAdd(false);
    toast.success("Imagine adăugată în galerie!");
  };

  const handleToggleActive = async (id: Id<"galleryImages">, currentActive: boolean) => {
    await updateImage({ id, active: !currentActive });
    toast.success(currentActive ? "Imagine ascunsă" : "Imagine vizibilă");
  };

  const handleDelete = async (id: Id<"galleryImages">) => {
    if (!confirm("Sigur vrei să ștergi această imagine?")) return;
    await removeImage({ id });
    toast.success("Imagine ștearsă");
  };

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="cursor-pointer w-full flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-2">
          <ImagePlus size={18} className="text-primary" />
          <h3 className="font-serif text-lg text-[#14253a]">Galerie Foto</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {images?.length ?? 0} imagini
          </span>
        </div>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && (
        <div>
          {/* Add new image button */}
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="cursor-pointer mb-4 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold tracking-wider uppercase px-4 py-2.5 transition-colors flex items-center gap-2"
          >
            <ImagePlus size={14} />
            {showAdd ? "Anulează" : "Adaugă imagine"}
          </button>

          {/* Add form */}
          {showAdd && (
            <div className="border border-border bg-muted/20 p-4 mb-6 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1 block">
                    Descriere imagine
                  </label>
                  <input
                    value={newAlt}
                    onChange={(e) => setNewAlt(e.target.value)}
                    placeholder="Ex: Cafea cappuccino cremoasă"
                    className="w-full border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1 block">
                    Categorie
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1 block">
                  Dimensiune în grid
                </label>
                <div className="flex gap-2">
                  {SPAN_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setNewSpan(opt.value)}
                      className={`cursor-pointer text-xs px-3 py-1.5 border transition-colors ${
                        newSpan === opt.value
                          ? "bg-primary text-white border-primary"
                          : "bg-background text-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1 block">
                  Imagine
                </label>
                <ImageUploader
                  onUploaded={(id) => setNewImageId(id)}
                  currentImageUrl={undefined}
                />
              </div>

              <button
                onClick={handleAdd}
                disabled={!newImageId || !newAlt.trim()}
                className="cursor-pointer bg-[#14253a] text-white text-[11px] font-bold tracking-widest uppercase px-6 py-2.5 hover:bg-primary transition-colors disabled:opacity-40"
              >
                Adaugă în galerie
              </button>
            </div>
          )}

          {/* Images grid */}
          {!images ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-32 bg-muted animate-pulse" />
              ))}
            </div>
          ) : images.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nu ai imagini în galerie. Adaugă prima ta imagine!
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img) => (
                <div
                  key={img._id}
                  className={`relative group border border-border overflow-hidden ${
                    !img.active ? "opacity-50" : ""
                  }`}
                >
                  {img.imageUrl && (
                    <img
                      src={img.imageUrl}
                      alt={img.alt}
                      className="w-full h-32 object-cover"
                    />
                  )}
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleToggleActive(img._id, img.active)}
                      className="cursor-pointer p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
                      title={img.active ? "Ascunde" : "Arată"}
                    >
                      {img.active ? <EyeOff size={14} className="text-white" /> : <Eye size={14} className="text-white" />}
                    </button>
                    <button
                      onClick={() => handleDelete(img._id)}
                      className="cursor-pointer p-2 bg-red-500/50 hover:bg-red-500/80 rounded-full transition-colors"
                      title="Șterge"
                    >
                      <Trash2 size={14} className="text-white" />
                    </button>
                  </div>
                  {/* Info bar */}
                  <div className="px-2 py-1.5 bg-background">
                    <p className="text-[10px] text-foreground truncate font-medium">{img.alt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-muted-foreground">{img.category}</span>
                      {img.span && (
                        <span className="text-[8px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                          {img.span === "tall" ? "Înalt" : "Lat"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
