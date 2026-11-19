# 01 — Architecture technique & UX

## Choix techniques

| Couche | Choix | Pourquoi |
|---|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript strict | SSG pour le SEO des landing pages, composants client pour Studio/Explorer |
| Style | Tailwind CSS v4 (`@theme` = tokens du design system) | Tokens centralisés dans `globals.css` |
| Motion | GSAP + ScrollTrigger (pin, scrub, clip-path) ; scrub natif rAF pour le hero | Le hero dessine sur canvas, ce qui évite de décoder une vidéo au scroll |
| Polices | `@fontsource-variable` (Space Grotesk, Manrope, Inter), auto-hébergées | Pas d'appel Google Fonts, donc RGPD et performance |
| Éditeur mural | **Canvas 2D + homographie maison** (`lib/homography.ts`, `lib/warp.ts`) | Ni Konva ni Fabric ne gèrent nativement la perspective projective. Le maillage triangulé 22×22 donne un warp exact aux nœuds, exportable en PNG, sans WebGL. Un passage à WebGL n'est utile que pour la 4K temps réel. |
| Données | JSON statique (phase 1–4) → Supabase PostgreSQL + Storage (phase 5) | `supabase/schema.sql` |
| Automatisation | Webhook → n8n → HubSpot / Brevo | `docs/05-crm-automation.md` |

### Pipeline de rendu du Studio (`lib/warp.ts`)
1. Photo de la pièce.
2. Clip = quadrilatère du mur **moins** les obstacles (règle evenodd).
3. Œuvre pré-filtrée une seule fois (luminosité/contraste, réduite à 1800 px pour l'aperçu).
4. Placement dans l'espace métrique du mur (cover/contain, échelle, décalage, rotation), puis homographie vers les pixels photo, sur un maillage triangulé.
5. **Carte d'ombrage** : luminance du mur ÷ son 95ᵉ centile, multipliée sur l'œuvre (intensité réglable). Les rais de lumière et les ombres de la photo restent visibles.
6. **Occlusion** : calque RGBA des objets devant le mur, redessiné par-dessus. Pour la pièce de démo, il est calculé automatiquement par différence entre la première et la dernière frame de la vidéo fournie.
7. Export : canvas pleine résolution + filigrane « Simulation indicative ».

## Architecture UX

```
Inspiration ──► Art Explorer ──► Studio ──► Qualité ──► Projet ──► Devis ──► CRM
     ▲              │ favoris        │ variantes            │ estimation
Homepage / Secteurs ┘                └─ export PNG          └─ Tarifs
```

Principes :
- **Aucun compte requis.** Les projets et favoris sont stockés dans localStorage, et rien ne part sans action explicite.
- Chaque CTA transporte le contexte : `?art=` vers le Studio, `?project=` vers le devis (simulation jointe), `?segment=&sector=&multisite=` depuis les secteurs, et les paramètres de l'estimateur vers le formulaire.
- Les simulations et concepts IA sont **toujours étiquetés**.

## Arborescence (23 routes)

`/` · `/inspirations` · `/oeuvres` · `/studio` · `/technologie` · `/comment-ca-marche` · `/realisations` · `/particuliers` · `/professionnels` · `/secteurs/{collectivites, hotels-restaurants, ecoles-creches, piscines, sante, ehpad, bureaux-commerces, musees}` · `/tarifs` · `/faq` · `/a-propos` · `/contact` · `/confidentialite` · `/admin`

Correspondance avec les 21 segments B2B : chaque page secteur liste ses segments (ex. *Collectivités* = mairies, bibliothèques, services publics, universités…). Le formulaire de devis propose les 21 segments dans « Type d'établissement ».

## Sécurité & confidentialité (implémenté / prévu)
- ✅ Validation du type MIME et du poids, ré-encodage canvas (EXIF/GPS supprimés), traitement 100 % local.
- ✅ Consentement analytics opt-in ; journal d'événements local anonyme.
- ✅ Consentements de traitement et de relance séparés, horodatés, avec le texte affiché enregistré.
- ⏳ Phase 5 : bucket privé, URL signées (durée courte), rétention (ex. 12 mois sans suite), suppression à la demande, rôles admin (RLS).
- Règle : les photos clients ne sont jamais réutilisées (marketing, entraînement) sans autorisation écrite.

## Performance & accessibilité
- Hero : 36 frames WebP (2,2 Mo au total, la première et la dernière en priorité, les autres en lazy), fallback statique en reduced-motion.
- Vidéos en H.264 faststart avec `preload="none"`, images lazy.
- Navigation clavier complète, coins et points d'obstacle pilotables aux flèches, focus visibles, lien d'évitement, dialogues avec Échap et restitution du focus, `aria-live` sur les résultats et estimations.
- ⏳ Audit Lighthouse/Core Web Vitals à faire sur l'hébergement final (AVIF + CDN).
