import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Heart, Leaf, HandHeart, Mountain, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar.tsx";
import SEO from "@/components/SEO.tsx";
import AnimatedSection from "@/components/AnimatedSection.tsx";
import Footer from "@/components/Footer.tsx";

const TIMELINE = [
  {
    year: "2022",
    title: "Ideea prinde viață",
    text: "Visul de a transforma o oprire pe DN 68 într-o experiență autentică ia naștere.",
  },
  {
    year: "2023",
    title: "Primele borcane",
    text: "Rețetele bunicii devin produse — zacuscă, dulcețuri și bulion, toate fără conservanți.",
  },
  {
    year: "2024",
    title: "Metanoia se deschide",
    text: "Băcănia-butic pe DN 68 la Totești devine realitate. Cafea, sandwich-uri și multă dragoste.",
  },
  {
    year: "Azi",
    title: "Creștem împreună",
    text: "Comunitatea crește, produsele se diversifică, dar sufletul rămâne același.",
  },
];

const VALUES = [
  {
    icon: Leaf,
    title: "Ingrediente locale",
    desc: "Legume și fructe din grădinile Țării Hațegului. Fără compromisuri, fără E-uri.",
    accent: "bg-emerald-500/10 text-emerald-700",
  },
  {
    icon: Heart,
    title: "Rețete de familie",
    desc: "Secretele din bucătăria bunicii, păstrate cu grijă și transmise mai departe.",
    accent: "bg-rose-500/10 text-rose-700",
  },
  {
    icon: HandHeart,
    title: "Făcut cu mâna",
    desc: "Fiecare produs e pregătit manual — de la sandwich la ultimul borcan.",
    accent: "bg-amber-500/10 text-amber-700",
  },
  {
    icon: Mountain,
    title: "Spirit de Hațeg",
    desc: "Țara Hațegului e casa noastră. Fiecare produs poartă povestea acestui ținut.",
    accent: "bg-sky-500/10 text-sky-700",
  },
];

export default function DesprePage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <SEO
        title="Despre noi"
        description="Povestea Metanoia — o băcănie-butic de pe DN 68, Totești, cu produse artizanale din Țara Hațegului."
      />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-16 bg-[#14253a] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] left-[5%] w-[400px] h-[400px] rounded-full bg-[#1e3a5c]/50 blur-[120px]" />
          <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] rounded-full bg-[#f5a06a]/8 blur-[100px]" />
        </div>

        <div className="px-[5%] md:px-[8%] py-24 md:py-36 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as const }}
          >
            <div className="flex items-center justify-center gap-4 mb-6 text-white/40 text-[10px] font-semibold tracking-[5px] uppercase">
              <span className="w-10 h-px bg-white/25" />
              Povestea noastră
              <span className="w-10 h-px bg-white/25" />
            </div>
            <h1 className="font-serif text-[clamp(2.5rem,7vw,5rem)] text-white leading-none tracking-tight mb-5">
              Despre <em className="text-[#f5a06a] italic">Metanoia</em>
            </h1>
            <p className="text-white/70 max-w-lg mx-auto leading-relaxed text-balance">
              Mai mult decât o băcănie. Un loc de suflet pe DN 68, unde
              ingredientele locale și rețetele de familie se întâlnesc cu
              dragostea pentru comunitate.
            </p>
          </motion.div>
        </div>

        {/* Curved bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full h-auto block" preserveAspectRatio="none">
            <path d="M0,60 C480,0 960,0 1440,60 L1440,60 L0,60 Z" fill="var(--background)" />
          </svg>
        </div>
      </section>

      {/* Origin story - text + image */}
      <section className="bg-background px-[5%] md:px-[8%] py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 max-w-6xl mx-auto items-center">
          <AnimatedSection direction="left">
            <div className="flex items-center gap-2.5 mb-4 text-primary">
              <span className="w-6 h-px bg-primary" />
              <span className="text-[9px] font-semibold tracking-[4px] uppercase">Originea</span>
            </div>
            <h2 className="font-serif text-3xl md:text-[2.75rem] text-[#14253a] leading-tight mb-6">
              O transformare <em className="text-primary italic">cu sens</em>
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed text-[0.95rem]">
              <p>
                <strong className="text-foreground">Metanoia</strong> înseamnă transformare — o schimbare
                profundă a felului în care vezi lucrurile. Am ales acest nume pentru
                că exact asta ne-am dorit: să transformăm o simplă oprire pe drum
                într-o experiență care hrănește sufletul.
              </p>
              <p>
                Am pornit de la ideea că drumul spre Hațeg merită mai mult decât
                un coffee-to-go. Merită o pauză adevărată — cu cafea bună, sandwich-uri
                calde din ingrediente proaspete, sucuri stoarse pe loc și bunătățile
                din borcane pregătite după rețetele familiei.
              </p>
              <p>
                Suntem pe DN 68, la Totești, la poalele munților. Și în fiecare
                dimineață deschidem cu același gând: să oferim ceva autentic, făcut
                cu grijă, pentru fiecare om care ne trece pragul.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection direction="right" delay={0.15} className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-sm shadow-xl">
              <img
                src="https://hercules-cdn.com/file_4L0455l6KHfeby9QPDTa664z"
                alt="Magazinul Metanoia — interior autentic"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Decorative quote */}
            <div className="absolute -bottom-6 -left-4 md:-left-8 bg-primary text-white p-5 md:p-6 max-w-[240px] shadow-lg">
              <p className="font-serif italic text-sm leading-snug">
                {"\"Fiecare produs poartă o poveste de familie.\""}
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Values grid */}
      <section className="bg-[#f5f0e8] px-[5%] md:px-[8%] py-20 md:py-28">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection className="text-center mb-14">
            <div className="flex items-center justify-center gap-4 mb-4 text-primary">
              <span className="w-6 h-px bg-primary" />
              <span className="text-[9px] font-semibold tracking-[4px] uppercase">Valorile noastre</span>
              <span className="w-6 h-px bg-primary" />
            </div>
            <h2 className="font-serif text-3xl md:text-[2.75rem] text-[#14253a] leading-tight">
              Ce ne <em className="text-primary italic">definește</em>
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {VALUES.map((val, i) => (
              <AnimatedSection key={val.title} direction="none" delay={i * 0.1}>
                <div className="bg-white p-7 rounded-sm border border-foreground/5 h-full hover:shadow-md transition-shadow duration-300">
                  <div className={`w-12 h-12 rounded-full ${val.accent} flex items-center justify-center mb-5`}>
                    <val.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-medium text-[#14253a] mb-2">{val.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{val.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Full-width landscape image divider */}
      <section className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <img
          src="https://hercules-cdn.com/file_pYX8LDpo1AaIh1Uuhhm5dK85"
          alt="Producția Metanoia — proces artizanal tradițional"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#14253a]/70 via-transparent to-[#14253a]/30" />
        <div className="absolute bottom-8 left-[5%] md:left-[8%]">
          <AnimatedSection>
            <p className="text-white/90 font-serif italic text-xl md:text-2xl drop-shadow-lg">
              Țara Hațegului — casa noastră
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-[#14253a] px-[5%] md:px-[8%] py-20 md:py-28 relative overflow-hidden">
        {/* Grain texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "200px",
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto">
          <AnimatedSection className="text-center mb-14">
            <div className="flex items-center justify-center gap-4 mb-4 text-[#f5a06a]">
              <span className="w-6 h-px bg-[#f5a06a]" />
              <span className="text-[9px] font-semibold tracking-[4px] uppercase">Drumul nostru</span>
              <span className="w-6 h-px bg-[#f5a06a]" />
            </div>
            <h2 className="font-serif text-3xl md:text-[2.75rem] text-white leading-tight">
              De la vis la <em className="text-[#f5a06a] italic">realitate</em>
            </h2>
          </AnimatedSection>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[22px] md:left-1/2 md:-translate-x-px top-0 bottom-0 w-px bg-white/15" />

            {TIMELINE.map((item, i) => (
              <AnimatedSection key={item.year} direction={i % 2 === 0 ? "left" : "right"} delay={i * 0.12}>
                <div className={`relative flex items-start gap-6 mb-12 last:mb-0 md:gap-0 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}>
                  {/* Dot */}
                  <div className="absolute left-[22px] md:left-1/2 md:-translate-x-1/2 w-3 h-3 rounded-full bg-[#f5a06a] border-2 border-[#14253a] mt-1.5 z-10" />

                  {/* Content */}
                  <div className={`ml-14 md:ml-0 md:w-[45%] ${i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                    <span className="text-[#f5a06a] font-mono text-sm font-bold tracking-wider">{item.year}</span>
                    <h3 className="text-white font-medium text-lg mt-1 mb-2">{item.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{item.text}</p>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Ingredients / Process section */}
      <section className="bg-background px-[5%] md:px-[8%] py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 max-w-6xl mx-auto items-center">
          <AnimatedSection direction="left" className="order-2 md:order-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="aspect-square overflow-hidden rounded-sm">
                <img
                  src="https://hercules-cdn.com/file_WnaeRwIubzxYpKL3WQcFIN0G"
                  alt="Produse Metanoia — gama noastră artizanală"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="aspect-square overflow-hidden rounded-sm mt-8">
                <img
                  src="https://hercules-cdn.com/file_GMNipgMTGW3yOUpiCx2xCwPc"
                  alt="Pachet handmade Metanoia — produs artizanal"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="aspect-square overflow-hidden rounded-sm">
                <img
                  src="https://hercules-cdn.com/file_Hfs3Jn7XUrJqsphrhGQ51MO0"
                  alt="Produse în borcane — selecție artizanală Metanoia"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="aspect-square overflow-hidden rounded-sm mt-8">
                <img
                  src="https://hercules-cdn.com/file_iCrumRYYV6VBD9niNssKc6ti"
                  alt="Cafeneaua Metanoia — băuturi și atmosferă"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection direction="right" delay={0.15} className="order-1 md:order-2">
            <div className="flex items-center gap-2.5 mb-4 text-primary">
              <span className="w-6 h-px bg-primary" />
              <span className="text-[9px] font-semibold tracking-[4px] uppercase">Procesul</span>
            </div>
            <h2 className="font-serif text-3xl md:text-[2.75rem] text-[#14253a] leading-tight mb-6">
              De la grădină <em className="text-primary italic">la borcan</em>
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed text-[0.95rem]">
              <p>
                Totul începe cu ingredientele. Legumele și fructele vin din grădinile
                din Țara Hațegului — de la producători locali pe care-i cunoaștem
                personal. Nimic importat, nimic forțat.
              </p>
              <p>
                Pregătirea e simplă, dar atentă. Fiecare borcan de zacuscă urmează
                rețeta bunicii — aceleași proporții, aceleași gesturi, aceeași grijă.
                Fără conservanți, fără grabă.
              </p>
              <p>
                Rezultatul? Produse care au gust de casă. Nu pentru că e un slogan,
                ci pentru că chiar sunt făcute acasă — la noi, pe DN 68.
              </p>
            </div>

            <Link
              to="/borcane"
              className="mt-8 inline-flex items-center gap-2 text-primary text-sm font-semibold tracking-wide hover:gap-3 transition-all no-underline cursor-pointer"
            >
              Vezi borcanele noastre
              <ArrowRight className="w-4 h-4" />
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA strip */}
      <section className="bg-primary px-[5%] md:px-[8%] py-16 md:py-20 text-center">
        <AnimatedSection>
          <h2 className="font-serif text-2xl md:text-3xl text-white mb-4">
            Vino să ne <em className="italic">cunoști</em>
          </h2>
          <p className="text-white/80 max-w-md mx-auto mb-8 text-sm leading-relaxed">
            Suntem pe DN 68, la Totești. Oprește-te la o cafea, alege un sandwich
            proaspăt sau ia acasă borcanele noastre.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/meniu"
              className="cursor-pointer bg-white text-[#14253a] px-8 py-3.5 text-[11px] font-bold tracking-[2px] uppercase no-underline hover:bg-white/90 transition-colors"
            >
              Vezi Meniul
            </Link>
            <Link
              to="/contact"
              className="cursor-pointer border border-white/40 text-white px-8 py-3.5 text-[11px] font-bold tracking-[2px] uppercase no-underline hover:bg-white/10 transition-colors"
            >
              Contact & Direcții
            </Link>
          </div>
        </AnimatedSection>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
