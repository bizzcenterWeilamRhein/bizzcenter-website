"use client";

import { useState, useEffect, useRef } from "react";

const COUNTRY_TO_DIAL: Record<string, string> = {
  DE: "+49",
  CH: "+41",
  FR: "+33",
};

type Country = { code: string; flag: string; name: string; dial: string };

const TOP_COUNTRIES: Country[] = [
  { code: "DE", flag: "🇩🇪", name: "Deutschland", dial: "+49" },
  { code: "CH", flag: "🇨🇭", name: "Schweiz", dial: "+41" },
  { code: "FR", flag: "🇫🇷", name: "Frankreich", dial: "+33" },
];

const OTHER_COUNTRIES: Country[] = [
  { code: "AT", flag: "🇦🇹", name: "Österreich", dial: "+43" },
  { code: "IT", flag: "🇮🇹", name: "Italien", dial: "+39" },
  { code: "NL", flag: "🇳🇱", name: "Niederlande", dial: "+31" },
  { code: "BE", flag: "🇧🇪", name: "Belgien", dial: "+32" },
  { code: "LU", flag: "🇱🇺", name: "Luxemburg", dial: "+352" },
  { code: "ES", flag: "🇪🇸", name: "Spanien", dial: "+34" },
  { code: "PT", flag: "🇵🇹", name: "Portugal", dial: "+351" },
  { code: "GB", flag: "🇬🇧", name: "Großbritannien", dial: "+44" },
  { code: "IE", flag: "🇮🇪", name: "Irland", dial: "+353" },
  { code: "PL", flag: "🇵🇱", name: "Polen", dial: "+48" },
  { code: "CZ", flag: "🇨🇿", name: "Tschechien", dial: "+420" },
  { code: "DK", flag: "🇩🇰", name: "Dänemark", dial: "+45" },
  { code: "SE", flag: "🇸🇪", name: "Schweden", dial: "+46" },
  { code: "NO", flag: "🇳🇴", name: "Norwegen", dial: "+47" },
  { code: "FI", flag: "🇫🇮", name: "Finnland", dial: "+358" },
  { code: "GR", flag: "🇬🇷", name: "Griechenland", dial: "+30" },
  { code: "HU", flag: "🇭🇺", name: "Ungarn", dial: "+36" },
  { code: "RO", flag: "🇷🇴", name: "Rumänien", dial: "+40" },
  { code: "HR", flag: "🇭🇷", name: "Kroatien", dial: "+385" },
  { code: "SI", flag: "🇸🇮", name: "Slowenien", dial: "+386" },
  { code: "SK", flag: "🇸🇰", name: "Slowakei", dial: "+421" },
  { code: "BG", flag: "🇧🇬", name: "Bulgarien", dial: "+359" },
  { code: "TR", flag: "🇹🇷", name: "Türkei", dial: "+90" },
  { code: "RU", flag: "🇷🇺", name: "Russland", dial: "+7" },
  { code: "UA", flag: "🇺🇦", name: "Ukraine", dial: "+380" },
  { code: "US", flag: "🇺🇸", name: "USA", dial: "+1" },
  { code: "CA", flag: "🇨🇦", name: "Kanada", dial: "+1" },
];

const ALL_COUNTRIES = [...TOP_COUNTRIES, ...OTHER_COUNTRIES];

function parseE164(value: string): { dial: string; localNumber: string } {
  if (!value) return { dial: "+49", localNumber: "" };
  if (!value.startsWith("+")) {
    const digits = value.replace(/\D/g, "");
    return { dial: "+49", localNumber: digits.replace(/^0+/, "") };
  }
  const sorted = [...ALL_COUNTRIES].sort((a, b) => b.dial.length - a.dial.length);
  for (const c of sorted) {
    if (value.startsWith(c.dial)) {
      return { dial: c.dial, localNumber: value.slice(c.dial.length).replace(/\D/g, "") };
    }
  }
  return { dial: "+49", localNumber: value.replace(/[^0-9]/g, "") };
}

function joinE164(dial: string, localNumber: string): string {
  const digits = localNumber.replace(/\D/g, "").replace(/^0+/, "");
  return digits ? `${dial}${digits}` : "";
}

export interface PhoneInputProps {
  value: string;
  onChange: (e164: string) => void;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  placeholder?: string;
  inputClassName?: string;
  selectClassName?: string;
  wrapperClassName?: string;
  hasError?: boolean;
}

export default function PhoneInput({
  value,
  onChange,
  required,
  disabled,
  id,
  placeholder = "151 1234567",
  inputClassName,
  selectClassName,
  wrapperClassName,
  hasError,
}: PhoneInputProps) {
  const initial = parseE164(value);
  const [dial, setDial] = useState(initial.dial);
  const [localNumber, setLocalNumber] = useState(initial.localNumber);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const userTouched = useRef(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Geo-based default: nur setzen wenn User noch nichts angefasst hat und value leer.
  useEffect(() => {
    if (userTouched.current || value || localNumber) return;
    let cancelled = false;
    fetch("/api/geo")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || userTouched.current) return;
        const country = (data?.country || "").toUpperCase();
        const newDial = COUNTRY_TO_DIAL[country];
        if (newDial && newDial !== dial) setDial(newDial);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset search query when dropdown closes
  useEffect(() => {
    if (!isOpen) setQuery("");
  }, [isOpen]);

  // Close dropdown on click outside / Escape
  useEffect(() => {
    if (!isOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const updateDial = (newDial: string) => {
    userTouched.current = true;
    setDial(newDial);
    setIsOpen(false);
    onChange(joinE164(newDial, localNumber));
  };
  const updateNumber = (raw: string) => {
    userTouched.current = true;
    const cleaned = raw.replace(/[^\d\s\-/().]/g, "");
    setLocalNumber(cleaned);
    onChange(joinE164(dial, cleaned));
  };

  const selectedCountry =
    ALL_COUNTRIES.find((c) => c.dial === dial) ?? {
      code: "ZZ",
      flag: "🌐",
      name: "Andere",
      dial,
    };

  const q = query.trim().toLowerCase();
  const filterCountry = (c: Country) =>
    !q ||
    c.name.toLowerCase().includes(q) ||
    c.dial.toLowerCase().includes(q) ||
    c.code.toLowerCase().includes(q);
  const filteredTop = TOP_COUNTRIES.filter(filterCountry);
  const filteredOther = OTHER_COUNTRIES.filter(filterCountry);
  const noMatches = filteredTop.length === 0 && filteredOther.length === 0;
  const customDialMatch = query.trim().match(/^\+?(\d{1,4})$/);
  const customDial = customDialMatch ? "+" + customDialMatch[1] : "";

  const baseInputCls =
    inputClassName ??
    `flex-1 min-w-0 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none transition-colors ${
      hasError ? "border-red-500" : "border-gray-300"
    }`;
  const baseTriggerCls =
    selectClassName ??
    `flex items-center gap-1.5 w-24 shrink-0 px-2 py-2.5 border rounded-lg bg-white text-sm transition-colors ${
      hasError ? "border-red-500" : "border-gray-300"
    } ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer"}`;

  return (
    <div className={wrapperClassName ?? "flex gap-2"}>
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen((o) => !o)}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={`Ländervorwahl: ${selectedCountry.name} ${selectedCountry.dial}`}
          className={baseTriggerCls}
        >
          <span aria-hidden>{selectedCountry.flag}</span>
          <span className="flex-1 text-left font-medium">{selectedCountry.dial}</span>
          <span aria-hidden className="text-gray-400 text-xs">▾</span>
        </button>
        {isOpen && (
          <div className="absolute z-50 left-0 top-full mt-1 w-64 border border-gray-300 rounded-lg bg-white shadow-lg overflow-hidden">
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Land oder +Vorwahl"
                aria-label="Land oder Vorwahl suchen"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none"
              />
            </div>
            <ul role="listbox" className="max-h-60 overflow-y-auto py-1">
              {filteredTop.length > 0 && (
                <>
                  <li className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50">
                    Häufig
                  </li>
                  {filteredTop.map((c) => (
                    <li key={c.code}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={c.dial === dial}
                        onClick={() => updateDial(c.dial)}
                        className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-100 ${
                          c.dial === dial ? "bg-[#f0f4e8]" : ""
                        }`}
                      >
                        <span aria-hidden>{c.flag}</span>
                        <span className="w-14 font-medium text-sm">{c.dial}</span>
                        <span className="text-sm text-gray-700 truncate">{c.name}</span>
                      </button>
                    </li>
                  ))}
                </>
              )}
              {filteredOther.length > 0 && (
                <>
                  <li className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50 mt-1">
                    Andere Länder
                  </li>
                  {filteredOther.map((c) => (
                    <li key={`${c.code}-${c.dial}`}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={c.dial === dial}
                        onClick={() => updateDial(c.dial)}
                        className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-100 ${
                          c.dial === dial ? "bg-[#f0f4e8]" : ""
                        }`}
                      >
                        <span aria-hidden>{c.flag}</span>
                        <span className="w-14 font-medium text-sm">{c.dial}</span>
                        <span className="text-sm text-gray-700 truncate">{c.name}</span>
                      </button>
                    </li>
                  ))}
                </>
              )}
              {noMatches && !customDial && (
                <li className="px-3 py-4 text-sm text-gray-500 text-center">
                  Kein Treffer. Tippe eine Vorwahl wie <strong>+49</strong>.
                </li>
              )}
              {customDial && (
                <>
                  {!noMatches && (
                    <li className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50 mt-1">
                      Eigene Vorwahl
                    </li>
                  )}
                  <li>
                    <button
                      type="button"
                      role="option"
                      aria-selected={customDial === dial}
                      onClick={() => updateDial(customDial)}
                      className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-100 ${
                        customDial === dial ? "bg-[#f0f4e8]" : ""
                      }`}
                    >
                      <span aria-hidden>🌐</span>
                      <span className="w-14 font-medium text-sm">{customDial}</span>
                      <span className="text-sm text-gray-700 truncate">Verwenden</span>
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={localNumber}
        onChange={(e) => updateNumber(e.target.value)}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className={baseInputCls}
      />
    </div>
  );
}
