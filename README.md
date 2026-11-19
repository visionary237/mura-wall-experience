# DOERZ — Wall Printing Digital Experience

Plateforme pour une entreprise d'impression murale verticale. Elle combine un site immersif, une bibliothèque d'œuvres (Art Explorer), un simulateur sur photo (Wall Creative Studio), un contrôle qualité d'impression, un estimateur et un générateur de dossiers de devis prêts pour le CRM.

> **Statut : prototype fonctionnel (phases 1 à 4 en MVP + back-office de démonstration).**
> Le nom de marque `MURA`, les tarifs et les seuils qualité sont des **placeholders**, centralisés dans `src/config/site.ts`.

## Démarrer

```bash
npm install
npm run dev            # http://localhost:3000
npm test               # 21 tests unitaires (homographie, qualité, tarifs, leads, explorer)
STATIC_EXPORT=1 npm run build   # export statique dans out/
python3 -I tests/e2e.py http://localhost:4173 ./shots <image.png>   # 12 scénarios E2E (Playwright + Chrome)
```

Variables d'environnement (facultatives) :

| Variable | Rôle |
|---|---|
| `NEXT_PUBLIC_LEAD_WEBHOOK_URL` | Webhook n8n de réception des devis. **Absent = mode dry-run** : aucun envoi, stockage local. |
| `NEXT_PUBLIC_BASE_PATH` | Sous-chemin de déploiement. |

## Ce qui fonctionne (testé)

| Module | État | Détail |
|---|---|---|
| Homepage 9 scènes | ✅ | Scrub de 36 frames (vidéo fournie) au scroll, pin GSAP ScrollTrigger, révélations clip-path, comparateurs avant/après, version reduced-motion |
| Art Explorer | ✅ | Recherche (accents/pluriels), 18 catégories, orientation, ambiance, couleur dominante (distance redmean), collections, favoris, comparaison ×3 en intérieur, lightbox + métadonnées de licence, œuvres similaires |
| Wall Creative Studio | ✅ | 6 étapes, import œuvre/photo (validation format/poids, ré-encodage sans EXIF), 4 coins draggables (souris, tactile, clavier), obstacles polygone/rectangle, surface nette en m² via homographie inverse, warp perspective, carte d'ombrage, masque d'occlusion, opacité/luminosité/contraste/rotation/échelle, avant/après, variantes, export PNG filigrané, transmission au devis |
| Contrôle qualité | ✅ | DPI effectif, écart de ratio, seuils configurables par distance d'observation |
| Estimateur | ✅ | Moteur administrable (m², minimum, km, préparation, création, accès, remises volume) ; modes `demo` / `manual` / `live` |
| Devis | ✅ | 3 étapes, segments + multisite, simulation jointe, validation accessible, consentements séparés, UTM, score de qualification, payload versionné |
| Back-office démo | ✅ | Demandes, export CSV/JSON, funnel, registre des droits, configuration tarifs |
| Landing pages | ✅ | 8 secteurs regroupant les 21 segments, illustrés par les visuels MURA (contenus non vérifiés signalés « à confirmer ») |
| Galerie MURA | ✅ | 18 visuels du client : réalisations filtrables, visionneuse clavier, secteurs, inspirations, homepage, page Technologie (machine Baiketech) |
| Rendu IA, segmentation auto, Supabase, n8n live | ⏳ | Conçus (docs), non branchés : phases 5–6 |

## Structure

```
src/
  app/                 routes (23 pages)
  components/          UI (home/, studio/, explorer/)
  config/site.ts       marque, tarifs, seuils qualité  ← à remplacer par les données réelles
  data/                artworks.json (généré), sectors.ts, rooms.ts
  lib/                 homography, warp (moteur de rendu), quality, pricing, lead, artworks, store, analytics
scripts/               generate_art.py (collection originale), build_manifest.py (audit + catalogue)
supabase/schema.sql    schéma cible (RLS)
n8n/                   workflow de réception des devis
docs/                  architecture, DA, données, tracking, CRM, assets manquants, roadmap, tests
asset-manifest.json    audit des 20 ressources fournies
tests/                 core.test.ts (Vitest), e2e.py (Playwright)
```

Documentation : voir `docs/`.
