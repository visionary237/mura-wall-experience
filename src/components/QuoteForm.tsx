'use client';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LEAD_SCHEMA_VERSION, leadScore, newId, submitLead, validateLead, type LeadErrors, type LeadPayload } from '@/lib/lead';
import { projects, leads, type StudioProject } from '@/lib/store';
import { getArtwork } from '@/lib/artworks';
import { estimate } from '@/lib/pricing';
import { sectors } from '@/data/sectors';
import { track } from '@/lib/analytics';
import { printableSurface } from '@/lib/homography';

const CONSENT_TEXT = "J'accepte que mes informations soient utilisées pour traiter ma demande de devis. Elles ne sont ni revendues ni utilisées pour entraîner des modèles d'IA.";
const STEPS = ['Profil', 'Projet', 'Coordonnées'];

export function QuoteForm() {
  const sp = useSearchParams();
  const [step, setStep] = useState(0);
  const [project, setProject] = useState<StudioProject | null>(null);
  const [errors, setErrors] = useState<LeadErrors>({});
  const [done, setDone] = useState<{ mode: string; id: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [f, setF] = useState({
    segment: (sp.get('segment') as LeadPayload['segment']) || 'particulier', establishmentType: sp.get('sector') || '',
    firstName: '', lastName: '', email: '', phone: '', organisation: '', postalCode: '', city: '',
    wallWidthM: '', wallHeightM: '', surfaceM2: sp.get('surface') || '', walls: sp.get('walls') || '1', support: '', supportState: (sp.get('state') as 'bon') || 'bon',
    graphicNeed: ((sp.get('need') === 'creation' ? 'creation' : sp.get('graphic')) || 'none') as 'none' | 'adaptation' | 'creation', difficultAccess: sp.get('access') === '1',
    timeline: '', budget: '', message: '', multisite: sp.get('multisite') === '1', consent: false, marketing: false, attachPhoto: true,
  });
  useEffect(() => { track('quote_start'); }, []);
  useEffect(() => {
    const id = sp.get('project'); if (!id) return;
    const p = projects.get(id); if (!p) return;
    setProject(p);
    let s: number | undefined;
    try { s = printableSurface(p.wall, p.wallWidthM, p.wallHeightM, p.obstacles).net; } catch { /* */ }
    setF((x) => ({ ...x, wallWidthM: String(p.wallWidthM), wallHeightM: String(p.wallHeightM), surfaceM2: s ? String(s) : x.surfaceM2 }));
  }, [sp]);
  const upd = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setF({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value });
    const ek = k === 'consent' ? 'consent' : k;
    if (errors[ek]) setErrors(({ [ek]: _drop, form: _f, ...rest }) => rest);
  };
  const art = project?.artworkId ? getArtwork(project.artworkId) : null;
  const est = useMemo(() => {
    const s = parseFloat(f.surfaceM2); if (!(s > 0)) return null;
    try { const e = estimate({ segment: f.segment, surfaceM2: s, walls: +f.walls || 1, distanceKm: 0, surfaceState: f.supportState, graphic: f.graphicNeed, difficultAccess: f.difficultAccess }); return e ? { low: e.low, high: e.high, isDemo: e.isDemo } : null; } catch { return null; }
  }, [f]);

  const build = (): LeadPayload => {
    const num = (v: string) => (v ? parseFloat(v) : undefined);
    return {
      schemaVersion: LEAD_SCHEMA_VERSION, id: newId(), createdAt: new Date().toISOString(),
      contact: { firstName: f.firstName.trim(), lastName: f.lastName.trim(), email: f.email.trim(), phone: f.phone.trim() || undefined, organisation: f.organisation.trim() || undefined },
      segment: f.segment, establishmentType: f.establishmentType || undefined, location: { postalCode: f.postalCode.trim(), city: f.city.trim() || undefined },
      project: { wallWidthM: num(f.wallWidthM), wallHeightM: num(f.wallHeightM), surfaceM2: num(f.surfaceM2), walls: +f.walls || 1, support: f.support || undefined, supportState: f.supportState, graphicNeed: f.graphicNeed, difficultAccess: f.difficultAccess, timeline: f.timeline || undefined, budget: f.budget || undefined, message: f.message || undefined, multisite: f.multisite },
      artwork: art ? { id: art.id, title: art.title, license: art.license, rightsStatus: art.rightsStatus, source: art.source } : project?.customArt ? { id: 'upload', title: 'Image fournie par le client', license: 'Déclarée détenue par le client', rightsStatus: 'pending', source: 'client_upload' } : null,
      simulation: project ? { projectId: project.id, previewDataUrl: project.previewDataUrl, config: { wall: project.wall, obstacles: project.obstacles, placement: project.placement, roomId: project.roomId } } : null,
      wallPhotoAttached: !!project?.customRoom && f.attachPhoto,
      estimate: est,
      acquisition: { source: sp.get('utm_source') ?? undefined, medium: sp.get('utm_medium') ?? undefined, campaign: sp.get('utm_campaign') ?? undefined, referrer: typeof document !== 'undefined' ? document.referrer || undefined : undefined, landingPage: typeof location !== 'undefined' ? location.pathname : undefined },
      consents: { processing: f.consent, marketing: f.marketing, consentText: CONSENT_TEXT, timestamp: new Date().toISOString() },
    };
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const p = build(); const errs = validateLead(p); setErrors(errs);
    if (Object.keys(errs).length) {
      const early = ['postalCode', 'organisation'].find((k) => errs[k]);
      const k0 = early ?? Object.keys(errs)[0];
      const s = early ? 0 : 2;
      setStep(s);
      setTimeout(() => document.querySelector<HTMLElement>(`[name="${k0}"]`)?.focus(), 30);
      return;
    }
    setSending(true);
    try {
      const r = await submitLead(p);
      // stockage local : la photo du mur n'est jamais conservée dans le journal local
      leads.add({ ...p, simulation: p.simulation ? { ...p.simulation, previewDataUrl: undefined } : null, score: leadScore(p), delivery: r.mode });
      track('quote_submit', { segment: p.segment, score: leadScore(p), mode: r.mode });
      setDone({ mode: r.mode, id: p.id });
    } catch { setErrors({ form: 'Envoi impossible pour le moment. Réessayez ou écrivez-nous directement.' }); } finally { setSending(false); }
  };

  if (done) return (
    <div className="bg-ink p-10 text-wall" role="status">
      <p className="eyebrow text-flame">Demande reçue</p>
      <h2 className="mt-4 text-5xl">Merci, votre dossier est prêt.</h2>
      <p className="mt-4 text-wall/70">Référence <code>{done.id}</code>. {done.mode === 'dry-run' ? 'Prototype : aucun webhook configuré, le dossier est enregistré localement (visible dans l’espace admin de démonstration). Aucun e-mail n’a été envoyé.' : 'Notre équipe revient vers vous rapidement.'}</p>
      <div className="mt-8 flex gap-3"><Link href="/" className="btn btn-flame">Retour à l’accueil</Link><Link href="/admin/" className="btn btn-ghost">Voir le dossier (admin démo)</Link></div>
    </div>
  );

  const Err = ({ k }: { k: string }) => (errors[k] ? <span id={`err-${k}`} className="mt-1 block text-xs text-flame">{errors[k]}</span> : null);
  const inp = (k: keyof typeof f, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block"><span className="label">{label}{props.required && ' *'}</span>
      <input name={k} className="field" value={f[k] as string} onChange={upd(k)} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `err-${k}` : undefined} {...props} /><Err k={k} /></label>
  );

  return (
    <form onSubmit={submit} noValidate className="grid gap-12 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <ol className="flex gap-6 border-b border-ink/10 pb-4" aria-label="Étapes du formulaire">
          {STEPS.map((s, k) => <li key={s}><button type="button" onClick={() => setStep(k)} aria-current={k === step ? 'step' : undefined} className={`eyebrow ${k === step ? 'text-flame' : 'text-concrete'}`}>{k + 1}. {s}</button></li>)}
        </ol>
        <div className="mt-10 space-y-8" hidden={step !== 0}>
          <fieldset><legend className="label">Vous êtes *</legend>
            <div className="mt-3 flex flex-wrap gap-2">{([['particulier', 'Particulier'], ['professionnel', 'Professionnel'], ['collectivite', 'Collectivité / établissement public']] as const).map(([v, l]) => <button type="button" key={v} className="chip" aria-pressed={f.segment === v} onClick={() => setF({ ...f, segment: v })}>{l}</button>)}</div>
          </fieldset>
          {f.segment !== 'particulier' && (
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block"><span className="label">Type d’établissement</span>
                <select name="establishmentType" className="field" value={f.establishmentType} onChange={upd('establishmentType')}>
                  <option value="">Choisir…</option>{sectors.flatMap((s) => s.segments).map((s) => <option key={s}>{s}</option>)}<option>Autre</option>
                </select></label>
              {inp('organisation', 'Nom de l’établissement', { required: true })}
              <label className="flex items-center gap-3 text-sm sm:col-span-2"><input type="checkbox" checked={f.multisite} onChange={upd('multisite')} className="h-4 w-4 accent-[var(--color-flame)]" /> Projet multisite ou grande surface (&gt; 100 m²)</label>
            </div>
          )}
          <div className="grid gap-6 sm:grid-cols-2">{inp('postalCode', 'Code postal du lieu', { required: true, inputMode: 'numeric', maxLength: 5, autoComplete: 'postal-code' })}{inp('city', 'Ville', { autoComplete: 'address-level2' })}</div>
          <button type="button" className="btn btn-primary" onClick={() => setStep(1)}>Continuer →</button>
        </div>
        <div className="mt-10 space-y-8" hidden={step !== 1}>
          {project && (
            <div className="flex gap-4 bg-stone/40 p-4">
              {project.previewDataUrl && <img src={project.previewDataUrl} alt="Simulation jointe" className="w-40 rounded" />}
              <div className="text-sm"><p className="font-medium">Simulation jointe : {project.name}</p><p className="text-ink/60">{art ? `${art.title} — droits : ${art.rightsStatus === 'validated' ? 'validés' : 'en attente'}` : 'Image importée'}</p>
                {project.customRoom && <label className="mt-2 flex items-center gap-2"><input type="checkbox" checked={f.attachPhoto} onChange={upd('attachPhoto')} /> Joindre la photo de mon mur</label>}
              </div>
            </div>
          )}
          <div className="grid gap-6 sm:grid-cols-4">
            {inp('wallWidthM', 'Largeur (m)', { type: 'number', step: 0.1, min: 0 })}{inp('wallHeightM', 'Hauteur (m)', { type: 'number', step: 0.1, min: 0 })}
            {inp('surfaceM2', 'Surface (m²)', { type: 'number', step: 0.5, min: 0 })}{inp('walls', 'Nombre de murs', { type: 'number', min: 1 })}
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block"><span className="label">Type de support</span><select name="support" className="field" value={f.support} onChange={upd('support')}><option value="">Je ne sais pas</option><option>Plâtre peint</option><option>Béton</option><option>Brique</option><option>Bois</option><option>Carrelage</option><option>Autre</option></select></label>
            <label className="block"><span className="label">État du support</span><select name="supportState" className="field" value={f.supportState} onChange={upd('supportState')}><option value="bon">Bon</option><option value="moyen">Moyen</option><option value="mauvais">À reprendre</option></select></label>
            <label className="block"><span className="label">Besoin graphique</span><select name="graphicNeed" className="field" value={f.graphicNeed} onChange={upd('graphicNeed')}><option value="none">J’ai mon visuel</option><option value="adaptation">Adaptation</option><option value="creation">Création sur mesure</option></select></label>
            <label className="block"><span className="label">Délai souhaité</span><select name="timeline" className="field" value={f.timeline} onChange={upd('timeline')}><option value="">—</option><option value="moins-1-mois">Moins d’un mois</option><option value="1-3-mois">1 à 3 mois</option><option value="plus-3-mois">Plus de 3 mois</option><option value="flexible">Flexible</option></select></label>
            <label className="block"><span className="label">Budget indicatif</span><select name="budget" className="field" value={f.budget} onChange={upd('budget')}><option value="">—</option><option value="moins-1k">Moins de 1 000 €</option><option value="1-5k">1 000 – 5 000 €</option><option value="5-15k">5 000 – 15 000 €</option><option value="plus-15k">Plus de 15 000 €</option><option value="inconnu">Je ne sais pas</option></select></label>
            <label className="flex items-center gap-3 self-end pb-3 text-sm"><input type="checkbox" checked={f.difficultAccess} onChange={upd('difficultAccess')} className="h-4 w-4 accent-[var(--color-flame)]" /> Accès difficile</label>
          </div>
          <label className="block"><span className="label">Votre projet en quelques mots</span><textarea name="message" rows={4} className="field resize-y" value={f.message} onChange={upd('message')} /></label>
          <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>Continuer →</button>
        </div>
        <div className="mt-10 space-y-8" hidden={step !== 2}>
          <div className="grid gap-6 sm:grid-cols-2">
            {inp('firstName', 'Prénom', { required: true, autoComplete: 'given-name' })}{inp('lastName', 'Nom', { required: true, autoComplete: 'family-name' })}
            {inp('email', 'E-mail', { required: true, type: 'email', autoComplete: 'email' })}{inp('phone', 'Téléphone', { type: 'tel', autoComplete: 'tel' })}
          </div>
          <label className="flex gap-3 text-sm"><input name="consent" type="checkbox" checked={f.consent} onChange={upd('consent')} className="mt-1 h-4 w-4 accent-[var(--color-flame)]" aria-invalid={!!errors.consent} /><span>{CONSENT_TEXT} <Link href="/confidentialite/" className="underline">Politique de confidentialité</Link> *<Err k="consent" /></span></label>
          <label className="flex gap-3 text-sm"><input type="checkbox" checked={f.marketing} onChange={upd('marketing')} className="mt-1 h-4 w-4 accent-[var(--color-flame)]" /><span>J’accepte d’être recontacté(e) au sujet de mon projet enregistré si je ne donne pas suite (facultatif).</span></label>
          {Object.keys(errors).length > 0 && <p role="alert" className="text-sm text-flame">{errors.form ?? 'Merci de corriger les champs signalés (y compris dans les étapes précédentes).'}</p>}
          <button type="submit" className="btn btn-flame" disabled={sending}>{sending ? 'Envoi…' : 'Envoyer ma demande →'}</button>
        </div>
      </div>
      <aside className="lg:col-span-4">
        <div className="sticky top-24 space-y-4 border-l border-ink/10 pl-6 text-sm">
          <p className="label">Votre dossier</p>
          <p>{f.segment === 'particulier' ? 'Particulier' : f.segment === 'professionnel' ? 'Professionnel' : 'Collectivité'}{f.organisation && ` — ${f.organisation}`}</p>
          {f.surfaceM2 && <p>{f.surfaceM2} m² · {f.walls} mur(s)</p>}
          {project && <p>Simulation jointe ✓</p>}
          {est && <p>Estimation {est.isDemo ? '(démo) ' : ''}: {est.low} – {est.high} €</p>}
          <p className="text-xs text-concrete">Vous recevez une réponse sous 48 h ouvrées (délai à confirmer par l’entreprise).</p>
        </div>
      </aside>
    </form>
  );
}
