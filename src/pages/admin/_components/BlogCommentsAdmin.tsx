import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.js";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Trash2, MessageCircle } from "lucide-react";

export default function BlogCommentsAdmin() {
  const comments = useQuery(api.blog.listAllComments, {});
  const approve = useMutation(api.blog.approveComment);
  const remove = useMutation(api.blog.removeComment);
  const [loading, setLoading] = useState<Id<"blogComments"> | null>(null);

  const handleApprove = async (id: Id<"blogComments">) => {
    setLoading(id);
    try {
      await approve({ id });
      toast.success("Comentariu aprobat!");
    } catch {
      toast.error("Eroare la aprobare");
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async (id: Id<"blogComments">) => {
    setLoading(id);
    try {
      await remove({ id });
      toast.success("Comentariu șters!");
    } catch {
      toast.error("Eroare la ștergere");
    } finally {
      setLoading(null);
    }
  };

  if (!comments) return <p className="text-sm text-muted-foreground">Se încarcă...</p>;

  const pending = comments.filter((c) => !c.approved);
  const approved = comments.filter((c) => c.approved);

  return (
    <div>
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <MessageCircle size={18} className="text-primary" /> Comentarii blog
      </h3>

      {pending.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-3">
            De aprobat ({pending.length})
          </h4>
          <div className="space-y-3">
            {pending.map((c) => (
              <div key={c._id} className="border border-orange-200 bg-orange-50 p-4 flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{c.name}</span>
                    <span className="text-xs text-muted-foreground">— {c.postTitle}</span>
                  </div>
                  <p className="text-sm text-foreground/80 italic">{`"${c.text}"`}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleApprove(c._id)}
                    disabled={loading === c._id}
                    className="cursor-pointer flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-bold uppercase rounded-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    <Check size={14} /> Aprobă
                  </button>
                  <button
                    onClick={() => handleDelete(c._id)}
                    disabled={loading === c._id}
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

      <div>
        <h4 className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-3">
          Aprobate ({approved.length})
        </h4>
        {approved.length === 0 ? (
          <p className="text-sm text-muted-foreground">Niciun comentariu aprobat încă.</p>
        ) : (
          <div className="space-y-2">
            {approved.map((c) => (
              <div key={c._id} className="border border-green-200 bg-green-50/50 p-3 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm">{c.name}</span>
                    <span className="text-xs text-muted-foreground">— {c.postTitle}</span>
                  </div>
                  <p className="text-xs text-foreground/70 italic truncate">{c.text}</p>
                </div>
                <button
                  onClick={() => handleDelete(c._id)}
                  disabled={loading === c._id}
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
