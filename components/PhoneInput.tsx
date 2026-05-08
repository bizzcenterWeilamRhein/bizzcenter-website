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
  const userTouched = useRef(false);

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

  const updateDial = (newDial: string) => {
    userTouched.current = true;
    setDial(newDial);
    onChange(joinE164(newDial, localNumber));
  };
  const updateNumber = (raw: string) => {
    userTouched.current = true;
    const cleaned = raw.replace(/[^\d\s\-/().]/g, "");
    setLocalNumber(cleaned);
    onChange(joinE164(dial, cleaned));
  };

  const baseInputCls =
    inputClassName ??
    `flex-1 min-w-0 px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none transition-colors ${
      hasError ? "border-red-500" : "border-gray-300"
    }`;
  const baseSelectCls =
    selectClassName ??
    `px-2 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none bg-white text-sm ${
      hasError ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <div className={wrapperClassName ?? "flex gap-2"}>
      <select
        aria-label="Ländervorwahl"
        value={dial}
        onChange={(e) => updateDial(e.target.value)}
        disabled={disabled}
        className={baseSelectCls}
      >
        <optgroup label="Häufig">
          {TOP_COUNTRIES.map((c) => (
            <option key={c.code} value={c.dial}>
              {c.flag} {c.dial}
            </option>
          ))}
        </optgroup>
        <optgroup label="Andere Länder">
          {OTHER_COUNTRIES.map((c) => (
            <option key={`${c.code}-${c.dial}`} value={c.dial}>
              {c.flag} {c.dial} {c.name}
            </option>
          ))}
        </optgroup>
      </select>
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
