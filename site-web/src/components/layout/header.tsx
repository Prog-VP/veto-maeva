"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { NAV, CLINIC } from "@/lib/clinic";
import { cn } from "@/lib/cn";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDetailsElement>(null);
  const shouldScrollHomeToTopRef = useRef(false);
  const [open, setOpen] = useState(false);

  const closeMenu = () => {
    menuRef.current?.removeAttribute("open");
    setOpen(false);
  };

  const scrollHomeToTop = (event?: MouseEvent<HTMLAnchorElement>) => {
    event?.preventDefault();
    shouldScrollHomeToTopRef.current = true;

    closeMenu();

    if (pathname === "/") {
      window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
      return;
    }

    router.push("/");
  };

  useEffect(() => {
    if (!open) {
      return;
    }

    const scrollY = window.scrollY;
    const { style } = document.body;
    const previousPosition = style.position;
    const previousTop = style.top;
    const previousWidth = style.width;
    const previousOverflow = style.overflow;

    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.width = "100%";
    style.overflow = "hidden";

    return () => {
      style.position = previousPosition;
      style.top = previousTop;
      style.width = previousWidth;
      style.overflow = previousOverflow;
      window.scrollTo(0, shouldScrollHomeToTopRef.current ? 0 : scrollY);
      shouldScrollHomeToTopRef.current = false;
    };
  }, [open]);

  useEffect(() => {
    closeMenu();
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/" || !shouldScrollHomeToTopRef.current) {
      return;
    }

    const scrollTop = () => window.scrollTo({ top: 0, behavior: "auto" });

    scrollTop();
    window.setTimeout(scrollTop, 0);
    window.setTimeout(scrollTop, 80);
    shouldScrollHomeToTopRef.current = false;
  }, [pathname]);

  return (
    <header
      data-mobile-open={open}
      className="siteHeader sticky top-0 z-[100] bg-cream border-b border-[color:var(--color-border)]"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="flex items-center justify-between py-5 md:py-5.5">
          <Link href="/" scroll onClick={scrollHomeToTop} className="flex items-center gap-2.5">
            <span className="flex h-12 w-12 items-center justify-center rounded-full gradient-brand text-cream font-display text-xl font-extrabold leading-none">
              VV
            </span>
            <span className="font-display text-xl font-extrabold tracking-tight text-bark">
              Vully <span className="text-terracotta">Vétérinaire</span>
            </span>
          </Link>

          <ul className="desktopNav items-center gap-1">
            {NAV.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      isActive ? "text-coffee" : "text-bark/70 hover:text-coffee",
                    )}
                  >
                    {item.short}
                    {isActive && (
                      <span className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-terracotta" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <a
              href={CLINIC.phone.href}
              className="desktopCall items-center gap-2 rounded-full gradient-brand px-5 py-2.5 text-sm font-semibold text-cream shadow-lg shadow-coffee/20"
            >
              <Phone className="h-4 w-4" strokeWidth={2.5} />
              Appeler
            </a>

            <details
              ref={menuRef}
              className="mobileMenuDetails"
              onToggle={(event) => setOpen(event.currentTarget.open)}
            >
              <summary
                aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
                aria-controls="mobile-nav"
                className="mobileToggle h-12 w-12 items-center justify-center rounded-full bg-coffee text-cream"
              >
                {open ? (
                  <X className="h-5.5 w-5.5" strokeWidth={2.5} />
                ) : (
                  <Menu className="h-5.5 w-5.5" strokeWidth={2.5} />
                )}
              </summary>
            </details>
          </div>
        </div>
      </div>

      <nav
        id="mobile-nav"
        aria-hidden={!open}
        aria-label="Navigation principale"
        className="mobileNav fixed inset-0 bg-cream px-6 pb-6 pt-28"
      >
        <div className="mx-auto flex h-full max-w-7xl flex-col pt-4 sm:pt-8">
          <ul className="flex flex-col gap-2">
            {NAV.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    scroll
                    onClick={item.href === "/" ? scrollHomeToTop : closeMenu}
                    className={cn(
                      "mobileNavLink block min-w-0 rounded-2xl px-4 py-4 font-display text-xl font-extrabold leading-tight tracking-normal sm:px-5 sm:py-4.5 sm:text-2xl",
                      isActive
                        ? "bg-coffee text-cream"
                        : "text-bark hover:bg-cream-dark",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <a
            href={CLINIC.phone.href}
            onClick={closeMenu}
            className="mt-4 flex items-center justify-center gap-2 rounded-2xl gradient-brand px-5 py-4 font-semibold text-cream"
          >
            <Phone className="h-5 w-5" strokeWidth={2.5} />
            {CLINIC.phone.display}
          </a>
        </div>
      </nav>
    </header>
  );
}
