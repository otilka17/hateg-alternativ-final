import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.js";
import { Plus, Pencil, Trash2, Save, X } from "lucide-react";
import { toast } from "sonner";
import ImageUploader from "./ImageUploader.tsx";

type BorcanDoc = {
  _id: Id<"borcaneItems">;
  name: string;
  description: string;
  info: string;
  price: number;
  emoji: string;
  tag?: string;
  imageUrl: string | null;
  imageId?: Id<"_storage">;
  sortOrder: number;
  active: boolean;
};

export default function BorcaneAdmin() {
  const [editingId, setEditingId] = useState<Id<"borcaneItems"> | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const items = useQuery(api.cms.listBorcaneItems, {});
  const createItem = useMutation(api.cms.createBorcanItem);
  const updateItem = useMutation(api.cms.updateBorcanItem);
  const deleteItem = useMutation(api.cms.deleteBorcanItem);

  const sortedItems = (items ?? []).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-xl text-[#14253a]">Produse Borcane</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="cursor-pointer flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase px-4 py-2.5 bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          <Plus size={12} /> Adaugă
        </button>
      </div>

      {showAddForm && (
        <BorcanForm
          sortOrder={sortedItems.length}
          onSave={async (data) => {
            await createItem(data);
            setShowAddForm(false);
            toast.success("Borcan adăugat!");
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <div className="space-y-2">
        {sortedItems.map((item) => (
          <div key={item._id}>
            {editingId === item._id ? (
              <BorcanForm
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
                  <div className="text-xs text-muted-foreground truncate">{item.info}</div>
                </div>
                <div className="font-serif text-lg text-primary shrink-0">{item.price} lei</div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setEditingId(item._id)} className="cursor-pointer p-1.5 text-muted-foreground hover:text-primary transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm("Ștergi acest borcan?")) {
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
            Niciun borcan adăugat. Apasă "Adaugă" sau importă datele existente.
          </p>
        )}
      </div>
    </div>
  );
}

function BorcanForm({
  item,
  sortOrder,
  onSave,
  onCancel,
}: {
  item?: BorcanDoc;
  sortOrder: number;
  onSave: (data: { name: string; description: string; info: string; price: number; emoji: string; tag?: string; sortOrder: number; imageId?: Id<"_storage"> }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(item?.name ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [info, setInfo] = useState(item?.info ?? "");
  const [price, setPrice] = useState(item ? String(item.price) : "");
  const [emoji, setEmoji] = useState(item?.emoji ?? "🫙");
  const [tag, setTag] = useState(item?.tag ?? "");
  const [imageId, setImageId] = useState<Id<"_storage"> | undefined>(item?.imageId);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    setSaving(true);
    await onSave({
      name,
      description,
      info,
      price: Number(price),
      emoji,
      sortOrder,
      ...(tag ? { tag } : {}),
      ...(imageId ? { imageId } : {}),
    });
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="border border-primary/30 bg-primary/5 p-4 mb-4 space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nume" className="col-span-2 px-3 py-2 text-sm border border-foreground/15 bg-white focus:outline-none focus:ring-1 focus:ring-primary" required />
        <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Preț" type="number" min="0" className="px-3 py-2 text-sm border border-foreground/15 bg-white focus:outline-none focus:ring-1 focus:ring-primary" required />
      </div>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descriere" rows={2} className="w-full px-3 py-2 text-sm border border-foreground/15 bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
      <div className="grid grid-cols-3 gap-3">
        <input value={info} onChange={(e) => setInfo(e.target.value)} placeholder="Info (ex: 300g · vegetal)" className="col-span-2 px-3 py-2 text-sm border border-foreground/15 bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
        <input value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="Emoji" className="px-3 py-2 text-sm border border-foreground/15 bg-white focus:outline-none focus:ring-1 focus:ring-primary text-center text-xl" />
      </div>
      <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Tag opțional (ex: Best seller, Local)" className="w-full px-3 py-2 text-sm border border-foreground/15 bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
      <ImageUploader currentImageUrl={item?.imageUrl} onUploaded={setImageId} />
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
