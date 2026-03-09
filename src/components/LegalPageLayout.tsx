import { ReactNode } from "react";
import { motion } from "framer-motion";
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

export const LegalPageLayout = ({ title, lastUpdated, icon: Icon, children }: LegalPageLayoutProps) => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />

        {/* Cinematic Hero Header */}
        <section className="relative pt-24 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-primary/5 blur-[100px]" />
          {/* Film grain */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.5'/%3E%3C/svg%3E")`,
          }} />

          <motion.div
            className="relative container mx-auto px-4 md:px-8 lg:px-12"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div variants={itemVariants} className="flex items-center gap-4 mb-6">
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black font-display">
                  {title}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Last updated: {lastUpdated}</p>
              </div>
            </motion.div>

            {/* Gold accent line */}
            <motion.div
              className="h-px w-32 bg-gradient-to-r from-primary/60 to-transparent"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 128, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
            />
          </motion.div>
        </section>

        {/* Content */}
        <main className="relative container mx-auto px-4 md:px-8 lg:px-12 pb-16">
          <motion.div
            className="max-w-4xl"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <div className="space-y-8">
              {children}
            </div>
          </motion.div>
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
  <motion.section
    variants={{
      hidden: { opacity: 0, y: 16 },
      visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
    }}
    className="group"
  >
    <div className="flex items-start gap-4 p-6 rounded-2xl bg-card/40 backdrop-blur-sm border border-border/20 hover:border-primary/20 transition-colors duration-300">
      <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-bold text-primary font-display">
        {number}
      </span>
      <div className="flex-1 min-w-0">
        <h2 className="text-xl md:text-2xl font-bold font-display mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
          {title}
        </h2>
        <div className="text-muted-foreground leading-relaxed space-y-3">
          {children}
        </div>
      </div>
    </div>
  </motion.section>
);
