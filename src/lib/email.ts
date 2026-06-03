// lib/email.ts
import { Resend } from 'resend'
import type { AppelPaiement, Contrat, Acheteur } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Riviera Cherchell <noreply@riviera-cherchell.dz>'

const LABELS_PHASE: Record<string, string> = {
  phase_1: 'Acompte de réservation (10%)',
  phase_2: 'Appel de fonds — Fondations (20%)',
  phase_3: 'Appel de fonds — Murs & toiture (20%)',
  phase_4: 'Appel de fonds — Finitions intérieures (25%)',
  phase_5: 'Solde — Livraison des clés (25%)',
}

function formatEur(n: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

// ── Rappel de paiement ──────────────────────────────────────
export async function envoyerRappelPaiement(
  appel: AppelPaiement,
  contrat: Contrat,
  acheteur: Acheteur
) {
  const sujet = `[Riviera Cherchell] Rappel de paiement — ${LABELS_PHASE[appel.phase]}`
  const echeance = appel.date_echeance
    ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(appel.date_echeance))
    : 'à convenir'

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><style>
  body { font-family: Georgia, serif; color: #1A2E2A; background: #fff; margin: 0; padding: 0; }
  .wrapper { max-width: 580px; margin: 0 auto; padding: 40px 24px; }
  .header { border-bottom: 2px solid #1D9E75; padding-bottom: 20px; margin-bottom: 32px; }
  .logo { font-size: 22px; font-weight: bold; color: #0F6E56; letter-spacing: 0.02em; }
  .logo span { color: #BA7517; }
  h1 { font-size: 20px; margin: 0 0 8px; }
  .box { background: #E8F5F0; border-left: 4px solid #1D9E75; padding: 16px 20px; border-radius: 6px; margin: 24px 0; }
  .box .label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #0F6E56; margin-bottom: 4px; }
  .box .value { font-size: 28px; font-weight: bold; color: #085041; }
  .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
  .footer { margin-top: 40px; font-size: 12px; color: #888; border-top: 1px solid #e5e7eb; padding-top: 16px; }
  .btn { display: inline-block; background: #1D9E75; color: #fff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-size: 14px; margin-top: 20px; }
</style></head>
<body>
<div class="wrapper">
  <div class="header">
    <div class="logo">Riviera <span>Cherchell</span></div>
  </div>
  <h1>Cher(e) ${acheteur.prenom} ${acheteur.nom},</h1>
  <p>Nous vous rappelons qu'un appel de fonds est en cours concernant votre acquisition au sein de la résidence <strong>Riviera Cherchell</strong>.</p>
  <div class="box">
    <div class="label">Montant dû</div>
    <div class="value">${formatEur(appel.montant)}</div>
  </div>
  <div class="row"><span>Référence contrat</span><strong>${contrat.numero}</strong></div>
  <div class="row"><span>Unité</span><strong>${contrat.unite?.reference ?? '—'}</strong></div>
  <div class="row"><span>Phase</span><strong>${LABELS_PHASE[appel.phase]}</strong></div>
  <div class="row"><span>Échéance</span><strong>${echeance}</strong></div>
  <p style="margin-top:24px;font-size:14px;">Pour tout règlement ou information complémentaire, veuillez contacter notre service commercial :</p>
  <p style="font-size:14px;"><strong>📧 commercial@riviera-cherchell.dz</strong><br><strong>📞 +213 XX XX XX XX</strong></p>
  <div class="footer">
    Riviera Cherchell — Promoteur immobilier agréé<br>
    Cherchell, Tipaza, Algérie<br>
    Cet email est envoyé automatiquement, merci de ne pas y répondre directement.
  </div>
</div>
</body>
</html>`

  const { data, error } = await resend.emails.send({
    from: FROM,
    to: acheteur.email,
    subject: sujet,
    html,
  })

  if (error) throw new Error(`Erreur Resend: ${error.message}`)
  return data
}

// ── Email de bienvenue après contrat ───────────────────────
export async function envoyerBienvenue(acheteur: Acheteur, contrat: Contrat) {
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><style>
  body { font-family: Georgia, serif; color: #1A2E2A; background: #fff; margin: 0; padding: 0; }
  .wrapper { max-width: 580px; margin: 0 auto; padding: 40px 24px; }
  .logo { font-size: 22px; font-weight: bold; color: #0F6E56; }
  .logo span { color: #BA7517; }
  h1 { color: #0F6E56; font-size: 24px; }
  .box { background: #E8F5F0; padding: 20px; border-radius: 8px; margin: 24px 0; }
  .footer { margin-top: 40px; font-size: 12px; color: #888; border-top: 1px solid #e5e7eb; padding-top: 16px; }
</style></head>
<body>
<div class="wrapper">
  <div class="logo">Riviera <span>Cherchell</span></div>
  <h1>Bienvenue dans la résidence Riviera Cherchell !</h1>
  <p>Cher(e) <strong>${acheteur.prenom} ${acheteur.nom}</strong>,</p>
  <p>Nous avons le plaisir de confirmer votre acquisition au sein de notre résidence. Voici un récapitulatif :</p>
  <div class="box">
    <p><strong>Contrat n°</strong> ${contrat.numero}</p>
    <p><strong>Unité</strong> ${contrat.unite?.reference} — ${contrat.unite?.type}</p>
    <p><strong>Prix total</strong> ${formatEur(contrat.prix_total)}</p>
  </div>
  <p>Votre espace client vous permettra de suivre l'avancement des travaux et votre échéancier de paiement. Vous recevrez bientôt vos identifiants de connexion.</p>
  <p>Notre équipe reste disponible pour toute question.</p>
  <div class="footer">
    Riviera Cherchell — Promoteur immobilier agréé · Cherchell, Tipaza, Algérie
  </div>
</div>
</body>
</html>`

  await resend.emails.send({
    from: FROM,
    to: acheteur.email,
    subject: `Bienvenue à Riviera Cherchell — Confirmation contrat ${contrat.numero}`,
    html,
  })
}
