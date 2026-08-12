import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.js";
import { useState } from "react";

const REACTION_EMOJIS = ["❤️", "👍", "😋", "🎉"] as const;

export default function BlogReactions({ postId }: { postId: Id<"blogPosts"> }) {
  const reactions = useQuery(api.blog.getReactions, { postId });
  const getCount = (emoji: string) => reactions?.find((r) => r.emoji === emoji)?.count ?? 0;
  const addReaction = useMutation(api.blog.addReaction);
  const [justReacted, setJustReacted] = useState<string | null>(null);

  const handleReact = async (emoji: string) => {
    setJustReacted(emoji);
    await addReaction({ postId, emoji });
    setTimeout(() => setJustReacted(null), 400);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {REACTION_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => handleReact(emoji)}
          className={`cursor-pointer inline-flex items-center gap-1.5 border border-border bg-white px-3 py-1.5 text-sm hover:border-primary/50 hover:bg-primary/5 transition-all ${
            justReacted === emoji ? "scale-110 border-primary" : ""
          }`}
        >
          <span>{emoji}</span>
          <span className="text-xs text-muted-foreground font-medium">{getCount(emoji)}</span>
        </button>
      ))}
    </div>
  );
}
