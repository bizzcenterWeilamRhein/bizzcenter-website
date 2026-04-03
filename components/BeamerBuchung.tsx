'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Tarif {
  id: string;
  label: string;
  preis: number;
  beschreibung: string;
  details: string[];
}

const TARIFE: Tarif[] = [
  {
    id: 'beamer-leinwand',
    label: 'Beamer + Leinwand',
    preis: 59,
    beschreibung: 'Komplett-Set mit Stativ-Leinwand',
    details: ['Full-HD-Projektor', 'Portable Stativ-Leinwand', 'HDMI-Kabel + VGA-Adapter', 'Fernbedienung + Verlängerungskabel', 'Transporttasche'],
  },
];

// Staffelpreise (Beamer + Leinwand)
interface StaffelPreis {
  minTage: number;
  maxTage: number;
  label: string;
  gesamtpreis: number;
}

const STAFFEL_LEINWAND: StaffelPreis[] = [
  { minTage: 1, maxTage: 1, label: '1 Tag', gesamtpreis: 59 },
  { minTage: 2, maxTage: 2, label: '2 Tage', gesamtpreis: 109 },
  { minTage: 3, maxTage: 3, label: 'Wochenende (Fr–So)', gesamtpreis: 139 },
  { minTage: 4, maxTage: 7, label: 'Woche', gesamtpreis: 199 },
];

function getStaffelPreis(tarif: string, tage: number): number {
  const staffel = STAFFEL_LEINWAND;
  // Find matching tier
  for (const s of [...staffel].reverse()) {
    if (tage >= s.minTage) return s.gesamtpreis;
  }
  return staffel[0].gesamtpreis;
}


const WEEKDAYS = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function BeamerBuchung() {
  const [selectedTarif, setSelectedTarif] = useState<string>('beamer-leinwand');

  // Only one tarif now
  useEffect(() => {
    setSelectedTarif('beamer-leinwand');
  }, []);
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  const [loadingDates, setLoadingDates] = useState(false);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [selectingEnd, setSelectingEnd] = useState(false);

  // Form fields
  const [vorname, setVorname] = useState('');
  const [nachname, setNachname] = useState('');
  const [firma, setFirma] = useState('');
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');
  const [isPrivat, setIsPrivat] = useState(false);

  // Ausweis-Upload
  const [ausweisFile, setAusweisFile] = useState<File | null>(null);
  const [ausweisPreview, setAusweisPreview] = useState<string | null>(null);

  const handleAusweisChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setError('Datei zu groß (max. 10 MB)');
      return;
    }
    setAusweisFile(file);
    const reader = new FileReader();
    reader.onload = () => setAusweisPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeAusweis = () => {
    setAusweisFile(null);
    setAusweisPreview(null);
  };

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successParam, setSuccessParam] = useState(false);

  // Check URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('buchung') === 'erfolgreich') {
      setSuccessParam(true);
    }
  }, []);

  // Fetch availability
  const fetchAvailability = useCallback(async (month: number, year: number) => {
    setLoadingDates(true);
    try {
      const res = await fetch(`/api/beamer-availability?month=${month + 1}&year=${year}`);
      if (res.ok) {
        const data = await res.json();
        setBookedDates(new Set(data.bookedDates || []));
      }
    } catch {
      // Silently fail — calendar still usable
    } finally {
      setLoadingDates(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailability(viewMonth, viewYear);
  }, [viewMonth, viewYear, fetchAvailability]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = toDateStr(today);

  const tarif = TARIFE.find(t => t.id === selectedTarif);

  // Calculate days
  let tage = 1;
  if (startDate && endDate) {
    const diff = parseDate(endDate).getTime() - parseDate(startDate).getTime();
    tage = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  } else if (startDate) {
    tage = 1;
  }
  const gesamtpreis = tarif ? getStaffelPreis(selectedTarif, tage) : 0;

  // Check if within 24h
  const isShortNotice = startDate ? (parseDate(startDate).getTime() - Date.now()) < 24 * 60 * 60 * 1000 : false;

  // Calendar helpers
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const lastDayOfMonth = new Date(viewYear, viewMonth + 1, 0);
  const startWeekday = (firstDayOfMonth.getDay() + 6) % 7; // Monday = 0

  const days: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) days.push(null);
  for (let d = 1; d <= lastDayOfMonth.getDate(); d++) days.push(d);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  const getDayStr = (day: number) => `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const isDayBooked = (day: number) => bookedDates.has(getDayStr(day));
  const isDayPast = (day: number) => getDayStr(day) < todayStr;
  const isDaySelected = (day: number) => {
    const ds = getDayStr(day);
    if (!startDate) return false;
    if (!endDate) return ds === startDate;
    return ds >= startDate && ds <= endDate;
  };
  const isDayInRange = (day: number) => {
    if (!startDate || !endDate) return false;
    const ds = getDayStr(day);
    return ds > startDate && ds < endDate;
  };

  // Check if any day in range is booked
  const hasBookedInRange = (start: string, end: string): boolean => {
    const s = parseDate(start);
    const e = parseDate(end);
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      if (bookedDates.has(toDateStr(d))) return true;
    }
    return false;
  };

  const handleDayClick = (day: number) => {
    const ds = getDayStr(day);
    if (isDayPast(day) || isDayBooked(day)) return;

    if (!selectingEnd || !startDate) {
      // Start new selection
      setStartDate(ds);
      setEndDate(null);
      setSelectingEnd(true);
      setError('');
    } else {
      // Selecting end date
      if (ds < startDate) {
        // Clicked before start — reset
        setStartDate(ds);
        setEndDate(null);
        return;
      }
      if (ds === startDate) {
        // Same day = single day
        setEndDate(null);
        setSelectingEnd(false);
        return;
      }
      // Check no booked days in range
      if (hasBookedInRange(startDate, ds)) {
        setError('Im gewählten Zeitraum ist der Beamer bereits gebucht. Bitte wählen Sie einen anderen Zeitraum.');
        return;
      }
      setEndDate(ds);
      setSelectingEnd(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !selectedTarif || !vorname || !nachname || !email || !telefon) return;
    setSubmitting(true);
    setError('');

    try {
      // Prepare ausweis as base64 if uploaded
      let ausweisBase64: string | undefined;
      if (ausweisFile) {
        ausweisBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(ausweisFile);
        });
      }

      const res = await fetch('/api/beamer-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tarif: selectedTarif,
          startDate,
          endDate: endDate || startDate,
          vorname,
          nachname,
          firma: isPrivat ? '' : firma,
          email,
          telefon,
          ausweisBase64,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Fehler bei der Buchung.');
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError('Verbindungsfehler. Bitte versuchen Sie es erneut.');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = startDate && selectedTarif && vorname.length >= 2 && nachname.length >= 2 && email.includes('@') && telefon.length >= 6 && !isShortNotice;

  if (successParam) {
    return (
      <section className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-[#f0f4e8] border border-[#6b7f3e]/20 rounded-2xl p-8 text-center">
          <div className="text-4xl mb-4 text-[#6b7f3e]">✓</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Buchung erfolgreich!</h3>
          <p className="text-gray-600 mb-4">Vielen Dank! Ihre Beamer-Buchung ist bestätigt und bezahlt.</p>
          <p className="text-gray-600">Sie erhalten eine Bestätigung per E-Mail. Abholung im Kesselhaus, Am Kesselhaus 3, 79576 Weil am Rhein.</p>
          <p className="text-sm text-gray-500 mt-4">Bitte bringen Sie zur Abholung EUR 150,- Kaution (bar oder Karte) mit.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-12">
      <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Beamer buchen</h2>
        <p className="text-gray-500 mb-8">Verfügbarkeit prüfen, Paket wählen und direkt online bezahlen.</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Paket-Info (nur noch Beamer + Leinwand) */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">1. Ihr Paket</h3>
            <div className="p-5 rounded-xl border-2 border-[#6b7f3e] bg-[#f0f4e8]">
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-gray-900">Beamer + Leinwand</span>
                <span className="text-[#6b7f3e] font-bold text-lg">ab EUR 59,-</span>
              </div>
              <p className="text-sm text-gray-500 mb-3">Komplett-Set mit Stativ-Leinwand</p>
              <ul className="space-y-1">
                <li className="text-xs text-gray-600 flex items-center gap-1.5"><span className="text-[#6b7f3e]">✓</span> Full-HD-Projektor</li>
                <li className="text-xs text-gray-600 flex items-center gap-1.5"><span className="text-[#6b7f3e]">✓</span> Portable Stativ-Leinwand</li>
                <li className="text-xs text-gray-600 flex items-center gap-1.5"><span className="text-[#6b7f3e]">✓</span> HDMI-Kabel + VGA-Adapter</li>
                <li className="text-xs text-gray-600 flex items-center gap-1.5"><span className="text-[#6b7f3e]">✓</span> Fernbedienung + Verlängerungskabel</li>
                <li className="text-xs text-gray-600 flex items-center gap-1.5"><span className="text-[#6b7f3e]">✓</span> Transporttasche</li>
              </ul>
              <p className="text-xs text-gray-400 mt-2">Staffelpreise zzgl. MwSt.</p>
            </div>
          </div>

          {/* 2. Kalender */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
              2. Zeitraum wählen {selectingEnd && startDate && <span className="text-[#6b7f3e] normal-case font-normal">(Enddatum wählen oder gleichen Tag klicken für 1 Tag)</span>}
            </h3>

            <div className="border border-gray-200 rounded-xl p-4 md:p-6">
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-4">
                <button type="button" onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                </button>
                <h4 className="text-lg font-semibold text-gray-900">
                  {MONTHS[viewMonth]} {viewYear}
                  {loadingDates && <span className="ml-2 text-sm text-gray-400 font-normal">laden...</span>}
                </h4>
                <button type="button" onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>

              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {WEEKDAYS.map(d => (
                  <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
                ))}
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                  if (day === null) return <div key={`empty-${i}`} />;

                  const booked = isDayBooked(day);
                  const past = isDayPast(day);
                  const selected = isDaySelected(day);
                  const inRange = isDayInRange(day);
                  const disabled = booked || past;
                  const isStart = startDate === getDayStr(day);
                  const isEnd = endDate === getDayStr(day);

                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleDayClick(day)}
                      className={`
                        relative py-2.5 text-sm rounded-lg transition-all font-medium
                        ${disabled ? 'text-gray-300 cursor-not-allowed' : 'cursor-pointer hover:bg-[#f0f4e8]'}
                        ${booked ? 'bg-red-50 text-red-300 line-through' : ''}
                        ${selected && !inRange ? 'bg-[#6b7f3e] text-white hover:bg-[#5a6c34]' : ''}
                        ${inRange ? 'bg-[#f0f4e8] text-[#6b7f3e]' : ''}
                        ${isStart && endDate ? 'rounded-r-none' : ''}
                        ${isEnd ? 'rounded-l-none' : ''}
                        ${inRange && !isStart && !isEnd ? 'rounded-none' : ''}
                      `}
                    >
                      {day}
                      {booked && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-red-400 rounded-full" />}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex gap-4 mt-4 text-xs text-gray-500">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#6b7f3e] rounded" /> Ausgewählt</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-100 border border-red-300 rounded" /> Gebucht</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-gray-100 border border-gray-200 rounded" /> Verfügbar</span>
              </div>
            </div>

            {/* Staffelpreise */}
            <div className="mt-3 border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Mehrtages-Rabatt (Beamer + Leinwand)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-200">
                {STAFFEL_LEINWAND.map((s, i) => (
                  <div key={i} className={`px-3 py-2.5 text-center ${tage >= s.minTage && tage <= s.maxTage ? 'bg-[#f0f4e8]' : ''}`}>
                    <div className="text-xs text-gray-500">{s.label}</div>
                    <div className="font-bold text-gray-900">EUR {s.gesamtpreis},-</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selection summary */}
            {startDate && tarif && (
              <div className="mt-3 bg-[#f5f0eb] rounded-lg px-4 py-3">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-sm text-gray-600">
                      {tarif.label} — {new Date(startDate + 'T00:00').toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      {endDate && endDate !== startDate && ` bis ${new Date(endDate + 'T00:00').toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}`}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">({tage} {tage === 1 ? 'Tag' : 'Tage'})</span>
                  </div>
                  <span className="font-bold text-gray-900">EUR {gesamtpreis},- <span className="text-xs font-normal text-gray-500">zzgl. MwSt.</span></span>
                </div>
                {isShortNotice && (
                  <p className="text-amber-700 text-sm mt-2 font-medium">
                    Kurzfristige Buchungen (unter 24h) bitte telefonisch: <a href="tel:+4976219165547" className="underline">+49 7621 916 5547</a>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 3. Kontaktdaten */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">3. Ihre Daten</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" value={vorname} onChange={e => setVorname(e.target.value)} placeholder="Vorname *" required minLength={2} maxLength={100}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none" />
                <input type="text" value={nachname} onChange={e => setNachname(e.target.value)} placeholder="Nachname *" required minLength={2} maxLength={100}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-Mail *" required maxLength={255}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none" />
                <input type="tel" value={telefon} onChange={e => setTelefon(e.target.value)} placeholder="Telefon *" required minLength={6} maxLength={30}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none" />
              </div>

              {/* Privatperson Toggle */}
              <div className="flex items-center gap-3">
                <input type="checkbox" id="beamer-privat" checked={isPrivat} onChange={e => { setIsPrivat(e.target.checked); if (e.target.checked) setFirma(''); }}
                  className="w-4 h-4 text-[#6b7f3e] border-gray-300 rounded focus:ring-[#6b7f3e]" />
                <label htmlFor="beamer-privat" className="text-sm text-gray-700">Ich buche als Privatperson (keine Firma)</label>
              </div>

              {!isPrivat && (
                <input type="text" value={firma} onChange={e => setFirma(e.target.value)} placeholder="Firma (optional)" maxLength={200}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e] outline-none" />
              )}
            </div>
          </div>

          {/* 4. Ausweiskopie */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">4. Ausweiskopie (optional)</h3>
            <p className="text-sm text-gray-500 mb-3">Laden Sie ein Foto Ihres Personalausweises hoch — dann müssen Sie ihn nicht zur Abholung mitbringen.</p>
            {ausweisPreview ? (
              <div className="relative inline-block">
                <img src={ausweisPreview} alt="Ausweiskopie" className="max-h-40 rounded-lg border border-gray-200 shadow-sm" />
                <button type="button" onClick={removeAusweis} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-colors">
                  ×
                </button>
                <p className="text-xs text-[#6b7f3e] mt-1 font-medium">Ausweis hochgeladen</p>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#6b7f3e] hover:bg-[#f0f4e8]/50 transition-colors">
                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
                <span className="text-sm text-gray-500">Foto aufnehmen oder Datei wählen</span>
                <span className="text-xs text-gray-400 mt-0.5">JPG, PNG oder PDF — max. 10 MB</span>
                <input type="file" accept="image/*,.pdf" capture="environment" onChange={handleAusweisChange} className="hidden" />
              </label>
            )}
          </div>

          {/* Hinweise */}
          <div className="bg-[#f5f0eb] rounded-lg px-4 py-3 text-sm text-gray-600 space-y-1">
            <p className="font-semibold text-gray-700">Hinweise zur Abholung:</p>
            <p>Abholung im Kesselhaus, Am Kesselhaus 3, 79576 Weil am Rhein. Keine Lieferung.</p>
            <p>Bei Abholung: <strong>EUR 150,- Kaution</strong> (bar oder Karte). Kaution wird bei Rückgabe erstattet.</p>
            {!ausweisFile && (
              <p className="text-amber-700 font-medium">Falls Sie keinen Ausweis hochgeladen haben, bringen Sie bitte Ihren Personalausweis zur Abholung mit.</p>
            )}
            {ausweisFile && (
              <p className="text-[#6b7f3e] font-medium">Ausweis wurde hochgeladen — Sie müssen keinen Ausweis mitbringen.</p>
            )}
          </div>

          {error && <p className="text-red-600 text-sm bg-red-50 rounded-lg px-4 py-3">{error}</p>}

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="w-full bg-[#6b7f3e] text-white py-3.5 px-6 rounded-lg font-semibold hover:bg-[#5a6c34] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg"
          >
            {submitting ? 'Weiterleitung zu Stripe...' : isShortNotice
              ? 'Bitte telefonisch buchen'
              : `Jetzt buchen — EUR ${gesamtpreis},- zzgl. MwSt.`}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Sichere Zahlung über Stripe. Sie werden zur Zahlungsseite weitergeleitet.
          </p>
        </form>
      </div>
    </section>
  );
}
