'use client';

import React, { useState, useRef, useEffect } from 'react';

export function BueroAnfrage() {
  const sectionRef = useRef<HTMLElement>(null);
  const [form, setForm] = useState({
    privat: false,
    firma: '',
    anrede: '',
    vorname: '',
    nachname: '',
    strasse: '',
    hausnummer: '',
    plz: '',
    ort: '',
    email: '',
    telefon: '',
    arbeitsplaetze: '1',
    einzug: '',
    bemerkungen: '',

  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const missingFields: string[] = [];
  if (!form.privat && !form.firma) missingFields.push('Firma');
  if (!form.anrede) missingFields.push('Anrede');
  if (!form.vorname) missingFields.push('Vorname');
  if (!form.nachname) missingFields.push('Nachname');
  if (!form.strasse) missingFields.push('Straße');
  if (!form.plz) missingFields.push('PLZ');
  if (!form.ort) missingFields.push('Ort');
  if (!form.email) missingFields.push('E-Mail');

  const canSubmit = missingFields.length === 0;

  const isMissing = (field: string) => showErrors && !form[field as keyof typeof form];

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!canSubmit) {
      setShowErrors(true);
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    try {
      await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vorname: form.vorname,
          nachname: form.nachname,
          firma: form.firma,
          telefon: form.telefon,
          email: form.email,
          quelle: 'buero-anfrage',
          product: 'privates-buero',
          nachricht: [
            form.anrede ? `Anrede: ${form.anrede}` : '',
            `Arbeitsplätze: ${form.arbeitsplaetze}`,
            form.einzug ? `Gewünschter Einzug: ${form.einzug}` : '',
            `Adresse: ${form.strasse} ${form.hausnummer}, ${form.plz} ${form.ort}`,
            form.bemerkungen ? `Bemerkungen: ${form.bemerkungen}` : '',
          ].filter(Boolean).join('\n'),
        }),
      });
    } catch { /* fire-and-forget */ }
    setSubmitted(true);
    setSubmitting(false);
    // Scroll to success message
    setTimeout(() => sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  if (submitted) {
    return (
      <section ref={sectionRef} id="buero-anfrage" className="py-12 px-4">
        <div className="max-w-2xl mx-auto text-center bg-white rounded-2xl border shadow-sm p-8">
          <div className="w-16 h-16 bg-[#f0f4e8] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#6b7f3e]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Anfrage erhalten!</h3>
          <p className="text-gray-600">Vielen Dank. Wir melden uns umgehend mit einem passenden Angebot bei Ihnen.</p>
        </div>
      </section>
    );
  }

  const formRef = useRef<HTMLFormElement>(null);

  // Smooth scroll on mobile keyboard open — single scroll, no jumps
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        // Wait for keyboard to finish opening, then scroll once
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 350);
      }
    };

    form.addEventListener('focusin', handleFocusIn);
    return () => form.removeEventListener('focusin', handleFocusIn);
  }, []);

  const inputCls = (field?: string) => `w-full h-10 px-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]/30 focus:border-[#6b7f3e] scroll-mt-32 ${field && isMissing(field) ? 'border-red-400 bg-red-50' : 'border-gray-200'}`;
  const textareaCls = (field?: string) => `w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]/30 focus:border-[#6b7f3e] resize-y scroll-mt-32 ${field && isMissing(field) ? 'border-red-400 bg-red-50' : 'border-gray-200'}`;
  const labelCls = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <section ref={sectionRef} id="buero-anfrage" className="py-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Linke Spalte: Info */}
        <div className="bg-white rounded-2xl border shadow-sm p-8 flex flex-col">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Büros in verschiedenen Größen</h2>
          <p className="text-3xl font-bold text-[#6b7f3e] mb-6">ab EUR 399,- <span className="text-base font-normal text-gray-400">zzgl. MwSt.</span></p>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-[#6b7f3e] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              Voll ausgestattet — Schreibtisch, Stuhl, Regale, Highspeed-Internet
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-[#6b7f3e] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              Sofort bezugsfertig — ab dem ersten Tag produktiv
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-[#6b7f3e] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              Ohne Makler — direkt vom Betreiber
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-[#6b7f3e] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              Ohne Investitionen — keine Einrichtungskosten
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-[#6b7f3e] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              Ohne Risiko — flexible Laufzeiten
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-[#6b7f3e] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              Nebenkosten inklusive — Strom, Heizung, Wasser, Reinigung
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-[#6b7f3e] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              24/7 Zugang — eigener Türcode
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-5 h-5 text-[#6b7f3e] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
              300m von der Schweizer Grenze — Dreiländereck Basel
            </li>
          </ul>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Optional zubuchbar</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-[#6b7f3e] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0H21M3.375 14.25h17.25" /></svg>
                Parkplatz
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-[#6b7f3e] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" /></svg>
                Kaffee-Flatrate
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-[#6b7f3e] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" /></svg>
                Konferenz- und Meetingräume in verschiedenen Größen flexibel hinzubuchen
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-[#6b7f3e] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" /></svg>
                Reinigung
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-[#6b7f3e] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" /></svg>
                Fulfillment
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Inklusive</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 text-[#6b7f3e] mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>
                Community-Events und Netzwerktreffen
              </li>
            </ul>
          </div>

          <div className="mt-6 flex-1 flex items-end">
            <img src="/images/standorte/weil-am-rhein/green-office-einzelbuero.jpg" alt="Green Office Einzelbüro im bizzcenter" className="w-full rounded-xl object-cover" style={{ maxHeight: '240px' }} />
          </div>
        </div>

        {/* Rechte Spalte: Formular */}
        <div className="bg-white rounded-2xl border shadow-sm p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Büro anfragen</h3>
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-3">

            {/* Privat-Checkbox + Firma */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input type="checkbox" checked={form.privat} onChange={e => setForm(f => ({ ...f, privat: e.target.checked, firma: e.target.checked ? '' : f.firma }))} className="accent-[#6b7f3e]" />
                <span className="text-sm text-gray-700">Ich möchte privat mieten</span>
              </label>
              {!form.privat && (
                <div>
                  <label className={labelCls}>Firma / Unternehmen *</label>
                  <input value={form.firma} onChange={e => setForm(f => ({ ...f, firma: e.target.value }))} className={inputCls('firma')} placeholder="Ihre Firma" />
                </div>
              )}
            </div>

            {/* Anrede + Name — stacked on mobile */}
            <div className="grid grid-cols-[80px_1fr] sm:grid-cols-[80px_1fr_1fr] gap-2">
              <div>
                <label className={labelCls}>Anrede *</label>
                <select value={form.anrede} onChange={e => setForm(f => ({ ...f, anrede: e.target.value }))} className={inputCls('anrede')}>
                  <option value="">—</option>
                  <option value="Herr">Herr</option>
                  <option value="Frau">Frau</option>
                  <option value="Divers">Divers</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Vorname *</label>
                <input value={form.vorname} onChange={e => setForm(f => ({ ...f, vorname: e.target.value }))} className={inputCls('vorname')} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className={labelCls}>Nachname *</label>
                <input value={form.nachname} onChange={e => setForm(f => ({ ...f, nachname: e.target.value }))} className={inputCls('nachname')} />
              </div>
            </div>

            {/* Straße + Nr */}
            <div className="grid grid-cols-[1fr_80px] sm:grid-cols-[1fr_100px] gap-2">
              <div>
                <label className={labelCls}>Straße *</label>
                <input value={form.strasse} onChange={e => setForm(f => ({ ...f, strasse: e.target.value }))} className={inputCls('strasse')} />
              </div>
              <div>
                <label className={labelCls}>Nr. *</label>
                <input value={form.hausnummer} onChange={e => setForm(f => ({ ...f, hausnummer: e.target.value }))} className={inputCls()} />
              </div>
            </div>

            {/* PLZ + Ort */}
            <div className="grid grid-cols-[100px_1fr] sm:grid-cols-[120px_1fr] gap-2">
              <div>
                <label className={labelCls}>PLZ *</label>
                <input value={form.plz} onChange={e => setForm(f => ({ ...f, plz: e.target.value }))} className={inputCls('plz')} />
              </div>
              <div>
                <label className={labelCls}>Ort *</label>
                <input value={form.ort} onChange={e => setForm(f => ({ ...f, ort: e.target.value }))} className={inputCls('ort')} />
              </div>
            </div>

            {/* E-Mail + Telefon */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className={labelCls}>E-Mail *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inputCls('email')} />
              </div>
              <div>
                <label className={labelCls}>Telefon</label>
                <input type="tel" value={form.telefon} onChange={e => setForm(f => ({ ...f, telefon: e.target.value }))} className={inputCls()} />
              </div>
            </div>

            {/* Arbeitsplätze + gewünschter Einzug */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className={labelCls}>Anzahl Arbeitsplätze *</label>
                <select value={form.arbeitsplaetze} onChange={e => setForm(f => ({ ...f, arbeitsplaetze: e.target.value }))} className={inputCls()}>
                  <option value="1">1 Arbeitsplatz</option>
                  <option value="2">2 Arbeitsplätze</option>
                  <option value="3">3 Arbeitsplätze</option>
                  <option value="4">4 Arbeitsplätze</option>
                  <option value="5+">5+ Arbeitsplätze</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Gewünschter Einzug</label>
                <input type="date" value={form.einzug} onChange={e => setForm(f => ({ ...f, einzug: e.target.value }))} className={inputCls()} />
              </div>
            </div>

            {/* Bemerkungen */}
            <div>
              <label className={labelCls}>Bemerkungen</label>
              <textarea value={form.bemerkungen} onChange={e => setForm(f => ({ ...f, bemerkungen: e.target.value }))} className={textareaCls()} rows={3} placeholder="Besondere Anforderungen, Fragen..." />
            </div>

            {/* Fehlermeldung */}
            {showErrors && missingFields.length > 0 && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                Bitte füllen Sie folgende Felder aus: <strong>{missingFields.join(', ')}</strong>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#6b7f3e] text-white py-3 rounded-xl font-semibold hover:bg-[#5a6b35] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Wird gesendet...' : 'Jetzt anfragen'}
            </button>
            <p className="text-xs text-gray-400 text-center">Wir melden uns umgehend.</p>
          </form>
        </div>

      </div>
    </section>
  );
}
