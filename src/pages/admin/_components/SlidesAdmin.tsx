import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.js";
import { toast } from "sonner";
import { Images, Trash2, Eye, EyeOff, ChevronDown, ChevronUp, Plus, GripVertical, Pencil, X, ArrowUp, ArrowDown } from "lucide-react";
import ImageUploader from "./ImageUploader.tsx";

type Slide = {
  _id: Id<"slides">;
  title: string;
  subtitle: string;
  description: string;
  link: string;
  imageId?: Id<"_storage">;
  imageUrl?: string;
  resolvedImageUrl: string | null;
  sortOrder: number;
  active: boolean;
};

export default function SlidesAdmin() {
  const slides = useQuery(api.slides.listAll, {});
  const createSlide = useMutation(api.slides.create);
  const updateSlide = useMutation(api.slides.update);
  const removeSlide = useMutation(api.slides.remove);
  const reorderSlides = useMutation(api.slides.reorder);

  const [expanded, setExpanded] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<Id<"slides"> | null>(null);

  // New slide form
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newLink, setNewLink] = useState("/meniu");
  const [newImageId, setNewImageId] = useState<Id<"_storage"> | null>(null);

  // Edit slide form
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editLink, setEditLink] = useState("");
  const [editImageId, setEditImageId] = useState<Id<"_storage"> | null>(null);

  const handleAdd = async () => {
    if (!newTitle.trim()) {
      toast.error("Adaugă un titlu.");
      return;
    }
    const nextOrder = (slides?.length ?? 0) + 1;
    await createSlide({
      title: newTitle.trim(),
      subtitle: newSubtitle.trim(),
      description: newDesc.trim(),
      link: newLink.trim() || "/meniu",
      imageId: newImageId ?? undefined,
      sortOrder: nextOrder,
    });
    setNewTitle("");
    setNewSubtitle("");
    setNewDesc("");
    setNewLink("/meniu");
    setNewImageId(null);
    setShowAdd(false);
    toast.success("Slide adăugat!");
  };

  const handleToggleActive = async (id: Id<"slides">, currentActive: boolean) => {
    await updateSlide({ id, active: !currentActive });
    toast.success(currentActive ? "Slide ascuns" : "Slide vizibil");
  };

  const handleDelete = async (id: Id<"slides">) => {
    if (!confirm("Sigur vrei să ștergi acest slide?")) return;
    await removeSlide({ id });
    toast.success("Slide șters");
  };

  const handleStartEdit = (slide: Slide) => {
    setEditingId(slide._id);
    setEditTitle(slide.title);
    setEditSubtitle(slide.subtitle);
    setEditDesc(slide.description);
    setEditLink(slide.link);
    setEditImageId(slide.imageId ?? null);
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    await updateSlide({
      id: editingId,
      title: editTitle.trim(),
      subtitle: editSubtitle.trim(),
      description: editDesc.trim(),
      link: editLink.trim(),
      imageId: editImageId ?? undefined,
    });
    setEditingId(null);
    toast.success("Slide actualizat!");
  };

  const handleMoveUp = async (index: number) => {
    if (!slides || index === 0) return;
    const ids = slides.map((s) => s._id);
    [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
    await reorderSlides({ orderedIds: ids });
  };

  const handleMoveDown = async (index: number) => {
    if (!slides || index === slides.length - 1) return;
    const ids = slides.map((s) => s._id);
    [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
    await reorderSlides({ orderedIds: ids });
  };

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="cursor-pointer w-full flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-2">
          <Images size={18} className="text-primary" />
          <h3 className="font-serif text-lg text-[#14253a]">Carusel Homepage</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {slides?.length ?? 0} slide-uri
          </span>
        </div>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && (
        <div className="space-y-3">
          {/* Add button */}
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="cursor-pointer flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium"
          >
            <Plus size={16} /> Adaugă slide nou
          </button>

          {/* Add form */}
          {showAdd && (
            <div className="border border-border p-4 bg-muted/20 space-y-3">
              <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Slide nou</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Titlu (ex: Cafea & Băuturi)"
                  className="border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                />
                <input
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  placeholder="Subtitlu (ex: Proaspăt preparate)"
                  className="border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="Descriere scurtă..."
                rows={2}
                className="w-full border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors resize-none"
              />
              <input
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="Link (ex: /meniu)"
                className="w-full border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
              />
              <ImageUploader
                onUploaded={(id) => setNewImageId(id)}
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowAdd(false)}
                  className="cursor-pointer text-xs text-muted-foreground hover:text-foreground px-3 py-2"
                >
                  Anulează
                </button>
                <button
                  onClick={handleAdd}
                  className="cursor-pointer bg-[#14253a] text-white text-[11px] font-bold tracking-widest uppercase px-5 py-2.5 hover:bg-primary transition-colors"
                >
                  Adaugă
                </button>
              </div>
            </div>
          )}

          {/* Slides list */}
          {!slides ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 bg-muted animate-pulse" />
              ))}
            </div>
          ) : slides.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Niciun slide adăugat. Adaugă primul slide!
            </p>
          ) : (
            <div className="space-y-2">
              {slides.map((slide, index) => (
                <div
                  key={slide._id}
                  className={`border border-border bg-white p-3 flex gap-3 items-start ${!slide.active ? "opacity-50" : ""}`}
                >
                  {/* Reorder controls */}
                  <div className="flex flex-col items-center gap-0.5 pt-1">
                    <GripVertical size={14} className="text-muted-foreground" />
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="cursor-pointer p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === slides.length - 1}
                      className="cursor-pointer p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      <ArrowDown size={12} />
                    </button>
                  </div>

                  {/* Image preview */}
                  <div className="w-20 h-14 shrink-0 bg-muted overflow-hidden">
                    {slide.resolvedImageUrl ? (
                      <img
                        src={slide.resolvedImageUrl}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Images size={16} />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  {editingId === slide._id ? (
                    <div className="flex-1 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
                          placeholder="Titlu"
                        />
                        <input
                          value={editSubtitle}
                          onChange={(e) => setEditSubtitle(e.target.value)}
                          className="border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
                          placeholder="Subtitlu"
                        />
                      </div>
                      <textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={2}
                        className="w-full border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-primary resize-none"
                        placeholder="Descriere"
                      />
                      <input
                        value={editLink}
                        onChange={(e) => setEditLink(e.target.value)}
                        className="w-full border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
                        placeholder="Link"
                      />
                      <ImageUploader
                        currentImageUrl={slide.resolvedImageUrl}
                        onUploaded={(id) => setEditImageId(id)}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="cursor-pointer bg-[#14253a] text-white text-[10px] font-bold tracking-widest uppercase px-4 py-2 hover:bg-primary transition-colors"
                        >
                          Salvează
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="cursor-pointer text-xs text-muted-foreground hover:text-foreground px-3 py-2"
                        >
                          Anulează
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-medium text-sm text-[#14253a] truncate">{slide.title}</span>
                        <span className="text-[10px] text-muted-foreground">{slide.subtitle}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{slide.description}</p>
                      <p className="text-[10px] text-primary/70 mt-0.5">{slide.link}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {editingId !== slide._id && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleStartEdit(slide)}
                        className="cursor-pointer p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                        title="Editează"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleToggleActive(slide._id, slide.active)}
                        className="cursor-pointer p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                        title={slide.active ? "Ascunde" : "Arată"}
                      >
                        {slide.active ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button
                        onClick={() => handleDelete(slide._id)}
                        className="cursor-pointer p-1.5 text-red-400 hover:text-red-600 transition-colors"
                        title="Șterge"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
