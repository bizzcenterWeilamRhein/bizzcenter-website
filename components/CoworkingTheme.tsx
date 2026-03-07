'use client';

import React from 'react';

const statsStyles = `
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
`;

const coworkingStyles = `
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
  .coworking-theme section[class*="gradient"],
  .coworking-theme div[class*="gradient"],
  .coworking-theme [style*="gradient"] {
    background: #f5f0eb !important;
  }
  .coworking-theme [class*="from-primary"],
  .coworking-theme [class*="to-primary"],
  .coworking-theme [class*="via-primary"] {
    --tw-gradient-from: #f0ece7 !important;
    --tw-gradient-to: #e8e3dc !important;
  }
`;

export function StatsTheme({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: statsStyles }} />
      <div className="stats-centered">{children}</div>
    </>
  );
}

export function CoworkingTheme({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: coworkingStyles }} />
      <div className="coworking-theme">{children}</div>
    </>
  );
}
