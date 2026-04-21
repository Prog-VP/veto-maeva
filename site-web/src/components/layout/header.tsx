"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent, RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { NAV, CLINIC } from "@/lib/clinic";
import { cn } from "@/lib/cn";

type NavItem = (typeof NAV)[number];
type NavClickHandler = (event: MouseEvent<HTMLAnchorElement>) => void;
type MakeNavHandler = (href: string) => NavClickHandler;

const isActivePath = (href: string, pathname: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

export function Header() {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDetailsElement>(null);
  const skipScrollRestoreRef = useRef(false);
  const [open, setOpen] = useState(false);

  const closeMenu = useCallback(() => {
    menuRef.current?.removeAttribute("open");
    setOpen(false);
  }, []);

  const makeNavHandler = useCallback<MakeNavHandler>(
    (href) => (event) => {
      closeMenu();
      skipScrollRestoreRef.current = true;

      if (pathname === href) {
        event.preventDefault();
        window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 0);
      }
    },
    [closeMenu, pathname],
  );

  useBodyScrollLock(open, skipScrollRestoreRef);
  useScrollToTopOnRouteChange(pathname);

  useEffect(() => {
    closeMenu();
  }, [closeMenu, pathname]);

  return (
    <header
      data-mobile-open={open}
      className="siteHeader sticky top-0 z-[100] bg-cream border-b border-[color:var(--color-border)]"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="flex items-center justify-between py-5 md:py-5.5">
          <Link
            href="/"
            scroll
            onClick={makeNavHandler("/")}
            className="flex items-center gap-2.5"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full gradient-brand text-cream font-display text-xl font-extrabold leading-none">
              VV
            </span>
            <span className="font-display text-xl font-extrabold tracking-tight text-bark">
              Vully <span className="text-terracotta">Vétérinaire</span>
            </span>
          </Link>

          <DesktopNav pathname={pathname} makeNavHandler={makeNavHandler} />

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

      <MobileNav
        open={open}
        pathname={pathname}
        makeNavHandler={makeNavHandler}
        onClose={closeMenu}
      />
    </header>
  );
}

function DesktopNav({
  pathname,
  makeNavHandler,
}: {
  pathname: string;
  makeNavHandler: MakeNavHandler;
}) {
  return (
    <ul className="desktopNav items-center gap-1">
      {NAV.map((item) => (
        <li key={item.href}>
          <NavLink
            item={item}
            variant="desktop"
            isActive={isActivePath(item.href, pathname)}
            onClick={makeNavHandler(item.href)}
          />
        </li>
      ))}
    </ul>
  );
}

function MobileNav({
  open,
  pathname,
  makeNavHandler,
  onClose,
}: {
  open: boolean;
  pathname: string;
  makeNavHandler: MakeNavHandler;
  onClose: () => void;
}) {
  return (
    <nav
      id="mobile-nav"
      aria-hidden={!open}
      aria-label="Navigation principale"
      className="mobileNav fixed inset-0 bg-cream px-6 pb-6 pt-28"
    >
      <div className="mx-auto flex h-full max-w-7xl flex-col pt-4 sm:pt-8">
        <ul className="flex flex-col gap-2">
          {NAV.map((item) => (
            <li key={item.href}>
              <NavLink
                item={item}
                variant="mobile"
                isActive={isActivePath(item.href, pathname)}
                onClick={makeNavHandler(item.href)}
              />
            </li>
          ))}
        </ul>

        <a
          href={CLINIC.phone.href}
          onClick={onClose}
          className="mt-4 flex items-center justify-center gap-2 rounded-2xl gradient-brand px-5 py-4 font-semibold text-cream"
        >
          <Phone className="h-5 w-5" strokeWidth={2.5} />
          {CLINIC.phone.display}
        </a>
      </div>
    </nav>
  );
}

const NAV_LINK_STYLES = {
  desktop: {
    base: "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
    active: "text-coffee",
    inactive: "text-bark/70 hover:text-coffee",
  },
  mobile: {
    base: "mobileNavLink block min-w-0 rounded-2xl px-4 py-4 font-display text-xl font-extrabold leading-tight tracking-normal sm:px-5 sm:py-4.5 sm:text-2xl",
    active: "bg-coffee text-cream",
    inactive: "text-bark hover:bg-cream-dark",
  },
} as const;

function NavLink({
  item,
  variant,
  isActive,
  onClick,
}: {
  item: NavItem;
  variant: "desktop" | "mobile";
  isActive: boolean;
  onClick: NavClickHandler;
}) {
  const styles = NAV_LINK_STYLES[variant];
  const label = variant === "desktop" ? item.short : item.label;

  return (
    <Link
      href={item.href}
      scroll
      onClick={onClick}
      className={cn(styles.base, isActive ? styles.active : styles.inactive)}
    >
      {label}
      {variant === "desktop" && isActive && (
        <span className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-terracotta" />
      )}
    </Link>
  );
}

function useBodyScrollLock(locked: boolean, skipRestoreRef: RefObject<boolean>) {
  useEffect(() => {
    if (!locked) return;

    const scrollY = window.scrollY;
    const { style } = document.body;
    const previous = {
      position: style.position,
      top: style.top,
      width: style.width,
      overflow: style.overflow,
    };

    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.width = "100%";
    style.overflow = "hidden";

    return () => {
      style.position = previous.position;
      style.top = previous.top;
      style.width = previous.width;
      style.overflow = previous.overflow;
      window.scrollTo(0, skipRestoreRef.current ? 0 : scrollY);
      skipRestoreRef.current = false;
    };
  }, [locked, skipRestoreRef]);
}

function useScrollToTopOnRouteChange(pathname: string) {
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    if (window.location.hash) return;

    const scrollTop = () => window.scrollTo({ top: 0, behavior: "auto" });
    scrollTop();
    const t1 = window.setTimeout(scrollTop, 0);
    const t2 = window.setTimeout(scrollTop, 80);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [pathname]);
}
