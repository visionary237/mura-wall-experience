# 05 — CRM & marketing automation

## Payload (`src/lib/lead.ts`, schéma v1.0)
Coordonnées · segment · type d'établissement · organisation · CP/ville · dimensions, surface, murs, support et état · besoin graphique · accès · délai · budget · multisite · œuvre (id, licence, statut des droits, source) · simulation (id projet, aperçu, configuration) · photo du mur jointe (oui/non) · estimation (fourchette, démo ?) · acquisition (UTM, référent, page d'entrée) · consentements (traitement, relance, texte affiché, horodatage) · **score** (0-100).

Exemple réel : *Export JSON* dans `/admin`.

> En production, l'aperçu et la photo ne transitent pas en base64 : ils sont uploadés via URL signée (bucket privé) et le payload ne contient que leurs chemins.

## Envoi
`NEXT_PUBLIC_LEAD_WEBHOOK_URL` défini → POST JSON. Absent → **dry-run**, aucun envoi. Aucune communication n'est émise avant configuration et validation.

## Workflow n8n (`n8n/lead-intake.workflow.json`)
Webhook → validation (consentement, e-mail) → upsert du contact HubSpot → création d'un deal (étape selon le score) → notification commerciale (e-mail interne) → e-mail de confirmation Brevo (transactionnel) → réponse 200.
**Les nœuds HubSpot et Brevo sont livrés désactivés** : ils sont à connecter avec les identifiants du client, puis à activer après test.

## Workflows envisagés
| Workflow | Déclencheur | Condition de consentement |
|---|---|---|
| Confirmation de demande | lead reçu | traitement (transactionnel) |
| Notification commerciale | lead reçu, score ≥ 50 → priorité | — (interne) |
| Relance devis | devis envoyé + J+7 sans réponse | traitement (suivi de la demande en cours) |
| Relance projet enregistré | projet transmis sans devis signé, J+14 | **`consent_marketing = true` uniquement** |
| Suivi post-intervention | statut = gagné + J+3 | traitement |
| Demande d'avis | J+30 après intervention | traitement ; l'avis n'est publié qu'avec accord |
