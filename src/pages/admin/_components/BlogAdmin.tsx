import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import type { Id } from "@/convex/_generated/dataModel.js";
import { toast } from "sonner";
import { FileText, Trash2, Eye, EyeOff, Plus, ChevronDown, ChevronUp, Pencil, X } from "lucide-react";
import ImageUploader from "./ImageUploader.tsx";

const CATEGORIES = [
  { value: "retete", label: "Rețete" },
  { value: "noutati", label: "Noutăți" },
  { value: "sezon", label: "Sezon" },
  { value: "povesti", label: "Povești" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

type BlogPost = {
  _id: Id<"blogPosts">;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  coverImageId?: Id<"_storage">;
  coverImageUrl: string | null;
  published: boolean;
  publishedAt?: string;
  sortOrder: number;
};

function PostEditor({
  post,
  onClose,
}: {
  post?: BlogPost;
  onClose: () => void;
}) {
  const create = useMutation(api.blog.create);
  const update = useMutation(api.blog.update);
  const posts = useQuery(api.blog.listAll, {});

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [category, setCategory] = useState(post?.category ?? "retete");
  const [published, setPublished] = useState(post?.published ?? false);
  const [coverImageId, setCoverImageId] = useState<Id<"_storage"> | null>(
    post?.coverImageId ?? null
  );
  const [clearCoverImage, setClearCoverImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSlug, setAutoSlug] = useState(!post);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (autoSlug) {
      setSlug(slugify(value));
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Adaugă un titlu.");
      return;
    }
    if (!slug.trim()) {
      toast.error("Adaugă un slug.");
      return;
    }
    if (!excerpt.trim()) {
      toast.error("Adaugă un rezumat.");
      return;
    }
    if (!content.trim()) {
      toast.error("Adaugă conținut.");
      return;
    }

    setSaving(true);
    try {
      if (post) {
        await update({
          id: post._id,
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim(),
          content: content.trim(),
          category,
          published,
          ...(coverImageId ? { coverImageId } : {}),
          ...(clearCoverImage ? { clearCoverImage: true } : {}),
        });
        toast.success("Articol actualizat!");
      } else {
        const nextOrder = (posts?.length ?? 0) + 1;
        await create({
          title: title.trim(),
          slug: slug.trim(),
          excerpt: excerpt.trim(),
          content: content.trim(),
          category,
          published,
          sortOrder: nextOrder,
          ...(coverImageId ? { coverImageId } : {}),
        });
        toast.success("Articol creat!");
      }
      onClose();
    } catch {
      toast.error("Eroare la salvare.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-border bg-muted/20 p-5 mb-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-serif text-base text-[#14253a]">
          {post ? "Editează articol" : "Articol nou"}
        </h4>
        <button
          onClick={onClose}
          className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors p-1"
        >
          <X size={18} />
        </button>
      </div>

      {/* Title */}
      <div>
        <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1 block">
          Titlu
        </label>
        <input
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Ex: Rețeta de zacuscă a bunicii"
          className="w-full border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1 block">
          Slug (URL)
        </label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">/blog/</span>
          <input
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setAutoSlug(false);
            }}
            placeholder="reteta-zacusca"
            className="flex-1 border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors font-mono"
          />
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1 block">
          Categorie
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors cursor-pointer"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Excerpt */}
      <div>
        <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1 block">
          Rezumat (excerpt)
        </label>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Scurtă descriere care apare în lista de articole..."
          rows={2}
          className="w-full border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors resize-y"
        />
      </div>

      {/* Content */}
      <div>
        <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1 block">
          Conținut (suportă HTML)
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="<p>Corpul articolului...</p>"
          rows={10}
          className="w-full border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors resize-y font-mono text-xs"
        />
        <p className="text-[10px] text-muted-foreground mt-1">
          Poți folosi tag-uri HTML: &lt;p&gt;, &lt;h2&gt;, &lt;h3&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;img&gt;, &lt;blockquote&gt;
        </p>
      </div>

      {/* Cover image */}
      <div>
        <label className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground mb-1 block">
          Imagine copertă
        </label>
        <ImageUploader
          onUploaded={(id) => { setCoverImageId(id); setClearCoverImage(false); }}
          onRemove={() => { setCoverImageId(null); setClearCoverImage(true); }}
          currentImageUrl={post?.coverImageUrl ?? undefined}
        />
      </div>

      {/* Published toggle */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
          className="w-4 h-4 accent-primary cursor-pointer"
        />
        <span className="text-sm text-foreground">Publicat pe site</span>
      </label>

      {/* Save */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="cursor-pointer bg-[#14253a] text-white text-[11px] font-bold tracking-widest uppercase px-6 py-2.5 hover:bg-primary transition-colors disabled:opacity-40"
        >
          {saving ? "Se salvează..." : post ? "Actualizează" : "Creează articol"}
        </button>
        <button
          onClick={onClose}
          className="cursor-pointer bg-muted text-foreground text-[11px] font-bold tracking-widest uppercase px-6 py-2.5 hover:bg-muted/80 transition-colors"
        >
          Anulează
        </button>
      </div>
    </div>
  );
}

export default function BlogAdmin() {
  const posts = useQuery(api.blog.listAll, {});
  const updatePost = useMutation(api.blog.update);
  const removePost = useMutation(api.blog.remove);

  const [expanded, setExpanded] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | undefined>(undefined);

  const handleTogglePublished = async (id: Id<"blogPosts">, currentPublished: boolean) => {
    await updatePost({ id, published: !currentPublished });
    toast.success(currentPublished ? "Articol ascuns" : "Articol publicat");
  };

  const handleDelete = async (id: Id<"blogPosts">) => {
    if (!confirm("Sigur vrei să ștergi acest articol?")) return;
    await removePost({ id });
    toast.success("Articol șters");
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setEditingPost(undefined);
  };

  const getCategoryLabel = (value: string) =>
    CATEGORIES.find((c) => c.value === value)?.label ?? value;

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="cursor-pointer w-full flex items-center justify-between mb-4"
      >
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-primary" />
          <h3 className="font-serif text-lg text-[#14253a]">Blog & Noutăți</h3>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {posts?.length ?? 0} articole
          </span>
        </div>
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {expanded && (
        <div>
          {/* Add / Editor */}
          {showEditor ? (
            <PostEditor post={editingPost} onClose={handleCloseEditor} />
          ) : (
            <button
              onClick={() => {
                setEditingPost(undefined);
                setShowEditor(true);
              }}
              className="cursor-pointer mb-4 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold tracking-wider uppercase px-4 py-2.5 transition-colors flex items-center gap-2"
            >
              <Plus size={14} />
              Adaugă articol
            </button>
          )}

          {/* Posts list */}
          {!posts ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted animate-pulse" />
              ))}
            </div>
          ) : posts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Niciun articol. Creează primul tău articol!
            </p>
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post._id}
                  className={`flex items-start gap-4 p-4 border border-border bg-white transition-opacity ${
                    !post.published ? "opacity-60" : ""
                  }`}
                >
                  {/* Cover thumbnail */}
                  <div className="w-16 h-16 shrink-0 bg-muted overflow-hidden">
                    {post.coverImageUrl ? (
                      <img
                        src={post.coverImageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <FileText size={20} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-semibold text-[#14253a] truncate">
                        {post.title}
                      </h4>
                      <span className="text-[9px] font-bold tracking-wider uppercase text-primary bg-primary/10 px-1.5 py-0.5">
                        {getCategoryLabel(post.category)}
                      </span>
                      {!post.published && (
                        <span className="text-[9px] font-bold tracking-wider uppercase text-amber-600 bg-amber-50 px-1.5 py-0.5">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {post.excerpt}
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5 font-mono">
                      /blog/{post.slug}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleEdit(post as BlogPost)}
                      className="cursor-pointer p-2 text-muted-foreground hover:text-foreground transition-colors"
                      title="Editează"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleTogglePublished(post._id, post.published)}
                      className="cursor-pointer p-2 text-muted-foreground hover:text-foreground transition-colors"
                      title={post.published ? "Ascunde" : "Publică"}
                    >
                      {post.published ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      onClick={() => handleDelete(post._id)}
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
