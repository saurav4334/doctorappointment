import { AdminRole } from "@/hooks/useAdminAuth";
import { format } from "date-fns";

interface WelcomeHeaderProps {
  role: AdminRole;
  userName?: string;
}

export function WelcomeHeader({ role, userName }: WelcomeHeaderProps) {
  const today = format(new Date(), "EEEE, MMMM d, yyyy");

  const getRoleLabel = () => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "hospital_admin":
        return "Hospital Admin";
      case "doctor":
        return "Doctor";
      default:
        return "Admin";
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="relative overflow-hidden rounded-2xl hero-gradient p-6 md:p-8 text-primary-foreground">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg
          className="h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern
              id="grid"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10">
        <p className="text-primary-foreground/70 text-sm mb-1">{today}</p>
        <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
          {getGreeting()}, {userName || getRoleLabel()}!
        </h1>
        <p className="text-primary-foreground/80 text-sm md:text-base max-w-xl">
          {role === "super_admin" && "Here's what's happening across your platform today."}
          {role === "hospital_admin" && "Here's an overview of your hospital's activity."}
          {role === "doctor" && "Here's a summary of your practice today."}
        </p>
      </div>

      {/* Decorative elements */}
      <div className="absolute right-4 top-4 md:right-8 md:top-6">
        <div className="w-20 h-20 md:w-32 md:h-32 rounded-full bg-white/10 blur-2xl" />
      </div>
    </div>
  );
}
