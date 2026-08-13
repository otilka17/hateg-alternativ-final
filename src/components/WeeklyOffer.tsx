import { motion } from "motion/react";
import { Clock, Flame } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Pool of weekly offers - rotates randomly each week
const WEEKLY_OFFERS = [
  {
    title: "Combo Sandwich + Cafea",
    description: "Sandwich Nobil + cafea lungă la preț special. Valabil toată săptămâna!",
    link: "/meniu",
  },
  {
    title: "2 Sandwich-uri la preț de 1.5",
    description: "Alege oricare două sandwich-uri și plătești doar 75%. Perfect pentru doi!",
    link: "/meniu",
  },
  {
    title: "Pachet Familie -20%",
    description: "Orice pachet familie cu reducere specială. Mâncare bună pentru toți!",
    link: "/pachete",
  },
  {
    title: "Limonadă gratuită",
    description: "La orice sandwich primit o limonadă naturală din partea casei.",
    link: "/meniu",
  },
  {
    title: "Borcane 3 = 2",
    description: "Cumperi 3 borcane, plătești doar 2. Zacuscă, dulceață sau bulion — alegi tu!",
    link: "/borcane",
  },
  {
    title: "Cafea + Prăjitură -30%",
    description: "Combinația perfectă la preț redus. Cafea aromată și ceva dulce pe drum.",
    link: "/meniu",
  },
  {
    title: "Sandwich Builder -25%",
    description: "Creează-ți sandwich-ul personalizat cu 25% reducere. Ingrediente la alegere!",
    link: "/sandwich-builder",
  },
];

// Get a consistent "random" offer based on the current week number
function getWeeklyOffer() {
  const now = new Date();
  // Week number since epoch - gives a stable value for the entire week
  const weekNumber = Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000));
  const index = weekNumber % WEEKLY_OFFERS.length;
  return WEEKLY_OFFERS[index];
}

// Get next Monday 00:00 local time (weekly offer reset)
function getNextMondayMidnight(): Date {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon...
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  nextMonday.setHours(0, 0, 0, 0);
  return nextMonday;
}

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = getNextMondayMidnight().getTime() - Date.now();
    return Math.max(0, diff);
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = getNextMondayMidnight().getTime() - Date.now();
      setTimeLeft(Math.max(0, diff));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

function CountdownBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-white/10 backdrop-blur-sm border border-white/10 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center rounded-sm">
        <span className="font-serif text-2xl sm:text-3xl text-white font-bold">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="text-[9px] tracking-[2px] uppercase text-white/40 mt-1.5">{label}</span>
    </div>
  );
}

export default function WeeklyOfferSection() {
  const countdown = useCountdown();
  const [offer, setOffer] = useState(getWeeklyOffer);

  // Re-check offer when countdown hits 0 (new week)
  useEffect(() => {
    if (countdown.days === 0 && countdown.hours === 0 && countdown.minutes === 0 && countdown.seconds === 0) {
      setOffer(getWeeklyOffer());
    }
  }, [countdown.days, countdown.hours, countdown.minutes, countdown.seconds]);

  return (
    <section className="bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] px-[5%] md:px-[8%] py-14 md:py-20 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-[250px] h-[250px] rounded-full bg-[#f5a06a]/8 blur-[100px]" />
        <div className="absolute bottom-[15%] right-[10%] w-[200px] h-[200px] rounded-full bg-[#f5a06a]/5 blur-[80px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Tag */}
          <div className="inline-flex items-center gap-2 bg-[#f5a06a]/15 border border-[#f5a06a]/30 px-4 py-1.5 rounded-full mb-6">
            <Flame className="w-3.5 h-3.5 text-[#f5a06a]" />
            <span className="text-[10px] font-bold tracking-[3px] uppercase text-[#f5a06a]">
              Ofertă limitată
            </span>
          </div>

          <h2 className="font-serif text-3xl md:text-4xl text-white leading-tight mb-3">
            {offer.title}
          </h2>
          <p className="text-white/60 text-sm md:text-base max-w-md mx-auto mb-8 leading-relaxed">
            {offer.description}
          </p>

          {/* Countdown */}
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <Clock className="w-3.5 h-3.5 text-white/40" />
            <span className="text-[10px] text-white/40 tracking-wide uppercase">Se termină în:</span>
          </div>
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-10">
            <CountdownBlock value={countdown.days} label="zile" />
            <span className="text-white/20 text-xl font-light mt-[-14px]">:</span>
            <CountdownBlock value={countdown.hours} label="ore" />
            <span className="text-white/20 text-xl font-light mt-[-14px]">:</span>
            <CountdownBlock value={countdown.minutes} label="min" />
            <span className="text-white/20 text-xl font-light mt-[-14px]">:</span>
            <CountdownBlock value={countdown.seconds} label="sec" />
          </div>

          {/* CTA */}
          <Link
            to={offer.link}
            className="cursor-pointer inline-flex items-center gap-2 bg-[#f5a06a] hover:bg-[#e8935d] text-white px-8 py-3.5 text-[11px] font-bold tracking-[2px] uppercase transition-colors duration-300 no-underline"
          >
            Vezi oferta
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
