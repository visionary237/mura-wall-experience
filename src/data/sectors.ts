/**
 * Contenus sectoriels. Règles éditoriales :
 * - aucune institution citée comme cliente sans preuve ;
 * - aucune certification, compatibilité sanitaire ou conformité affirmée : les points à valider sont formulés comme tels.
 */
export interface Sector {
  slug: string; title: string; short: string; headline: string; intro: string; heroArt: string; segments: string[];
  problems: string[]; applications: { title: string; text: string }[]; constraints: string[];
  faq: { q: string; a: string }[]; categories: string[]; segment: 'professionnel' | 'collectivite';
}

const validate = 'À confirmer avec la fiche technique de la machine et des encres utilisées.';

export const sectors: Sector[] = [
  {
    slug: 'collectivites', title: 'Collectivités et services publics', short: 'Collectivités', segment: 'collectivite',
    headline: 'Des lieux publics qui racontent leur territoire.', heroArt: 'strates-aube',
    intro: "Mairies, bibliothèques, bureaux de poste et services publics : l'impression murale donne une identité aux espaces d'accueil, sans chantier lourd.",
    segments: ['Mairies', 'Bibliothèques', 'Services publics', 'Universités', 'Salles de sport municipales', 'Espaces événementiels'],
    problems: ["Halls d'accueil impersonnels", 'Signalétique peu lisible', 'Budget et calendrier contraints par la commande publique', 'Volonté de valoriser le patrimoine local'],
    applications: [
      { title: 'Patrimoine local', text: "Paysages, archives et architecture du territoire, à partir d'images dont les droits sont validés." },
      { title: 'Orientation & signalétique', text: 'Couleurs et repères visuels qui guident naturellement le public.' },
      { title: 'Projets participatifs', text: 'Fresques co-construites avec les habitants ou les écoles.' },
    ],
    constraints: ['Interventions possibles hors horaires d’ouverture', 'Dossier adapté aux procédures d’achat public (devis détaillé, mémoire technique)', `Classement au feu des supports et encres : ${validate}`],
    faq: [
      { q: 'Pouvez-vous intervenir sur plusieurs bâtiments ?', a: 'Oui. Le parcours multisite permet de décrire chaque site ; un chiffrage global est ensuite établi.' },
      { q: 'Pouvons-nous fournir nos propres images ?', a: 'Oui, sous réserve que vous en déteniez les droits de reproduction. Nous vérifions aussi la résolution.' },
    ],
    categories: ['patrimoine-local', 'paysages', 'architecture'],
  },
  {
    slug: 'hotels-restaurants', title: 'Hôtels et restaurants', short: 'Hôtels & restaurants', segment: 'professionnel',
    headline: 'Une signature visuelle que vos clients photographient.', heroArt: 'botanique-nuit',
    intro: "Lobby, salle, chambres : un mur imprimé crée l'atmosphère d'un lieu et devient un repère pour vos clients.",
    segments: ['Hôtels', 'Restaurants', 'Bars', 'Espaces événementiels'],
    problems: ['Différenciation face à la concurrence', 'Rénovation sans fermeture prolongée', 'Cohérence avec l’identité de marque'],
    applications: [
      { title: 'Mur signature', text: 'Une œuvre grand format derrière le bar ou la banquette.' },
      { title: 'Chambres thématiques', text: 'Une déclinaison d’une même collection, chambre par chambre.' },
      { title: 'Identité de marque', text: 'Motifs et couleurs dérivés de votre charte.' },
    ],
    constraints: ['Planning compatible avec l’exploitation (créneaux de fermeture)', `Résistance au nettoyage : ${validate}`],
    faq: [
      { q: 'Combien de temps dure une intervention ?', a: 'Cela dépend de la surface et du support ; le délai précis est indiqué au devis.' },
      { q: 'Peut-on imprimer sur un mur déjà peint ?', a: 'Souvent oui, après vérification de l’état du support lors de la visite technique.' },
    ],
    categories: ['botanique', 'art-japonais', 'art-abstrait'],
  },
  {
    slug: 'ecoles-creches', title: 'Écoles et crèches', short: 'Écoles & crèches', segment: 'collectivite',
    headline: 'Des murs qui éveillent la curiosité.', heroArt: 'confettis',
    intro: 'Crèches, écoles, collèges et lycées : des fresques ludiques ou pédagogiques qui transforment les couloirs et les salles.',
    segments: ['Crèches', 'Écoles', 'Collèges', 'Lycées', 'Universités'],
    problems: ['Couloirs ternes', 'Besoin de supports pédagogiques durables', 'Interventions limitées aux vacances scolaires'],
    applications: [
      { title: 'Fresques pédagogiques', text: 'Cartes, frises, cycles naturels conçus avec l’équipe éducative.' },
      { title: 'Univers ludiques', text: 'Formes et couleurs adaptées aux plus jeunes.' },
      { title: 'Identité d’établissement', text: 'Valoriser le projet d’école ou le nom de l’établissement.' },
    ],
    constraints: ['Intervention pendant les vacances scolaires', `Émissions des encres (COV) et usage en présence d'enfants : ${validate}`],
    faq: [{ q: 'Les élèves peuvent-ils participer au dessin ?', a: 'Oui : leurs dessins peuvent être numérisés et intégrés à la composition.' }],
    categories: ['enfance', 'pedagogie', 'geometrie'],
  },
  {
    slug: 'piscines', title: 'Piscines et centres aquatiques', short: 'Piscines', segment: 'collectivite',
    headline: 'Plonger avant même d’entrer dans l’eau.', heroArt: 'flux-lagon',
    intro: 'Halls, bassins et vestiaires : des décors aquatiques à grande échelle.',
    segments: ['Piscines municipales', 'Centres aquatiques', 'Espaces bien-être'],
    problems: ['Très grandes surfaces', 'Ambiance humide et chlorée', 'Fermetures techniques courtes'],
    applications: [
      { title: 'Grands panoramiques', text: 'Fonds marins, houle, lagons sur toute la longueur du bassin.' },
      { title: 'Repères pour les usagers', text: 'Couleurs par zone : bassin sportif, ludique, vestiaires.' },
    ],
    constraints: [`Tenue en atmosphère humide et chlorée, vernis de protection : ${validate}`, 'Accès en hauteur et échafaudages à évaluer lors de la visite'],
    faq: [{ q: 'L’impression tient-elle à l’humidité ?', a: 'Cela dépend du support, des encres et de la protection appliquée : nous ne l’affirmons qu’après étude technique.' }],
    categories: ['oceans', 'art-abstrait', 'nature'],
  },
  {
    slug: 'sante', title: 'Hôpitaux et établissements de santé', short: 'Santé', segment: 'collectivite',
    headline: 'Apaiser l’attente, humaniser le soin.', heroArt: 'foret-brume',
    intro: "Salles d'attente, couloirs, services pédiatriques : des paysages apaisants pour les patients et les équipes.",
    segments: ['Hôpitaux', 'Cliniques', 'Cabinets médicaux'],
    problems: ['Environnements anxiogènes', 'Exigences d’hygiène', 'Continuité de service'],
    applications: [
      { title: 'Nature apaisante', text: 'Forêts, horizons, couleurs douces.' },
      { title: 'Pédiatrie', text: 'Univers ludiques pour dédramatiser.' },
    ],
    constraints: [`Compatibilité avec les protocoles de bionettoyage : ${validate}`, 'Intervention par zones pour maintenir l’activité'],
    faq: [{ q: 'Pouvez-vous intervenir dans un service en activité ?', a: 'Une intervention par zones est généralement envisageable ; elle est définie avec l’établissement.' }],
    categories: ['nature', 'forets', 'paysages'],
  },
  {
    slug: 'ehpad', title: 'EHPAD et résidences seniors', short: 'EHPAD', segment: 'collectivite',
    headline: 'Des lieux de vie qui ressemblent à la vie.', heroArt: 'strates-aube',
    intro: 'Espaces communs, couloirs, salles à manger : des décors familiers qui aident à se repérer.',
    segments: ['EHPAD', 'Résidences seniors', 'Accueils de jour'],
    problems: ['Repérage dans les couloirs', 'Ambiance institutionnelle', 'Souhait de rappeler des paysages connus'],
    applications: [
      { title: 'Repères par étage', text: 'Une couleur et un paysage par aile pour faciliter l’orientation.' },
      { title: 'Patrimoine & souvenirs', text: 'Paysages locaux, scènes familières.' },
    ],
    constraints: [`Matériaux et encres en lieu de vie : ${validate}`],
    faq: [{ q: 'Peut-on associer les résidents au choix ?', a: 'Oui : le Studio permet de comparer plusieurs œuvres sur le mur réel avant de décider.' }],
    categories: ['paysages', 'nature', 'patrimoine-local'],
  },
  {
    slug: 'bureaux-commerces', title: 'Bureaux et commerces', short: 'Bureaux & commerces', segment: 'professionnel',
    headline: 'Votre marque, à l’échelle du mur.', heroArt: 'bauhaus-terre',
    intro: 'Accueils, salles de réunion, boutiques et centres commerciaux : un mur qui incarne votre culture et attire le regard.',
    segments: ['Bureaux', 'Commerces', 'Centres commerciaux', 'Salles de sport', 'Espaces de coworking'],
    problems: ['Espaces de travail impersonnels', 'Marque employeur', 'Vitrines et parcours client'],
    applications: [
      { title: 'Culture d’entreprise', text: 'Valeurs, histoire, motifs de marque.' },
      { title: 'Retail', text: 'Murs instagrammables, campagnes saisonnières.' },
      { title: 'Multisite', text: 'Déploiement homogène sur un réseau d’agences.' },
    ],
    constraints: ['Interventions hors horaires d’ouverture', 'Parcours multisite avec chiffrage global'],
    faq: [{ q: 'Pouvez-vous reproduire notre logo ?', a: 'Oui, à partir de vos fichiers vectoriels ; nous vérifions la qualité avant impression.' }],
    categories: ['geometrie', 'art-contemporain', 'minimalisme'],
  },
  {
    slug: 'musees', title: 'Musées et espaces culturels', short: 'Musées', segment: 'collectivite',
    headline: 'Prolonger l’exposition au-delà des cimaises.', heroArt: 'seigaiha-indigo',
    intro: 'Scénographies, frises chronologiques, reproductions d’œuvres du domaine public.',
    segments: ['Musées', 'Centres d’art', 'Médiathèques', 'Lieux patrimoniaux'],
    problems: ['Scénographies temporaires', 'Médiation pour tous les publics', 'Respect des droits des œuvres'],
    applications: [
      { title: 'Scénographie', text: 'Murs immersifs pour expositions temporaires.' },
      { title: 'Médiation', text: 'Frises et cartes à grande échelle.' },
    ],
    constraints: ['Vérification des droits de reproduction pour chaque œuvre (domaine public, ayants droit, photographe)', `Réversibilité de l'impression : ${validate}`],
    faq: [{ q: 'Une œuvre du domaine public est-elle libre ?', a: 'L’œuvre peut l’être, mais la photographie qui la reproduit peut avoir ses propres conditions : nous les vérifions systématiquement.' }],
    categories: ['art-classique', 'renaissance', 'art-japonais'],
  },
];

export const getSector = (slug: string) => sectors.find((s) => s.slug === slug);
