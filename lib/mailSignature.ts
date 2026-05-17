/**
 * Offizielle E-Mail-Signatur für alle Kunden-Mails.
 * Single source of truth — wird identisch im Paket-Handler (Windmill Templates-Tab)
 * verwendet. Bei Änderungen hier auch das Sheet "Templates" updaten.
 */

const WHATSAPP_BLOCK = `<p style="background:#f0fdf4;border-left:4px solid #25D366;padding:12px 16px;margin:16px 0;border-radius:4px;">
  <strong>In dringenden Fällen</strong> erreichen Sie uns direkt über <a href="https://wa.me/491715394909" style="color:#25D366;text-decoration:none;font-weight:600;">WhatsApp Business</a>: <a href="https://wa.me/491715394909" style="color:#1f2a37;font-weight:600;">+49 171 5394909</a>
</p>`;

const SIGNATURE_BLOCK = `<p style="margin-top:24px;">Mit freundlichen Grüßen aus dem bizzcenter</p>
<p>Dein bizzcenter-Team</p>
<p style="font-size:12px;color:#6b7280;margin-top:24px;line-height:1.6;">
bizzcenter Weil am Rhein GmbH<br/>
Im&#8203;Schwarzenbach&#8203;4<br/>
79576&#8203;Weil&#8203;am&#8203;Rhein
</p>
<p style="font-size:12px;color:#6b7280;line-height:1.6;">
<a href="https://www.weil.bizzcenter.de" style="color:#6b7f3e;">www.weil.bizzcenter.de</a>
</p>
<p style="font-size:11px;color:#9ca3af;line-height:1.6;margin-top:16px;">
Geschäftsführer: Torben Götz<br/>
Handelsregisternummer: HRB 720019<br/>
UstID: DE324605200<br/>
Gericht: Amtsgericht Freiburg
</p>`;

export const MAIL_SIGNATURE_WITH_WHATSAPP = `${WHATSAPP_BLOCK}\n${SIGNATURE_BLOCK}`;
export const MAIL_SIGNATURE_PLAIN = SIGNATURE_BLOCK;
