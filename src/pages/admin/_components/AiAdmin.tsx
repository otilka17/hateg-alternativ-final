import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { Sparkles, FileText, MessageSquare, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

type AiMode = "description" | "blog" | "reply";

export default function AiAdmin() {
  const [mode, setMode] = useState<AiMode>("description");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  // Description fields
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("");
  const [keywords, setKeywords] = useState("");

  // Blog fields
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState("");

  // Reply fields
  const [context, setContext] = useState("");
  const [tone, setTone] = useState("");

  const generateDescription = useAction(api.ai.generateDescription);
  const generateBlogPost = useAction(api.ai.generateBlogPost);
  const generateReply = useAction(api.ai.generateReply);

  const handleGenerate = async () => {
    setLoading(true);
    setResult("");
    try {
      if (mode === "description") {
        if (!productName.trim()) {
          toast.error("Scrie numele produsului");
          setLoading(false);
          return;
        }
        const res = await generateDescription({
          productName: productName.trim(),
          category: category.trim() || "general",
          keywords: keywords.trim() || undefined,
        });
        setResult(res.text);
      } else if (mode === "blog") {
        if (!topic.trim()) {
          toast.error("Scrie un subiect pentru articol");
          setLoading(false);
          return;
        }
        const res = await generateBlogPost({
          topic: topic.trim(),
          style: style.trim() || undefined,
        });
        setResult(`**Titlu:** ${res.title}\n\n**Rezumat:** ${res.excerpt}\n\n---\n\n${res.content}`);
      } else {
        if (!context.trim()) {
          toast.error("Scrie contextul mesajului");
          setLoading(false);
          return;
        }
        const res = await generateReply({
          context: context.trim(),
          tone: tone.trim() || undefined,
        });
        setResult(res.text);
      }
      toast.success("Generat cu succes!");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Eroare necunoscută";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    toast.success("Copiat!");
    setTimeout(() => setCopied(false), 2000);
  };

  const MODES: { id: AiMode; label: string; icon: typeof Sparkles }[] = [
    { id: "description", label: "Descriere produs", icon: Sparkles },
    { id: "blog", label: "Articol blog", icon: FileText },
    { id: "reply", label: "Răspuns client", icon: MessageSquare },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Sparkles size={18} className="text-[#f5a06a]" />
        <h3 className="font-serif text-lg text-[#14253a]">Asistent AI (Claude)</h3>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-0 border border-border mb-6">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => { setMode(m.id); setResult(""); }}
            className={`cursor-pointer flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-bold tracking-wide uppercase transition-all ${
              mode === m.id
                ? "bg-[#14253a] text-white"
                : "bg-background text-muted-foreground hover:bg-muted/50"
            }`}
          >
            <m.icon size={14} />
            {m.label}
          </button>
        ))}
      </div>

      {/* Inputs by mode */}
      <div className="space-y-4 mb-6">
        {mode === "description" && (
          <>
            <div>
              <label className="text-[11px] font-semibold tracking-wide text-foreground/70 mb-1.5 block">Nume produs *</label>
              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Ex: Zacuscă de casă Metanoia"
                className="w-full border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-[#2e4e7e] transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold tracking-wide text-foreground/70 mb-1.5 block">Categorie</label>
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Ex: borcane, sandwich, cafea"
                  className="w-full border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-[#2e4e7e] transition-colors"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold tracking-wide text-foreground/70 mb-1.5 block">Cuvinte cheie</label>
                <input
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="Ex: bio, fără conservanți, rețetă veche"
                  className="w-full border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-[#2e4e7e] transition-colors"
                />
              </div>
            </div>
          </>
        )}

        {mode === "blog" && (
          <>
            <div>
              <label className="text-[11px] font-semibold tracking-wide text-foreground/70 mb-1.5 block">Subiect articol *</label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: Cum se face zacusca tradițională în Țara Hațegului"
                className="w-full border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-[#2e4e7e] transition-colors"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold tracking-wide text-foreground/70 mb-1.5 block">Stil (opțional)</label>
              <input
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                placeholder="Ex: rețetă pas cu pas, poveste personală, informativ"
                className="w-full border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-[#2e4e7e] transition-colors"
              />
            </div>
          </>
        )}

        {mode === "reply" && (
          <>
            <div>
              <label className="text-[11px] font-semibold tracking-wide text-foreground/70 mb-1.5 block">Context / mesaj client *</label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="Ex: Un client întreabă dacă livrați în Deva sâmbăta"
                className="w-full border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-[#2e4e7e] transition-colors resize-y min-h-[80px]"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold tracking-wide text-foreground/70 mb-1.5 block">Ton (opțional)</label>
              <input
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                placeholder="Ex: prietenos, formal, scurt și la obiect"
                className="w-full border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-[#2e4e7e] transition-colors"
              />
            </div>
          </>
        )}
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="cursor-pointer w-full bg-[#14253a] hover:bg-primary disabled:opacity-50 text-white py-3.5 text-[11px] font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Se generează...
          </>
        ) : (
          <>
            <Sparkles size={14} />
            Generează cu Claude
          </>
        )}
      </button>

      {/* Result */}
      {result && (
        <div className="mt-6 relative">
          <div className="absolute top-3 right-3">
            <button
              onClick={copyToClipboard}
              className="cursor-pointer flex items-center gap-1.5 text-[10px] font-semibold tracking-wide uppercase text-muted-foreground hover:text-foreground bg-background border border-border px-2.5 py-1.5 transition-colors"
            >
              {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
              {copied ? "Copiat" : "Copiază"}
            </button>
          </div>
          <div className="bg-[#f7f4ef] border border-border p-5 pr-24">
            <div className="text-[10px] font-bold tracking-[3px] uppercase text-[#2e4e7e] mb-3">Rezultat generat</div>
            <div
              className="text-sm text-foreground leading-relaxed prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: result.replace(/\n/g, "<br />") }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
