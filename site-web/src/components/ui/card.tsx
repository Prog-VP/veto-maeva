import { cn } from "@/lib/cn";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  padding?: "md" | "lg";
  as?: "div" | "article" | "section" | "li";
};

export function Card({ children, className, padding = "lg", as = "div" }: CardProps) {
  const Tag = as as React.ElementType;
  return (
    <Tag
      className={cn(
        "rounded-3xl border border-[color:var(--color-border)] bg-cream",
        padding === "md" && "p-6",
        padding === "lg" && "p-8 md:p-10",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
