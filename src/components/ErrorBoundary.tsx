import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Render error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-6 text-center">
          <div className="max-w-md">
            <h1 className="font-serif text-2xl text-[#14253a] mb-3">A apărut o eroare</h1>
            <p className="text-sm text-muted-foreground mb-4">
              Ceva nu a funcționat pe această pagină. Un screenshot cu mesajul de mai jos ajută la reparare.
            </p>
            <pre className="text-left text-xs bg-muted p-4 rounded-sm overflow-auto whitespace-pre-wrap mb-6">
              {this.state.error.message}
            </pre>
            <a
              href="/"
              className="inline-block bg-[#14253a] text-white text-[11px] font-bold tracking-widest uppercase px-6 py-3 no-underline hover:bg-primary transition-colors"
            >
              Înapoi la pagina principală
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
