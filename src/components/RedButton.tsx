import Link from "next/link";

export default function RedButton({
  href,
  label,
  className = "",
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-block rounded-lg bg-[#D90429] px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#b50322] ${className}`}
    >
      {label}
    </Link>
  );
}