import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.js";
import { toast } from "sonner";
import { Sparkles, Trash2, Eye, EyeOff, Plus, ChevronDown, ChevronUp } from "lucide-react";
import ImageUploader from "./ImageUploader.tsx";

export default function DailySpecialAdmin() {
  const specials = useQuery(api.dailySpecial.listAll, {});
  const upsert = useMutation(api.dailySpecial.upsert);
  const setActive = useMutation(api.dailySpecial.setActive);
  const removeSpecial = useMutation(api.dailySpecial.remove);

  const [expanded, setExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<Id<"dailySpecial"> | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [badge, setBadge] = useState("");
  const [imageId, setImageId] = useState<Id<"_storage"> | null>(null);
  const [active, setActiveState] = useState(true);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setOriginalPrice("");
    setDiscountPrice("");
    setBadge("");
    setImageId(null);
    setActiveState(true);
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (special: NonNullable<typeof specials>[number]) => {
    setEditId(special._id);
    setTitle(special.title);
    setDescription(special.description);
    setOriginalPrice(special.originalPrice?.toString() ?? "");
    setDiscountPrice(special.discountPrice?.toString() ?? "");
    setBadge(special.badge ?? "");
    setImageId(special.imageId ?? null);
    setActiveState(special.active);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Completează titlul și descrierea.");
      return;
    }

    await upsert({
      id: editId ?? undefined,
      title: title.trim(),
      description: description.trim(),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      discountPrice: discountPrice ? parseFloat(discountPrice) : undefined,
      badge: badge.trim() || undefined,
      imageId: imageId ?? undefined,
      active,
    });

    toast.success(editId ? "Oferta actualizată!" : "Oferta creată!");
    resetForm();
  };

  const handleToggle = async (id: Id<"dailySpecial">, currentActive: boolean) => {
    await setActive({ id, active: !currentActive });
    toast.success(!currentActive ? "Oferta activată pe site" : "Oferta dezactivată");
  };

  const handleDelete = async (id: Id<"dailySpecial">) => {
    if (!confirm("Sigur vrei să ștergi această ofertă?")) return;
    await removeSpecial({ id });
    toast.success("Oferta ștearsă");
  };

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="cursor-pointer w-full flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-[#f5a06a]" />
          <h3 className="font-serif text-lg text-[#14253a]">Oferta Zilei</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {specials?.filter((s) => s.active).length ?? 0} activă
          </span>
        </div>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && (
        <div>
          {/* Add / Edit button */}
          <button
            onClick={() => {
              if (showForm) resetForm();
              else setShowForm(true);
            }}
            className="cursor-pointer mb-4 bg-[#f5a06a]/10 hover:bg-[#f5a06a]/20 text-[#f5a06a] text-xs font-semibold tracking-wider uppercase px-4 py-2.5 transition-colors flex items-center gap-2"
          >
            <Plus size={14} />
            {showForm ? "Anulează" : "Adaugă ofertă nouă"}
          </button>

          {/* Form */}
          {showForm && (
            <div className="border border-border bg-muted/20 p-4 mb-6 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1 block">
                    Titlu ofertă *
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Sandwich Nobil + Cafea"
                    className="w-full border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1 block">
                    Etichetă (opțional)
                  </label>
                  <input
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="Ex: -20%, NOU, LIMITAT"
                    className="w-full border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1 block">
                  Descriere *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrie oferta pe scurt..."
                  rows={2}
                  className="w-full border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1 block">
                    Preț original (lei)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    placeholder="Ex: 25.00"
                    className="w-full border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1 block">
                    Preț redus (lei)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    placeholder="Ex: 19.90"
                    className="w-full border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1 block">
                  Imagine (opțional)
                </label>
                <ImageUploader
                  onUploaded={(id) => setImageId(id)}
                  currentImageUrl={undefined}
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActiveState(e.target.checked)}
                    className="w-4 h-4 accent-[#f5a06a] cursor-pointer"
                  />
                  <span className="text-sm text-foreground">Afișează pe site</span>
                </label>

                <button
                  onClick={handleSave}
                  disabled={!title.trim() || !description.trim()}
                  className="cursor-pointer bg-[#14253a] text-white text-[11px] font-bold tracking-widest uppercase px-6 py-2.5 hover:bg-primary transition-colors disabled:opacity-40"
                >
                  {editId ? "Actualizează" : "Creează oferta"}
                </button>
              </div>
            </div>
          )}

          {/* Existing specials list */}
          {!specials ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 bg-muted animate-pulse" />
              ))}
            </div>
          ) : specials.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nu ai nicio ofertă specială. Creează prima ta ofertă!
            </p>
          ) : (
            <div className="space-y-3">
              {specials.map((special) => (
                <div
                  key={special._id}
                  className={`border border-border p-4 flex items-center gap-4 ${
                    !special.active ? "opacity-50" : ""
                  }`}
                >
                  {/* Thumbnail */}
                  {special.imageUrl ? (
                    <img
                      src={special.imageUrl}
                      alt={special.title}
                      className="w-16 h-16 object-cover rounded-sm flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-[#f5a06a]/10 flex items-center justify-center rounded-sm flex-shrink-0">
                      <Sparkles size={20} className="text-[#f5a06a]" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#14253a] truncate">
                        {special.title}
                      </span>
                      {special.badge && (
                        <span className="text-[9px] bg-[#f5a06a]/20 text-[#f5a06a] px-2 py-0.5 font-bold uppercase">
                          {special.badge}
                        </span>
                      )}
                      {special.active && (
                        <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 font-bold uppercase">
                          Activă
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {special.description}
                    </p>
                    {special.originalPrice && special.discountPrice && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground line-through">
                          {special.originalPrice.toFixed(2)} lei
                        </span>
                        <span className="text-xs text-[#f5a06a] font-bold">
                          {special.discountPrice.toFixed(2)} lei
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(special)}
                      className="cursor-pointer p-2 text-muted-foreground hover:text-foreground transition-colors text-xs font-medium"
                      title="Editează"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggle(special._id, special.active)}
                      className="cursor-pointer p-2 text-muted-foreground hover:text-foreground transition-colors"
                      title={special.active ? "Dezactivează" : "Activează"}
                    >
                      {special.active ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      onClick={() => handleDelete(special._id)}
                      className="cursor-pointer p-2 text-red-400 hover:text-red-600 transition-colors"
                      title="Șterge"
                    >
                      <Trash2 size={14} />
                    </button>
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
