'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { AngebotPrintView } from './AngebotPrintView';

/* ───────────────────────────── TYPES ───────────────────────────── */

interface AngebotData {
  slug: string;
  firma: string;
  anrede: string;
  name: string;
  ansprechpartner: string;
  ansprechpartnerTitel: string;
  ansprechpartnerTel: string;
  ansprechpartnerEmail: string;
  ansprechpartnerBild?: string;
  service: 'geschaeftsadresse' | 'servicebuero' | 'coworking';
  standort: string;
  adresse: string;
  datum: string;
  gueltigBis: string;
  heroImage?: string;
  intro?: string;
}

interface Tarif {
  id: string;
  name: string;
  label: string;
  kuendigung: string;
  priceNetto: number;
  priceBrutto: number;
  popular?: boolean;
}

interface Addon {
  id: string;
  label: string;
  description?: string;
  priceNetto: number;
  priceBrutto: number;
  unit: string;
  note?: string;
  einmalig?: boolean;
  category?: string;
}

interface Review {
  author: string;
  text: string;
  rating: number;
}

/* ───────────────────────── I18N STRINGS ─────────────────────────── */

const STRINGS = {
  de: {
    loading: 'Angebot wird geladen...',
    personalOffer: 'Persoenliches Angebot',
    yourNew: 'Ihre neue',
    serviceLabel: 'Geschaeftsadresse',
    offerValid: 'Dieses Angebot ist noch',
    day: 'Tag',
    days: 'Tage',
    validUntil: 'gueltig -- bis',
    offerExpired: 'Dieses Angebot ist abgelaufen -- Sie koennen es jederzeit verlaengern oder direkt buchen.',
    extendOffer: 'Angebot verlaengern',
    bookDirectly: 'Direkt buchen',
    introFallback: (anrede: string, vorname: string, nachname: string, standort: string, sLabel: string) =>
      `${anrede} ${vorname} ${nachname}, vielen Dank fuer Ihr Interesse am bizzcenter ${standort}. Wir freuen uns, Ihnen folgendes persoenliches Angebot fuer Ihre ${sLabel} zu unterbreiten.`.replace(/^\s+/, ''),
    offerFrom: 'Angebot vom',
    validUntilLabel: 'Gueltig bis',
    step1Title: 'Tarif waehlen',
    step1Desc: 'Je laenger die Laufzeit, desto guenstiger Ihr Monatspreis.',
    mostPopular: 'Beliebteste Wahl',
    duration: 'Laufzeit',
    perMonth: '/Monat zzgl. MwSt.',
    chosen: 'Gewaehlt',
    inclusiveTitle: 'Das ist in Ihrer',
    inclusiveTitle2: 'inklusive',
    yourAddress: 'Ihre Adresse:',
    reviewsTitle: 'Das sagen unsere Kunden',
    reviewsFooter: '4,8 Durchschnitt aus ueber 50 Google-Bewertungen',
    step2Title: 'Zusatzleistungen',
    step2Desc: 'Optional -- ueberspringen wenn nicht benoetig.',
    option: 'Option',
    options: 'Optionen',
    addonAdded: 'Hinzugebucht',
    addonAdd: 'Hinzubuchen',
    exclVat: 'zzgl. MwSt.',
    costOverview: 'Ihre Kostenuebersicht',
    tariff: 'Tarif',
    annualPrepay: 'Jahresvorauskasse',
    annualDiscount: '-10% Rabatt',
    annualDesc: 'Zahlung der monatlichen Kosten fuer 12 Monate im Voraus.',
    regularMonthly: 'Regulaer monatlich',
    monthlyWith10: 'Monatlich mit 10% Rabatt',
    annualAmount: 'Jahresbetrag',
    savingsPerYear: 'Ihre Ersparnis pro Jahr',
    monthly: 'Monatlich',
    oneTimeCosts: 'Einmalige Zusatzkosten',
    pricesExclVat: 'Alle Preise zzgl. 19% MwSt.',
    annualDiscountIncluded: '10% Rabatt bei Jahresvorauskasse bereits eingerechnet.',
    setupAndDeposit: 'Einrichtungsgebuehr (EUR 199,-) und Kaution (3 Brutto-Monatsmieten) werden nach Vertragsunterzeichnung separat in Rechnung gestellt.',
    contractTerms: 'Vertragsbedingungen einsehen',
    contractTermsTitle: 'Vertragsbedingungen Geschaeftsadresse',
    ct1Title: '1. Vertragsgegenstand',
    ct1Text: 'Die bizzcenter Weil am Rhein GmbH stellt dem Kunden eine vollumfaengliche, impressumsfaehige Geschaeftsadresse am Standort Am Kesselhaus 3, 79576 Weil am Rhein zur Verfuegung. Die Adresse darf fuer Gewerbeanmeldung, Handelsregister, Impressum und Geschaeftsverkehr verwendet werden.',
    ct2Title: '2. Leistungsumfang',
    ct2Text: 'Im Basispaket enthalten: Post- und Paketannahme, eigener Briefkasten mit Firmenbeschriftung, Nutzung der Adresse fuer alle geschaeftlichen Zwecke. Zusatzleistungen werden gesondert vereinbart.',
    ct3Title: '3. Vertragslaufzeit & Kuendigung',
    ct3Text: (label: string, kuendigung: string) => `Die Mindestvertragslaufzeit betraegt ${label}. Kuendigungsfrist: ${kuendigung}. Automatische Verlaengerung bei nicht fristgerechter Kuendigung.`,
    ct4Title: '4. Zahlungsbedingungen',
    ct4Text: 'Monatliche Vorauszahlung zum 1. des Monats. Bei Jahresvorauskasse 10% Rabatt. Alle Preise zzgl. 19% MwSt.',
    ct5Title: '5. Kaution',
    ct5Text: 'Drei Brutto-Monatsmieten, unverzinst. Wird nach Vertragsunterzeichnung separat in Rechnung gestellt. Rueckerstattung nach Vertragsende und ordnungsgemaesser Abwicklung.',
    ct6Title: '6. Einrichtungsgebuehr',
    ct6Text: 'Einmalig EUR 199,- zzgl. MwSt. Wird nach Vertragsunterzeichnung separat in Rechnung gestellt.',
    ct7Title: '7. Postbearbeitung',
    ct7Text: 'Post und Pakete werden entgegengenommen und sicher verwahrt. Weiterleitung und Scan-Services separat zubuchbar.',
    ct8Title: '8. Nutzungsbedingungen',
    ct8Text: 'Ausschliesslich legale gewerbliche Nutzung. Fristlose Kuendigung bei Missbrauch vorbehalten.',
    ct9Title: '9. Haftung',
    ct9Text: 'Haftung fuer Post/Pakete nur bei grober Fahrlaessigkeit oder Vorsatz, max. EUR 500.',
    ct10Title: '10. Datenschutz',
    ct10Text: 'Verarbeitung gemaess DSGVO, ausschliesslich zur Vertragsabwicklung.',
    ct11Title: '11. Schlussbestimmungen',
    ct11Text: 'Es gilt deutsches Recht. Gerichtsstand: Loerrach. Schriftformerfordernis fuer Aenderungen.',
    ctFooter: 'Stand: Maerz 2026 -- bizzcenter Weil am Rhein GmbH, Im Schwarzenbach 4, 79576 Weil am Rhein',
    step3Title: 'Kontaktdaten & Abschluss',
    step3Desc: 'Ihre Firmenangaben fuer den Vertrag',
    labelCompany: 'Firmenname *',
    labelLegalForm: 'Rechtsform *',
    selectPlaceholder: 'Bitte waehlen...',
    labelRepName: '(Name) *',
    repPlaceholder: (label: string) => `Name des ${label}s`,
    labelStartDate: 'Gewuenschter Starttermin *',
    startDateTooltip: 'Der Starttermin muss zwingend vor dem Notartermin der Gruendung oder Sitzverlegung liegen.',
    contactData: 'Kontaktdaten',
    labelSalutation: 'Anrede *',
    salutationPlaceholder: 'Bitte...',
    salutationMr: 'Herr',
    salutationMrs: 'Frau',
    salutationMrDr: 'Herr Dr.',
    salutationMrsDr: 'Frau Dr.',
    labelFirstName: 'Vorname *',
    placeholderFirstName: 'Vorname',
    labelLastName: 'Nachname *',
    placeholderLastName: 'Nachname',
    labelEmail: 'E-Mail *',
    placeholderEmail: 'name@firma.de',
    signatoryCheckbox: 'Ansprechpartner entspricht zeichnungsberechtigter Person',
    signatoryNote: 'Der Vertrag muss von einer zeichnungsberechtigten Person unterzeichnet werden.',
    labelSignatoryName: 'Name der zeichnungsberechtigten Person *',
    signatoryPlaceholder: (label: string) => `Name des ${label}s`,
    signatoryPlaceholderGeneric: 'Vor- und Nachname',
    labelMessage: 'Nachricht (optional)',
    placeholderMessage: 'Fragen oder Anmerkungen...',
    agbText: 'Ich akzeptiere die',
    agbLink: 'AGB',
    andText: 'und',
    contractConditions: 'Vertragsbedingungen',
    privacyConsent: 'und stimme der Verarbeitung meiner Daten gemaess',
    privacyLink: 'Datenschutzerklaerung',
    privacyEnd: 'zu. *',
    btnContract: 'Vertrag vervollstaendigen',
    btnPdf: 'Angebot als PDF speichern',
    fillAllFields: 'Bitte fuellen Sie alle Pflichtfelder aus, um den Vertrag zu erstellen.',
    almostDone: 'Fast geschafft,',
    almostDoneFallback: 'fast geschafft',
    confirmText: (sLabel: string, standort: string) => `Ihr Angebot fuer die ${sLabel} bei bizzcenter ${standort} ist erstellt. Im naechsten Schritt koennen Sie den Vertrag direkt online unterschreiben.`,
    nextStepsTitle: 'So geht\'s weiter:',
    nextStep1: 'Vertrag online pruefen und unterschreiben',
    nextStep2: 'Dokumente hochladen (Ausweis, Handelsregister etc.)',
    nextStep3: 'Zahlungsmethode ueber Stripe hinterlegen',
    nextStep4: 'Ihre Geschaeftsadresse wird zum Starttermin aktiviert',
    signContract: 'Jetzt Vertrag unterschreiben',
    questionsCall: 'Fragen? Direkt anrufen:',
    offerId: 'Angebot-ID:',
    createdOn: 'Erstellt am',
    validUntilFooter: 'Gueltig bis',
    monthlyTotal: 'Monatlich gesamt',
    stickyTariff: 'Tarif',
    details: 'Details',
    addonCategories: [
      { id: 'post', label: 'Post & Digitalisierung' },
      { id: 'coworking', label: 'Coworking & Arbeitsplatz' },
      { id: 'aufbewahrung', label: 'Aufbewahrung' },
      { id: 'parkplatz', label: 'Parken' },
      { id: 'service', label: 'Services & Extras' },
    ],
    defaultAddons: [
      { id: 'scanpaket', label: 'Scanpaket', description: 'Ihre Eingangspost wird gescannt und digital per E-Mail zugestellt.', priceNetto: 49, priceBrutto: 58.31, unit: '/Monat', category: 'post' },
      { id: 'coworking-flat', label: 'Coworking Flatrate 24/7', description: 'Unbegrenzter Zugang zum Coworking Space, rund um die Uhr.', priceNetto: 219, priceBrutto: 260.61, unit: '/Monat', category: 'coworking' },
      { id: 'coworking-rand', label: 'Coworking Randzeiten', description: 'Zugang ausserhalb der Kernzeiten (abends & Wochenende).', priceNetto: 139, priceBrutto: 165.41, unit: '/Monat', category: 'coworking' },
      { id: 'spind', label: 'Abschliessbarer Spind', description: 'Eigener Spind fuer Laptop, Unterlagen und persoenliche Dinge.', priceNetto: 19, priceBrutto: 22.61, unit: '/Monat', category: 'aufbewahrung' },
      { id: 'aktenschrank-m', label: 'Aktenschrank (mittel)', description: 'Abschliessbarer Schrank fuer Aktenordner und Dokumente.', priceNetto: 27, priceBrutto: 32.13, unit: '/Monat', category: 'aufbewahrung' },
      { id: 'aktenschrank-g', label: 'Aktenschrank (gross)', description: 'Grosser abschliessbarer Aktenschrank fuer umfangreiche Ablage.', priceNetto: 47, priceBrutto: 55.93, unit: '/Monat', category: 'aufbewahrung' },
      { id: 'parkplatz-karte', label: 'Parkkarte Areal', description: 'Flexible Parkmoeglichkeit auf dem Kesselhaus-Gelaende.', priceNetto: 49, priceBrutto: 58.31, unit: '/Monat', category: 'parkplatz' },
      { id: 'parkplatz-fest', label: 'Fester Parkplatz', description: 'Ihr eigener, reservierter Stellplatz direkt am Eingang.', priceNetto: 79, priceBrutto: 94.01, unit: '/Monat', category: 'parkplatz' },
      { id: 'bueroservice', label: 'Bueroservice', description: 'Professionelle Unterstuetzung fuer Ihre administrativen Aufgaben.', priceNetto: 69, priceBrutto: 82.11, unit: '/Stunde', category: 'service' },
      { id: 'firmenschild', label: 'Firmenschild am Eingang', description: 'Ihr Firmenname am Gebaeudeeingang -- professioneller erster Eindruck.', priceNetto: 179, priceBrutto: 213.01, unit: 'einmalig', einmalig: true, category: 'service' },
    ] as Addon[],
    defaultReviews: [
      { author: 'veprosa', rating: 5, text: 'Tolles, helles Buero in attraktiver Lage -- besser geht es nicht. Wir koennen das bizzcenter nur waermstens empfehlen!' },
      { author: 'Katja Falkenburger', rating: 5, text: 'Komfortable Raeumlichkeiten und Flexibilitaet verknuepft mit einer attraktiven, grenznahen Lage zur Schweiz und nach Frankreich.' },
      { author: 'Francesco Petrini', rating: 5, text: 'Very well organized space. Good WiFi network and easy parking. Perfect solution to work in Germany close to Switzerland.' },
    ] as Review[],
    inklusivLeistungen: [
      { label: 'Impressumsfaehige Adresse', desc: 'Vollumfaengliche, ladungsfaehige Geschaeftsadresse -- keine c/o-Adresse. Ihr Firmenname steht allein auf dem Briefkasten.' },
      { label: 'Postannahme', desc: 'Wir nehmen Ihre Geschaeftspost zuverlaessig in Ihrem Firmennamen entgegen.' },
      { label: 'Paketannahme', desc: 'Pakete werden angenommen und sicher verwahrt -- Abholung 24/7 mit eigenem Tuercode.' },
      { label: 'Kueche & Bio-Kaffee', desc: 'Bei Besuchen vor Ort: Kueche, Kaffee und Aufenthaltsraum inklusive.' },
      { label: 'Green Office', desc: 'Moderner, begruenter Arbeitsbereich im historischen Kesselhaus.' },
      { label: 'Business Community', desc: 'Zugang zum bizzcenter-Netzwerk mit regelmaessigen Events.' },
    ],
    rechtsformen: [
      { id: 'gmbh', label: 'GmbH', vertreter: 'Geschaeftsfuehrer/in' },
      { id: 'ug', label: 'UG (haftungsbeschraenkt)', vertreter: 'Geschaeftsfuehrer/in' },
      { id: 'gmbh-co-kg', label: 'GmbH & Co. KG', vertreter: 'Geschaeftsfuehrer/in' },
      { id: 'ag', label: 'AG', vertreter: 'Vorstand' },
      { id: 'ek', label: 'e.K.', vertreter: 'Inhaber/in' },
      { id: 'einzelunternehmen', label: 'Einzelunternehmen', vertreter: 'Inhaber/in' },
      { id: 'freiberufler', label: 'Freiberufler/in', vertreter: 'Inhaber/in' },
      { id: 'gbr', label: 'GbR', vertreter: 'Gesellschafter/in' },
      { id: 'ohg', label: 'OHG', vertreter: 'Gesellschafter/in' },
      { id: 'kg', label: 'KG', vertreter: 'Komplementaer/in' },
      { id: 'ev', label: 'e.V.', vertreter: 'Vorstand' },
      { id: 'sonstige', label: 'Sonstige', vertreter: 'Vertretungsberechtigte/r' },
    ],
    defaultVertreter: 'Vertretungsberechtigte/r',
  },
  en: {
    loading: 'Loading offer...',
    personalOffer: 'Personal offer',
    yourNew: 'Your new',
    serviceLabel: 'Business address',
    offerValid: 'This offer is valid for another',
    day: 'day',
    days: 'days',
    validUntil: 'valid -- until',
    offerExpired: 'This offer has expired -- you can extend it at any time or book directly.',
    extendOffer: 'Extend offer',
    bookDirectly: 'Book directly',
    introFallback: (anrede: string, vorname: string, nachname: string, standort: string, sLabel: string) =>
      `${anrede} ${vorname} ${nachname}, thank you for your interest in bizzcenter ${standort}. We are pleased to present you the following personal offer for your ${sLabel}.`.replace(/^\s+/, ''),
    offerFrom: 'Offer from',
    validUntilLabel: 'Valid until',
    step1Title: 'Choose a plan',
    step1Desc: 'The longer the term, the lower your monthly price.',
    mostPopular: 'Most popular',
    duration: 'term',
    perMonth: '/month excl. VAT',
    chosen: 'Chosen',
    inclusiveTitle: 'Included in your',
    inclusiveTitle2: '',
    yourAddress: 'Your address:',
    reviewsTitle: 'What our clients say',
    reviewsFooter: '4.8 average from over 50 Google reviews',
    step2Title: 'Add-ons',
    step2Desc: 'Optional -- skip if not needed.',
    option: 'option',
    options: 'options',
    addonAdded: 'Added',
    addonAdd: 'Add',
    exclVat: 'excl. VAT',
    costOverview: 'Your cost overview',
    tariff: 'Plan',
    annualPrepay: 'Annual prepayment',
    annualDiscount: '-10% discount',
    annualDesc: 'Payment of monthly costs for 12 months in advance.',
    regularMonthly: 'Regular monthly',
    monthlyWith10: 'Monthly with 10% discount',
    annualAmount: 'Annual amount',
    savingsPerYear: 'Your savings per year',
    monthly: 'Monthly',
    oneTimeCosts: 'One-time additional costs',
    pricesExclVat: 'All prices excl. 19% VAT.',
    annualDiscountIncluded: '10% discount for annual prepayment already included.',
    setupAndDeposit: 'Setup fee (EUR 199) and deposit (3 gross monthly rents) will be invoiced separately after signing the contract.',
    contractTerms: 'View contract terms',
    contractTermsTitle: 'Contract terms for business address',
    ct1Title: '1. Subject of the contract',
    ct1Text: 'bizzcenter Weil am Rhein GmbH provides the client with a fully compliant business address at Am Kesselhaus 3, 79576 Weil am Rhein. The address may be used for business registration, commercial register, legal notice (imprint), and business correspondence.',
    ct2Title: '2. Scope of services',
    ct2Text: 'Included in the basic package: mail and parcel acceptance, own mailbox with company labeling, use of the address for all business purposes. Additional services are agreed separately.',
    ct3Title: '3. Contract duration & termination',
    ct3Text: (label: string, kuendigung: string) => `The minimum contract term is ${label}. Notice period: ${kuendigung}. Automatic renewal if not terminated in time.`,
    ct4Title: '4. Payment terms',
    ct4Text: 'Monthly prepayment on the 1st of each month. 10% discount for annual prepayment. All prices excl. 19% VAT.',
    ct5Title: '5. Deposit',
    ct5Text: 'Three gross monthly rents, non-interest-bearing. Invoiced separately after signing the contract. Refund after contract end and proper settlement.',
    ct6Title: '6. Setup fee',
    ct6Text: 'One-time EUR 199 excl. VAT. Invoiced separately after signing the contract.',
    ct7Title: '7. Mail handling',
    ct7Text: 'Mail and parcels are received and stored securely. Forwarding and scan services can be booked separately.',
    ct8Title: '8. Terms of use',
    ct8Text: 'Exclusively legal commercial use. Immediate termination reserved in case of misuse.',
    ct9Title: '9. Liability',
    ct9Text: 'Liability for mail/parcels only in case of gross negligence or intent, max. EUR 500.',
    ct10Title: '10. Data protection',
    ct10Text: 'Processing in accordance with GDPR, exclusively for contract execution.',
    ct11Title: '11. Final provisions',
    ct11Text: 'German law applies. Jurisdiction: Loerrach. Written form required for amendments.',
    ctFooter: 'As of: March 2026 -- bizzcenter Weil am Rhein GmbH, Im Schwarzenbach 4, 79576 Weil am Rhein',
    step3Title: 'Contact details & completion',
    step3Desc: 'Your company details for the contract',
    labelCompany: 'Company name *',
    labelLegalForm: 'Legal form *',
    selectPlaceholder: 'Please select...',
    labelRepName: '(name) *',
    repPlaceholder: (label: string) => `Name of the ${label}`,
    labelStartDate: 'Desired start date *',
    startDateTooltip: 'The start date must be before the notary appointment for incorporation or registered office transfer.',
    contactData: 'Contact details',
    labelSalutation: 'Salutation *',
    salutationPlaceholder: 'Please...',
    salutationMr: 'Mr.',
    salutationMrs: 'Mrs.',
    salutationMrDr: 'Mr. Dr.',
    salutationMrsDr: 'Mrs. Dr.',
    labelFirstName: 'First name *',
    placeholderFirstName: 'First name',
    labelLastName: 'Last name *',
    placeholderLastName: 'Last name',
    labelEmail: 'Email *',
    placeholderEmail: 'name@company.com',
    signatoryCheckbox: 'Contact person is the authorized signatory',
    signatoryNote: 'The contract must be signed by an authorized signatory.',
    labelSignatoryName: 'Name of the authorized signatory *',
    signatoryPlaceholder: (label: string) => `Name of the ${label}`,
    signatoryPlaceholderGeneric: 'First and last name',
    labelMessage: 'Message (optional)',
    placeholderMessage: 'Questions or comments...',
    agbText: 'I accept the',
    agbLink: 'Terms & Conditions',
    andText: 'and',
    contractConditions: 'contract terms',
    privacyConsent: 'and agree to the processing of my data according to the',
    privacyLink: 'Privacy Policy',
    privacyEnd: '. *',
    btnContract: 'Complete contract',
    btnPdf: 'Save offer as PDF',
    fillAllFields: 'Please fill in all required fields to create the contract.',
    almostDone: 'Almost done,',
    almostDoneFallback: 'almost done',
    confirmText: (sLabel: string, standort: string) => `Your offer for the ${sLabel} at bizzcenter ${standort} has been created. In the next step, you can sign the contract directly online.`,
    nextStepsTitle: 'What happens next:',
    nextStep1: 'Review and sign the contract online',
    nextStep2: 'Upload documents (ID, commercial register, etc.)',
    nextStep3: 'Set up payment method via Stripe',
    nextStep4: 'Your business address will be activated on the start date',
    signContract: 'Sign contract now',
    questionsCall: 'Questions? Call directly:',
    offerId: 'Offer ID:',
    createdOn: 'Created on',
    validUntilFooter: 'Valid until',
    monthlyTotal: 'Monthly total',
    stickyTariff: 'Plan',
    details: 'Details',
    addonCategories: [
      { id: 'post', label: 'Mail & Digitization' },
      { id: 'coworking', label: 'Coworking & Workspace' },
      { id: 'aufbewahrung', label: 'Storage' },
      { id: 'parkplatz', label: 'Parking' },
      { id: 'service', label: 'Services & Extras' },
    ],
    defaultAddons: [
      { id: 'scanpaket', label: 'Scan package', description: 'Your incoming mail is scanned and delivered digitally by email.', priceNetto: 49, priceBrutto: 58.31, unit: '/month', category: 'post' },
      { id: 'coworking-flat', label: 'Coworking Flatrate 24/7', description: 'Unlimited access to the coworking space, around the clock.', priceNetto: 219, priceBrutto: 260.61, unit: '/month', category: 'coworking' },
      { id: 'coworking-rand', label: 'Coworking off-peak hours', description: 'Access outside core hours (evenings & weekends).', priceNetto: 139, priceBrutto: 165.41, unit: '/month', category: 'coworking' },
      { id: 'spind', label: 'Lockable locker', description: 'Your own locker for laptop, documents and personal items.', priceNetto: 19, priceBrutto: 22.61, unit: '/month', category: 'aufbewahrung' },
      { id: 'aktenschrank-m', label: 'Filing cabinet (medium)', description: 'Lockable cabinet for files and documents.', priceNetto: 27, priceBrutto: 32.13, unit: '/month', category: 'aufbewahrung' },
      { id: 'aktenschrank-g', label: 'Filing cabinet (large)', description: 'Large lockable filing cabinet for extensive storage.', priceNetto: 47, priceBrutto: 55.93, unit: '/month', category: 'aufbewahrung' },
      { id: 'parkplatz-karte', label: 'Parking card area', description: 'Flexible parking on the Kesselhaus grounds.', priceNetto: 49, priceBrutto: 58.31, unit: '/month', category: 'parkplatz' },
      { id: 'parkplatz-fest', label: 'Reserved parking spot', description: 'Your own reserved parking spot right at the entrance.', priceNetto: 79, priceBrutto: 94.01, unit: '/month', category: 'parkplatz' },
      { id: 'bueroservice', label: 'Office service', description: 'Professional support for your administrative tasks.', priceNetto: 69, priceBrutto: 82.11, unit: '/hour', category: 'service' },
      { id: 'firmenschild', label: 'Company sign at entrance', description: 'Your company name at the building entrance -- a professional first impression.', priceNetto: 179, priceBrutto: 213.01, unit: 'one-time', einmalig: true, category: 'service' },
    ] as Addon[],
    defaultReviews: [
      { author: 'veprosa', rating: 5, text: 'Great, bright office in an attractive location -- it doesn\'t get any better. We can warmly recommend bizzcenter!' },
      { author: 'Katja Falkenburger', rating: 5, text: 'Comfortable premises and flexibility combined with an attractive location close to the Swiss and French border.' },
      { author: 'Francesco Petrini', rating: 5, text: 'Very well organized space. Good WiFi network and easy parking. Perfect solution to work in Germany close to Switzerland.' },
    ] as Review[],
    inklusivLeistungen: [
      { label: 'Compliant business address', desc: 'Fully compliant, official business address -- no c/o address. Your company name stands alone on the mailbox.' },
      { label: 'Mail acceptance', desc: 'We reliably accept your business mail in your company name.' },
      { label: 'Parcel acceptance', desc: 'Parcels are accepted and stored securely -- pickup 24/7 with your own door code.' },
      { label: 'Kitchen & organic coffee', desc: 'When visiting on-site: kitchen, coffee and lounge area included.' },
      { label: 'Green Office', desc: 'Modern, green workspace in the historic Kesselhaus.' },
      { label: 'Business Community', desc: 'Access to the bizzcenter network with regular events.' },
    ],
    rechtsformen: [
      { id: 'gmbh', label: 'GmbH', vertreter: 'Managing Director' },
      { id: 'ug', label: 'UG (limited liability)', vertreter: 'Managing Director' },
      { id: 'gmbh-co-kg', label: 'GmbH & Co. KG', vertreter: 'Managing Director' },
      { id: 'ag', label: 'AG', vertreter: 'Board Member' },
      { id: 'ek', label: 'e.K.', vertreter: 'Owner' },
      { id: 'einzelunternehmen', label: 'Sole proprietorship', vertreter: 'Owner' },
      { id: 'freiberufler', label: 'Freelancer', vertreter: 'Owner' },
      { id: 'gbr', label: 'GbR', vertreter: 'Partner' },
      { id: 'ohg', label: 'OHG', vertreter: 'Partner' },
      { id: 'kg', label: 'KG', vertreter: 'General Partner' },
      { id: 'ev', label: 'e.V.', vertreter: 'Board Member' },
      { id: 'sonstige', label: 'Other', vertreter: 'Authorized Representative' },
    ],
    defaultVertreter: 'Authorized Representative',
  },
  fr: {
    loading: 'Chargement de l\'offre...',
    personalOffer: 'Offre personnelle',
    yourNew: 'Votre nouvelle',
    serviceLabel: 'Adresse commerciale',
    offerValid: 'Cette offre est encore valable',
    day: 'jour',
    days: 'jours',
    validUntil: 'valable -- jusqu\'au',
    offerExpired: 'Cette offre a expire -- vous pouvez la prolonger a tout moment ou reserver directement.',
    extendOffer: 'Prolonger l\'offre',
    bookDirectly: 'Reserver directement',
    introFallback: (anrede: string, vorname: string, nachname: string, standort: string, sLabel: string) =>
      `${anrede} ${vorname} ${nachname}, merci pour votre interet pour bizzcenter ${standort}. Nous avons le plaisir de vous soumettre l'offre personnelle suivante pour votre ${sLabel}.`.replace(/^\s+/, ''),
    offerFrom: 'Offre du',
    validUntilLabel: 'Valable jusqu\'au',
    step1Title: 'Choisir un tarif',
    step1Desc: 'Plus la duree est longue, plus le prix mensuel est avantageux.',
    mostPopular: 'Choix le plus populaire',
    duration: 'duree',
    perMonth: '/mois HT',
    chosen: 'Choisi',
    inclusiveTitle: 'Inclus dans votre',
    inclusiveTitle2: '',
    yourAddress: 'Votre adresse :',
    reviewsTitle: 'Ce que disent nos clients',
    reviewsFooter: '4,8 de moyenne sur plus de 50 avis Google',
    step2Title: 'Services supplementaires',
    step2Desc: 'Facultatif -- passez cette etape si non necessaire.',
    option: 'option',
    options: 'options',
    addonAdded: 'Ajoute',
    addonAdd: 'Ajouter',
    exclVat: 'HT',
    costOverview: 'Votre apercu des couts',
    tariff: 'Tarif',
    annualPrepay: 'Paiement annuel anticipe',
    annualDiscount: '-10% de reduction',
    annualDesc: 'Paiement des couts mensuels pour 12 mois a l\'avance.',
    regularMonthly: 'Mensuel regulier',
    monthlyWith10: 'Mensuel avec 10% de reduction',
    annualAmount: 'Montant annuel',
    savingsPerYear: 'Vos economies par an',
    monthly: 'Mensuel',
    oneTimeCosts: 'Frais supplementaires uniques',
    pricesExclVat: 'Tous les prix s\'entendent HT (TVA 19%).',
    annualDiscountIncluded: 'Reduction de 10% pour paiement annuel deja incluse.',
    setupAndDeposit: 'Les frais d\'installation (EUR 199) et la caution (3 loyers mensuels bruts) seront factures separement apres la signature du contrat.',
    contractTerms: 'Consulter les conditions contractuelles',
    contractTermsTitle: 'Conditions contractuelles adresse commerciale',
    ct1Title: '1. Objet du contrat',
    ct1Text: 'La bizzcenter Weil am Rhein GmbH met a disposition du client une adresse commerciale officielle et complete au Am Kesselhaus 3, 79576 Weil am Rhein. L\'adresse peut etre utilisee pour l\'enregistrement commercial, le registre du commerce, les mentions legales et la correspondance commerciale.',
    ct2Title: '2. Etendue des prestations',
    ct2Text: 'Le forfait de base comprend : reception du courrier et des colis, boite aux lettres propre avec inscription de l\'entreprise, utilisation de l\'adresse a toutes fins commerciales. Les prestations supplementaires font l\'objet d\'un accord separe.',
    ct3Title: '3. Duree du contrat et resiliation',
    ct3Text: (label: string, kuendigung: string) => `La duree minimale du contrat est de ${label}. Delai de preavis : ${kuendigung}. Renouvellement automatique en l'absence de resiliation dans les delais.`,
    ct4Title: '4. Conditions de paiement',
    ct4Text: 'Paiement mensuel anticipe le 1er de chaque mois. Reduction de 10% pour paiement annuel anticipe. Tous les prix s\'entendent HT (TVA 19%).',
    ct5Title: '5. Caution',
    ct5Text: 'Trois loyers mensuels bruts, sans interets. Facturee separement apres la signature du contrat. Remboursement apres la fin du contrat et le reglement conforme.',
    ct6Title: '6. Frais d\'installation',
    ct6Text: 'Une seule fois EUR 199 HT. Factures separement apres la signature du contrat.',
    ct7Title: '7. Traitement du courrier',
    ct7Text: 'Le courrier et les colis sont receptionnnes et stockes en toute securite. Les services de reexpedition et de numerisation peuvent etre reserves separement.',
    ct8Title: '8. Conditions d\'utilisation',
    ct8Text: 'Utilisation commerciale legale exclusivement. Resiliation immediate reservee en cas d\'abus.',
    ct9Title: '9. Responsabilite',
    ct9Text: 'Responsabilite pour le courrier/les colis uniquement en cas de negligence grave ou d\'intention, max. EUR 500.',
    ct10Title: '10. Protection des donnees',
    ct10Text: 'Traitement conforme au RGPD, exclusivement pour l\'execution du contrat.',
    ct11Title: '11. Dispositions finales',
    ct11Text: 'Le droit allemand s\'applique. Juridiction competente : Loerrach. Toute modification requiert la forme ecrite.',
    ctFooter: 'Etat : mars 2026 -- bizzcenter Weil am Rhein GmbH, Im Schwarzenbach 4, 79576 Weil am Rhein',
    step3Title: 'Coordonnees et conclusion',
    step3Desc: 'Les informations de votre entreprise pour le contrat',
    labelCompany: 'Nom de l\'entreprise *',
    labelLegalForm: 'Forme juridique *',
    selectPlaceholder: 'Veuillez choisir...',
    labelRepName: '(nom) *',
    repPlaceholder: (label: string) => `Nom du/de la ${label}`,
    labelStartDate: 'Date de debut souhaitee *',
    startDateTooltip: 'La date de debut doit imperativement preceder le rendez-vous chez le notaire pour la creation ou le transfert du siege social.',
    contactData: 'Coordonnees',
    labelSalutation: 'Civilite *',
    salutationPlaceholder: 'Veuillez...',
    salutationMr: 'M.',
    salutationMrs: 'Mme',
    salutationMrDr: 'M. Dr.',
    salutationMrsDr: 'Mme Dr.',
    labelFirstName: 'Prenom *',
    placeholderFirstName: 'Prenom',
    labelLastName: 'Nom *',
    placeholderLastName: 'Nom',
    labelEmail: 'E-mail *',
    placeholderEmail: 'nom@entreprise.fr',
    signatoryCheckbox: 'L\'interlocuteur est la personne habilitee a signer',
    signatoryNote: 'Le contrat doit etre signe par une personne habilitee a signer.',
    labelSignatoryName: 'Nom de la personne habilitee a signer *',
    signatoryPlaceholder: (label: string) => `Nom du/de la ${label}`,
    signatoryPlaceholderGeneric: 'Prenom et nom',
    labelMessage: 'Message (facultatif)',
    placeholderMessage: 'Questions ou remarques...',
    agbText: 'J\'accepte les',
    agbLink: 'CGV',
    andText: 'et les',
    contractConditions: 'conditions contractuelles',
    privacyConsent: 'et j\'accepte le traitement de mes donnees conformement a la',
    privacyLink: 'politique de confidentialite',
    privacyEnd: '. *',
    btnContract: 'Completer le contrat',
    btnPdf: 'Enregistrer l\'offre en PDF',
    fillAllFields: 'Veuillez remplir tous les champs obligatoires pour creer le contrat.',
    almostDone: 'Presque termine,',
    almostDoneFallback: 'presque termine',
    confirmText: (sLabel: string, standort: string) => `Votre offre pour l'${sLabel} chez bizzcenter ${standort} a ete creee. A l'etape suivante, vous pouvez signer le contrat directement en ligne.`,
    nextStepsTitle: 'La suite :',
    nextStep1: 'Verifier et signer le contrat en ligne',
    nextStep2: 'Telecharger les documents (piece d\'identite, registre du commerce, etc.)',
    nextStep3: 'Configurer le mode de paiement via Stripe',
    nextStep4: 'Votre adresse commerciale sera activee a la date de debut',
    signContract: 'Signer le contrat maintenant',
    questionsCall: 'Des questions ? Appelez directement :',
    offerId: 'ID de l\'offre :',
    createdOn: 'Creee le',
    validUntilFooter: 'Valable jusqu\'au',
    monthlyTotal: 'Total mensuel',
    stickyTariff: 'Tarif',
    details: 'Details',
    addonCategories: [
      { id: 'post', label: 'Courrier & Numerisation' },
      { id: 'coworking', label: 'Coworking & Espace de travail' },
      { id: 'aufbewahrung', label: 'Rangement' },
      { id: 'parkplatz', label: 'Stationnement' },
      { id: 'service', label: 'Services & Extras' },
    ],
    defaultAddons: [
      { id: 'scanpaket', label: 'Forfait numerisation', description: 'Votre courrier entrant est numerise et envoye par e-mail.', priceNetto: 49, priceBrutto: 58.31, unit: '/mois', category: 'post' },
      { id: 'coworking-flat', label: 'Coworking Forfait 24/7', description: 'Acces illimite a l\'espace de coworking, 24h/24.', priceNetto: 219, priceBrutto: 260.61, unit: '/mois', category: 'coworking' },
      { id: 'coworking-rand', label: 'Coworking heures creuses', description: 'Acces en dehors des heures centrales (soirs et week-ends).', priceNetto: 139, priceBrutto: 165.41, unit: '/mois', category: 'coworking' },
      { id: 'spind', label: 'Casier verrouillable', description: 'Votre propre casier pour ordinateur portable, documents et effets personnels.', priceNetto: 19, priceBrutto: 22.61, unit: '/mois', category: 'aufbewahrung' },
      { id: 'aktenschrank-m', label: 'Armoire a dossiers (moyenne)', description: 'Armoire verrouillable pour classeurs et documents.', priceNetto: 27, priceBrutto: 32.13, unit: '/mois', category: 'aufbewahrung' },
      { id: 'aktenschrank-g', label: 'Armoire a dossiers (grande)', description: 'Grande armoire verrouillable pour un rangement important.', priceNetto: 47, priceBrutto: 55.93, unit: '/mois', category: 'aufbewahrung' },
      { id: 'parkplatz-karte', label: 'Carte de stationnement', description: 'Stationnement flexible sur le terrain du Kesselhaus.', priceNetto: 49, priceBrutto: 58.31, unit: '/mois', category: 'parkplatz' },
      { id: 'parkplatz-fest', label: 'Place de parking reservee', description: 'Votre propre place de parking reservee directement a l\'entree.', priceNetto: 79, priceBrutto: 94.01, unit: '/mois', category: 'parkplatz' },
      { id: 'bueroservice', label: 'Service de bureau', description: 'Soutien professionnel pour vos taches administratives.', priceNetto: 69, priceBrutto: 82.11, unit: '/heure', category: 'service' },
      { id: 'firmenschild', label: 'Enseigne a l\'entree', description: 'Le nom de votre entreprise a l\'entree du batiment -- une premiere impression professionnelle.', priceNetto: 179, priceBrutto: 213.01, unit: 'unique', einmalig: true, category: 'service' },
    ] as Addon[],
    defaultReviews: [
      { author: 'veprosa', rating: 5, text: 'Bureau superbe et lumineux dans un emplacement attractif -- on ne peut pas faire mieux. Nous recommandons chaleureusement le bizzcenter !' },
      { author: 'Katja Falkenburger', rating: 5, text: 'Locaux confortables et flexibilite combines a un emplacement attractif, proche de la Suisse et de la France.' },
      { author: 'Francesco Petrini', rating: 5, text: 'Very well organized space. Good WiFi network and easy parking. Perfect solution to work in Germany close to Switzerland.' },
    ] as Review[],
    inklusivLeistungen: [
      { label: 'Adresse officielle', desc: 'Adresse commerciale officielle et complete -- pas d\'adresse c/o. Le nom de votre entreprise figure seul sur la boite aux lettres.' },
      { label: 'Reception du courrier', desc: 'Nous receptionnons votre courrier commercial de maniere fiable au nom de votre entreprise.' },
      { label: 'Reception des colis', desc: 'Les colis sont receptionnnes et stockes en securite -- retrait 24/7 avec votre propre code de porte.' },
      { label: 'Cuisine & cafe bio', desc: 'Lors de vos visites sur place : cuisine, cafe et salle de detente inclus.' },
      { label: 'Green Office', desc: 'Espace de travail moderne et verdoyant dans le Kesselhaus historique.' },
      { label: 'Business Community', desc: 'Acces au reseau bizzcenter avec des evenements reguliers.' },
    ],
    rechtsformen: [
      { id: 'gmbh', label: 'GmbH', vertreter: 'Gerant(e)' },
      { id: 'ug', label: 'UG (a responsabilite limitee)', vertreter: 'Gerant(e)' },
      { id: 'gmbh-co-kg', label: 'GmbH & Co. KG', vertreter: 'Gerant(e)' },
      { id: 'ag', label: 'AG', vertreter: 'Membre du directoire' },
      { id: 'ek', label: 'e.K.', vertreter: 'Proprietaire' },
      { id: 'einzelunternehmen', label: 'Entreprise individuelle', vertreter: 'Proprietaire' },
      { id: 'freiberufler', label: 'Profession liberale', vertreter: 'Proprietaire' },
      { id: 'gbr', label: 'GbR', vertreter: 'Associe(e)' },
      { id: 'ohg', label: 'OHG', vertreter: 'Associe(e)' },
      { id: 'kg', label: 'KG', vertreter: 'Commandite(e)' },
      { id: 'ev', label: 'e.V.', vertreter: 'Membre du directoire' },
      { id: 'sonstige', label: 'Autre', vertreter: 'Representant(e) autorise(e)' },
    ],
    defaultVertreter: 'Representant(e) autorise(e)',
  },
};

/* ───────────────────────── DEFAULT DATA ─────────────────────────── */

const defaultTarife: Record<string, Tarif[]> = {
  geschaeftsadresse: [
    { id: 'langzeit', name: 'Langzeit', label: '24 Monate', kuendigung: '24 Monate zum Quartalsende', priceNetto: 89, priceBrutto: 105.91 },
    { id: 'standard', name: 'Standard', label: '12 Monate', kuendigung: '12 Monate zum Quartalsende', priceNetto: 109, priceBrutto: 129.71, popular: true },
    { id: 'flex', name: 'Flex', label: '6 Monate', kuendigung: '6 Monate zum Quartalsende', priceNetto: 139, priceBrutto: 165.41 },
  ],
  servicebuero: [
    { id: 'flex', name: 'Flex', label: '6 Monate', kuendigung: '6 Monate zum Quartalsende', priceNetto: 499, priceBrutto: 593.81 },
    { id: 'standard', name: 'Standard', label: '12 Monate', kuendigung: '12 Monate zum Quartalsende', priceNetto: 449, priceBrutto: 534.31, popular: true },
    { id: 'langzeit', name: 'Langzeit', label: '24 Monate', kuendigung: '24 Monate zum Quartalsende', priceNetto: 399, priceBrutto: 474.81 },
  ],
};

/* ───────────────────────── HELPER ──────────────────────────── */

function formatCurrency(n: number) {
  // Ganzzahl -> EUR 109,- / Dezimal -> EUR 109,50
  if (n % 1 === 0) return `EUR ${n.toFixed(0)},-`;
  return `EUR ${n.toFixed(2).replace('.', ',')}`;
}

function daysUntil(dateStr: string): number {
  const [d, m, y] = dateStr.split('.').map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function StepBadge({ number, done, active }: { number: number; done: boolean; active: boolean }) {
  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shrink-0 transition-colors duration-300 ${
      done ? 'bg-[#6b7f3e] text-white' : active ? 'bg-[#6b7f3e] text-white ring-2 ring-[#6b7f3e]/30' : 'bg-[#e8e3d6] text-[#6b7f3e]'
    }`}>
      {done ? '\u2713' : number}
    </div>
  );
}

function Stars({ count }: { count: number }) {
  return <span className="text-[#6b7f3e]">{'\u2605'.repeat(count)}{'\u2606'.repeat(5 - count)}</span>;
}

/* ───────────────────────── MAIN COMPONENT ──────────────────────── */

export function AngebotFlow(props: {
  angebot: AngebotData;
  tarife?: Tarif[];
  addons?: Addon[];
  reviews?: Review[];
}) {
  const pathname = usePathname();
  const locale: 'de' | 'en' | 'fr' = pathname?.startsWith('/fr') ? 'fr' : pathname?.startsWith('/en') ? 'en' : 'de';
  const t = STRINGS[locale];

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf9f6] flex items-center justify-center"><p className="text-muted-foreground">{t.loading}</p></div>}>
      <AngebotFlowInner {...props} />
    </Suspense>
  );
}

function AngebotFlowInner({
  angebot,
  tarife,
  addons,
  reviews,
}: {
  angebot: AngebotData;
  tarife?: Tarif[];
  addons?: Addon[];
  reviews?: Review[];
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const locale: 'de' | 'en' | 'fr' = pathname?.startsWith('/fr') ? 'fr' : pathname?.startsWith('/en') ? 'en' : 'de';
  const t = STRINGS[locale];

  const tarifList = tarife || defaultTarife[angebot.service] || defaultTarife.geschaeftsadresse;
  const addonList = addons || t.defaultAddons;
  const reviewList = reviews || t.defaultReviews;
  const localAddonCategories = t.addonCategories;
  const localInklusivLeistungen = t.inklusivLeistungen;
  const localRechtsformen = t.rechtsformen;

  // URL-Parameter von LeadForm uebernehmen
  const paramAnrede = searchParams.get('anrede') || '';
  const paramVorname = searchParams.get('vorname') || '';
  const paramNachname = searchParams.get('nachname') || '';
  const paramFirma = searchParams.get('firma') || '';
  const paramEmail = searchParams.get('email') || '';
  const paramNachricht = searchParams.get('nachricht') || '';
  const paramGclid = searchParams.get('gclid') || '';
  const paramStatus = searchParams.get('status') || ''; // firma | gruendung | freiberufler

  const defaultTarifId = tarifList.find(t => t.popular)?.id || tarifList[0]?.id || null;
  const [step, setStep] = useState(defaultTarifId ? 2 : 0);
  const [selectedTarif, setSelectedTarif] = useState<string | null>(defaultTarifId);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const paramRechtsform = searchParams.get('rechtsform') || '';
  const [firmenname, setFirmenname] = useState(paramFirma || angebot.firma);
  const [rechtsform, setRechtsform] = useState(paramRechtsform);
  const [vertreterAnrede, setVertreterAnrede] = useState(paramAnrede);
  const [vertreterName, setVertreterName] = useState('');
  const [kontaktVorname, setKontaktVorname] = useState(paramVorname);
  const [kontaktNachname, setKontaktNachname] = useState(paramNachname);
  const [email, setEmail] = useState(paramEmail);
  const [starttermin, setStarttermin] = useState('');
  const [nachricht, setNachricht] = useState(paramNachricht);
  const [jahresvorauskasse, setJahresvorauskasse] = useState(false);
  const [ansprechpartnerIstZeichnungsberechtigt, setAnsprechpartnerIstZeichnungsberechtigt] = useState(false);
  const [zeichnungsName, setZeichnungsName] = useState('');
  const [agbAccepted, setAgbAccepted] = useState(false);
  const [showVertragsbedingungen, setShowVertragsbedingungen] = useState(false);
  const [openAddonCats, setOpenAddonCats] = useState<Set<string>>(new Set());

  const selectedRechtsform = localRechtsformen.find(r => r.id === rechtsform);
  const vertreterLabel = selectedRechtsform?.vertreter || t.defaultVertreter;

  const selectedTarifObj = tarifList.find(t => t.id === selectedTarif);

  // Dynamisches Gueltigkeitsdatum: Wenn via HeroForm (URL-Params), immer +30 Tage ab heute
  const isFromHeroForm = !!(paramVorname || paramNachname || paramEmail);
  const effectiveGueltigBis = React.useMemo(() => {
    if (isFromHeroForm) {
      const d = new Date();
      d.setDate(d.getDate() + 14);
      return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
    }
    return angebot.gueltigBis;
  }, [isFromHeroForm, angebot.gueltigBis]);

  const effectiveDatum = React.useMemo(() => {
    if (isFromHeroForm) {
      const d = new Date();
      return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
    }
    return angebot.datum;
  }, [isFromHeroForm, angebot.datum]);

  const remainingDays = daysUntil(effectiveGueltigBis);

  const { monatlich, monatlichNetto, monatlichRabatt, monatlichNettoRabatt, einmalig, kaution, jahresBrutto, jahresNetto } = useMemo(() => {
    if (!selectedTarifObj) return { monatlich: 0, monatlichNetto: 0, monatlichRabatt: 0, monatlichNettoRabatt: 0, einmalig: 0, kaution: 0, jahresBrutto: 0, jahresNetto: 0 };
    let monBrutto = selectedTarifObj.priceBrutto;
    let monNetto = selectedTarifObj.priceNetto;
    let ein = 0;
    selectedAddons.forEach(id => {
      const addon = addonList.find(a => a.id === id);
      if (!addon) return;
      if (addon.einmalig) ein += addon.priceBrutto;
      else { monBrutto += addon.priceBrutto; monNetto += addon.priceNetto; }
    });
    const rabattFaktor = jahresvorauskasse ? 0.9 : 1;
    return {
      monatlich: Math.round(monBrutto * 100) / 100,
      monatlichNetto: Math.round(monNetto * 100) / 100,
      monatlichRabatt: Math.round(monBrutto * rabattFaktor * 100) / 100,
      monatlichNettoRabatt: Math.round(monNetto * rabattFaktor * 100) / 100,
      einmalig: Math.round(ein * 100) / 100,
      kaution: Math.round(monBrutto * rabattFaktor * 3 * 100) / 100,
      jahresBrutto: Math.round(monBrutto * rabattFaktor * 12 * 100) / 100,
      jahresNetto: Math.round(monNetto * rabattFaktor * 12 * 100) / 100,
    };
  }, [selectedTarif, selectedAddons, selectedTarifObj, addonList, jahresvorauskasse]);

  const serviceLabel = t.serviceLabel;

  const handleTarifSelect = (id: string) => {
    setSelectedTarif(id);
    if (step < 2) setStep(2);
  };

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAddonCat = (catId: string) => {
    setOpenAddonCats(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId); else next.add(catId);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#fafaf8] angebot-print-root">
      {/* -- PRINT VIEW (hidden on screen, shown on print) -- */}
      <AngebotPrintView
        angebot={{ ...angebot, datum: effectiveDatum, gueltigBis: effectiveGueltigBis }}
        selectedTarif={selectedTarifObj || null}
        allTarife={tarifList}
        selectedAddons={selectedAddons}
        addonList={addonList}
        inklusivLeistungen={localInklusivLeistungen}
        monatlichNetto={monatlichNetto}
        einmalig={einmalig}
        kaution={kaution}
        jahresvorauskasse={jahresvorauskasse}
        monatlichNettoRabatt={monatlichNettoRabatt}
        firmenname={firmenname}
        rechtsformLabel={selectedRechtsform?.label || ''}
        vertreterName={vertreterName}
        kontakt={`${kontaktVorname} ${kontaktNachname}`.trim()}
        email={email}
      />

      {/* -- SCREEN VIEW -- */}
      <div className="angebot-screen-view">
      {/* -- HERO IMAGE -- */}
      <div className="relative h-[40vh] md:h-[50vh] overflow-hidden">
        <img
          src={angebot.heroImage || '/images/standorte/weil-am-rhein/green-office.jpg'}
          alt={`bizzcenter ${angebot.standort}`}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="mx-auto max-w-3xl">
            <p className="text-white/80 text-sm font-medium">{t.personalOffer}</p>
            <h1 className="text-xl md:text-3xl font-bold text-white mt-1">{t.yourNew} {serviceLabel}</h1>
            <p className="text-white/90 text-base md:text-xl font-semibold mt-1">{angebot.firma}</p>
            <p className="text-white/70 text-sm mt-0.5">{angebot.adresse.split(', ').map((line, i) => (<span key={i}>{i > 0 && <br />}{line}</span>))}</p>
          </div>
        </div>
      </div>

      {/* -- GUELTIGKEIT BANNER -- */}
      {remainingDays <= 14 && remainingDays > 0 && (
        <div className="bg-amber-50 border-b border-amber-200 py-2.5 px-4">
          <p className="text-center text-sm font-medium text-amber-800">
            {t.offerValid} <strong>{remainingDays} {remainingDays === 1 ? t.day : t.days}</strong> {t.validUntil} {effectiveGueltigBis}
          </p>
        </div>
      )}
      {remainingDays === 0 && (
        <div className="bg-amber-50 border-b border-amber-200 py-4 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm font-medium text-amber-800 mb-3">
              {t.offerExpired}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <button
                onClick={() => {
                  const params = new URLSearchParams(window.location.search);
                  params.set('refreshed', Date.now().toString());
                  window.location.href = `${window.location.pathname}?${params.toString()}`;
                }}
                className="inline-flex items-center justify-center rounded-lg bg-[#6b7f3e] text-white px-5 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                {t.extendOffer}
              </button>
              <a
                href={`/${angebot.service === 'geschaeftsadresse' ? 'geschaeftsadresse' : angebot.service}`}
                className="inline-flex items-center justify-center rounded-lg border border-[#6b7f3e] text-[#6b7f3e] bg-white px-5 py-2 text-sm font-semibold hover:bg-[#f0f4e8] transition-colors no-underline"
              >
                {t.bookDirectly}
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 py-6 md:py-10 space-y-6">

        {/* -- Intro + Ansprechpartner -- */}
        <div className="rounded-2xl border border-border bg-white shadow-sm p-5 md:p-8">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {angebot.intro || t.introFallback(vertreterAnrede || '', kontaktVorname || '', kontaktNachname || '', angebot.standort, serviceLabel)}
          </p>
          <div className="mt-4 flex items-center gap-3 text-sm">
            {angebot.ansprechpartnerBild ? (
              <img src={angebot.ansprechpartnerBild} alt={angebot.ansprechpartner} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#e3e7d4] flex items-center justify-center text-[#6b7f3e] font-bold text-sm">
                {angebot.ansprechpartner.split(' ').map(n => n[0]).join('')}
              </div>
            )}
            <div>
              <p className="font-semibold text-foreground">{angebot.ansprechpartner}</p>
              <p className="text-xs text-muted-foreground">{angebot.ansprechpartnerTitel} · <a href={`tel:${angebot.ansprechpartnerTel}`} className="text-[#6b7f3e]">{angebot.ansprechpartnerTel}</a></p>
            </div>
          </div>
          <div className="mt-3 text-xs text-muted-foreground flex items-center gap-4">
            <span>{t.offerFrom} {effectiveDatum}</span>
            <span>{t.validUntilLabel} {effectiveGueltigBis}</span>
          </div>
        </div>

        {/* -- SCHRITT 1: Tarif waehlen -- */}
        <div className="rounded-2xl border border-border bg-white shadow-sm p-5 md:p-8">
          <div className="flex items-center gap-4 mb-5">
            <StepBadge number={1} done={!!selectedTarif} active={!selectedTarif} />
            <div>
              <h2 className="text-lg font-bold text-foreground">{t.step1Title}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{t.step1Desc}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 items-end">
            {tarifList.map(tf => {
              const isSelected = selectedTarif === tf.id;
              return (
                <button key={tf.id} onClick={() => handleTarifSelect(tf.id)}
                  className={`rounded-xl border-2 text-center transition-all cursor-pointer relative ${
                    isSelected ? 'border-[#6b7f3e] bg-[#e3e7d4] shadow-md scale-[1.02] p-4'
                    : tf.popular ? 'border-[#6b7f3e] bg-[#f0f4e8] shadow-sm p-5 ring-2 ring-[#6b7f3e]/30'
                    : 'border-border bg-white hover:bg-[#f0f4e8] hover:border-[#6b7f3e] hover:shadow-sm p-4'
                  }`}
                >
                  {tf.popular && !isSelected && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold bg-[#6b7f3e] text-white rounded-full px-3 py-1 whitespace-nowrap shadow-sm">{t.mostPopular}</div>
                  )}
                  {isSelected && tf.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold bg-[#6b7f3e] text-white rounded-full px-3 py-1 whitespace-nowrap shadow-sm">{t.mostPopular}</div>
                  )}
                  <div className={`font-bold ${tf.popular ? 'text-lg text-[#6b7f3e]' : 'text-base text-[#6b7f3e]'}`}>{tf.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{tf.label} {t.duration}</div>
                  <div className={`font-bold text-[#1e293b] mt-3 ${tf.popular ? 'text-3xl' : 'text-2xl'}`}>{formatCurrency(tf.priceNetto)}</div>
                  <div className="text-[11px] text-muted-foreground">{t.perMonth}</div>
                  {isSelected && <div className="text-xs font-semibold mt-2 text-[#6b7f3e]">{'\u2713'} {t.chosen}</div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* -- WAS IST INKLUSIVE -- */}
        <div className="rounded-2xl border border-border bg-white shadow-sm p-5 md:p-8">
          <h2 className="text-lg font-bold text-foreground mb-4">{t.inclusiveTitle} {serviceLabel} {t.inclusiveTitle2}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {localInklusivLeistungen.map((l, i) => (
              <div key={i} className="rounded-lg bg-[#f5f5f0] p-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-5 h-5 rounded-full bg-[#6b7f3e] flex items-center justify-center text-white text-xs font-bold shrink-0">{'\u2713'}</div>
                  <div className="text-xs font-semibold text-foreground">{l.label}</div>
                </div>
                <div className="text-[10px] text-muted-foreground leading-tight">{l.desc}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-muted-foreground bg-[#f0f4e8] rounded-lg p-3">
            <strong>{t.yourAddress}</strong> {angebot.firma}, {angebot.adresse}
          </div>
        </div>

        {/* -- SOCIAL PROOF -- */}
        <div className="rounded-2xl border border-border bg-white shadow-sm p-5 md:p-8">
          <h2 className="text-lg font-bold text-foreground mb-4">{t.reviewsTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {reviewList.map((r, i) => (
              <div key={i} className="rounded-lg bg-[#f5f5f0] p-4">
                <Stars count={r.rating} />
                <p className="text-xs text-muted-foreground mt-2 italic leading-relaxed">"{r.text}"</p>
                <p className="text-xs font-semibold text-foreground mt-2">-- {r.author}</p>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-3 text-center">
            {t.reviewsFooter}
          </p>
        </div>

        {/* -- SCHRITT 2: Zusatzleistungen -- */}
        <div className={`rounded-2xl border border-border bg-white shadow-sm p-5 md:p-8 transition-opacity duration-300 ${
          !selectedTarif ? 'opacity-40 pointer-events-none' : ''
        }`}>
          <div className="flex items-center gap-4 mb-5">
            <StepBadge number={2} done={step >= 2} active={step === 1} />
            <div>
              <h2 className="text-lg font-bold text-foreground">{t.step2Title}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{t.step2Desc}</p>
            </div>
          </div>
          <div className="space-y-2">
            {localAddonCategories.map(cat => {
              const catAddons = addonList.filter(a => a.category === cat.id);
              if (catAddons.length === 0) return null;
              const isOpen = openAddonCats.has(cat.id);
              const selectedCount = catAddons.filter(a => selectedAddons.has(a.id)).length;
              return (
                <div key={cat.id} className="rounded-xl border border-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => toggleAddonCat(cat.id)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-[#f5f5f0] hover:bg-[#eeeee6] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-xs transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>{'\u25B6'}</span>
                      <span className="text-sm font-semibold text-foreground">{cat.label}</span>
                      {selectedCount > 0 && (
                        <span className="text-[10px] font-bold bg-[#6b7f3e] text-white rounded-full px-1.5 py-0.5">{selectedCount}</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{catAddons.length} {catAddons.length === 1 ? t.option : t.options}</span>
                  </button>
                  {isOpen && (
                    <div className="p-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {catAddons.map(addon => {
                        const isSelected = selectedAddons.has(addon.id);
                        return (
                          <button key={addon.id} onClick={() => toggleAddon(addon.id)}
                            className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                              isSelected ? 'border-[#6b7f3e] bg-[#e3e7d4] shadow-sm' : 'border-border bg-white hover:bg-[#f0f4e8] hover:border-[#6b7f3e]'
                            }`}
                          >
                            <div className="text-xs font-semibold text-foreground leading-tight">{addon.label}</div>
                            {addon.description && (
                              <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{addon.description}</div>
                            )}
                            <div className="text-xs font-bold text-[#1e293b] mt-1.5">{formatCurrency(addon.priceNetto)} {addon.unit}</div>
                            <div className="text-[9px] text-muted-foreground">{t.exclVat}</div>
                            <div className={`text-[10px] font-medium mt-1 ${isSelected ? 'text-[#6b7f3e]' : 'text-[#6b7f3e] opacity-40'}`}>
                              {isSelected ? `\u2713 ${t.addonAdded}` : `+ ${t.addonAdd}`}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* -- KOSTENUEBERSICHT (live) -- */}
        {selectedTarif && (
          <div className="rounded-2xl border-2 border-[#6b7f3e] bg-white shadow-sm p-5 md:p-8" id="kosten">
            <h2 className="text-lg font-bold text-foreground mb-4">{t.costOverview}</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{serviceLabel} -- {t.tariff} {selectedTarifObj?.name} ({selectedTarifObj?.label})</span>
                <span className={`font-semibold ${jahresvorauskasse ? 'line-through text-muted-foreground/50' : ''}`}>{formatCurrency(selectedTarifObj?.priceNetto || 0)} /Mon.</span>
              </div>
              {[...selectedAddons].map(id => {
                const addon = addonList.find(a => a.id === id);
                if (!addon) return null;
                return (
                  <div key={id} className="flex justify-between">
                    <span className="text-muted-foreground">{addon.label}</span>
                    <span className={`font-semibold ${jahresvorauskasse && !addon.einmalig ? 'line-through text-muted-foreground/50' : ''}`}>{formatCurrency(addon.priceNetto)} {addon.unit}</span>
                  </div>
                );
              })}

              {/* Jahresvorauskasse Option */}
              <div className="border-t border-border pt-3 mt-3">
                <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-border p-3 hover:bg-[#f0f4e8] transition-colors">
                  <input type="checkbox" checked={jahresvorauskasse} onChange={e => setJahresvorauskasse(e.target.checked)}
                    className="accent-[#6b7f3e] w-4 h-4" />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-foreground">{t.annualPrepay}</span>
                    <span className="ml-2 text-xs font-bold text-[#6b7f3e] bg-[#e3e7d4] rounded-full px-2 py-0.5">{t.annualDiscount}</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{t.annualDesc}</p>
                  </div>
                </label>
              </div>

              <table className="w-full border-t border-border mt-3 pt-3" style={{ borderCollapse: 'collapse' }}>
                <tbody>
                  {jahresvorauskasse ? (
                    <>
                      <tr>
                        <td className="py-1 text-xs text-muted-foreground">{t.regularMonthly}</td>
                        <td className="py-1 text-xs text-muted-foreground text-right line-through">{formatCurrency(monatlichNetto)}</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-sm font-bold text-foreground">{t.monthlyWith10}</td>
                        <td className="py-1 text-sm font-bold text-[#6b7f3e] text-right">{formatCurrency(monatlichNettoRabatt)}</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-sm font-semibold text-foreground">{t.annualAmount}</td>
                        <td className="py-1 text-sm font-semibold text-[#6b7f3e] text-right">{formatCurrency(jahresNetto)}</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-xs text-[#6b7f3e] font-medium">{t.savingsPerYear}</td>
                        <td className="py-1 text-xs text-[#6b7f3e] font-medium text-right">{formatCurrency(monatlichNetto * 12 - jahresNetto)}</td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td className="py-1 text-sm font-bold text-foreground">{t.monthly}</td>
                      <td className="py-1 text-sm font-bold text-[#6b7f3e] text-right">{formatCurrency(monatlichNetto)}</td>
                    </tr>
                  )}
                  {einmalig > 0 && (
                    <tr className="border-t border-dashed border-border">
                      <td className="pt-2 text-sm text-muted-foreground">{t.oneTimeCosts}</td>
                      <td className="pt-2 text-sm text-right">{formatCurrency(einmalig)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3">
              {t.pricesExclVat}{jahresvorauskasse ? ` · ${t.annualDiscountIncluded}` : ''}
              {' '}· {t.setupAndDeposit}
            </p>
          </div>
        )}

        {/* -- VERTRAGSBEDINGUNGEN (aufklappbar) -- */}
        <div className="rounded-2xl border border-border bg-white shadow-sm p-5 md:p-8">
          <button
            type="button"
            onClick={() => setShowVertragsbedingungen(!showVertragsbedingungen)}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#6b7f3e] hover:text-[#5a6b35] transition-colors cursor-pointer"
          >
            <span className={`transition-transform duration-200 text-xs ${showVertragsbedingungen ? 'rotate-90' : ''}`}>{'\u25B6'}</span>
            {t.contractTerms}
          </button>
          {showVertragsbedingungen && (
            <div className="mt-3 rounded-lg bg-[#f5f5f0] p-5 text-sm text-muted-foreground space-y-4 leading-relaxed max-h-[70vh] overflow-y-auto">
              <h4 className="font-bold text-foreground text-sm">{t.contractTermsTitle}</h4>
              <div><p className="font-semibold text-foreground">{t.ct1Title}</p><p>{t.ct1Text}</p></div>
              <div><p className="font-semibold text-foreground">{t.ct2Title}</p><p>{t.ct2Text}</p></div>
              <div><p className="font-semibold text-foreground">{t.ct3Title}</p><p>{t.ct3Text(selectedTarifObj?.label || '', selectedTarifObj?.kuendigung || '')}</p></div>
              <div><p className="font-semibold text-foreground">{t.ct4Title}</p><p>{t.ct4Text}</p></div>
              <div><p className="font-semibold text-foreground">{t.ct5Title}</p><p>{t.ct5Text}</p></div>
              <div><p className="font-semibold text-foreground">{t.ct6Title}</p><p>{t.ct6Text}</p></div>
              <div><p className="font-semibold text-foreground">{t.ct7Title}</p><p>{t.ct7Text}</p></div>
              <div><p className="font-semibold text-foreground">{t.ct8Title}</p><p>{t.ct8Text}</p></div>
              <div><p className="font-semibold text-foreground">{t.ct9Title}</p><p>{t.ct9Text}</p></div>
              <div><p className="font-semibold text-foreground">{t.ct10Title}</p><p>{t.ct10Text}</p></div>
              <div><p className="font-semibold text-foreground">{t.ct11Title}</p><p>{t.ct11Text}</p></div>
              <p className="text-[10px] italic mt-2">{t.ctFooter}</p>
            </div>
          )}
        </div>

        {/* -- SCHRITT 3: Kontaktdaten & Abschluss -- */}
        <div className={`rounded-2xl border border-border bg-white shadow-sm p-5 md:p-8 transition-opacity duration-300 ${
          step < 2 ? 'opacity-40 pointer-events-none' : ''
        }`}>
          <div className="flex items-center gap-4 mb-5">
            <StepBadge number={3} done={step >= 3} active={step === 2} />
            <div>
              <h2 className="text-lg font-bold text-foreground">{t.step3Title}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{t.step3Desc}</p>
            </div>
          </div>
          <div className="space-y-3">
            {/* Firmendaten */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">{t.labelCompany}</label>
                <input type="text" value={firmenname} onChange={e => setFirmenname(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">{t.labelLegalForm}</label>
                <select value={rechtsform} onChange={e => setRechtsform(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e] appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath d=\'M6 8L1 3h10z\' fill=\'%236b7f3e\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                >
                  <option value="">{t.selectPlaceholder}</option>
                  {localRechtsformen.map(r => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Vertretungsberechtigter -- nur Name */}
            {rechtsform && (
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">{vertreterLabel} {t.labelRepName}</label>
                <input type="text" value={vertreterName} onChange={e => setVertreterName(e.target.value)}
                  placeholder={t.repPlaceholder(vertreterLabel)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
              </div>
            )}

            {/* Starttermin */}
            <div>
              <label className="text-xs font-medium text-foreground mb-1 flex items-center gap-1.5">
                {t.labelStartDate}
                <span className="relative group">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#6b7f3e] text-white text-[10px] font-bold cursor-help">i</span>
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block w-56 bg-[#1e293b] text-white text-[10px] leading-tight rounded-lg px-3 py-2 shadow-lg z-10">
                    {t.startDateTooltip}
                  </span>
                </span>
              </label>
              <input type="date" value={starttermin} onChange={e => setStarttermin(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
            </div>

            {/* Kontaktdaten */}
            <div className="border-t border-border pt-3 mt-1">
              <p className="text-xs font-medium text-muted-foreground mb-2">{t.contactData}</p>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">{t.labelSalutation}</label>
                <select value={vertreterAnrede} onChange={e => setVertreterAnrede(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e] appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath d=\'M6 8L1 3h10z\' fill=\'%236b7f3e\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
                >
                  <option value="">{t.salutationPlaceholder}</option>
                  <option value="Herr">{t.salutationMr}</option>
                  <option value="Frau">{t.salutationMrs}</option>
                  <option value="Herr Dr.">{t.salutationMrDr}</option>
                  <option value="Frau Dr.">{t.salutationMrsDr}</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">{t.labelFirstName}</label>
                <input type="text" value={kontaktVorname} onChange={e => setKontaktVorname(e.target.value)}
                  placeholder={t.placeholderFirstName}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">{t.labelLastName}</label>
                <input type="text" value={kontaktNachname} onChange={e => setKontaktNachname(e.target.value)}
                  placeholder={t.placeholderLastName}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">{t.labelEmail}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t.placeholderEmail}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
            </div>

            {/* Zeichnungsberechtigung */}
            <div className="border-t border-border pt-3 mt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={ansprechpartnerIstZeichnungsberechtigt} onChange={e => setAnsprechpartnerIstZeichnungsberechtigt(e.target.checked)}
                  className="accent-[#6b7f3e]" />
                <span className="text-xs font-medium text-foreground">{t.signatoryCheckbox}</span>
              </label>
              {!ansprechpartnerIstZeichnungsberechtigt && (
                <div className="mt-3 rounded-lg bg-[#f5f5f0] p-3 space-y-2">
                  <p className="text-[10px] text-muted-foreground">{t.signatoryNote}</p>
                  <div>
                    <label className="text-xs font-medium text-foreground block mb-1">{t.labelSignatoryName}</label>
                    <input type="text" value={zeichnungsName} onChange={e => setZeichnungsName(e.target.value)}
                      placeholder={rechtsform ? t.signatoryPlaceholder(vertreterLabel) : t.signatoryPlaceholderGeneric}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e]" />
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">{t.labelMessage}</label>
              <textarea value={nachricht} onChange={e => setNachricht(e.target.value)} rows={2} placeholder={t.placeholderMessage}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e] resize-none" />
            </div>
            <label className="flex items-start gap-2 cursor-pointer mt-2">
              <input type="checkbox" checked={agbAccepted} onChange={e => setAgbAccepted(e.target.checked)}
                className="mt-0.5 accent-[#6b7f3e]" />
              <span className="text-xs text-muted-foreground">
                {t.agbText} <a href="/agb" className="text-[#6b7f3e] underline">{t.agbLink}</a> {t.andText} <button type="button" onClick={() => setShowVertragsbedingungen(true)} className="text-[#6b7f3e] underline cursor-pointer">{t.contractConditions}</button> {t.privacyConsent} <a href="/datenschutz" className="text-[#6b7f3e] underline">{t.privacyLink}</a> {t.privacyEnd}
              </span>
            </label>
          </div>
          {(() => {
            const allFilled = !!(firmenname && rechtsform && vertreterAnrede && vertreterName && starttermin && kontaktVorname && kontaktNachname && email && agbAccepted && (ansprechpartnerIstZeichnungsberechtigt || zeichnungsName));
            return (
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    // Lead im Hintergrund speichern (fire-and-forget)
                    fetch('/api/lead', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        firma: firmenname,
                        rechtsform,
                        name: `${kontaktVorname} ${kontaktNachname}`.trim(),
                        email,
                        tarif: selectedTarifObj?.name,
                        quelle: 'angebot-vertrag',
                        timestamp: new Date().toISOString(),
                      }),
                    }).catch(() => {});
                    const gclidParam = paramGclid ? `?gclid=${paramGclid}` : '';
                    window.location.href = `/vertrag/${angebot.slug}${gclidParam}`;
                  }}
                  disabled={!allFilled}
                  className={`flex-1 rounded-lg py-3.5 text-base font-bold transition-all ${
                    allFilled
                      ? 'bg-[#6b7f3e] text-white hover:opacity-90 shadow-sm'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {t.btnContract}
                </button>
                <button
                  onClick={async () => {
                    const el = document.querySelector('.angebot-print-view') as HTMLElement;
                    if (!el) { window.print(); return; }
                    try {
                      el.style.display = 'block';
                      const html2pdf = (await import('html2pdf.js')).default;
                      await (html2pdf() as any).set({
                        margin: [15, 20, 22, 20],
                        filename: `Angebot_Geschaeftsadresse_${firmenname || angebot.firma}.pdf`,
                        image: { type: 'jpeg', quality: 0.95 },
                        html2canvas: { scale: 2, useCORS: true, logging: false },
                        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                        pagebreak: { mode: ['css', 'legacy'], before: '.page-break' },
                      }).from(el).save();
                    } finally {
                      el.style.display = 'none';
                    }
                  }}
                  disabled={!allFilled}
                  className={`flex-1 rounded-lg py-3.5 text-base font-bold border transition-all shadow-sm ${
                    allFilled
                      ? 'border-border bg-white text-foreground hover:bg-[#f5f5f0]'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200'
                  }`}
                >
                  {t.btnPdf}
                </button>
              </div>
            );
          })()}
          {!(firmenname && rechtsform && vertreterAnrede && vertreterName && starttermin && kontaktVorname && kontaktNachname && email && agbAccepted && (ansprechpartnerIstZeichnungsberechtigt || zeichnungsName)) && (
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              {t.fillAllFields}
            </p>
          )}
        </div>

        {/* -- Bestaetigung -- */}
        {step >= 3 && (
          <div className="rounded-2xl border-2 border-[#6b7f3e] bg-[#f0f4e8] shadow-sm p-5 md:p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#6b7f3e] flex items-center justify-center text-white text-2xl font-bold mb-3">{'\u2713'}</div>
            <h2 className="text-xl font-bold text-foreground">{t.almostDone} {kontaktVorname || t.almostDoneFallback}!</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              {t.confirmText(serviceLabel, angebot.standort)}
            </p>
            <div className="mt-4 p-4 bg-white rounded-lg text-left text-sm max-w-sm mx-auto">
              <p className="font-semibold text-foreground mb-2">{t.nextStepsTitle}</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-xs">
                <li>{t.nextStep1}</li>
                <li>{t.nextStep2}</li>
                <li>{t.nextStep3}</li>
                <li>{t.nextStep4}</li>
              </ol>
            </div>
            <a
              href={`/vertrag/${angebot.slug}${paramGclid ? `?gclid=${paramGclid}` : ''}`}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#6b7f3e] text-white px-8 py-3.5 text-sm font-bold hover:opacity-90 transition-opacity shadow-sm no-underline"
            >
              {t.signContract}
            </a>
            <div className="mt-4 text-sm">
              <p className="text-muted-foreground">{t.questionsCall}</p>
              <a href={`tel:${angebot.ansprechpartnerTel}`} className="text-[#6b7f3e] font-bold text-lg">{angebot.ansprechpartnerTel}</a>
            </div>
          </div>
        )}



        {/* -- Footer -- */}
        <div className="text-center text-xs text-muted-foreground py-4">
          <p>{t.offerId} {angebot.slug} · {t.createdOn} {effectiveDatum} · {t.validUntilFooter} {effectiveGueltigBis}</p>
        </div>
      </div>

      {/* -- STICKY PREISBAR (Mobile) -- */}
      {selectedTarif && step < 3 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-border shadow-lg z-50 px-4 py-3">
          <div className="mx-auto max-w-3xl flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">{t.monthlyTotal}</div>
              <div className="text-lg font-bold text-[#6b7f3e]">{formatCurrency(jahresvorauskasse ? monatlichNettoRabatt : monatlichNetto)}</div>
              <div className="text-[10px] text-muted-foreground">{t.exclVat} · {t.stickyTariff} {selectedTarifObj?.name}{jahresvorauskasse ? ' · -10%' : ''}</div>
            </div>
            <a
              href="#kosten"
              className="rounded-lg bg-[#6b7f3e] text-white px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity no-underline"
            >
              {t.details} {'\u2192'}
            </a>
          </div>
        </div>
      )}
      </div>{/* /angebot-screen-view */}
    </div>
  );
}
