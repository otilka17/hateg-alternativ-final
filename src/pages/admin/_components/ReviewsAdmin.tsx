import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Trash2, Star } from "lucide-react";

export default function ReviewsAdmin() {
  const reviews = useQuery(api.reviews.listAll, {});
  const approve = useMutation(api.reviews.approve);
  const remove = useMutation(api.reviews.remove);
  const [loading, setLoading] = useState<string | null>(null);

  const handleApprove = async (id: typeof reviews extends (infer T)[] | undefined ? T extends { _id: infer I } ? I : never : never) => {
    setLoading(id as string);
    try {
      await approve({ id });
      toast.success("Recenzie aprobată!");
    } catch {
      toast.error("Eroare la aprobare");
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (id: typeof reviews extends (infer T)[] | undefined ? T extends { _id: infer I } ? I : never : never) => {
    setLoading(id as string);
    try {
      await remove({ id });
      toast.success("Recenzie ștearsă!");
    } catch {
      toast.error("Eroare la ștergere");
    } finally {
      setLoading(null);
    }
  };

  if (!reviews) return <p className="text-sm text-muted-foreground">Se încarcă...</p>;

  const pending = reviews.filter((r) => !r.approved);
  const approved = reviews.filter((r) => r.approved);

  return (
    <div>
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <Star size={18} className="text-[#f5a06a]" /> Recenzii clienți
      </h3>

      {/* Pending reviews */}
      {pending.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-3">
            De aprobat ({pending.length})
          </h4>
          <div className="space-y-3">
            {pending.map((review) => (
              <div key={review._id} className="border border-orange-200 bg-orange-50 p-4 flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{review.name}</span>
                    {review.location && <span className="text-xs text-muted-foreground">({review.location})</span>}
                    <span className="text-xs text-[#f5a06a]">{"★".repeat(review.stars)}</span>
                  </div>
                  <p className="text-sm text-foreground/80 italic">{`"${review.text}"`}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleApprove(review._id)}
                    disabled={loading === (review._id as string)}
                    className="cursor-pointer flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-bold uppercase rounded-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    <Check size={14} /> Aprobă
                  </button>
                  <button
                    onClick={() => handleDelete(review._id)}
                    disabled={loading === (review._id as string)}
                    className="cursor-pointer flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs font-bold uppercase rounded-sm hover:bg-red-700 disabled:opacity-50"
                  >
                    <Trash2 size={14} /> Șterge
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approved reviews */}
      <div>
        <h4 className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-3">
          Aprobate ({approved.length})
        </h4>
        {approved.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nicio recenzie aprobată încă.</p>
        ) : (
          <div className="space-y-2">
            {approved.map((review) => (
              <div key={review._id} className="border border-green-200 bg-green-50/50 p-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm">{review.name}</span>
                    {review.location && <span className="text-xs text-muted-foreground">({review.location})</span>}
                    <span className="text-xs text-[#f5a06a]">{"★".repeat(review.stars)}</span>
                  </div>
                  <p className="text-xs text-foreground/70 italic truncate">{review.text}</p>
                </div>
                <button
                  onClick={() => handleDelete(review._id)}
                  disabled={loading === (review._id as string)}
                  className="cursor-pointer p-1.5 text-red-500 hover:bg-red-50 disabled:opacity-50"
                  title="Șterge"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
