# Plan QA targeted

Généré le 2026-10-02T13:35:02.762Z

## Couverture

Features couvertes : members
Features non couvertes : account, auth, campaigns, dashboard, income-categories, member-space, roles-users, shell, social-funds

## Scénarios

### scenario-01b7ee17d542 - Première contribution
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur Trésorier ou Opérateur autorisé enregistre la première contribution d'un membre à une cagnotte
  2. Observer : le frontend appelle l'API d'enregistrement et ajoute la contribution à la liste des contributions de la cagnotte
- Résultat attendu : le frontend appelle l'API d'enregistrement et ajoute la contribution à la liste des contributions de la cagnotte
- Références : openspec/specs/cagnottes-ui/spec.md

### scenario-0260cc187bbb - Affichage de la situation par membre
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur Administrateur, Trésorier ou Opérateur ouvre l'onglet des cotisations d'une campagne
  2. Observer : le frontend liste chaque membre concerné avec sa catégorie, le montant dû, le montant payé, le reste à payer et son statut
- Résultat attendu : le frontend liste chaque membre concerné avec sa catégorie, le montant dû, le montant payé, le reste à payer et son statut
- Références : openspec/specs/campaigns-ui/spec.md

### scenario-08979f885de0 - Consultation de la liste de cotisations
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur Membre ouvre l'onglet "Mes cotisations" de son espace personnel
  2. Observer : le frontend affiche, pour chaque campagne le concernant, le montant dû, le montant payé, le reste à payer et le statut
- Résultat attendu : le frontend affiche, pour chaque campagne le concernant, le montant dû, le montant payé, le reste à payer et le statut
- Références : openspec/specs/member-space-ui/spec.md

### scenario-0abf1c5d6818 - Réactivation par l'Administrateur
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur Administrateur déclenche l'action "Réactiver" sur un membre inactif et confirme
  2. Observer : le frontend appelle l'API de réactivation et met à jour le statut affiché à Actif, sans modifier les données historiques (RG-MEM-020, RG-MEM-021)
- Résultat attendu : le frontend appelle l'API de réactivation et met à jour le statut affiché à Actif, sans modifier les données historiques (RG-MEM-020, RG-MEM-021)
- Références : openspec/specs/member-management-ui/spec.md

### scenario-0f2f4b982e94 - Affichage nominal des règlements
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : l'onglet « Règlements » contient des règlements
  2. Observer : le titre de section utilise la typographie d'interface de niveau `h3`, la description utilise le texte secondaire, l'en-tête utilise `font-data` en majuscules avec la petite taille et l'interlettrage du prototype, et les cellules utilisent une taille de 13 px cohérente avec le design
- Résultat attendu : le titre de section utilise la typographie d'interface de niveau `h3`, la description utilise le texte secondaire, l'en-tête utilise `font-data` en majuscules avec la petite taille et l'interlettrage du prototype, et les cellules utilisent une taille de 13 px cohérente avec le design
- Références : openspec/specs/campaign-payments-table-visual/spec.md

### scenario-10f8face3127 - Consultation du profil
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur Membre ouvre son espace personnel
  2. Observer : le frontend affiche ses informations personnelles (Nom, Prénom, Nom d'usage, Pays, Ville, Téléphone, Catégorie de revenu, Fonction, Statut) en lecture seule
- Résultat attendu : le frontend affiche ses informations personnelles (Nom, Prénom, Nom d'usage, Pays, Ville, Téléphone, Catégorie de revenu, Fonction, Statut) en lecture seule
- Références : openspec/specs/member-space-ui/spec.md

### scenario-190bbd69e42d - Règlement ouvert depuis une campagne
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : l'utilisateur ouvre un règlement depuis une ligne de cotisation d'une campagne ouverte
  2. Observer : le dialogue affiche le montant dû, le montant déjà payé et le reste à payer de cette ligne
- Résultat attendu : le dialogue affiche le montant dû, le montant déjà payé et le reste à payer de cette ligne
- Références : openspec/specs/social-fund-contributor-entry/spec.md

### scenario-22b8c493c316 - Modification complète par Administrateur/Trésorier
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur Administrateur ou Trésorier ouvre le formulaire de modification d'un membre
  2. Observer : le frontend affiche tous les champs modifiables, y compris catégorie de revenu et fonction
- Résultat attendu : le frontend affiche tous les champs modifiables, y compris catégorie de revenu et fonction
- Références : openspec/specs/member-management-ui/spec.md

### scenario-22eb8c93fe7e - Consultation de la fiche
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur autorisé ouvre la fiche d'un membre
  2. Observer : le frontend affiche ses informations personnelles, sa catégorie, sa fonction, son statut, sa situation de cotisations, son historique de règlements et ses contributions aux cagnottes
- Résultat attendu : le frontend affiche ses informations personnelles, sa catégorie, sa fonction, son statut, sa situation de cotisations, son historique de règlements et ses contributions aux cagnottes
- Références : openspec/specs/member-management-ui/spec.md

### scenario-2301cb36419a - Désactivation par l'Administrateur
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur Administrateur déclenche l'action "Désactiver" sur un membre actif et confirme
  2. Observer : le frontend appelle l'API de désactivation, met à jour le statut affiché à Inactif, et conserve visibles les cotisations, règlements et contributions historiques du membre (RG-MEM-012 à RG-MEM-015)
- Résultat attendu : le frontend appelle l'API de désactivation, met à jour le statut affiché à Inactif, et conserve visibles les cotisations, règlements et contributions historiques du membre (RG-MEM-012 à RG-MEM-015)
- Références : openspec/specs/member-management-ui/spec.md

### scenario-260b94b7ce14 - Un seul élément
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un compteur vaut `1`
  2. Observer : le libellé affiche le nom au singulier, par exemple « 1 membre » ou « 1 campagne »
- Résultat attendu : le libellé affiche le nom au singulier, par exemple « 1 membre » ou « 1 campagne »
- Références : openspec/specs/pluralisation-i18n-francaise/spec.md

### scenario-262111299ffe - Carte de cotisation
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : la liste Campagnes affiche une campagne renvoyée par l'API
  2. Observer : elle utilise le composant partagé avec le nombre de membres, le nom,
- Résultat attendu : elle utilise le composant partagé avec le nombre de membres, le nom,
- Références : openspec/specs/reusable-financial-cards/spec.md

### scenario-3394165a819b - Bilan d'une cagnotte avec un externe
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : une cagnotte contient des contributions membres et externes
  2. Observer : `collectedAmount` et `contributionCount` incluent toutes les contributions acceptées
- Résultat attendu : `collectedAmount` et `contributionCount` incluent toutes les contributions acceptées
- Références : openspec/specs/external-social-fund-contributor/spec.md

### scenario-3ca67797ab72 - Consultation du bilan
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur Administrateur, Trésorier ou Opérateur autorisé ouvre l'onglet bilan d'une campagne
  2. Observer : le frontend affiche le total attendu, le total encaissé, le reste à encaisser et le nombre de membres ayant payé, partiellement payé et n'ayant pas payé
- Résultat attendu : le frontend affiche le total attendu, le total encaissé, le reste à encaisser et le nombre de membres ayant payé, partiellement payé et n'ayant pas payé
- Références : openspec/specs/campaigns-ui/spec.md

### scenario-479a78dc6f5f - Requête membre valide
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : `CreateContributionRequest` contient un `memberId`, un montant positif, une date et un mode valide
  2. Observer : l'API accepte la contribution si les droits et le statut de la cagnotte l'autorisent
- Résultat attendu : l'API accepte la contribution si les droits et le statut de la cagnotte l'autorisent
- Références : openspec/specs/external-social-fund-contributor/spec.md

### scenario-4948cd487e94 - Identite disponible pour un role de gestion
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un Administrateur, Tresorier ou Operateur est authentifie et les donnees utilisateur sont disponibles
  2. Observer : le pied affiche les initiales derivees du nom, le nom du membre et son role applicatif sans donnees fictives
- Résultat attendu : le pied affiche les initiales derivees du nom, le nom du membre et son role applicatif sans donnees fictives
- Références : openspec/specs/desktop-sidebar-visual/spec.md

### scenario-68639db7d721 - Ouverture du compte depuis la sidebar
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un Administrateur, Tresorier ou Operateur active le bloc d'identite en bas de la sidebar desktop
  2. Observer : le frontend ouvre la page « Mon acces » et affiche la carte du compte de l'utilisateur courant
- Résultat attendu : le frontend ouvre la page « Mon acces » et affiche la carte du compte de l'utilisateur courant
- Références : openspec/specs/personal-account-space/spec.md

### scenario-694ad1479b5f - Statuts de domaines differents
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un statut de compte, membre, cotisation, campagne ou autorisation est affiche
  2. Observer : le frontend utilise le composant de badge partage avec le ton correspondant
- Résultat attendu : le frontend utilise le composant de badge partage avec le ton correspondant
- Références : openspec/specs/personal-account-space/spec.md

### scenario-7c6837b3f871 - Recherche par nom
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur saisit un terme de recherche dans la liste des membres
  2. Observer : le frontend filtre la liste affichée aux membres dont un champ nominatif correspond au terme saisi
- Résultat attendu : le frontend filtre la liste affichée aux membres dont un champ nominatif correspond au terme saisi
- Références : openspec/specs/member-management-ui/spec.md

### scenario-9b5824d15721 - Bouton principal d'une liste
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un rôle authentifié autorisé affiche une page de liste comportant un bouton d'action
  2. Observer : ce bouton a une hauteur minimale de 44px et un rayon d'angle de 8px (classe `rounded`),
- Résultat attendu : ce bouton a une hauteur minimale de 44px et un rayon d'angle de 8px (classe `rounded`),
- Références : openspec/specs/composants-interaction-visual/spec.md

### scenario-9d71364f6c69 - Contribution membre enregistrée
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : le formulaire membre est valide et que `POST /social-funds/{socialFundId}/contributions` accepte la requête
  2. Observer : la contribution est créée avec le membre sélectionné, le montant, la date et le mode
- Résultat attendu : la contribution est créée avec le membre sélectionné, le montant, la date et le mode
- Références : openspec/specs/social-fund-contributor-entry/spec.md

### scenario-a58293a30d52 - Contribution externe enregistrée
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : une contribution externe est acceptée
  2. Observer : aucun compte ni profil membre n'est créé
- Résultat attendu : aucun compte ni profil membre n'est créé
- Références : openspec/specs/external-social-fund-contributor/spec.md

### scenario-ab158cc1d53b - Parcours membre nominal
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un Administrateur ou un Trésorier consulte les membres, crée un membre valide, ouvre sa fiche et modifie ses informations
  2. Observer : le membre apparaît avec le statut Actif, son compte associé est signalé selon le contrat, ses données sont visibles dans la fiche et la modification est persistée
- Résultat attendu : le membre apparaît avec le statut Actif, son compte associé est signalé selon le contrat, ses données sont visibles dans la fiche et la modification est persistée
- Références : openspec/changes/plan-tests-manuels-fonctionnels/specs/manual-functional-test-plan/spec.md

### scenario-b65d7ffd71b4 - Consultation de l'historique de contributions
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur Membre ouvre l'onglet "Mes contributions" de son espace personnel
  2. Observer : le frontend affiche la liste des cagnottes auxquelles il a contribué, avec le montant et la date de chaque contribution
- Résultat attendu : le frontend affiche la liste des cagnottes auxquelles il a contribué, avec le montant et la date de chaque contribution
- Références : openspec/specs/member-space-ui/spec.md

### scenario-b74e24e48284 - Menu Administrateur
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur avec le rôle Administrateur est connecté
  2. Observer : le frontend affiche les accès aux membres, catégories de revenu, campagnes, cagnottes, rôles/utilisateurs et son propre espace personnel
- Résultat attendu : le frontend affiche les accès aux membres, catégories de revenu, campagnes, cagnottes, rôles/utilisateurs et son propre espace personnel
- Références : openspec/specs/frontend-shell/spec.md

### scenario-bd3c1847e28c - Sélection d'un membre
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : la case « Contributeur externe » est désactivée et que l'utilisateur sélectionne un membre dans le select
  2. Observer : le formulaire conserve l'identifiant du membre sélectionné
- Résultat attendu : le formulaire conserve l'identifiant du membre sélectionné
- Références : openspec/specs/social-fund-contributor-entry/spec.md

### scenario-be5fc46be086 - ticket vers develop
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer les préconditions du scénario
  2. Comparer le comportement observé au résultat attendu
- Résultat attendu : Le comportement observé respecte les règles référencées.
- Références : openspec/specs/branching-release-workflow/spec.md

### scenario-c414fd0f8a57 - Ligne de catégorie configurée
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : une catégorie possède un montant, un effectif et un total attendu
  2. Observer : la ligne affiche la pastille, le libellé, le montant de la campagne, le nombre de membres suivi de « membres » et le total attendu
- Résultat attendu : la ligne affiche la pastille, le libellé, le montant de la campagne, le nombre de membres suivi de « membres » et le total attendu
- Références : openspec/specs/campaign-category-bareme-visualization/spec.md

### scenario-d4c33bdf296e - Utilisateur autorisé sur une campagne en Brouillon
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un Administrateur ou un Trésorier consulte une campagne `UPCOMING`
  2. Observer : l'action « Modifier les montants » est visible dans l'en-tête du barème
- Résultat attendu : l'action « Modifier les montants » est visible dans l'en-tête du barème
- Références : openspec/specs/campaign-category-bareme-visualization/spec.md

### scenario-da28fb2652b0 - Lecture d'une contribution membre
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : une contribution liée à un membre est retournée
  2. Observer : `member` contient le résumé du membre
- Résultat attendu : `member` contient le résumé du membre
- Références : openspec/specs/external-social-fund-contributor/spec.md

### scenario-e3e9a6b9e9e6 - Campagne ouverte affichée dans le détail
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur autorisé consulte une campagne `OPEN`
  2. Observer : le hero n'affiche pas le bouton « Voir la situation des membres »
- Résultat attendu : le hero n'affiche pas le bouton « Voir la situation des membres »
- Références : openspec/specs/campaign-detail-hero-actions/spec.md

### scenario-f4356953b712 - Consultation par l'Administrateur
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur Administrateur ouvre l'écran de gestion des rôles
  2. Observer : le frontend affiche la liste des utilisateurs avec leur rôle applicatif (Administrateur, Trésorier, Opérateur, Membre) et, pour les Opérateurs, l'état de leur attribut `peut_enregistrer_paiements`
- Résultat attendu : le frontend affiche la liste des utilisateurs avec leur rôle applicatif (Administrateur, Trésorier, Opérateur, Membre) et, pour les Opérateurs, l'état de leur attribut `peut_enregistrer_paiements`
- Références : openspec/specs/roles-users-ui/spec.md

### scenario-fda78a9b9184 - Affichage de la liste
- Feature : members
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur Administrateur, Trésorier ou Opérateur ouvre l'écran des membres
  2. Observer : le frontend liste les membres avec leurs informations et distingue visuellement les membres actifs des membres inactifs (RG-MEM-007)
- Résultat attendu : le frontend liste les membres avec leurs informations et distingue visuellement les membres actifs des membres inactifs (RG-MEM-007)
- Références : openspec/specs/member-management-ui/spec.md
