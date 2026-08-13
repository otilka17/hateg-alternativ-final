import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AuthForm() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("flow", flow);
    setSubmitting(true);
    try {
      await signIn("password", formData);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      toast.error(
        flow === "signIn" ? "Email sau parolă greșite." : "Nu am putut crea contul.",
        { description: detail, duration: 15000 },
      );
      console.error("Auth error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto space-y-4 text-left">
      <div>
        <label className="text-xs font-semibold tracking-[1px] uppercase text-foreground/60 block mb-2">
          Email
        </label>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="adresa@email.com"
          className="w-full bg-white border border-foreground/10 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>
      <div>
        <label className="text-xs font-semibold tracking-[1px] uppercase text-foreground/60 block mb-2">
          Parolă
        </label>
        <input
          type="password"
          name="password"
          required
          minLength={8}
          autoComplete={flow === "signIn" ? "current-password" : "new-password"}
          placeholder="Minim 8 caractere"
          className="w-full bg-white border border-foreground/10 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="cursor-pointer w-full bg-[#14253a] hover:bg-primary text-white px-6 py-3.5 text-[11px] font-bold tracking-[1.5px] uppercase transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {submitting && <Loader2 size={14} className="animate-spin" />}
        {flow === "signIn" ? "Conectare" : "Creează cont"}
      </button>

      <p className="text-xs text-muted-foreground text-center">
        {flow === "signIn" ? "Nu ai cont încă?" : "Ai deja cont?"}{" "}
        <button
          type="button"
          onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
          className="cursor-pointer text-primary hover:text-[#f5a06a] font-semibold underline bg-transparent border-none p-0"
        >
          {flow === "signIn" ? "Creează unul" : "Conectează-te"}
        </button>
      </p>
    </form>
  );
}
