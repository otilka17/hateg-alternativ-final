import { useParams, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { motion } from "motion/react";
import { Calendar, Tag, ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer.tsx";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import Navbar from "@/components/Navbar.tsx";

const CATEGORY_LABELS: Record<string, string> = {
  retete: "Rețete",
  noutati: "Noutăți",
  sezon: "Sezon",
  povesti: "Povești",
};

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = useQuery(api.blog.getBySlug, slug ? { slug } : "skip");

  if (post === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16">
          <div className="max-w-3xl mx-auto px-[5%] py-16">
            <div className="animate-pulse space-y-6">
              <div className="h-6 bg-muted rounded w-1/3" />
              <div className="h-10 bg-muted rounded w-2/3" />
              <div className="h-64 bg-muted rounded" />
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-5/6" />
                <div className="h-4 bg-muted rounded w-4/6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (post === null) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-16">
          <div className="max-w-3xl mx-auto px-[5%] py-20 text-center">
            <h1 className="font-serif text-3xl text-[#14253a] mb-4">Articol negăsit</h1>
            <p className="text-muted-foreground mb-8">
              Acest articol nu există sau nu a fost publicat încă.
            </p>
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 bg-[#14253a] text-white text-[11px] font-bold tracking-widest uppercase px-6 py-3 hover:bg-primary transition-colors no-underline"
            >
              <ArrowLeft size={14} />
              Înapoi la blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />

      {/* Hero with cover image */}
      <section className="relative pt-16">
        {post.coverImageUrl ? (
          <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#14253a]/90 via-[#14253a]/40 to-transparent" />
          </div>
        ) : (
          <div className="h-[20vh] bg-[#14253a]" />
        )}
      </section>

      {/* Article content */}
      <motion.article
        className="max-w-3xl mx-auto px-[5%] md:px-8 -mt-16 relative z-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as const }}
      >
        {/* Card wrapper */}
        <div className="bg-white border border-border p-6 md:p-10 mb-12">
          {/* Back link */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-muted-foreground text-[11px] font-semibold tracking-wider uppercase hover:text-primary transition-colors no-underline mb-6"
          >
            <ArrowLeft size={12} />
            Înapoi la blog
          </Link>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <span className="flex items-center gap-1.5 text-primary text-[10px] font-bold tracking-[2px] uppercase bg-primary/10 px-2.5 py-1">
              <Tag size={10} />
              {CATEGORY_LABELS[post.category] ?? post.category}
            </span>
            {post.publishedAt && (
              <span className="flex items-center gap-1.5 text-muted-foreground text-[10px] tracking-wider">
                <Calendar size={11} />
                {format(new Date(post.publishedAt), "d MMMM yyyy", { locale: ro })}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="font-serif text-[clamp(1.8rem,5vw,3rem)] text-[#14253a] leading-tight mb-6">
            {post.title}
          </h1>

          {/* Excerpt as lead */}
          <p className="text-lg text-muted-foreground leading-relaxed border-l-3 border-primary/30 pl-4 mb-8 italic">
            {post.excerpt}
          </p>

          {/* Content */}
          <div
            className="prose prose-sm md:prose-base max-w-none prose-headings:font-serif prose-headings:text-[#14253a] prose-p:text-foreground/80 prose-a:text-primary prose-img:rounded-sm"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </motion.article>

      {/* Footer */}
      <Footer />
    </div>
  );
}
