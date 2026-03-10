import { PageTransition } from "@/components/PageTransition";
import { useBanStatus } from "@/hooks/useBanStatus";
import { Ban, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Banned = () => {
  const { reason, expiresAt, isPermanent } = useBanStatus();

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <Ban className="h-10 w-10 text-destructive" />
          </div>

          <div>
            <h1 className="text-3xl font-bold text-destructive mb-2">Account Suspended</h1>
            <p className="text-muted-foreground">
              Your access to Flux-UX has been restricted.
            </p>
          </div>

          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-5 space-y-3">
              {reason && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Reason</p>
                  <p className="text-sm font-medium">{reason}</p>
                </div>
              )}

              <div className="flex items-center justify-center gap-2">
                {isPermanent ? (
                  <Badge variant="destructive" className="gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Permanent Ban
                  </Badge>
                ) : expiresAt ? (
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    Expires: {new Date(expiresAt).toLocaleDateString()}
                  </Badge>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    </PageTransition>
  );
};

export default Banned;
