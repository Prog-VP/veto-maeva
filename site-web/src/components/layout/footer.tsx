import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { CLINIC, NAV } from "@/lib/clinic";

export function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden gradient-brand text-cream">
      <div className="grain absolute inset-0" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-6 md:px-10 py-20">
        <div className="grid gap-16 md:grid-cols-4">
          <div className="md:col-span-2">
            <h3 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight leading-[0.9]">
              {CLINIC.name}
            </h3>
            <p className="mt-4 max-w-md font-serif text-lg italic text-cream/80">
              {CLINIC.tagline}
            </p>
          </div>

          <div className="hidden md:block">
            <h4 className="text-xs uppercase tracking-[0.2em] text-cream/60 font-sans font-semibold">
              Navigation
            </h4>
            <ul className="mt-5 space-y-2.5">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-cream/90 hover:text-cream transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-cream/60 font-sans font-semibold">
              Contact
            </h4>
            <ul className="mt-5 space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-terracotta" strokeWidth={2} />
                <address className="not-italic text-cream/90 leading-relaxed">
                  {CLINIC.address.street}
                  <br />
                  {CLINIC.address.postalCode} {CLINIC.address.city}
                  <br />
                  {CLINIC.address.countryName}
                </address>
              </li>
              <li className="flex gap-3">
                <Phone className="h-5 w-5 shrink-0 text-terracotta" strokeWidth={2} />
                <a href={CLINIC.phone.href} className="text-cream/90 hover:text-cream">
                  {CLINIC.phone.display}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="h-5 w-5 shrink-0 text-terracotta" strokeWidth={2} />
                <a href={`mailto:${CLINIC.email}`} className="text-cream/90 hover:text-cream break-all">
                  {CLINIC.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 border-t border-cream/10 pt-8 text-xs text-cream/60">
          <p>
            © {new Date().getFullYear()} {CLINIC.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
