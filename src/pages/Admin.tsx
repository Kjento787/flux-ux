import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";

const Admin = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16">
          <h1 className="text-3xl font-bold text-foreground mb-8">Admin Panel</h1>
          <p className="text-muted-foreground">Admin functionality coming soon.</p>
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Admin;
