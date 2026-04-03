import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, Play } from "lucide-react";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { fetchTrendingMovies, getImageUrl } from "@/lib/tmdb";
import { PageTransition } from "@/components/PageTransition";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const Landing = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) navigate("/profiles");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) navigate("/profiles");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const { data: trendingData } = useQuery({
    queryKey: ["landing-trending"],
    queryFn: () => fetchTrendingMovies("week"),
  });

  const validateForm = () => {
    const newErrors: typeof errors = {};
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) newErrors.email = emailResult.error.errors[0].message;
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) newErrors.password = passwordResult.error.errors[0].message;
    if (!isLogin && password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast.error(error.message.includes("Invalid login") ? "Invalid email or password" : error.message);
          return;
        }
        toast.success("Welcome back!");
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) {
          toast.error(error.message.includes("already registered") ? "This email is already registered." : error.message);
          return;
        }
        toast.success("Account created! You can now login.");
        setIsLogin(true);
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const heroMovie = trendingData?.results?.[0];
  const heroBackdrop = heroMovie ? getImageUrl(heroMovie.backdrop_path, "original") : null;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Hero backdrop - KissKH style full-width image */}
        {heroBackdrop && (
          <div className="absolute inset-0">
            <img src={heroBackdrop} alt="" className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm">
            <div className="text-center mb-8">
              <Logo size="lg" className="justify-center mb-4" />
              <p className="text-muted-foreground text-sm">Stream movies & TV shows</p>
            </div>

            {/* Auth Form - clean card */}
            <div className="bg-card/90 backdrop-blur-sm rounded-lg border border-border p-6">
              <h2 className="text-lg font-semibold text-center mb-1">
                {isLogin ? "Sign In" : "Create Account"}
              </h2>
              <p className="text-muted-foreground text-xs text-center mb-6">
                {isLogin ? "Welcome back" : "Join Flux-UX to start streaming"}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })); }}
                      className="pl-9 h-10 text-sm"
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })); }}
                      className="pl-9 pr-9 h-10 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>

                {!isLogin && (
                  <div className="space-y-1.5">
                    <Label htmlFor="confirmPassword" className="text-xs">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: undefined })); }}
                        className="pl-9 h-10 text-sm"
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                  </div>
                )}

                <Button type="submit" className="w-full h-10 text-sm font-medium" disabled={loading}>
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      <Play className="h-4 w-4 fill-current" />
                      {isLogin ? "Sign In" : "Create Account"}
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <p className="text-muted-foreground text-xs">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => { setIsLogin(!isLogin); setErrors({}); setPassword(""); setConfirmPassword(""); }}
                    className="text-primary hover:underline font-medium"
                  >
                    {isLogin ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Landing;
