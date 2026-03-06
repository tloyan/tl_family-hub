import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageBackLinkProps {
  href: string;
  label: string;
}

export function PageBackLink({ href, label }: PageBackLinkProps) {
  return (
    <Link
      href={href}
      className="text-muted-foreground mb-4 inline-flex items-center gap-1 text-sm hover:underline"
    >
      <ArrowLeft className="size-4" />
      {label}
    </Link>
  );
}
