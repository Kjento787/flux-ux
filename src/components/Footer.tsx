import { Link } from "react-router-dom";
import { Logo } from "./Logo";

const footerLinks = {
  browse: [
    { to: "/home", label: "Home" },
    { to: "/movies", label: "Movies" },
    { to: "/genres", label: "Series" },
    { to: "/hubs", label: "Explore" },
    { to: "/trending", label: "Trending" },
  ],
  social: [
    { to: "/parties", label: "Watch Parties" },
    { to: "/leaderboard", label: "Leaderboard" },
    { to: "/profile", label: "My Profile" },
  ],
  legal: [
    { to: "/terms", label: "Terms of Service" },
    { to: "/privacy", label: "Privacy Policy" },
    { to: "/cookies", label: "Cookie Policy" },
    { to: "/dmca", label: "DMCA" },
  ],
};

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-border">
      <div className="w-full px-4 md:px-8 lg:px-12 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <Logo className="mb-3" />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Stream movies and TV shows for free.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Browse</h4>
            <ul className="space-y-2">
              {footerLinks.browse.map(({ to, label }) => (
                <li key={`${to}-${label}`}>
                  <Link to={to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Social</h4>
            <ul className="space-y-2">
              {footerLinks.social.map(({ to, label }) => (
                <li key={`${to}-${label}`}>
                  <Link to={to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Legal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs text-muted-foreground">
            © {currentYear} FLUX-UX. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Powered by{" "}
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              TMDB
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
