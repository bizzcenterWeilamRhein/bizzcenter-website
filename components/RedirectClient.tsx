'use client';

import { useEffect } from 'react';

export default function RedirectClient({ to }: { to: string }) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <p className="text-sm text-muted-foreground">
        Weiterleitung zu <a href={to} className="text-[#6b7f3e] underline">{to}</a>...
      </p>
    </div>
  );
}
