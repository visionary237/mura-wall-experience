# 03 — Données & bibliothèque d'œuvres

Schéma cible : `supabase/schema.sql` (tables `artworks`, `categories`, `collections`, `realisations`, `pricing_rules`, `quality_thresholds`, `projects`, `leads`, `events`, `admins`, avec RLS).

## Fiche œuvre (implémentée dans `src/data/artworks.json`)
id · slug · titre · description · auteur · source · URL originale · licence · usage commercial · modification · attribution · dimensions · orientation · couleurs dominantes (quantification médiane, 5 couleurs) · catégories · ambiances · aperçu optimisé · statut des droits · statut qualité d'impression · généré par IA.

**Règle appliquée dans le code** : `isPrintable(a) = rightsStatus === 'validated' && commercialUse === true`. L'interface signale toute œuvre non validée. Côté base, une contrainte empêche de publier une œuvre aux droits non validés, sauf un concept IA explicitement étiqueté.

## Collection actuelle
- **14 œuvres originales génératives** (`scripts/generate_art.py`) : droits maîtrisés, régénérables à n'importe quelle résolution. La cession au client reste à formaliser au contrat.
- **1 concept IA** (fresque jungle extraite de la vidéo fournie) : visible, **non imprimable** tant que les droits (conditions Gemini et propriété) et la résolution (910 px) ne sont pas validés.

## Étude des sources externes
| Source | Ce qu'il faut vérifier avant intégration | Recommandation |
|---|---|---|
| Unsplash API | Licence Unsplash : usage commercial permis, mais interdiction de compiler les photos pour reproduire un service similaire, obligation de hotlinker les images et de déclencher l'endpoint de téléchargement | Inspiration uniquement, puis rachat ou validation au cas par cas pour l'impression |
| Pexels API | Licence Pexels : attribution demandée pour l'API, interdiction de vendre des copies non modifiées | À valider juridiquement pour la vente d'impressions murales |
| Pixabay API | Conditions propres à Pixabay, cache limité à 24 h via l'API, téléchargement HD sous conditions | Idem |
| Openverse | Agrégateur multi-licences (CC0, CC BY, CC BY-SA, NC…) | Filtrer `license_type=commercial,modification` ; stocker la licence de chaque image |
| Musées en accès ouvert (Rijksmuseum, Met, Paris Musées, Smithsonian…) | CC0 ou domaine public selon l'institution et la photographie | Meilleure source pour Art classique / Renaissance / Art japonais |

> Ces conditions évoluent : chaque fournisseur doit être revalidé (CGU en vigueur) avant l'intégration en phase 5. Une image accessible publiquement n'est jamais considérée comme imprimable par défaut.

Flux d'ingestion prévu : import → `rights_status = pending` → contrôle de la licence et de la résolution par un éditeur → preuve archivée (`rights_evidence_path`) → `validated` → publication.
