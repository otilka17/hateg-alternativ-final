import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.js";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";
import ImageUploader from "./ImageUploader.tsx";

type PachetDoc = {
  _id: Id<"pacheteItems">;
  name: string;
  description: string;
  includes: string[];
  price: number;
  emoji: string;
  tag?: string;
  saves?: number;
  imageUrl: string | null;
  imageId?: Id<"_storage">;
  sortOrder: number;
  active: boolean;
};

export default function PacheteAdmin() {
  const [editingId, setEditingId] = useState<Id<"pacheteItems"> | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const items = useQuery(api.cms.listPacheteItems, {});
  const createItem = useMutation(api.cms.createPachetItem);
  const updateItem = useMutation(api.cms.updatePachetItem);
  const deleteItem = useMutation(api.cms.deletePachetItem);

  const sortedItems = (items ?? []).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-xl text-[#14253a]">Pachete</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="cursor-pointer flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase px-4 py-2.5 bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          <Plus size={12} /> Adaugă
        </button>
      </div>

      {showAddForm && (
        <PachetForm
          sortOrder={sortedItems.length}
          onSave={async (data) => {
            await createItem(data);
            setShowAddForm(false);
            toast.success("Pachet adăugat!");
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="space-y-2">
        {sortedItems.map((item) => (
          <div key={item._id}>
            {editingId === item._id ? (
              <PachetForm
                item={item}
                sortOrder={item.sortOrder}
                onSave={async (data) => {
                  await updateItem({ id: item._id, ...data });
                  setEditingId(null);
                  toast.success("Salvat!");
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className={`flex items-center gap-3 p-3 border border-foreground/8 bg-white ${!item.active ? "opacity-50" : ""}`}>
                <span className="text-2xl shrink-0">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-[#14253a] truncate">
                    {item.name}
                    {item.tag && <span className="ml-2 text-[9px] font-bold tracking-wider uppercase text-primary bg-primary/10 px-1.5 py-0.5">{item.tag}</span>}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{item.includes.join(" · ")}</div>
                </div>
                <div className="font-serif text-lg text-primary shrink-0">{item.price} lei</div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setEditingId(item._id)} className="cursor-pointer p-1.5 text-muted-foreground hover:text-primary transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm("Ștergi acest pachet?")) {
                        await deleteItem({ id: item._id });
                        toast.success("Șters!");
                      }
                    }}
                    className="cursor-pointer p-1.5 text-muted-foreground hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {sortedItems.length === 0 && !showAddForm && (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Niciun pachet adăugat. Apasă "Adaugă" sau importă datele existente.
          </p>
        )}
      </div>
    </div>
  );
}

function PachetForm({
  item,
  sortOrder,
  onSave,
  onCancel,
}: {
  item?: PachetDoc;
  sortOrder: number;
  onSave: (data: { name: string; description: string; includes: string[]; price: number; emoji: string; tag?: string; saves?: number; sortOrder: number; imageId?: Id<"_storage">; clearImage?: boolean }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [includesText, setIncludesText] = useState(item?.includes.join("\n") ?? "");
  const [price, setPrice] = useState(item ? String(item.price) : "");
  const [emoji, setEmoji] = useState(item?.emoji ?? "🎒");
  const [tag, setTag] = useState(item?.tag ?? "");
  const [saves, setSaves] = useState(item?.saves ? String(item.saves) : "");
  const [imageId, setImageId] = useState<Id<"_storage"> | undefined>(item?.imageId);
  const [clearImage, setClearImage] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    setSaving(true);
    await onSave({
      name,
      description,
      includes: includesText.split("\n").filter((l) => l.trim()),
      price: Number(price),
      emoji,
      sortOrder,
      ...(tag ? { tag } : {}),
      ...(saves ? { saves: Number(saves) } : {}),
      ...(imageId ? { imageId } : {}),
      ...(clearImage ? { clearImage: true } : {}),
    });
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="border border-primary/30 bg-primary/5 p-4 mb-4 space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nume pachet" className="col-span-2 px-3 py-2 text-sm border border-foreground/15 bg-white focus:outline-none focus:ring-1 focus:ring-primary" required />
        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Preț" type="number" min="0" className="px-3 py-2 text-sm border border-foreground/15 bg-white focus:outline-none focus:ring-1 focus:ring-primary" required />
      </div>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descriere" rows={2} className="w-full px-3 py-2 text-sm border border-foreground/15 bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
      <textarea value={includesText} onChange={(e) => setIncludesText(e.target.value)} placeholder="Ce include (câte un item pe linie)" rows={3} className="w-full px-3 py-2 text-sm border border-foreground/15 bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
      <div className="grid grid-cols-3 gap-3">
        <input value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="Emoji" className="px-3 py-2 text-sm border border-foreground/15 bg-white focus:outline-none focus:ring-1 focus:ring-primary text-center text-xl" />
        <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Tag (opțional)" className="px-3 py-2 text-sm border border-foreground/15 bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
        <input value={saves} onChange={(e) => setSaves(e.target.value)} placeholder="Economie (lei)" type="number" min="0" className="px-3 py-2 text-sm border border-foreground/15 bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
      </div>
      <ImageUploader
        currentImageUrl={item?.imageUrl}
        onUploaded={(id) => { setImageId(id); setClearImage(false); }}
        onRemove={() => { setImageId(undefined); setClearImage(true); }}
      />
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="cursor-pointer flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase px-4 py-2.5 bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50">
          <Save size={12} /> {saving ? "Se salvează..." : "Salvează"}
        </button>
        <button type="button" onClick={onCancel} className="cursor-pointer flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase px-4 py-2.5 border border-foreground/15 text-muted-foreground hover:bg-muted transition-colors">
          <X size={12} /> Anulează
        </button>
      </div>
    </form>
  );
}
