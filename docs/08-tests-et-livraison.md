# 08 — Tests, administration, portfolio

## Tests exécutés
**Unitaires (Vitest) : 21/21.** Homographie (coins exacts, inverse, quadrilatère croisé ou dégénéré) · surface nette avec obstacle · contrôle qualité (4 cas + format) · estimateur (minimum, remise, déplacement, mode manuel) · validation du lead et score · filtres de l'Explorer (texte, catégorie, droits, couleur, similaires).

**Bout en bout (Playwright + Chrome) : 11/11, 0 erreur console.**
1. 23 routes : HTTP 200 + h1
2. Consentement (refus mémorisé)
3. Homepage : scrub du hero (frame vérifiée sur canvas) + 9 scènes
4. Explorer : recherche, filtre droits, catégorie, couleur, favoris, comparaison ×2, lightbox en intérieur
5. Studio : coin au clavier → obstacle (surface exclue > 0) → réglages → qualité → avant/après → 2 variantes → export PNG
6. Studio : import d'une photo de mur et d'une œuvre, glisser un coin à la souris, refus d'un GIF
7. Studio → transmission → devis (renvoi vers l'étape en erreur, consentement obligatoire) → lead en dry-run contenant simulation, œuvre, score ≥ 50 → visible dans l'admin → export CSV
8. Estimateur : bandeau démo + remise volume
9. Landing sectorielle (mentions « à confirmer »)
10. Mobile 390 px : aucun débordement horizontal, menu
11. Reduced motion : hero statique

Non couverts à ce stade : Safari/iOS réel (à vérifier en priorité : le réglage luminosité/contraste repose sur `ctx.filter`, dont le support Safari est récent), Lighthouse, lecteurs d'écran réels.

## Guide administrateur (prototype)
- **Tarifs et seuils** : `src/config/site.ts` (`pricingConfig.mode` : `demo` affiche des montants fictifs signalés, `manual` masque les montants, `live` pour les tarifs validés).
- **Ajouter une œuvre** : déposer `slug.webp` + `slug-thumb.webp` dans `public/art/`, compléter `scripts/generate_art.py` ou `_catalog.json`, puis lancer `npm run assets`. Une œuvre externe doit avoir `rightsStatus: "validated"` et `commercialUse: true` pour être imprimable.
- **Secteurs** : `src/data/sectors.ts`. **Environnements Studio** : `src/data/rooms.ts` (photo, 4 coins, dimensions réelles, masque d'occlusion facultatif).
- **Demandes** : `/admin` (données du navigateur uniquement, jusqu'à la phase 5).

## Trame de l'étude de cas DOERZ
1. **Enjeu** : vendre une prestation technique à des clients qui n'arrivent pas à se projeter.
2. **Insight** : le frein, c'est l'imagination. Le site doit donc montrer le mur du client avant toute discussion.
3. **Réponse** : homepage-récit (mur blanc → œuvre), bibliothèque aux droits tracés, Studio de simulation sur photo, devis pré-qualifié.
4. **Craft** : moteur de perspective maison, carte d'ombrage, occlusion par différence de frames, motion GSAP, accessibilité.
5. **Business** : dossier CRM structuré, score de lead, funnel mesuré. Prévoir 3 KPI à 90 jours (taux de simulation, part des devis avec simulation, coût par lead qualifié).
6. **Assets** : captures `shots/`, showreel (scrub du hero, manipulation du Studio, avant/après, admin). Montage de 45 s à réaliser.
