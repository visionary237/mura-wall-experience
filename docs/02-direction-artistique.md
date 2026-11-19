# 02 — Direction artistique & design system

**Concept :** une galerie d'architecture plutôt qu'une landing page SaaS. Le mur est le héros. L'interface s'efface (blanc architectural, noir galerie) et la couleur vient uniquement des œuvres. L'orange signale l'action.

## Tokens (`src/app/globals.css`)
| Token | Valeur | Usage |
|---|---|---|
| `wall` | #F8F7F4 | fond principal |
| `ink` | #151515 | texte, sections sombres, Studio |
| `stone` | #D9D3C8 | fonds secondaires, placeholders |
| `concrete` | #8B8B87 | légendes, labels |
| `flame` | #F56B35 | CTA, état actif, progression (avec parcimonie) |

Typographie : **Space Grotesk** (titres, tracking −3,5 %, interlignage 0,95), **Manrope** (texte), **Inter** (UI, eyebrows en capitales espacées). Échelle display fluide jusqu'à 15vw (hero mobile).

## Composants
`btn` (primary / flame / ghost) · `chip` (filtres, `aria-pressed`) · `field` (souligné éditorial) · `label` · `eyebrow` · `badge-ai` · `range` · `reveal` · `PageHero` · `Section` · `ArtCard` · `FavButton` · `BeforeAfter` · `WallPreview` · `ArtGrid`.

## Motion
- Easing maison `--ease-gallery` (cubic-bezier .22,1,.36,1), durées de 0,7 à 1,4 s, jamais de rebond.
- Hero : transformation du mur pilotée par le scroll (12 → 88 % de la section) et barre de progression orange.
- Scène 2 : pin GSAP, l'œuvre change par paliers (rendu Studio en direct).
- Scène 3 : révélation clip-path pilotée au scroll.
- Grilles : apparition décalée de 60 ms.
- `prefers-reduced-motion` : tout est désactivé et le hero devient statique.

## Studio
Identité « outil de création » : fond #1b1b1a, panneau d'étapes à gauche, poignées orange, scène centrée en plein cadre.

## À adapter avec l'identité réelle
Logo, nom, et éventuellement une couleur d'accent de marque à la place de `flame`. Les tokens étant centralisés, le changement se fait dans un seul fichier.
