import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, Play, Film, Tv, Star, Sparkles, Zap } from "lucide-react";
import { z } from "zod";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { fetchTrendingMovies, getImageUrl } from "@/lib/tmdb";
import { PageTransition } from "@/components/PageTransition";
import { ParticleField, AuroraBackground } from "@/components/effects/ParticleField";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
};

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

  const bgPosters = trendingData?.results?.slice(0, 12) || [];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Cinematic background poster mosaic */}
        <div className="absolute inset-0">
          <div className="grid grid-cols-4 md:grid-cols-6 gap-0.5 h-full opacity-[0.06]">
            {bgPosters.map((movie) => (
              <div key={movie.id} className="relative overflow-hidden">
                <motion.img
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
                  src={getImageUrl(movie.poster_path, "w500")}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Holographic effects */}
        <ParticleField />
        <AuroraBackground />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/90" />
        
        {/* Animated glow orbs */}
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-holo-cyan/10 blur-[100px] animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

        {/* Content */}
        <div className="relative z-10 min-h-screen flex flex-col lg:flex-row items-center justify-center px-4 py-12 gap-12 lg:gap-20 max-w-7xl mx-auto">
          
          {/* Left: Hero content */}
          <motion.div
            className="flex-1 text-center lg:text-left max-w-lg"
            initial="hidden"
            animate="visible"
          >
            <motion.div custom={0} variants={fadeUp} className="mb-8">
              <Logo size="lg" />
            </motion.div>
            
            <motion.h1 custom={1} variants={fadeUp} className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-display leading-[1.1] mb-6">
              <span className="text-gradient-aurora">Your Universe of</span>{" "}
              <span className="relative">
                <span className="text-foreground">Entertainment</span>
                <Sparkles className="absolute -top-2 -right-6 h-6 w-6 text-flux-cyan animate-pulse" />
              </span>
            </motion.h1>
            
            <motion.p custom={2} variants={fadeUp} className="text-lg text-muted-foreground leading-relaxed mb-8">
              Unlimited movies and TV shows. Discover, watch, and explore — all in one place with Flux-UX.
            </motion.p>

            {/* Feature highlights */}
            <motion.div custom={3} variants={fadeUp} className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm">
              {[
                { icon: Film, label: "Thousands of Movies", color: "primary" },
                { icon: Tv, label: "TV Series", color: "holo-cyan" },
                { icon: Zap, label: "Instant Streaming", color: "holo-magenta" },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10">
                  <div className={`w-8 h-8 rounded-lg bg-${color}/10 flex items-center justify-center`}>
                    <Icon className={`h-4 w-4 text-${color}`} />
                  </div>
                  <span className="text-muted-foreground">{label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Auth form */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full max-w-md"
          >
            <div className="glass-holo rounded-3xl p-8 relative overflow-hidden">
              {/* Holographic accent line at top */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-holo-cyan via-primary to-holo-magenta" />
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer pointer-events-none" />
              
              <div className="text-center mb-8 relative">
                <h2 className="text-2xl font-bold mb-1 font-display text-gradient-aurora">
                  {isLogin ? "Welcome Back" : "Join Flux-UX"}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {isLogin ? "Sign in to continue watching" : "Create your account to start streaming"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 relative">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: undefined })); }}
                      className="pl-10 bg-surface-2/50 border-border/30 focus:border-primary focus:ring-1 focus:ring-primary/30 h-12 rounded-xl"
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })); }}
                      className="pl-10 pr-10 bg-surface-2/50 border-border/30 focus:border-primary focus:ring-1 focus:ring-primary/30 h-12 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>

                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setErrors(prev => ({ ...prev, confirmPassword: undefined })); }}
                        className="pl-10 bg-surface-2/50 border-border/30 focus:border-primary focus:ring-1 focus:ring-primary/30 h-12 rounded-xl"
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-bold btn-holo rounded-xl"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="h-5 w-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      <Play className="h-4 w-4 fill-current" />
                      {isLogin ? "Sign In" : "Create Account"}
                    </span>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center relative">
                <p className="text-muted-foreground text-sm">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button
                    type="button"
                    onClick={() => { setIsLogin(!isLogin); setErrors({}); setPassword(""); setConfirmPassword(""); }}
                    className="text-primary hover:text-holo-cyan transition-colors font-semibold"
                  >
                    {isLogin ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-6 left-0 right-0 text-center"
        >
          <p className="text-muted-foreground/40 text-xs tracking-widest uppercase flex items-center justify-center gap-2">
            <Sparkles className="h-3 w-3" />
            Unlimited Entertainment · Curated for You
            <Sparkles className="h-3 w-3" />
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Landing;
