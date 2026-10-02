# Plan QA targeted

Généré le 2026-10-02T11:12:26.460Z

## Couverture

Features couvertes : campaigns, social-funds
Features non couvertes : account, auth, dashboard, income-categories, member-space, members, roles-users, shell

## Scénarios

### scenario-0039b8630e01 - Clôture réussie
- Feature : campaigns
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur Administrateur ou Trésorier déclenche l'action de clôture d'une campagne et confirme
  2. Observer : le frontend appelle l'API de clôture et affiche la campagne comme clôturée, tout en conservant l'accès à son historique de cotisations et de règlements
- Résultat attendu : le frontend appelle l'API de clôture et affiche la campagne comme clôturée, tout en conservant l'accès à son historique de cotisations et de règlements
- Références : openspec/specs/campaigns-ui/spec.md

### scenario-05964ba57d3f - Un brouillon ne peut pas être clôturé
- Feature : campaigns
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un Administrateur ou un Trésorier consulte une campagne `UPCOMING`
  2. Observer : l'action « Clôturer » est absente et l'enregistrement d'un règlement n'est pas proposé
- Résultat attendu : l'action « Clôturer » est absente et l'enregistrement d'un règlement n'est pas proposé
- Références : openspec/specs/campaign-detail-coherence/spec.md

### scenario-0880decafac1 - Choix du mode de règlement
- Feature : campaigns
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur autorisé ouvre le formulaire d'enregistrement d'un règlement ou d'une contribution
  2. Observer : le frontend propose exactement trois options : Espèces, Mobile Money, Virement bancaire, sans intégration de paiement en ligne
- Résultat attendu : le frontend propose exactement trois options : Espèces, Mobile Money, Virement bancaire, sans intégration de paiement en ligne
- Références : openspec/specs/frontend-shell/spec.md

### scenario-1187b61018c4 - Consultation de la liste
- Feature : campaigns
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur Administrateur, Trésorier ou Opérateur ouvre l'écran des cagnottes
  2. Observer : le frontend affiche la liste des cagnottes avec titre, type d'événement, période et statut, dans un espace visuellement séparé des campagnes de cotisation (RG-CAG-001)
- Résultat attendu : le frontend affiche la liste des cagnottes avec titre, type d'événement, période et statut, dans un espace visuellement séparé des campagnes de cotisation (RG-CAG-001)
- Références : openspec/specs/cagnottes-ui/spec.md

### scenario-1293300c8c1b - Toutes les actions de modification sont absentes
- Feature : campaigns
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un Administrateur, un Trésorier ou un Opérateur autorisé consulte une campagne `CLOSED`
  2. Observer : ni l'action d'édition du barème, ni l'action d'enregistrement d'un règlement, ni l'action de clôture ne sont visibles
- Résultat attendu : ni l'action d'édition du barème, ni l'action d'enregistrement d'un règlement, ni l'action de clôture ne sont visibles
- Références : openspec/specs/campaign-lifecycle-actions/spec.md

### scenario-2e3417e4e9b6 - Ouverture depuis une cagnotte ouverte
- Feature : campaigns
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un Administrateur, un Trésorier ou un Opérateur autorisé ouvre l'action d'enregistrement depuis la fiche d'une cagnotte ouverte
  2. Observer : le dialogue affiche le titre de la cagnotte en lecture seule
- Résultat attendu : le dialogue affiche le titre de la cagnotte en lecture seule
- Références : openspec/specs/social-fund-contributor-entry/spec.md

### scenario-398afcce2862 - Enregistrement réussi
- Feature : campaigns
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur Trésorier ou Opérateur autorisé soumet un règlement dont le montant est inférieur ou égal au reste à payer
  2. Observer : le frontend appelle l'API d'enregistrement du règlement et met à jour le montant payé, le reste à payer et le statut de la cotisation affichés
- Résultat attendu : le frontend appelle l'API d'enregistrement du règlement et met à jour le montant payé, le reste à payer et le statut de la cotisation affichés
- Références : openspec/specs/campaigns-ui/spec.md

### scenario-3c088dbcfe72 - Une campagne upcoming est présentée comme un brouillon
- Feature : campaigns
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur consulte une campagne dont le statut API vaut `UPCOMING`
  2. Observer : la liste et le détail affichent « Brouillon » et non « À venir » comme statut métier
- Résultat attendu : la liste et le détail affichent « Brouillon » et non « À venir » comme statut métier
- Références : openspec/specs/campaign-detail-coherence/spec.md

### scenario-466ea592b492 - Consultation du suivi
- Feature : social-funds
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur autorisé ouvre le détail d'une cagnotte
  2. Observer : le frontend affiche le total collecté, le nombre de contributeurs distincts et la liste des contributions
- Résultat attendu : le frontend affiche le total collecté, le nombre de contributeurs distincts et la liste des contributions
- Références : openspec/specs/cagnottes-ui/spec.md

### scenario-55c35a94ab2e - Première page desktop
- Feature : campaigns
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : une liste contient plus de six campagnes ou cagnottes
  2. Observer : la première requête demande une page de six éléments
- Résultat attendu : la première requête demande une page de six éléments
- Références : openspec/specs/reusable-financial-cards/spec.md

### scenario-60834c581e38 - Consultation de la liste
- Feature : campaigns
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur Administrateur, Trésorier ou Opérateur ouvre l'écran des campagnes
  2. Observer : le frontend affiche la liste des campagnes avec nom, période et statut (ouverte/clôturée)
- Résultat attendu : le frontend affiche la liste des campagnes avec nom, période et statut (ouverte/clôturée)
- Références : openspec/specs/campaigns-ui/spec.md

### scenario-7181d697b645 - Campagne en Brouillon
- Feature : campaigns
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un Trésorier ou un Opérateur autorisé consulte les cotisations d'une campagne `UPCOMING`
  2. Observer : l'action d'enregistrement d'un règlement n'est pas proposée
- Résultat attendu : l'action d'enregistrement d'un règlement n'est pas proposée
- Références : openspec/specs/campaign-lifecycle-actions/spec.md

### scenario-76f8f408f763 - Un brouillon incomplet expose les blocages
- Feature : campaigns
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : `openingReadiness.ready` vaut faux pour une campagne `UPCOMING`
  2. Observer : la checklist affiche chaque condition non satisfaite, l'action d'ouverture est indisponible et l'utilisateur peut identifier la correction attendue
- Résultat attendu : la checklist affiche chaque condition non satisfaite, l'action d'ouverture est indisponible et l'utilisateur peut identifier la correction attendue
- Références : openspec/specs/campaign-detail-coherence/spec.md

### scenario-82c969922e95 - Nom contenant des accolades
- Feature : campaigns
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un nom de campagne, un bénéficiaire ou un autre texte saisi contient `{` ou `}`
  2. Observer : l'interface affiche ces caractères tels quels sans erreur et sans valeur `undefined`
- Résultat attendu : l'interface affiche ces caractères tels quels sans erreur et sans valeur `undefined`
- Références : openspec/specs/pluralisation-i18n-francaise/spec.md

### scenario-86ee822c6e9e - Création et suivi d'une cagnotte
- Feature : social-funds
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un Administrateur ou un Trésorier crée une cagnotte avec un type, une période et les informations attendues
  2. Observer : la cagnotte est listée, son détail expose le total collecté, le nombre de contributeurs, l'objectif éventuel, le reste et les contributions
- Résultat attendu : la cagnotte est listée, son détail expose le total collecté, le nombre de contributeurs, l'objectif éventuel, le reste et les contributions
- Références : openspec/changes/plan-tests-manuels-fonctionnels/specs/manual-functional-test-plan/spec.md

### scenario-870214eac99b - Clôture réussie
- Feature : social-funds
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur Administrateur ou Trésorier déclenche l'action de clôture d'une cagnotte et confirme
  2. Observer : le frontend appelle l'API de clôture et affiche la cagnotte comme clôturée, en conservant l'accès à l'historique des contributions et au montant final
- Résultat attendu : le frontend appelle l'API de clôture et affiche la cagnotte comme clôturée, en conservant l'accès à l'historique des contributions et au montant final
- Références : openspec/specs/cagnottes-ui/spec.md

### scenario-8f1b29ed82b4 - Largeur desktop de référence
- Feature : campaigns
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : le détail de campagne est affiché sur une largeur desktop
  2. Observer : l'en-tête, les lignes, les séparateurs et les espacements correspondent visuellement au prototype de référence
- Résultat attendu : l'en-tête, les lignes, les séparateurs et les espacements correspondent visuellement au prototype de référence
- Références : openspec/specs/campaign-payments-table-visual/spec.md

### scenario-95288c425664 - Trois onglets courts sur mobile
- Feature : campaigns
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un tablist contient trois onglets courts comme « Cotisations », « Règlements » et « Contributions » sur une largeur mobile
  2. Observer : les onglets sont affichés sur une seule ligne en trois colonnes égales, sans défilement horizontal, chaque onglet reste focusable et les relations ARIA `tab`, `tablist` et `tabpanel` sont conservées
- Résultat attendu : les onglets sont affichés sur une seule ligne en trois colonnes égales, sans défilement horizontal, chaque onglet reste focusable et les relations ARIA `tab`, `tablist` et `tabpanel` sont conservées
- Références : openspec/specs/refactorisation-sans-regression/spec.md

### scenario-b4e028fe7ee9 - Création réussie
- Feature : social-funds
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur Administrateur ou Trésorier soumet le formulaire de création avec un titre, un type d'événement et une période valides
  2. Observer : le frontend appelle l'API de création et affiche la nouvelle cagnotte dans la liste
- Résultat attendu : le frontend appelle l'API de création et affiche la nouvelle cagnotte dans la liste
- Références : openspec/specs/cagnottes-ui/spec.md

### scenario-be8c77b20f47 - Opérateur non autorisé
- Feature : campaigns
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur Opérateur dont `peut_enregistrer_paiements` vaut "non" consulte une cotisation ou une cagnotte
  2. Observer : le frontend n'affiche aucune action d'enregistrement de règlement ou de contribution, uniquement la consultation
- Résultat attendu : le frontend n'affiche aucune action d'enregistrement de règlement ou de contribution, uniquement la consultation
- Références : openspec/specs/frontend-shell/spec.md

### scenario-c3b948a4efb8 - Progression des états
- Feature : campaigns
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : une campagne est créée
  2. Observer : son statut initial est `UPCOMING` (Brouillon)
- Résultat attendu : son statut initial est `UPCOMING` (Brouillon)
- Références : openspec/specs/campaign-lifecycle-actions/spec.md

### scenario-d31270033974 - Ouverture réussie
- Feature : campaigns
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un Administrateur ou un Trésorier ouvre une campagne `UPCOMING` prête dont la date de début est atteinte
  2. Observer : l'API répond `200` avec la campagne à l'état `OPEN`
- Résultat attendu : l'API répond `200` avec la campagne à l'état `OPEN`
- Références : openspec/specs/campaign-lifecycle-actions/spec.md

### scenario-dcb91d5bd29e - Vérification de démarrage
- Feature : campaigns
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un testeur démarre une campagne de tests
  2. Observer : il vérifie l'URL, la version de l'application, la disponibilité de l'API, l'accès aux comptes de recette et les opérations critiques avant d'exécuter un cas métier
- Résultat attendu : il vérifie l'URL, la version de l'application, la disponibilité de l'API, l'accès aux comptes de recette et les opérations critiques avant d'exécuter un cas métier
- Références : openspec/changes/plan-tests-manuels-fonctionnels/specs/manual-functional-test-plan/spec.md

### scenario-dd6ff7d05346 - Activation de l'autorisation
- Feature : campaigns
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur Administrateur active l'attribut `peut_enregistrer_paiements` sur un compte Opérateur
  2. Observer : le frontend appelle l'API correspondante et l'Opérateur concerné obtient l'accès aux actions d'enregistrement de règlements et de contributions dès sa prochaine consultation
- Résultat attendu : le frontend appelle l'API correspondante et l'Opérateur concerné obtient l'accès aux actions d'enregistrement de règlements et de contributions dès sa prochaine consultation
- Références : openspec/specs/roles-users-ui/spec.md

### scenario-dec350a76b57 - Consultation personnelle
- Feature : campaigns
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur authentifié ouvre son compte ou son espace personnel
  2. Observer : il voit son profil, ses cotisations et ses contributions autorisées avec les montants, dates et statuts attendus
- Résultat attendu : il voit son profil, ses cotisations et ses contributions autorisées avec les montants, dates et statuts attendus
- Références : openspec/changes/plan-tests-manuels-fonctionnels/specs/manual-functional-test-plan/spec.md

### scenario-e78119093181 - Création réussie
- Feature : campaigns
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur Administrateur ou Trésorier soumet le formulaire de création avec un nom, une date de début et une date de fin valides
  2. Observer : le frontend appelle l'API de création et affiche la nouvelle campagne dans la liste
- Résultat attendu : le frontend appelle l'API de création et affiche la nouvelle campagne dans la liste
- Références : openspec/specs/campaigns-ui/spec.md

### scenario-e89561ff09f7 - Deuxième règlement partiel
- Feature : campaigns
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur enregistre un règlement sur une cotisation déjà partiellement payée
  2. Observer : le frontend recalcule et affiche le nouveau reste à payer et le statut mis à jour (Partiellement payé ou Payé)
- Résultat attendu : le frontend recalcule et affiche le nouveau reste à payer et le statut mis à jour (Partiellement payé ou Payé)
- Références : openspec/specs/campaigns-ui/spec.md

### scenario-fb1cd9702ef3 - Campagne précise sélectionnée
- Feature : campaigns
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : l'utilisateur clique sur « Voir l'historique » alors qu'une
  2. Observer : l'application navigue vers l'écran de détail de cette campagne
- Résultat attendu : l'application navigue vers l'écran de détail de cette campagne
- Références : openspec/specs/dashboard-recent-payments-scope/spec.md
