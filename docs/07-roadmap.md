# 07 — Roadmap

| Phase | Contenu | État |
|---|---|---|
| 0 | Audit, manifest, architecture, DA, schéma, roadmap | ✅ |
| 1 — Site immersif | Homepage 9 scènes, pages services, 8 landings sectorielles | ✅ MVP (contenus à valider) |
| 2 — Art Explorer | Recherche, filtres, couleur, collections, favoris, comparaison, lightbox | ✅ MVP (15 œuvres) |
| 3 — Wall Creative Studio | Import, surface, obstacles, perspective, réglages, ombrage, occlusion, variantes, export | ✅ MVP |
| 4 — Conversion | Contrôle qualité, estimateur (mode démo), devis 3 étapes, dossier, score | ✅ MVP |
| 5 — Back-office & CRM | Supabase (schéma prêt), auth admin, CRUD œuvres et réalisations, tarifs en base, Edge Function d'ingestion des leads, URL signées, n8n live | ⏳ |
| 6 — Visualisation IA | Segmentation du mur (SAM 2 ou équivalent, côté serveur, opt-in), occlusion automatique sur les photos clients, rendu photoréaliste optionnel par inpainting *en conservant l'œuvre à l'identique* | ⏳ |
| 7 — Portfolio DOERZ | Étude de cas, captures, showreel 30–60 s, présentation commerciale | ⏳ (trame dans `08-tests-et-livraison.md`) |

## Prochaines actions recommandées
1. Obtenir les P0 (identité, machine, fiche technique, tarifs) et remplacer `src/config/site.ts`.
2. Tourner un time-lapse réel caméra fixe pour remplacer la vidéo IA du hero.
3. Phase 5 : Supabase + Edge Function `submit-lead`, puis brancher `NEXT_PUBLIC_LEAD_WEBHOOK_URL`.
4. Produire les 11 environnements du Studio (prompts en doc 06).
5. Audit Lighthouse sur l'hébergement final, passage des images en AVIF.
