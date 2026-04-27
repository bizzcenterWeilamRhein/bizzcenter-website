'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';

// ─── Types ───────────────────────────────────────────────────────────

type ProductType = 'geschaeftsadresse' | 'coworking' | 'konferenzraum' | 'tagesbuero';

interface CheckoutWizardProps {
  product: ProductType;
  title?: string;
}

// ─── Stripe Price Mapping ────────────────────────────────────────────

const PRICE_MAP: Record<string, string> = {
  // Geschäftsadresse
  'ga_langzeit_ohne': 'price_1T9o4dJHXQhpcKhgA8cu5FcA',
  'ga_langzeit_mit': 'price_1T9o4eJHXQhpcKhgWi9nmIQF',
  'ga_standard_ohne': 'price_1T9o4eJHXQhpcKhgtxHqtpSm',
  'ga_standard_mit': 'price_1T9o4fJHXQhpcKhgVUSTXDQO',
  'ga_flex_ohne': 'price_1T9o4fJHXQhpcKhgOKE5WU5B',
  'ga_flex_mit': 'price_1T9o4fJHXQhpcKhgSXt3fi94',
  // Coworking
  'cw_tagespass': 'price_1T9o4gJHXQhpcKhgEvhhl86t',
  'cw_10er': 'price_1T9o4hJHXQhpcKhgQt7Bk7FH',
  'cw_monatspass': 'price_1T9o4hJHXQhpcKhgnqb5WlC4',
  'cw_monatsabo': 'price_1T9o4iJHXQhpcKhgGxLmtUuF',
  // Konferenzraum
  'konf_2pers_stunde': 'price_1T9o4iJHXQhpcKhg4f9q97J1',
  'konf_2pers_halbtags': 'price_1T9o4jJHXQhpcKhgp5AvD6QK',
  'konf_2pers_ganztags': 'price_1T9o4jJHXQhpcKhgrj6QlJGS',
  'konf_6pers_stunde': 'price_1T9o4kJHXQhpcKhgbS2UfXjY',
  'konf_6pers_halbtags': 'price_1T9o4kJHXQhpcKhgqVSqiMjy',
  'konf_6pers_ganztags': 'price_1T9o4kJHXQhpcKhgOrwa5ho1',
  'konf_15pers_stunde': 'price_1T9o4lJHXQhpcKhg1JDdKkrK',
  'konf_15pers_halbtags': 'price_1T9o4lJHXQhpcKhgjJ4IrXtw',
  'konf_15pers_ganztags': 'price_1T9o4lJHXQhpcKhgC44iUAis',
  'konf_25pers_stunde': 'price_1T9o4mJHXQhpcKhgF1yIo7oX',
  'konf_25pers_halbtags': 'price_1T9o4mJHXQhpcKhggHANaEYb',
  'konf_25pers_ganztags': 'price_1T9o4mJHXQhpcKhgrbx9LCJ8',
  // Tagesbüro
  'tb_tag': 'price_1TQlQZJHXQhpcKhghYjwFQ4i',
  'tb_woche': 'price_1TQlQZJHXQhpcKhgPr3jCNG4',
  'tb_10er': 'price_1TQlQaJHXQhpcKhgUa5EM2lK',
  'tb_monat': 'price_1TQlQaJHXQhpcKhgyHt3eikF',
  // Add-ons (monatlich)
  'addon_parkplatz': 'price_1T9o4oJHXQhpcKhgbEUDDEwb',
  'addon_parkplatz_fest': 'price_1TQlQbJHXQhpcKhgSKaCIF1e',
  'addon_kaffee': 'price_1T9o4oJHXQhpcKhgsLkqzfRu',
  'addon_monitor': 'price_1T9o4pJHXQhpcKhgyjto6kpz',
  'addon_schrank': 'price_1T9o4pJHXQhpcKhgFsScY4uu',
  'addon_scan': 'price_1T9o4qJHXQhpcKhgtzdpeiKG',
  'addon_firmenschild': 'price_1T9o4rJHXQhpcKhgKee1emBB',
  // Tagespass Add-ons (einmalig pro Tag — nur Kaffee/Monitor, kein Parkplatz)
  'addon_kaffee_tag': 'price_1T9pwHJHXQhpcKhge5UguPpX',
  'addon_monitor_tag': 'price_1TI23fJHXQhpcKhg2FiMCBEg',
};

// ─── i18n Strings ────────────────────────────────────────────────────

const STRINGS = {
  de: {
    // GA tarife
    gaTarifLabels: { langzeit: 'Langzeit', standard: 'Standard', flex: 'Flex' } as Record<string, string>,
    months: (n: number) => `${n} Monate`,
    // CW tarife
    cwTarifLabels: { tagespass: 'Tagespass', '10er': '10er-Karte', monatspass: 'Monatspass', monatsabo: 'Monatsabo' } as Record<string, string>,
    cwTarifSub: {
      tagespass: 'pro Tag',
      '10er': 'einmalig',
      monatspass: 'pro Monat · flexibel zum Monatsende kündbar',
      monatsabo: 'pro Monat · 3 Monate Kündigungsfrist',
    } as Record<string, string>,
    // Tagesbüro tarife
    tbTarifLabels: { tag: 'Einzeltag', woche: '1 Woche', '10er': '10er-Karte', monat: '1 Monat' } as Record<string, string>,
    tbTarifSub: {
      tag: 'Aktion: 79,- statt 89,-',
      woche: '5 Tage · Wochenpaket',
      '10er': '10 Tage flex · 16% Rabatt',
      monat: 'pro Monat',
    } as Record<string, string>,
    tbTarifBadges: {
      tag: '−11%',
      woche: '−12%',
      '10er': '−16%',
      monat: '',
    } as Record<string, string>,
    // Konferenzraum
    konfRoomLabels: {
      '2pers': 'Bis 2 Personen',
      '6pers': 'Bis 6 Personen',
      '15pers': 'Bis 15 Personen',
      '25pers': 'Bis 25 Personen',
    } as Record<string, string>,
    konfRoomDesc: {
      '2pers': 'Kleiner Meetingraum',
      '6pers': 'Meetingraum',
      '15pers': 'Konferenzraum',
      '25pers': 'Großer Konferenzraum',
    } as Record<string, string>,
    konfDauerLabels: {
      stunde: 'Stundenweise',
      halbtags: 'Halbtags',
      ganztags: 'Ganztags',
    } as Record<string, string>,
    // Addons
    addonLabels: {
      scan: 'Scanpaket',
      parkplatz: 'Parkkarte (flexibel)',
      parkplatz_fest: 'Fester Stellplatz',
      firmenschild: 'Firmenschild',
      kaffee: 'Kaffee-Flat',
      monitor: '27" Monitor',
      schrank: 'Aktenschrank',
      kaffee_tag: 'Kaffee-Flat',
      monitor_tag: '27" Monitor',
    } as Record<string, string>,
    priceMonthly: (amount: number) => `EUR ${amount},-/Mon.`,
    priceOneTime: (amount: number) => `EUR ${amount},- einmalig`,
    priceSimple: (amount: number) => `EUR ${amount},-`,
    // UI
    popular: 'Beliebt',
    chosen: '✓ Gewählt',
    addCta: '+ Hinzufügen',
    back: 'Zurück',
    next: 'Weiter',
    loading: 'Wird geladen...',
    bookAndPay: 'Jetzt buchen und bezahlen',
    securePayment: 'Sichere Zahlung via Stripe · SSL-verschlüsselt',
    // Errors
    errOptions: 'Bitte wählen Sie alle Optionen aus.',
    errRequired: 'Bitte füllen Sie alle Pflichtfelder aus.',
    errEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    errGeneric: 'Ein Fehler ist aufgetreten.',
    errConnection: 'Verbindungsfehler. Bitte versuchen Sie es erneut.',
    // Step labels
    stepLabelsGA: ['Postversand', 'Tarif', 'Add-ons', 'Ihre Daten'],
    stepLabelsCW: ['Tarif', 'Add-ons', 'Ihre Daten'],
    stepLabelsKonf: ['Raumgröße', 'Dauer', 'Add-ons', 'Ihre Daten'],
    stepLabelsTB: ['Tarif', 'Add-ons', 'Ihre Daten'],
    // Step headings
    gaPostTitle: 'Wie soll Ihre Post bearbeitet werden?',
    pvOhne: 'Ohne Postversand',
    pvMit: 'Mit Postversand',
    pvOhneDesc: 'Post wird vor Ort gesammelt, 24/7 abholbar',
    pvMitDesc: 'Wöchentliche Weiterleitung an eine Adresse im DACH-Raum',
    tarifWaehlen: 'Tarif wählen',
    inklPostversand: 'Inkl. Postversand',
    alleVat: 'Alle Preise zzgl. MwSt.',
    perMonthVat: '/Mon. zzgl. MwSt.',
    vatNote: 'zzgl. MwSt.',
    perHour: '/Std.',
    fromPrice: 'ab EUR',
    cwPromo: 'Einführungsaktion Green Office — 16% Rabatt bis 30.09.2026',
    raumWaehlen: 'Raumgröße wählen',
    dauerWaehlen: 'Dauer wählen',
    addonsTitle: 'Optionale Add-ons',
    addonsSub: 'Optional — können auch später hinzugebucht werden.',
    noAddons: 'Für dieses Produkt sind keine Add-ons verfügbar.',
    yourData: 'Ihre Daten',
    summary: 'Zusammenfassung',
    allVatCheckout: 'Alle Preise zzgl. MwSt. (wird im Checkout berechnet)',
    labelName: 'Name *',
    phName: 'Vor- und Nachname',
    privateCheck: 'Ich buche als Privatperson (keine Firma)',
    labelCompany: 'Firmenname *',
    phCompany: 'Musterfirma GmbH',
    labelEmail: 'E-Mail *',
    phEmail: 'mail@beispiel.de',
    summaryPostversand: 'Postversand',
    summaryMit: 'Mit Weiterleitung',
    summaryOhne: 'Ohne (Abholung)',
    summaryTarifFallback: 'Tarif',
    summaryRaumFallback: 'Raum',
    summaryTagesbuero: 'Tagesbüro',
  },
  en: {
    gaTarifLabels: { langzeit: 'Long-term', standard: 'Standard', flex: 'Flex' } as Record<string, string>,
    months: (n: number) => `${n} months`,
    cwTarifLabels: { tagespass: 'Day pass', '10er': '10-day pass', monatspass: 'Monthly pass', monatsabo: 'Monthly subscription' } as Record<string, string>,
    cwTarifSub: {
      tagespass: 'per day',
      '10er': 'one-time',
      monatspass: 'per month · cancel flexibly at month-end',
      monatsabo: 'per month · 3 months notice period',
    } as Record<string, string>,
    tbTarifLabels: { tag: 'Single day', woche: '1 week', '10er': '10-day card', monat: '1 month' } as Record<string, string>,
    tbTarifSub: {
      tag: 'Offer: 79,- instead of 89,-',
      woche: '5 days · weekly package',
      '10er': '10 flexible days · 16% discount',
      monat: 'per month',
    } as Record<string, string>,
    tbTarifBadges: {
      tag: '−11%',
      woche: '−12%',
      '10er': '−16%',
      monat: '',
    } as Record<string, string>,
    konfRoomLabels: {
      '2pers': 'Up to 2 people',
      '6pers': 'Up to 6 people',
      '15pers': 'Up to 15 people',
      '25pers': 'Up to 25 people',
    } as Record<string, string>,
    konfRoomDesc: {
      '2pers': 'Small meeting room',
      '6pers': 'Meeting room',
      '15pers': 'Conference room',
      '25pers': 'Large conference room',
    } as Record<string, string>,
    konfDauerLabels: {
      stunde: 'Hourly',
      halbtags: 'Half day',
      ganztags: 'Full day',
    } as Record<string, string>,
    addonLabels: {
      scan: 'Scan package',
      parkplatz: 'Parking card (flexible)',
      parkplatz_fest: 'Reserved parking space',
      firmenschild: 'Company sign',
      kaffee: 'Coffee flat rate',
      monitor: '27" monitor',
      schrank: 'Filing cabinet',
      kaffee_tag: 'Coffee flat rate',
      monitor_tag: '27" monitor',
    } as Record<string, string>,
    priceMonthly: (amount: number) => `EUR ${amount},-/month`,
    priceOneTime: (amount: number) => `EUR ${amount},- one-time`,
    priceSimple: (amount: number) => `EUR ${amount},-`,
    popular: 'Popular',
    chosen: '✓ Selected',
    addCta: '+ Add',
    back: 'Back',
    next: 'Next',
    loading: 'Loading...',
    bookAndPay: 'Book and pay now',
    securePayment: 'Secure payment via Stripe · SSL encrypted',
    errOptions: 'Please select all options.',
    errRequired: 'Please fill in all required fields.',
    errEmail: 'Please enter a valid email address.',
    errGeneric: 'An error occurred.',
    errConnection: 'Connection error. Please try again.',
    stepLabelsGA: ['Mail handling', 'Plan', 'Add-ons', 'Your details'],
    stepLabelsCW: ['Plan', 'Add-ons', 'Your details'],
    stepLabelsKonf: ['Room size', 'Duration', 'Add-ons', 'Your details'],
    stepLabelsTB: ['Plan', 'Add-ons', 'Your details'],
    gaPostTitle: 'How should your mail be handled?',
    pvOhne: 'Without mail forwarding',
    pvMit: 'With mail forwarding',
    pvOhneDesc: 'Mail is collected on site, accessible 24/7',
    pvMitDesc: 'Weekly forwarding to any address in the DACH region',
    tarifWaehlen: 'Choose a plan',
    inklPostversand: 'Incl. mail forwarding',
    alleVat: 'All prices excl. VAT.',
    perMonthVat: '/month excl. VAT',
    vatNote: 'excl. VAT',
    perHour: '/hour',
    fromPrice: 'from EUR',
    cwPromo: 'Introductory offer Green Office — 16% discount until 30.09.2026',
    raumWaehlen: 'Choose room size',
    dauerWaehlen: 'Choose duration',
    addonsTitle: 'Optional add-ons',
    addonsSub: 'Optional — you can add them later too.',
    noAddons: 'No add-ons available for this product.',
    yourData: 'Your details',
    summary: 'Summary',
    allVatCheckout: 'All prices excl. VAT (calculated at checkout)',
    labelName: 'Name *',
    phName: 'First and last name',
    privateCheck: 'I am booking as a private person (no company)',
    labelCompany: 'Company name *',
    phCompany: 'Example Company Ltd.',
    labelEmail: 'Email *',
    phEmail: 'mail@example.com',
    summaryPostversand: 'Mail handling',
    summaryMit: 'With forwarding',
    summaryOhne: 'Without (on-site pickup)',
    summaryTarifFallback: 'Plan',
    summaryRaumFallback: 'Room',
    summaryTagesbuero: 'Day office',
  },
  fr: {
    gaTarifLabels: { langzeit: 'Longue durée', standard: 'Standard', flex: 'Flex' } as Record<string, string>,
    months: (n: number) => `${n} mois`,
    cwTarifLabels: { tagespass: 'Pass journalier', '10er': 'Carte 10 jours', monatspass: 'Pass mensuel', monatsabo: 'Abonnement mensuel' } as Record<string, string>,
    cwTarifSub: {
      tagespass: 'par jour',
      '10er': 'une fois',
      monatspass: 'par mois · annulable de manière flexible en fin de mois',
      monatsabo: 'par mois · préavis de 3 mois',
    } as Record<string, string>,
    tbTarifLabels: { tag: 'Journée', woche: '1 semaine', '10er': 'Carte 10 jours', monat: '1 mois' } as Record<string, string>,
    tbTarifSub: {
      tag: 'Promo : 79,- au lieu de 89,-',
      woche: '5 jours · forfait semaine',
      '10er': '10 jours flexibles · 16% de remise',
      monat: 'par mois',
    } as Record<string, string>,
    tbTarifBadges: {
      tag: '−11%',
      woche: '−12%',
      '10er': '−16%',
      monat: '',
    } as Record<string, string>,
    konfRoomLabels: {
      '2pers': 'Jusqu\'à 2 personnes',
      '6pers': 'Jusqu\'à 6 personnes',
      '15pers': 'Jusqu\'à 15 personnes',
      '25pers': 'Jusqu\'à 25 personnes',
    } as Record<string, string>,
    konfRoomDesc: {
      '2pers': 'Petite salle de réunion',
      '6pers': 'Salle de réunion',
      '15pers': 'Salle de conférence',
      '25pers': 'Grande salle de conférence',
    } as Record<string, string>,
    konfDauerLabels: {
      stunde: 'À l\'heure',
      halbtags: 'Demi-journée',
      ganztags: 'Journée entière',
    } as Record<string, string>,
    addonLabels: {
      scan: 'Pack de numérisation',
      parkplatz: 'Carte parking (flexible)',
      parkplatz_fest: 'Place fixe réservée',
      firmenschild: 'Enseigne d\'entreprise',
      kaffee: 'Forfait café',
      monitor: 'Écran 27"',
      schrank: 'Armoire à dossiers',
      kaffee_tag: 'Forfait café',
      monitor_tag: 'Écran 27"',
    } as Record<string, string>,
    priceMonthly: (amount: number) => `EUR ${amount},-/mois`,
    priceOneTime: (amount: number) => `EUR ${amount},- une fois`,
    priceSimple: (amount: number) => `EUR ${amount},-`,
    popular: 'Populaire',
    chosen: '✓ Sélectionné',
    addCta: '+ Ajouter',
    back: 'Retour',
    next: 'Suivant',
    loading: 'Chargement...',
    bookAndPay: 'Réserver et payer maintenant',
    securePayment: 'Paiement sécurisé via Stripe · Chiffré SSL',
    errOptions: 'Veuillez sélectionner toutes les options.',
    errRequired: 'Veuillez remplir tous les champs obligatoires.',
    errEmail: 'Veuillez saisir une adresse e-mail valide.',
    errGeneric: 'Une erreur est survenue.',
    errConnection: 'Erreur de connexion. Veuillez réessayer.',
    stepLabelsGA: ['Courrier', 'Formule', 'Options', 'Vos informations'],
    stepLabelsCW: ['Formule', 'Options', 'Vos informations'],
    stepLabelsKonf: ['Taille de salle', 'Durée', 'Options', 'Vos informations'],
    stepLabelsTB: ['Formule', 'Options', 'Vos informations'],
    gaPostTitle: 'Comment votre courrier doit-il être traité ?',
    pvOhne: 'Sans réexpédition du courrier',
    pvMit: 'Avec réexpédition du courrier',
    pvOhneDesc: 'Le courrier est collecté sur place, accessible 24/7',
    pvMitDesc: 'Réexpédition hebdomadaire vers une adresse dans la région DACH',
    tarifWaehlen: 'Choisir une formule',
    inklPostversand: 'Avec réexpédition du courrier',
    alleVat: 'Tous les prix hors TVA.',
    perMonthVat: '/mois HT',
    vatNote: 'HT',
    perHour: '/h',
    fromPrice: 'à partir de EUR',
    cwPromo: 'Offre de lancement Green Office — 16% de remise jusqu\'au 30/09/2026',
    raumWaehlen: 'Choisir la taille de salle',
    dauerWaehlen: 'Choisir la durée',
    addonsTitle: 'Options supplémentaires',
    addonsSub: 'Facultatif — peuvent aussi être ajoutées plus tard.',
    noAddons: 'Aucune option disponible pour ce produit.',
    yourData: 'Vos informations',
    summary: 'Récapitulatif',
    allVatCheckout: 'Tous les prix hors TVA (calculée lors du paiement)',
    labelName: 'Nom *',
    phName: 'Prénom et nom',
    privateCheck: 'Je réserve en tant que particulier (sans entreprise)',
    labelCompany: 'Nom de l\'entreprise *',
    phCompany: 'Exemple Entreprise SARL',
    labelEmail: 'E-mail *',
    phEmail: 'mail@exemple.com',
    summaryPostversand: 'Traitement du courrier',
    summaryMit: 'Avec réexpédition',
    summaryOhne: 'Sans (retrait sur place)',
    summaryTarifFallback: 'Formule',
    summaryRaumFallback: 'Salle',
    summaryTagesbuero: 'Bureau à la journée',
  },
};

// ─── Product Configs (data only, labels come from STRINGS) ──────────

const GA_TARIFE = [
  { id: 'langzeit', laufzeitMonths: 12, price: 49, popular: true },
  { id: 'standard', laufzeitMonths: 6, price: 69 },
  { id: 'flex', laufzeitMonths: 3, price: 99 },
];

const CW_TARIFE = [
  { id: 'tagespass', price: 25, badge: '−16%' },
  { id: '10er', price: 209, badge: '−16%' },
  { id: 'monatspass', price: 219, popular: true, badge: '−16%' },
  { id: 'monatsabo', price: 199, badge: '−16%' },
];

const TB_TARIFE: { id: string; price: number; badge?: string; popular?: boolean }[] = [
  { id: 'tag', price: 79, badge: '−11%' },
  { id: 'woche', price: 349, badge: '−12%' },
  { id: '10er', price: 669, badge: '−16%' },
  { id: 'monat', price: 649, popular: true },
];

const KONF_ROOM_IDS = ['2pers', '6pers', '15pers', '25pers'] as const;
const KONF_DAUER_IDS = ['stunde', 'halbtags', 'ganztags'] as const;

const KONF_PREISE: Record<string, Record<string, number>> = {
  '2pers': { stunde: 19, halbtags: 59, ganztags: 89 },
  '6pers': { stunde: 29, halbtags: 89, ganztags: 129 },
  '15pers': { stunde: 39, halbtags: 99, ganztags: 159 },
  '25pers': { stunde: 49, halbtags: 129, ganztags: 199 },
};

const ADDONS_BY_PRODUCT: Record<ProductType, { id: string; priceAmount: number; priceType: 'monthly' | 'once'; monthly: boolean }[]> = {
  geschaeftsadresse: [
    { id: 'scan', priceAmount: 49, priceType: 'monthly', monthly: true },
    { id: 'parkplatz', priceAmount: 49, priceType: 'monthly', monthly: true },
    { id: 'firmenschild', priceAmount: 179, priceType: 'once', monthly: false },
  ],
  coworking: [
    { id: 'parkplatz', priceAmount: 49, priceType: 'monthly', monthly: true },
    { id: 'parkplatz_fest', priceAmount: 79, priceType: 'monthly', monthly: true },
    { id: 'kaffee', priceAmount: 29, priceType: 'monthly', monthly: true },
    { id: 'monitor', priceAmount: 27, priceType: 'monthly', monthly: true },
    { id: 'schrank', priceAmount: 19, priceType: 'monthly', monthly: true },
  ],
  konferenzraum: [
    { id: 'parkplatz', priceAmount: 49, priceType: 'monthly', monthly: true },
    { id: 'kaffee', priceAmount: 29, priceType: 'monthly', monthly: true },
  ],
  // Tagesbüro lädt tarif-spezifisch (Tag/Woche/10er/Monat) — siehe TB_*_ADDONS unten
  tagesbuero: [],
};

// Coworking Tagespass: nur einmalige Tages-Add-ons, kein Parkplatz (laut Geschäftsregel: Park-Optionen nur bei Monatsbuchungen)
const CW_TAGESPASS_ADDONS = [
  { id: 'kaffee_tag', priceAmount: 9, monthly: false },
  { id: 'monitor_tag', priceAmount: 5, monthly: false },
];

// Coworking 10er-Karte: keine Add-ons im Wizard
const CW_10ER_ADDONS: { id: string; priceAmount: number; monthly: boolean }[] = [];

// Tagesbüro tarif-spezifische Add-ons
const TB_TAG_ADDONS = [
  { id: 'kaffee_tag', priceAmount: 9, monthly: false },
  { id: 'monitor_tag', priceAmount: 5, monthly: false },
];

const TB_WOCHE_ADDONS: { id: string; priceAmount: number; monthly: boolean }[] = [];
const TB_10ER_ADDONS: { id: string; priceAmount: number; monthly: boolean }[] = [];

const TB_MONAT_ADDONS = [
  { id: 'parkplatz', priceAmount: 49, priceType: 'monthly' as const, monthly: true },
  { id: 'parkplatz_fest', priceAmount: 79, priceType: 'monthly' as const, monthly: true },
  { id: 'kaffee', priceAmount: 29, priceType: 'monthly' as const, monthly: true },
  { id: 'monitor', priceAmount: 27, priceType: 'monthly' as const, monthly: true },
];

// ─── Helper Components ───────────────────────────────────────────────

function StepBadge({ number, done, active }: { number: number; done: boolean; active: boolean }) {
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
      done ? 'bg-[#6b7f3e] text-white' : active ? 'bg-[#6b7f3e] text-white' : 'bg-[#e8e3d6] text-[#6b7f3e]'
    }`}>
      {done ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      ) : number}
    </div>
  );
}

function OptionCard({ selected, onClick, children, popular, centered, popularLabel }: { selected: boolean; onClick: () => void; children: React.ReactNode; popular?: boolean; centered?: boolean; popularLabel: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-xl border-2 p-4 ${centered !== false ? 'text-center' : 'text-left'} transition-all cursor-pointer ${
        selected
          ? 'border-[#6b7f3e] bg-[#f0f4e8] shadow-sm'
          : popular
          ? 'border-[#6b7f3e]/50 bg-white hover:bg-[#f0f4e8] hover:border-[#6b7f3e]'
          : 'border-gray-200 bg-white hover:bg-[#f0f4e8] hover:border-[#6b7f3e]'
      }`}
    >
      {popular && !selected && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-bold bg-[#6b7f3e] text-white rounded-full px-2 py-0.5">{popularLabel}</span>
      )}
      {children}
    </button>
  );
}

function AddonToggle({ label, price, selected, onToggle, chosenLabel, addLabel }: { label: string; price: string; selected: boolean; onToggle: () => void; chosenLabel: string; addLabel: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
        selected ? 'border-[#6b7f3e] bg-[#f0f4e8]' : 'border-gray-200 bg-white hover:bg-[#f0f4e8] hover:border-[#6b7f3e]'
      }`}
    >
      <div className="text-sm font-semibold text-gray-900">{label}</div>
      <div className="text-xs font-bold text-gray-700 mt-0.5">+ {price}</div>
      <div className={`text-xs font-medium mt-1 ${selected ? 'text-[#6b7f3e]' : 'text-[#6b7f3e]/50'}`}>
        {selected ? chosenLabel : addLabel}
      </div>
    </button>
  );
}

function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="text-xs text-gray-500 hover:text-gray-900 mb-3 flex items-center gap-1">
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
      {label}
    </button>
  );
}

// ─── Main Component ──────────────────────────────────────────────────

export function CheckoutWizard({ product, title }: CheckoutWizardProps) {
  const pathname = usePathname();
  const locale: 'de' | 'en' | 'fr' = pathname?.startsWith('/fr') ? 'fr' : pathname?.startsWith('/en') ? 'en' : 'de';
  const s = STRINGS[locale];

  // Helper: format addon price
  const formatAddonPrice = (a: { priceAmount: number; priceType?: 'monthly' | 'once'; monthly: boolean }) => {
    if (a.priceType === 'once') return s.priceOneTime(a.priceAmount);
    if (a.monthly) return s.priceMonthly(a.priceAmount);
    return s.priceSimple(a.priceAmount);
  };

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Geschäftsadresse state
  const [postversand, setPostversand] = useState<'ohne' | 'mit' | null>(null);
  const [gaTarif, setGaTarif] = useState<string | null>(null);

  // Coworking state
  const [cwTarif, setCwTarif] = useState<string | null>(null);

  // Tagesbüro state
  const [tbTarif, setTbTarif] = useState<string | null>(null);

  // Konferenzraum state
  const [konfRoom, setKonfRoom] = useState<string | null>(null);
  const [konfDauer, setKonfDauer] = useState<string | null>(null);

  // Shared state
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [name, setName] = useState('');
  const [firma, setFirma] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isPrivat, setIsPrivat] = useState(false);

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // ─── Build Stripe Price ID ──────────────────────────────────────

  function getMainPriceKey(): string | null {
    switch (product) {
      case 'geschaeftsadresse':
        if (!gaTarif || !postversand) return null;
        return `ga_${gaTarif}_${postversand}`;
      case 'coworking':
        if (!cwTarif) return null;
        return `cw_${cwTarif}`;
      case 'konferenzraum':
        if (!konfRoom || !konfDauer) return null;
        return `konf_${konfRoom}_${konfDauer}`;
      case 'tagesbuero':
        if (!tbTarif) return null;
        return `tb_${tbTarif}`;
      default:
        return null;
    }
  }

  // ─── Checkout ───────────────────────────────────────────────────

  async function handleCheckout() {
    const priceKey = getMainPriceKey();
    if (!priceKey || !PRICE_MAP[priceKey]) {
      setError(s.errOptions);
      return;
    }
    if (!name || !email || (!firma && !isPrivat)) {
      setError(s.errRequired);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(s.errEmail);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const addonKeys = Array.from(selectedAddons).map(id => `addon_${id}`);

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: priceKey,
          addons: addonKeys,
          customerEmail: email,
          customerName: name,
          customerPhone: phone,
          firma,
          locale,
          successUrl: `${window.location.origin}/buchung-bestaetigt`,
          cancelUrl: window.location.href,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || s.errGeneric);
      }
    } catch {
      setError(s.errConnection);
    } finally {
      setLoading(false);
    }
  }

  // ─── Step Definitions per Product ───────────────────────────────

  function getStepLabels(): string[] {
    switch (product) {
      case 'geschaeftsadresse': return s.stepLabelsGA;
      case 'coworking': return s.stepLabelsCW;
      case 'konferenzraum': return s.stepLabelsKonf;
      case 'tagesbuero': return s.stepLabelsTB;
      default: return [];
    }
  }

  function getMaxSteps(): number {
    return getStepLabels().length;
  }

  // ─── Summary ────────────────────────────────────────────────────

  function getSummary(): { label: string; value: string }[] {
    const items: { label: string; value: string }[] = [];
    switch (product) {
      case 'geschaeftsadresse': {
        const t = GA_TARIFE.find(t => t.id === gaTarif);
        if (t) {
          items.push({ label: `${s.gaTarifLabels[t.id]} (${s.months(t.laufzeitMonths)})`, value: s.priceMonthly(t.price) });
        }
        items.push({ label: s.summaryPostversand, value: postversand === 'mit' ? s.summaryMit : s.summaryOhne });
        break;
      }
      case 'coworking': {
        const t = CW_TARIFE.find(t => t.id === cwTarif);
        items.push({ label: (t && s.cwTarifLabels[t.id]) || s.summaryTarifFallback, value: s.priceSimple(t?.price || 0) });
        break;
      }
      case 'konferenzraum': {
        const roomLabel = konfRoom ? s.konfRoomLabels[konfRoom] : s.summaryRaumFallback;
        const dauerLabel = konfDauer ? s.konfDauerLabels[konfDauer] : '';
        const preis = konfRoom && konfDauer ? KONF_PREISE[konfRoom]?.[konfDauer] : 0;
        items.push({ label: `${roomLabel} · ${dauerLabel}`, value: s.priceSimple(preis) });
        break;
      }
      case 'tagesbuero': {
        const t = TB_TARIFE.find(t => t.id === tbTarif);
        const tarifLabel = tbTarif ? s.tbTarifLabels[tbTarif] : s.summaryTagesbuero;
        items.push({ label: `${s.summaryTagesbuero} · ${tarifLabel}`, value: s.priceSimple(t?.price || 0) });
        break;
      }
    }
    if (selectedAddons.size > 0) {
      const addonSource =
        product === 'coworking' && cwTarif === '10er' ? CW_10ER_ADDONS :
        product === 'coworking' && cwTarif === 'tagespass' ? CW_TAGESPASS_ADDONS :
        product === 'tagesbuero' && tbTarif === 'tag' ? TB_TAG_ADDONS :
        product === 'tagesbuero' && tbTarif === 'woche' ? TB_WOCHE_ADDONS :
        product === 'tagesbuero' && tbTarif === '10er' ? TB_10ER_ADDONS :
        product === 'tagesbuero' && tbTarif === 'monat' ? TB_MONAT_ADDONS :
        ADDONS_BY_PRODUCT[product];
      addonSource
        .filter(a => selectedAddons.has(a.id))
        .forEach(a => {
          items.push({ label: s.addonLabels[a.id] || a.id, value: formatAddonPrice(a) });
        });
    }
    return items;
  }

  // ─── Render Steps ───────────────────────────────────────────────

  const stepLabels = getStepLabels();
  const maxSteps = getMaxSteps();
  const addonsStep = product === 'tagesbuero' ? 1 : product === 'coworking' ? 1 : product === 'geschaeftsadresse' ? 2 : 2;
  const dataStep = addonsStep + 1;

  function renderCurrentStep() {
    // ── GESCHÄFTSADRESSE ──
    if (product === 'geschaeftsadresse') {
      if (step === 0) {
        return (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">{s.gaPostTitle}</h3>
            <div className="grid grid-cols-2 gap-3">
              {(['ohne', 'mit'] as const).map(pv => (
                <OptionCard key={pv} popularLabel={s.popular} selected={postversand === pv} onClick={() => { setPostversand(pv); setStep(1); }}>
                  <p className="font-semibold text-sm">{pv === 'ohne' ? s.pvOhne : s.pvMit}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {pv === 'ohne' ? s.pvOhneDesc : s.pvMitDesc}
                  </p>
                </OptionCard>
              ))}
            </div>
          </div>
        );
      }
      if (step === 1) {
        return (
          <div>
            <BackButton onClick={() => setStep(0)} label={s.back} />
            <h3 className="text-lg font-bold text-gray-900 mb-4">{s.tarifWaehlen}</h3>
            <p className="text-xs text-gray-500 mb-3">{postversand === 'mit' ? s.inklPostversand : s.pvOhne} · {s.alleVat}</p>
            <div className="grid grid-cols-3 gap-3">
              {GA_TARIFE.map(t => (
                <OptionCard key={t.id} popularLabel={s.popular} selected={gaTarif === t.id} popular={t.popular} centered={false} onClick={() => { setGaTarif(t.id); setStep(2); }}>
                  <div className="w-full">
                    <p className="text-sm font-semibold">{s.gaTarifLabels[t.id]}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.months(t.laufzeitMonths)}</p>
                  </div>
                  <div className="w-full mt-2">
                    <p className="text-base font-bold">{s.priceSimple(t.price)}</p>
                    <p className="text-[10px] text-gray-400">{s.perMonthVat}</p>
                  </div>
                </OptionCard>
              ))}
            </div>
          </div>
        );
      }
    }

    // ── COWORKING ──
    if (product === 'coworking') {
      if (step === 0) {
        return (
          <div>
            <div className="mb-4 rounded-lg bg-[#6b7f3e] text-white text-center py-2 px-3">
              <p className="text-sm font-bold">{s.cwPromo}</p>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">{s.tarifWaehlen}</h3>
            <div className="grid grid-cols-2 gap-3">
              {CW_TARIFE.map(t => (
                <OptionCard key={t.id} popularLabel={s.popular} selected={cwTarif === t.id} popular={t.popular} centered={false} onClick={() => { setCwTarif(t.id); setStep(1); }}>
                  <div className="w-full text-center">
                    <div className="text-xs sm:text-sm font-semibold">{s.cwTarifLabels[t.id]}</div>
                    <div className="text-base sm:text-lg font-bold text-[#1e293b] my-0.5 whitespace-nowrap">{s.priceSimple(t.price)}</div>
                    <p className="text-[10px] text-gray-400">{s.vatNote}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{s.cwTarifSub[t.id]}</p>
                    {t.badge && <span className="inline-block mt-1 text-[9px] font-bold bg-[#6b7f3e] text-white rounded-full px-1.5 py-0.5">{t.badge}</span>}
                  </div>
                </OptionCard>
              ))}
            </div>
          </div>
        );
      }
    }

    // ── TAGESBÜRO ──
    if (product === 'tagesbuero') {
      if (step === 0) {
        return (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">{s.tarifWaehlen}</h3>
            <div className="grid grid-cols-2 gap-3">
              {TB_TARIFE.map(t => (
                <OptionCard key={t.id} popularLabel={s.popular} selected={tbTarif === t.id} popular={t.popular} centered={false} onClick={() => { setTbTarif(t.id); setStep(1); }}>
                  <div className="w-full text-center">
                    <div className="text-xs sm:text-sm font-semibold">{s.tbTarifLabels[t.id]}</div>
                    <div className="text-base sm:text-lg font-bold text-[#1e293b] my-0.5 whitespace-nowrap">{s.priceSimple(t.price)}</div>
                    <p className="text-[10px] text-gray-400">{s.vatNote}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">{s.tbTarifSub[t.id]}</p>
                    {t.badge && <span className="inline-block mt-1 text-[9px] font-bold bg-[#6b7f3e] text-white rounded-full px-1.5 py-0.5">{t.badge}</span>}
                  </div>
                </OptionCard>
              ))}
            </div>
          </div>
        );
      }
    }

    // ── KONFERENZRAUM ──
    if (product === 'konferenzraum') {
      if (step === 0) {
        return (
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">{s.raumWaehlen}</h3>
            <div className="grid grid-cols-2 gap-3">
              {KONF_ROOM_IDS.map(id => (
                <OptionCard key={id} popularLabel={s.popular} selected={konfRoom === id} onClick={() => { setKonfRoom(id); setStep(1); }}>
                  <p className="font-semibold text-sm">{s.konfRoomLabels[id]}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.konfRoomDesc[id]}</p>
                  <p className="text-xs font-bold text-gray-700 mt-1">{s.fromPrice} {KONF_PREISE[id].stunde},-{s.perHour}</p>
                </OptionCard>
              ))}
            </div>
          </div>
        );
      }
      if (step === 1) {
        return (
          <div>
            <BackButton onClick={() => setStep(0)} label={s.back} />
            <h3 className="text-lg font-bold text-gray-900 mb-4">{s.dauerWaehlen}</h3>
            <p className="text-xs text-gray-500 mb-3">
              {konfRoom ? s.konfRoomLabels[konfRoom] : ''} · {s.alleVat}
            </p>
            <div className="grid grid-cols-3 gap-3">
              {KONF_DAUER_IDS.map(id => {
                const preis = konfRoom ? KONF_PREISE[konfRoom][id] : 0;
                return (
                  <OptionCard key={id} popularLabel={s.popular} selected={konfDauer === id} centered={false} onClick={() => { setKonfDauer(id); setStep(2); }}>
                    <div className="w-full">
                      <p className="text-sm font-semibold">{s.konfDauerLabels[id]}</p>
                    </div>
                    <div className="w-full mt-2">
                      <p className="text-base font-bold">{s.priceSimple(preis)}</p>
                      <p className="text-[10px] text-gray-400">{s.vatNote}</p>
                    </div>
                  </OptionCard>
                );
              })}
            </div>
          </div>
        );
      }
    }

    // ── ADD-ONS (shared) ──
    if (step === addonsStep) {
      // Tarif-spezifische Add-ons:
      // - Coworking: 10er → leer, Tagespass → Tages-Add-ons, Monatspass/Abo → monatliche Add-ons
      // - Tagesbüro: Tag → Tages-Add-ons, Woche/10er → leer, Monat → monatliche Add-ons
      const productAddons =
        product === 'coworking' && cwTarif === '10er' ? CW_10ER_ADDONS :
        product === 'coworking' && cwTarif === 'tagespass' ? CW_TAGESPASS_ADDONS :
        product === 'tagesbuero' && tbTarif === 'tag' ? TB_TAG_ADDONS :
        product === 'tagesbuero' && tbTarif === 'woche' ? TB_WOCHE_ADDONS :
        product === 'tagesbuero' && tbTarif === '10er' ? TB_10ER_ADDONS :
        product === 'tagesbuero' && tbTarif === 'monat' ? TB_MONAT_ADDONS :
        ADDONS_BY_PRODUCT[product];
      return (
        <div>
          {step > 0 && <BackButton onClick={() => setStep(step - 1)} label={s.back} />}
          <h3 className="text-lg font-bold text-gray-900 mb-1">{s.addonsTitle}</h3>
          <p className="text-xs text-gray-500 mb-4">{s.addonsSub}</p>
          {productAddons.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {productAddons.map(addon => (
                <AddonToggle
                  key={addon.id}
                  label={s.addonLabels[addon.id] || addon.id}
                  price={formatAddonPrice(addon)}
                  selected={selectedAddons.has(addon.id)}
                  onToggle={() => toggleAddon(addon.id)}
                  chosenLabel={s.chosen}
                  addLabel={s.addCta}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">{s.noAddons}</p>
          )}
          <button
            onClick={() => setStep(dataStep)}
            className="mt-4 w-full rounded-lg bg-[#6b7f3e] text-white text-center py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            {s.next}
          </button>
        </div>
      );
    }

    // ── KUNDENDATEN + ZUSAMMENFASSUNG ──
    if (step === dataStep) {
      const summary = getSummary();
      return (
        <div>
          <BackButton onClick={() => setStep(step - 1)} label={s.back} />
          <h3 className="text-lg font-bold text-gray-900 mb-4">{s.yourData}</h3>

          {/* Summary */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 mb-5">
            <p className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">{s.summary}</p>
            {summary.map((item, i) => (
              <div key={i} className="flex justify-between text-sm py-1">
                <span className="text-gray-500">{item.label}</span>
                <span className="font-medium text-gray-900 text-right">{item.value}</span>
              </div>
            ))}
            <p className="text-[10px] text-gray-400 mt-2 text-right">{s.allVatCheckout}</p>
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{s.labelName}</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={s.phName}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e]"
              />
            </div>

            {/* Privatperson Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="privat-check"
                checked={isPrivat}
                onChange={e => { setIsPrivat(e.target.checked); if (e.target.checked) setFirma(''); }}
                className="w-4 h-4 text-[#6b7f3e] border-gray-300 rounded focus:ring-[#6b7f3e]"
              />
              <label htmlFor="privat-check" className="text-sm text-gray-700">{s.privateCheck}</label>
            </div>

            {!isPrivat && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">{s.labelCompany}</label>
                <input
                  type="text"
                  value={firma}
                  onChange={e => setFirma(e.target.value)}
                  placeholder={s.phCompany}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e]"
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">{s.labelEmail}</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={s.phEmail}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6b7f3e] focus:border-[#6b7f3e]"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 mt-3">{error}</p>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="mt-5 w-full rounded-lg bg-[#6b7f3e] text-white text-center py-3.5 text-base font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? s.loading : s.bookAndPay}
          </button>

          <div className="flex items-center justify-center gap-2 mt-3">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <p className="text-xs text-gray-400">{s.securePayment}</p>
          </div>
        </div>
      );
    }

    return null;
  }

  // ─── Step Progress Bar ──────────────────────────────────────────

  const isLastStep = step === maxSteps - 1;

  // Last step ("Ihre Daten"): fullscreen overlay on mobile
  if (isLastStep) {
    return (
      <>
        {/* Mobile: fullscreen overlay */}
        <div className="fixed inset-0 z-50 bg-white overflow-y-auto sm:hidden">
          <div className="px-4 py-6 pb-20">
            {/* Back button */}
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 text-sm text-gray-500 mb-4"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              {s.back}
            </button>

            {/* Progress */}
            <div className="flex items-center justify-center gap-1 mb-6">
              {stepLabels.map((label, i) => (
                <React.Fragment key={i}>
                  <StepBadge number={i + 1} done={step > i} active={step === i} />
                  {i < stepLabels.length - 1 && (
                    <div className={`w-6 h-0.5 ${step > i ? 'bg-[#6b7f3e]' : 'bg-gray-200'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            {renderCurrentStep()}
          </div>
        </div>

        {/* Desktop: normal inline */}
        <div className="mx-auto max-w-2xl pt-16 pb-16 hidden sm:block" id="buchen">
          {title && <h2 className="text-xl font-bold text-gray-900 text-center mb-6">{title}</h2>}
          <div className="flex items-center justify-center gap-1 mb-6">
            {stepLabels.map((label, i) => (
              <React.Fragment key={i}>
                <div className="flex items-center gap-1">
                  <StepBadge number={i + 1} done={step > i} active={step === i} />
                  <span className="text-[11px] font-medium text-gray-700">{label}</span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div className={`w-10 h-0.5 ${step > i ? 'bg-[#6b7f3e]' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 md:p-8">
            {renderCurrentStep()}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="mx-auto max-w-2xl pt-16 pb-16" id="buchen">
      {title && <h2 className="text-xl font-bold text-gray-900 text-center mb-6">{title}</h2>}

      {/* Progress */}
      <div className="flex items-center justify-center gap-1 mb-6">
        {stepLabels.map((label, i) => (
          <React.Fragment key={i}>
            <div className="flex items-center gap-1">
              <StepBadge number={i + 1} done={step > i} active={step === i} />
              <span className="text-[11px] font-medium text-gray-700 hidden sm:inline">{label}</span>
            </div>
            {i < stepLabels.length - 1 && (
              <div className={`w-6 sm:w-10 h-0.5 ${step > i ? 'bg-[#6b7f3e]' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 md:p-8">
        {renderCurrentStep()}
      </div>
    </div>
  );
}
