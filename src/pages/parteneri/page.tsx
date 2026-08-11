import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { motion } from "motion/react";
import { ExternalLink, Handshake } from "lucide-react";
import Navbar from "@/components/Navbar.tsx";
import SEO from "@/components/SEO.tsx";
import Footer from "@/components/Footer.tsx";
import AnimatedSection from "@/components/AnimatedSection.tsx";
import { Skeleton } from "@/components/ui/skeleton.tsx";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty.tsx";

export default function ParteneriPage() {
  const partners = useQuery(api.partners.list, {});

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Parteneri"
        description="Colaborăm cu producători locali și pensiuni din Țara Hațegului — descoperă rețeaua Metanoia."
      />
      <Navbar />

      {/* Hero */}
      <section className="bg-[#14253a] px-[5%] md:px-[8%] pt-32 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-2.5 mb-4 text-[#f5a06a]">
            <span className="w-6 h-px bg-[#f5a06a]" />
            <span className="text-[9px] font-semibold tracking-[4px] uppercase">Colaborări</span>
            <span className="w-6 h-px bg-[#f5a06a]" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight mb-4">
            Partenerii <em className="text-[#f5a06a] italic">noștri</em>
          </h1>
          <p className="text-white/60 max-w-md mx-auto text-sm leading-relaxed">
            Colaborăm cu producători locali și branduri de calitate pentru a aduce cele mai bune produse la rafturile Metanoia.
          </p>
        </motion.div>
      </section>

      {/* Partners Grid */}
      <section className="px-[5%] md:px-[8%] py-16 md:py-24">
        {partners === undefined ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-80 w-full" />
            ))}
          </div>
        ) : partners.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon"><Handshake /></EmptyMedia>
              <EmptyTitle>Niciun partener încă</EmptyTitle>
              <EmptyDescription>Partenerii vor apărea aici în curând.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {partners.map((partner, i) => (
              <AnimatedSection key={partner._id} direction="none" delay={i * 0.1}>
                <div className="bg-card border border-border overflow-hidden group hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
                  {/* Cover image */}
                  {partner.coverUrl && (
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={partner.coverUrl}
                        alt={partner.name}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    </div>
                  )}

                  <div className="p-6 flex flex-col flex-1">
                    {/* Logo + name */}
                    <div className="flex items-center gap-3 mb-3">
                      {partner.logoUrl && (
                        <img
                          src={partner.logoUrl}
                          alt={`Logo ${partner.name}`}
                          className="w-10 h-10 object-contain rounded-sm"
                        />
                      )}
                      <h3 className="font-serif text-lg text-foreground">{partner.name}</h3>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                      {partner.description}
                    </p>

                    {/* Website link */}
                    {partner.website && (
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[1.5px] uppercase text-primary hover:text-[#f5a06a] transition-colors no-underline cursor-pointer"
                      >
                        Vizitează site-ul <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
