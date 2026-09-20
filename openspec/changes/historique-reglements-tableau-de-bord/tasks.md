## 1. Préparation T-126

Ticket T-126, scope front, type fix, slug historique-reglements-tableau-de-bord,
branche `front/fix-126-historique-reglements-tableau-de-bord`. Prérequis :
T-117, qui introduit le panneau « Périmètre des indicateurs »
(sélecteur de campagne, `campaignId`) sur lequel ce ticket s'appuie ; T-117
n'est pas encore fusionné dans `main` au moment de la rédaction. Périmètre :
`features/dashboard` (mock + page) et `features/campaigns` (détail de
campagne, onglet initial). Acceptation :
`specs/dashboard-recent-payments-scope/spec.md`.

- [x] 1.1 [T-126] Résoudre et vérifier T-126 (`resolve`/`verify`), créer/réutiliser
      sa branche en incluant T-117 (branche `front/fix-117-...` tant que T-117
      n'est pas fusionné dans `main`).

## 2. Filtrage des derniers règlements par campagne

- [x] 2.1 [T-126] Dans `features/dashboard/mocks/handlers.ts`, filtrer
      `financialOverview.recentPayments` par `campaignId` quand une campagne
      précise est sélectionnée (uniquement les règlements de cette campagne) ;
      sans sélection, conserver l'agrégat toutes campagnes ouvertes confondues,
      plafonné à 5 éléments.
- [x] 2.2 [T-126] Ajouter au jeu de démonstration un règlement rattaché à une
      autre campagne (ouverte ou non) déjà présente une fois T-117 inclus,
      pour que le filtrage soit observable en changeant de sélection dans le
      panneau « Périmètre des indicateurs ».

## 3. Navigation « Voir l'historique »

- [x] 3.1 [T-126] Dans `campaign-detail-page.ts`, lire un paramètre de route
      optionnel (ex. `onglet=cotisations`) à l'initialisation pour positionner
      `activeTab` sur l'onglet Cotisations, sans changer le comportement des
      onglets une fois la page chargée (clic, flèches clavier T-64 inchangés).
- [x] 3.2 [T-126] Dans `dashboard-page.html`/`.ts`, remplacer le `<span>`
      « Voir l'historique » par un `routerLink` vers `/campagnes/:id` avec ce
      paramètre, ciblant la campagne sélectionnée
      (`financialOverview.selectedCampaign`, confirmée par l'API plutôt que
      le seul état local du sélecteur).
- [x] 3.3 [T-126] Masquer ce lien quand « Toutes les campagnes ouvertes » est
      sélectionné (aucune campagne précise à cibler).

## 4. Validation locale

- [x] 4.1 [T-126] Ajouter/adapter les tests : `dashboard-page.spec.ts` (lien
      présent et ciblant la bonne campagne quand une campagne est
      sélectionnée, absent sinon) et `campaign-detail-page.spec.ts` (onglet
      Cotisations actif au chargement quand le paramètre de route est
      fourni, comportement par défaut inchangé sinon).
- [x] 4.2 [T-126] Exécuter `npm test -- --watch=false` et `npm run build`
      depuis `contribo-front/`, relire le diff.

## 5. Livraison

- [x] 5.1 [T-126] Committer uniquement le périmètre du ticket, pousser la
      branche `front/fix-126-historique-reglements-tableau-de-bord`.
- [x] 5.2 [T-126] Ouvrir la PR en brouillon vers `main` avec le modèle du
      dépôt et rapporter les validations et limites ; la revue et la fusion
      restent à faire par le mainteneur.

PR ouverte : https://github.com/habdiallo/gest-asso/pull/126 (brouillon,
construite sur T-117/PR #124 non encore fusionnée). Revue et fusion à
effectuer par le mainteneur, après celles de la #124.
