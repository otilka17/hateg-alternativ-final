import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.js";
import { Plus, Pencil, Trash2, Save, X, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import ImageUploader from "./ImageUploader.tsx";

const CATEGORIES = [
  { id: "cafea", label: "Cafea" },
  { id: "specialitati", label: "Specialități" },
  { id: "limonada", label: "Limonadă & Fresh" },
  { id: "sanatate", label: "Doză de sănătate" },
  { id: "sandwich", label: "Sandwich-uri" },
  { id: "dulce", label: "Dulce" },
];

type MenuItemDoc = {
  _id: Id<"menuItems">;
  category: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  imageId?: Id<"_storage">;
  sortOrder: number;
  active: boolean;
};

export default function MenuAdmin() {
  const [selectedCategory, setSelectedCategory] = useState("cafea");
  const [editingId, setEditingId] = useState<Id<"menuItems"> | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const items = useQuery(api.cms.listMenuItems, { category: selectedCategory });
  const createItem = useMutation(api.cms.createMenuItem);
  const updateItem = useMutation(api.cms.updateMenuItem);
  const deleteItem = useMutation(api.cms.deleteMenuItem);

  const sortedItems = items?.sort((a, b) => a.sortOrder - b.sortOrder) ?? [];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-xl text-[#14253a]">Produse Meniu</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="cursor-pointer flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase px-4 py-2.5 bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          <Plus size={12} /> Adaugă
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setSelectedCategory(cat.id); setEditingId(null); }}
            className={`cursor-pointer text-[10px] font-semibold tracking-wider uppercase px-3 py-1.5 transition-colors border ${
              selectedCategory === cat.id
                ? "bg-[#14253a] text-white border-[#14253a]"
                : "bg-transparent text-muted-foreground border-foreground/15 hover:border-foreground/30"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Add form */}
      {showAddForm && (
        <AddMenuItemForm
          category={selectedCategory}
          sortOrder={sortedItems.length}
          onSave={async (data) => {
            await createItem(data);
            setShowAddForm(false);
            toast.success("Produs adăugat!");
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Items list */}
      <div className="space-y-2">
        {sortedItems.map((item) => (
          <div key={item._id}>
            {editingId === item._id ? (
              <EditMenuItemForm
                item={item}
                onSave={async (data) => {
                  await updateItem({ id: item._id, ...data });
                  setEditingId(null);
                  toast.success("Salvat!");
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className={`flex items-center gap-3 p-3 border border-foreground/8 bg-white ${!item.active ? "opacity-50" : ""}`}>
                {item.imageUrl && (
                  <img src={item.imageUrl} alt="" className="w-10 h-10 object-cover rounded-sm shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-[#14253a] truncate">{item.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                </div>
                <div className="font-serif text-lg text-primary shrink-0">{item.price} lei</div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => setEditingId(item._id)} className="cursor-pointer p-1.5 text-muted-foreground hover:text-primary transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm("Ștergi acest produs?")) {
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
            Niciun produs în această categorie. Apasă "Adaugă" pentru a crea primul.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Add Form ───

function AddMenuItemForm({
  category,
  sortOrder,
  onSave,
  onCancel,
}: {
  category: string;
  sortOrder: number;
  onSave: (data: { category: string; name: string; description: string; price: number; sortOrder: number; imageId?: Id<"_storage"> }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageId, setImageId] = useState<Id<"_storage"> | undefined>();
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;
    setSaving(true);
    await onSave({
      category,
      name,
      description,
      price: Number(price),
      sortOrder,
      ...(imageId ? { imageId } : {}),
    });
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="border border-primary/30 bg-primary/5 p-4 mb-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nume produs"
          className="px-3 py-2 text-sm border border-foreground/15 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          required
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Preț (lei)"
          type="number"
          min="0"
          step="0.5"
          className="px-3 py-2 text-sm border border-foreground/15 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          required
        />
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descriere scurtă"
        rows={2}
        className="w-full px-3 py-2 text-sm border border-foreground/15 bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-none"
      />
      <ImageUploader onUploaded={setImageId} />
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

// ─── Edit Form ───

function EditMenuItemForm({
  item,
  onSave,
  onCancel,
}: {
  item: MenuItemDoc;
  onSave: (data: { name?: string; description?: string; price?: number; imageId?: Id<"_storage">; clearImage?: boolean; active?: boolean }) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description);
  const [price, setPrice] = useState(String(item.price));
  const [imageId, setImageId] = useState<Id<"_storage"> | undefined>(item.imageId);
  const [clearImage, setClearImage] = useState(false);
  const [active, setActive] = useState(item.active);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      name,
      description,
      price: Number(price),
      active,
      ...(imageId ? { imageId } : {}),
      ...(clearImage ? { clearImage: true } : {}),
    });
    setSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="border border-primary/30 bg-primary/5 p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-3 py-2 text-sm border border-foreground/15 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          required
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          type="number"
          min="0"
          step="0.5"
          className="px-3 py-2 text-sm border border-foreground/15 bg-white focus:outline-none focus:ring-1 focus:ring-primary"
          required
        />
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 text-sm border border-foreground/15 bg-white focus:outline-none focus:ring-1 focus:ring-primary resize-none"
      />
      <ImageUploader
        currentImageUrl={item.imageUrl}
        onUploaded={(id) => { setImageId(id); setClearImage(false); }}
        onRemove={() => { setImageId(undefined); setClearImage(true); }}
      />
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="accent-primary" />
        <span className="text-xs text-muted-foreground">Activ (vizibil pe site)</span>
      </label>
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
