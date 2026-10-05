const members = [
  { initials: "SS", name: "Saikou Sounounou Diallo", detail: "Trésorier · Catégorie A", city: "Conakry", phone: "+224 622 249 797", due: "24 000 GNF", paid: "14 000 GNF", left: "10 000 GNF", tone: "warning" },
  { initials: "MS", name: "Mamadou Saidou Diallo", detail: "Commissaire au compte · Catégorie B", city: "Conakry", phone: "621 712 787", due: "500 000 GNF", paid: "30 000 GNF", left: "470 000 GNF", tone: "warning" },
  { initials: "TO", name: "Thierno Oumar Fello President Diallo", detail: "Membre · Catégorie A", city: "Conakry", phone: "+224 622 629 677", due: "4 000 GNF", paid: "0 GNF", left: "4 000 GNF", tone: "error" },
  { initials: "AI", name: "Administrateur Initial", detail: "Administrateur · Catégorie A", city: "Non renseigné", phone: "Non renseigné", due: "4 000 GNF", paid: "0 GNF", left: "4 000 GNF", tone: "error" },
];

const campaigns = [
  { kind: "draft", title: "Cotisation teste 2026", period: "5 au 17 octobre 2026", status: "Brouillon", tone: "neutral", paid: "0 GNF", expected: "35 000 GNF", progress: 0, members: "4 membres", description: "Cette cotisation est un test" },
  { kind: "open", title: "test b", period: "3 au 17 octobre 2026", status: "Ouverte", tone: "success", paid: "34 000 GNF", expected: "512 000 GNF", progress: 6.6, members: "4 membres", description: "test" },
  { kind: "closed", title: "QA Cycle Campagne 2026-10-03", period: "3 au 17 octobre 2026", status: "Clôturée", tone: "neutral", paid: "10 000 GNF", expected: "35 000 GNF", progress: 28.6, members: "4 membres", description: "Parcours QA création configuration cotisations clôture" },
  { kind: "draft", title: "Test", period: "3 au 24 octobre 2026", status: "Brouillon", tone: "neutral", paid: "0 GNF", expected: "0 GNF", progress: 0, members: "4 membres", description: "" },
];

const pots = [
  { title: "QA Cagnotte 20261003", type: "Mariage", person: "Famille QA Recette", period: "3 au 10 octobre 2026", collected: "15 000 GNF", target: "50 000 GNF", progress: 30, contributors: 2, status: "Clôturée", tone: "neutral" },
];

const roles = [
  ["SS", "Saikou Sounounou Diallo", "Administrateur", "-", "Actif", "+224622249797"],
  ["TO", "Thierno Oumar Diallo", "Administrateur", "-", "Actif", "+224622629677"],
  ["MS", "Mamadou Saidou Diallo", "Membre", "-", "Actif", "621712787"],
  ["AI", "Administrateur Initial", "Administrateur", "-", "Actif", "Non renseigné"],
  ["AQ", "Automatisation QA Membre Test", "Membre", "-", "Actif", "620000001"],
  ["AQ", "Automatisation QA Operateur Test", "Opérateur", "Autorisé", "Actif", "620000003"],
  ["AQ", "Automatisation QA Tresorier Test", "Trésorier", "-", "Actif", "620000002"],
];

const categories = [
  ["A", "Categorie A", "5 membres", "03 oct. 2026"],
  ["B", "Categorie B", "2 membres", "03 oct. 2026"],
  ["2", "QA Catégorie Modifiée 20261003", "0 membres", "03 oct. 2026"],
];

const icon = (name) => ({
  home: "⌂", members: "♙", campaigns: "▣", pots: "♡", more: "•••", back: "‹", search: "⌕", plus: "+", arrow: "›", close: "×", check: "✓", wallet: "◈", user: "◎", lock: "◉", info: "i", calendar: "▦", edit: "✎", shield: "◇", logout: "↪", sun: "☼", moon: "☾",
}[name] || "•");

const app = document.querySelector("#app");
const sheetRoot = document.querySelector("#sheet-root");
const toastRoot = document.querySelector("#toast-root");
const normalizeScreen = (screen) => screen === "plus" ? "more" : screen;
const initialScreen = normalizeScreen(new URLSearchParams(window.location.search).get("screen") || "home");
const state = {
  screen: initialScreen,
  memberTab: "dues",
  campaignTab: "members",
  campaignKind: "open",
  personalTab: "profile",
  sheet: null,
  calendarOpen: false,
  dashboardContextType: "campaign",
  dashboardContextScope: "",
  dashboardContextDraft: "",
  theme: "light",
  roleName: "Automatisation QA Operateur Test",
  roleLabel: "Opérateur",
  roleFinance: "Autorisé",
  roleIdentifier: "620000003",
  categoryLabel: "Categorie A",
};

function badge(label, tone = "neutral") { return `<span class="badge ${tone}">${label}</span>`; }

function topbar(kicker, title, subtitle, action = "profile") {
  const actionMarkup = action === "back"
    ? `<button class="icon-btn" data-action="back" aria-label="Retour">${icon("back")}</button>`
    : `<div class="topbar-actions"><button class="theme-toggle" data-action="toggle-theme" aria-label="${state.theme === "dark" ? "Passer au thème clair" : "Passer au thème sombre"}">${icon(state.theme === "dark" ? "sun" : "moon")}</button><button class="avatar" data-screen="account" aria-label="Ouvrir le profil">AI</button></div>`;
  return `<header class="topbar"><div class="topbar-left"><p class="eyebrow">${kicker}</p><h1>${title}</h1>${subtitle ? `<p class="subtitle">${subtitle}</p>` : ""}</div>${actionMarkup}</header>`;
}

function navBar(active) {
  const tabs = [["home", "Accueil"], ["members", "Membres"], ["campaigns", "Campagnes"], ["pots", "Cagnottes"], ["more", "Plus"]];
  return `<nav class="bottom-tabbar" aria-label="Navigation principale">${tabs.map(([id, label]) => `<button class="tab ${active === id ? "active" : ""}" data-screen="${id}"><span>${icon(id)}</span><span>${label}</span></button>`).join("")}</nav>`;
}

function backButton(label, screen) { return `<button class="back-button" data-action="back" data-back-screen="${screen}">${icon("back")} ${label}</button>`; }

function homeScreen() {
  const socialFundContext = state.dashboardContextType === "socialFund";
  const selectedCampaign = campaigns.find((campaign) => campaign.title === state.dashboardContextScope && campaign.kind === "open");
  const selectedSocialFund = pots.find((pot) => pot.title === state.dashboardContextScope && pot.status === "Ouverte");
  const scopeLabel = socialFundContext
    ? selectedSocialFund ? `Cagnotte · ${selectedSocialFund.title}` : "Toutes les cagnottes ouvertes"
    : selectedCampaign ? `Campagne · ${selectedCampaign.title}` : "Toutes les campagnes ouvertes";
  const dashboardContent = socialFundContext
    ? `<article class="stat-card"><p>Objectif</p><strong>${selectedSocialFund?.target || "0 GNF"}</strong><small>${scopeLabel}</small></article><article class="stat-card"><p>Contributions encaissées</p><strong>${selectedSocialFund?.collected || "0 GNF"}</strong><small>${selectedSocialFund ? `${selectedSocialFund.contributors} contributeurs` : "0 contributeur"}</small></article><div class="section-head"><h2>Dernières contributions</h2><button class="text-btn" data-screen="pots">Tout voir</button></div><div class="list-card"><div class="avatar green">MS</div><div class="list-copy"><strong>Mamadou Saidou Diallo</strong><p>${scopeLabel} · Mobile Money</p></div><div class="list-side"><strong>+30 000</strong><small>4 oct. 2026</small></div></div>`
    : `<article class="stat-card"><p>Progression</p><strong>${selectedCampaign?.progress || "6,6"} %</strong><div class="progress-track"><span style="width:${selectedCampaign?.progress || 6.6}%"></span></div><small>${scopeLabel}</small></article><article class="stat-card"><p>Reste à encaisser</p><strong>${selectedCampaign?.left || "478 000 GNF"}</strong><small>${selectedCampaign?.members || "7 membres concernés"}</small></article><div class="section-head"><h2>Derniers règlements</h2><button class="text-btn" data-screen="campaigns">Tout voir</button></div><div class="list-card"><div class="avatar green">MS</div><div class="list-copy"><strong>Mamadou Saidou Diallo</strong><p>${scopeLabel} · Mobile Money</p></div><div class="list-side"><strong>+30 000</strong><small>4 oct. 2026</small></div></div><div class="list-card"><div class="avatar purple">SS</div><div class="list-copy"><strong>Saikou Sounounou Diallo</strong><p>${scopeLabel} · Espèces</p></div><div class="list-side"><strong>+2 500</strong><small>4 oct. 2026</small></div></div>`;
  return `<section class="screen fade-in">${topbar("Union Contribo", "Bonjour, Administrateur", "Situation au 4 octobre 2026")}<article class="hero-card"><p class="eyebrow">${socialFundContext ? "Contributions encaissées" : "Cotisations encaissées"}</p><h2>${socialFundContext ? "Cagnottes ouvertes" : "Campagnes ouvertes"}</h2><div class="hero-value"><strong>${socialFundContext ? selectedSocialFund?.collected || "0" : selectedCampaign?.paid || "34 000"}</strong><span>GNF</span></div><div class="hero-meta"><div><span>${socialFundContext ? "Reste à collecter" : "Reste à encaisser"}</span><strong>${socialFundContext ? selectedSocialFund?.target || "0 GNF" : selectedCampaign?.left || "478 000 GNF"}</strong></div><div><span>${socialFundContext ? "Contributeurs" : "Membres actifs"}</span><strong>${socialFundContext ? selectedSocialFund?.contributors || "0" : "7 / 7"}</strong></div></div></article><div class="section-head"><div><h2>Vue d'ensemble</h2><p class="scope-summary">${scopeLabel}</p></div><button class="text-btn" data-action="dashboard-filters">Personnaliser</button></div><div class="stat-grid">${dashboardContent.split("<div class=\"section-head\">")[0]}</div>${dashboardContent.substring(dashboardContent.indexOf("<div class=\"section-head\">"))}<div class="section-head"><h2>Actions rapides</h2></div><div class="quick-grid"><button class="quick-btn" data-action="member-form"><span>${icon("plus")}</span><strong>Ajouter un membre</strong></button><button class="quick-btn" data-action="${socialFundContext ? "pot-form" : "campaign-form"}"><span>${icon(socialFundContext ? "pots" : "campaigns")}</span><strong>${socialFundContext ? "Créer une cagnotte" : "Créer une campagne"}</strong></button><button class="quick-btn" data-action="${socialFundContext ? "contribution-form" : "payment-form"}"><span>${icon("wallet")}</span><strong>${socialFundContext ? "Saisir une contribution" : "Saisir un règlement"}</strong></button><button class="quick-btn" data-screen="${socialFundContext ? "pots" : "campaigns"}"><span>${icon(socialFundContext ? "pots" : "campaigns")}</span><strong>Voir les ${socialFundContext ? "cagnottes" : "campagnes"}</strong></button></div>${navBar("home")}</section>`;
}

function membersScreen() {
  return `<section class="screen fade-in">${topbar("Répertoire", "Membres", "7 membres actifs sur 7 enregistrés")}<button class="btn primary block page-cta" data-action="member-form">${icon("plus")} Ajouter un membre</button><div class="search-bar"><span>${icon("search")}</span><input aria-label="Rechercher un membre" placeholder="Rechercher" /></div><div class="filter-row"><button class="chip active">Tous</button><button class="chip">Actifs</button><button class="chip">Inactifs</button><button class="chip">Catégorie</button><button class="chip">Pays</button></div><div class="state-note">7 membres actifs sur 7 membres enregistrés</div>${members.map((member) => `<button class="list-card" data-action="member-detail"><div class="avatar">${member.initials}</div><div class="list-copy"><strong>${member.name}</strong><p>${member.city} · ${member.detail}</p></div><div class="list-side">${badge("Actif", "success")}<small>${member.phone === "Non renseigné" ? "Non renseigné" : member.phone}</small></div></button>`).join("")}${navBar("members")}</section>`;
}

function memberDetailScreen() {
  const member = members[0];
  const tabs = [["dues", "Cotisations"], ["payments", "Règlements"], ["contributions", "Contributions"]];
  let panel = "";
  if (state.memberTab === "payments") panel = `<div class="data-card"><div class="data-row"><strong>4 oct. 2026</strong><span>test b · Espèces</span><b>+ 2 500 GNF</b></div><div class="data-row"><strong>3 oct. 2026</strong><span>test b · Mobile Money</span><b>+ 500 GNF</b></div><div class="data-row"><strong>3 oct. 2026</strong><span>QA Cycle Campagne</span><b>+ 5 000 GNF</b></div></div>`;
  else if (state.memberTab === "contributions") panel = `<div class="data-card"><div class="data-row"><strong>QA Cagnotte 20261003</strong><span>Espèces · 3 oct. 2026</span><b>+ 10 000 GNF</b></div></div>`;
  else panel = `<div class="data-card"><div class="data-row"><strong>test b</strong><span>3 au 17 octobre 2026 · 4 000 GNF dû</span>${badge("Payé", "success")}</div><div class="data-row"><strong>Cotisation teste 2026</strong><span>5 au 17 octobre 2026 · 10 000 GNF restant</span>${badge("À payer", "warning")}</div></div>`;
  return `<section class="screen fade-in">${backButton("Membres", "members")}<div class="identity-card"><div class="avatar large">${member.initials}</div><div><h1>${member.name}</h1><p>${member.city} · ${member.phone}</p>${badge("Actif", "success")} ${badge("Catégorie A", "neutral")}</div></div><div class="identity-actions"><button class="btn secondary" data-action="member-edit">${icon("edit")} Modifier</button><button class="btn primary" data-action="member-payment-info">${icon("wallet")} Règlement</button></div><div class="detail-card"><h2>Informations</h2><dl class="detail-grid"><div><dt>Nom</dt><dd>Diallo</dd></div><div><dt>Prénom</dt><dd>Saikou Sounounou</dd></div><div><dt>Nom d'usage</dt><dd>Non renseigné</dd></div><div><dt>Téléphone</dt><dd>${member.phone}</dd></div><div><dt>Pays</dt><dd>Guinée</dd></div><div><dt>Ville</dt><dd>Conakry</dd></div><div><dt>Fonction associative</dt><dd>Trésorier</dd></div></dl></div><div class="detail-card"><h2>Situation actuelle</h2><div class="stat-grid"><article class="stat-card"><p>Reste à payer</p><strong>10 000</strong><small>GNF</small></article><article class="stat-card"><p>Montant payé</p><strong>14 000</strong><small>GNF sur 24 000 GNF</small></article></div></div><div class="section-head"><h2>Historique</h2></div><div class="segmented">${tabs.map(([id, label]) => `<button class="${state.memberTab === id ? "active" : ""}" data-member-tab="${id}">${label}</button>`).join("")}</div>${panel}<div class="button-row"><button class="btn danger" data-action="deactivate">${icon("lock")} Désactiver</button></div></section>`;
}

function campaignsScreen() {
  return `<section class="screen fade-in">${topbar("Cotisations", "Campagnes", "Chaque campagne possède ses propres montants")}<button class="btn primary block page-cta" data-action="campaign-form">${icon("plus")} Créer une campagne</button><div class="search-bar"><span>${icon("search")}</span><input aria-label="Rechercher une campagne" placeholder="Rechercher" /></div><div class="filter-row"><button class="chip active">Toutes</button><button class="chip">Brouillons</button><button class="chip">Ouvertes</button><button class="chip">Clôturées</button></div>${campaigns.map((campaign) => `<button class="campaign-card" data-action="campaign-detail" data-kind="${campaign.kind}"><div class="campaign-top"><div><h3>${campaign.title}</h3><p>${campaign.period} · ${campaign.members}</p></div>${badge(campaign.status, campaign.tone)}</div><div class="campaign-numbers"><div><span>Encaissé</span><strong>${campaign.paid}</strong></div><div><span>Objectif</span><strong>${campaign.expected}</strong></div></div><div class="campaign-progress"><div class="campaign-progress-head"><span>Progression</span><strong>${campaign.progress}%</strong></div><div class="progress-track"><span style="width:${campaign.progress}%"></span></div></div></button>`).join("")}${navBar("campaigns")}</section>`;
}

function campaignDetailScreen() {
  const draft = state.campaignKind === "draft";
  const closed = state.campaignKind === "closed";
  const title = draft ? "Cotisation teste 2026" : closed ? "QA Cycle Campagne 2026-10-03" : "test b";
  const status = draft ? "Brouillon" : closed ? "Clôturée" : "Ouverte";
  const summary = draft ? ["35 000 GNF", "0 GNF", "35 000 GNF", "0 / 4"] : closed ? ["35 000 GNF", "10 000 GNF", "25 000 GNF", "1 / 4"] : ["512 000 GNF", "34 000 GNF", "478 000 GNF", "1 / 4"];
  let panel = "";
  if (state.campaignTab === "bar") panel = `<div class="detail-card"><div class="section-head"><div><h2>Barème de la campagne</h2><p class="subtitle">Montants appliqués selon la catégorie au lancement.</p></div>${draft ? `<button class="text-btn" data-action="amounts-form">Modifier</button>` : ""}</div><div class="data-row"><strong>Catégorie A</strong><span>3 membres · Total attendu 12 000 GNF</span><b>4 000 GNF</b></div><div class="data-row"><strong>Catégorie B</strong><span>1 membre · Total attendu 500 000 GNF</span><b>500 000 GNF</b></div><p class="inline-note">Ce barème appartient uniquement à la campagne « ${title} ».</p></div>`;
  else if (state.campaignTab === "payments") panel = `<div class="detail-card"><h2>Règlements enregistrés</h2><p class="subtitle">Historique traçable des encaissements de cette campagne.</p><div class="data-row"><strong>Mamadou Saidou Diallo</strong><span>Mobile Money · 4 oct. 2026</span><b>+ 30 000 GNF</b></div><div class="data-row"><strong>Saikou Sounounou Diallo</strong><span>Espèces · 4 oct. 2026</span><b>+ 2 500 GNF</b></div><div class="data-row"><strong>Saikou Sounounou Diallo</strong><span>Mobile Money · 3 oct. 2026</span><b>+ 500 GNF</b></div></div>`;
  else panel = `<div class="section-head"><h2>Situation des membres</h2><button class="text-btn">Filtrer</button></div><div class="search-bar"><span>${icon("search")}</span><input aria-label="Rechercher un membre" placeholder="Rechercher un membre" /></div><div class="data-card"><div class="data-row"><strong>Saikou Sounounou Diallo</strong><span>Cat. A · 4 000 GNF dû</span>${badge(draft ? "À payer" : "Payé", draft ? "warning" : "success")}</div><div class="data-row"><strong>Thierno Oumar Fello</strong><span>Cat. A · 4 000 GNF restant</span>${badge("À payer", "error")}</div><div class="data-row"><strong>Mamadou Saidou Diallo</strong><span>Cat. B · 470 000 GNF restant</span>${badge(draft ? "À payer" : "Partiel", "warning")}</div><div class="data-row"><strong>Administrateur Initial</strong><span>Cat. A · 4 000 GNF restant</span>${badge("À payer", "error")}</div></div>`;
  const tabs = [["members", "Situation"], ["bar", "Barème"], ["payments", "Règlements"]];
  return `<section class="screen fade-in">${backButton("Campagnes", "campaigns")}<p class="eyebrow">Campagne ${status}</p><h1>${title}</h1><p class="subtitle">${draft ? "5 au 17 octobre 2026 · 4 membres concernés · Cette cotisation est un test" : closed ? "3 au 17 octobre 2026 · 4 membres concernés" : "3 au 17 octobre 2026 · 4 membres concernés · test"}</p><div class="stat-grid" style="margin-top:20px"><article class="stat-card"><p>Total attendu</p><strong>${summary[0]}</strong><small>4 membres</small></article><article class="stat-card"><p>Total encaissé</p><strong>${summary[1]}</strong><small>${draft ? "0%" : closed ? "28,6%" : "6,6%"} collectés</small></article><article class="stat-card"><p>Reste à encaisser</p><strong>${summary[2]}</strong><small>pour atteindre l'objectif</small></article><article class="stat-card"><p>Paiements</p><strong>${summary[3]}</strong><small>${draft ? "0 partiels" : closed ? "0 partiels" : "1 partiel"}</small></article></div>${draft ? `<article class="prep-card"><div class="section-head"><div><h2>Préparation de la campagne</h2><p class="subtitle">Vérifiez la configuration avant d'autoriser les règlements.</p></div>${badge("Incomplète", "warning")}</div><ul class="check-list"><li class="done">✓ Toutes les catégories ont un montant</li><li class="done">✓ Les dates sont cohérentes</li><li>! La date de début est atteinte</li><li class="done">✓ Les cotisations peuvent être établies</li></ul><div class="error-box">L'ouverture reste bloquée : une vérification de préparation est nécessaire.</div></article>` : ""}${!closed && !draft ? `<button class="btn primary block" style="margin-top:12px" data-action="payment-form">${icon("plus")} Enregistrer un règlement</button>` : ""}<div class="segmented campaign-tabs">${tabs.map(([id, label]) => `<button class="${state.campaignTab === id ? "active" : ""}" data-campaign-tab="${id}">${label}</button>`).join("")}</div>${panel}${!closed && !draft ? `<button class="btn danger block" data-action="close-campaign">${icon("lock")} Clôturer la campagne</button>` : ""}</section>`;
}

function potsScreen() {
  return `<section class="screen fade-in">${topbar("Solidarité", "Cagnottes", "Collectes sociales séparées des cotisations")}<button class="btn primary block page-cta" data-action="pot-form">${icon("plus")} Créer une cagnotte</button><div class="search-bar"><span>${icon("search")}</span><input aria-label="Rechercher une cagnotte" placeholder="Rechercher" /></div><div class="filter-row"><button class="chip active">Toutes</button><button class="chip">Ouvertes</button><button class="chip">Clôturées</button><button class="chip">Type d'événement</button></div>${pots.map((pot) => `<button class="campaign-card" data-action="pot-detail"><div class="campaign-top"><div><h3>${pot.title}</h3><p>${pot.type} · ${pot.person}</p></div>${badge(pot.status, pot.tone)}</div><div class="campaign-numbers"><div><span>Collecté</span><strong>${pot.collected}</strong></div><div><span>Objectif</span><strong>${pot.target}</strong></div></div><div class="campaign-progress"><div class="campaign-progress-head"><span>${pot.contributors} contributeurs · ${pot.period}</span><strong>${pot.progress}%</strong></div><div class="progress-track"><span style="width:${pot.progress}%"></span></div></div></button>`).join("")}<div class="notice">${icon("wallet")} Les contributions restent indépendantes des montants dus.</div>${navBar("pots")}</section>`;
}

function potDetailScreen() {
  return `<section class="screen fade-in">${backButton("Cagnottes", "pots")}<p class="eyebrow">Mariage · Clôturée</p><h1>QA Cagnotte 20261003</h1><p class="subtitle">Famille QA Recette · 3 au 10 octobre 2026</p><div class="stat-grid" style="margin-top:20px"><article class="stat-card"><p>Montant collecté</p><strong>15 000</strong><small>GNF enregistré</small></article><article class="stat-card"><p>Objectif</p><strong>50 000</strong><small>GNF</small></article><article class="stat-card"><p>Reste</p><strong>35 000</strong><small>GNF</small></article><article class="stat-card"><p>Contributeurs</p><strong>2</strong><small>Membres contributeurs</small></article></div><div class="section-head"><h2>Contributions</h2></div><p class="subtitle">Historique des contributions enregistrées pour cette cagnotte.</p><div class="data-card"><div class="data-row"><strong>Externe QA Recette</strong><span>Externe · Espèces · 3 oct. 2026</span><b>+ 5 000 GNF</b></div><div class="data-row"><strong>Saikou Sounounou Diallo</strong><span>Espèces · 3 oct. 2026</span><b>+ 10 000 GNF</b></div></div></section>`;
}

function moreScreen() {
  const items = [["roles", "Utilisateurs et rôles", "Gérer les accès applicatifs", "◎"], ["categories", "Catégories de revenu", "Classer les membres", "◇"], ["profile", "Mon profil", "Espace personnel en lecture seule", "◎"]];
  return `<section class="screen fade-in">${topbar("Administration", "Plus", "Votre espace de gestion")}<div class="detail-card" style="margin-top:0"><div class="header-profile"><div class="avatar large">AI</div><div><small>Connecté en tant que</small><strong>Administrateur Initial</strong><p class="subtitle">Administrateur</p></div></div></div><div class="section-head"><h2>Réglages et espaces</h2></div>${items.map(([screen, title, desc, symbol]) => `<button class="list-card" data-screen="${screen}"><div class="avatar">${symbol}</div><div class="list-copy"><strong>${title}</strong><p>${desc}</p></div><div class="chevron">${icon("arrow")}</div></button>`).join("")}<div class="section-head"><h2>Session</h2></div><button class="btn danger block" data-action="logout">${icon("logout")} Se déconnecter</button>${navBar("more")}</section>`;
}

function rolesScreen() {
  return `<section class="screen fade-in">${backButton("Plus", "more")}<p class="eyebrow">Administration</p><h1>Utilisateurs et rôles</h1><p class="subtitle">Consultez le rôle applicatif associé à chaque compte utilisateur.</p><div class="search-bar"><span>${icon("search")}</span><input aria-label="Rechercher un utilisateur" placeholder="Rechercher un utilisateur" /></div><div class="filter-row"><button class="chip active">Tous les rôles</button><button class="chip">Administrateur</button><button class="chip">Trésorier</button><button class="chip">Opérateur</button><button class="chip">Membre</button></div>${roles.map(([initials, name, role, finance, status, identifier]) => `<button class="list-card" data-action="role-edit" data-role-name="${name}" data-role-label="${role}" data-role-finance="${finance}" data-role-id="${identifier}"><div class="avatar">${initials}</div><div class="list-copy"><strong>${name}</strong><p>${role} · Opérations financières : ${finance}</p></div><div class="list-side">${badge(status, "success")}<small>${icon("edit")} Modifier</small></div></button>`).join("")}</section>`;
}

function categoriesScreen() {
  return `<section class="screen fade-in">${backButton("Plus", "more")}<p class="eyebrow">Administration</p><h1>Catégories de revenu</h1><p class="subtitle">Les catégories classent les membres sans porter de montant permanent.</p><button class="btn primary block page-cta" data-action="category-form">${icon("plus")} Créer une catégorie</button><div class="section-head"><h2>Catégories</h2></div>${categories.map(([initial, label, count, date]) => `<button class="list-card" data-action="category-edit"><div class="avatar">${initial}</div><div class="list-copy"><strong>${label}</strong><p>${count} · Modifiée le ${date}</p></div><div class="list-side"><small>${icon("edit")} Modifier</small></div></button>`).join("")}<div class="notice">${icon("info")} Les montants sont définis dans chaque campagne, jamais sur une catégorie.</div></section>`;
}

function accountScreen() {
  return `<section class="screen fade-in">${backButton("Accueil", "home")}<p class="eyebrow">Compte</p><h1>Mon accès</h1><p class="subtitle">Préférences d'affichage et informations du compte.</p><div class="detail-card"><div class="identity-card"><div class="avatar large">AI</div><div><h2>Administrateur Initial</h2><p>Compte actif · Administrateur</p>${badge("Actif", "success")}</div></div><dl class="detail-grid" style="margin-top:18px"><div><dt>Association</dt><dd>Contribo</dd></div><div><dt>Rôle applicatif</dt><dd>Administrateur</dd></div><div><dt>Thème</dt><dd>${state.theme === "dark" ? "Obsidian Midnight" : "Alabaster Gallery"}</dd></div><div><dt>Devise</dt><dd>GNF - Franc Guinéen</dd></div></dl><div class="identity-actions" style="margin-bottom:0"><button class="btn secondary" data-action="toggle-theme">${icon("calendar")} Changer de thème</button><button class="btn danger" data-action="logout">${icon("logout")} Se déconnecter</button></div></div></section>`;
}

function profileScreen() {
  let panel;
  if (state.personalTab === "dues") panel = `<div class="data-card"><div class="data-row"><strong>Cotisation teste 2026</strong><span>5 au 17 octobre 2026</span>${badge("À payer", "warning")}<b>10 000 GNF</b></div><div class="data-row"><strong>QA Cycle Campagne 2026-10-03</strong><span>3 au 17 octobre 2026</span>${badge("À payer", "warning")}<b>10 000 GNF</b></div><div class="data-row"><strong>test b</strong><span>3 au 17 octobre 2026</span>${badge("À payer", "warning")}<b>4 000 GNF</b></div><div class="data-row"><strong>Test</strong><span>3 au 24 octobre 2026</span>${badge("Payé", "success")}<b>0 GNF</b></div></div><div class="pagination">Précédent · Page 1 sur 1 · Suivant</div>`;
  else if (state.personalTab === "contributions") panel = `<div class="empty-state"><div class="empty-icon">${icon("pots")}</div><h2>Aucune contribution pour le moment.</h2><p>Historique de vos contributions aux cagnottes.</p></div>`;
  else panel = `<div class="detail-card"><div class="identity-card"><div class="avatar large">AI</div><div><h2>Administrateur Initial</h2><p>Actif · Rôle</p></div></div><dl class="detail-grid" style="margin-top:18px"><div><dt>Nom</dt><dd>Initial</dd></div><div><dt>Prénom</dt><dd>Administrateur</dd></div><div><dt>Nom d'usage</dt><dd>Non renseigné</dd></div><div><dt>Téléphone</dt><dd>Non renseigné</dd></div><div><dt>Pays</dt><dd>Non renseigné</dd></div><div><dt>Ville</dt><dd>Non renseigné</dd></div><div><dt>Catégorie de revenu</dt><dd>Categorie A</dd></div><div><dt>Fonction associative</dt><dd>Non renseigné</dd></div></dl><div class="notice">${icon("info")} Ces informations sont en lecture seule. Pour corriger une donnée, contactez un responsable de l'association.</div></div>`;
  const tabs = [["profile", "Mon profil"], ["dues", "Mes cotisations"], ["contributions", "Mes contributions"]];
  return `<section class="screen fade-in">${backButton("Plus", "more")}<p class="eyebrow">Espace personnel</p><h1>${state.personalTab === "profile" ? "Mon profil" : state.personalTab === "dues" ? "Mes cotisations" : "Mes contributions"}</h1><p class="subtitle">${state.personalTab === "profile" ? "Informations enregistrées par l'association." : state.personalTab === "dues" ? "Votre situation détaillée pour chaque campagne." : "Historique de vos contributions aux cagnottes."}</p><div class="segmented personal-tabs">${tabs.map(([id, label]) => `<button class="${state.personalTab === id ? "active" : ""}" data-personal-tab="${id}">${label}</button>`).join("")}</div>${panel}</section>`;
}

function loginScreen() {
  return `<section class="screen auth-screen fade-in"><div class="auth-brand"><div class="brand-mark">${icon("home")}</div><div><strong>CONTRIBO</strong><small>GESTION ASSOCIATIVE</small></div></div><div class="auth-hero"><p class="eyebrow">Union Contribo · Conakry</p><h1>Gérer ensemble.<br />Agir avec clarté.</h1><p class="subtitle">Un espace unique pour suivre les membres, les cotisations et les actions de solidarité de l'association.</p></div><div class="auth-card"><p class="eyebrow">Accès sécurisé</p><h2>Bienvenue</h2><p class="subtitle">Connectez-vous à votre espace associatif.</p><div class="field"><label for="login-identifier">Identifiant *</label><input id="login-identifier" placeholder="Votre identifiant" /></div><div class="field"><label for="login-password">Mot de passe *</label><input id="login-password" type="password" placeholder="Votre mot de passe" /></div><div class="error-box" data-login-error hidden>Identifiant ou mot de passe requis.</div><button class="btn primary block" data-action="login-submit">Se connecter ${icon("arrow")}</button><p class="auth-note">L'accès est créé par un responsable de l'association. Il n'existe pas d'inscription libre.</p></div></section>`;
}

function changePasswordScreen() {
  return `<section class="screen auth-screen fade-in"><div class="auth-brand"><div class="brand-mark">${icon("home")}</div><div><strong>CONTRIBO</strong><small>GESTION ASSOCIATIVE</small></div></div><div class="auth-card"><p class="eyebrow">Sécurité du compte</p><h1>Changer le mot de passe</h1><p class="subtitle">Définissez un nouveau mot de passe pour continuer.</p><div class="field"><label for="new-password">Nouveau mot de passe *</label><input id="new-password" type="password" /></div><div class="field"><label for="password-confirmation">Confirmation *</label><input id="password-confirmation" type="password" /></div><div class="error-box" data-password-error hidden>Les mots de passe ne correspondent pas.</div><button class="btn primary block" data-action="password-submit">Enregistrer</button><button class="btn ghost block" data-action="logout">Se déconnecter</button></div></section>`;
}

function accessDeniedScreen() {
  return `<section class="screen access-screen fade-in"><div class="empty-icon">${icon("lock")}</div><p class="eyebrow">Sécurité</p><h1>Accès refusé</h1><p class="subtitle">Vous n'avez pas les droits nécessaires pour consulter cet écran.</p><button class="btn secondary" data-screen="home">Retour au tableau de bord</button></section>`;
}

function loadingScreen() {
  return `<section class="screen fade-in"><p class="eyebrow">Chargement</p><h1>Tableau de bord</h1><p class="subtitle">Récupération des données de l'association.</p><div class="skeleton-hero"></div><div class="stat-grid"><div class="skeleton-card"></div><div class="skeleton-card"></div></div><div class="section-head"><h2>Campagnes récentes</h2></div><div class="data-card"><div class="skeleton-row"></div><div class="skeleton-row"></div><div class="skeleton-row"></div></div></section>`;
}

function calendarBlock() {
  return `<div class="calendar"><div class="calendar-head"><button type="button">‹</button><strong>Octobre 2026</strong><button type="button">›</button></div><div class="calendar-week"><span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span></div><div class="calendar-days">${[28,29,30,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,1,2,3,4,5,6,7].map((day, index) => `<button class="${day === 4 && index === 6 ? "selected" : ""}" data-action="choose-date">${day}</button>`).join("")}</div><div class="calendar-footer"><button type="button" disabled>Effacer</button><button type="button" disabled>Aujourd'hui</button></div></div>`;
}

function renderSheet() {
  if (!state.sheet) { sheetRoot.innerHTML = ""; return; }
  let title = "", subtitle = "", body = "";
  if (state.sheet === "dashboard-filters") {
    title = "Personnaliser le tableau de bord";
    subtitle = "Un seul contexte pilote tous les indicateurs affichés.";
    const campaignOptions = campaigns.filter((campaign) => campaign.kind === "open").map((campaign) => `<option value="${campaign.title}" ${state.dashboardContextDraft === campaign.title ? "selected" : ""}>${campaign.title}</option>`).join("");
    const socialFundOptions = pots.filter((pot) => pot.status === "Ouverte").map((pot) => `<option value="${pot.title}" ${state.dashboardContextDraft === pot.title ? "selected" : ""}>${pot.title}</option>`).join("");
    const socialFundContext = state.dashboardContextType === "socialFund";
    const options = socialFundContext ? socialFundOptions : campaignOptions;
    const emptyLabel = socialFundContext ? "Toutes les cagnottes ouvertes" : "Toutes les campagnes ouvertes";
    body = `<div class="notice">${icon("info")} Les indicateurs financiers suivent le type et le périmètre sélectionnés.</div><div class="field"><label for="dashboard-context-type">Type de données</label><select id="dashboard-context-type" data-dashboard-context-type><option value="campaign" ${!socialFundContext ? "selected" : ""}>Cotisations</option><option value="socialFund" ${socialFundContext ? "selected" : ""}>Cagnottes</option></select></div><div class="field"><label for="dashboard-context-scope">${socialFundContext ? "Cagnotte sociale" : "Campagne de cotisation"}</label><select id="dashboard-context-scope" data-dashboard-context-scope><option value="" ${state.dashboardContextDraft === "" ? "selected" : ""}>${emptyLabel}</option>${options}</select>${socialFundContext && !socialFundOptions ? `<small>Aucune cagnotte ouverte à sélectionner actuellement.</small>` : ""}</div><div class="sheet-actions"><button class="btn secondary" data-action="close-sheet">Annuler</button><button class="btn primary" data-action="apply-dashboard-filters">Appliquer</button></div>`;
  }
  if (state.sheet === "member-form") { title = "Ajouter un membre"; subtitle = "Les informations essentielles du répertoire"; body = `<div class="field"><label>Nom *</label><input placeholder="Ex. Diallo" /></div><div class="field"><label>Prénom *</label><input placeholder="Ex. Saikou" /></div><div class="field"><label>Nom d'usage</label><input placeholder="Facultatif" /></div><div class="field"><label>Téléphone</label><input inputmode="tel" placeholder="+224" /></div><div class="field"><label>Pays</label><input placeholder="Guinée" /></div><div class="field"><label>Ville</label><input placeholder="Conakry" /></div><div class="field"><label>Catégorie de revenu *</label><select><option>Catégorie A</option><option>Catégorie B</option></select></div><div class="field"><label>Fonction associative</label><input placeholder="Facultatif" /></div><div class="sheet-actions"><button class="btn secondary" data-action="close-sheet">Annuler</button><button class="btn primary" data-action="confirm">Enregistrer</button></div>`; }
  if (state.sheet === "member-edit") { title = "Modifier un membre"; subtitle = "Le statut du membre reste géré depuis la fiche"; body = `<div class="form-step"><span>01</span><strong>Identité</strong></div><div class="field"><label>Nom *</label><input value="Diallo" /></div><div class="field"><label>Prénom *</label><input value="Saikou Sounounou" /></div><div class="field"><label>Nom d'usage</label><input /></div><div class="field"><label>Téléphone *</label><input value="+224622249797" /></div><div class="form-step"><span>02</span><strong>Localisation et association</strong></div><div class="field"><label>Pays *</label><input value="Guinée" /></div><div class="field"><label>Ville *</label><input value="Conakry" /></div><div class="field"><label>Catégorie de revenu *</label><select><option>Categorie A</option><option>Categorie B</option></select></div><div class="field"><label>Fonction associative *</label><input value="Trésorier" /></div><div class="sheet-actions"><button class="btn secondary" data-action="close-sheet">Annuler</button><button class="btn primary" data-action="confirm">Enregistrer</button></div>`; }
  if (state.sheet === "member-payment-info") { title = "Nouveau règlement"; subtitle = "Fiche membre"; body = `<div class="notice">${icon("info")} Cette opération enregistre un règlement déjà perçu. Aucun paiement n'est déclenché depuis ce formulaire.</div><div class="empty-state compact"><div class="empty-icon">${icon("check")}</div><h2>Aucune cotisation à régler dans ce contexte</h2><p>Le membre n'a aucune cotisation restant à régler.</p></div><button class="btn secondary block" data-action="close-sheet">Fermer</button>`; }
  if (state.sheet === "payment-form") { title = "Enregistrer un règlement"; subtitle = "Une trace est ajoutée à la campagne"; body = `<div class="notice">${icon("info")} Cette action enregistre une opération déjà constatée. Aucun paiement n'est déclenché ici.</div><div class="field"><label>Membre</label><select><option>Thierno Oumar Fello President Diallo</option><option>Mamadou Saidou Diallo</option></select></div><div class="field"><label>Montant du règlement *</label><input inputmode="decimal" placeholder="0" /></div><div class="field"><label>Date du règlement *</label><button class="field-button" data-action="toggle-calendar">jj/mm/aaaa ${icon("calendar")}</button>${state.calendarOpen ? calendarBlock() : ""}</div><div class="field"><label>Mode de règlement *</label><select><option>Sélectionner</option><option>Mobile Money</option><option>Espèces</option><option>Virement bancaire</option></select></div><p class="inline-note">Ce règlement sera horodaté et associé à votre compte pour assurer sa traçabilité.</p><div class="sheet-actions"><button class="btn secondary" data-action="close-sheet">Annuler</button><button class="btn primary" data-action="confirm">Enregistrer</button></div>`; }
  if (state.sheet === "campaign-form") { title = "Créer une campagne"; subtitle = "Tous les membres actifs seront concernés"; body = `<div class="field"><label>Nom *</label><input placeholder="Ex. Cotisation novembre" /></div><div class="field"><label>Description</label><textarea placeholder="À quoi servira cette collecte ?"></textarea></div><div class="field"><label>Date de début *</label><button class="field-button" data-action="toggle-calendar">${state.calendarOpen ? "Masquer le calendrier" : "jj/mm/aaaa"} ${icon("calendar")}</button>${state.calendarOpen ? calendarBlock() : ""}</div><div class="field"><label>Date de fin *</label><button class="field-button">jj/mm/aaaa ${icon("calendar")}</button></div><div class="field"><label>Membres concernés</label><button class="field-button disabled">Tous les membres actifs</button><small>Le MVP concerne automatiquement tous les membres actifs à la date de création ; les membres inactifs sont exclus.</small></div><div class="sheet-actions"><button class="btn secondary" data-action="close-sheet">Annuler</button><button class="btn primary" data-action="confirm">Créer</button></div>`; }
  if (state.sheet === "amounts-form") { title = "Montants de campagne"; subtitle = "Configuration propre à cette campagne"; body = `<div class="notice">${icon("info")} Ces montants sont enregistrés dans le contexte de cette campagne uniquement.</div><div class="field"><label>Catégorie A *</label><input value="10 000" inputmode="decimal" /><small>Montant en francs guinéens (GNF)</small></div><div class="field"><label>Catégorie B *</label><input value="5 000" inputmode="decimal" /><small>Montant en francs guinéens (GNF)</small></div><div class="sheet-actions"><button class="btn secondary" data-action="close-sheet">Retour</button><button class="btn primary" data-action="confirm">Enregistrer</button></div>`; }
  if (state.sheet === "pot-form") { title = "Nouvelle cagnotte"; subtitle = "Une collecte distincte des cotisations"; body = `<div class="field"><label>Titre *</label><input placeholder="Ex. Soutien à la famille" /></div><div class="field"><label>Type d'événement *</label><select><option>Sélectionnez un type d'événement</option><option>Mariage</option><option>Décès</option><option>Naissance</option><option>Autre</option></select></div><div class="field"><label>Personne ou famille concernée *</label><input placeholder="Ex. Famille Camara" /></div><div class="field"><label>Description</label><textarea placeholder="Facultatif"></textarea></div><div class="field"><label>Date de début *</label><button class="field-button">jj/mm/aaaa ${icon("calendar")}</button></div><div class="field"><label>Date de fin *</label><button class="field-button">jj/mm/aaaa ${icon("calendar")}</button></div><div class="field"><label>Objectif en GNF</label><input inputmode="decimal" placeholder="0" /></div><div class="sheet-actions"><button class="btn secondary" data-action="close-sheet">Annuler</button><button class="btn primary" data-action="confirm">Créer la cagnotte</button></div>`; }
  if (state.sheet === "role-edit") { title = `Rôle applicatif de ${state.roleName}`; subtitle = `${state.roleName} · Compte actif`; const operatorAccess = state.roleLabel === "Opérateur" ? `<div class="form-step"><span>02</span><strong>Autorisation de l'opérateur</strong></div><label class="check-field"><input type="checkbox" ${state.roleFinance === "Autorisé" ? "checked" : ""} /> <span>Enregistrer les opérations financières</span></label>` : ""; body = `<div class="notice">${icon("shield")} Identifiant de connexion : ${state.roleIdentifier}</div><div class="form-step"><span>01</span><strong>Rôle applicatif</strong></div><div class="field"><label>Rôle applicatif *</label><select><option>${state.roleLabel}</option><option>Administrateur</option><option>Trésorier</option><option>Opérateur</option><option>Membre</option></select></div>${operatorAccess}<p class="inline-note">Cette autorisation est globale. Elle ne varie pas selon la campagne ou la cagnotte.</p><div class="detail-card compact-card"><h3>Accès du compte</h3><p class="subtitle">Régénérez un mot de passe temporaire uniquement si le membre a perdu son accès.</p><button class="btn secondary block" data-action="password-reset">Régénérer le mot de passe</button></div><div class="sheet-actions"><button class="btn secondary" data-action="close-sheet">Annuler</button><button class="btn primary" data-action="confirm">Enregistrer</button></div>`; }
  if (state.sheet === "category-form" || state.sheet === "category-edit") { const edit = state.sheet === "category-edit"; title = "Catégorie de revenu"; subtitle = "Catégories"; body = `<p class="subtitle">Le libellé sert uniquement à classer les membres.</p><div class="field"><label>Libellé de la catégorie</label><input value="${edit ? state.categoryLabel : ""}" placeholder="Ex. Catégorie A" /></div><div class="notice">${icon("info")} Aucun montant n'est associé à cette catégorie. Les montants sont définis dans chaque campagne.${edit ? " La modification ne s'applique qu'aux prochaines campagnes." : ""}</div><div class="sheet-actions"><button class="btn secondary" data-action="close-sheet">Annuler</button><button class="btn primary" data-action="confirm">Enregistrer</button></div>`; }
  if (state.sheet === "deactivate") { title = "Désactiver le membre"; subtitle = "Cette action demande une confirmation"; body = `<div class="error-box">Le membre sera désactivé et exclu des campagnes créées après sa désactivation. Son historique de cotisations, règlements et contributions reste consultable.</div><div class="sheet-actions"><button class="btn secondary" data-action="close-sheet">Annuler</button><button class="btn danger" data-action="confirm">Confirmer la désactivation</button></div>`; }
  if (state.sheet === "close-campaign") { title = "Clôturer la campagne"; subtitle = "Cette action est définitive"; body = `<div class="error-box">Une fois clôturée, la campagne reste consultable mais n'accepte plus de modification ni de nouveau règlement.</div><div class="sheet-actions"><button class="btn secondary" data-action="close-sheet">Annuler</button><button class="btn danger" data-action="confirm">Clôturer</button></div>`; }
  if (state.sheet === "password-reset") { title = "Régénérer le mot de passe"; subtitle = "Accès du compte"; body = `<div class="notice">${icon("lock")} Un nouveau mot de passe temporaire sera généré pour ce compte.</div><div class="sheet-actions"><button class="btn secondary" data-action="close-sheet">Annuler</button><button class="btn primary" data-action="confirm">Régénérer</button></div>`; }
  sheetRoot.innerHTML = `<div class="sheet-backdrop"><section class="sheet" role="dialog" aria-modal="true" aria-label="${title}"><div class="sheet-handle"></div><div class="sheet-head"><div><h2>${title}</h2><p>${subtitle}</p></div><button class="sheet-close" data-action="close-sheet" aria-label="Fermer">${icon("close")}</button></div>${body}</section></div>`;
}

function render(screen = state.screen) {
  state.screen = normalizeScreen(screen);
  const views = { home: homeScreen, members: membersScreen, "member-detail": memberDetailScreen, campaigns: campaignsScreen, "campaign-detail": campaignDetailScreen, pots: potsScreen, "pot-detail": potDetailScreen, more: moreScreen, roles: rolesScreen, categories: categoriesScreen, account: accountScreen, profile: profileScreen, login: loginScreen, "change-password": changePasswordScreen, "access-denied": accessDeniedScreen, loading: loadingScreen };
  app.innerHTML = (views[screen] || homeScreen)();
  document.documentElement.dataset.theme = state.theme;
  renderSheet();
}

function navigate(screen) {
  const nextScreen = normalizeScreen(screen);
  if (nextScreen === state.screen) {
    return;
  }
  const url = new URL(window.location.href);
  url.searchParams.set("screen", nextScreen);
  window.history.pushState({ screen: nextScreen }, "", url);
  render(nextScreen);
}

function navigateBack(fallbackScreen) {
  if (window.history.state?.screen) {
    window.history.back();
    return;
  }
  navigate(fallbackScreen);
}

function openSheet(name) { state.sheet = name; state.calendarOpen = false; if (name === "dashboard-filters") { state.dashboardContextDraft = state.dashboardContextScope; } render(state.screen); }
function closeSheet() { state.sheet = null; state.calendarOpen = false; render(state.screen); }
function toast(message) { toastRoot.innerHTML = `<div class="toast">${icon("check")} ${message}</div>`; window.setTimeout(() => { toastRoot.innerHTML = ""; }, 2600); }

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-screen], [data-action], [data-member-tab], [data-campaign-tab], [data-personal-tab]");
  if (!target) return;
  const next = target.dataset.screen;
  const action = target.dataset.action;
  if (next) { state.sheet = null; navigate(next); return; }
  if (target.dataset.memberTab) { state.memberTab = target.dataset.memberTab; render("member-detail"); return; }
  if (target.dataset.campaignTab) { state.campaignTab = target.dataset.campaignTab; render("campaign-detail"); return; }
  if (target.dataset.personalTab) { state.personalTab = target.dataset.personalTab; render("profile"); return; }
  if (action === "member-detail") { state.memberTab = "dues"; navigate("member-detail"); return; }
  if (action === "campaign-detail") { state.campaignKind = target.dataset.kind || "open"; state.campaignTab = "members"; navigate("campaign-detail"); return; }
  if (action === "pot-detail") { navigate("pot-detail"); return; }
  if (action === "dashboard-filters") { openSheet(action); return; }
  if (action === "role-edit") { state.roleName = target.dataset.roleName || state.roleName; state.roleLabel = target.dataset.roleLabel || state.roleLabel; state.roleFinance = target.dataset.roleFinance || state.roleFinance; state.roleIdentifier = target.dataset.roleId || state.roleIdentifier; openSheet(action); return; }
  if (action === "category-edit") { state.categoryLabel = target.querySelector("strong")?.textContent || state.categoryLabel; openSheet(action); return; }
  if (["member-form", "member-edit", "member-payment-info", "payment-form", "campaign-form", "amounts-form", "pot-form", "role-edit", "category-form", "category-edit", "deactivate", "close-campaign", "password-reset"].includes(action)) { openSheet(action); return; }
  if (action === "close-sheet") { closeSheet(); return; }
  if (action === "toggle-calendar") { state.calendarOpen = !state.calendarOpen; render(state.screen); return; }
  if (action === "choose-date") { state.calendarOpen = false; render(state.screen); toast("Date sélectionnée"); return; }
  if (action === "apply-dashboard-filters") { state.dashboardContextScope = state.dashboardContextDraft; closeSheet(); toast("Périmètre du tableau de bord mis à jour"); return; }
  if (action === "confirm") { closeSheet(); toast("Action enregistrée dans le prototype"); return; }
  if (action === "toggle-theme") { state.theme = state.theme === "dark" ? "light" : "dark"; render(state.screen); toast("Thème mis à jour"); return; }
  if (action === "logout") { state.sheet = null; navigate("login"); toast("Session fermée dans le prototype"); return; }
  if (action === "login-submit") { const error = app.querySelector("[data-login-error]"); if (error) error.hidden = false; return; }
  if (action === "password-submit") { const error = app.querySelector("[data-password-error]"); if (error) error.hidden = false; return; }
  if (action === "back") { navigateBack(target.dataset.backScreen || "home"); return; }
});

document.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLSelectElement)) return;
  if (target.matches("[data-dashboard-context-type]")) { state.dashboardContextType = target.value; state.dashboardContextDraft = ""; render(state.screen); return; }
  if (target.matches("[data-dashboard-context-scope]")) state.dashboardContextDraft = target.value;
});

window.history.replaceState({ screen: state.screen }, "", window.location.href);
window.addEventListener("popstate", (event) => render(normalizeScreen(event.state?.screen || "home")));
render();
