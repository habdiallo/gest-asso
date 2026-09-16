const icons = {
  logo: '<path d="M5 18V6l7 12V6l7 12V6"/><path d="M3 3h18M3 21h18"/>',
  dashboard: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  members: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  campaigns: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
  payments: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h2"/>',
  pots: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8z"/>',
  users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  categories: '<path d="M20.59 13.41 11 3.83V2H4v7h1.83l9.58 9.59a2 2 0 0 0 2.82 0l2.36-2.36a2 2 0 0 0 0-2.82z"/><circle cx="7.5" cy="5.5" r=".5"/>',
  profile: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  arrow: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  receipt: '<path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 1 1V2l-3 2-3-2-3 2-3-2-3 2z"/><path d="M8 9h8M8 13h6"/>',
  trend: '<path d="m3 17 6-6 4 4 8-8"/><path d="M14 7h7v7"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  wallet: '<path d="M20 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v12H5a3 3 0 0 1-3-3V6"/><path d="M16 14h.01"/>',
  logout: '<path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-6"/>',
  more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4z"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
};

const svg = (name, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.info}</svg>`;

const members = [
  { id: 1, initials: 'AD', name: 'Amadou Diallo', email: 'amadou.diallo@nimba.org', phone: '+224 622 12 34 56', city: 'Conakry', country: 'Guinée', category: 'B', function: 'Président', status: 'Actif' },
  { id: 2, initials: 'MC', name: 'Mariam Camara', email: 'mariam.camara@nimba.org', phone: '+224 620 48 11 93', city: 'Kindia', country: 'Guinée', category: 'C', function: 'Secrétaire', status: 'Actif' },
  { id: 3, initials: 'IB', name: 'Ibrahima Barry', email: 'ibrahima.barry@nimba.org', phone: '+224 664 09 28 40', city: 'Conakry', country: 'Guinée', category: 'A', function: 'Membre', status: 'Actif' },
  { id: 4, initials: 'FD', name: 'Fatoumata Diallo', email: 'fatoumata.d@nimba.org', phone: '+224 625 71 10 08', city: 'Labé', country: 'Guinée', category: 'D', function: 'Vice-présidente', status: 'Actif' },
  { id: 5, initials: 'MS', name: 'Mamadou Sow', email: 'mamadou.sow@nimba.org', phone: '+224 666 33 20 19', city: 'Mamou', country: 'Guinée', category: 'B', function: 'Membre', status: 'Inactif' },
  { id: 6, initials: 'KC', name: 'Kadiatou Condé', email: 'kadiatou.c@nimba.org', phone: '+224 621 15 82 47', city: 'Conakry', country: 'Guinée', category: 'C', function: 'Membre', status: 'Actif' },
];

const campaigns = [
  { id: 1, title: 'Solidarité septembre', desc: 'Campagne générale de soutien aux activités de l’association.', period: '01 – 30 sept. 2026', status: 'Ouverte', tone: 'success', expected: '18,5M GNF', paid: '12,4M GNF', left: '6,1M GNF', progress: 67, members: 86 },
  { id: 2, title: 'Rentrée associative', desc: 'Participation exceptionnelle pour la rentrée.', period: '15 août – 15 oct. 2026', status: 'Ouverte', tone: 'success', expected: '9,8M GNF', paid: '4,2M GNF', left: '5,6M GNF', progress: 43, members: 62 },
  { id: 3, title: 'Équipement du siège', desc: 'Contribution pour l’équipement du local.', period: '01 – 31 oct. 2026', status: 'À venir', tone: 'info', expected: '14M GNF', paid: '0 GNF', left: '14M GNF', progress: 0, members: 80 },
  { id: 4, title: 'Soutien juin 2026', desc: 'Campagne de soutien du début de saison.', period: '01 – 30 juin 2026', status: 'Clôturée', tone: 'neutral', expected: '15,2M GNF', paid: '14,8M GNF', left: '400K GNF', progress: 97, members: 84 },
];

const dues = [
  { member: members[0], due: '100 000 GNF', paid: '50 000 GNF', left: '50 000 GNF', status: 'Partiellement payé', tone: 'warning' },
  { member: members[1], due: '250 000 GNF', paid: '250 000 GNF', left: '0 GNF', status: 'Payé', tone: 'success' },
  { member: members[2], due: '50 000 GNF', paid: '0 GNF', left: '50 000 GNF', status: 'À payer', tone: 'info' },
  { member: members[3], due: '500 000 GNF', paid: '200 000 GNF', left: '300 000 GNF', status: 'En retard', tone: 'error' },
  { member: members[5], due: '250 000 GNF', paid: '150 000 GNF', left: '100 000 GNF', status: 'Partiellement payé', tone: 'warning' },
];

const payments = [
  { member: members[1], campaign: 'Solidarité septembre', amount: '250 000 GNF', mode: 'Mobile Money', date: '14 sept. 2026', by: 'M. Bah' },
  { member: members[3], campaign: 'Solidarité septembre', amount: '200 000 GNF', mode: 'Virement bancaire', date: '13 sept. 2026', by: 'M. Bah' },
  { member: members[0], campaign: 'Solidarité septembre', amount: '50 000 GNF', mode: 'Espèces', date: '12 sept. 2026', by: 'A. Touré' },
  { member: members[5], campaign: 'Solidarité septembre', amount: '150 000 GNF', mode: 'Mobile Money', date: '10 sept. 2026', by: 'M. Bah' },
];

const pots = [
  { id: 1, title: 'Mariage de Fanta & Sékou', type: 'Mariage', person: 'Famille Camara', period: '05 – 28 sept. 2026', status: 'Ouverte', tone: 'success', collected: '4,75M GNF', target: '7M GNF', progress: 68, contributors: 43 },
  { id: 2, title: 'Soutien à la famille Bah', type: 'Décès', person: 'Famille Bah', period: '10 – 30 sept. 2026', status: 'Ouverte', tone: 'success', collected: '8,2M GNF', target: '10M GNF', progress: 82, contributors: 67 },
  { id: 3, title: 'Naissance de Mariama', type: 'Naissance', person: 'Aïssatou et Oumar', period: '01 – 14 sept. 2026', status: 'Clôturée', tone: 'neutral', collected: '3,1M GNF', target: '3M GNF', progress: 100, contributors: 35 },
];

const roleConfig = {
  Administrateur: {
    initials: 'MB', name: 'Moussa Bah',
    nav: [
      ['dashboard','Tableau de bord','dashboard'], ['members','Membres','members'], ['campaigns','Cotisations','campaigns'], ['pots','Cagnottes','pots'],
      ['section','Administration'], ['users','Utilisateurs & rôles','users'], ['categories','Catégories','categories']
    ]
  },
  Trésorier: {
    initials: 'MB', name: 'Moussa Bah',
    nav: [['dashboard','Tableau de bord','dashboard'], ['members','Membres','members'], ['campaigns','Cotisations','campaigns'], ['payments','Règlements','payments'], ['pots','Cagnottes','pots'], ['contributions','Contributions','receipt']]
  },
  'Opérateur autorisé': {
    initials: 'AT', name: 'Aminata Touré',
    nav: [['dashboard','Tableau de bord','dashboard'], ['members','Membres','members'], ['campaigns','Cotisations','campaigns'], ['payments','Règlements','payments'], ['pots','Cagnottes','pots'], ['contributions','Contributions','receipt']]
  },
  'Opérateur non autorisé': {
    initials: 'AT', name: 'Aminata Touré',
    nav: [['dashboard','Tableau de bord','dashboard'], ['members','Membres','members'], ['campaigns','Cotisations','campaigns']]
  },
  Membre: {
    initials: 'AD', name: 'Amadou Diallo',
    nav: [['dashboard','Accueil','dashboard'], ['my-dues','Mes cotisations','campaigns'], ['my-contributions','Mes contributions','pots'], ['profile','Mon profil','profile']]
  }
};

const state = {
  theme: localStorage.getItem('nimba-theme') || 'dark',
  role: localStorage.getItem('nimba-role') || 'Administrateur',
  route: location.hash.slice(1) || 'dashboard',
  memberFilter: 'Tous',
  campaignFilter: 'Toutes',
  potFilter: 'Toutes',
  campaignTab: 'members',
  memberTab: 'dues',
  potTab: 'contributions',
  dashboardCampaignScope: 'Solidarité septembre',
  dashboardPotScope: 'Toutes les cagnottes ouvertes',
  modalRoute: null,
};

const modalRoutes = new Set(['member-form','member-edit','campaign-form','campaign-amounts','payment-form','pot-form','contribution-form','operator','category-form']);

function status(label, tone = 'neutral') {
  return `<span class="status ${tone}">${label}</span>`;
}

function isFinancialAllowed() {
  return ['Administrateur', 'Trésorier', 'Opérateur autorisé'].includes(state.role);
}
function isManager() { return ['Administrateur', 'Trésorier'].includes(state.role); }
function isAdmin() { return state.role === 'Administrateur'; }
function isMember() { return state.role === 'Membre'; }

function button(label, route, icon = 'plus', kind = 'primary', disabled = false) {
  return `<button class="btn btn-${kind}" ${route ? `data-route="${route}"` : 'data-action="demo"'} ${disabled ? 'disabled' : ''}>${svg(icon)}${label}</button>`;
}

function pageHead(kicker, title, intro, actions = '') {
  return `<div class="page-head"><div><div class="page-kicker">${kicker}</div><h1>${title}</h1><p class="page-intro">${intro}</p></div>${actions ? `<div class="button-row">${actions}</div>` : ''}</div>`;
}

function appShell(content) {
  const config = roleConfig[state.role];
  const visibleNav = config.nav.filter(item => item[0] !== 'section');
  const mainMobile = visibleNav.slice(0, 5);
  return `<div class="app-shell" data-theme="${state.theme}">
    <aside class="sidebar">
      <div class="brand"><div class="brand-mark">${svg('logo')}</div><div><div class="brand-name">NIMBA</div><div class="brand-caption">Gestion associative</div></div></div>
      <div class="workspace-chip"><p class="eyebrow">Association</p><strong>Union Nimba Conakry</strong></div>
      <nav class="nav" aria-label="Navigation principale">
        ${config.nav.map(item => item[0] === 'section'
          ? `<div class="nav-section">${item[1]}</div>`
          : `<button class="nav-item ${activeNav(item[0]) ? 'active' : ''}" data-route="${item[0]}">${svg(item[2])}<span>${item[1]}</span></button>`).join('')}
      </nav>
      <div class="sidebar-footer">
        <button class="profile-button" data-route="${isMember() ? 'profile' : 'account'}"><div class="avatar">${config.initials}</div><div class="profile-copy"><strong>${config.name}</strong><span>${state.role}</span></div>${svg('chevron')}</button>
      </div>
    </aside>
    <header class="mobile-topbar">
      <div class="brand"><div class="brand-mark">${svg('logo')}</div><div class="brand-name">NIMBA</div></div>
      <div class="mobile-actions"><button class="icon-button theme-toggle" aria-label="Changer de thème">${svg(state.theme === 'dark' ? 'sun' : 'moon')}</button><button class="icon-button role-toggle" aria-label="Changer de rôle">${svg('profile')}</button></div>
    </header>
    <main class="main">
      <header class="topbar">
        <div class="breadcrumb"><span>Union Nimba</span>${svg('chevron')}<strong>${routeLabel()}</strong></div>
        <div class="top-actions">
          <button class="icon-button theme-toggle" aria-label="Changer de thème">${svg(state.theme === 'dark' ? 'sun' : 'moon')}</button>
          <div class="role-switch"><button class="role-button role-toggle"><span class="eyebrow">Vue · ${state.role}</span>${svg('down')}</button>${rolePopover()}</div>
        </div>
      </header>
      ${content}
    </main>
    <nav class="bottom-nav cols-${mainMobile.length}" aria-label="Navigation mobile">${mainMobile.map(item => `<button class="bottom-item ${activeNav(item[0]) ? 'active' : ''}" data-route="${item[0]}">${svg(item[2])}<span>${item[1].replace('Tableau de bord','Accueil').replace('Mes ','')}</span></button>`).join('')}</nav>
    <div class="role-switch mobile-role-switch">${rolePopover()}</div>
  </div>`;
}

function rolePopover() {
  return `<div class="popover" hidden><div class="popover-title">Prévisualiser un rôle</div>${Object.keys(roleConfig).map(role => `<button class="role-option ${role === state.role ? 'active' : ''}" data-role="${role}"><span>${role}</span>${role === state.role ? svg('check') : ''}</button>`).join('')}</div>`;
}

function activeNav(route) {
  const groups = {
    members: ['members','member','member-form','member-edit'], campaigns: ['campaigns','campaign','campaign-form','campaign-amounts','payment-form'],
    pots: ['pots','pot','pot-form','contribution-form'], users: ['users','operator'],
    categories: ['categories','category-form'],
    payments: ['payments','payment-form'], contributions: ['contributions','contribution-form'],
    'my-dues': ['my-dues','my-due'], 'my-contributions': ['my-contributions','my-contribution']
  };
  return state.route === route || (groups[route] || []).includes(state.route);
}

function routeLabel(route = state.route) {
  const labels = { dashboard: 'Tableau de bord', members: 'Membres', member: 'Fiche membre', 'member-form': 'Nouveau membre', 'member-edit': 'Modifier un membre', campaigns: 'Cotisations', campaign: 'Détail campagne', 'campaign-form': 'Nouvelle campagne', 'campaign-amounts': 'Montants de campagne', 'payment-form': 'Nouveau règlement', payments: 'Règlements', pots: 'Cagnottes', pot: 'Détail cagnotte', 'pot-form': 'Nouvelle cagnotte', 'contribution-form': 'Nouvelle contribution', contributions: 'Contributions', users: 'Utilisateurs et rôles', operator: 'Configuration opérateur', categories: 'Catégories', 'category-form': 'Catégorie de revenu', profile: 'Mon profil', 'my-dues': 'Mes cotisations', 'my-due': 'Détail de ma cotisation', 'my-contributions': 'Mes contributions', 'my-contribution': 'Détail de ma contribution', account: 'Mon compte' };
  return labels[route] || 'Tableau de bord';
}

function modalShell(content, route) {
  const wide = ['member-form','member-edit','campaign-form','campaign-amounts','pot-form'].includes(route);
  return `<div class="modal-layer" role="presentation">
    <button class="modal-backdrop" data-close-modal aria-label="Fermer le dialogue"></button>
    <section class="modal-dialog ${wide ? 'modal-wide' : 'modal-compact'}" role="dialog" aria-modal="true" aria-label="${routeLabel(route)}">
      <header class="modal-chrome"><div><span class="modal-context">${routeLabel(state.route)}</span><strong>${routeLabel(route)}</strong></div><button class="icon-button" data-close-modal aria-label="Fermer">${svg('close')}</button></header>
      <div class="modal-scroll">${content}</div>
    </section>
  </div>`;
}

function dashboardPage() {
  if (isMember()) return memberDashboard();
  const action = isManager() ? button('Nouvelle campagne', 'campaign-form') : (isFinancialAllowed() ? button('Enregistrer un règlement', 'payment-form', 'payments') : '');
  const label = state.role.startsWith('Opérateur') ? 'Espace opérateur' : `Vue ${state.role.toLowerCase()}`;
  const campaignScope = dashboardCampaignSummary();
  const potScope = dashboardPotSummary();
  const dashboardStats = state.role === 'Opérateur non autorisé'
    ? `${statCard('Membres actifs', '86', 'Consultation du répertoire', 'members', 'Association entière')}${statCard('Campagnes ouvertes', '2', '1 campagne à venir', 'campaigns', 'Toutes les campagnes')}`
    : `${statCard('Membres actifs', '86', '3 nouveaux ce mois', 'members', 'Association entière')}${statCard('Cotisations encaissées', campaignScope.paid, `<strong>${campaignScope.progress} %</strong> de ${campaignScope.expected}`, 'payments', campaignScope.label)}${statCard('Reste sur cotisations', campaignScope.left, `${campaignScope.expected} attendus`, 'clock', campaignScope.label)}${statCard('Contributions encaissées', potScope.collected, `<strong>${potScope.progress} %</strong> de ${potScope.target}`, 'pots', potScope.label)}`;
  return `<section class="page">${pageHead(label, 'Tableau de bord', 'Vue d’ensemble de l’activité associative au 15 septembre 2026.', action)}
    ${state.role !== 'Opérateur non autorisé' ? dashboardScopePanel() : ''}
    <div class="stats-grid">
      ${dashboardStats}
    </div>
    ${state.role === 'Opérateur non autorisé' ? `<div class="callout" style="margin:0 0 20px">${svg('lock')}<span>Votre accès est limité à la consultation. L’enregistrement des règlements et contributions n’est pas autorisé pour ce compte.</span></div>` : ''}
    <div class="dashboard-grid">
      <div>
        <section class="panel"><div class="panel-head"><div><h3>Campagnes récentes</h3><p>${state.role === 'Opérateur non autorisé' ? 'Campagnes accessibles en consultation' : 'Suivi des collectes en cours'}</p></div><button class="text-link" data-route="campaigns">Tout afficher</button></div><div class="campaign-list">${campaigns.slice(0,3).map(state.role === 'Opérateur non autorisé' ? limitedCampaignRow : campaignRow).join('')}</div></section>
        ${state.role === 'Opérateur non autorisé'
          ? `<section class="panel"><div class="panel-head"><div><h3>Membres récemment consultés</h3><p>Accès au répertoire associatif</p></div><button class="text-link" data-route="members">Voir le répertoire</button></div><div class="activity-list">${members.slice(0,3).map(m=>`<div class="activity" data-route="member"><div class="avatar">${m.initials}</div><div class="activity-copy"><strong>${m.name}</strong><span>${m.city} · Catégorie ${m.category}</span></div>${status(m.status,m.status==='Actif'?'success':'neutral')}</div>`).join('')}</div></section>`
          : dashboardPaymentsPanel()}
      </div>
      <aside class="dashboard-side">
        <section class="panel"><div class="panel-head"><div><h3>Actions rapides</h3><p>Accès aux opérations courantes</p></div></div><div class="quick-actions">
          ${state.role === 'Opérateur non autorisé'
            ? `${quickAction('Consulter les membres','members','members')}${quickAction('Voir les campagnes','campaigns','campaigns')}${quickAction('Mon compte','account','profile')}`
            : isAdmin()
            ? `${quickAction('Ajouter un membre','member-form','members')}${quickAction('Gérer les rôles','users','users')}${quickAction('Gérer les catégories','categories','categories')}${quickAction('Créer une campagne','campaign-form','campaigns')}`
            : `${isManager() ? quickAction('Ajouter un membre','member-form','members') : quickAction('Consulter les membres','members','members')}${isFinancialAllowed() ? quickAction('Saisir un règlement','payment-form','payments') : quickAction('Voir les campagnes','campaigns','campaigns')}${isManager() ? quickAction('Créer une cagnotte','pot-form','pots') : quickAction('Voir les cagnottes','pots','pots')}${isFinancialAllowed() ? quickAction('Saisir une contribution','contribution-form','receipt') : quickAction('Mon profil','account','profile')}`}
        </div></section>
        <section class="panel"><div class="panel-head"><div><h3>Synthèse des cotisations</h3><p>${campaignScope.label}</p></div></div><div style="padding:20px">
          ${distributionLine(`Encaissé · ${campaignScope.progress} %`,campaignScope.paid,campaignScope.progress,'success')}${distributionLine(`Reste à encaisser · ${100-campaignScope.progress} %`,campaignScope.left,100-campaignScope.progress,'warning')}<div class="scope-total"><span>Montant attendu</span><strong>${campaignScope.expected}</strong></div><div class="scope-updated">Situation arrêtée au 15 septembre 2026</div>
        </div></section>
      </aside>
    </div>
  </section>`;
}

function dashboardCampaignSummary() {
  const open = campaigns.filter(c=>c.status==='Ouverte');
  if (state.dashboardCampaignScope === 'Toutes les campagnes ouvertes') return { paid:'16,6M GNF', left:'11,7M GNF', expected:'28,3M GNF', progress:59, label:`Toutes les campagnes ouvertes · ${open.length} campagnes` };
  const campaign = open.find(c=>c.title===state.dashboardCampaignScope) || open[0];
  return { paid:campaign.paid, left:campaign.left, expected:campaign.expected, progress:campaign.progress, label:`Campagne · ${campaign.title}` };
}
function dashboardPotSummary() {
  const open = pots.filter(p=>p.status==='Ouverte');
  if (state.dashboardPotScope === 'Toutes les cagnottes ouvertes') return { collected:'12,95M GNF', target:'17M GNF', progress:76, label:`Toutes les cagnottes ouvertes · ${open.length} cagnottes` };
  const pot = open.find(p=>p.title===state.dashboardPotScope) || open[0];
  return { collected:pot.collected, target:pot.target, progress:pot.progress, label:`Cagnotte · ${pot.title}` };
}
function dashboardScopePanel() {
  const campaignOptions=['Toutes les campagnes ouvertes',...campaigns.filter(c=>c.status==='Ouverte').map(c=>c.title)];
  const potOptions=['Toutes les cagnottes ouvertes',...pots.filter(p=>p.status==='Ouverte').map(p=>p.title)];
  return `<section class="dashboard-scope" aria-labelledby="dashboard-scope-title"><div class="scope-intro"><div><span class="page-kicker">Périmètre des indicateurs</span><h2 id="dashboard-scope-title">Données affichées</h2></div><p>Les cotisations et les cagnottes ont des sélections indépendantes · Situation au 15 septembre 2026</p></div><div class="scope-fields"><div class="scope-field"><label>Campagne de cotisation</label>${customSelect(campaignOptions,false,false,'Sélectionner la campagne',state.dashboardCampaignScope,'data-dashboard-scope="campaign"')}</div><div class="scope-field"><label>Cagnotte sociale</label>${customSelect(potOptions,false,false,'Sélectionner la cagnotte',state.dashboardPotScope,'data-dashboard-scope="pot"')}</div></div></section>`;
}
function dashboardPaymentsPanel() {
  const allOpen=state.dashboardCampaignScope==='Toutes les campagnes ouvertes';
  const openTitles=campaigns.filter(c=>c.status==='Ouverte').map(c=>c.title);
  const scopedPayments=payments.filter(payment=>allOpen?openTitles.includes(payment.campaign):payment.campaign===state.dashboardCampaignScope);
  const displayed=scopedPayments.slice(0,3);
  const scopeLabel=allOpen?`Toutes les campagnes ouvertes · ${openTitles.length} campagnes`:`Campagne · ${state.dashboardCampaignScope}`;
  const countLabel=scopedPayments.length?`${displayed.length} dernier${displayed.length>1?'s':''} règlement${displayed.length>1?'s':''} affiché${displayed.length>1?'s':''} sur ${scopedPayments.length}`:'Aucun règlement enregistré dans ce périmètre';
  return `<section class="panel"><div class="panel-head payments-panel-head"><div><h3>Derniers règlements</h3><p>${scopeLabel}<span class="panel-scope-count">${countLabel}</span></p></div><button class="text-link" data-route="payments">Voir l’historique</button></div>${displayed.length?`<div class="activity-list">${displayed.map(activityRow).join('')}</div>`:`<div class="empty-state empty-state-compact"><div class="empty-icon">${svg('payments')}</div><strong>Aucun règlement récent</strong><p>Aucune opération n’est enregistrée pour « ${state.dashboardCampaignScope} ».</p></div>`}</section>`;
}
function statCard(label, value, meta, icon, scope='') {
  return `<article class="stat-card"><div class="stat-top"><span class="stat-label">${label}</span><span class="stat-icon">${svg(icon)}</span></div><div class="stat-value">${value}</div><div class="stat-meta">${meta}</div>${scope?`<div class="stat-scope">${scope}</div>`:''}</article>`;
}
function campaignRow(c) {
  return `<div class="campaign-row" data-route="campaign"><div><div class="row-title">${c.title}</div><div class="row-sub">${c.period}</div></div><div>${status(c.status,c.tone)}</div><div><div class="progress-copy"><span>${c.paid}</span><span>${c.progress}%</span></div><div class="progress"><span style="width:${c.progress}%"></span></div></div><div class="row-chevron">${svg('chevron')}</div></div>`;
}
function limitedCampaignRow(c) {
  return `<div class="campaign-row" data-route="campaign"><div><div class="row-title">${c.title}</div><div class="row-sub">${c.period}</div></div><div>${status(c.status,c.tone)}</div><div><div class="row-sub">${c.members} membres concernés</div></div><div class="row-chevron">${svg('chevron')}</div></div>`;
}
function activityRow(p) {
  return `<div class="activity"><div class="activity-icon">${svg('payments')}</div><div class="activity-copy"><strong>${p.member.name}</strong><span>${p.campaign} · ${p.mode} · ${p.date}</span></div><span class="activity-amount amount">+ ${p.amount}</span></div>`;
}
function quickAction(label, route, icon) { return `<button class="quick-action" data-route="${route}">${svg(icon)}<span>${label}</span></button>`; }
function distributionLine(label, value, percent, tone) { return `<div style="margin-bottom:18px"><div class="progress-copy" style="font-size:10px"><span>${label}</span><span>${value}</span></div><div class="progress" style="height:6px"><span style="width:${percent}%;background:var(--${tone})"></span></div></div>`; }

function membersPage() {
  const canAdd = isManager();
  const actions = canAdd ? button('Ajouter un membre','member-form') : '';
  return `<section class="page">${pageHead('Répertoire', 'Membres', '86 membres actifs sur 91 membres enregistrés.', actions)}
    <div class="toolbar"><div class="searchbox">${svg('search')}<input id="member-search" type="search" placeholder="Rechercher un membre…" aria-label="Rechercher un membre"></div><div class="segmented" data-filter-group="member">${['Tous','Actifs','Inactifs'].map(x=>`<button class="segment ${state.memberFilter===x?'active':''}" data-member-filter="${x}">${x}</button>`).join('')}</div></div>
    <div class="data-panel"><div class="table-wrap"><table class="table"><thead><tr><th>Membre</th><th>Téléphone</th><th>Catégorie</th><th>Fonction</th><th>Statut</th><th></th></tr></thead><tbody id="member-table">${members.map(memberRow).join('')}</tbody></table></div><div class="mobile-cards" id="member-cards">${members.map(memberCard).join('')}</div></div>
  </section>`;
}
function memberRow(m) { return `<tr data-route="member" data-member-status="${m.status}" data-search="${m.name.toLowerCase()}"><td><div class="person"><div class="avatar">${m.initials}</div><div><strong>${m.name}</strong><span>${m.city}, ${m.country}</span></div></div></td><td>${m.phone}</td><td>Catégorie ${m.category}</td><td>${m.function}</td><td>${status(m.status,m.status==='Actif'?'success':'neutral')}</td><td>${svg('chevron')}</td></tr>`; }
function memberCard(m) { return `<article class="member-card" data-route="member" data-member-status="${m.status}" data-search="${m.name.toLowerCase()}"><div class="member-card-top"><div class="person"><div class="avatar">${m.initials}</div><div><strong>${m.name}</strong><span>${m.city}, ${m.country}</span></div></div>${status(m.status,m.status==='Actif'?'success':'neutral')}</div><div class="member-meta"><div><div class="meta-label">Catégorie</div><div class="meta-value">Catégorie ${m.category}</div></div><div><div class="meta-label">Fonction</div><div class="meta-value">${m.function}</div></div></div></article>`; }

function memberDetailPage() {
  const m = members[0];
  const edit = state.role.startsWith('Opérateur') || isManager() ? button('Modifier','member-edit','edit','secondary') : '';
  return `<section class="page"><div class="page-head"><div><button class="text-link" data-route="members">${svg('arrow')} Retour aux membres</button></div></div><div class="detail-layout"><div>
    <section class="hero-panel"><div class="hero-top"><div class="hero-identity"><div class="avatar">${m.initials}</div><div><h2>${m.name}</h2><div class="inline-meta">${status('Actif','success')}<span>Catégorie B</span><span>Président</span></div></div></div><div class="button-row">${edit}${isFinancialAllowed()?button('Enregistrer un règlement','payment-form','payments'):''}</div></div>
      <div class="info-grid">${infoItem('Nom','Diallo')}${infoItem('Prénom','Amadou')}${infoItem('Nom d’usage','—')}${infoItem('Téléphone',m.phone)}${infoItem('Pays','Guinée')}${infoItem('Ville','Conakry')}${infoItem('Catégorie de revenu','Catégorie B')}${infoItem('Fonction associative','Président')}</div>
    </section>
    <div class="tabs" role="tablist" aria-label="Données du membre">${memberTabs()}</div>
    <div id="member-tab-content" class="tab-content" role="tabpanel" aria-live="polite">${memberTabContent()}</div>
  </div><aside class="detail-side"><section class="side-card"><h3>Situation actuelle</h3><div class="financial-number">50 000 GNF</div><div class="financial-label">Reste à payer</div><div class="side-separator"></div><div class="mini-grid"><div><strong>250 000 GNF</strong><span>Total dû</span></div><div><strong>200 000 GNF</strong><span>Total payé</span></div></div></section><section class="side-card"><h3>Compte associé</h3><div class="person"><div class="avatar">AD</div><div><strong>Accès actif</strong><span>Rôle · Membre</span></div></div><div class="callout">${svg('info')}<span>La fonction « Président » est indépendante du rôle applicatif.</span></div></section></aside></div></section>`;
}
function memberTabs(){return [['dues','Cotisations'],['payments','Règlements'],['contributions','Contributions']].map(([id,label])=>`<button class="tab ${state.memberTab===id?'active':''}" role="tab" aria-selected="${state.memberTab===id}" tabindex="${state.memberTab===id?'0':'-1'}" data-member-tab="${id}">${label}</button>`).join('');}
function memberTabContent(){
  if(state.memberTab==='payments') return `<section class="data-panel"><div class="table-wrap"><table class="table"><thead><tr><th>Date</th><th>Campagne</th><th>Montant</th><th>Mode</th><th>Enregistré par</th></tr></thead><tbody><tr><td>12 sept. 2026</td><td>Solidarité septembre</td><td class="amount" style="color:var(--success)">+ 50 000 GNF</td><td>Espèces</td><td>A. Touré</td></tr><tr><td>18 juin 2026</td><td>Soutien juin 2026</td><td class="amount" style="color:var(--success)">+ 150 000 GNF</td><td>Mobile Money</td><td>M. Bah</td></tr></tbody></table></div><div class="mobile-cards">${payments.filter(p=>p.member.id===1).map(activityRow).join('')}</div></section>`;
  if(state.memberTab==='contributions') return `<section class="data-panel"><div class="table-wrap"><table class="table"><thead><tr><th>Cagnotte</th><th>Montant</th><th>Mode</th><th>Date</th><th>Enregistrée par</th></tr></thead><tbody><tr><td>Mariage de Fanta & Sékou</td><td class="amount" style="color:var(--success)">+ 150 000 GNF</td><td>Mobile Money</td><td>14 sept. 2026</td><td>M. Bah</td></tr></tbody></table></div><div class="mobile-cards"><article class="member-card"><div class="member-card-top"><div><h3>Mariage de Fanta & Sékou</h3><p class="row-sub">14 sept. 2026 · Mobile Money</p></div><span class="amount" style="color:var(--success)">+ 150 000 GNF</span></div></article></div></section>`;
  return `<section class="data-panel"><div class="table-wrap"><table class="table"><thead><tr><th>Campagne</th><th>Dû</th><th>Payé</th><th>Reste</th><th>Statut</th></tr></thead><tbody><tr data-route="campaign"><td><strong style="color:var(--text)">Solidarité septembre</strong></td><td class="amount">100 000 GNF</td><td class="amount">50 000 GNF</td><td class="amount">50 000 GNF</td><td>${status('Partiellement payé','warning')}</td></tr><tr><td><strong style="color:var(--text)">Soutien juin 2026</strong></td><td class="amount">150 000 GNF</td><td class="amount">150 000 GNF</td><td class="amount">0 GNF</td><td>${status('Payé','success')}</td></tr></tbody></table></div><div class="mobile-cards">${dueMobile('Solidarité septembre','100 000 GNF','50 000 GNF','warning','Partiellement payé')}${dueMobile('Soutien juin 2026','150 000 GNF','0 GNF','success','Payé')}</div></section>`;
}
function infoItem(label,value){ return `<div class="info-item"><span>${label}</span><strong>${value}</strong></div>`; }
function dueMobile(title,due,left,tone,label,route=''){return `<article class="member-card" ${route?`data-route="${route}"`:''}><div class="member-card-top"><div><h3>${title}</h3><p class="row-sub">Montant dû · ${due}</p></div>${status(label,tone)}</div><div class="member-meta"><div><div class="meta-label">Reste à payer</div><div class="meta-value amount">${left}</div></div></div></article>`;}

function campaignsPage() {
  return `<section class="page">${pageHead('Cotisations', 'Campagnes', 'Chaque campagne possède ses propres montants par catégorie.', isManager()?button('Créer une campagne','campaign-form'):'' )}
    <div class="toolbar"><div class="searchbox">${svg('search')}<input id="campaign-search" type="search" placeholder="Rechercher une campagne…"></div><div class="segmented">${['Toutes','Ouvertes','À venir','Clôturées'].map(x=>`<button class="segment ${state.campaignFilter===x?'active':''}" data-campaign-filter="${x}">${x}</button>`).join('')}</div></div>
    <div class="list-grid">${campaigns.map(state.role === 'Opérateur non autorisé' ? limitedCampaignCard : campaignCard).join('')}</div>
  </section>`;
}
function campaignCard(c) { return `<article class="campaign-card" data-route="campaign" data-campaign-status="${c.status}" data-search="${c.title.toLowerCase()}"><div class="campaign-card-head"><span class="eyebrow">${c.members} membres</span>${status(c.status,c.tone)}</div><h3>${c.title}</h3><p>${c.period}</p><div class="amount">${c.paid} <span style="color:var(--text-3);font-size:11px">/ ${c.expected}</span></div><div class="progress"><span style="width:${c.progress}%"></span></div><div class="campaign-card-foot"><span>Encaissé</span><span>${c.progress}%</span></div></article>`; }
function limitedCampaignCard(c) { return `<article class="campaign-card" data-route="campaign" data-campaign-status="${c.status}" data-search="${c.title.toLowerCase()}"><div class="campaign-card-head"><span class="eyebrow">${c.members} membres</span>${status(c.status,c.tone)}</div><h3>${c.title}</h3><p>${c.period}</p><div class="side-separator"></div><div class="campaign-card-foot"><span>Consultation</span><span>Voir le détail</span></div></article>`; }

function campaignDetailPage() {
  const limitedOperator = state.role === 'Opérateur non autorisé';
  if (limitedOperator) return `<section class="page"><div class="page-head"><div><button class="text-link" data-route="campaigns">${svg('arrow')} Retour aux campagnes</button></div></div>
    <section class="campaign-hero"><div class="campaign-hero-head"><div><div class="page-kicker">Campagne ouverte</div><h2>Solidarité septembre</h2><p class="page-intro">Du 1er au 30 septembre 2026 · 86 membres concernés</p></div>${status('Consultation','neutral')}</div><div class="campaign-metrics">${metric('Début','1 sept. 2026','')}${metric('Fin','30 sept. 2026','')}${metric('Membres concernés','86','Membres actifs')}${metric('Statut','Ouverte','')}</div></section>
    <div class="tabs"><button class="tab active">Membres concernés</button></div><div class="callout" style="margin-bottom:16px">${svg('lock')}<span>Les montants et opérations financières ne sont pas affichés avec cette autorisation.</span></div>
    <section class="data-panel"><div class="table-wrap"><table class="table"><thead><tr><th>Membre</th><th>Catégorie</th><th>Situation</th></tr></thead><tbody>${dues.map(d=>`<tr data-route="member"><td><div class="person"><div class="avatar">${d.member.initials}</div><div><strong>${d.member.name}</strong><span>${d.member.city}</span></div></div></td><td>Cat. ${d.member.category}</td><td>${status(d.status,d.tone)}</td></tr>`).join('')}</tbody></table></div><div class="mobile-cards">${dues.map(d=>`<article class="member-card" data-route="member"><div class="member-card-top"><div class="person"><div class="avatar">${d.member.initials}</div><div><strong>${d.member.name}</strong><span>Catégorie ${d.member.category}</span></div></div>${status(d.status,d.tone)}</div></article>`).join('')}</div></section></section>`;
  return `<section class="page"><div class="page-head"><div><button class="text-link" data-route="campaigns">${svg('arrow')} Retour aux campagnes</button></div></div>
    <section class="campaign-hero"><div class="campaign-hero-head"><div><div class="page-kicker">Campagne ouverte</div><h2>Solidarité septembre</h2><p class="page-intro">Du 1er au 30 septembre 2026 · 86 membres concernés</p></div><div class="button-row">${isFinancialAllowed()?button('Enregistrer un règlement','payment-form','payments'):''}${isManager()?button('Clôturer','', 'lock','secondary'):''}</div></div>
      <div class="campaign-metrics">${metric('Total attendu','18 500 000 GNF','86 membres')}${metric('Total encaissé','12 400 000 GNF','67 % collectés')}${metric('Reste à encaisser','6 100 000 GNF','33 % restant')}${metric('Paiements','38 / 86','27 partiels')}</div>
    </section>
    <div class="tabs" role="tablist" aria-label="Détail de la campagne">${campaignTabs()}</div>
    <div id="campaign-tab-content" class="tab-content" role="tabpanel" aria-live="polite">${campaignTabContent()}</div>
  </section>`;
}
function metric(label,value,small){return `<div class="metric"><span>${label}</span><strong>${value}</strong><small>${small}</small></div>`;}
function dueRow(d){return `<tr data-route="member"><td><div class="person"><div class="avatar">${d.member.initials}</div><div><strong>${d.member.name}</strong><span>${d.member.city}</span></div></div></td><td>Cat. ${d.member.category}</td><td class="amount">${d.due}</td><td class="amount">${d.paid}</td><td class="amount">${d.left}</td><td>${status(d.status,d.tone)}</td></tr>`;}
function dueCard(d){return `<article class="member-card" data-route="member"><div class="member-card-top"><div class="person"><div class="avatar">${d.member.initials}</div><div><strong>${d.member.name}</strong><span>Catégorie ${d.member.category}</span></div></div>${status(d.status,d.tone)}</div><div class="member-meta"><div><div class="meta-label">Dû</div><div class="meta-value amount">${d.due}</div></div><div><div class="meta-label">Reste</div><div class="meta-value amount">${d.left}</div></div></div></article>`;}
function campaignTabs(){return [['members','Situation des membres','Situation'],['categories','Montants par catégorie','Montants'],['payments','Règlements','Règlements']].map(([id,label,mobileLabel])=>`<button class="tab ${state.campaignTab===id?'active':''}" role="tab" aria-selected="${state.campaignTab===id}" tabindex="${state.campaignTab===id?'0':'-1'}" data-campaign-tab="${id}"><span class="tab-label-desktop">${label}</span><span class="tab-label-mobile">${mobileLabel}</span></button>`).join('');}
function campaignTabContent(){
  if(state.campaignTab==='categories') return `<div class="tab-toolbar"><div><h3>Barème de la campagne</h3><p>Montants appliqués selon la catégorie du membre au lancement.</p></div>${isManager()?button('Modifier les montants','campaign-amounts','edit','secondary'):''}</div><section class="data-panel"><div class="table-wrap"><table class="table"><thead><tr><th>Catégorie</th><th>Montant de cette campagne</th><th>Membres concernés</th><th>Total attendu</th></tr></thead><tbody>${[['A','50 000 GNF','22','1 100 000 GNF'],['B','100 000 GNF','24','2 400 000 GNF'],['C','250 000 GNF','20','5 000 000 GNF'],['D','500 000 GNF','20','10 000 000 GNF']].map(r=>`<tr><td><div class="person"><div class="category-letter">${r[0]}</div><strong>Catégorie ${r[0]}</strong></div></td><td class="amount">${r[1]}</td><td>${r[2]} membres</td><td class="amount">${r[3]}</td></tr>`).join('')}</tbody></table></div><div class="mobile-cards">${[['A','50 000 GNF','22'],['B','100 000 GNF','24'],['C','250 000 GNF','20'],['D','500 000 GNF','20']].map(r=>`<article class="member-card"><div class="member-card-top"><div class="person"><div class="category-letter">${r[0]}</div><strong>Catégorie ${r[0]}</strong></div><span class="amount">${r[1]}</span></div><div class="row-sub">${r[2]} membres concernés</div></article>`).join('')}</div></section><div class="callout">${svg('info')}<span>Ce barème appartient uniquement à la campagne « Solidarité septembre ».</span></div>`;
  if(state.campaignTab==='payments') return `<div class="tab-toolbar"><div><h3>Règlements enregistrés</h3><p>Historique traçable des encaissements de cette campagne.</p></div>${isFinancialAllowed()?button('Enregistrer un règlement','payment-form','plus'):''}</div><section class="data-panel"><div class="table-wrap"><table class="table"><thead><tr><th>Membre</th><th>Montant</th><th>Mode</th><th>Date</th><th>Enregistré par</th></tr></thead><tbody>${payments.map(p=>`<tr><td><div class="person"><div class="avatar">${p.member.initials}</div><strong>${p.member.name}</strong></div></td><td class="amount" style="color:var(--success)">+ ${p.amount}</td><td>${p.mode}</td><td>${p.date}</td><td>${p.by}</td></tr>`).join('')}</tbody></table></div><div class="mobile-cards">${payments.map(p=>`<article class="member-card"><div class="member-card-top"><div class="person"><div class="avatar">${p.member.initials}</div><div><strong>${p.member.name}</strong><span>${p.date} · ${p.mode}</span></div></div><span class="amount" style="color:var(--success)">+ ${p.amount}</span></div></article>`).join('')}</div></section>`;
  return `<div class="toolbar tab-filter"><div class="searchbox">${svg('search')}<input type="search" placeholder="Rechercher un membre…"></div><button class="filter-button">${svg('filter')} Statut</button></div><section class="data-panel"><div class="table-wrap"><table class="table"><thead><tr><th>Membre</th><th>Catégorie</th><th>Montant dû</th><th>Payé</th><th>Reste</th><th>Statut</th></tr></thead><tbody>${dues.map(dueRow).join('')}</tbody></table></div><div class="mobile-cards">${dues.map(dueCard).join('')}</div></section>`;
}

function paymentsPage(contributions = false) {
  if (contributions) return contributionsPage();
  return `<section class="page">${pageHead('Traçabilité', 'Règlements', 'Historique des règlements de cotisation constatés.', isFinancialAllowed()?button('Enregistrer','payment-form','plus'):'' )}<div class="toolbar"><div class="searchbox">${svg('search')}<input type="search" placeholder="Rechercher un membre ou une campagne…"></div><button class="filter-button">${svg('filter')} Filtres</button></div><section class="data-panel"><div class="table-wrap"><table class="table"><thead><tr><th>Membre</th><th>Campagne</th><th>Montant</th><th>Mode</th><th>Date</th><th>Enregistré par</th></tr></thead><tbody>${payments.map(p=>`<tr><td><div class="person"><div class="avatar">${p.member.initials}</div><strong>${p.member.name}</strong></div></td><td>${p.campaign}</td><td class="amount" style="color:var(--success)">+ ${p.amount}</td><td>${p.mode}</td><td>${p.date}</td><td>${p.by}</td></tr>`).join('')}</tbody></table></div><div class="mobile-cards">${payments.map(p=>`<article class="member-card"><div class="member-card-top"><div class="person"><div class="avatar">${p.member.initials}</div><div><strong>${p.member.name}</strong><span>${p.campaign}</span></div></div><span class="amount" style="color:var(--success);font-size:12px">+ ${p.amount}</span></div><div class="member-meta"><div><div class="meta-label">Mode</div><div class="meta-value">${p.mode}</div></div><div><div class="meta-label">Date</div><div class="meta-value">${p.date}</div></div></div></article>`).join('')}</div></section></section>`;
}

function potsPage() {
  return `<section class="page">${pageHead('Solidarité', 'Cagnottes sociales', 'Collectes sociales indépendantes des campagnes de cotisation.', isManager()?button('Créer une cagnotte','pot-form'):'' )}<div class="toolbar"><div class="searchbox">${svg('search')}<input id="pot-search" type="search" placeholder="Rechercher une cagnotte…"></div><div class="segmented">${['Toutes','Ouvertes','Clôturées'].map(x=>`<button class="segment ${state.potFilter===x?'active':''}" data-pot-filter="${x}">${x}</button>`).join('')}</div></div><div class="list-grid">${pots.map(potCard).join('')}</div><div class="callout">${svg('info')}<span>Les contributions aux cagnottes sont entièrement séparées des cotisations et ne réduisent jamais un montant dû.</span></div></section>`;
}
function potCard(p){return `<article class="campaign-card" data-route="pot" data-pot-status="${p.status}" data-search="${`${p.title} ${p.type} ${p.person}`.toLowerCase()}"><div class="campaign-card-head"><span class="eyebrow">${p.type}</span>${status(p.status,p.tone)}</div><h3>${p.title}</h3><p>${p.person} · ${p.period}</p><div class="amount">${p.collected} <span style="color:var(--text-3);font-size:11px">/ ${p.target}</span></div><div class="progress"><span style="width:${p.progress}%"></span></div><div class="campaign-card-foot"><span>${p.contributors} contributeurs</span><span>${p.progress}%</span></div></article>`;}

function potDetailPage(){return `<section class="page"><div class="page-head"><div><button class="text-link" data-route="pots">${svg('arrow')} Retour aux cagnottes</button></div></div><section class="campaign-hero"><div class="campaign-hero-head"><div><div class="page-kicker">Mariage · Cagnotte ouverte</div><h2>Mariage de Fanta & Sékou</h2><p class="page-intro">Famille Camara · Du 5 au 28 septembre 2026</p></div><div class="button-row">${isFinancialAllowed()?button('Enregistrer une contribution','contribution-form','plus'):''}${isManager()?button('Clôturer','','lock','secondary'):''}</div></div><div class="campaign-metrics">${metric('Montant collecté','4 750 000 GNF','68 % de l’objectif')}${metric('Objectif','7 000 000 GNF','Objectif indicatif')}${metric('Reste','2 250 000 GNF','Pour atteindre l’objectif')}${metric('Contributeurs','43','51 contributions')}</div></section><div class="tabs" role="tablist" aria-label="Détail de la cagnotte">${potTabs()}</div><div id="pot-tab-content" class="tab-content" role="tabpanel" aria-live="polite">${potTabContent()}</div></section>`;}
function potTabs(){return [['contributions','Contributions'],['information','Informations']].map(([id,label])=>`<button class="tab ${state.potTab===id?'active':''}" role="tab" aria-selected="${state.potTab===id}" tabindex="${state.potTab===id?'0':'-1'}" data-pot-tab="${id}">${label}</button>`).join('');}
function potTabContent(){
  if(state.potTab==='information') return `<section class="hero-panel"><div class="info-grid" style="margin-top:0">${infoItem('Titre','Mariage de Fanta & Sékou')}${infoItem('Type d’événement','Mariage')}${infoItem('Personne ou famille concernée','Famille Camara')}${infoItem('Période','5 – 28 septembre 2026')}${infoItem('Objectif éventuel','7 000 000 GNF')}${infoItem('Statut','Ouverte')}</div><div class="side-separator"></div><div><div class="meta-label">Description</div><p class="page-intro" style="margin-top:8px">Collecte de solidarité organisée à l’occasion du mariage de Fanta et Sékou.</p></div></section>`;
  return `<div class="tab-toolbar"><div><h3>Contributions enregistrées</h3><p>51 contributions réalisées par 43 membres.</p></div>${isFinancialAllowed()?button('Enregistrer une contribution','contribution-form','plus'):''}</div>${contributionTable()}`;
}

const contributions = [
  { member: members[0], amount:'150 000 GNF', mode:'Mobile Money', date:'14 sept. 2026', by:'M. Bah' },
  { member: members[1], amount:'250 000 GNF', mode:'Espèces', date:'13 sept. 2026', by:'A. Touré' },
  { member: members[2], amount:'100 000 GNF', mode:'Virement bancaire', date:'11 sept. 2026', by:'M. Bah' },
];
function contributionTable(){return `<section class="data-panel"><div class="table-wrap"><table class="table"><thead><tr><th>Membre</th><th>Montant</th><th>Mode</th><th>Date</th><th>Enregistrée par</th></tr></thead><tbody>${contributions.map(c=>`<tr><td><div class="person"><div class="avatar">${c.member.initials}</div><strong>${c.member.name}</strong></div></td><td class="amount" style="color:var(--success)">+ ${c.amount}</td><td>${c.mode}</td><td>${c.date}</td><td>${c.by}</td></tr>`).join('')}</tbody></table></div><div class="mobile-cards">${contributions.map(c=>`<article class="member-card"><div class="member-card-top"><div class="person"><div class="avatar">${c.member.initials}</div><strong>${c.member.name}</strong></div><span class="amount" style="color:var(--success);font-size:12px">+ ${c.amount}</span></div><div class="member-meta"><div><div class="meta-label">Mode</div><div class="meta-value">${c.mode}</div></div><div><div class="meta-label">Date</div><div class="meta-value">${c.date}</div></div></div></article>`).join('')}</div></section>`;}
function contributionsPage(){return `<section class="page">${pageHead('Traçabilité','Contributions','Historique des contributions aux cagnottes sociales.',isFinancialAllowed()?button('Enregistrer','contribution-form'):'' )}<div class="toolbar"><div class="searchbox">${svg('search')}<input type="search" placeholder="Rechercher un membre ou une cagnotte…"></div><button class="filter-button">${svg('filter')} Filtres</button></div>${contributionTable()}</section>`;}

function memberFormPage(editMode = false){
  const operator = state.role.startsWith('Opérateur');
  const editing = editMode || operator;
  return `<section class="page form-page">${pageHead('Membres', editing?'Modifier un membre':'Ajouter un membre', operator?'Seuls les champs de contact sont modifiables avec ce rôle.':editing?'Mettez à jour les informations du membre.':'Le compte utilisateur sera créé automatiquement.', button('Retour',editing?'member':'members','arrow','secondary'))}<form class="form-card demo-form" data-success="Membre enregistré avec succès"><div class="form-section"><div class="section-heading"><span class="section-number">01</span><h3>Identité</h3></div><div class="form-grid">${field('Nom','text',editing?'Diallo':'','Diallo',operator)}${field('Prénom','text',editing?'Amadou':'','Amadou',operator)}${field('Nom d’usage','text','','Facultatif')}${field('Téléphone','tel',editing?'+224 622 12 34 56':'','+224 6XX XX XX XX')}</div></div><div class="form-section"><div class="section-heading"><span class="section-number">02</span><h3>Localisation et association</h3></div><div class="form-grid">${selectField('Pays',['Guinée','Sénégal','France'])}${field('Ville','text',editing?'Conakry':'','Conakry')}${selectField('Catégorie de revenu',['Catégorie B','Catégorie A','Catégorie C','Catégorie D'],operator)}${field('Fonction associative','text',editing?'Président':'','Ex. Secrétaire',operator)}${selectField('Statut',['Actif','Inactif'],operator)}</div>${operator?`<div class="callout">${svg('lock')}<span>La catégorie, la fonction et le statut sont des champs structurants. Ils sont verrouillés pour un Opérateur.</span></div>`:''}</div><div class="form-footer">${button('Annuler',editing?'member':'members','arrow','secondary')}<button class="btn btn-primary" type="submit">${svg('check')} Enregistrer</button></div></form></section>`;
}
function field(label,type,value='',placeholder='',disabled=false){return `<div class="field"><label>${label}</label><input type="${type}" value="${value}" placeholder="${placeholder}" ${disabled?'disabled':''}></div>`;}
let selectSequence=0;
function customSelect(options,disabled=false,compact=false,label='Sélection',selectedValue=options[0],attributes=''){
  const id=`nimba-select-${++selectSequence}`;
  const selected=options.includes(selectedValue)?selectedValue:options[0];
  return `<div class="custom-select ${compact?'custom-select-compact':''}" data-custom-select ${attributes}><button id="${id}" class="select-trigger" type="button" data-select-trigger aria-haspopup="listbox" aria-expanded="false" aria-label="${label}" ${disabled?'disabled':''}><span class="select-value">${selected}</span>${svg('down')}</button><input type="hidden" value="${selected}"><div class="select-menu" role="listbox" aria-labelledby="${id}" hidden>${options.map(option=>`<button class="select-option ${option===selected?'selected':''}" type="button" role="option" aria-selected="${option===selected}" data-select-option data-value="${option}"><span>${option}</span>${option===selected?svg('check'):''}</button>`).join('')}</div></div>`;
}
function selectField(label,options,disabled=false){return `<div class="field"><label>${label}</label>${customSelect(options,disabled,false,label)}</div>`;}

function campaignFormPage(){return `<section class="page form-page">${pageHead('Cotisations','Créer une campagne','Définissez la période, les membres concernés et les montants propres à cette campagne.',button('Retour','campaigns','arrow','secondary'))}<form class="form-card demo-form" data-success="Campagne créée avec succès"><div class="form-section"><div class="section-heading"><span class="section-number">01</span><h3>Informations de la campagne</h3></div><div class="form-grid"><div class="field full"><label>Nom de la campagne</label><input required placeholder="Ex. Solidarité octobre"></div><div class="field full"><label>Description</label><textarea placeholder="Objet de la campagne"></textarea></div>${field('Date de début','date')}${field('Date de fin','date')}</div></div><div class="form-section"><div class="section-heading"><span class="section-number">02</span><h3>Membres concernés</h3></div><div class="field"><label>Population</label>${customSelect(['Tous les membres actifs · 86'],false,false,'Population')}<div class="field-hint">Les membres inactifs ne sont pas inclus automatiquement.</div></div></div><div class="form-section"><div class="section-heading"><span class="section-number">03</span><h3>Montants de cette campagne</h3></div><div class="category-amounts">${['A','B','C','D'].map((x,i)=>categoryAmount(x,[50000,100000,250000,500000][i])).join('')}</div><div class="callout">${svg('info')}<span>Ces montants s’appliquent uniquement à cette campagne. Ils ne définissent aucun tarif permanent pour les catégories.</span></div></div><div class="form-footer">${button('Annuler','campaigns','arrow','secondary')}<button class="btn btn-primary" type="submit">${svg('check')} Créer la campagne</button></div></form></section>`;}
function categoryAmount(letter,value,disabled=false){return `<div class="category-row"><div class="category-letter">${letter}</div><label>Catégorie ${letter}</label><input data-money inputmode="numeric" value="${value.toLocaleString('fr-FR')}" ${disabled?'disabled':''}></div>`;}

function campaignAmountsPage(){
  const editable=isManager();
  return `<section class="page form-page">${pageHead('Solidarité septembre','Montants par catégorie',editable?'Configuration propre à cette campagne.':'Consultation des montants propres à cette campagne.',button('Retour','campaign','arrow','secondary'))}<form class="form-card demo-form" data-success="Montants de la campagne enregistrés"><div class="summary-strip"><div class="summary-cell"><span>Campagne</span><strong>Solidarité septembre</strong></div><div class="summary-cell"><span>Membres</span><strong>86 concernés</strong></div><div class="summary-cell"><span>Statut</span><strong>Ouverte</strong></div></div><div class="category-amounts">${['A','B','C','D'].map((x,i)=>categoryAmount(x,[50000,100000,250000,500000][i],!editable)).join('')}</div><div class="callout">${svg(editable?'info':'lock')}<span>${editable?'Ces montants sont enregistrés dans le contexte de cette campagne uniquement.':'Un Opérateur peut consulter cette configuration, mais ne peut pas la modifier.'}</span></div><div class="form-footer">${button('Retour','campaign','arrow','secondary')}${editable?`<button class="btn btn-primary" type="submit">${svg('check')} Enregistrer</button>`:''}</div></form></section>`;
}

function paymentFormPage(contribution=false){
  const title=contribution?'Enregistrer une contribution':'Enregistrer un règlement';
  const noun=contribution?'cagnotte':'campagne';
  return `<section class="page form-page">${pageHead(contribution?'Cagnottes':'Cotisations',title,'Saisissez une opération déjà constatée. Aucun paiement n’est déclenché ici.',button('Retour',contribution?'pots':'payments','arrow','secondary'))}<form class="form-card demo-form" data-success="${contribution?'Contribution':'Règlement'} enregistré avec succès">${!contribution?`<div class="summary-strip"><div class="summary-cell"><span>Montant dû</span><strong>100 000 GNF</strong></div><div class="summary-cell"><span>Déjà payé</span><strong>50 000 GNF</strong></div><div class="summary-cell"><span>Reste à payer</span><strong style="color:var(--warning)">50 000 GNF</strong></div></div>`:''}<div class="form-grid">${selectField('Membre',members.map(m=>m.name))}${selectField(contribution?'Cagnotte':'Campagne',contribution?pots.map(p=>p.title):campaigns.map(c=>c.title))}<div class="field"><label>Montant</label><div class="money-input"><input id="operation-amount" data-money required inputmode="numeric" placeholder="0"><span>GNF</span></div>${!contribution?'<div class="field-hint">Maximum autorisé : 50 000 GNF</div>':''}</div>${field('Date','date','2026-09-15')}${selectField(contribution?'Mode de contribution':'Mode de règlement',['Espèces','Mobile Money','Virement bancaire'])}</div><div class="callout">${svg('shield')}<span>Cette opération sera horodatée et associée à votre compte pour assurer sa traçabilité.</span></div><div class="form-footer">${button('Annuler',contribution?'pots':'payments','arrow','secondary')}<button class="btn btn-primary" type="submit">${svg('check')} Confirmer l’enregistrement</button></div></form></section>`;
}
function potFormPage(){return `<section class="page form-page">${pageHead('Cagnottes','Créer une cagnotte','Créez une collecte sociale indépendante des cotisations.',button('Retour','pots','arrow','secondary'))}<form class="form-card demo-form" data-success="Cagnotte créée avec succès"><div class="form-grid"><div class="field full"><label>Titre</label><input required placeholder="Ex. Soutien à la famille…"></div>${selectField('Type d’événement',['Mariage','Baptême','Décès','Naissance','Autre'])}${field('Personne ou famille concernée','text','','Nom de la personne ou famille')}<div class="field full"><label>Description</label><textarea placeholder="Contexte de la collecte"></textarea></div>${field('Date de début','date')}${field('Date de fin','date')}<div class="field"><label>Objectif éventuel</label><div class="money-input"><input data-money inputmode="numeric" placeholder="Facultatif"><span>GNF</span></div></div></div><div class="callout">${svg('info')}<span>Une contribution enregistrée ici n’aura aucun effet sur les cotisations des membres.</span></div><div class="form-footer">${button('Annuler','pots','arrow','secondary')}<button class="btn btn-primary" type="submit">${svg('check')} Créer la cagnotte</button></div></form></section>`;}

function usersPage(){
  const rows=[['MB','Moussa Bah','Administrateur','—'],['FC','Fatou Camara','Trésorier','—'],['AT','Aminata Touré','Opérateur','Autorisé'],['IK','Ibrahima Keïta','Opérateur','Non autorisé'],['AD','Amadou Diallo','Membre','—']];
  return `<section class="page">${pageHead('Administration','Utilisateurs & rôles','Gérez le rôle applicatif associé à chaque compte.')}<div class="toolbar"><div class="searchbox">${svg('search')}<input type="search" placeholder="Rechercher un utilisateur…"></div><button class="filter-button">${svg('filter')} Rôle</button></div><section class="data-panel"><div class="table-wrap"><table class="table"><thead><tr><th>Utilisateur</th><th>Rôle applicatif</th><th>Opérations financières</th><th>Compte</th><th></th></tr></thead><tbody>${rows.map(r=>`<tr data-route="operator"><td><div class="person"><div class="avatar">${r[0]}</div><strong>${r[1]}</strong></div></td><td>${r[2]}</td><td>${r[3]==='Autorisé'?status(r[3],'success'):r[3]==='Non autorisé'?status(r[3],'neutral'):r[3]}</td><td>${status('Actif','success')}</td><td>${svg('chevron')}</td></tr>`).join('')}</tbody></table></div><div class="mobile-cards">${rows.map(r=>`<article class="member-card" data-route="operator"><div class="member-card-top"><div class="person"><div class="avatar">${r[0]}</div><div><strong>${r[1]}</strong><span>${r[2]}</span></div></div>${r[3]!=='—'?status(r[3],r[3]==='Autorisé'?'success':'neutral'):status('Actif','success')}</div></article>`).join('')}</div></section></section>`;
}
function operatorPage(){return `<section class="page form-page">${pageHead('Utilisateurs','Configurer le compte','Aminata Touré · Compte actif',button('Retour','users','arrow','secondary'))}<form class="form-card demo-form" data-success="Configuration enregistrée"><div class="form-section"><div class="section-heading"><span class="section-number">01</span><h3>Rôle applicatif</h3></div>${selectField('Rôle',['Opérateur','Membre','Trésorier','Administrateur'])}</div><div class="form-section"><div class="section-heading"><span class="section-number">02</span><h3>Autorisation de l’Opérateur</h3></div><div class="category-row"><div class="category-letter">${svg('payments')}</div><label><strong style="display:block;color:var(--text);font-weight:500;margin-bottom:4px">Enregistrer les opérations financières</strong>Règlements de cotisation et contributions aux cagnottes</label>${customSelect(['Oui','Non'],false,true,'Autorisation financière')}</div><div class="callout">${svg('info')}<span>Cette autorisation est globale. Elle ne varie pas selon la campagne ou la cagnotte.</span></div></div><div class="form-footer">${button('Annuler','users','arrow','secondary')}<button class="btn btn-primary" type="submit">${svg('check')} Enregistrer</button></div></form></section>`;}

function categoriesPage(){return `<section class="page">${pageHead('Administration','Catégories de revenu','Les catégories classent les membres sans porter de montant permanent.',button('Créer une catégorie','category-form', 'plus'))}<section class="data-panel"><div class="table-wrap"><table class="table"><thead><tr><th>Catégorie</th><th>Libellé</th><th>Membres associés</th><th>Dernière modification</th><th></th></tr></thead><tbody>${[['A','Catégorie A','18'],['B','Catégorie B','31'],['C','Catégorie C','24'],['D','Catégorie D','18']].map(r=>`<tr data-route="category-form"><td><div class="category-letter">${r[0]}</div></td><td>${r[1]}</td><td>${r[2]} membres</td><td>02 sept. 2026</td><td>${svg('edit')}</td></tr>`).join('')}</tbody></table></div><div class="mobile-cards">${['A','B','C','D'].map((x,i)=>`<article class="member-card" data-route="category-form"><div class="member-card-top"><div class="person"><div class="category-letter">${x}</div><div><strong>Catégorie ${x}</strong><span>${[18,31,24,18][i]} membres associés</span></div></div>${svg('edit')}</div></article>`).join('')}</div></section><div class="callout">${svg('info')}<span>Les montants de cotisation sont définis dans chaque campagne, jamais sur une catégorie.</span></div></section>`;}
function categoryFormPage(){return `<section class="page form-page">${pageHead('Catégories','Catégorie de revenu','Le libellé sert uniquement à classer les membres.',button('Retour','categories','arrow','secondary'))}<form class="form-card demo-form" data-success="Catégorie enregistrée"><div class="form-grid"><div class="field full"><label>Libellé de la catégorie</label><input required value="Catégorie A" placeholder="Ex. Catégorie A"></div></div><div class="callout">${svg('info')}<span>Aucun montant n’est associé à cette catégorie. Les montants sont définis dans chaque campagne.</span></div><div class="form-footer">${button('Annuler','categories','arrow','secondary')}<button class="btn btn-primary" type="submit">${svg('check')} Enregistrer</button></div></form></section>`;}

function memberDashboard(){return `<section class="page">${pageHead('Espace membre','Bonjour, Amadou','Consultez votre situation associative au 15 septembre 2026.')}<div class="stats-grid">${statCard('Cotisations à régler','1','Solidarité septembre','clock')}${statCard('Reste à payer','50K GNF','Sur 100K GNF dus','payments')}${statCard('Cotisations réglées','3','Depuis janvier 2026','check')}${statCard('Contributions','400K GNF','Sur 3 cagnottes','pots')}</div><div class="dashboard-grid"><div><section class="panel"><div class="panel-head"><div><h3>Mes cotisations</h3><p>Situation des campagnes qui vous concernent</p></div><button class="text-link" data-route="my-dues">Tout afficher</button></div><div class="campaign-list"><div class="campaign-row" data-route="my-dues"><div><div class="row-title">Solidarité septembre</div><div class="row-sub">Dû · 100 000 GNF</div></div><div>${status('Partiellement payé','warning')}</div><div><div class="progress-copy"><span>50 000 GNF payés</span><span>50 %</span></div><div class="progress"><span style="width:50%"></span></div></div><div class="row-chevron">${svg('chevron')}</div></div><div class="campaign-row"><div><div class="row-title">Soutien juin 2026</div><div class="row-sub">Dû · 150 000 GNF</div></div><div>${status('Payé','success')}</div><div><div class="progress-copy"><span>150 000 GNF payés</span><span>100 %</span></div><div class="progress"><span style="width:100%"></span></div></div><div class="row-chevron">${svg('chevron')}</div></div></div></section></div><aside class="dashboard-side"><section class="panel"><div class="panel-head"><div><h3>Mon profil</h3><p>Informations associatives</p></div></div><div style="padding:20px"><div class="person"><div class="avatar">AD</div><div><strong>Amadou Diallo</strong><span>Conakry, Guinée</span></div></div><div class="info-grid" style="grid-template-columns:1fr;margin-top:16px">${infoItem('Catégorie','Catégorie B')}${infoItem('Fonction associative','Président')}${infoItem('Statut','Actif')}</div><button class="btn btn-secondary" data-route="profile" style="width:100%;margin-top:16px">${svg('profile')} Voir mon profil</button></div></section></aside></div></section>`;}

function profilePage(){const m=members[0];return `<section class="page">${pageHead('Espace personnel','Mon profil','Informations enregistrées par l’association.')}<div class="detail-layout"><section class="hero-panel"><div class="hero-identity"><div class="avatar">AD</div><div><h2>${m.name}</h2><div class="inline-meta">${status('Actif','success')}<span>Rôle · Membre</span></div></div></div><div class="info-grid">${infoItem('Nom','Diallo')}${infoItem('Prénom','Amadou')}${infoItem('Nom d’usage','—')}${infoItem('Téléphone',m.phone)}${infoItem('Pays','Guinée')}${infoItem('Ville','Conakry')}${infoItem('Catégorie de revenu','Catégorie B')}${infoItem('Fonction associative','Président')}</div></section><aside><section class="side-card"><h3>Accès personnel</h3><div class="callout" style="margin-top:0">${svg('info')}<span>Pour corriger une information, contactez un responsable de l’association.</span></div></section></aside></div></section>`;}
function myDuesPage(){return `<section class="page">${pageHead('Espace personnel','Mes cotisations','Votre situation détaillée pour chaque campagne.')}<section class="data-panel"><div class="mobile-cards" style="display:block">${dueMobile('Solidarité septembre','100 000 GNF','50 000 GNF','warning','Partiellement payé','my-due')}${dueMobile('Soutien juin 2026','150 000 GNF','0 GNF','success','Payé','my-due')}${dueMobile('Campagne mars 2026','100 000 GNF','0 GNF','success','Payé','my-due')}</div></section></section>`;}
function myDueDetailPage(){return `<section class="page form-page"><div class="page-head"><button class="text-link" data-route="my-dues">${svg('arrow')} Retour à mes cotisations</button></div><section class="campaign-hero"><div class="campaign-hero-head"><div><div class="page-kicker">Cotisation personnelle</div><h2>Solidarité septembre</h2><p class="page-intro">Du 1er au 30 septembre 2026</p></div>${status('Partiellement payé','warning')}</div><div class="campaign-metrics">${metric('Montant dû','100 000 GNF','Catégorie B')}${metric('Montant payé','50 000 GNF','1 règlement')}${metric('Reste à payer','50 000 GNF','')}${metric('Statut','Partiel','')}</div></section><div class="tabs"><button class="tab active">Historique des règlements</button></div><section class="data-panel"><div class="mobile-cards" style="display:block"><article class="member-card"><div class="member-card-top"><div><h3>Règlement du 12 septembre</h3><p class="row-sub">Espèces · Enregistré par A. Touré</p></div><span class="amount" style="color:var(--success)">+ 50 000 GNF</span></div></article></div></section></section>`;}
function myContributionsPage(){return `<section class="page">${pageHead('Espace personnel','Mes contributions','Historique de vos participations aux cagnottes sociales.')}<section class="data-panel"><div class="mobile-cards" style="display:block">${contributions.map((c,i)=>`<article class="member-card" data-route="my-contribution"><div class="member-card-top"><div><h3>${pots[i]?.title || pots[0].title}</h3><p class="row-sub">${c.date} · ${c.mode}</p></div><span class="amount" style="color:var(--success)">+ ${c.amount}</span></div></article>`).join('')}</div></section></section>`;}
function myContributionDetailPage(){return `<section class="page form-page"><div class="page-head"><button class="text-link" data-route="my-contributions">${svg('arrow')} Retour à mes contributions</button></div><section class="form-card"><div class="page-kicker">Détail de la contribution</div><h2>Mariage de Fanta & Sékou</h2><div class="financial-number" style="margin-top:28px;color:var(--success)">150 000 GNF</div><div class="info-grid">${infoItem('Date','14 septembre 2026')}${infoItem('Mode','Mobile Money')}${infoItem('Cagnotte','Mariage de Fanta & Sékou')}${infoItem('Enregistrée par','Moussa Bah')}</div><div class="callout">${svg('info')}<span>Cette contribution est indépendante de vos cotisations.</span></div></section></section>`;}

function accountPage(){const c=roleConfig[state.role];return `<section class="page form-page">${pageHead('Compte','Mon accès','Préférences d’affichage et informations du compte.')}<section class="form-card"><div class="hero-identity"><div class="avatar">${c.initials}</div><div><h2>${c.name}</h2><div class="inline-meta">${status('Compte actif','success')}<span>${state.role}</span></div></div></div><div class="info-grid">${infoItem('Association','Union Nimba Conakry')}${infoItem('Rôle applicatif',state.role)}${infoItem('Thème',state.theme==='dark'?'Obsidian Midnight':'Alabaster Gallery')}${infoItem('Devise','GNF — Franc Guinéen')}</div><div class="form-footer"><button class="btn btn-secondary theme-toggle">${svg(state.theme==='dark'?'sun':'moon')} Changer de thème</button><button class="btn btn-danger" data-route="login">${svg('logout')} Se déconnecter</button></div></section></section>`;}

function loginPage(){return `<div class="login-shell" data-theme="${state.theme}"><section class="login-visual"><div class="brand login-brand"><div class="brand-mark">${svg('logo')}</div><div><div class="brand-name">NIMBA</div><div class="brand-caption">Gestion associative</div></div></div><div class="login-quote"><div class="page-kicker">Union Nimba Conakry</div><h1>Gérer ensemble.<br>Agir avec clarté.</h1><p>Un espace unique pour suivre les membres, les cotisations et les actions de solidarité de l’association.</p></div></section><section class="login-panel"><form class="login-form" id="login-form"><div class="brand"><div class="brand-mark">${svg('logo')}</div><div><div class="brand-name">NIMBA</div><div class="brand-caption">Gestion associative</div></div></div><h2>Bienvenue</h2><p>Connectez-vous à votre espace associatif.</p><div class="field"><label>Identifiant</label><input type="text" value="moussa.bah" required></div><div class="field"><label>Mot de passe</label><input type="password" value="prototypenimba" required></div><button class="btn btn-primary" type="submit">Se connecter ${svg('chevron')}</button><div class="login-note">L’accès est créé par un responsable de l’association. Il n’existe pas d’inscription libre.</div></form></section></div>`;}

function render() {
  document.documentElement.dataset.theme = state.theme;
  const pages = {
    dashboard: dashboardPage, members: membersPage, member: memberDetailPage, 'member-form': () => memberFormPage(false), 'member-edit': () => memberFormPage(true),
    campaigns: campaignsPage, campaign: campaignDetailPage, 'campaign-form': campaignFormPage, 'campaign-amounts': campaignAmountsPage,
    payments: paymentsPage, 'payment-form': () => paymentFormPage(false), pots: potsPage, pot: potDetailPage,
    'pot-form': potFormPage, 'contribution-form': () => paymentFormPage(true), contributions: () => paymentsPage(true),
    users: usersPage, operator: operatorPage, categories: categoriesPage, 'category-form': categoryFormPage, profile: profilePage,
    'my-dues': myDuesPage, 'my-due': myDueDetailPage, 'my-contributions': myContributionsPage, 'my-contribution': myContributionDetailPage, account: accountPage
  };
  if (state.route === 'login') document.getElementById('app').innerHTML = loginPage();
  else {
    const basePage = (pages[state.route] || dashboardPage)();
    const modal = state.modalRoute ? modalShell(pages[state.modalRoute](), state.modalRoute) : '';
    document.getElementById('app').innerHTML = appShell(basePage + modal);
  }
  document.body?.classList?.toggle('modal-open', Boolean(state.modalRoute));
  if (!state.modalRoute) window.scrollTo(0,0);
}

function navigate(route) {
  if (route === 'campaign' && state.route !== 'campaign') state.campaignTab = 'members';
  if (route === 'member' && state.route !== 'member') state.memberTab = 'dues';
  if (route === 'pot' && state.route !== 'pot') state.potTab = 'contributions';
  if (modalRoutes.has(route) && window.innerWidth > 820 && state.route !== 'login') {
    state.modalRoute = route;
    render();
    window.requestAnimationFrame?.(() => document.querySelector('.modal-dialog input:not([disabled]), .modal-dialog select:not([disabled])')?.focus());
    return;
  }
  state.modalRoute = null;
  state.route = route;
  location.hash = route;
  render();
}
function closeModal() {
  state.modalRoute = null;
  render();
}
function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('nimba-theme', state.theme);
  render();
}
function toast(message, tone='success') {
  const el=document.createElement('div'); el.className=`toast ${tone}`; el.innerHTML=`${svg(tone==='success'?'check':'info')}<span>${message}</span>`;
  document.getElementById('toast-region').appendChild(el); setTimeout(()=>el.remove(),3200);
}

function closeCustomSelects(except=null){
  document.querySelectorAll('.custom-select.open').forEach(select=>{if(select===except)return;select.classList.remove('open','open-up');const trigger=select.querySelector('[data-select-trigger]');const menu=select.querySelector('.select-menu');if(trigger)trigger.setAttribute('aria-expanded','false');if(menu)menu.hidden=true;});
}
function toggleCustomSelect(trigger){
  const select=trigger.closest('[data-custom-select]');const menu=select.querySelector('.select-menu');const opening=menu.hidden;closeCustomSelects(select);
  if(!opening){select.classList.remove('open','open-up');menu.hidden=true;trigger.setAttribute('aria-expanded','false');return;}
  menu.hidden=false;select.classList.add('open');trigger.setAttribute('aria-expanded','true');
  window.requestAnimationFrame?.(()=>{
    const rect=trigger.getBoundingClientRect();const height=Math.min(menu.scrollHeight,236);const scrollArea=select.closest('.modal-scroll');const boundary=scrollArea?.getBoundingClientRect();
    const topLimit=boundary?.top??8;const bottomLimit=boundary?.bottom??(window.innerHeight-(window.innerWidth<=820?78:8));const spaceAbove=rect.top-topLimit;const spaceBelow=bottomLimit-rect.bottom;
    select.classList.toggle('open-up',spaceBelow<height+14&&spaceAbove>spaceBelow);
  });
}
function chooseCustomOption(option){
  const select=option.closest('[data-custom-select]');const trigger=select.querySelector('[data-select-trigger]');const value=option.dataset.value;
  select.querySelector('.select-value').textContent=value;select.querySelector('input[type="hidden"]').value=value;
  select.querySelectorAll('[data-select-option]').forEach(item=>{const selected=item===option;item.classList.toggle('selected',selected);item.setAttribute('aria-selected',String(selected));item.querySelector('svg')?.remove();if(selected)item.insertAdjacentHTML('beforeend',svg('check'));});
  if(select.dataset.dashboardScope){
    if(select.dataset.dashboardScope==='campaign')state.dashboardCampaignScope=value;
    if(select.dataset.dashboardScope==='pot')state.dashboardPotScope=value;
    closeCustomSelects();render();return;
  }
  closeCustomSelects();trigger.focus();
}

document.addEventListener('click', e => {
  const selectOption=e.target.closest('[data-select-option]');
  if(selectOption){e.preventDefault();chooseCustomOption(selectOption);return;}
  const selectTrigger=e.target.closest('[data-select-trigger]');
  if(selectTrigger){e.preventDefault();toggleCustomSelect(selectTrigger);return;}
  if(!e.target.closest('[data-custom-select]'))closeCustomSelects();
  if (e.target.closest('[data-close-modal]')) { e.preventDefault(); closeModal(); return; }
  const route = e.target.closest('[data-route]');
  if (route && state.modalRoute && route.closest('.modal-layer') && (route.classList.contains('btn-secondary') || route.classList.contains('text-link'))) {
    e.preventDefault(); closeModal(); return;
  }
  if (route && !route.disabled) { e.preventDefault(); navigate(route.dataset.route); return; }
  if (e.target.closest('.theme-toggle')) { e.preventDefault(); toggleTheme(); return; }
  const roleToggle = e.target.closest('.role-toggle');
  if (roleToggle) {
    const popovers=document.querySelectorAll('.popover');
    const target=window.innerWidth<=820?popovers[popovers.length-1]:roleToggle.parentElement.querySelector('.popover');
    target.hidden=!target.hidden;
    return;
  }
  const role = e.target.closest('[data-role]');
  if (role) { state.role=role.dataset.role; localStorage.setItem('nimba-role',state.role); state.route='dashboard'; location.hash='dashboard'; render(); return; }
  const campaignTab=e.target.closest('[data-campaign-tab]');
  if(campaignTab){state.campaignTab=campaignTab.dataset.campaignTab;updateTabs('[data-campaign-tab]',campaignTab,'campaign-tab-content',campaignTabContent());return;}
  const memberTab=e.target.closest('[data-member-tab]');
  if(memberTab){state.memberTab=memberTab.dataset.memberTab;updateTabs('[data-member-tab]',memberTab,'member-tab-content',memberTabContent());return;}
  const potTab=e.target.closest('[data-pot-tab]');
  if(potTab){state.potTab=potTab.dataset.potTab;updateTabs('[data-pot-tab]',potTab,'pot-tab-content',potTabContent());return;}
  const memberFilter=e.target.closest('[data-member-filter]');
  if(memberFilter){state.memberFilter=memberFilter.dataset.memberFilter; document.querySelectorAll('[data-member-filter]').forEach(x=>x.classList.toggle('active',x===memberFilter)); applyMemberFilters();}
  const campaignFilter=e.target.closest('[data-campaign-filter]');
  if(campaignFilter){state.campaignFilter=campaignFilter.dataset.campaignFilter;document.querySelectorAll('[data-campaign-filter]').forEach(x=>x.classList.toggle('active',x===campaignFilter));applyCampaignFilters();}
  const potFilter=e.target.closest('[data-pot-filter]');
  if(potFilter){state.potFilter=potFilter.dataset.potFilter;document.querySelectorAll('[data-pot-filter]').forEach(x=>x.classList.toggle('active',x===potFilter));applyPotFilters();}
  const demoAction=e.target.closest('[data-action="demo"]');
  if(demoAction){toast('Action disponible dans le prototype');}
});

function updateTabs(selector,activeButton,contentId,content){
  document.querySelectorAll(selector).forEach(tab=>{const active=tab===activeButton;tab.classList.toggle('active',active);tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});
  const panel=document.getElementById(contentId);if(panel){panel.innerHTML=content;panel.classList.remove('tab-enter');void panel.offsetWidth;panel.classList.add('tab-enter');}
}

document.addEventListener('input', e => {
  if(e.target.matches?.('[data-money]')){const digits=e.target.value.replace(/\D/g,'');e.target.value=digits?new Intl.NumberFormat('fr-FR').format(Number(digits)):'';}
  if(e.target.id==='member-search') applyMemberFilters();
  if(e.target.id==='campaign-search') applyCampaignFilters();
  if(e.target.id==='pot-search') applyPotFilters();
});
function applyMemberFilters(){const q=(document.getElementById('member-search')?.value||'').toLowerCase();document.querySelectorAll('[data-member-status]').forEach(el=>{const matchText=el.dataset.search.includes(q);const matchStatus=state.memberFilter==='Tous'||(state.memberFilter==='Actifs'&&el.dataset.memberStatus==='Actif')||(state.memberFilter==='Inactifs'&&el.dataset.memberStatus==='Inactif');el.style.display=matchText&&matchStatus?'':'none';});}
function applyCampaignFilters(){const q=(document.getElementById('campaign-search')?.value||'').toLowerCase();const wanted={'Ouvertes':'Ouverte','Clôturées':'Clôturée'}[state.campaignFilter]||state.campaignFilter;document.querySelectorAll('[data-campaign-status]').forEach(el=>{const matchText=el.dataset.search.includes(q);const matchStatus=state.campaignFilter==='Toutes'||el.dataset.campaignStatus===wanted;el.style.display=matchText&&matchStatus?'':'none';});}
function applyPotFilters(){const q=(document.getElementById('pot-search')?.value||'').toLowerCase();const wanted={'Ouvertes':'Ouverte','Clôturées':'Clôturée'}[state.potFilter]||state.potFilter;document.querySelectorAll('[data-pot-status]').forEach(el=>{const matchText=el.dataset.search.includes(q);const matchStatus=state.potFilter==='Toutes'||el.dataset.potStatus===wanted;el.style.display=matchText&&matchStatus?'':'none';});}

document.addEventListener('submit', e => {
  e.preventDefault();
  if(e.target.id==='login-form'){navigate('dashboard');toast('Connexion réussie');return;}
  if(e.target.classList.contains('demo-form')){
    const activeRoute=state.modalRoute || state.route;
    if(activeRoute==='payment-form'){
      const input=document.getElementById('operation-amount'); const amount=Number((input?.value||'0').replace(/\s/g,''));
      if(amount>50000){toast('Le montant dépasse le reste à payer de 50 000 GNF','error'); input.focus(); return;}
    }
    const message=e.target.dataset.success||'Enregistrement effectué';
    if(state.modalRoute){closeModal();toast(message);return;}
    toast(message);
    setTimeout(()=>navigate(activeRoute.includes('contribution')?'pots':activeRoute.includes('payment')?'payments':activeRoute.includes('campaign')?'campaigns':activeRoute.includes('member')?'members':activeRoute.includes('category')?'categories':'dashboard'),450);
  }
});

document.addEventListener('keydown',e=>{
  const trigger=e.target.closest?.('[data-select-trigger]');
  if(trigger&&['Enter',' ','ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();toggleCustomSelect(trigger);const options=[...trigger.closest('[data-custom-select]').querySelectorAll('[data-select-option]')];(options.find(option=>option.classList.contains('selected'))||options[0])?.focus();return;}
  const option=e.target.closest?.('[data-select-option]');
  if(option){const options=[...option.parentElement.querySelectorAll('[data-select-option]')];if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?options[0]:e.key==='End'?options.at(-1):options[(options.indexOf(option)+(e.key==='ArrowDown'?1:-1)+options.length)%options.length];next.focus();return;}if(['Enter',' '].includes(e.key)){e.preventDefault();chooseCustomOption(option);return;}if(e.key==='Escape'){e.preventDefault();const owner=option.closest('[data-custom-select]');const ownerTrigger=owner.querySelector('[data-select-trigger]');closeCustomSelects();ownerTrigger.focus();return;}}
  if(e.key==='Escape'&&document.querySelector('.custom-select.open')){closeCustomSelects();return;}
  if(e.key==='Escape'&&state.modalRoute){closeModal();return;}
  if(['ArrowLeft','ArrowRight'].includes(e.key)&&e.target.matches?.('[role="tab"]')){const tabs=[...e.target.closest('[role="tablist"]').querySelectorAll('[role="tab"]')];const direction=e.key==='ArrowRight'?1:-1;const next=tabs[(tabs.indexOf(e.target)+direction+tabs.length)%tabs.length];next.focus();next.click();}
});
window.addEventListener('hashchange',()=>{const next=location.hash.slice(1);if(next&&next!==state.route){state.modalRoute=null;state.route=next;render();}});
window.addEventListener('resize',()=>{if(state.modalRoute&&window.innerWidth<=820){const route=state.modalRoute;state.modalRoute=null;state.route=route;location.hash=route;render();}});
render();
