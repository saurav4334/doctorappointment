import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin, Instagram, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      {/* Main footer */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <span className="text-xl font-bold text-primary-foreground">M</span>
              </div>
              <span className="font-display text-xl font-bold text-background">
                MediCare
              </span>
            </Link>
            <p className="text-sm text-background/70">
              Your trusted healthcare partner. We connect patients with experienced doctors 
              across multiple hospitals, making quality healthcare accessible to everyone.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-background/60 transition-colors hover:text-primary">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-background/60 transition-colors hover:text-primary">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-background/60 transition-colors hover:text-primary">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-background/60 transition-colors hover:text-primary">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-background/60 transition-colors hover:text-primary">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 font-display text-lg font-semibold">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/doctors" className="text-background/70 transition-colors hover:text-primary">
                  Find a Doctor
                </Link>
              </li>
              <li>
                <Link to="/departments" className="text-background/70 transition-colors hover:text-primary">
                  Departments
                </Link>
              </li>
              <li>
                <Link to="/packages" className="text-background/70 transition-colors hover:text-primary">
                  Health Packages
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-background/70 transition-colors hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-background/70 transition-colors hover:text-primary">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* For Hospitals */}
          <div>
            <h4 className="mb-4 font-display text-lg font-semibold">For Hospitals</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/hospital-register" className="text-background/70 transition-colors hover:text-primary">
                  Register Your Hospital
                </Link>
              </li>
              <li>
                <Link to="/hospital-login" className="text-background/70 transition-colors hover:text-primary">
                  Hospital Login
                </Link>
              </li>
              <li>
                <Link to="/partner-benefits" className="text-background/70 transition-colors hover:text-primary">
                  Partner Benefits
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-background/70 transition-colors hover:text-primary">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="mb-4 font-display text-lg font-semibold">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-background/70">
                  House 42, Road 7, Gulshan-2<br />
                  Dhaka 1212, Bangladesh
                </span>
              </li>
              <li>
                <a href="tel:+8809678123456" className="flex items-center gap-3 text-background/70 transition-colors hover:text-primary">
                  <Phone className="h-4 w-4 shrink-0 text-primary" />
                  +880 9678 123456
                </a>
              </li>
              <li>
                <a href="mailto:info@medicare.com" className="flex items-center gap-3 text-background/70 transition-colors hover:text-primary">
                  <Mail className="h-4 w-4 shrink-0 text-primary" />
                  info@medicare.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 text-sm text-background/60 md:flex-row">
          <p>© 2026 MediCare. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="transition-colors hover:text-primary">Privacy Policy</Link>
            <Link to="/terms" className="transition-colors hover:text-primary">Terms of Service</Link>
            <Link to="/cookies" className="transition-colors hover:text-primary">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
