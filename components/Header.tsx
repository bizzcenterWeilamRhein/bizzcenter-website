'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface SubItem {
  label: string;
  href: string;
}

interface NavItem {
  label: string;
  href?: string;
  children?: SubItem[];
}

const navItems: NavItem[] = [
  {
    label: "Geschäftsadresse",
    children: [
      { label: "Konstanz", href: "/konstanz/geschaeftsadresse" },
      { label: "Weil am Rhein", href: "/weil-am-rhein/geschaeftsadresse" },
    ],
  },
  {
    label: "Coworking",
    children: [
      { label: "Konstanz", href: "/konstanz/coworking" },
      { label: "Weil am Rhein", href: "/weil-am-rhein/coworking" },
    ],
  },
  {
    label: "Büro mieten",
    children: [
      { label: "Konstanz", href: "/konstanz/privates-buero" },
      { label: "Weil am Rhein", href: "/weil-am-rhein/privates-buero" },
    ],
  },
  {
    label: "Konferenzräume",
    children: [
      { label: "Konstanz", href: "/konstanz/konferenzraum" },
      { label: "Weil am Rhein", href: "/weil-am-rhein/konferenzraum" },
    ],
  },
  {
    label: "Services",
    children: [
      { label: "Telefonservice", href: "/weil-am-rhein/telefonservice" },
      { label: "Schweizer Telefonnummer", href: "/weil-am-rhein/schweizer-telefonnummer" },
      { label: "Sekretariatsservice", href: "/weil-am-rhein/sekretariatsservice" },
      { label: "Fulfillment", href: "/weil-am-rhein/fulfillment" },
      { label: "Post-Bearbeitung", href: "/weil-am-rhein/post-bearbeitung" },
      { label: "Beamer mieten", href: "/weil-am-rhein/beamer-mieten" },
    ],
  },
  {
    label: "Über uns",
    href: "/ueber-uns",
  },
];

function DropdownItem({ item }: { item: NavItem }) {
  var [open, setOpen] = useState(false);

  if (!item.children) {
    return (
      <Link
        href={item.href || "/"}
        className="text-sm font-medium text-gray-600 hover:text-[var(--color-primary,#0039D1)] transition-colors px-3 py-2"
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={function() { setOpen(true); }}
      onMouseLeave={function() { setOpen(false); }}
    >
      <button
        className="text-sm font-medium text-gray-600 hover:text-[var(--color-primary,#0039D1)] transition-colors px-3 py-2 flex items-center gap-1"
        onClick={function() { setOpen(!open); }}
      >
        {item.label}
        <svg className={"w-3.5 h-3.5 transition-transform " + (open ? "rotate-180" : "")} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-0 bg-white rounded-lg shadow-lg border border-gray-100 py-2 min-w-[200px] z-50">
          {item.children.map(function(child) {
            return (
              <Link
                key={child.href}
                href={child.href}
                className="block px-4 py-2.5 text-sm text-gray-600 hover:text-[var(--color-primary,#0039D1)] hover:bg-blue-50/50 transition-colors"
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MobileNav({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  var [expandedItem, setExpandedItem] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black/20" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-72 bg-white shadow-xl p-6 overflow-y-auto">
        <div className="flex justify-end mb-6">
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col gap-1">
          {navItems.map(function(item) {
            if (!item.children) {
              return (
                <Link key={item.label} href={item.href || "/"} onClick={onClose}
                  className="text-sm font-medium text-gray-700 py-2.5 px-3 rounded-lg hover:bg-gray-50">
                  {item.label}
                </Link>
              );
            }
            var isExpanded = expandedItem === item.label;
            return (
              <div key={item.label}>
                <button
                  onClick={function() { setExpandedItem(isExpanded ? null : item.label); }}
                  className="w-full text-left text-sm font-medium text-gray-700 py-2.5 px-3 rounded-lg hover:bg-gray-50 flex items-center justify-between"
                >
                  {item.label}
                  <svg className={"w-3.5 h-3.5 transition-transform " + (isExpanded ? "rotate-180" : "")} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                {isExpanded && (
                  <div className="ml-4 border-l-2 border-gray-100 pl-3 mt-1 mb-2">
                    {item.children.map(function(child) {
                      return (
                        <Link key={child.href} href={child.href} onClick={onClose}
                          className="block text-sm text-gray-500 py-2 hover:text-[var(--color-primary,#0039D1)]">
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          <Link href="/kontakt" onClick={onClose}
            className="mt-4 text-center text-sm font-semibold py-2.5 px-4 rounded-lg bg-[var(--color-primary,#0039D1)] text-white hover:opacity-90 transition-opacity">
            Kontakt
          </Link>
        </nav>
      </div>
    </div>
  );
}

export function Header() {
  var [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <img src="/images/logo-bizzcenter.png" alt="bizzcenter" className="h-8 w-auto" />
        </Link>

        <nav className="hidden md:flex items-center">
          {navItems.map(function(item) {
            return <DropdownItem key={item.label} item={item} />;
          })}
          <Link href="/kontakt"
            className="ml-3 text-sm font-semibold py-2 px-4 rounded-lg bg-[var(--color-primary,#0039D1)] text-white hover:opacity-90 transition-opacity">
            Kontakt
          </Link>
        </nav>

        <button
          className="md:hidden p-2 text-gray-600"
          onClick={function() { setMobileOpen(true); }}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <MobileNav isOpen={mobileOpen} onClose={function() { setMobileOpen(false); }} />
      </div>
    </header>
  );
}
