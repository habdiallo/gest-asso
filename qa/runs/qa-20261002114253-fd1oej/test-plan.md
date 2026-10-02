# Plan QA targeted

Généré le 2026-10-02T11:42:53.152Z

## Couverture

Features couvertes : members, roles-users
Features non couvertes : account, auth, campaigns, dashboard, income-categories, member-space, shell, social-funds

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

### scenario-0a595bc18dd3 - Backend indisponible
- Feature : roles-users
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : le contrôle de santé du backend échoue pendant le déploiement
  2. Observer : la version n'est pas considérée comme prête et la version précédente reste sélectionnable
- Résultat attendu : la version n'est pas considérée comme prête et la version précédente reste sélectionnable
- Références : openspec/specs/deployment-foundation/spec.md

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

### scenario-20716fc01281 - Ouverture du calendrier
- Feature : roles-users
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : l'utilisateur active un champ de date
  2. Observer : un calendrier sombre et accessible s'ouvre dans le thème Contribo
- Résultat attendu : un calendrier sombre et accessible s'ouvre dans le thème Contribo
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

### scenario-375a4de30f0e - Navigation au clavier
- Feature : roles-users
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : l'utilisateur atteint l'action de navigation au clavier puis l'active
  2. Observer : le navigateur conserve le comportement d'un lien, y compris la destination
- Résultat attendu : le navigateur conserve le comportement d'un lien, y compris la destination
- Références : openspec/specs/reusable-action-buttons/spec.md

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

### scenario-44319cc9c3a4 - Même rôle visuel
- Feature : roles-users
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : deux composants affichent le même rôle visuel dans des features
  2. Observer : ils utilisent une composition responsive cohérente, sauf exception
- Résultat attendu : ils utilisent une composition responsive cohérente, sauf exception
- Références : openspec/specs/frontend-responsive-composition/spec.md

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

### scenario-49245484b16d - Changement de theme
- Feature : roles-users
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : l'utilisateur active l'action de theme
  2. Observer : le theme de l'application change avec le service existant sans quitter la page
- Résultat attendu : le theme de l'application change avec le service existant sans quitter la page
- Références : openspec/specs/personal-account-space/spec.md

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

### scenario-5648823cfdd4 - Survol ou focus de la carte
- Feature : roles-users
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : l'utilisateur survole ou atteint une carte au clavier
  2. Observer : la carte conserve le fond et l'ombre du design, renforce la bordure
- Résultat attendu : la carte conserve le fond et l'ombre du design, renforce la bordure
- Références : openspec/specs/reusable-financial-cards/spec.md

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

### scenario-7c455ee32a16 - Formulaires affichés sur desktop
- Feature : roles-users
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur autorisé ouvre l'un des trois dialogues d'enregistrement
  2. Observer : le dialogue utilise une largeur paysage cohérente
- Résultat attendu : le dialogue utilise une largeur paysage cohérente
- Références : openspec/specs/social-fund-contributor-entry/spec.md

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

### scenario-7d1881f9aea7 - Compte non autorisé
- Feature : roles-users
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un compte authentifié ne possède pas le rôle ou l'autorisation requis par l'opération
  2. Observer : l'API répond par le refus prévu dans le contrat et ne modifie aucune donnée
- Résultat attendu : l'API répond par le refus prévu dans le contrat et ne modifie aucune donnée
- Références : openspec/specs/api-design-first-governance/spec.md

### scenario-8568333073fa - Résultat reproductible
- Feature : roles-users
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un testeur termine un cas manuel
  2. Observer : il enregistre l'identifiant du cas, la date, l'environnement, le rôle, les données utilisées, le verdict, l'observation, la preuve et le ticket de défaut si nécessaire
- Résultat attendu : il enregistre l'identifiant du cas, la date, l'environnement, le rôle, les données utilisées, le verdict, l'observation, la preuve et le ticket de défaut si nécessaire
- Références : openspec/changes/plan-tests-manuels-fonctionnels/specs/manual-functional-test-plan/spec.md

### scenario-89aa732030c1 - Groupe de faible risque
- Feature : roles-users
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un groupe de refactorisation interne est terminé
  2. Observer : les tests pertinents, le lint, le formatage, le build et les contrôles OpenSpec ou tickets applicables sont exécutés avant de poursuivre
- Résultat attendu : les tests pertinents, le lint, le formatage, le build et les contrôles OpenSpec ou tickets applicables sont exécutés avant de poursuivre
- Références : openspec/specs/refactorisation-sans-regression/spec.md

### scenario-927e099bff7e - Déploiement d'une version validée
- Feature : roles-users
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : une version passe les contrôles backend, frontend, contrat et conteneurs
  2. Observer : les images publiées peuvent être référencées par un tag immuable pour le déploiement
- Résultat attendu : les images publiées peuvent être référencées par un tag immuable pour le déploiement
- Références : openspec/specs/deployment-foundation/spec.md

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

### scenario-9d665aa6c0e4 - Filtre utilisateurs et roles
- Feature : roles-users
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un Administrateur consulte l'ecran Utilisateurs et roles
  2. Observer : le champ de recherche et le select de role sont alignes sans bordure, fond ou ombre conteneur
- Résultat attendu : le champ de recherche et le select de role sont alignes sans bordure, fond ou ombre conteneur
- Références : openspec/specs/personal-account-space/spec.md

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

### scenario-ace6cfbc131c - Recherche avec plus de 20 options
- Feature : roles-users
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un select reçoit plus de 20 options et que l'utilisateur ouvre son menu
  2. Observer : un champ de recherche est affiché en première ligne du menu
- Résultat attendu : un champ de recherche est affiché en première ligne du menu
- Références : openspec/specs/social-fund-contributor-entry/spec.md

### scenario-af1d944c1e2b - Parcours nominal après refactorisation
- Feature : roles-users
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur rejoue un parcours couvert avant la modification avec les mêmes entrées et autorisations
  2. Observer : les mêmes données, transitions, navigations et résultats visibles sont produits
- Résultat attendu : les mêmes données, transitions, navigations et résultats visibles sont produits
- Références : openspec/specs/refactorisation-sans-regression/spec.md

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

### scenario-cc21d97ca01b - Affichage dans les deux thèmes
- Feature : roles-users
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur connecté consulte l'application à 1440 × 900 ou 1024 × 768 px, avec texte à taille normale, en thème sombre puis clair
  2. Observer : le cadre, les espacements et les surfaces de la sidebar correspondent aux règles du prototype dans le thème correspondant
- Résultat attendu : le cadre, les espacements et les surfaces de la sidebar correspondent aux règles du prototype dans le thème correspondant
- Références : openspec/specs/desktop-sidebar-visual/spec.md

### scenario-cc94d57eb593 - branche provisoire
- Feature : roles-users
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer les préconditions du scénario
  2. Comparer le comportement observé au résultat attendu
- Résultat attendu : Le comportement observé respecte les règles référencées.
- Références : openspec/specs/branching-release-workflow/spec.md

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

### scenario-db117f1cd043 - Ouverture d'un formulaire sur desktop
- Feature : roles-users
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur déclenche un formulaire de création ou modification sur un écran desktop ou tablette
  2. Observer : le frontend ouvre le formulaire dans une boîte de dialogue superposée au contenu courant
- Résultat attendu : le frontend ouvre le formulaire dans une boîte de dialogue superposée au contenu courant
- Références : openspec/specs/frontend-shell/spec.md

### scenario-e3c256dfecea - PR d'un ticket
- Feature : roles-users
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : une branche `<scope>/<type>-<ticket>-<description>` est proposée
  2. Observer : sa cible est `develop` et le contrôle de conventions l'accepte
- Résultat attendu : sa cible est `develop` et le contrôle de conventions l'accepte
- Références : openspec/specs/branching-release-workflow/spec.md

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

### scenario-e6b9395e7086 - Vérification du socle
- Feature : roles-users
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : le développeur exécute lint, contrôle Prettier, tests non interactifs et build de production
  2. Observer : les commandes terminent avec succès et les tests ne nécessitent pas de backend.
- Résultat attendu : les commandes terminent avec succès et les tests ne nécessitent pas de backend.
- Références : openspec/specs/frontend-initialization/spec.md

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

### scenario-f64d65fddb8e - Matrice positive des rôles
- Feature : roles-users
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : le testeur exécute la matrice des droits
  2. Observer : il vérifie pour chaque rôle les fonctionnalités accessibles, les actions visibles, les destinations par défaut et les données consultables conformément à la matrice du cahier des charges
- Résultat attendu : il vérifie pour chaque rôle les fonctionnalités accessibles, les actions visibles, les destinations par défaut et les données consultables conformément à la matrice du cahier des charges
- Références : openspec/changes/plan-tests-manuels-fonctionnels/specs/manual-functional-test-plan/spec.md

### scenario-f87293bf90f1 - Cohérence entre les écrans
- Feature : roles-users
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur compare les actions primaires de plusieurs menus à la
  2. Observer : leur hauteur, rayon, espacement, icône, typographie, survol et focus sont
- Résultat attendu : leur hauteur, rayon, espacement, icône, typographie, survol et focus sont
- Références : openspec/specs/reusable-action-buttons/spec.md

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
