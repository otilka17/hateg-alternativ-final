import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import Footer from "@/components/Footer.tsx";
import { Calendar, Tag, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { ro } from "date-fns/locale";
import Navbar from "@/components/Navbar.tsx";
import { MetanoiaLogo } from "@/components/Navbar.tsx";
import AnimatedSection from "@/components/AnimatedSection.tsx";

const CATEGORIES = [
  { value: "all", label: "Toate" },
  { value: "retete", label: "Rețete" },
  { value: "noutati", label: "Noutăți" },
  { value: "sezon", label: "Sezon" },
  { value: "povesti", label: "Povești" },
];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const posts = useQuery(
    api.blog.listPublished,
    activeCategory === "all" ? {} : { category: activeCategory }
  );

  const getCategoryLabel = (value: string) =>
    CATEGORIES.find((c) => c.value === value)?.label ?? value;

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16 bg-[#14253a]">
        <div className="px-[5%] md:px-[8%] py-20 md:py-28 text-center relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] rounded-full bg-[#1e3a5c]/40 blur-[100px]" />
            <div className="absolute bottom-[20%] right-[15%] w-[250px] h-[250px] rounded-full bg-[#f5a06a]/8 blur-[80px]" />
          </div>

          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as const }}
          >
            <div className="flex items-center justify-center gap-4 mb-6 text-white/40 text-[10px] font-semibold tracking-[5px] uppercase">
              <span className="w-10 h-px bg-white/25" />
              {"Blog & Noutăți"}
              <span className="w-10 h-px bg-white/25" />
            </div>
            <h1 className="font-serif text-[clamp(2.5rem,7vw,5rem)] text-white leading-none tracking-tight mb-4">
              Povești din <em className="text-[#f5a06a] italic">bucătărie</em>
            </h1>
            <p className="text-white/70 max-w-md mx-auto leading-relaxed text-balance">
              Rețete, noutăți de sezon și povești din spatele preparatelor Metanoia.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category filters */}
      <section className="bg-background px-[5%] md:px-[8%] py-8 border-b border-foreground/5">
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`cursor-pointer text-[11px] font-semibold tracking-[1.5px] uppercase px-5 py-2.5 transition-all ${
                activeCategory === cat.value
                  ? "bg-[#14253a] text-white"
                  : "bg-transparent text-muted-foreground hover:text-foreground border border-foreground/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Blog posts grid */}
      <section className="bg-background px-[5%] md:px-[8%] py-12 md:py-16">
        {posts === undefined ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-muted rounded-sm mb-4" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-full mb-1" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-sm mb-2">
              Niciun articol{activeCategory !== "all" ? ` în categoria „${getCategoryLabel(activeCategory)}"` : ""} momentan.
            </p>
            <p className="text-muted-foreground/60 text-xs">Revino curând pentru noutăți!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {posts.map((post, i) => (
              <AnimatedSection key={post._id} delay={i * 0.08}>
                <Link
                  to={`/blog/${post.slug}`}
                  className="group block no-underline"
                >
                  {/* Cover image */}
                  <div className="relative overflow-hidden aspect-[16/10] mb-4 bg-muted">
                    {post.coverImageUrl ? (
                      <img
                        src={post.coverImageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#14253a]/10 to-primary/5 flex items-center justify-center">
                        <MetanoiaLogo size={48} />
                      </div>
                    )}
                    {/* Category badge */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[9px] font-bold tracking-[2px] uppercase text-[#14253a] px-2.5 py-1">
                      {getCategoryLabel(post.category)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-2">
                    {/* Date */}
                    {post.publishedAt && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar size={11} />
                        <span className="text-[10px] tracking-wider uppercase">
                          {format(new Date(post.publishedAt), "d MMMM yyyy", { locale: ro })}
                        </span>
                      </div>
                    )}

                    {/* Title */}
                    <h2 className="font-serif text-lg text-[#14253a] leading-snug group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Read more */}
                    <div className="flex items-center gap-1.5 text-primary text-[11px] font-semibold tracking-wider uppercase pt-1 group-hover:gap-2.5 transition-all">
                      Citește mai mult
                      <ArrowRight size={12} />
                    </div>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
