import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.CRM_DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { month, year } = req.query;
  const m = parseInt(month as string, 10);
  const y = parseInt(year as string, 10);

  if (!m || !y || m < 1 || m > 12 || y < 2024 || y > 2030) {
    return res.status(400).json({ error: 'Invalid month/year' });
  }

  try {
    // Get all bookings that overlap with the requested month
    const firstDay = `${y}-${String(m).padStart(2, '0')}-01`;
    const lastDay = new Date(y, m, 0).toISOString().split('T')[0];

    const result = await pool.query(
      `SELECT start_date, end_date FROM beamer_bookings
       WHERE status IN ('confirmed', 'paid')
       AND start_date <= $2 AND end_date >= $1`,
      [firstDay, lastDay]
    );

    // Build set of booked dates
    const bookedDates: string[] = [];
    for (const row of result.rows) {
      const start = new Date(row.start_date);
      const end = new Date(row.end_date);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (dateStr >= firstDay && dateStr <= lastDay) {
          bookedDates.push(dateStr);
        }
      }
    }

    return res.status(200).json({ bookedDates });
  } catch (err) {
    console.error('Beamer availability error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
