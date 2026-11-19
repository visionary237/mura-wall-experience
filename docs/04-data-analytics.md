# 04 — Plan de tracking & funnel

Implémentation : `src/lib/analytics.ts`. Les événements sont journalisés localement (anonymes, pour le tableau de bord démo) et poussés dans `dataLayer` **uniquement après consentement**.

| Événement | Déclencheur | Propriétés |
|---|---|---|
| `artwork_view` | ouverture d'une œuvre (lightbox) | id |
| `library_search` | recherche (débounce 700 ms) | q, results |
| `favorite_add` | ajout aux favoris | id |
| `artwork_select` | choix d'une œuvre pour le Studio | id |
| `photo_upload` | import d'une image | target (art / room) |
| `simulation_start` | 1ʳᵉ étape franchie avec une œuvre | art |
| `simulation_complete` | arrivée à l'étape Aperçu | room |
| `preview_download` | export PNG | — |
| `project_save` | enregistrement d'un projet | — |
| `estimate_view` | ouverture de l'estimateur | — |
| `quote_start` | ouverture du formulaire de devis | — |
| `quote_submit` | envoi validé | segment, score, mode |

**Funnel principal** : artwork_view → artwork_select → simulation_start → simulation_complete → quote_start → quote_submit (visible dans `/admin` → Funnel).

KPI : taux de simulation terminée, part des devis avec simulation jointe, score moyen par segment, conversion par source UTM.
Outil recommandé : Matomo ou Plausible (hébergement UE, sans cookie) branché sur `dataLayer`.
