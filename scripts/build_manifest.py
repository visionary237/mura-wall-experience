"""Construit asset-manifest.json (audit des ressources fournies) et src/data/artworks.json (catalogue Art Explorer).
Usage : python3 -I scripts/build_manifest.py <racine_projet> <dossier_uploads>
"""
import json, sys, os, hashlib
from PIL import Image

ROOT, UP = sys.argv[1], sys.argv[2]

def dominant(path, k=5):
    im = Image.open(path).convert('RGB'); im.thumbnail((200, 200))
    q = im.quantize(colors=k, method=Image.Quantize.MEDIANCUT)
    pal = q.getpalette()[:k*3]; counts = sorted(q.getcolors(), reverse=True)
    return ['#%02X%02X%02X' % tuple(pal[i*3:i*3+3]) for _, i in counts[:k]]

def orient(w, h):
    r = w/h
    return 'panoramique' if r >= 1.9 else 'paysage' if r > 1.1 else 'portrait' if r < 0.9 else 'carre'

def sha(path):
    return hashlib.sha256(open(path, 'rb').read()).hexdigest()[:16]

# ---- Audit des ressources fournies (jugements éditoriaux, à confirmer avec le client) ----
AUDIT = {
 'b38d6090-gemini_generated_video_6e806996.mp4': dict(kind='video', nature='ai_generated', subject="Salon : mur blanc puis apparition progressive d'une fresque jungle, caméra fixe, 10 s.", usage='hero_scene_1', publishable=True, note="Exploitée en séquence d'images pilotée au scroll (36 frames) + frame 0 comme environnement démo du Studio. Mention « Concept généré par IA » obligatoire."),
 'f53e49f7-image.gif': dict(kind='animation', nature='ai_generated', subject="Machine verticale sur rail imprimant une fresque florale.", usage='scene_3_concept', publishable=True, note="Ce n'est pas la machine réelle de l'entreprise : à remplacer par un tournage réel. Converti en MP4."),
 'a209fced-image.png': dict(kind='image', nature='ai_generated_probable', subject="Opérateur devant une imprimante verticale, fresque forêt brumeuse.", usage='scene_3_concept', publishable=True, note="Rendu IA probable (Gemini). Étiqueter comme concept."),
 '96175514-image.png': dict(kind='image', nature='ai_generated_probable', subject="Opérateur avec télécommande, œuvre abstraite, hall d'hôtel.", usage='hotels_concept', publishable=True, note="Rendu IA probable. Étiqueter comme concept."),
 '9666b5d4-image.png': dict(kind='image', nature='render_unknown_source', subject="Restaurant, fresque tropicale sur fond vert sombre.", usage='moodboard_only', publishable=False, note="Source inconnue (rendu 3D ou éditeur de papier peint). Référence de DA uniquement."),
 '3584d42f-image.png': dict(kind='image', nature='third_party_brand', subject="Visuel marketing d'un fabricant de machines (marque visible).", usage='moodboard_only', publishable=False, note="Marque tierce : ne pas publier. Identifier si c'est le modèle réellement utilisé par l'entreprise."),
 '933b3acc-image.png': dict(kind='image', nature='third_party_photo', subject="Salle de réunion, fresque portrait/aigle/perroquet.", usage='moodboard_only', publishable=False, note="Réalisation d'un tiers : ne pas présenter comme réalisation."),
 'a87a61dd-image.png': dict(kind='image', nature='third_party_photo', subject="Restaurant, banquette bleue, fresque botanique rose.", usage='moodboard_only', publishable=False, note="Photo d'un tiers."),
 '3bb48845-image.png': dict(kind='image', nature='third_party_photo', subject="Restaurant, fresque florale sombre, damier marbre.", usage='moodboard_only', publishable=False, note="Photo d'un tiers."),
 '932f76bd-image.png': dict(kind='image', nature='third_party_photo', subject="Café, fresque botanique fuchsia, banquette bleue.", usage='moodboard_only', publishable=False, note="Photo d'un tiers."),
 '402d5daa-image.png': dict(kind='image', nature='third_party_brand', subject="Machine sur pieds devant une fresque aquarium 3D.", usage='moodboard_only', publishable=False, note="Visuel fabricant probable."),
 'f45fdb7e-image.png': dict(kind='image', nature='third_party_brand', subject="Machine d'une marque tierce, paysage d'arche rocheuse.", usage='moodboard_only', publishable=False, note="Marque tierce visible."),
 '6365be25-image.png': dict(kind='image', nature='third_party_photo', subject="Restaurant lumineux, fresque botanique avec paon, chaises roses.", usage='moodboard_only', publishable=False, note="Photo d'un tiers."),
 'bb1757cc-image.png': dict(kind='image', nature='render_unknown_source', subject="Restaurant, fresque arbres rosés sur fond noir.", usage='moodboard_only', publishable=False, note="Rendu d'un tiers probable."),
 'd4953493-image.png': dict(kind='image', nature='derivative_public_domain', subject="Salon, réinterprétation de La Grande Vague (Hokusai).", usage='moodboard_only', publishable=False, note="L'œuvre originale est dans le domaine public ; cette réinterprétation, elle, a un auteur inconnu."),
 'c5e2c7e8-image.png': dict(kind='image', nature='third_party_photo', subject="Couloir d'école, fresque « monde et continents » avec portrait et citation d'une personnalité.", usage='moodboard_only', publishable=False, note="Réalisation d'un tiers + portrait d'une personne réelle : ne pas publier."),
 '9c0cd8af-image.png': dict(kind='image', nature='unknown', subject="Piscine, fresque marine dauphins/tortue.", usage='moodboard_only', publishable=False, note="Source à identifier."),
 '19482859-image.png': dict(kind='image', nature='derivative_unknown', subject="Salon, vagues japonaises noir et or.", usage='moodboard_only', publishable=False, note="Mockup d'un éditeur de papier peint probable."),
 'f382a0a2-image.png': dict(kind='image', nature='third_party_photo', subject="Couloir d'école, fresque fleuve/bateau/espace.", usage='moodboard_only', publishable=False, note="Réalisation d'un tiers."),
 '6372fade-image.png': dict(kind='image', nature='third_party_photo', subject="Piscine, fresque marine ; un enfant est visible.", usage='moodboard_only', publishable=False, note="Photo d'un tiers avec un mineur identifiable : exclure."),
}

# Confirmé par le client (19/11/2026) : toutes les images fournies lui appartiennent ; la machine utilisée est une Baiketech.
CROPPED = {'f45fdb7e-image.png': 'machine d’une autre marque recadrée hors champ', '6372fade-image.png': 'enfant identifiable recadré hors champ'}
for name, a in AUDIT.items():
    a['owner'] = 'MURA (fourni par le client)'
    a['publishable'] = True
    if a['kind'] == 'image':
        a['usage'] = 'gallery'
        a['nature'] = 'client_owned'
        a['note'] = 'Publié dans la galerie MURA (kind = visuel tant que réel/rendu non précisé).' + (f" Recadré : {CROPPED[name]}." if name in CROPPED else '')
    if name == '3584d42f-image.png':
        a['note'] = 'Machine réelle de MURA (Baiketech). Page Technologie + scène 3.'

resources = []
for name, a in AUDIT.items():
    p = os.path.join(UP, name); entry = dict(id=name.split('-')[0], file=name, sha256_16=sha(p), **a)
    if a['kind'] == 'image':
        w, h = Image.open(p).size; entry.update(width=w, height=h, orientation=orient(w, h), dominant_colors=dominant(p))
    resources.append(entry)

# ---- Catalogue d'œuvres ----
cat = json.load(open(os.path.join(ROOT, 'public/art/_catalog.json')))
artworks = []
for i, c in enumerate(cat):
    p = os.path.join(ROOT, 'public/art', c['slug'] + '.webp'); w, h = Image.open(p).size
    artworks.append(dict(
        id=f"art-{i+1:03d}", slug=c['slug'], title=c['title'], description=c['description'],
        author='Studio DOERZ (génératif)', source='internal', sourceUrl=None,
        license='Création originale — cession au client à formaliser', commercialUse=True, modificationAllowed=True,
        attribution=None, width=w, height=h, orientation=orient(w, h), dominantColors=dominant(p),
        categories=c['categories'], mood=c['mood'], src=f"/art/{c['slug']}.webp", thumb=f"/art/{c['slug']}-thumb.webp",
        rightsStatus='validated', printQualityStatus='vector_regenerable', aiGenerated=False))

# Fresque jungle issue de la vidéo fournie (IA) : visible, non imprimable tant que droits/qualité non validés
jp = os.path.join(ROOT, 'public/art/jungle-concept.webp')
if os.path.exists(jp):
    w, h = Image.open(jp).size
    artworks.append(dict(id='art-900', slug='jungle-concept', title='Jungle — concept IA', description="Fresque tropicale extraite de la vidéo de référence fournie.",
        author='Généré par IA (Gemini) pour le client', source='client_upload', sourceUrl=None, license='À vérifier (conditions Gemini + propriété client)',
        commercialUse=None, modificationAllowed=None, attribution=None, width=w, height=h, orientation=orient(w, h), dominantColors=dominant(jp),
        categories=['botanique', 'nature', 'forets'], mood=['luxuriant', 'vibrant'], src='/art/jungle-concept.webp', thumb='/art/jungle-concept-thumb.webp',
        rightsStatus='pending', printQualityStatus='insufficient_resolution', aiGenerated=True))

missing = [
 dict(asset="Logo MURA et coordonnées (le nom MURA est validé)", priority='P1'),
 dict(asset="Référence exacte du modèle Baiketech (pour la fiche technique : résolution, hauteur max, supports, encres)", priority='P0', blocker=True),
 dict(asset="Grille tarifaire réelle (m², minimum, déplacement, préparation)", priority='P0', blocker=True, why="Le moteur tarifaire reste en mode démo d'ici là"),
 dict(asset="Réalisations authentiques avec autorisation de publication (avant/après alignés)", priority='P1'),
 dict(asset="Photos d'environnement à mur vide : chambre, cuisine, salle de jeux, bureau, restaurant, hôtel, école, crèche, piscine, hôpital, commerce", priority='P1', why="Studio : seul le salon existe (frame 0 de la vidéo)"),
 dict(asset="Témoignages clients réels et autorisés", priority='P2'),
 dict(asset="Mentions légales, politique de confidentialité, CGV", priority='P1'),
 dict(asset="Clés API (Unsplash/Pexels) et endpoint webhook n8n/CRM", priority='P2'),
]

manifest = dict(project='DOERZ — Wall Printing Digital Experience', generated='2026-11-19', resources=resources,
                derived_assets=[
                    dict(path='public/media/hero-seq/f001..f036.webp', from_='b38d6090', usage='Scène 1, scrub au scroll'),
                    dict(path='public/media/gallery/*.webp', from_='18 images client', usage='Galerie, secteurs, réalisations, technologie'),
                    dict(path='public/media/hero-reveal.mp4', from_='b38d6090', usage='Fallback vidéo / showreel'),
                    dict(path='public/media/rooms/salon-blank.jpg', from_='b38d6090 frame 0', usage='Environnement démo Studio + avant/après'),
                    dict(path='public/media/rooms/salon-final.jpg', from_='b38d6090 dernière frame', usage='Avant/après'),
                    dict(path='public/media/printer-concept.mp4', from_='f53e49f7', usage='Scène 3'),
                    dict(path='public/art/*.webp', from_='scripts/generate_art.py', usage='Collection originale Art Explorer')],
                missing_assets=missing)
json.dump(manifest, open(os.path.join(ROOT, 'asset-manifest.json'), 'w'), ensure_ascii=False, indent=2)
os.makedirs(os.path.join(ROOT, 'src/data'), exist_ok=True)
json.dump(artworks, open(os.path.join(ROOT, 'src/data/artworks.json'), 'w'), ensure_ascii=False, indent=1)
print(len(resources), 'ressources auditées,', len(artworks), 'œuvres cataloguées,', sum(r['publishable'] for r in resources), 'publiables')
