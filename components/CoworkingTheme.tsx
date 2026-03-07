'use client';

import React from 'react';

const themeStyles = `
  .stats-centered [class*="stat"] { text-align: center !important; }
  .stats-centered [class*="stat"] > * { text-align: center !important; justify-content: center !important; align-items: center !important; }
  .stats-centered p, .stats-centered h2, .stats-centered h3, .stats-centered span, .stats-centered div { text-align: center !important; }
  .stats-centered { background-color: #f5f0eb !important; }
  .stats-centered section { background-color: transparent !important; }
  .stats-centered [class*="value"],
  .stats-centered [class*="stat"] h3,
  .stats-centered [class*="stat"] [class*="number"] {
    color: #6b7f3e !important;
    text-shadow: 0 2px 8px rgba(107,127,62,0.2) !important;
  }
  .coworking-theme div[class*="rounded-full"],
  .coworking-theme span[class*="rounded-full"],
  .coworking-theme .bg-primary {
    background-color: #6b7f3e !important;
    color: white !important;
  }
  .coworking-theme a[class*="bg-primary"],
  .coworking-theme button[class*="bg-primary"],
  .coworking-theme a.bg-primary,
  .coworking-theme button.bg-primary {
    background-color: #a8a29e !important;
    color: white !important;
  }
  .coworking-theme a[class*="bg-primary"]:hover,
  .coworking-theme button[class*="bg-primary"]:hover {
    background-color: #8a8380 !important;
  }
  .coworking-theme section[class*="bg-primary"] {
    background-color: #f0ece7 !important;
  }
  .coworking-theme svg[class*="text-primary"],
  .coworking-theme [class*="text-primary"] svg,
  .coworking-theme .text-primary {
    color: #6b7f3e !important;
  }
  .coworking-theme [class*="bg-primary\\/10"],
  .coworking-theme [class*="bg-primary/10"] {
    background-color: rgba(107,127,62,0.1) !important;
  }
  .coworking-theme [class*="border-primary"] {
    border-color: #6b7f3e !important;
  }
  .coworking-theme [class*="from-primary"],
  .coworking-theme [class*="to-primary"],
  .coworking-theme [class*="via-primary"] {
    --tw-gradient-from: #f0ece7 !important;
    --tw-gradient-to: #e8e3dc !important;
  }
  .coworking-theme section[class*="gradient"],
  .coworking-theme div[class*="gradient"],
  .coworking-theme [style*="gradient"] {
    background: #f5f0eb !important;
  }
  .coworking-theme section > div[class*="rounded"] {
    background: rgba(245,240,235,0.7) !important;
    border-color: #d6cfc7 !important;
  }
  .coworking-theme [style*="color: var(--color-primary"] {
    color: #6b7f3e !important;
  }
  .coworking-theme {
    --color-primary: #6b7f3e !important;
  }
`;

export function StatsTheme({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themeStyles }} />
      <div className="stats-centered">{children}</div>
    </>
  );
}

export function CoworkingTheme({ children }: { children: React.ReactNode }) {
  return <div className="coworking-theme">{children}</div>;
}
