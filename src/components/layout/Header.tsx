import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Phone, ChevronDown, Settings, MessageSquare, LogOut, User } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

const services = [
  { name: "Our Doctors", href: "/doctors", description: "Find and book appointments with experienced doctors" },
  { name: "Departments", href: "/departments", description: "Explore our medical departments" },
  { name: "Health Packages", href: "/packages", description: "Affordable health check packages" },
];

const adminMenuItems = [
  { name: "SMS Settings", href: "/admin/sms-settings", icon: MessageSquare, description: "Manage SMS providers" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role_key")
          .eq("user_id", user.id)
          .eq("is_active", true);

        setIsSuperAdmin(roles?.some(r => r.role_key === "super_admin") || false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setIsSuperAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top bar */}
      <div className="hidden bg-primary px-4 py-2 text-primary-foreground md:block">
        <div className="container mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <a href="tel:+8809678123456" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Phone className="h-4 w-4" />
              <span>+880 9678 123456</span>
            </a>
            <span>Emergency: 24/7 Support Available</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/auth" className="hover:underline">My Account</Link>
            <span>|</span>
            <Link to="/hospital-register" className="hover:underline">Register Your Hospital</Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-xl font-bold text-primary-foreground">M</span>
          </div>
          <span className="font-display text-xl font-bold text-foreground md:text-2xl">
            MediCare
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex">
          <Link 
            to="/" 
            className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${
              isActive("/") ? "text-primary" : "text-foreground"
            }`}
          >
            Home
          </Link>
          
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger className="bg-transparent text-sm font-medium">
                  Services
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4">
                    {services.map((service) => (
                      <li key={service.name}>
                        <NavigationMenuLink asChild>
                          <Link
                            to={service.href}
                            className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                          >
                            <div className="text-sm font-medium leading-none">{service.name}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {service.description}
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <Link 
            to="/doctors" 
            className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${
              isActive("/doctors") ? "text-primary" : "text-foreground"
            }`}
          >
            Our Doctors
          </Link>
          
          <Link 
            to="/about" 
            className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${
              isActive("/about") ? "text-primary" : "text-foreground"
            }`}
          >
            About
          </Link>
          
          <Link 
            to="/contact" 
            className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${
              isActive("/contact") ? "text-primary" : "text-foreground"
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* CTA Buttons */}
        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="max-w-[120px] truncate">{user.email?.split("@")[0] || "Account"}</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {isSuperAdmin && (
                  <>
                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                      Admin Settings
                    </DropdownMenuLabel>
                    {adminMenuItems.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link to={item.href} className="flex items-center gap-2 cursor-pointer">
                          <item.icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                  </>
                )}
                
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
          )}
          <Link to="/doctors">
            <Button variant="hero" size="default" className="group">
              Book Appointment
              <ChevronDown className="h-4 w-4 rotate-[-90deg] transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="rounded-md p-2 lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="border-t bg-background px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-2">
            <Link 
              to="/" 
              className="rounded-md px-4 py-3 text-sm font-medium hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/doctors" 
              className="rounded-md px-4 py-3 text-sm font-medium hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              Our Doctors
            </Link>
            <Link 
              to="/departments" 
              className="rounded-md px-4 py-3 text-sm font-medium hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              Departments
            </Link>
            <Link 
              to="/about" 
              className="rounded-md px-4 py-3 text-sm font-medium hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="rounded-md px-4 py-3 text-sm font-medium hover:bg-accent"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            
            {/* Admin links for mobile */}
            {isSuperAdmin && (
              <div className="mt-4 border-t pt-4">
                <p className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase">Admin Settings</p>
                {adminMenuItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="flex items-center gap-2 rounded-md px-4 py-3 text-sm font-medium hover:bg-accent"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-col gap-2">
              {user ? (
                <Button variant="outline" className="w-full" onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              ) : (
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
              )}
              <Link to="/doctors" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="hero" className="w-full">Book Appointment</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
