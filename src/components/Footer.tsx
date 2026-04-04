import { Link } from "react-router-dom";
import { Logo } from "./Logo";

export const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-surface-1 mt-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <Logo size="sm" />
          <nav className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms-of-service" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="/dmca" className="hover:text-foreground transition-colors">DMCA</Link>
            <Link to="/changelog" className="hover:text-foreground transition-colors">Changelog</Link>
          </nav>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Flux-UX</p>
        </div>
      </div>
    </footer>
  );
};
