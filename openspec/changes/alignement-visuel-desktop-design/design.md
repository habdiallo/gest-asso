## Context

Le frontend Angular (`contribo-front/`) implémente les écrans métier du cahier des charges, mais leur fidélité visuelle au prototype statique `design/` n'a été vérifiée systématiquement que pour la sidebar desktop (change archivé `fidelite-sidebar-desktop-design`, T-111, spec `desktop-sidebar-visual`). Les autres écrans ont été livrés ticket par ticket sur la base des user stories et règles métier, sans passage de comparaison visuelle dédié contre `design/`. Le porteur du produit a identifié un premier écart concret : l'absence du lien de navigation « Tableau de bord » alors que le prototype en affiche un pour chaque rôle (`design/app.js`, `roleConfig`).

Le prototype `design/` reste une référence statique (HTML/CSS/JS), pas du code Angular : il fixe des jetons de design (couleurs, typographies, rayons, espacements), des layouts et des comportements visuels (survol, état actif, dialogues), mais ne fait pas foi sur le contenu métier, les droits par rôle ou les routes.

Ce change formalise une méthode de revue reproductible, écran par écran, pour rattraper ces écarts en desktop d'abord, avant d'étendre la démarche à la tablette et au mobile dans un change ultérieur.

## Goals / Non-Goals

**Goals:**
- Définir une méthode de revue visuelle reproductible : connexion, capture de l'écran atteint, comparaison point par point avec `design/`, correction, vérification, avant de passer à l'écran suivant.
- Couvrir, dans l'ordre de navigation réel de l'application, le tableau de bord puis chaque destination du menu latéral actuel (Membres, Catégories de revenu, Campagnes, Cagnottes, Rôles et utilisateurs, Mon espace), ainsi que les dialogues de formulaire transverses.
- Statuer sur l'écart du lien « Tableau de bord » identifié par le porteur du produit, en le traitant comme une exception ciblée à la règle T-111 (« aucun nouveau lien du prototype »), documentée dans `specs/desktop-sidebar-visual/spec.md`.
- Découper le travail en tickets indépendants, un par écran/composant, pour permettre une revue et une validation incrémentales sans bloquer l'ensemble du chantier sur un seul diff massif.

**Non-Goals:**
- Tablette et mobile : explicitement hors périmètre de ce change. Un change OpenSpec ultérieur les traitera une fois tous les écrans desktop alignés. Les seuils responsive existants (821 px pour la sidebar, breakpoints Tailwind) ne sont pas modifiés ici.
- Reprendre le travail déjà fait sur la sidebar par T-111 (marque, présentation des liens existants, pied de sidebar) : seule l'exception « Tableau de bord » rouvre `desktop-sidebar-visual`.
- Modifier le contenu métier, les droits par rôle, les routes existantes (hors ajout éventuel d'une route/lien tableau de bord), le contrat API ou les données affichées.
- Reprendre les éléments du prototype explicitement écartés par T-111 (sélecteur de rôle de démonstration, données fictives).
- Corriger dans ce change les écarts déjà couverts par `desktop-sidebar-visual` ou par les tickets d'accessibilité (T-103) et de responsive (T-104) déjà traités : ce change porte sur la fidélité visuelle desktop, pas sur le clavier ou les autres tailles d'écran.

## Decisions

### Un ticket par écran/composant, dans l'ordre de navigation

Plutôt qu'un ticket unique couvrant tous les écrans (diff massif, revue difficile) ou un ticket par écart individuel (trop fin, dépendances croisées entre écarts d'un même écran), chaque écran/composant de la liste ci-dessus devient un ticket indépendant, traité dans l'ordre où l'utilisateur les rencontre en naviguant depuis le tableau de bord. Cet ordre correspond à la demande explicite du porteur du produit (« on commence à aller navigation en navigation [...] quand on finit les tickets on les traite puis on entame un autre composant ») et limite le risque de régression croisée entre écrans indépendants.

**Alternative écartée** : un seul ticket « alignement visuel global ». Écartée car elle empêche une revue incrémentale et retarde la détection d'écarts de méthode (ex. mauvaise interprétation d'un jeton de design) jusqu'à la fin du chantier.

### Réouverture ciblée de `desktop-sidebar-visual`, pas de nouveau change pour la sidebar

L'ajout du lien « Tableau de bord » modifie une exigence existante de `desktop-sidebar-visual` (T-111) plutôt que de créer une nouvelle capability dédiée à la navigation, car il s'agit du même artefact visuel (la sidebar) déjà spécifié. Le reste de la spec T-111 n'est pas rouvert.

**Alternative écartée** : traiter ce lien comme faisant partie de la capability `desktop-visual-parity` (tableau de bord). Écartée car le lien vit dans la sidebar (composant partagé affichant sur tous les écrans), pas dans le contenu de l'écran tableau de bord lui-même ; le rattacher à `desktop-sidebar-visual` évite une exigence dupliquée entre deux specs.

### Référence visuelle par capture, pas de diff pixel automatisé

Aucun outil de comparaison pixel-par-pixel n'est installé dans ce dépôt (voir `.claude/rules/frontend/eslint.md`, `tests.md` : pas d'outil E2E ou d'audit visuel automatisé configuré). La comparaison reste manuelle : capture d'écran de l'état courant à 1440 px (puis 1024 px si un écart de grille desktop existe), confrontée aux règles de `design/DESIGN (5).md`, `design/styles.css` et au rendu de `design/index.html` pour l'écran équivalent.

**Alternative écartée** : outil de régression visuelle automatisé (ex. Percy, Chromatic). Écartée car cela introduirait une dépendance et un service tiers non discutés avec le mainteneur, disproportionnés pour ce chantier ; à reconsidérer séparément si le besoin se répète.

### Tableau de bord (T-117) : le périmètre visuel inclut les éléments interactifs déjà couverts par le contrat

Le prototype `design/` présente le tableau de bord de gestion comme un panneau interactif (sélecteurs de campagne/cagnotte pour le bilan financier, raccourcis de navigation « Actions rapides »), pas seulement comme des blocs statiques. Le mainteneur a demandé la fidélité complète à cet écran plutôt qu'une reproduction purement statique. Ce ticket câble donc réellement ces éléments plutôt que de les représenter à l'identique sans effet :
- Le panneau « Périmètre des indicateurs » utilise `campaignId`/`socialFundId`, déjà prévus par `GET /dashboard` (`besoins/openapi.yaml`) mais jusque-là inexploités par le frontend, et les écrans `GET /campagnes`/`GET /cagnottes` (statut `OUVERTE`) déjà utilisés ailleurs pour peupler les deux sélecteurs.
- Les panneaux de synthèse (cotisations, cagnotte) affichent le bilan financier de la campagne/cagnotte sélectionnée (`financialOverview.selectedCampaign`/`selectedSocialFund`), déjà exposé par le contrat.
- « Actions rapides » sont de vrais liens de navigation vers les écrans existants (`/membres`, `/campagnes`, `/cagnottes`, `/roles-utilisateurs`, `/categories-de-revenu`, `/mon-espace`), filtrés par rôle selon les mêmes règles que ces écrans (`canCreateMember`/`canCreateCampaign`/`canCreateSocialFund`). Ils n'ouvrent pas directement les boîtes de dialogue de création du prototype : ces dialogues vivent dans d'autres features (`members`, `campaigns`, `social-funds`) et les y déclencher à distance depuis le tableau de bord sortirait du périmètre de ce ticket.
- Écart assumé avec le prototype : le contrat n'expose pas d'agrégat multi-cagnottes (contrairement aux campagnes, où omettre `campaignId` retourne déjà l'agrégat serveur par défaut). Le sélecteur de cagnotte impose donc une cagnotte précise, sans option « Toutes les cagnottes ouvertes ».
- Aucun indicateur affiché avant ce ticket n'est retiré : les 4 cartes déjà alimentées par `ManagementDashboard` (membres actifs, nouveaux membres, campagnes ouvertes, membres inscrits) restent inchangées ; les nouveaux panneaux de synthèse s'ajoutent sans les remplacer.

**Alternative écartée** : reproduire ces éléments comme des placeholders statiques (sélecteurs non fonctionnels, raccourcis décoratifs). Écartée à la demande explicite du mainteneur, et incohérente avec la règle du dépôt qui interdit d'ajouter un comportement inventé sans le rendre réellement fonctionnel quand le contrat le permet déjà.

### Panneau « Derniers règlements » : filtrage par campagne et lien « Voir l'historique » hors périmètre de ce ticket

En vérifiant la fidélité visuelle du panneau (T-117, tâche 1.3), un écart de comportement a été identifié, distinct d'un écart purement visuel et donc non corrigé par ce ticket (la tâche 1.3 interdit explicitement de changer les indicateurs affichés ou leur source de données) :

- Le libellé de périmètre affiché au-dessus des derniers règlements réutilise `campaignScopeView` (le même libellé que le panneau « Synthèse des cotisations »), ce qui laisse croire que `financialOverview.recentPayments` est filtré par la campagne sélectionnée (`campaignId`). Ce n'est pas le cas dans le mock de démonstration (`features/dashboard/mocks/handlers.ts`) : la liste renvoyée est statique, indépendante de `campaignId`. Le contrat (`ManagementFinancialOverview`, `besoins/openapi.yaml`) place pourtant `recentPayments` dans le même objet que `selectedCampaign`/`allOpenCampaignsSummary`, ce qui suggère qu'un filtrage par `campaignId` est attendu côté serveur réel.
- Le bouton « Voir l'historique » du même panneau n'est pas un lien de navigation (`<span>` statique dans `dashboard-page.html`), alors que le prototype et l'attente du mainteneur sont qu'il ouvre l'historique des cotisations de la sélection en cours.

**Solution retenue pour un futur ticket**, à planifier avec `nextTicketId` au moment de sa mise en œuvre (pas dans ce ticket) :
- Filtrer `recentPayments` par `campaignId` quand une campagne précise est sélectionnée ; sans sélection, conserver l'agrégat toutes campagnes ouvertes confondues (comportement déjà correct dans ce cas).
- Faire de « Voir l'historique » un vrai lien : vers `/campagnes/:id` avec l'onglet Cotisations pré-sélectionné quand une campagne précise est sélectionnée (nécessite que `campaign-detail-page.ts` puisse initialiser `activeTab` depuis un paramètre de route, au lieu du seul état local actuel) ; masqué/désactivé pour « Toutes les campagnes ouvertes », faute d'écran combiné listant l'historique de plusieurs campagnes.

**Alternative écartée** : vider silencieusement le panneau en attendant. Écartée aussi, car cela retirerait un indicateur déjà affiché (récents règlements) sans que ce soit non plus le périmètre de ce ticket ; documenter l'écart et le traiter dans un ticket dédié est plus cohérent avec la règle du dépôt (`sans changer les indicateurs affichés ni leur source de données`).

### Dashboard mobile : hors périmètre de ce ticket, nouveau ticket à planifier

Conformément au non-but « tablette et mobile hors périmètre de ce change », l'alignement du tableau de bord sur la maquette mobile de `design/` (colonne unique, cartes empilées) n'est pas traité par T-117. Il sera planifié comme ticket dédié une fois ce change desktop terminé, avec réservation d'un numéro via `nextTicketId` au moment de sa mise en œuvre.

## Risks / Trade-offs

- [Risque] Une correction visuelle sur un composant partagé (ex. `shared/navigation-menu`, `shared/form-dialog`) régresse un autre écran non encore audité → Mitigation : exécuter `npm run build`, `npm test -- --watch=false` et une vérification manuelle des écrans déjà traités après chaque ticket touchant un composant partagé, avant de passer au suivant.
- [Risque] L'ajout du lien « Tableau de bord » change la première position active par défaut et pourrait masquer une régression de garde de routage → Mitigation : le ticket correspondant vérifie explicitement que les gardes de rôle (`roleGuard`, `authenticatedMatch`) et la redirection post-connexion existantes restent inchangées.
- [Compromis] Sans outil de diff pixel automatisé, la revue reste sujette à l'appréciation humaine → Mitigation : documenter dans chaque ticket la liste précise des écarts constatés et corrigés, avec captures avant/après, pour une revue traçable.
- [Risque] Le périmètre desktop-only peut laisser des écrans visuellement corrects en desktop mais dégradés une fois les correctifs appliqués à des tailles intermédiaires (1024-1279 px) → Mitigation : vérifier chaque écran corrigé à 1440 px et 1024 px avant de le considérer terminé, conformément aux breakpoints de `DESIGN (5).md`.

## Migration Plan

Aucune migration de données. Livraison incrémentale : une PR par ticket/écran, vers `main`, chacune laissant l'application fonctionnelle. Pas de retour arrière global nécessaire : un ticket problématique peut être révété indépendamment sans affecter les écrans déjà livrés.

## Open Questions

- Le lien « Tableau de bord » doit-il pointer vers une route dédiée (`/tableau-de-bord`) ou rester sur la route racine `''` actuelle (point d'entrée déjà utilisé par `DASHBOARD_ROUTES`) ? À trancher dans le ticket correspondant selon la simplicité d'implémentation, sans changer le comportement de redirection existant.
- Le format exact du découpage tablette/mobile (un change unique ou plusieurs) sera décidé au moment de proposer ce change ultérieur, une fois tous les tickets desktop de celui-ci terminés.
