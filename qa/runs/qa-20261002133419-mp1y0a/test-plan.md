# Plan QA full

Généré le 2026-10-02T13:34:19.045Z

## Couverture

Features couvertes : account, auth, campaigns, dashboard, income-categories, member-space, members, roles-users, shell, social-funds
Features non couvertes : aucune

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

### scenario-00ad22407864 - Trop de tentatives depuis une même adresse
- Feature : auth
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : une adresse client dépasse la limite de tentatives de login sur la fenêtre configurée
  2. Observer : `POST /auth/login` répond `429` pour les tentatives suivantes de la fenêtre
- Résultat attendu : `POST /auth/login` répond `429` pour les tentatives suivantes de la fenêtre
- Références : openspec/specs/api-rate-limiting/spec.md

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

### scenario-03f7bcb08c3e - Inspection d'un lot de logs
- Feature : auth
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : les événements de sécurité d'un scénario de connexion sont collectés
  2. Observer : aucune valeur de mot de passe, token, cookie ou clé fournie au scénario n'apparaît dans les messages ou champs structurés
- Résultat attendu : aucune valeur de mot de passe, token, cookie ou clé fournie au scénario n'apparaît dans les messages ou champs structurés
- Références : openspec/specs/security-audit-logging/spec.md

### scenario-056edbc19958 - Bloc de marque complet
- Feature : shell
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : la sidebar desktop est visible
  2. Observer : son bloc supérieur affiche le logo, le nom et le sous-titre avec les dimensions, couleurs et espacements du prototype
- Résultat attendu : son bloc supérieur affiche le logo, le nom et le sous-titre avec les dimensions, couleurs et espacements du prototype
- Références : openspec/specs/desktop-sidebar-visual/spec.md

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

### scenario-07e1dd97c933 - Saisie du barème
- Feature : income-categories
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur Administrateur ou Trésorier configure un montant pour chaque catégorie de revenu dans une campagne
  2. Observer : le frontend affiche un champ de saisie de montant par catégorie, formaté en GNF pendant la frappe, et appelle l'API de configuration au moment de l'enregistrement
- Résultat attendu : le frontend affiche un champ de saisie de montant par catégorie, formaté en GNF pendant la frappe, et appelle l'API de configuration au moment de l'enregistrement
- Références : openspec/specs/campaigns-ui/spec.md

### scenario-0860f0464578 - Image construite sans secrets
- Feature : auth
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : une image backend ou frontend est construite en CI
  2. Observer : elle ne contient aucun secret, mot de passe réel, clé privée ou configuration propre à un environnement
- Résultat attendu : elle ne contient aucun secret, mot de passe réel, clé privée ou configuration propre à un environnement
- Références : openspec/specs/deployment-foundation/spec.md

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

### scenario-08d80f95ae66 - Hydratation après rechargement
- Feature : auth
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : l'application est rechargée avec un cookie de session valide
  2. Observer : elle récupère l'utilisateur courant via l'API sans lire un token dans `localStorage`
- Résultat attendu : elle récupère l'utilisateur courant via l'API sans lire un token dans `localStorage`
- Références : openspec/specs/secure-cookie-session/spec.md

### scenario-09871d1ffc95 - Requête HTTP publique
- Feature : auth
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un client atteint le proxy de production en HTTP
  2. Observer : il reçoit une redirection vers l'URL HTTPS correspondante
- Résultat attendu : il reçoit une redirection vers l'URL HTTPS correspondante
- Références : openspec/specs/proxy-security-hardening/spec.md

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

### scenario-0e66d84400ee - Affichage nominal du barème
- Feature : income-categories
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : une campagne chargée contient des montants par catégorie et que l'utilisateur ouvre l'onglet des catégories
  2. Observer : la zone d'en-tête et les quatre colonnes du tableau sont visibles dans l'ordre défini
- Résultat attendu : la zone d'en-tête et les quatre colonnes du tableau sont visibles dans l'ordre défini
- Références : openspec/specs/campaign-category-bareme-visualization/spec.md

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

### scenario-1030d28b8752 - Connexion réussie
- Feature : auth
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un compte actif fournit des identifiants valides à `POST /auth/login`
  2. Observer : la réponse pose le cookie de session avec les attributs de sécurité requis
- Résultat attendu : la réponse pose le cookie de session avec les attributs de sécurité requis
- Références : openspec/specs/secure-cookie-session/spec.md

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

### scenario-1342dabb3ca8 - Connexion sans jeton CSRF préalable
- Feature : auth
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un client envoie `POST /api/v1/auth/login` sans jeton CSRF, alors que le
  2. Observer : la requête n'est pas rejetée pour absence de jeton CSRF (l'exemption s'applique bien à
- Résultat attendu : la requête n'est pas rejetée pour absence de jeton CSRF (l'exemption s'applique bien à
- Références : openspec/specs/api-v1-base-path/spec.md

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

### scenario-1a7a24269db1 - Session guineenne
- Feature : auth
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : `CurrentUser.association.currency` vaut `GNF`
  2. Observer : la carte affiche le libelle « Devise » et la valeur « GNF - Franc Guineen »
- Résultat attendu : la carte affiche le libelle « Devise » et la valeur « GNF - Franc Guineen »
- Références : openspec/specs/personal-account-space/spec.md

### scenario-1c3dcf7b6f75 - Barème incomplet
- Feature : income-categories
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : une catégorie concernée n'a pas de montant strictement positif
  2. Observer : `baremeComplete` et `ready` valent `false`
- Résultat attendu : `baremeComplete` et `ready` valent `false`
- Références : openspec/specs/campaign-lifecycle-actions/spec.md

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

### scenario-2a6c6f7dbf52 - Modification réussie
- Feature : income-categories
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur Administrateur modifie le libellé d'une catégorie et soumet le formulaire
  2. Observer : le frontend appelle l'API de modification et met à jour le libellé affiché partout dans l'application, sans recalculer les cotisations passées
- Résultat attendu : le frontend appelle l'API de modification et met à jour le libellé affiché partout dans l'application, sans recalculer les cotisations passées
- Références : openspec/specs/income-categories-ui/spec.md

### scenario-2b60da0056a7 - Parcours des écrans existants
- Feature : shell
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : la phase de cadrage est terminée
  2. Observer : les conventions existantes de header, navigation, CTA, cartes,
- Résultat attendu : les conventions existantes de header, navigation, CTA, cartes,
- Références : openspec/specs/frontend-mobile-audit/spec.md

### scenario-2c1a62d3d1c3 - Job backend
- Feature : auth
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : le job backend démarre
  2. Observer : il génère une paire RSA de test avant Maven et l'utilise uniquement pendant le job
- Résultat attendu : il génère une paire RSA de test avant Maven et l'utilise uniquement pendant le job
- Références : openspec/specs/ci-image-publishing/spec.md

### scenario-2c8687472f45 - Régénération par un Administrateur
- Feature : auth
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un Administrateur demande la régénération d'un compte de son association
  2. Observer : le frontend appelle l'API, affiche l'identifiant et le nouveau mot de passe temporaire, puis rappelle que l'ancien secret est invalide
- Résultat attendu : le frontend appelle l'API, affiche l'identifiant et le nouveau mot de passe temporaire, puis rappelle que l'ancien secret est invalide
- Références : openspec/specs/roles-users-ui/spec.md

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

### scenario-3446705aed2b - Connexion nominale
- Feature : auth
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un compte de chacun des quatre rôles saisit des identifiants valides
  2. Observer : la session est établie, l'utilisateur est hydraté, la destination attendue est ouverte et le menu correspondant au rôle est affiché
- Résultat attendu : la session est établie, l'utilisateur est hydraté, la destination attendue est ouverte et le menu correspondant au rôle est affiché
- Références : openspec/changes/plan-tests-manuels-fonctionnels/specs/manual-functional-test-plan/spec.md

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

### scenario-38f15436b6e6 - Expiration de session
- Feature : auth
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : une requête API retourne une erreur d'authentification (session expirée ou jeton invalide)
  2. Observer : le frontend invalide la session locale et redirige l'utilisateur vers l'écran de connexion
- Résultat attendu : le frontend invalide la session locale et redirige l'utilisateur vers l'écran de connexion
- Références : openspec/specs/frontend-shell/spec.md

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

### scenario-39c07acb00a2 - Informations de session disponibles
- Feature : auth
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : la page « Mon acces » est rendue avec une session hydratee
  2. Observer : elle affiche le nom, les initiales, le statut actif ou inactif, le nom de l'association, le role applicatif, le theme courant et la devise de l'association
- Résultat attendu : elle affiche le nom, les initiales, le statut actif ou inactif, le nom de l'association, le role applicatif, le theme courant et la devise de l'association
- Références : openspec/specs/personal-account-space/spec.md

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

### scenario-429f79aa6748 - Connexion réussie
- Feature : auth
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un compte actif fournit des identifiants valides
  2. Observer : la réponse contient un access token Bearer signé RS256 dont le sujet est l'UUID du compte et dont l'expiration respecte la configuration
- Résultat attendu : la réponse contient un access token Bearer signé RS256 dont le sujet est l'UUID du compte et dont l'expiration respecte la configuration
- Références : openspec/specs/rsa-jwt-authentication/spec.md

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

### scenario-4e1a3ed61604 - Création réussie
- Feature : income-categories
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur Administrateur soumet le formulaire de création avec un libellé renseigné
  2. Observer : le frontend appelle l'API de création et ajoute la nouvelle catégorie à la liste
- Résultat attendu : le frontend appelle l'API de création et ajoute la nouvelle catégorie à la liste
- Références : openspec/specs/income-categories-ui/spec.md

### scenario-5314e779af32 - Bilan financier disponible pour une campagne sélectionnée
- Feature : dashboard
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un Administrateur, Trésorier ou Opérateur autorisé consulte le tableau de bord et que
  2. Observer : une carte affiche le montant encaissé et le taux de collecte de cette campagne, et une
- Résultat attendu : une carte affiche le montant encaissé et le taux de collecte de cette campagne, et une
- Références : openspec/specs/composants-interaction-visual/spec.md

### scenario-541891c71e68 - Création et préparation d'une campagne
- Feature : income-categories
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un Administrateur ou un Trésorier crée une campagne avec des dates valides puis configure un montant strictement positif pour chaque catégorie concernée
  2. Observer : la campagne est créée en Brouillon, les cotisations sont établies avec le montant propre à la campagne et les éléments de préparation sont visibles
- Résultat attendu : la campagne est créée en Brouillon, les cotisations sont établies avec le montant propre à la campagne et les éléments de préparation sont visibles
- Références : openspec/changes/plan-tests-manuels-fonctionnels/specs/manual-functional-test-plan/spec.md

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

### scenario-563e0a9ea554 - Comparaison avec la référence
- Feature : dashboard
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : l'audit compare le dashboard actuel à une capture cible
  2. Observer : il compare les principes de composition et de densité, sans reproduire
- Résultat attendu : il compare les principes de composition et de densité, sans reproduire
- Références : openspec/specs/frontend-mobile-audit/spec.md

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

### scenario-5a6fc836c130 - Consultation par l'Administrateur
- Feature : income-categories
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur Administrateur ouvre l'écran des catégories de revenu
  2. Observer : le frontend affiche la liste des catégories avec leur libellé
- Résultat attendu : le frontend affiche la liste des catégories avec leur libellé
- Références : openspec/specs/income-categories-ui/spec.md

### scenario-5c64c7a205d0 - Activation clavier après agrandissement
- Feature : auth
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur connecté atteint le bouton par Tab avec texte à 200 % puis l'active par Entrée ou Espace
  2. Observer : le focus est visible et le contrôle possède le nom accessible complet « Se déconnecter »
- Résultat attendu : le focus est visible et le contrôle possède le nom accessible complet « Se déconnecter »
- Références : openspec/specs/shell-logout-text-resize/spec.md

### scenario-5c67283fe685 - Action de navigation du dashboard
- Feature : dashboard
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur authentifié consulte le dashboard
  2. Observer : « Nouvelle campagne » utilise le composant d'action partagé en mode lien
- Résultat attendu : « Nouvelle campagne » utilise le composant d'action partagé en mode lien
- Références : openspec/specs/reusable-action-buttons/spec.md

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

### scenario-6544c36f82cb - Requête valide du MVP
- Feature : auth
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : une requête respecte le schéma, l'authentification et l'autorisation du contrat
  2. Observer : l'adapter appelle le cas d'usage correspondant et renvoie une représentation conforme au schéma OpenAPI
- Résultat attendu : l'adapter appelle le cas d'usage correspondant et renvoie une représentation conforme au schéma OpenAPI
- Références : openspec/specs/backend-architecture-foundation/spec.md

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

### scenario-6c838d95af9a - Campagne Ouverte ou Clôturée
- Feature : income-categories
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un Administrateur ou un Trésorier consulte une campagne `OPEN` ou `CLOSED`
  2. Observer : l'action d'édition du barème n'est pas proposée
- Résultat attendu : l'action d'édition du barème n'est pas proposée
- Références : openspec/specs/campaign-lifecycle-actions/spec.md

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

### scenario-836419b90998 - Secret de production absent
- Feature : auth
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : le backend démarre avec un profil d'intégration ou de production sans mot de passe PostgreSQL ou clé JWT
  2. Observer : le démarrage échoue avant l'acceptation de trafic
- Résultat attendu : le démarrage échoue avant l'acceptation de trafic
- Références : openspec/specs/actuator-and-secret-hardening/spec.md

### scenario-84077036d210 - Reproduction du retour de revue à 375 px
- Feature : auth
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un Administrateur connecté affiche l'application à 375 × 667 px avec une taille racine portée de 16 à 32 px
  2. Observer : le bouton et tous les fragments du libellé « Se déconnecter » sont contenus dans la largeur visible de l'en-tête
- Résultat attendu : le bouton et tous les fragments du libellé « Se déconnecter » sont contenus dans la largeur visible de l'en-tête
- Références : openspec/specs/shell-logout-text-resize/spec.md

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

### scenario-98df61e3e7fb - Navigation administrateur conforme au prototype
- Feature : income-categories
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un Administrateur consulte la sidebar desktop
  2. Observer : les sept entrées et leur ordre correspondent à la référence visuelle,
- Résultat attendu : les sept entrées et leur ordre correspondent à la référence visuelle,
- Références : openspec/specs/desktop-sidebar-visual/spec.md

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

### scenario-ab66521a29f6 - Création réussie
- Feature : auth
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur Administrateur ou Trésorier soumet le formulaire de création avec les champs obligatoires renseignés, dont une catégorie de revenu (RG-MEM-002)
  2. Observer : le frontend appelle l'API de création du membre, affiche le nouveau membre avec le statut Actif par défaut (RG-MEM-003), confirme qu'un compte utilisateur associé a été créé (RG-MEM-004) et affiche une confirmation dédiée avec l'identifiant et le mot de passe temporaire à transmettre
- Résultat attendu : le frontend appelle l'API de création du membre, affiche le nouveau membre avec le statut Actif par défaut (RG-MEM-003), confirme qu'un compte utilisateur associé a été créé (RG-MEM-004) et affiche une confirmation dédiée avec l'identifiant et le mot de passe temporaire à transmettre
- Références : openspec/specs/member-management-ui/spec.md

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

### scenario-ae546d5167da - Indicateurs de gestion sans bilan financier
- Feature : dashboard
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un rôle de gestion affiche le tableau de bord et que l'API ne fournit pas
  2. Observer : les 4 cartes indicateurs existantes (membres actifs, nouveaux membres, campagnes
- Résultat attendu : les 4 cartes indicateurs existantes (membres actifs, nouveaux membres, campagnes
- Références : openspec/specs/composants-interaction-visual/spec.md

### scenario-aec22efebdd0 - Échec de connexion
- Feature : auth
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un login échoue pour un identifiant inconnu, un compte inactif ou un mot de passe incorrect
  2. Observer : un événement d'échec est écrit avec le même niveau de détail externe pour ces cas
- Résultat attendu : un événement d'échec est écrit avec le même niveau de détail externe pour ces cas
- Références : openspec/specs/security-audit-logging/spec.md

### scenario-aedb3f666f93 - Absence de regression hors sidebar
- Feature : shell
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : l'application est comparee avant et apres a 820 px et a une largeur mobile de 375 px, dans les deux themes
  2. Observer : la sidebar reste masquee et l'en-tete ainsi que la navigation mobile gardent leur rendu et leurs interactions actuels
- Résultat attendu : la sidebar reste masquee et l'en-tete ainsi que la navigation mobile gardent leur rendu et leurs interactions actuels
- Références : openspec/specs/desktop-sidebar-visual/spec.md

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

### scenario-b223596648e9 - Consultation sur petit écran
- Feature : income-categories
- Priorité : P1
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : l'onglet est affiché dans une largeur mobile
  2. Observer : les quatre informations métier de chaque catégorie restent accessibles sans débordement horizontal involontaire
- Résultat attendu : les quatre informations métier de chaque catégorie restent accessibles sans débordement horizontal involontaire
- Références : openspec/specs/campaign-category-bareme-visualization/spec.md

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

### scenario-c3c39c3850f1 - Changement de rôle
- Feature : auth
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur Administrateur sélectionne un nouveau rôle applicatif pour un utilisateur et confirme
  2. Observer : le frontend appelle l'API de mise à jour du rôle et reflète le nouveau rôle dans la liste et dans la navigation de l'utilisateur concerné à sa prochaine session
- Résultat attendu : le frontend appelle l'API de mise à jour du rôle et reflète le nouveau rôle dans la liste et dans la navigation de l'utilisateur concerné à sa prochaine session
- Références : openspec/specs/roles-users-ui/spec.md

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

### scenario-cd29025c0c85 - Connexion via la stack Docker
- Feature : auth
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un client envoie `POST /api/v1/auth/login` à travers Nginx (stack Docker locale ou
  2. Observer : Nginx transmet la requête telle quelle (même chemin `/api/v1/auth/login`) au backend
- Résultat attendu : Nginx transmet la requête telle quelle (même chemin `/api/v1/auth/login`) au backend
- Références : openspec/specs/api-v1-base-path/spec.md

### scenario-ce2065ceb626 - Temporary login opens the restricted flow
- Feature : auth
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : a user authenticates with valid credentials while
  2. Observer : the API returns a session marked as password-change-only and the
- Résultat attendu : the API returns a session marked as password-change-only and the
- Références : openspec/specs/account-password-lifecycle/spec.md

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

### scenario-d94483db5776 - Existing user signs in after migration
- Feature : auth
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : an existing Administrator, Treasurer, Operator or Member signs in
  2. Observer : the user receives the restricted session and must choose a new
- Résultat attendu : the user receives the restricted session and must choose a new
- Références : openspec/specs/account-password-lifecycle/spec.md

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

### scenario-df7c17ef2770 - Connexion réussie sans changement requis
- Feature : auth
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un utilisateur saisit un identifiant et un mot de passe valides et que son compte ne requiert pas de changement
  2. Observer : le frontend appelle `POST /auth/login`, conserve l'état de session retourné et redirige vers le tableau de bord correspondant au rôle de l'utilisateur
- Résultat attendu : le frontend appelle `POST /auth/login`, conserve l'état de session retourné et redirige vers le tableau de bord correspondant au rôle de l'utilisateur
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

### scenario-ebbc4915b704 - Disponibilité de account
- Feature : account
- Priorité : P1
- Statut initial : Planned
- Préconditions : Environnement de recette déclaré et accessible
- Données : à définir
- Étapes :
  1. Ouvrir la route
  2. Observer le chargement et l état fonctionnel
- Résultat attendu : La fonctionnalité est accessible et son état est explicite.
- Références : contribo-front/src/app/features/account/account.routes.ts

### scenario-ee95ff29e6a9 - Connexion directe au backend sans proxy
- Feature : auth
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : un client envoie `POST /api/v1/auth/login` directement au backend (ex.
  2. Observer : le backend répond comme le décrit `contribo-back/src/main/resources/contribo-api.yml` pour l'opération `login`,
- Résultat attendu : le backend répond comme le décrit `contribo-back/src/main/resources/contribo-api.yml` pour l'opération `login`,
- Références : openspec/specs/api-v1-base-path/spec.md

### scenario-efc4eaeb557e - Disponibilité de member-space
- Feature : member-space
- Priorité : P1
- Statut initial : Planned
- Préconditions : Environnement de recette déclaré et accessible
- Données : à définir
- Étapes :
  1. Ouvrir la route
  2. Observer le chargement et l état fonctionnel
- Résultat attendu : La fonctionnalité est accessible et son état est explicite.
- Références : contribo-front/src/app/features/member-space/member-space.routes.ts

### scenario-f3bd5a83cefb - API métier refusée pendant l'activation
- Feature : auth
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : une requête métier retourne `PASSWORD_CHANGE_REQUIRED`
  2. Observer : le frontend conserve la session limitée et navigue vers le changement obligatoire sans boucle vers la page de connexion
- Résultat attendu : le frontend conserve la session limitée et navigue vers le changement obligatoire sans boucle vers la page de connexion
- Références : openspec/specs/frontend-shell/spec.md

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

### scenario-f4d318c16a73 - Probe readiness publique
- Feature : auth
- Priorité : P0
- Statut initial : Planned
- Préconditions : à définir
- Données : à définir
- Étapes :
  1. Préparer la situation : le healthcheck appelle `/actuator/health/readiness` sans authentification
  2. Observer : le backend répond avec l'état de readiness sans exposer de détail sensible
- Résultat attendu : le backend répond avec l'état de readiness sans exposer de détail sensible
- Références : openspec/specs/actuator-and-secret-hardening/spec.md

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
