import Link from "next/link";
import { cn } from "@/lib/cn";

const baseCls =
  "inline-flex items-center justify-center gap-2 rounded-full border-2 border-coffee/15 px-6 py-3.5 text-sm font-semibold text-coffee transition-colors hover:bg-coffee hover:text-cream";

type Props = {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
};

export function ButtonOutline({ href, children, className, external }: Props) {
  const cls = cn(baseCls, className);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}
