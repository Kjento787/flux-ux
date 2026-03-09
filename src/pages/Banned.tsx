import { PageTransition } from "@/components/PageTransition";

const Banned = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-destructive">Account Banned</h1>
          <p className="text-muted-foreground">Your account has been suspended. If you believe this is an error, please contact support.</p>
        </div>
      </div>
    </PageTransition>
  );
};

export default Banned;
