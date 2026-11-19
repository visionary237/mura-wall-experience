# 06 — Audit des ressources & assets manquants

Le détail machine-lisible est dans `asset-manifest.json` (hash, dimensions, couleurs, nature, usage, publiable ou non).

## Synthèse de l'audit (20 ressources) — mise à jour du 19/11
Le client a confirmé que **toutes les images fournies lui appartiennent** et que **la machine utilisée est une Baiketech**. Le nom **MURA** est validé.

| Ressource | Usage |
|---|---|
| Vidéo salon | Hero scène 1 (scrub au scroll), pièce de démo du Studio, avant/après, masque d'occlusion |
| GIF machine sur rail | Scène 3 et page Technologie (« Animation ») |
| Photo machine Baiketech | Scène 3, page Technologie (« Notre machine ») |
| 17 autres images | Galerie MURA : Réalisations (filtrable), Inspirations, 5 pages secteurs (hero + galerie), Particuliers, Professionnels, homepage |

Deux recadrages : sur l'image de l'arche, une machine d'une autre marque (Wallpen) est sortie du champ ; sur l'une des piscines, un enfant identifiable est sorti du champ.

Toutes les images portent pour l'instant `kind: 'visuel'` (`src/data/gallery.ts`). Celles qui correspondent à des interventions réelles passent en `'realisation'` et reçoivent le badge « Réalisation ».

## Manquants
- **P0** : référence exacte du modèle Baiketech, pour compléter la fiche technique et les seuils qualité · grille tarifaire réelle.
- **P1** : logo MURA et coordonnées · environnements à mur vide pour le Studio · avant/après pris sous le même angle · mentions légales, CGV, confidentialité.
- **P2** : témoignages autorisés · clés API (images, CRM) · webhook n8n.

## Prompts de génération (environnements Studio)
Contrainte commune : *même cadrage pour tous, mur principal vide et uni, vu de face, lumière naturelle latérale, rien devant le mur au-delà du bas du cadre.*

**Gemini / Imagen (images fixes)**
```
Photographie d'architecture intérieure, [PIÈCE], vue frontale parfaitement centrée sur un grand mur blanc mat totalement vide
occupant 60 % du cadre, objectif 35 mm, hauteur d'œil 1,4 m, lumière naturelle douce venant d'une fenêtre à gauche,
ombres portées légères sur le mur, mobilier bas uniquement sous le tiers inférieur, style magazine d'architecture,
palette blanc cassé, pierre et bois, photoréaliste, 16:9, sans texte, sans œuvre, sans cadre au mur.
```
Valeurs de `[PIÈCE]` : chambre parentale · cuisine ouverte · salle de jeux d'enfants · open space de bureau · salle de restaurant avec banquette · lobby d'hôtel · couloir d'école primaire · salle de crèche · hall de piscine municipale (mur au-dessus du bassin) · salle d'attente d'hôpital · boutique en centre commercial.

**Paire « avant/après » alignée (Higgsfield / vidéo)**
```
Plan fixe sur trépied, aucune variation de caméra. Intérieur [PIÈCE], mur blanc vide. Une fresque [STYLE] apparaît
progressivement de gauche à droite comme imprimée par bandes verticales, la lumière et les ombres de la pièce restent
identiques, les meubles restent devant le mur. 8 secondes, 24 i/s, 16:9.
```
Ce format reproduit celui de la vidéo fournie : la première frame donne la pièce vide et la dernière le masque d'occlusion (`build_manifest`).

**Tournage réel à prévoir (machine)** : plan large de la machine sur son rail · gros plans de la tête d'impression en mouvement · écran de pilotage · time-lapse d'un mur complet (caméra fixe, à utiliser pour le scrub du hero) · détail de la texture imprimée.
