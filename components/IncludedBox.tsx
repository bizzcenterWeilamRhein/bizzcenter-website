'use client';

import React from 'react';

interface IncludedBoxProps {
  title?: string;
  optionalTitle?: string;
  children: React.ReactNode;
}

export function IncludedBox({ title = 'Was im Coworking-Preis enthalten ist', optionalTitle = 'Optional hinzubuchbar', children }: IncludedBoxProps) {
  const childArray = React.Children.toArray(children);

  // Find the divider index - look for a child with props.divider or use a Divider component
  let dividerIndex = -1;
  childArray.forEach((child, i) => {
    if (React.isValidElement(child) && (child.props as any)?.divider) {
      dividerIndex = i;
    }
  });

  // If no explicit divider, split in half (6 included + rest optional)
  const includedItems = dividerIndex >= 0 ? childArray.slice(0, dividerIndex) : childArray.slice(0, 6);
  const optionalItems = dividerIndex >= 0 ? childArray.slice(dividerIndex + 1) : childArray.slice(6);

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
          {/* Included */}
          <div className="p-8 md:p-10">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-8">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {includedItems}
            </div>
          </div>
          {optionalItems.length > 0 && (
            <>
              {/* Divider */}
              <div className="border-t border-border mx-8 md:mx-10" />
              {/* Optional */}
              <div className="p-8 md:p-10">
                <h3 className="text-xl md:text-2xl font-bold text-foreground text-center mb-6">{optionalTitle}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {optionalItems}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export function IncludedDivider() {
  return <div data-divider style={{ display: 'none' }} />;
}
