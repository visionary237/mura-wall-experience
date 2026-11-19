import sys
from playwright.sync_api import sync_playwright, expect
B = sys.argv[1]; errs = []; bad = []; res = []
def ck(n, f):
    try: f(); res.append((n, 'OK'))
    except Exception as e: res.append((n, 'ÉCHEC: ' + (str(e).splitlines() or [repr(e)])[0][:160]))
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox'])
    pg = b.new_page(viewport={'width': 1440, 'height': 900}); pg.set_default_timeout(8000)
    pg.on('pageerror', lambda e: errs.append(str(e)[:150])); pg.on('console', lambda m: m.type == 'error' and errs.append(m.text[:150]))
    pg.on('response', lambda r: r.status >= 400 and bad.append(r.url))
    def home():
        pg.goto(B + 'index.html', wait_until='networkidle'); pg.wait_for_timeout(800)
        assert pg.evaluate("getComputedStyle(document.body).fontFamily").startswith('"Manrope'), 'CSS non chargé'
        pg.get_by_role('button', name='Refuser').click()
        pg.mouse.wheel(0, 1400); pg.wait_for_timeout(800); pg.screenshot(path='/tmp/p1.png')
        v = pg.evaluate("(()=>{const c=document.querySelector('section canvas');const d=c.getContext('2d').getImageData(c.width/2|0,c.height/3|0,1,1).data;return d[0]+d[1]+d[2]})()"); assert v > 0
    ck('Accueil : CSS, polices, hero', home)
    def nav():
        for name, h in [('Inspirations', 'Trouver'), ('Œuvres', 'Bibliothèque'), ('Technologie', 'L’impression'), ('Professionnels', 'Des espaces'), ('Tarifs', 'Combien')]:
            pg.get_by_role('navigation', name='Navigation principale').get_by_role('link', name=name, exact=True).click(); pg.wait_for_timeout(500)
            expect(pg.locator('h1').first).to_contain_text(h)
        pg.goto(B + 'index.html#/secteurs/piscines/', wait_until='networkidle'); expect(pg.locator('h1').first).to_contain_text('Plonger')
        pg.goto(B + 'index.html#/realisations/', wait_until='networkidle'); pg.wait_for_timeout(500)
        assert pg.locator('figure').count() == 18
    ck('Navigation 6 pages + secteur + réalisations', nav)
    def studio():
        pg.goto(B + 'index.html#/studio/?art=art-010', wait_until='networkidle'); pg.wait_for_timeout(1500)
        expect(pg.get_by_text('Botanique — Nuit verte').first).to_be_visible()
        pg.get_by_role('button', name='Étape suivante').click(); pg.get_by_role('button', name='Étape suivante').click(); pg.wait_for_timeout(400)
        pg.screenshot(path='/tmp/p2.png')
        pg.get_by_role('button', name='6 Projet').click(); pg.get_by_role('button', name='Transmettre mon projet →').click(); pg.wait_for_timeout(800)
        expect(pg.get_by_text('Simulation jointe').first).to_be_attached()
    ck('Studio + transmission au devis', studio)
    b.close()
for n, s in res: print(n.ljust(45), s)
print('erreurs JS:', errs[:5]); print('HTTP >= 400:', [u for u in bad if 'favicon' not in u][:8])
