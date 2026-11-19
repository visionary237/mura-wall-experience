"""Tests fonctionnels de bout en bout (Playwright + Chrome).
Usage : python3 -I tests/e2e.py <base_url> <dossier_captures> <image_test>
"""
import sys, os, json
from playwright.sync_api import sync_playwright, expect

BASE, SHOTS, TEST_IMG = sys.argv[1].rstrip('/'), sys.argv[2], sys.argv[3]
os.makedirs(SHOTS, exist_ok=True)
results, errors = [], []

def check(name, fn):
    try:
        fn(); results.append((name, 'OK'))
    except Exception as e:  # noqa
        import traceback
        ln = [f.lineno for f in traceback.extract_tb(e.__traceback__) if f.filename.endswith('e2e.py')][-1]
        results.append((name, f'ÉCHEC (l.{ln}) : {(str(e).splitlines() or [repr(e)])[0][:200]}'))

with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    ctx = b.new_context(viewport={'width': 1440, 'height': 900}, locale='fr-FR')
    page = ctx.new_page()
    page.set_default_timeout(8000)
    page.on('console', lambda m: m.type == 'error' and errors.append(f'{page.url} :: {m.text[:200]}'))
    page.on('pageerror', lambda e: errors.append(f'{page.url} :: PAGEERROR {e}'))
    shot = lambda n, full=False: page.screenshot(path=f'{SHOTS}/{n}.png', full_page=full)

    # ---- Toutes les pages répondent sans erreur JS
    routes = ['/', '/inspirations/', '/oeuvres/', '/studio/', '/technologie/', '/comment-ca-marche/', '/realisations/', '/particuliers/', '/professionnels/',
              '/secteurs/collectivites/', '/secteurs/hotels-restaurants/', '/secteurs/ecoles-creches/', '/secteurs/piscines/', '/secteurs/sante/', '/secteurs/ehpad/',
              '/secteurs/bureaux-commerces/', '/secteurs/musees/', '/tarifs/', '/faq/', '/a-propos/', '/contact/', '/confidentialite/', '/admin/']
    def all_routes():
        for r in routes:
            resp = page.goto(BASE + r, wait_until='networkidle')
            assert resp.status == 200, f'{r} → {resp.status}'
            assert page.locator('h1').count() >= 1, f'{r} sans h1'
    check('23 routes : HTTP 200 + h1', all_routes)

    # ---- Consentement
    def consent():
        page.goto(BASE + '/', wait_until='networkidle')
        page.get_by_role('button', name='Refuser').click()
        expect(page.get_by_role('dialog', name="Préférences de mesure d'audience")).to_have_count(0)
    check('Bandeau consentement (refus mémorisé)', consent)

    # ---- Homepage scroll
    def home():
        page.goto(BASE + '/', wait_until='networkidle'); page.wait_for_timeout(600); shot('01-home-hero')
        H = page.evaluate('innerHeight')
        page.mouse.wheel(0, H * 1.2); page.wait_for_timeout(900); shot('02-home-hero-mid')
        page.evaluate(f'scrollTo(0, {H * 2.3})'); page.wait_for_timeout(900); shot('03-home-hero-end')
        # vérifie que la frame affichée a changé (canvas non vide)
        ok = page.evaluate("(() => { const c = document.querySelector('section canvas'); const d = c.getContext('2d').getImageData(c.width*0.3|0, c.height*0.35|0, 1, 1).data; return d[0]+d[1]+d[2] })()")
        assert ok > 0
        page.locator('section[aria-label="Un mur, mille possibilités"]').scroll_into_view_if_needed(); page.wait_for_timeout(1500); shot('04-home-transformation')
        page.locator('#tech-title').scroll_into_view_if_needed(); page.wait_for_timeout(800); shot('05-home-tech')
        page.locator('#insp').scroll_into_view_if_needed(); page.mouse.wheel(0, 500); page.wait_for_timeout(1200); shot('06-home-inspiration')
        page.locator('#miy').scroll_into_view_if_needed(); page.wait_for_timeout(1500); shot('07-home-makeityours')
        page.locator('#spaces').scroll_into_view_if_needed(); page.wait_for_timeout(500); shot('08-home-spaces')
        page.locator('#ba').scroll_into_view_if_needed(); page.mouse.wheel(0, 300); page.wait_for_timeout(1500); shot('09-home-beforeafter')
        page.locator('#start').scroll_into_view_if_needed(); page.wait_for_timeout(400); shot('10-home-start')
    check('Homepage : scrub hero + 9 scènes', home)

    # ---- Art Explorer
    def explorer():
        page.goto(BASE + '/oeuvres/', wait_until='networkidle')
        n0 = page.locator('article').count(); assert n0 >= 15, n0
        page.get_by_placeholder('Rechercher une œuvre').fill('vague'); page.wait_for_timeout(300)
        assert 0 < page.locator('article').count() < n0
        page.get_by_placeholder('Rechercher une œuvre').fill('')
        page.get_by_role('button', name='Droits validés').click(); page.wait_for_timeout(200)
        assert page.locator('article').count() == n0 - 1, 'filtre droits'
        page.get_by_role('button', name='Droits validés').click()
        page.get_by_role('button', name='Art japonais').click(); page.wait_for_timeout(200)
        assert page.locator('article').count() == 2
        page.get_by_role('button', name='Réinitialiser').first.click()
        page.get_by_role('button', name='Couleur #2D5DA8').click(); page.wait_for_timeout(200)
        assert page.locator('article').count() >= 1
        page.get_by_role('button', name='Réinitialiser').first.click()
        page.locator('article').first.get_by_role('button', name='Ajouter aux favoris').click()
        page.get_by_role('button', name='♥ Favoris (1)').click(); page.wait_for_timeout(200)
        assert page.locator('article').count() == 1
        page.get_by_role('button', name='♥ Favoris (1)').click()
        shot('11-explorer', True)
        page.locator('article').nth(2).get_by_role('button', name='Sélectionner pour comparaison').click()
        page.locator('article').nth(5).get_by_role('button', name='Sélectionner pour comparaison').click()
        page.get_by_role('button', name='Comparer dans un intérieur').click(); page.wait_for_timeout(1500); shot('12-explorer-compare')
        page.keyboard.press('Escape')
        page.locator('article').nth(0).get_by_role('button', name='Voir').click(); page.wait_for_timeout(500)
        expect(page.get_by_text('Œuvres similaires')).to_be_visible()
        page.get_by_role('button', name='Dans un intérieur', exact=True).click(); page.wait_for_timeout(1200); shot('13-explorer-lightbox')
        page.keyboard.press('Escape')
    check('Art Explorer : recherche, filtres, couleur, favoris, comparaison, lightbox', explorer)

    # ---- Studio complet
    def studio():
        page.goto(BASE + '/studio/?art=art-010', wait_until='networkidle'); page.wait_for_timeout(1200)
        shot('14-studio-step1')
        page.get_by_role('button', name='Étape suivante').click()
        page.get_by_role('button', name='Étape suivante').click()  # → surface
        page.wait_for_timeout(500)
        # déplacer le coin haut-gauche au clavier puis vérifier la surface
        h = page.get_by_role('slider', name='Coin haut gauche du mur'); h.focus()
        for _ in range(3): page.keyboard.press('Shift+ArrowRight')
        page.get_by_role('button', name='+ Rectangle (porte, fenêtre)').click(); page.wait_for_timeout(400)
        txt = page.get_by_text('Surface brute').inner_text(); assert 'imprimable' in txt and 'exclue 0 m²' not in txt, txt
        shot('15-studio-surface')
        page.get_by_role('button', name='Supprimer').first.click()
        page.get_by_role('button', name='Étape suivante').click()
        page.get_by_label('Rotation').fill('0')
        page.locator('input[type=range]').first.fill('1.4'); page.wait_for_timeout(700)
        shot('16-studio-customize')
        page.get_by_role('button', name='Remplir la surface').click()
        page.get_by_role('button', name='Étape suivante').click(); page.wait_for_timeout(700)
        expect(page.get_by_text('Contrôle qualité préliminaire')).to_be_visible()
        expect(page.get_by_text('Résolution effective')).to_be_visible()
        page.get_by_label('Comparateur avant / après').fill('50'); page.wait_for_timeout(500); shot('17-studio-preview')
        page.get_by_role('button', name='Enregistrer le projet').click()
        page.get_by_role('button', name='Enregistrer', exact=True).click(); page.wait_for_timeout(300)
        page.get_by_role('button', name='Nouvelle variante').click(); page.wait_for_timeout(300)
        assert page.evaluate("JSON.parse(localStorage.getItem('mura.projects')).length") == 2
        with page.expect_download() as d: page.get_by_role('button', name='Télécharger l’aperçu (PNG)').click()
        assert d.value.suggested_filename.endswith('.png')
        shot('18-studio-save')
    check('Studio : œuvre → surface → obstacle → réglages → qualité → variantes → PNG', studio)

    def studio_upload():
        page.goto(BASE + '/studio/', wait_until='networkidle')
        page.locator('input[type=file]').first.set_input_files(TEST_IMG); page.wait_for_timeout(800)
        page.get_by_role('button', name='Étape suivante').click()
        page.locator('input[type=file]').set_input_files(TEST_IMG); page.wait_for_timeout(1200)
        expect(page.get_by_role('heading', name='Définir la surface')).to_be_visible()
        # glisser un coin à la souris
        hnd = page.get_by_role('slider', name='Coin bas droit du mur'); bb = hnd.bounding_box()
        page.mouse.move(bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 2); page.mouse.down(); page.mouse.move(bb['x'] + 60, bb['y'] + 40, steps=6); page.mouse.up()
        page.wait_for_timeout(600); shot('19-studio-upload')
        # import d'un format refusé
        tmp = '/tmp/x.gif'; open(tmp, 'wb').write(b'GIF89a')
        page.get_by_role('button', name='1 Image').click()
        page.locator('input[type=file]').first.set_input_files(tmp); page.wait_for_timeout(300)
        expect(page.get_by_text('Format non pris en charge')).to_be_visible()
    check('Studio : import photo mur + œuvre, drag coin, refus GIF', studio_upload)

    # ---- Transmission → devis → admin
    def quote():
        page.goto(BASE + '/studio/?art=art-004', wait_until='networkidle'); page.wait_for_timeout(800)
        page.get_by_role('button', name='6 Projet').click()
        page.get_by_role('button', name='Transmettre mon projet →').click()
        page.wait_for_url('**/contact/**'); page.wait_for_timeout(800)
        page.get_by_role('button', name='Collectivité / établissement public').click()
        page.get_by_role('button', name='3. Coordonnées').click()
        page.get_by_role('button', name='Envoyer ma demande →').click(); page.wait_for_timeout(300)
        expect(page.get_by_text('Code postal à 5 chiffres')).to_be_visible()  # renvoyé à l'étape 1
        page.locator('[name=organisation]').fill('Mairie de Test')
        page.locator('[name=establishmentType]').select_option('Mairies')
        page.locator('[name=postalCode]').fill('76600')
        page.get_by_role('button', name='Continuer →').first.click()
        expect(page.get_by_text('Simulation jointe :')).to_be_visible()
        page.locator('[name=budget]').select_option('5-15k'); page.locator('[name=timeline]').select_option('1-3-mois')
        page.get_by_role('button', name='Continuer →').first.click()
        page.locator('[name=firstName]').fill('Camille'); page.locator('[name=lastName]').fill('Test'); page.locator('[name=email]').fill('camille@example.org')
        shot('20-contact-form')
        page.get_by_role('button', name='Envoyer ma demande →').click(); page.wait_for_timeout(300)
        expect(page.get_by_text('Le consentement au traitement')).to_be_visible()
        page.locator('[name=consent]').check()
        page.get_by_role('button', name='Envoyer ma demande →').click(); page.wait_for_timeout(500)
        expect(page.get_by_text('Merci, votre dossier est prêt.')).to_be_visible()
        shot('21-contact-done')
        lead = page.evaluate("JSON.parse(localStorage.getItem('mura.leads'))[0]")
        assert lead['segment'] == 'collectivite' and lead['simulation'] and lead['artwork']['id'] == 'art-004' and lead['score'] >= 50 and lead['delivery'] == 'dry-run', json.dumps(lead)[:300]
        assert lead['project']['surfaceM2'] > 0 and lead['consents']['processing'] is True
        page.goto(BASE + '/admin/', wait_until='networkidle')
        expect(page.get_by_text('Mairie de Test')).to_be_visible()
        with page.expect_download() as d: page.get_by_role('button', name='Exporter CSV').click()
        assert 'Mairie de Test' in open(d.value.path(), encoding='utf-8-sig').read()
        page.get_by_role('tab', name='Funnel').click(); page.wait_for_timeout(300); shot('22-admin-funnel')
    check('Studio → transmission → devis (validation, consentement) → admin + export CSV', quote)

    def estimator():
        page.goto(BASE + '/tarifs/', wait_until='networkidle')
        expect(page.get_by_text('Mode démonstration — tarifs fictifs')).to_be_visible()
        page.get_by_label('Surface à imprimer (m²)').fill('40'); page.get_by_role('button', name='Professionnel').click(); page.wait_for_timeout(200)
        expect(page.get_by_text('Remise volume −5 %')).to_be_visible()
        shot('23-tarifs')
    check('Estimateur : mode démo, remise volume', estimator)

    def sector():
        page.goto(BASE + '/secteurs/piscines/', wait_until='networkidle'); page.wait_for_timeout(600); shot('24-secteur-piscines')
        expect(page.get_by_text('À confirmer avec la fiche technique').first).to_be_visible()
    check('Landing sectorielle', sector)

    def galerie():
        page.goto(BASE + '/realisations/', wait_until='networkidle')
        assert page.locator('figure').count() == 18, page.locator('figure').count()
        page.get_by_role('button', name='Piscines').click(); page.wait_for_timeout(200)
        assert page.locator('figure').count() == 3
        page.get_by_role('button', name='Tous').click()
        page.locator('figure button').first.click(); page.wait_for_timeout(300)
        expect(page.get_by_text('1 / 18')).to_be_visible()
        page.keyboard.press('ArrowRight'); expect(page.get_by_text('2 / 18')).to_be_visible()
        page.keyboard.press('Escape'); shot('29-realisations', True)
        for slug in ['hotels-restaurants', 'piscines', 'ecoles-creches', 'bureaux-commerces']:
            page.goto(BASE + f'/secteurs/{slug}/', wait_until='networkidle')
            st = page.evaluate("Promise.all([...document.images].filter(i => i.src.includes('/media/gallery/')).map(i => fetch(i.src).then(r => r.status)))")
            assert st and all(x == 200 for x in st), f'{slug}: {st}'
        page.goto(BASE + '/secteurs/hotels-restaurants/', wait_until='networkidle'); page.wait_for_timeout(400); shot('30-secteur-hotels')
        page.goto(BASE + '/technologie/', wait_until='networkidle'); expect(page.get_by_text('Baiketech').first).to_be_visible(); shot('31-technologie')
    check('Galerie MURA : 18 images, filtre, visionneuse clavier, secteurs, technologie', galerie)

    # ---- Mobile
    m = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
    mp = m.new_page(); mp.on('pageerror', lambda e: errors.append(f'mobile :: {e}'))
    def mobile():
        for r, n in [('/', '25-mobile-home'), ('/studio/?art=art-009', '26-mobile-studio'), ('/oeuvres/', '27-mobile-explorer')]:
            mp.goto(BASE + r, wait_until='networkidle'); mp.wait_for_timeout(1000); mp.screenshot(path=f'{SHOTS}/{n}.png')
            w = mp.evaluate('document.documentElement.scrollWidth'); assert w <= 391, f'{r} débordement horizontal {w}px'
        mp.goto(BASE + '/', wait_until='networkidle'); mp.get_by_role('button', name='Menu').click(); expect(mp.locator('#menu-mobile')).to_be_visible()
    check('Responsive mobile 390px (sans débordement) + menu', mobile)

    # ---- Reduced motion
    r = b.new_context(viewport={'width': 1440, 'height': 900}, reduced_motion='reduce'); rp = r.new_page()
    def reduced():
        rp.goto(BASE + '/', wait_until='networkidle'); rp.wait_for_timeout(800)
        h = rp.evaluate("document.querySelector('section').offsetHeight"); assert h < 1000, h
        rp.screenshot(path=f'{SHOTS}/28-reduced-motion.png')
    check('Reduced motion : hero statique sans scrub', reduced)
    b.close()

w = max(len(n) for n, _ in results)
for n, s in results: print(f'{n.ljust(w)}  {s}')
print(f"\n{sum(s == 'OK' for _, s in results)}/{len(results)} OK — erreurs console : {len(errors)}")
for e in errors[:15]: print('  ', e)
