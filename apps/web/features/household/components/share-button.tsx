'use client';

import { useState } from 'react';
import { Check, Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareButtonProps {
  url: string;
  title?: string;
  text?: string;
}

export function ShareButton({
  url,
  title = 'Family Hub — Invitation',
  text = 'Rejoignez mon foyer sur Family Hub !',
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  async function handleShare() {
    if (canShare) {
      try {
        await navigator.share({ title, text, url });
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={() => void handleShare()}>
      {canShare ? (
        <>
          <Share2 className="mr-1 size-3.5" />
          Partager
        </>
      ) : copied ? (
        <>
          <Check className="mr-1 size-3.5" />
          Copié
        </>
      ) : (
        <>
          <Copy className="mr-1 size-3.5" />
          Copier le lien
        </>
      )}
    </Button>
  );
}
