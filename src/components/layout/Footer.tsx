import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Globe, Facebook, Twitter, Linkedin, Instagram, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer>
      {/* Main footer - navy blue matching logo */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <div className="grid gap-8 md:grid-cols-3 items-start">
            {/* Brand / Logo */}
            <div className="flex items-center gap-4">
              <Link to="/">
                <img src="/logo.png" alt="Doctors AppointmentBD" className="h-14 object-contain" />
              </Link>
            </div>

            {/* Address & Web */}
            <div className="space-y-2 text-sm text-primary-foreground/85 text-center">
              <div className="flex items-start gap-2 justify-center">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>17-18, Hossain Housing Society, Shyamoli, Dhaka-1215</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:doctorsappointmentbd@gmail.com" className="hover:underline">
                  doctorsappointmentbd@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <Globe className="h-4 w-4 shrink-0" />
                <a href="https://www.doctorsappointmentbd.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  www.doctorsappointmentbd.com
                </a>
              </div>
            </div>

            {/* Contact Numbers */}
            <div className="space-y-2 text-sm text-primary-foreground/85 text-right">
              <p className="font-semibold text-primary-foreground">Contact:</p>
              <a href="tel:+8801720003113" className="flex items-center gap-2 justify-end hover:underline">
                <Phone className="h-4 w-4 shrink-0" />
                +880 1720 003113
              </a>
              <a href="tel:+8801771588599" className="flex items-center gap-2 justify-end hover:underline">
                <Phone className="h-4 w-4 shrink-0" />
                +880 1771 588599
              </a>
            </div>
          </div>

          {/* Social links */}
          <div className="mt-8 flex justify-center gap-5">
            <a href="#" className="text-primary-foreground/60 transition-colors hover:text-primary-foreground">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="text-primary-foreground/60 transition-colors hover:text-primary-foreground">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="text-primary-foreground/60 transition-colors hover:text-primary-foreground">
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="#" className="text-primary-foreground/60 transition-colors hover:text-primary-foreground">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="text-primary-foreground/60 transition-colors hover:text-primary-foreground">
              <Youtube className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-primary/90 border-t border-primary-foreground/10">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 py-4 text-xs text-primary-foreground/60 md:flex-row">
          <p>© {new Date().getFullYear()} Doctors AppointmentBD. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="transition-colors hover:text-primary-foreground">Privacy Policy</Link>
            <Link to="/terms" className="transition-colors hover:text-primary-foreground">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
