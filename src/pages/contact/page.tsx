import { useState } from "react";
import { MapPin, Clock, Phone, Mail, Send, MessageCircle, Leaf, Heart, Hand, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import Navbar from "@/components/Navbar.tsx";
import SEO from "@/components/SEO.tsx";
import AnimatedSection from "@/components/AnimatedSection.tsx";
import Footer from "@/components/Footer.tsx";
import { ScheduleDisplay } from "@/components/ScheduleStatus.tsx";
import { useSiteInfo } from "@/hooks/use-site-info.ts";
import { useAboutContent } from "@/hooks/use-about-content.ts";

const STORY_VALUES = [
  {
    icon: "leaf",
    title: "Ingrediente locale",
    desc: "Legume și fructe din grădinile Țării Hațegului. Fără compromisuri, fără E-uri.",
  },
  {
    icon: "heart",
    title: "Rețete de familie",
    desc: "Secretele din bucătăria bunicii, păstrate cu grijă și transmise mai departe.",
  },
  {
    icon: "hands",
    title: "Făcut cu mâna",
    desc: "Fiecare produs e pregătit manual — de la sandwich la ultimul borcan.",
  },
  {
    icon: "sparkle",
    title: "Cu suflet",
    desc: "Mai mult decât o băcănie. Un loc de suflet, unde fiecare oaspete e prieten.",
  },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const info = useSiteInfo();
  const about = useAboutContent();

  const handleWhatsAppSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Salut! Mă numesc ${name}. ${message}`;
    const url = `https://wa.me/${info.whatsapp}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <SEO
        title="Contact"
        description="Găsește-ne pe DN 68, Totești, Țara Hațegului — telefon, WhatsApp și program de funcționare."
      />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16 bg-[#14253a]">
        <div className="px-[5%] md:px-[8%] py-20 md:py-28 text-center relative">
          {/* Background elements */}
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
              {"Contact & Despre noi"}
              <span className="w-10 h-px bg-white/25" />
            </div>
            <h1 className="font-serif text-[clamp(2.5rem,7vw,5rem)] text-white leading-none tracking-tight mb-4">
              {about.about_hero_title.includes(" ") ? (
                <>
                  {about.about_hero_title.split(" ").slice(0, -1).join(" ")}{" "}
                  <em className="text-[#f5a06a] italic">{about.about_hero_title.split(" ").at(-1)}</em>
                </>
              ) : (
                <em className="text-[#f5a06a] italic">{about.about_hero_title}</em>
              )}
            </h1>
            <p className="text-white/70 max-w-md mx-auto leading-relaxed text-balance">
              {about.about_hero_subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-background">
        <div className="w-full aspect-[16/7] md:aspect-[16/5] overflow-hidden">
          <iframe
            src={info.mapUrl}
            className="w-full h-full border-0 grayscale-[20%] contrast-[1.05]"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Locația Metanoia pe hartă"
          />
        </div>
      </section>

      {/* Contact Info + Form Grid */}
      <section className="bg-background px-[5%] md:px-[8%] py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-16 md:gap-20 max-w-5xl mx-auto">
          {/* Left - Contact Details */}
          <AnimatedSection direction="left">
            <div className="flex items-center gap-2.5 mb-4 text-primary">
              <span className="w-6 h-px bg-primary" />
              <span className="text-[9px] font-semibold tracking-[4px] uppercase">Informații</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-[#14253a] leading-tight mb-8">
              Unde ne <em className="text-primary italic">găsești</em>
            </h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <div className="text-[#14253a] font-medium mb-0.5">Adresă</div>
                  <p className="text-muted-foreground text-sm">{info.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Clock className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="text-[#14253a] font-medium mb-2">Program</div>
                  <ScheduleDisplay variant="light" />
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <div className="text-[#14253a] font-medium mb-0.5">Telefon</div>
                  <a
                    href={`tel:${info.phone}`}
                    className="text-muted-foreground text-sm hover:text-primary transition-colors no-underline"
                  >
                    {info.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <div className="text-[#14253a] font-medium mb-0.5">Email</div>
                  <a
                    href={`mailto:${info.email}`}
                    className="text-muted-foreground text-sm hover:text-primary transition-colors no-underline"
                  >
                    {info.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Quick WhatsApp button */}
            <a
              href={`https://wa.me/${info.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer mt-10 inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-white px-6 py-3.5 rounded-sm text-[11px] font-bold tracking-[1.5px] uppercase no-underline transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Scrie-ne pe WhatsApp
            </a>

            {/* Social Media Links */}
            <div className="mt-8 flex items-center gap-4">
              <a
                href={info.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer w-10 h-10 rounded-full bg-[#14253a] flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4.5 h-4.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href={info.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer w-10 h-10 rounded-full bg-[#14253a] flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-4.5 h-4.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </AnimatedSection>

          {/* Right - Contact Form */}
          <AnimatedSection direction="right" delay={0.15}>
            <div className="flex items-center gap-2.5 mb-4 text-primary">
              <span className="w-6 h-px bg-primary" />
              <span className="text-[9px] font-semibold tracking-[4px] uppercase">Mesaj rapid</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-[#14253a] leading-tight mb-3">
              Trimite un <em className="text-primary italic">mesaj</em>
            </h2>
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
              Completează formularul și te redirecționăm pe WhatsApp pentru un răspuns rapid.
            </p>

            <form onSubmit={handleWhatsAppSubmit} className="space-y-5">
              <div>
                <label htmlFor="contact-name" className="text-xs font-medium text-[#14253a] tracking-wide uppercase mb-2 block">
                  Numele tău
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ion Popescu"
                  className="w-full bg-[#f5f0e8] border border-foreground/10 px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="text-xs font-medium text-[#14253a] tracking-wide uppercase mb-2 block">
                  Mesajul tău
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Scrie aici ce dorești să ne întrebi..."
                  className="w-full bg-[#f5f0e8] border border-foreground/10 px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                className="cursor-pointer w-full bg-[#14253a] hover:bg-primary text-white px-8 py-4 text-[11px] font-bold tracking-[2px] uppercase transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Trimite pe WhatsApp
              </button>
            </form>
          </AnimatedSection>
        </div>
      </section>

      {/* About / Story Section */}
      <section className="bg-[#14253a] px-[5%] md:px-[8%] py-20 md:py-28 relative overflow-hidden">
        {/* Grain texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <div className="flex items-center justify-center gap-4 mb-4 text-[#f5a06a]">
              <span className="w-6 h-px bg-[#f5a06a]" />
              <span className="text-[9px] font-semibold tracking-[4px] uppercase">Despre noi</span>
              <span className="w-6 h-px bg-[#f5a06a]" />
            </div>
            <h2 className="font-serif text-3xl md:text-5xl text-white leading-tight mb-6">
              {about.about_story_title.includes(" ") ? (
                <>
                  {about.about_story_title.split(" ").slice(0, -1).join(" ")}{" "}
                  <em className="text-[#f5a06a] italic">{about.about_story_title.split(" ").at(-1)}</em>
                </>
              ) : (
                <em className="text-[#f5a06a] italic">{about.about_story_title}</em>
              )}
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto leading-relaxed text-balance">
              {about.about_story_text}
            </p>
          </AnimatedSection>

          {/* Story image + text */}
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center mb-20">
            <AnimatedSection direction="left" className="aspect-[4/3] overflow-hidden rounded-sm">
              <img
                src="https://hercules-cdn.com/file_A79DOuLmMcqM86aIAjVbAEPt"
                alt="Producția artizanală Metanoia"
                className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-[1200ms]"
              />
            </AnimatedSection>

            <AnimatedSection direction="right" delay={0.15}>
              <h3 className="font-serif text-2xl md:text-3xl text-white mb-4">
                {about.about_story_subtitle.includes(" ") ? (
                  <>
                    {about.about_story_subtitle.split(" ").slice(0, -1).join(" ")}{" "}
                    <em className="text-[#f5a06a] italic">{about.about_story_subtitle.split(" ").at(-1)}</em>
                  </>
                ) : (
                  <em className="text-[#f5a06a] italic">{about.about_story_subtitle}</em>
                )}
              </h3>
              <p className="text-white/70 leading-relaxed mb-4 text-sm md:text-base">
                {about.about_story_p1}
              </p>
              <p className="text-white/70 leading-relaxed text-sm md:text-base">
                {about.about_story_p2}
              </p>
            </AnimatedSection>
          </div>

          {/* Values grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {STORY_VALUES.map((v, i) => {
              const IconComponent = v.icon === "leaf" ? Leaf : v.icon === "heart" ? Heart : v.icon === "hands" ? Hand : Sparkles;
              return (
                <AnimatedSection key={v.title} direction="none" delay={i * 0.1}>
                  <div className="text-center p-6 border border-white/10 rounded-sm hover:border-[#f5a06a]/30 transition-colors duration-300">
                    <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-[#f5a06a]/15 flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-[#f5a06a]" />
                    </div>
                    <div className="text-white font-medium text-sm mb-2">{v.title}</div>
                    <p className="text-white/60 text-xs leading-relaxed">{v.desc}</p>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quote strip */}
      <section className="bg-primary px-[5%] md:px-[8%] py-16 md:py-20 text-center">
        <AnimatedSection>
          <blockquote className="font-serif italic text-[clamp(1.2rem,2.5vw,2rem)] text-white leading-relaxed max-w-2xl mx-auto mb-4">
            {`"${about.about_quote}"`}
          </blockquote>
          <cite className="text-[10px] tracking-[3px] uppercase text-white/50 not-italic">
            {about.about_quote_author}
          </cite>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
