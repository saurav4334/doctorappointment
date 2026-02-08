import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Login form state
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});

  // Signup form state
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [signupErrors, setSignupErrors] = useState<Record<string, string>>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrors({});

    const result = loginSchema.safeParse(loginData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0] as string] = err.message;
      });
      setLoginErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Please verify your email before logging in");
        } else {
          toast.error(error.message);
        }
        return;
      }

      // Check if user has admin role and redirect accordingly
      if (data.user) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role_key")
          .eq("user_id", data.user.id)
          .eq("is_active", true);

        const hasAdminRole = roles?.some((r) => 
          ["super_admin", "hospital_admin", "doctor"].includes(r.role_key)
        );

        toast.success("Welcome back!");
        navigate(hasAdminRole ? "/admin" : "/");
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupErrors({});

    const result = signupSchema.safeParse(signupData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) errors[err.path[0] as string] = err.message;
      });
      setSignupErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: signupData.fullName,
            phone: signupData.phone || null,
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("An account with this email already exists");
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success("Account created! Please check your email to verify your account.");
      setIsLogin(true);
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Tabs */}
          <div className="mb-8 flex rounded-lg bg-muted p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-colors ${
                isLogin
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 rounded-md py-2.5 text-sm font-medium transition-colors ${
                !isLogin
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Login Form */}
          {isLogin ? (
            <div className="rounded-xl border border-border bg-card p-8">
              <div className="text-center">
                <h1 className="font-display text-2xl font-bold text-foreground">Welcome Back</h1>
                <p className="mt-2 text-muted-foreground">Sign in to book appointments</p>
              </div>

              <form onSubmit={handleLogin} className="mt-8 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    />
                  </div>
                  {loginErrors.email && (
                    <p className="text-sm text-destructive">{loginErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-10 pr-10"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {loginErrors.password && (
                    <p className="text-sm text-destructive">{loginErrors.password}</p>
                  )}
                </div>

                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button onClick={() => setIsLogin(false)} className="text-primary hover:underline">
                  Sign up
                </button>
              </p>
            </div>
          ) : (
            /* Signup Form */
            <div className="rounded-xl border border-border bg-card p-8">
              <div className="text-center">
                <h1 className="font-display text-2xl font-bold text-foreground">Create Account</h1>
                <p className="mt-2 text-muted-foreground">Join us to book appointments easily</p>
              </div>

              <form onSubmit={handleSignup} className="mt-8 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Your full name"
                      className="pl-10"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                    />
                  </div>
                  {signupErrors.fullName && (
                    <p className="text-sm text-destructive">{signupErrors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    />
                  </div>
                  {signupErrors.email && (
                    <p className="text-sm text-destructive">{signupErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Phone (Optional)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="+880 1XXX XXXXXX"
                      className="pl-10"
                      value={signupData.phone}
                      onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                    />
                  </div>
                  {signupErrors.phone && (
                    <p className="text-sm text-destructive">{signupErrors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      className="pl-10 pr-10"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {signupErrors.password && (
                    <p className="text-sm text-destructive">{signupErrors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="Confirm your password"
                      className="pl-10"
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                    />
                  </div>
                  {signupErrors.confirmPassword && (
                    <p className="text-sm text-destructive">{signupErrors.confirmPassword}</p>
                  )}
                </div>

                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button onClick={() => setIsLogin(true)} className="text-primary hover:underline">
                  Sign in
                </button>
              </p>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                By signing up, you agree to our{" "}
                <Link to="/terms" className="text-primary hover:underline">Terms</Link>
                {" "}and{" "}
                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
