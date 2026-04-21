import type { SVGProps } from "react";

export function Horseshoe(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" {...props}>
      <path
        d="M22 22 Q22 72 50 88 Q78 72 78 22"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      <g fill="currentColor">
        <circle cx="27" cy="30" r="2.4" />
        <circle cx="25" cy="46" r="2.4" />
        <circle cx="26" cy="62" r="2.4" />
        <circle cx="33" cy="76" r="2.4" />
        <circle cx="73" cy="30" r="2.4" />
        <circle cx="75" cy="46" r="2.4" />
        <circle cx="74" cy="62" r="2.4" />
        <circle cx="67" cy="76" r="2.4" />
      </g>
    </svg>
  );
}

export function HorseHead(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" {...props}>
      <path
        d="M35 18 C30 14 32 8 38 10 L48 14 C58 10 68 16 70 28 C72 38 74 44 72 52 L68 64 C67 70 62 74 58 74 L56 80 C54 86 50 90 46 88 C42 86 40 80 42 74 L40 68 C34 64 30 56 30 46 C30 36 32 26 35 18 Z"
        fill="currentColor"
      />
      <circle cx="55" cy="38" r="2.2" fill="#f5efe6" opacity="0.9" />
    </svg>
  );
}

export function PawSimple(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" {...props}>
      <ellipse cx="50" cy="62" rx="18" ry="15" />
      <ellipse cx="26" cy="48" rx="8" ry="10" />
      <ellipse cx="74" cy="48" rx="8" ry="10" />
      <ellipse cx="36" cy="28" rx="7" ry="9" />
      <ellipse cx="64" cy="28" rx="7" ry="9" />
    </svg>
  );
}

export function Portrait(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" {...props}>
      <circle cx="50" cy="35" r="14" fill="currentColor" />
      <path
        d="M18 92 C18 72 32 60 50 60 C68 60 82 72 82 92"
        fill="currentColor"
      />
    </svg>
  );
}

export function CabinetSilhouette(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" fill="none" {...props}>
      <path
        d="M20 48 L50 22 L80 48 L80 82 L20 82 Z"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M42 82 L42 60 L58 60 L58 82"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="35" cy="58" r="2.5" fill="currentColor" />
      <circle cx="65" cy="58" r="2.5" fill="currentColor" />
    </svg>
  );
}
