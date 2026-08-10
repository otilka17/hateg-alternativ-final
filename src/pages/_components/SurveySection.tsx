import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import AnimatedSection from "@/components/AnimatedSection.tsx";

type RadioState = Record<string, number | null>;
type CheckState = Record<string, boolean[]>;

const QUESTIONS = {
  q1: {
    num: "01 / 06",
    title: "Când ești pe drum și simți că vrei să te oprești, ce te face să intri?",
    type: "radio" as const,
    options: [
      "Miros de cafea bună sau mâncare proaspătă",
      "Aspect îngrijit și primitor al locului",
      "Recomandarea unui prieten sau review online",
      "Curiozitate — ceva diferit față de ce știu",
      "Nevoia unui produs specific (cafea, ceva de mâncat)",
    ],
  },
  q2: {
    num: "02 / 06",
    title: "Ce ai vrea să găsești la Metanoia?",
    note: "Poți bifa mai multe variante.",
    type: "check" as const,
    options: [
      "Sandvișuri artizanale configurate pe loc",
      "Cafea de specialitate (capsule premium, espresso)",
      "Limonade și băuturi proprii",
      "Produse locale artizanale (borcane, dulcețuri, mezeluri)",
      "Un loc să stai 10-15 minute în liniște",
      "Comenzi online cu ridicare de la fața locului",
    ],
  },
  q3: {
    num: "03 / 06",
    title: "Cât de des crezi că ai trece pe la noi dacă am fi pe DN 68, Totești?",
    type: "radio" as const,
    options: [
      "De fiecare dată când trec prin zonă",
      "De câteva ori pe săptămână",
      "La weekend, când ies la drum",
      "Ocazional, când am o nevoie specifică",
      "Nu știu — depinde de ce găsesc",
    ],
  },
  q5: {
    num: "05 / 06",
    title: "Cum preferi să afli despre noutăți și oferte?",
    type: "radio" as const,
    options: [
      "Instagram / Facebook",
      "WhatsApp (grup sau mesaj direct)",
      "TikTok",
      "Email / newsletter",
      "Prin prieteni / recomandări directe",
    ],
  },
};

export default function SurveySection() {
  const [radioState, setRadioState] = useState<RadioState>({
    q1: null,
    q3: null,
    q5: null,
  });
  const [checkState, setCheckState] = useState<CheckState>({
    q2: Array(6).fill(false) as boolean[],
  });
  const [q4Text, setQ4Text] = useState("");
  const [name, setName] = useState("");
  const [profession, setProfession] = useState("");
  const [age, setAge] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  const handleRadio = (qId: string, index: number) => {
    setRadioState((prev) => ({ ...prev, [qId]: index }));
  };

  const handleCheck = (qId: string, index: number) => {
    setCheckState((prev) => {
      const arr = [...prev[qId]];
      arr[index] = !arr[index];
      return { ...prev, [qId]: arr };
    });
  };

  const getRadioAnswer = (qId: string) => {
    const key = qId as keyof typeof QUESTIONS;
    const idx = radioState[qId];
    if (idx === null || idx === undefined) return "Necompletat";
    return QUESTIONS[key].options[idx];
  };

  const getCheckAnswers = () => {
    const selected = QUESTIONS.q2.options.filter((_, i) => checkState.q2[i]);
    return selected.length > 0 ? selected.join(", ") : "Necompletat";
  };

  const handleSubmit = () => {
    if (!name.trim() || !profession.trim() || !age.trim()) {
      setError(true);
      toast.error("Completează numele, profesia și vârsta.");
      return;
    }
    setError(false);

    const msg = [
      "Chestionar Metanoia",
      "",
      `Nume: ${name.trim()}`,
      `Vârsta: ${age.trim()} ani`,
      `Profesie: ${profession.trim()}`,
      "",
      `1. Ce te face să intri:`,
      getRadioAnswer("q1"),
      "",
      `2. Ce vrei să găsești:`,
      getCheckAnswers(),
      "",
      `3. Cât de des ai trece:`,
      getRadioAnswer("q3"),
      "",
      `4. Ce lipsește în Hațeg:`,
      q4Text.trim() || "Necompletat",
      "",
      `5. Canal preferat:`,
      getRadioAnswer("q5"),
    ].join("\n");

    window.open(
      `https://wa.me/40749229686?text=${encodeURIComponent(msg)}`,
      "_blank"
    );
    setSubmitted(true);
  };

  return (
    <section className="bg-[#f5f0e8] px-[5%] md:px-[8%] py-20 md:py-28">
      <AnimatedSection className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2.5 mb-4 text-primary">
            <span className="w-6 h-px bg-primary" />
            <span className="text-[9px] font-semibold tracking-[4px] uppercase">
              Ajută-ne să te cunoaștem
            </span>
            <span className="w-6 h-px bg-primary" />
          </div>
          <h2 className="font-serif text-3xl md:text-4xl text-[#14253a] leading-tight mb-3">
            Spune-ne ce vrei<br />
            <em className="text-primary italic">să găsești.</em>
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
            Construim o băcănie-butic pentru tine. Răspunde la câteva întrebări
            și te așteptăm cu o surpriză la deschidere!
          </p>
        </div>

        {/* Wrap everything in a card */}
        <div className="bg-white border border-foreground/8 rounded-sm shadow-sm p-6 sm:p-8 md:p-10">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="thanks"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6"
              >
                <span className="text-4xl block mb-4">{"🤍"}</span>
                <h3 className="font-serif text-2xl text-[#14253a] mb-3">
                  Mulțumim din inimă!
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Răspunsurile tale ne ajută să construim ceva cu adevărat pentru
                  tine.
                  <br />
                  <br />
                  <em className="text-primary">
                    {"\"Intri. Cumperi. Te schimbi puțin.\""}
                  </em>
                  <br />
                  <br />
                  Te așteptăm la Metanoia — DN 68, Totești, Țara Hațegului.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                {/* Q1 - Radio */}
                <QuestionCard
                  num={QUESTIONS.q1.num}
                  title={QUESTIONS.q1.title}
                >
                  <div className="space-y-2">
                    {QUESTIONS.q1.options.map((opt, i) => (
                      <OptionButton
                        key={opt}
                        selected={radioState.q1 === i}
                        onClick={() => handleRadio("q1", i)}
                        type="radio"
                      >
                        {opt}
                      </OptionButton>
                    ))}
                  </div>
                </QuestionCard>

                {/* Q2 - Checkbox */}
                <QuestionCard
                  num={QUESTIONS.q2.num}
                  title={QUESTIONS.q2.title}
                  note={QUESTIONS.q2.note}
                >
                  <div className="space-y-2">
                    {QUESTIONS.q2.options.map((opt, i) => (
                      <OptionButton
                        key={opt}
                        selected={checkState.q2[i]}
                        onClick={() => handleCheck("q2", i)}
                        type="check"
                      >
                        {opt}
                      </OptionButton>
                    ))}
                  </div>
                </QuestionCard>

                {/* Q3 - Radio */}
                <QuestionCard
                  num={QUESTIONS.q3.num}
                  title={QUESTIONS.q3.title}
                >
                  <div className="space-y-2">
                    {QUESTIONS.q3.options.map((opt, i) => (
                      <OptionButton
                        key={opt}
                        selected={radioState.q3 === i}
                        onClick={() => handleRadio("q3", i)}
                        type="radio"
                      >
                        {opt}
                      </OptionButton>
                    ))}
                  </div>
                </QuestionCard>

                {/* Q4 - Textarea */}
                <QuestionCard
                  num="04 / 06"
                  title="Ce lipsește în Țara Hațegului când vine vorba de mâncare bună?"
                  note="Răspunde sincer — contează cel mai mult."
                >
                  <textarea
                    value={q4Text}
                    onChange={(e) => setQ4Text(e.target.value)}
                    placeholder="Scrie aici..."
                    className="w-full border border-foreground/10 bg-[#faf5ec] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors resize-vertical min-h-[80px]"
                  />
                </QuestionCard>

                {/* Q5 - Radio */}
                <QuestionCard
                  num={QUESTIONS.q5.num}
                  title={QUESTIONS.q5.title}
                >
                  <div className="space-y-2">
                    {QUESTIONS.q5.options.map((opt, i) => (
                      <OptionButton
                        key={opt}
                        selected={radioState.q5 === i}
                        onClick={() => handleRadio("q5", i)}
                        type="radio"
                      >
                        {opt}
                      </OptionButton>
                    ))}
                  </div>
                </QuestionCard>

                {/* Q6 - Contact info */}
                <QuestionCard
                  num="06 / 06"
                  title="Spune-ne cine ești — te așteptăm cu o surpriză la deschidere!"
                  note="Câmpurile sunt obligatorii."
                >
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold tracking-[2px] uppercase text-foreground/50 block mb-1">
                        Nume și prenume *
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Maria Ionescu"
                        className="w-full border border-foreground/10 bg-[#faf5ec] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold tracking-[2px] uppercase text-foreground/50 block mb-1">
                          Profesie *
                        </label>
                        <input
                          type="text"
                          value={profession}
                          onChange={(e) => setProfession(e.target.value)}
                          placeholder="ex: antreprenoare"
                          className="w-full border border-foreground/10 bg-[#faf5ec] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold tracking-[2px] uppercase text-foreground/50 block mb-1">
                          Vârsta *
                        </label>
                        <input
                          type="number"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          placeholder="34"
                          min={14}
                          max={99}
                          className="w-full border border-foreground/10 bg-[#faf5ec] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </QuestionCard>

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  className="cursor-pointer w-full bg-[#14253a] hover:bg-primary text-white font-bold text-sm tracking-[1.5px] uppercase py-4 transition-colors duration-300"
                >
                  Trimite răspunsurile →
                </button>
                {error && (
                  <p className="text-red-500 text-xs text-center mt-2">
                    Completează numele, profesia și vârsta înainte de a trimite.
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </AnimatedSection>
    </section>
  );
}

function QuestionCard({
  num,
  title,
  note,
  children,
}: {
  num: string;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-foreground/8 p-6 sm:p-7">
      <div className="text-[10px] font-bold tracking-[2px] uppercase text-primary mb-2">
        {num}
      </div>
      <div className="font-serif text-base sm:text-lg text-[#14253a] leading-relaxed mb-1">
        {title}
      </div>
      {note && (
        <p className="text-xs text-muted-foreground italic mb-3">{note}</p>
      )}
      {!note && <div className="mb-4" />}
      {children}
    </div>
  );
}

function OptionButton({
  selected,
  onClick,
  type,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  type: "radio" | "check";
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 border text-left text-sm transition-all ${
        selected
          ? "border-primary bg-primary/5 text-[#14253a] font-medium"
          : "border-foreground/10 bg-[#faf5ec] text-foreground/80 hover:border-foreground/20"
      }`}
    >
      {/* Indicator */}
      <span
        className={`shrink-0 w-4 h-4 flex items-center justify-center border-2 transition-all ${
          type === "radio" ? "rounded-full" : "rounded-[3px]"
        } ${
          selected
            ? "border-primary bg-primary"
            : "border-foreground/20 bg-white"
        }`}
      >
        {selected && type === "radio" && (
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
        )}
        {selected && type === "check" && (
          <svg
            className="w-2.5 h-2.5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </span>
      {children}
    </button>
  );
}
