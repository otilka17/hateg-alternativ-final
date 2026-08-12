import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { ConvexError } from "convex/values";
import Navbar from "@/components/Navbar.tsx";
import SEO from "@/components/SEO.tsx";

import AnimatedSection from "@/components/AnimatedSection.tsx";
import DailySpecialSection from "@/components/DailySpecial.tsx";
import WeeklyOfferSection from "@/components/WeeklyOffer.tsx";
import QuickOrder from "@/components/QuickOrder.tsx";
import { ScheduleDisplay } from "@/components/ScheduleStatus.tsx";

import Footer from "@/components/Footer.tsx";
import { MapPin, Phone, ChevronRight, Mail, ExternalLink } from "lucide-react";
import { toast } from "sonner";

const pozaBorcaneCurata = "https://hercules-cdn.com/file_1fJpF0WGTq3AtLLFF1Jvu85N";

const PRODUCT_IMAGES = [
  {
    src: "https://hercules-cdn.com/file_WnaeRwIubzxYpKL3WQcFIN0G",
    alt: "Produse Metanoia",
  },
  {
    src: "https://hercules-cdn.com/file_qmQyiDwP59EwwYa91O0cyxpO",
    alt: "Sandwich-uri proaspete Metanoia",
  },
  {
    src: "https://hercules-cdn.com/file_tBLLPNSpQajxxH32qOumrhFz",
    alt: "Borcane cu conserve de casă",
  },
  {
    src: "https://hercules-cdn.com/file_4L0455l6KHfeby9QPDTa664z",
    alt: "Băcănia Metanoia",
  },
];

const SLIDER_SLIDES = [
  {
    src: "/images/hero/hero-1.webp",
    alt: "Sandwich cu prosciutto Metanoia",
    title: "Sandwich-uri premium",
    subtitle: "Ingrediente locale",
    desc: "Ciabatta caldă, ingrediente proaspete din Țara Hațegului. Făcute pe loc, cu drag.",
    link: "/meniu",
  },
  {
    src: "/images/hero/hero-2.webp",
    alt: "Cafea Metanoia",
    title: "Cafea & Băuturi",
    subtitle: "Proaspăt preparate",
    desc: "Cafea Nespresso, limonade stoarse pe loc și sucuri naturale. La fiecare comandă.",
    link: "/meniu",
  },
  {
    src: "/images/hero/hero-3.webp",
    alt: "Limonadă naturală Metanoia",
    title: "Limonade naturale",
    subtitle: "Stoarse pe loc",
    desc: "Limonadă cu mentă și lămâie, preparată proaspăt la fiecare comandă.",
    link: "/meniu",
  },
  {
    src: "/images/hero/hero-4.webp",
    alt: "Sandwich Acasă ambalat Metanoia",
    title: "Sandwich Acasă",
    subtitle: "Gata de drum",
    desc: "Pui la grill, salată, sos de casă — ambalat cu grijă, perfect pentru drum.",
    link: "/meniu",
  },
  {
    src: "/images/hero/hero-5.webp",
    alt: "Sandwich cu pesto Metanoia",
    title: "Gusturi autentice",
    subtitle: "Făcute cu suflet",
    desc: "Pesto proaspăt, mustar de casă și ingrediente alese cu grijă. Fiecare mușcătură contează.",
    link: "/meniu",
  },
  {
    src: "/images/hero/hero-6.webp",
    alt: "Produse Metanoia",
    title: "Produse artizanale",
    subtitle: "Din Țara Hațegului",
    desc: "Totul pregătit manual, din ingrediente locale. Calitate fără compromisuri.",
    link: "/borcane",
  },
  {
    src: "/images/hero/hero-7.webp",
    alt: "Preparate Metanoia",
    title: "Proaspăt zilnic",
    subtitle: "De la noi",
    desc: "Ingrediente proaspete, pregătite în fiecare dimineață cu drag și dedicare.",
    link: "/meniu",
  },
  {
    src: "/images/hero/hero-8.webp",
    alt: "Produse fresh Metanoia",
    title: "Fresh & Natural",
    subtitle: "Fără conservanți",
    desc: "Rețete simple cu ingrediente curate. Fără E-uri, fără compromisuri.",
    link: "/meniu",
  },
  {
    src: "/images/hero/hero-9.webp",
    alt: "Băcănia Metanoia",
    title: "Băcănia-butic",
    subtitle: "DN 68 · Totești",
    desc: "O pauză de suflet pe drum. Oprește-te, savurează, continuă reîncărcat.",
    link: "/despre",
  },
  {
    src: "/images/hero/hero-10.webp",
    alt: "Produse locale Metanoia",
    title: "Locale & autentice",
    subtitle: "De la producători",
    desc: "Produse de la producători locali din Țara Hațegului, selectate cu grijă.",
    link: "/parteneri",
  },
  {
    src: "/images/hero/hero-11.webp",
    alt: "Oferte Metanoia",
    title: "Pachete speciale",
    subtitle: "Pentru fiecare gust",
    desc: "Combinații atent gândite la prețuri accesibile. Alege pachetul tău preferat.",
    link: "/pachete",
  },
  {
    src: "/images/hero/hero-12.webp",
    alt: "Preparate calde Metanoia",
    title: "Cald & delicios",
    subtitle: "Făcut la comandă",
    desc: "Fiecare preparat e făcut proaspăt, la comandă. Niciodată reîncălzit.",
    link: "/meniu",
  },
  {
    src: "/images/hero/hero-13.webp",
    alt: "Mâncare Metanoia",
    title: "Cu suflet",
    subtitle: "Pentru tine",
    desc: "Gătit cu pasiune și servit cu zâmbet. Asta e Metanoia.",
    link: "/meniu",
  },
  {
    src: "/images/hero/hero-14.webp",
    alt: "Sortiment Metanoia",
    title: "Descoperă Metanoia",
    subtitle: "Soul Meal",
    desc: "Mai mult decât o oprire pe drum. E o experiență care te schimbă puțin.",
    link: "/despre",
  },
];

function HeroSlider() {
  const dbSlides = useQuery(api.slides.listActive, {});
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const slides = dbSlides && dbSlides.length > 0
    ? dbSlides.map((s) => ({
        src: s.resolvedImageUrl ?? "",
        alt: s.title,
        title: s.title,
        subtitle: s.subtitle,
        desc: s.description,
        link: s.link,
      }))
    : SLIDER_SLIDES;

  const safeIndex = current >= slides.length ? 0 : current;

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => {
        const nextIndex = prev + 1;
        return nextIndex >= slides.length ? 0 : nextIndex;
      });
    }, 5000);
  }, [slides.length]);

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [startTimer]);

  const slide = slides[safeIndex];

  return (
    <section className="relative w-full h-[70vh] sm:h-[80vh] overflow-hidden bg-[#14253a]">
      <div className="absolute top-6 sm:top-10 left-0 right-0 z-20 px-[5%] sm:px-[8%] text-center">
        <h1 className="font-serif text-2xl sm:text-4xl text-white leading-tight">
          Metanoia <em className="text-[#f5a06a] italic">— Soul Meal</em>
        </h1>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={safeIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0 z-0"
        >
          <img
            src={slide.src}
            alt={slide.alt}
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#14253a]/80 via-[#14253a]/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#14253a]/60 to-transparent" />

          <div className="absolute inset-0 z-10 flex flex-col justify-end pb-16 sm:pb-20 px-[5%] sm:px-[8%]">
            <div className="max-w-lg">
              <div className="text-[#f5a06a] text-[10px] sm:text-xs font-semibold tracking-[3px] uppercase mb-2">
                {slide.subtitle}
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl text-white leading-tight mb-3">
                {slide.title}
              </h2>
              <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-6 max-w-sm">
                {slide.desc}
              </p>
              <Link
                to={slide.link}
                className="cursor-pointer inline-flex items-center gap-2 text-[11px] font-bold tracking-[2px] uppercase text-white border-b border-[#f5a06a] pb-1 hover:text-[#f5a06a] transition-colors no-underline"
              >
                Mai multe detalii <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20">
        <motion.div
          key={safeIndex}
          className="h-full bg-[#f5a06a]"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, ease: "linear" }}
        />
      </div>
    </section>
  );
}

const FEATURES = [
  {
    ico: "☕",
    title: "Cafea & Băuturi",
    desc: "Nespresso, limonade pe loc.",
    link: "/meniu",
    badge: "Proaspăt zilnic",
  },
  {
    ico: "🥖",
    title: "Sandwich-uri calde",
    desc: "Ciabatta, ingrediente premium.",
    link: "/meniu",
    badge: "Local",
  },
  {
    ico: "🎁",
    title: "Cutia Metanoia",
    desc: "Abonament lunar cu produse indisponibile în magazin.",
    link: "/cutia-metanoia",
    badge: "Ediție limitată",
  },
];

const STORY_POINTS = [
  {
    number: "01",
    title: "Ingrediente locale",
    desc: "Din Țara Hațegului.",
  },
  {
    number: "02",
    title: "Rețete de familie",
    desc: "Din generație în generație.",
  },
  {
    number: "03",
    title: "Făcute cu mâna",
    desc: "Fiecare produs — manual.",
  },
];

function PartnersSection() {
  const partners = useQuery(api.partners.listFeatured, {});

  if (!partners || partners.length === 0) return null;

  return (
    <section className="bg-[#f5f0e8] px-[5%] md:px-[8%] py-16 md:py-28">
      <AnimatedSection className="text-center mb-12">
        <div className="flex items-center justify-center gap-2.5 mb-4 text-primary">
          <span className="w-6 h-px bg-primary" />
          <span className="text-[9px] font-semibold tracking-[4px] uppercase">Parteneri</span>
          <span className="w-6 h-px bg-primary" />
        </div>
        <h2 className="font-serif text-3xl md:text-4xl text-[#14253a] leading-tight">
          Colaborăm cu<br /><em className="text-primary italic">cei mai buni</em>
        </h2>
      </AnimatedSection>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {partners.map((partner, i) => (
          <AnimatedSection key={partner._id} direction="none" delay={i * 0.1}>
            <div className="bg-white border border-foreground/8 overflow-hidden group hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
              {partner.coverUrl && (
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={partner.coverUrl}
                    alt={partner.name}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2.5 mb-2">
                  {partner.logoUrl && (
                    <img
                      src={partner.logoUrl}
                      alt={`Logo ${partner.name}`}
                      className="w-8 h-8 object-contain rounded-sm"
                    />
                  )}
                  <h3 className="font-serif text-base text-foreground">{partner.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed flex-1">{partner.description}</p>
                {partner.website && (
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold tracking-[1.5px] uppercase text-primary hover:text-[#f5a06a] transition-colors no-underline cursor-pointer"
                  >
                    Website <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </div>
          </AnimatedSection>
        ))}
      </div>

      <div className="text-center mt-10">
        <Link
          to="/parteneri"
          className="cursor-pointer inline-flex items-center gap-2 text-[11px] font-bold tracking-[2px] uppercase text-[#14253a] border-b border-primary pb-1 hover:text-primary transition-colors no-underline"
        >
          Vezi toți partenerii <ChevronRight size={14} />
        </Link>
      </div>
    </section>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const subscribe = useMutation(api.newsletter.subscribe);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      await subscribe({ email: email.trim() });
      setSubmitted(true);
      setEmail("");
      toast.success("Te-ai abonat cu succes!");
    } catch (error) {
      if (error instanceof ConvexError) {
        const { message } = error.data as { code: string; message: string };
        toast.info(message);
      } else {
        toast.error("A apărut o eroare. Încearcă din nou.");
      }
    }
  };

  return (
    <section className="bg-[#f5f0e8] px-[5%] md:px-[8%] py-16 md:py-24">
      <AnimatedSection className="max-w-xl mx-auto text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
          <Mail className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-serif text-2xl md:text-3xl text-[#14253a] mb-8">
          Abonează-te la <em className="text-primary italic">noutăți</em>
        </h3>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 px-6 py-4 inline-block"
          >
            <p className="text-green-700 text-sm font-medium">Mulțumim! Te-ai abonat cu succes.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="adresa@email.com"
              className="flex-1 bg-white border border-foreground/10 px-5 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            <button
              type="submit"
              className="cursor-pointer bg-[#14253a] hover:bg-primary text-white px-6 py-3.5 text-[11px] font-bold tracking-[1.5px] uppercase transition-colors whitespace-nowrap"
            >
              Abonează-te
            </button>
          </form>
        )}

        <p className="text-xs text-muted-foreground/60 mt-4">
          Fără spam. Te poți dezabona oricând.
        </p>
      </AnimatedSection>
    </section>
  );
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="cursor-pointer p-0 border-none bg-transparent"
        >
          <svg
            className={`w-6 h-6 transition-colors ${
              star <= (hover || value) ? "text-[#f5a06a]" : "text-foreground/15"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function ReviewsSection() {
  const reviews = useQuery(api.reviews.listApproved, {});
  const submitReview = useMutation(api.reviews.submit);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim() || stars < 1) return;
    setSubmitting(true);
    try {
      await submitReview({ name: name.trim(), location: location.trim() || undefined, stars, text: text.trim() });
      toast.success("Mulțumim! Recenzia ta va apărea după aprobare.");
      setShowForm(false);
      setName("");
      setLocation("");
      setStars(5);
      setText("");
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

  const displayReviews = reviews ?? [];

  return (
    <section className="bg-[#f5f0e8] px-[5%] md:px-[8%] py-16 md:py-28">
      <AnimatedSection className="text-center mb-10 md:mb-14">
        <div className="flex items-center justify-center gap-2.5 mb-4 text-primary">
          <span className="w-6 h-px bg-primary" />
          <span className="text-[9px] font-semibold tracking-[4px] uppercase">Ce spun clienții</span>
          <span className="w-6 h-px bg-primary" />
        </div>
        <h2 className="font-serif text-3xl md:text-4xl text-[#14253a] leading-tight mb-6">
          Recenzii de la<br /><em className="text-primary italic">prietenii noștri.</em>
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="cursor-pointer inline-flex items-center gap-2 text-[11px] font-bold tracking-[2px] uppercase text-[#14253a] border-b border-primary pb-1 hover:text-primary transition-colors bg-transparent"
        >
          {showForm ? "Anulează" : "Lasă o recenzie"}
        </button>
      </AnimatedSection>

      {showForm && (
        <AnimatedSection className="max-w-lg mx-auto mb-14">
          <form onSubmit={handleSubmit} className="bg-white border border-foreground/8 p-6 sm:p-8 space-y-5">
            <div>
              <label className="text-xs font-semibold tracking-[1px] uppercase text-foreground/60 block mb-2">Nota ta</label>
              <StarRating value={stars} onChange={setStars} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold tracking-[1px] uppercase text-foreground/60 block mb-2">Nume</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Maria P."
                  className="w-full bg-[#f5f0e8] border border-foreground/10 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-xs font-semibold tracking-[1px] uppercase text-foreground/60 block mb-2">Localitate <span className="text-muted-foreground">(opțional)</span></label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Hațeg"
                  className="w-full bg-[#f5f0e8] border border-foreground/10 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold tracking-[1px] uppercase text-foreground/60 block mb-2">Recenzia ta</label>
              <textarea
                required
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Spune-ne cum a fost experiența ta la Metanoia..."
                rows={4}
                className="w-full bg-[#f5f0e8] border border-foreground/10 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer w-full bg-[#14253a] hover:bg-primary text-white px-6 py-3.5 text-[11px] font-bold tracking-[1.5px] uppercase transition-colors disabled:opacity-50"
            >
              {submitting ? "Se trimite..." : "Trimite recenzia"}
            </button>
            <p className="text-xs text-muted-foreground text-center">Recenzia va fi publicată după aprobare.</p>
          </form>
        </AnimatedSection>
      )}

      {displayReviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {displayReviews.map((review, i) => (
            <AnimatedSection key={review._id} direction="none" delay={i * 0.1}>
              <div className="bg-white border border-foreground/8 p-7 h-full flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: review.stars }).map((_, s) => (
                    <svg key={s} className="w-4 h-4 text-[#f5a06a]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed flex-1 italic">
                  {`"${review.text}"`}
                </p>
                <div className="mt-5 pt-4 border-t border-foreground/8">
                  <div className="text-sm font-semibold text-[#14253a]">{review.name}</div>
                  {review.location && <div className="text-xs text-muted-foreground">{review.location}</div>}
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground text-sm">
          Fii primul care lasă o recenzie!
        </div>
      )}
    </section>
  );
}

export default function Index() {
  return (
    <div className="min-h-screen bg-[#14253a] overflow-hidden">
      <SEO
        title="Băcănie-butic pe DN 68, Totești"
        description="Cafea, limonade stoarse pe loc, sandwich-uri calde și bunătăți locale din Țara Hațegului. Borcane artizanale cu rețete de familie, fără conservanți."
        preloadImage={SLIDER_SLIDES[0].src}
      />
      <Navbar />

      <div className="pt-16">
        <HeroSlider />
      </div>

      <section className="bg-background px-[5%] md:px-[8%] py-10 md:py-14">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12">
          <div className="flex items-center gap-4">
            <span className="text-3xl">📍</span>
            <div>
              <div className="text-[9px] font-bold tracking-[3px] uppercase text-muted-foreground">Locație</div>
              <div className="text-sm text-foreground font-medium">DN 68, Totești — Țara Hațegului</div>
            </div>
          </div>
          <div className="hidden md:block w-px h-10 bg-border" />
          <div className="flex items-center gap-4">
            <span className="text-3xl">🥪</span>
            <div>
              <div className="text-[9px] font-bold tracking-[3px] uppercase text-muted-foreground">Proaspăt zilnic</div>
              <div className="text-sm text-foreground font-medium">Sandwich-uri, cafea, borcane</div>
            </div>
          </div>
          <div className="hidden md:block w-px h-10 bg-border" />
          <div className="flex items-center gap-4">
            <span className="text-3xl">🚗</span>
            <div>
              <div className="text-[9px] font-bold tracking-[3px] uppercase text-muted-foreground">Livrare</div>
              <div className="text-sm text-foreground font-medium">Gratuit peste 100 lei</div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background px-[5%] md:px-[8%] py-16 md:py-32">
        <AnimatedSection>
          <div className="flex items-center gap-2.5 mb-3.5 text-primary">
            <span className="w-6 h-px bg-primary" />
            <span className="text-[9px] font-semibold tracking-[4px] uppercase">Ce găsești la noi</span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl leading-tight text-[#14253a] mb-16">
            Pe drum spre<br /><em className="text-primary italic">{"Hațeg?"}</em>
          </h2>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {FEATURES.map((f, i) => (
            <AnimatedSection key={f.title} delay={i * 0.12}>
              <div className="bg-card border border-border p-8 md:p-10 rounded-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full relative">
                {f.badge && (
                  <span className={`absolute top-4 right-4 text-[8px] font-bold tracking-[1.5px] uppercase px-2 py-1 rounded-sm border ${
                    f.badge === "Proaspăt zilnic" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    f.badge === "Local" ? "bg-sky-50 text-sky-700 border-sky-200" :
                    "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {f.badge}
                  </span>
                )}
                <div className="text-4xl mb-5">{f.ico}</div>
                <div className="font-serif text-xl text-[#14253a] mb-3">{f.title}</div>
                <p className="text-sm text-muted-foreground leading-relaxed font-light mb-6">{f.desc}</p>
                <Link
                  to={f.link}
                  className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-semibold tracking-[1.5px] uppercase text-primary hover:text-[#f5a06a] transition-colors no-underline"
                >
                  Vezi mai mult
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      <QuickOrder />
      <DailySpecialSection />
      <WeeklyOfferSection />

      <section className="relative">
        <div className="grid md:grid-cols-2">
          <AnimatedSection direction="none" className="aspect-[3/2] md:aspect-auto md:min-h-[600px] overflow-hidden">
            <img
              src="https://hercules-cdn.com/file_pYX8LDpo1AaIh1Uuhhm5dK85"
              alt="Producția Metanoia"
              className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-[1200ms]"
            />
          </AnimatedSection>

          <div className="bg-[#14253a] px-[8%] md:px-[10%] py-16 md:py-24 flex flex-col justify-center">
            <AnimatedSection delay={0.15}>
              <div className="flex items-center gap-2.5 mb-4 text-[#f5a06a]">
                <span className="w-6 h-px bg-[#f5a06a]" />
                <span className="text-[9px] font-semibold tracking-[4px] uppercase">Povestea noastră</span>
              </div>
              <h2 className="font-serif text-3xl md:text-4xl text-white leading-tight mb-10">
                Făcut cu mâna,<br />cu <em className="text-[#f5a06a] italic">suflet</em>
              </h2>

              <div className="space-y-6">
                {STORY_POINTS.map((point, i) => (
                  <motion.div
                    key={point.number}
                    className="flex gap-4 items-start"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + i * 0.15 }}
                  >
                    <span className="text-[#f5a06a]/40 font-serif text-lg leading-none mt-0.5">{point.number}</span>
                    <div>
                      <div className="text-white font-medium text-sm mb-1">{point.title}</div>
                      <p className="text-white/60 text-sm leading-relaxed">{point.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <section className="bg-background px-[5%] md:px-[8%] py-16 md:py-32">
        <div className="grid md:grid-cols-2 gap-8 md:gap-20 items-center">
          <AnimatedSection>
            <div className="flex items-center gap-2.5 mb-3.5 text-primary">
              <span className="w-6 h-px bg-primary" />
              <span className="text-[9px] font-semibold tracking-[4px] uppercase">Vedeta meniului</span>
              <span className="ml-2 text-[8px] font-bold tracking-[1.5px] uppercase px-2 py-1 rounded-sm border bg-emerald-50 text-emerald-700 border-emerald-200">Proaspăt zilnic</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-[#14253a] leading-tight mb-6">
              Sandwich-uri<br /><em className="text-primary italic">premium</em>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8 text-sm">
              Ciabatta caldă, ingrediente proaspete, combinații atent gândite.
            </p>
            <Link
              to="/meniu"
              className="cursor-pointer inline-block bg-[#14253a] hover:bg-primary text-white px-8 py-3.5 text-[11px] font-bold tracking-[2px] uppercase no-underline transition-colors duration-300"
            >
              Vezi sandwich-urile
            </Link>
          </AnimatedSection>

          <AnimatedSection delay={0.1} className="aspect-[4/3] md:aspect-[4/5] rounded-sm overflow-hidden">
            <img
              src="https://hercules-cdn.com/file_qmQyiDwP59EwwYa91O0cyxpO"
              alt="Sandwich proaspăt Metanoia"
              className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-[1200ms]"
            />
          </AnimatedSection>
        </div>
      </section>

      {/* SECȚIUNEA POZEI CURATE CU BORCANELE REALE - DSC_0732 */}
      <section className="bg-[#f5f0e8] px-[5%] md:px-[8%] py-16 md:py-32">
        <div className="grid md:grid-cols-2 gap-8 md:gap-20 items-center">
          <AnimatedSection className="aspect-[4/3] md:aspect-[4/5] rounded-sm overflow-hidden order-2 md:order-1">
            <img
              src={pozaBorcaneCurata}
              alt="Borcane cu dulceață Metanoia"
              className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-[1200ms]"
            />
          </AnimatedSection>

          <AnimatedSection className="order-1 md:order-2">
            <div className="flex items-center gap-2.5 mb-3.5 text-primary">
              <span className="w-6 h-px bg-primary" />
              <span className="text-[9px] font-semibold tracking-[4px] uppercase">Din cămara noastră</span>
              <span className="ml-2 text-[8px] font-bold tracking-[1.5px] uppercase px-2 py-1 rounded-sm border bg-amber-50 text-amber-700 border-amber-200">Artizanal</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-[#14253a] leading-tight mb-6">
              Borcanele<br /><em className="text-primary italic">Metanoia</em>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8 text-sm">
              Rețetele bunicii în borcane de sticlă. Fără conservanți, fără E-uri.
            </p>
            <Link
              to="/borcane"
              className="cursor-pointer inline-block bg-[#14253a] hover:bg-primary text-white px-8 py-3.5 text-[11px] font-bold tracking-[2px] uppercase no-underline transition-colors duration-300"
            >
              Vezi borcanele
            </Link>
          </AnimatedSection>
        </div>
      </section>

      <section className="bg-background">
        <div className="w-full aspect-[21/9] md:aspect-[3/1] overflow-hidden">
          <img
            src="/images/despre-bunatati-casa.png"
            alt="Bunătăți de casă — conserve autentice românești Metanoia"
            className="w-full h-full object-cover"
          />
        </div>
      </section>

      <section className="bg-[#14253a] px-[5%] md:px-[8%] py-16 md:py-32">
        <div className="grid md:grid-cols-2 gap-8 md:gap-20">
          <AnimatedSection>
            <div className="flex items-center gap-2.5 mb-4 text-[#f5a06a]">
              <span className="w-6 h-px bg-[#f5a06a]" />
              <span className="text-[9px] font-semibold tracking-[4px] uppercase">Vino pe la noi</span>
              <span className="ml-2 text-[8px] font-bold tracking-[1.5px] uppercase px-2 py-1 rounded-sm border bg-sky-500/10 text-sky-300 border-sky-400/30">Local</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-white leading-tight mb-10">
              Ne găsești<br />pe <em className="text-[#f5a06a] italic">DN 68</em>
            </h2>

            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <MapPin className="w-4.5 h-4.5 text-[#f5a06a] mt-0.5 shrink-0" />
                <div>
                  <div className="text-white text-sm font-medium mb-0.5">Adresă</div>
                  <p className="text-white/60 text-sm">DN 68, Totești, Hunedoara</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4.5 h-4.5 text-[#f5a06a] mt-0.5 shrink-0" />
                <div>
                  <div className="text-white text-sm font-medium mb-0.5">Contact</div>
                  <p className="text-white/60 text-sm">WhatsApp sau telefon</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <ScheduleDisplay variant="dark" />
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.1} className="flex flex-col justify-center">
            <h3 className="font-serif text-2xl md:text-3xl text-white mb-6">
              Comandă online
            </h3>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/meniu"
                className="cursor-pointer inline-block bg-primary hover:bg-[#f5a06a] text-white px-8 py-3.5 text-[11px] font-bold tracking-[2px] uppercase no-underline transition-colors duration-300"
              >
                Vezi meniul
              </Link>
              <Link
                to="/checkout"
                className="cursor-pointer inline-block border border-white/20 hover:border-white/50 text-white px-8 py-3.5 text-[11px] font-bold tracking-[2px] uppercase no-underline transition-colors duration-300"
              >
                Comandă acum
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <PartnersSection />

      <section className="bg-primary px-[5%] md:px-[8%] py-16 md:py-28 text-center relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px",
          }}
        />
        <AnimatedSection className="relative">
          <blockquote className="font-serif italic text-[clamp(1.4rem,3vw,2.4rem)] text-white leading-relaxed max-w-2xl mx-auto mb-6">
            {"\"Un loc unde sufletul se odihnește și stomacul e fericit.\""}
          </blockquote>
          <cite className="text-[10px] tracking-[3px] uppercase text-white/50 not-italic">
            {"— Metanoia · DN 68 · Totești"}
          </cite>
        </AnimatedSection>
      </section>

      <section className="bg-background">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-0">
          {[
            { src: "https://hercules-cdn.com/file_WnaeRwIubzxYpKL3WQcFIN0G", alt: "Produse Metanoia" },
            { src: "https://hercules-cdn.com/file_A79DOuLmMcqM86aIAjVbAEPt", alt: "Sandwich-uri Metanoia" },
            { src: "https://hercules-cdn.com/file_tBLLPNSpQajxxH32qOumrhFz", alt: "Băcănia Metanoia" },
          ].map((img) => (
            <div key={img.alt} className="aspect-[4/3] overflow-hidden">
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          ))}
        </div>
      </section>

      <ReviewsSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
}