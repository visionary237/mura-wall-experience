"""Génère la collection d'œuvres originales de démonstration (droits : création interne DOERZ).
Usage : python3 -I scripts/generate_art.py <dossier_sortie>
"""
import math, random, sys, json, os
from PIL import Image, ImageDraw, ImageFilter

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)

def hexrgb(h):
    h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def lerp(a, b, t):
    return tuple(int(a[i] + (b[i]-a[i])*t) for i in range(3))

def vgrad(w, h, top, bottom):
    im = Image.new('RGB', (w, h)); d = ImageDraw.Draw(im)
    for y in range(h):
        d.line([(0, y), (w, y)], fill=lerp(top, bottom, y/(h-1)))
    return im

def save(im, slug):
    im.save(f'{OUT}/{slug}.webp', quality=86)
    t = im.copy(); t.thumbnail((720, 720)); t.save(f'{OUT}/{slug}-thumb.webp', quality=78)

# 1. Strates — paysage de montagnes en couches
def strata(slug, pal, seed, w=2800, h=1400):
    random.seed(seed)
    im = vgrad(w, h, hexrgb(pal[0]), hexrgb(pal[1])); d = ImageDraw.Draw(im)
    sun = hexrgb(pal[2]); r = h*0.13
    d.ellipse([w*0.68-r, h*0.28-r, w*0.68+r, h*0.28+r], fill=sun)
    layers = pal[3:]
    for i, c in enumerate(layers):
        base = h*(0.42 + i*0.12); pts = [(0, h)]
        amp = h*(0.12 - i*0.015); f1 = random.uniform(1.5, 3); f2 = random.uniform(4, 7); ph = random.uniform(0, 6)
        for x in range(0, w+20, 20):
            y = base - amp*math.sin(x/w*math.pi*f1+ph) - amp*0.35*math.sin(x/w*math.pi*f2+ph*2)
            pts.append((x, y))
        pts.append((w, h)); d.polygon(pts, fill=hexrgb(c))
    save(im, slug)

# 2. Vagues seigaiha (motif japonais traditionnel, domaine public en tant que motif)
def seigaiha(slug, bg, cols, w=2400, h=1600, R=120):
    im = Image.new('RGB', (w, h), hexrgb(bg)); d = ImageDraw.Draw(im)
    rows = int(h/(R*0.5))+3
    for row in range(rows):
        y = row*R*0.5
        off = (R if row % 2 else 0)
        for col in range(-1, int(w/(R*2))+2):
            x = col*R*2+off
            for k, rr in enumerate([1, .78, .56, .34]):
                d.ellipse([x-R*rr, y-R*rr, x+R*rr, y+R*rr], fill=hexrgb(cols[k % len(cols)]))
    save(im, slug)

# 3. Bauhaus — géométrie
def bauhaus(slug, pal, seed, w=2400, h=2400, n=6):
    random.seed(seed)
    im = Image.new('RGB', (w, h), hexrgb(pal[0])); d = ImageDraw.Draw(im); s = w//n
    for i in range(n):
        for j in range(n):
            x, y = i*s, j*s; c1, c2 = random.sample(pal[1:], 2)
            d.rectangle([x, y, x+s, y+s], fill=hexrgb(c1))
            k = random.randint(0, 4)
            if k == 0: d.ellipse([x, y, x+s, y+s], fill=hexrgb(c2))
            elif k == 1: d.pieslice([x-s, y-s, x+s, y+s], 0, 90, fill=hexrgb(c2))
            elif k == 2: d.polygon([(x, y+s), (x+s, y+s), (x+s, y)], fill=hexrgb(c2))
            elif k == 3: d.rectangle([x, y+s//2, x+s, y+s], fill=hexrgb(c2))
            else: d.ellipse([x+s*.25, y+s*.25, x+s*.75, y+s*.75], fill=hexrgb(c2))
    save(im, slug)

# 4. Flux — abstrait fluide (bandes sinueuses)
def flow(slug, pal, seed, w=3000, h=1500):
    random.seed(seed)
    im = Image.new('RGB', (w, h), hexrgb(pal[0])); d = ImageDraw.Draw(im)
    bands = 26
    for b in range(bands):
        c = hexrgb(pal[1 + b % (len(pal)-1)]); off = b*h/bands*1.3 - h*0.15
        f = random.uniform(1.2, 2.2); a = random.uniform(80, 190); ph = random.uniform(0, 6)
        top = [(x, off + a*math.sin(x/w*math.pi*f+ph) + 40*math.sin(x/170+b)) for x in range(0, w+15, 15)]
        bot = [(x, y+h/bands*1.6) for x, y in reversed(top)]
        d.polygon(top+bot, fill=c)
    im = im.filter(ImageFilter.GaussianBlur(1.2)); save(im, slug)

# 5. Forêt — silhouettes de sapins en couches, brume
def forest(slug, pal, seed, w=3200, h=1400):
    random.seed(seed)
    im = vgrad(w, h, hexrgb(pal[0]), hexrgb(pal[1])); d = ImageDraw.Draw(im)
    for li, c in enumerate(pal[2:]):
        base = h*(0.55+li*0.13); x = -50
        while x < w+50:
            tw = random.uniform(60, 130)*(1+li*0.4); th = random.uniform(220, 420)*(1+li*0.35)
            d.polygon([(x, base+40), (x+tw/2, base-th), (x+tw, base+40)], fill=hexrgb(c)); x += tw*random.uniform(0.45, 0.8)
        d.rectangle([0, base+30, w, h], fill=hexrgb(c))
    save(im, slug)

# 6. Botanique — feuillage stylisé
def botanic(slug, pal, seed, w=2600, h=1600, n=140):
    random.seed(seed)
    im = Image.new('RGB', (w, h), hexrgb(pal[0])); d = ImageDraw.Draw(im)
    for _ in range(n):
        cx, cy = random.uniform(-100, w+100), random.uniform(-100, h+100)
        L = random.uniform(160, 420); W = L*random.uniform(0.28, 0.42); ang = random.uniform(0, math.pi*2)
        c = hexrgb(random.choice(pal[1:]))
        pts = []
        for t in [i/30 for i in range(31)]:
            r = math.sin(math.pi*t)*W/2; pts.append((t*L, r))
        pts += [(x, -y) for x, y in reversed(pts)]
        ca, sa = math.cos(ang), math.sin(ang)
        d.polygon([(cx+x*ca-y*sa, cy+x*sa+y*ca) for x, y in pts], fill=c)
        d.line([(cx, cy), (cx+L*ca, cy+L*sa)], fill=lerp(c, (255, 255, 255), .25), width=4)
    save(im, slug)

# 7. Minimal — arches
def arches(slug, pal, w=2000, h=2600):
    im = Image.new('RGB', (w, h), hexrgb(pal[0])); d = ImageDraw.Draw(im)
    for i, c in enumerate(pal[1:]):
        r = w*0.42 - i*w*0.08; cx = w/2; top = h*0.25 + i*w*0.08
        d.rectangle([cx-r, top+r, cx+r, h], fill=hexrgb(c)); d.ellipse([cx-r, top, cx+r, top+2*r], fill=hexrgb(c))
    save(im, slug)

# 8. Enfance — confettis de formes
def kids(slug, pal, seed, w=3000, h=1500, n=110):
    random.seed(seed)
    im = Image.new('RGB', (w, h), hexrgb(pal[0])); d = ImageDraw.Draw(im)
    for _ in range(n):
        x, y = random.uniform(0, w), random.uniform(0, h); s = random.uniform(40, 140); c = hexrgb(random.choice(pal[1:]))
        k = random.randint(0, 2)
        if k == 0: d.ellipse([x, y, x+s, y+s], fill=c)
        elif k == 1: d.polygon([(x, y+s), (x+s/2, y), (x+s, y+s)], fill=c)
        else:
            pts = [(x+s/2+s/2*math.cos(a*math.pi/5-math.pi/2)*(1 if a % 2 == 0 else .45), y+s/2+s/2*math.sin(a*math.pi/5-math.pi/2)*(1 if a % 2 == 0 else .45)) for a in range(10)]
            d.polygon(pts, fill=c)
    save(im, slug)

# 9. Océan — houle en lignes
def ocean(slug, pal, w=3200, h=1300):
    im = vgrad(w, h, hexrgb(pal[0]), hexrgb(pal[1])); d = ImageDraw.Draw(im)
    for i in range(48):
        y0 = h*0.28 + i*h*0.016*(1+i*0.03); c = lerp(hexrgb(pal[2]), hexrgb(pal[3]), i/48)
        pts = [(x, y0 + (12+i*1.4)*math.sin(x/(140+i*6) + i*0.7)) for x in range(0, w+10, 10)]
        d.line(pts, fill=c, width=int(3+i*0.35))
    save(im, slug)

CATALOG = []
def add(slug, title, cats, mood, desc):
    CATALOG.append(dict(slug=slug, title=title, categories=cats, mood=mood, description=desc))

strata('strates-aube', ['#F6D6B8', '#F8F7F4', '#F56B35', '#D9A07B', '#B9765A', '#7E4F3F', '#3E2A26'], 3)
add('strates-aube', 'Strates — Aube', ['paysages', 'minimalisme'], ['chaleureux', 'apaisant'], "Collines en couches sous un soleil orangé.")
strata('strates-nuit', ['#0E1A2B', '#29405E', '#F3E3C3', '#30506E', '#22384F', '#172636', '#0B1520'], 8)
add('strates-nuit', 'Strates — Nocturne', ['paysages'], ['profond', 'calme'], "Variation nocturne, lune pâle et reliefs bleus.")
seigaiha('seigaiha-indigo', '#F1EBDD', ['#1F3A5F', '#F1EBDD', '#3F6E9A', '#F1EBDD'])
add('seigaiha-indigo', 'Seigaiha — Indigo', ['art-japonais', 'oceans', 'geometrie'], ['calme', 'élégant'], "Motif de vagues traditionnel japonais, réinterprété en indigo.")
seigaiha('seigaiha-or', '#151515', ['#C9A55A', '#151515', '#E6CF8F', '#151515'], R=90)
add('seigaiha-or', 'Seigaiha — Or & Noir', ['art-japonais', 'geometrie'], ['luxe', 'élégant'], "Version noir et or pour hôtels et restaurants.")
bauhaus('bauhaus-primaire', ['#F8F7F4', '#F56B35', '#151515', '#2D5DA8', '#F2C14E', '#F8F7F4'], 11)
add('bauhaus-primaire', 'Bauhaus — Primaire', ['geometrie', 'art-contemporain', 'enfance'], ['énergique', 'ludique'], "Grille de formes primaires inspirée du Bauhaus.")
bauhaus('bauhaus-terre', ['#D9D3C8', '#B65C3A', '#5E6B4E', '#E8C9A0', '#2E2A26', '#D9D3C8'], 5)
add('bauhaus-terre', 'Bauhaus — Terres', ['geometrie', 'minimalisme'], ['chaleureux', 'naturel'], "Palette terracotta et olive, adaptée aux bureaux.")
flow('flux-solaire', ['#151515', '#F56B35', '#E43F3F', '#F2A541', '#147D7A', '#3B2C5E', '#F2C14E'], 2)
add('flux-solaire', 'Flux — Solaire', ['art-abstrait', 'street-art'], ['énergique', 'vibrant'], "Rubans de couleur ondulants, très vifs.")
flow('flux-lagon', ['#0B2E3A', '#1D7A8C', '#7CC6C2', '#F8F7F4', '#2A9D8F', '#155E75'], 9)
add('flux-lagon', 'Flux — Lagon', ['art-abstrait', 'oceans'], ['apaisant', 'frais'], "Bandes aquatiques pour piscines et espaces bien-être.")
forest('foret-brume', ['#E4E8E1', '#C9D3C6', '#9FB2A0', '#6F8A74', '#3F5A47', '#1F3428'], 4)
add('foret-brume', 'Forêt — Brume', ['forets', 'nature', 'paysages'], ['apaisant', 'naturel'], "Sapins en couches dans la brume matinale.")
botanic('botanique-nuit', ['#10241C', '#2F5D46', '#4E8A61', '#86B386', '#C9A55A', '#1F4A36'], 6)
add('botanique-nuit', 'Botanique — Nuit verte', ['botanique', 'nature'], ['luxe', 'profond'], "Feuillage dense sur fond vert profond.")
botanic('botanique-clair', ['#F3EFE6', '#9DBB9A', '#6E9C74', '#E7B8A2', '#C4D7BE', '#F56B35'], 12, n=110)
add('botanique-clair', 'Botanique — Jardin clair', ['botanique', 'nature', 'enfance'], ['doux', 'lumineux'], "Feuillage pastel sur fond crème.")
arches('arches-sable', ['#F8F7F4', '#E7D8C4', '#D9B48F', '#C47E5A', '#8E4C3A'])
add('arches-sable', 'Arches — Sable', ['minimalisme', 'architecture'], ['doux', 'élégant'], "Arches emboîtées, format portrait.")
kids('confettis', ['#FFF8EC', '#F56B35', '#2D5DA8', '#F2C14E', '#5CB88A', '#E76F9A'], 7)
add('confettis', 'Confettis', ['enfance', 'pedagogie'], ['ludique', 'joyeux'], "Formes colorées pour crèches et salles de jeux.")
ocean('houle', ['#F8F7F4', '#D8E6EA', '#3F7F99', '#0F2D44'])
add('houle', 'Houle', ['oceans', 'minimalisme'], ['calme', 'apaisant'], "Lignes de houle, effet panoramique.")

json.dump(CATALOG, open(f'{OUT}/_catalog.json', 'w'), ensure_ascii=False, indent=1)
print(len(CATALOG), 'œuvres générées')
