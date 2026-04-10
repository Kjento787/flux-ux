import { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { LucideIcon } from "lucide-react";

interface LegalPageLayoutProps {
  title: string;
  lastUpdated: string;
  icon: LucideIcon;
  children: ReactNode;
}

export const LegalPageLayout = ({ title, lastUpdated, icon: Icon, children }: LegalPageLayoutProps) => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="container mx-auto px-4 md:px-8 lg:px-12 pt-24 pb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-xl bg-primary/10">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
              <p className="text-sm text-muted-foreground mt-1">Last updated: {lastUpdated}</p>
            </div>
          </div>

          <div className="max-w-4xl space-y-6">
            {children}
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
};

interface LegalSectionProps {
  number: string;
  title: string;
  children: ReactNode;
}

export const LegalSection = ({ number, title, children }: LegalSectionProps) => (
  <section className="p-5 rounded-lg bg-card/50 border border-border/30">
    <div className="flex items-start gap-4">
      <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
        {number}
      </span>
      <div className="flex-1 min-w-0">
        <h2 className="text-lg font-bold mb-2">{title}</h2>
        <div className="text-muted-foreground text-sm leading-relaxed space-y-2">
          {children}
        </div>
      </div>
    </div>
  </section>
);
