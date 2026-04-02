import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { Pool } from 'pg';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2025-03-31.basil' as any });
const pool = new Pool({
  connectionString: process.env.CRM_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://weil.bizzcenter.de';

const TARIFE: Record<string, { label: string; preisNetto: number }> = {
  'beamer-only': { label: 'Beamer mieten (nur Projektor)', preisNetto: 3900 }, // cents
  'beamer-leinwand': { label: 'Beamer + Leinwand mieten', preisNetto: 5900 },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { tarif, startDate, endDate, vorname, nachname, firma, email, telefon } = req.body;

    // Validate
    if (!tarif || !startDate || !vorname || !nachname || !telefon || !email) {
      return res.status(400).json({ error: 'Pflichtfelder fehlen' });
    }
    const tarifInfo = TARIFE[tarif];
    if (!tarifInfo) return res.status(400).json({ error: 'Ungültiger Tarif' });

    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date(startDate);
    const now = new Date();
    const diffHours = (start.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < 24) {
      return res.status(400).json({
        error: 'Kurzfristige Buchungen (unter 24h) bitte telefonisch: +49 7621 916 5547',
        code: 'TOO_SHORT_NOTICE',
      });
    }

    // Calculate days
    const tage = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    const gesamtpreisNetto = tarifInfo.preisNetto * tage;

    // Check availability
    const overlap = await pool.query(
      `SELECT id FROM beamer_bookings
       WHERE status IN ('confirmed', 'paid')
       AND start_date <= $2 AND end_date >= $1
       LIMIT 1`,
      [startDate, endDate || startDate]
    );
    if (overlap.rows.length > 0) {
      return res.status(409).json({ error: 'Der Beamer ist in diesem Zeitraum bereits gebucht.', code: 'NOT_AVAILABLE' });
    }

    // Create Stripe Checkout Session
    const formatDate = (d: string) => new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const zeitraum = endDate && endDate !== startDate
      ? `${formatDate(startDate)} – ${formatDate(endDate)} (${tage} Tage)`
      : formatDate(startDate);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      line_items: [{
        price_data: {
          currency: 'eur',
          unit_amount: tarifInfo.preisNetto,
          product_data: {
            name: tarifInfo.label,
            description: `Zeitraum: ${zeitraum}`,
          },
        },
        quantity: tage,
      }],
      metadata: {
        type: 'beamer',
        tarif,
        startDate,
        endDate: endDate || startDate,
        tage: String(tage),
        vorname,
        nachname,
        firma: firma || '',
        telefon,
      },
      success_url: `${SITE_URL}/beamer-mieten?buchung=erfolgreich&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/beamer-mieten?buchung=abgebrochen`,
      tax_id_collection: { enabled: true },
    });

    // Save booking as confirmed (payment pending)
    await pool.query(
      `INSERT INTO beamer_bookings (start_date, end_date, tarif, tage, gesamtpreis_netto, vorname, nachname, firma, email, telefon, stripe_session_id, stripe_payment_status, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'pending', 'confirmed')`,
      [startDate, endDate || startDate, tarif, tage, gesamtpreisNetto / 100, vorname, nachname, firma || null, email, telefon, session.id]
    );

    return res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error('Beamer checkout error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
