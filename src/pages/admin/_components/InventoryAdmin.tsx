import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.js";
import { motion, AnimatePresence } from "motion/react";
import { Package, Plus, Minus, AlertTriangle, ArrowDownCircle, ArrowUpCircle, Trash2, History, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

type InventoryItem = {
  _id: Id<"inventory">;
  productName: string;
  quantity: number;
  minThreshold: number;
  unit: string;
};

export default function InventoryAdmin() {
  const inventory = useQuery(api.inventory.list, {});
  const lowStock = useQuery(api.inventory.getLowStock, {});
  const movements = useQuery(api.inventory.getMovements, {});
  const addProduct = useMutation(api.inventory.addProduct);
  const addStock = useMutation(api.inventory.addStock);
  const removeStock = useMutation(api.inventory.removeStock);
  const removeProduct = useMutation(api.inventory.removeProduct);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showMovements, setShowMovements] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", qty: "0", min: "5", unit: "buc" });
  const [adjusting, setAdjusting] = useState<string | null>(null);
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustReason, setAdjustReason] = useState("");

  const handleAdd = async () => {
    if (!newProduct.name.trim()) {
      toast.error("Introdu un nume de produs");
      return;
    }
    try {
      await addProduct({
        productName: newProduct.name.trim(),
        quantity: Number(newProduct.qty) || 0,
        minThreshold: Number(newProduct.min) || 5,
        unit: newProduct.unit || "buc",
      });
      toast.success(`"${newProduct.name}" adăugat în stoc`);
      setNewProduct({ name: "", qty: "0", min: "5", unit: "buc" });
      setShowAddForm(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Eroare";
      toast.error(msg);
    }
  };

  const handleStockIn = async (item: InventoryItem) => {
    const qty = Number(adjustQty);
    if (!qty || qty <= 0) {
      toast.error("Introdu o cantitate validă");
      return;
    }
    await addStock({ id: item._id, quantity: qty, reason: adjustReason || "Aprovizionare" });
    toast.success(`+${qty} ${item.unit} la "${item.productName}"`);
    setAdjusting(null);
    setAdjustQty("");
    setAdjustReason("");
  };

  const handleStockOut = async (item: InventoryItem) => {
    const qty = Number(adjustQty);
    if (!qty || qty <= 0) {
      toast.error("Introdu o cantitate validă");
      return;
    }
    await removeStock({ id: item._id, quantity: qty, reason: adjustReason || "Ieșire manuală" });
    toast.success(`-${qty} ${item.unit} din "${item.productName}"`);
    setAdjusting(null);
    setAdjustQty("");
    setAdjustReason("");
  };

  const handleDelete = async (item: InventoryItem) => {
    if (!window.confirm(`Sigur vrei să ștergi "${item.productName}" din gestiune?`)) return;
    await removeProduct({ id: item._id });
    toast.success("Produs șters din gestiune");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package size={20} className="text-[#2e4e7e]" />
          <h2 className="font-serif text-xl text-[#14253a]">Gestiune Stocuri</h2>
          <span className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
            {inventory?.length ?? 0} produse
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowMovements(!showMovements)}
            className="cursor-pointer flex items-center gap-1.5 text-xs font-semibold px-3 py-2 border border-border bg-white hover:bg-muted/30 transition-colors"
          >
            <History size={14} /> Istoric
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="cursor-pointer flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase px-4 py-2 bg-[#14253a] text-white hover:bg-[#2e4e7e] transition-colors"
          >
            <Plus size={14} /> Produs nou
          </button>
        </div>
      </div>

      {/* Low stock alerts */}
      {lowStock && lowStock.length > 0 && (
        <div className="mb-6 border-2 border-amber-300 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-amber-600" />
            <span className="text-sm font-bold text-amber-800">Alerte stoc scăzut ({lowStock.length})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((item) => (
              <span key={item._id} className="text-xs bg-amber-200 text-amber-900 px-2 py-1 font-medium">
                {item.productName}: {item.quantity} {item.unit} (min: {item.minThreshold})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Add product form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="border border-border bg-muted/20 p-5">
              <h3 className="text-sm font-bold text-[#14253a] mb-3">Adaugă produs în gestiune</h3>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <input
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Nume produs"
                  className="border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-[#2e4e7e] transition-colors"
                />
                <input
                  type="number"
                  value={newProduct.qty}
                  onChange={(e) => setNewProduct({ ...newProduct, qty: e.target.value })}
                  placeholder="Cantitate"
                  min="0"
                  className="border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-[#2e4e7e] transition-colors"
                />
                <input
                  type="number"
                  value={newProduct.min}
                  onChange={(e) => setNewProduct({ ...newProduct, min: e.target.value })}
                  placeholder="Prag alertă"
                  min="0"
                  className="border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-[#2e4e7e] transition-colors"
                />
                <select
                  value={newProduct.unit}
                  onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                  className="border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-[#2e4e7e] transition-colors cursor-pointer"
                >
                  <option value="buc">buc</option>
                  <option value="porții">porții</option>
                  <option value="kg">kg</option>
                  <option value="l">l</option>
                  <option value="g">g</option>
                  <option value="ml">ml</option>
                </select>
              </div>
              <div className="flex justify-end mt-3">
                <button
                  onClick={handleAdd}
                  className="cursor-pointer bg-green-600 text-white text-xs font-bold tracking-wider uppercase px-5 py-2.5 hover:bg-green-700 transition-colors"
                >
                  Adaugă
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inventory table */}
      {!inventory ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-14 bg-muted animate-pulse" />)}
        </div>
      ) : inventory.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Package size={36} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Niciun produs în gestiune.</p>
          <p className="text-xs mt-1">Adaugă produse pentru a urmări stocurile.</p>
        </div>
      ) : (
        <div className="border border-border overflow-hidden">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2.5 bg-[#14253a] text-white text-[10px] font-bold tracking-[2px] uppercase">
            <div className="col-span-4">Produs</div>
            <div className="col-span-2 text-center">Cantitate</div>
            <div className="col-span-2 text-center">Prag minim</div>
            <div className="col-span-1 text-center">Unitate</div>
            <div className="col-span-3 text-center">Acțiuni</div>
          </div>

          {/* Rows */}
          {inventory.map((item) => {
            const isLow = item.quantity <= item.minThreshold;
            const isZero = item.quantity === 0;
            return (
              <div key={item._id}>
                <div className={`grid grid-cols-1 sm:grid-cols-12 gap-2 px-4 py-3 border-b border-border items-center ${isZero ? "bg-red-50" : isLow ? "bg-amber-50" : "bg-white"}`}>
                  <div className="col-span-4 flex items-center gap-2">
                    {isZero && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                    {isLow && !isZero && <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />}
                    {!isLow && <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />}
                    <span className="text-sm font-medium text-[#14253a]">{item.productName}</span>
                    {isZero && <span className="text-[9px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 uppercase tracking-wider">Epuizat</span>}
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`text-lg font-bold ${isZero ? "text-red-600" : isLow ? "text-amber-600" : "text-[#14253a]"}`}>
                      {item.quantity}
                    </span>
                  </div>
                  <div className="col-span-2 text-center text-sm text-muted-foreground">{item.minThreshold}</div>
                  <div className="col-span-1 text-center text-xs text-muted-foreground">{item.unit}</div>
                  <div className="col-span-3 flex items-center justify-center gap-1">
                    <button
                      onClick={() => { setAdjusting(adjusting === `in-${item._id}` ? null : `in-${item._id}`); setAdjustQty(""); setAdjustReason(""); }}
                      className="cursor-pointer p-1.5 text-green-600 hover:bg-green-100 transition-colors"
                      title="Intrare stoc"
                    >
                      <ArrowDownCircle size={18} />
                    </button>
                    <button
                      onClick={() => { setAdjusting(adjusting === `out-${item._id}` ? null : `out-${item._id}`); setAdjustQty(""); setAdjustReason(""); }}
                      className="cursor-pointer p-1.5 text-orange-600 hover:bg-orange-100 transition-colors"
                      title="Ieșire stoc"
                    >
                      <ArrowUpCircle size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="cursor-pointer p-1.5 text-red-400 hover:bg-red-100 transition-colors"
                      title="Șterge"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Adjust panel */}
                <AnimatePresence>
                  {(adjusting === `in-${item._id}` || adjusting === `out-${item._id}`) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-b border-border"
                    >
                      <div className={`p-4 ${adjusting.startsWith("in") ? "bg-green-50" : "bg-orange-50"}`}>
                        <div className="flex flex-col sm:flex-row gap-3 items-end">
                          <div className="flex-1">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                              Cantitate ({item.unit})
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={adjustQty}
                              onChange={(e) => setAdjustQty(e.target.value)}
                              placeholder="0"
                              className="w-full border border-input bg-background px-3 py-2 text-sm outline-none focus:border-[#2e4e7e]"
                            />
                          </div>
                          <div className="flex-[2]">
                            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                              Motiv
                            </label>
                            <input
                              value={adjustReason}
                              onChange={(e) => setAdjustReason(e.target.value)}
                              placeholder={adjusting.startsWith("in") ? "Aprovizionare" : "Pierdere / Ajustare"}
                              className="w-full border border-input bg-background px-3 py-2 text-sm outline-none focus:border-[#2e4e7e]"
                            />
                          </div>
                          <button
                            onClick={() => adjusting.startsWith("in") ? handleStockIn(item) : handleStockOut(item)}
                            className={`cursor-pointer text-xs font-bold tracking-wider uppercase px-5 py-2.5 text-white transition-colors ${
                              adjusting.startsWith("in") ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"
                            }`}
                          >
                            {adjusting.startsWith("in") ? "Adaugă" : "Scade"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      {/* Movements history */}
      <AnimatePresence>
        {showMovements && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mt-6"
          >
            <div className="border border-border bg-white">
              <button
                onClick={() => setShowMovements(false)}
                className="cursor-pointer w-full flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border"
              >
                <span className="flex items-center gap-2 text-sm font-bold text-[#14253a]">
                  <History size={14} /> Istoric mișcări stoc
                </span>
                <ChevronUp size={16} className="text-muted-foreground" />
              </button>
              <div className="max-h-80 overflow-y-auto">
                {!movements || movements.length === 0 ? (
                  <p className="p-6 text-center text-sm text-muted-foreground">Nicio mișcare înregistrată.</p>
                ) : (
                  movements.map((m) => (
                    <div key={m._id} className="flex items-center gap-3 px-4 py-2.5 border-b border-border last:border-0">
                      {m.type === "in" ? (
                        <ArrowDownCircle size={14} className="text-green-600 shrink-0" />
                      ) : (
                        <ArrowUpCircle size={14} className="text-orange-600 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-[#14253a] font-medium">{m.productName}</span>
                        <span className="text-xs text-muted-foreground ml-2">— {m.reason}</span>
                      </div>
                      <span className={`text-sm font-bold shrink-0 ${m.type === "in" ? "text-green-600" : "text-orange-600"}`}>
                        {m.type === "in" ? "+" : "-"}{m.quantity}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {format(new Date(m.timestamp), "d MMM HH:mm", { locale: ro })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
