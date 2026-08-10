import { useState, useRef, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Footer from "@/components/Footer.tsx";
import Navbar from "@/components/Navbar.tsx";

type GalleryImage = {
  src: string;
  alt: string;
  category: string;
};

const FALLBACK_IMAGES: GalleryImage[] = [
  {
    src: "https://hercules-cdn.com/file_pis0SgHK0RlHvxr8pT6Oz0T6",
    alt: "Sandwich cu ouă și legume proaspete",
    category: "Sandwich",
  },
  {
    src: "https://hercules-cdn.com/file_Hfs3Jn7XUrJqsphrhGQ51MO0",
    alt: "Borcane artizanale — selecție Metanoia",
    category: "Borcane",
  },
  {
    src: "https://hercules-cdn.com/file_iCrumRYYV6VBD9niNssKc6ti",
    alt: "Cafeneaua Metanoia — atmosferă caldă",
    category: "Cafea",
  },
  {
    src: "https://hercules-cdn.com/file_pYX8LDpo1AaIh1Uuhhm5dK85",
    alt: "Producție artizanală tradițională",
    category: "Proces",
  },
  {
    src: "https://hercules-cdn.com/file_WnaeRwIubzxYpKL3WQcFIN0G",
    alt: "Gama noastră de produse",
    category: "Produse",
  },
  {
    src: "https://hercules-cdn.com/file_GMNipgMTGW3yOUpiCx2xCwPc",
    alt: "Pachet handmade Metanoia",
    category: "Ambalaj",
  },
  {
    src: "https://hercules-cdn.com/file_4L0455l6KHfeby9QPDTa664z",
    alt: "Interiorul magazinului Metanoia",
    category: "Magazin",
  },
  {
    src: "https://hercules-cdn.com/file_HFtivXD2sRpcgZQdbCYMFeT4",
    alt: "Produs Metanoia — ambalat cu grijă",
    category: "Ambalaj",
  },
  {
    src: "https://hercules-cdn.com/file_tBLLPNSpQajxxH32qOumrhFz",
    alt: "Conserve tradiționale în borcane",
    category: "Borcane",
  },
];

// ─── Parallax Hero ───
function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative h-[70vh] md:h-[85vh] overflow-hidden bg-[#0a0a0a]">
      {/* Background image with parallax */}
      <motion.div
        style={{ y }}
        className="absolute inset-0 w-full h-[130%]"
      >
        <img
          src="https://hercules-cdn.com/file_pis0SgHK0RlHvxr8pT6Oz0T6"
          alt=""
          className="w-full h-full object-cover opacity-40"
        />
      </motion.div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="text-white/50 text-[10px] md:text-xs font-semibold tracking-[6px] uppercase mb-6"
        >
          Galerie
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
          className="font-serif text-[clamp(3rem,10vw,7rem)] text-white leading-[0.9] tracking-tight"
        >
          Arta
          <br />
          <em className="text-[#f5a06a] italic">gustului</em>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
          className="mt-6 text-white/60 text-sm md:text-base max-w-md leading-relaxed text-balance"
        >
          Fiecare detaliu capturat. Fiecare preparat, o poveste.
        </motion.p>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-px h-12 bg-gradient-to-b from-white/60 to-transparent"
        />
      </motion.div>
    </section>
  );
}

// ─── Editorial Image Block ───
function EditorialImage({ image, index, onClick }: {
  image: GalleryImage;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.div
      className="relative overflow-hidden cursor-pointer group h-full"
      onClick={onClick}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "200px" }}
      transition={{ duration: 0.5, delay: index % 2 === 0 ? 0 : 0.1, ease: "easeOut" }}
    >
      <img
        src={image.src}
        alt={image.alt}
        className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.03]"
      />

      {/* Hover overlay - minimal, editorial */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500" />
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
        <p className="text-white text-xs md:text-sm font-medium tracking-wide">{image.alt}</p>
        <p className="text-white/50 text-[10px] tracking-[3px] uppercase mt-1">{image.category}</p>
      </div>
    </motion.div>
  );
}

// ─── Lightbox ───
function Lightbox({
  images,
  currentIndex,
  onClose,
  onPrev,
  onNext,
}: {
  images: GalleryImage[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const current = images[currentIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="cursor-pointer absolute top-6 right-6 text-white/40 hover:text-white transition-colors z-10 p-2"
      >
        <X size={24} strokeWidth={1.5} />
      </button>

      {/* Prev */}
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="cursor-pointer absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors p-3"
      >
        <ChevronLeft size={32} strokeWidth={1} />
      </button>

      {/* Image */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="max-w-[92vw] max-h-[88vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={current.src}
          alt={current.alt}
          className="max-w-full max-h-[88vh] object-contain"
        />
      </motion.div>

      {/* Next */}
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="cursor-pointer absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors p-3"
      >
        <ChevronRight size={32} strokeWidth={1} />
      </button>

      {/* Info bar */}
      <div className="absolute bottom-6 left-0 right-0 flex items-end justify-between px-8">
        <div>
          <p className="text-white/80 text-sm font-medium">{current.alt}</p>
          <p className="text-white/30 text-[10px] tracking-[3px] uppercase mt-1">{current.category}</p>
        </div>
        <p className="text-white/20 text-xs font-mono">
          {String(currentIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Main Gallery Page ───
export default function GalleryPage() {
  const dbImages = useQuery(api.gallery.list, {});
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const galleryImages: GalleryImage[] =
    dbImages && dbImages.length > 0
      ? dbImages
          .filter((img) => img.imageUrl)
          .map((img) => ({
            src: img.imageUrl!,
            alt: img.alt,
            category: img.category,
          }))
      : FALLBACK_IMAGES;

  const openLightbox = useCallback((index: number) => setLightboxIndex(index), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevImage = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null ? null : prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  }, [galleryImages.length]);
  const nextImage = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null ? null : prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  }, [galleryImages.length]);

  // Build editorial layout: alternate between full-width and 2-col rows
  const renderGallery = () => {
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < galleryImages.length) {
      // Pattern: full-width, then 2-col pair, then full-width, then 2-col pair...
      const patternIndex = Math.floor(i / 3);
      const positionInPattern = i - patternIndex * 3;

      if (positionInPattern === 0) {
        // Full-width image
        elements.push(
          <div key={`full-${i}`} className="w-full h-[50vh] md:h-[75vh]">
            <EditorialImage image={galleryImages[i]} index={i} onClick={() => openLightbox(i)} />
          </div>
        );
        i++;
      } else {
        // 2-column pair
        const left = galleryImages[i];
        const right = galleryImages[i + 1];
        elements.push(
          <div key={`pair-${i}`} className="grid grid-cols-1 md:grid-cols-2 gap-1">
            <div className="h-[40vh] md:h-[60vh]">
              <EditorialImage image={left} index={i} onClick={() => openLightbox(i)} />
            </div>
            {right && (
              <div className="h-[40vh] md:h-[60vh]">
                <EditorialImage image={right} index={i + 1} onClick={() => openLightbox(i + 1)} />
              </div>
            )}
          </div>
        );
        i += right ? 2 : 1;
      }
    }

    return elements;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] overflow-hidden">
      <Navbar />

      <HeroSection />

      {/* Gallery content */}
      <section className="relative">
        {dbImages === undefined ? (
          <div className="space-y-1 p-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-full h-[50vh] bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-1 p-1">
            {renderGallery()}
          </div>
        )}
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            images={galleryImages}
            currentIndex={lightboxIndex}
            onClose={closeLightbox}
            onPrev={prevImage}
            onNext={nextImage}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
