import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.js";
import { ConvexError } from "convex/values";
import { toast } from "sonner";
import { MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

export default function BlogComments({ postId }: { postId: Id<"blogPosts"> }) {
  const comments = useQuery(api.blog.listApprovedComments, { postId });
  const submitComment = useMutation(api.blog.submitComment);

  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitComment({ postId, name: name.trim(), text: text.trim() });
      setName("");
      setText("");
      setSubmitted(true);
      toast.success("Mulțumim! Comentariul tău va apărea după aprobare.");
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.error(message);
      } else {
        toast.error("A apărut o eroare. Încearcă din nou.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle size={18} className="text-primary" />
        <h3 className="font-serif text-xl text-[#14253a]">
          Comentarii {comments && comments.length > 0 ? `(${comments.length})` : ""}
        </h3>
      </div>

      {comments && comments.length > 0 && (
        <div className="space-y-4 mb-8">
          {comments.map((c) => (
            <div key={c._id} className="bg-[#f5f0e8] border border-foreground/8 p-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold text-[#14253a]">{c.name}</span>
                <span className="text-[10px] text-muted-foreground">
                  {format(new Date(c._creationTime), "d MMM yyyy", { locale: ro })}
                </span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>
      )}

      {submitted ? (
        <div className="bg-green-50 border border-green-200 px-5 py-4 text-sm text-green-700">
          Mulțumim! Comentariul tău a fost trimis și va apărea după aprobare.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 max-w-lg">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Numele tău"
            className="w-full bg-white border border-foreground/10 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
          <textarea
            required
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Lasă un comentariu..."
            rows={3}
            className="w-full bg-white border border-foreground/10 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="cursor-pointer bg-[#14253a] hover:bg-primary text-white px-6 py-3 text-[11px] font-bold tracking-[1.5px] uppercase transition-colors disabled:opacity-50"
          >
            {submitting ? "Se trimite..." : "Trimite comentariul"}
          </button>
        </form>
      )}
    </div>
  );
}
