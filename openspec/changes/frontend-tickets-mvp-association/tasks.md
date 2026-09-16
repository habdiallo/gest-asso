Chaque ticket précise sa priorité MVP entre parenthèses : **(P0)** socle indispensable, **(P1)** cœur de métier, **(P2)** confort/qualité. Les références `US-*` / `RG-*` renvoient au cahier des charges, les références `openapi:<operationId>` à `besoins/openapi.yaml`.

## 1. Socle technique transverse

- [x] 1.1 (P0) Décider et documenter le choix de stack frontend — Angular 21, signals/RxJS, routage lazy et architecture par fonctionnalités ; cf. `design.md` et change `initialisation-front-features` (000).
- [x] 1.2 (P0) Mettre en place la structure de projet frontend (features/core/shared, build et lint validés) — change `initialisation-front-features` (000).
- [ ] 1.3 (P0) Importer les jetons de design (couleurs, typographies, arrondis) depuis `design/DESIGN (5).md` dans le système de style de l'application.
- [x] 1.4 (P0) Générer/configurer un client API typé à partir de `besoins/openapi.yaml` — génération explicite et compilation stricte validées par `initialisation-front-features` (000) ; intégration métier à réaliser dans les tickets concernés.
- [ ] 1.5 (P1) Mettre en place les deux thèmes visuels (Obsidian Midnight et Alabaster Gallery) et le sélecteur de thème.

## 2. Socle applicatif — authentification et navigation (`frontend-shell`)

- [ ] 2.1 (P0) Écran de connexion (identifiant + mot de passe), sans lien d'inscription. — US-ACC-001, RG-003 ; openapi:`login`
- [ ] 2.2 (P0) Gestion de l'erreur de connexion (message générique, pas de redirection). — RG-003
- [ ] 2.3 (P0) Stockage de la session (jeton) et hydratation de l'utilisateur connecté au démarrage de l'app.
- [ ] 2.4 (P0) Interception des réponses API en erreur d'authentification → invalidation de session et redirection vers l'écran de connexion.
- [ ] 2.5 (P0) Action de déconnexion explicite (menu utilisateur).
- [ ] 2.6 (P0) Garde de routage par rôle applicatif (Administrateur / Trésorier / Opérateur / Membre) avec écran "accès refusé" pour toute route non autorisée. — §3
- [ ] 2.7 (P0) Menu de navigation dynamique par rôle : items Administrateur (membres, catégories, campagnes, cagnottes, rôles/utilisateurs, mon espace). — §2, §3
- [ ] 2.8 (P0) Menu de navigation dynamique — variante Trésorier (sans catégories, sans rôles/utilisateurs). — §3
- [ ] 2.9 (P0) Menu de navigation dynamique — variante Opérateur (consultation membres/campagnes/cagnottes, mon espace). — §3
- [ ] 2.10 (P0) Menu de navigation dynamique — variante Membre (uniquement mon espace personnel). — §3
- [ ] 2.11 (P1) Composant "état de l'attribut Opérateur autorisé" exposé dans le contexte applicatif (`peut_enregistrer_paiements`) pour piloter l'affichage conditionnel des actions de paiement. — RG-ROLE-007 à RG-ROLE-009
- [ ] 2.12 (P0) Layout responsive commun (desktop / tablette / mobile) avec navigation adaptée à chaque taille d'écran.
- [ ] 2.13 (P0) Composant dialogue de formulaire : superposé sur desktop/tablette, plein écran sur mobile.
- [ ] 2.14 (P1) Composant tableau de bord générique par rôle (point d'entrée après connexion), reprenant les indicateurs pertinents selon le rôle.

## 3. Utilitaires transverses — montants et paiements (`frontend-shell`)

- [ ] 3.1 (P0) Utilitaire de formatage détaillé d'un montant GNF (séparateur de milliers, suffixe "GNF"). — RG-FMT-001, RG-FMT-002
- [ ] 3.2 (P0) Utilitaire de formatage condensé d'un montant GNF (K / M / Mds, une décimale max) avec accès à la valeur brute (info-bulle). — RG-FMT-003, RG-FMT-004
- [ ] 3.3 (P1) Composant de saisie de montant avec formatage automatique en direct et validation "entier uniquement".
- [ ] 3.4 (P0) Composant de sélection du mode de règlement limité à Espèces / Mobile Money / Virement bancaire. — RG-PAY-009, RG-016

## 4. Membres — consultation (`member-management-ui`)

> Parcours cible : un utilisateur Administrateur/Trésorier/Opérateur consulte la liste des membres puis leur fiche détaillée.

- [ ] 4.1 (P0) Écran liste des membres : tableau avec Nom, Prénom, Nom d'usage, Pays, Ville, Téléphone, Catégorie, Fonction, Statut. — US-MEM-002 ; openapi:`listMembers`
- [ ] 4.2 (P0) Distinction visuelle membres actifs / inactifs dans la liste. — RG-MEM-007
- [ ] 4.3 (P1) Vue liste restreinte pour l'Opérateur (masquage du détail financier). — RG-MEM-008
- [ ] 4.4 (P2) Recherche par nom dans la liste des membres.
- [ ] 4.5 (P2) Filtre par statut (Actif/Inactif) dans la liste des membres.
- [ ] 4.6 (P2) Filtre par catégorie de revenu dans la liste des membres.
- [ ] 4.7 (P0) Écran fiche membre : bloc informations personnelles, catégorie, fonction, statut. — US-MEM-003 ; openapi:`getMember`
- [ ] 4.8 (P1) Fiche membre — onglet situation des cotisations.
- [ ] 4.9 (P1) Fiche membre — onglet historique des règlements.
- [ ] 4.10 (P1) Fiche membre — onglet contributions aux cagnottes.
- [ ] 4.11 (P1) Navigation clavier entre les onglets de la fiche membre (flèches gauche/droite), sans rechargement de page.
- [ ] 4.12 (P1) Fiche membre en lecture seule pour un Opérateur non autorisé aux paiements (masquage des actions d'enregistrement). — §2.3

## 5. Membres — création et modification (`member-management-ui`)

- [ ] 5.1 (P0) Formulaire de création de membre (Nom, Prénom, Nom d'usage, Pays, Ville, Téléphone, Catégorie, Fonction). — US-MEM-001 ; openapi:`createMember`
- [ ] 5.2 (P0) Validation "catégorie de revenu obligatoire" sur le formulaire de création. — RG-MEM-002
- [ ] 5.3 (P0) Statut Actif par défaut affiché après création, sans champ de saisie du statut. — RG-MEM-003
- [ ] 5.4 (P1) Message de confirmation "compte utilisateur créé" après création d'un membre. — RG-MEM-004
- [ ] 5.5 (P0) Masquage de l'action "Ajouter un membre" pour les rôles Opérateur et Membre. — RG-MEM-001
- [ ] 5.6 (P0) Formulaire de modification d'un membre — tous champs pour Administrateur/Trésorier (y compris catégorie et fonction). — US-MEM-004
- [ ] 5.7 (P0) Formulaire de modification d'un membre — variante Opérateur limitée aux champs téléphone, ville, pays, nom d'usage. — RG-MEM-017
- [ ] 5.8 (P0) Retrait de tout contrôle de changement de statut dans le formulaire général de modification. — RG-MEM-018

## 6. Membres — activation (`member-management-ui`)

- [ ] 6.1 (P1) Action "Désactiver" sur la fiche d'un membre actif, réservée à l'Administrateur. — US-MEM-005 ; openapi:`deactivateMember`
- [ ] 6.2 (P1) Boîte de confirmation avant désactivation, mentionnant l'exclusion des futures campagnes. — RG-MEM-016
- [ ] 6.3 (P1) Mise à jour du statut affiché après désactivation, en conservant l'historique visible (cotisations, règlements, contributions). — RG-MEM-012 à RG-MEM-015
- [ ] 6.4 (P1) Action "Réactiver" sur la fiche d'un membre inactif, réservée à l'Administrateur. — US-MEM-006 ; openapi:`reactivateMember`
- [ ] 6.5 (P1) Boîte de confirmation avant réactivation.
- [ ] 6.6 (P1) Masquage mutuel des actions "Désactiver"/"Réactiver" selon le statut courant du membre. — RG-MEM-022
- [ ] 6.7 (P1) Masquage des deux actions pour les rôles Trésorier, Opérateur et Membre. — RG-MEM-019

## 7. Catégories de revenu (`income-categories-ui`)

- [ ] 7.1 (P1) Écran liste des catégories de revenu, réservé à l'Administrateur. — US-REV-001 ; openapi:`listIncomeCategories`
- [ ] 7.2 (P0) Garde de route interdisant l'écran catégories aux autres rôles. — RG-ROLE-002
- [ ] 7.3 (P1) Formulaire de création d'une catégorie (libellé obligatoire, sans champ de montant). — RG-REV-001, RG-REV-002 ; openapi:`createIncomeCategory`
- [ ] 7.4 (P1) Formulaire de modification d'une catégorie, avec message rappelant l'absence d'effet rétroactif. — US-REV-002 ; openapi:`updateIncomeCategory`

## 8. Rôles et utilisateurs (`roles-users-ui`)

- [ ] 8.1 (P1) Écran liste des utilisateurs avec rôle applicatif affiché, réservé à l'Administrateur. — RG-ROLE-002 ; openapi:`listUsers`
- [ ] 8.2 (P1) Sélecteur de changement de rôle applicatif (4 rôles) sur la fiche d'un utilisateur. — US-ROLE-001 ; openapi:`updateUserRole`
- [ ] 8.3 (P2) Affichage de la fonction associative comme information distincte, non modifiable depuis cet écran. — RG-ROLE-006
- [ ] 8.4 (P1) Contrôle d'activation/désactivation de `peut_enregistrer_paiements` pour un compte Opérateur. — §2.3 ; openapi:`updateOperatorAuthorization`
- [ ] 8.5 (P1) Masquage du contrôle `peut_enregistrer_paiements` pour les comptes non-Opérateur.

## 9. Campagnes — consultation (`campaigns-ui`)

> Parcours cible : un utilisateur consulte la liste des campagnes, ouvre une campagne, consulte son barème et la situation des cotisations.

- [ ] 9.1 (P0) Écran liste des campagnes (nom, période, statut) pour Administrateur/Trésorier/Opérateur. — openapi:`listCampaigns`
- [ ] 9.2 (P2) Filtre par statut de campagne (ouverte/clôturée).
- [ ] 9.3 (P2) Recherche par nom de campagne.
- [ ] 9.4 (P0) Écran détail de campagne avec onglets (barème, cotisations, bilan). — US-COT-004
- [ ] 9.5 (P0) Onglet cotisations : tableau membre/catégorie/montant dû/montant payé/reste/statut. — US-COT-003, US-COT-004 ; openapi:`listCampaignDues`
- [ ] 9.6 (P1) Vue restreinte de l'onglet cotisations pour l'Opérateur (sans agrégats réservés). — RG-MEM-008
- [ ] 9.7 (P2) Filtre par statut de cotisation (À payer / Partiellement payé / Payé / En retard).
- [ ] 9.8 (P1) Navigation par onglets sans rechargement de page, avec navigation clavier flèches gauche/droite.

## 10. Campagnes — création et configuration (`campaigns-ui`)

- [ ] 10.1 (P0) Formulaire de création de campagne (Nom, Description, Date de début, Date de fin, membres concernés). — US-COT-001 ; openapi:`createCampaign`
- [ ] 10.2 (P0) Validation "date de fin ≥ date de début". — RG-COT-005
- [ ] 10.3 (P0) Masquage de l'action "Créer une campagne" pour Opérateur et Membre. — RG-COT-001
- [ ] 10.4 (P0) Formulaire de configuration du barème (montant par catégorie de revenu) sur une campagne. — US-COT-002 ; openapi:`setCampaignRates`
- [ ] 10.5 (P1) Signalement visuel d'une catégorie sans montant configuré dans le barème.
- [ ] 10.6 (P2) Champ de saisie de montant avec formatage GNF en direct dans le formulaire de barème.

## 11. Campagnes — règlements (`campaigns-ui`)

- [ ] 11.1 (P0) Formulaire d'enregistrement d'un règlement (Membre, Campagne, Montant, Date, Mode). — US-COT-005 ; openapi:`recordPayment`
- [ ] 11.2 (P0) Blocage côté formulaire d'un montant de règlement supérieur au reste à payer, avec message explicite. — RG-PAY-007
- [ ] 11.3 (P0) Masquage de l'action d'enregistrement pour un Opérateur dont `peut_enregistrer_paiements` = non. — §2.3
- [ ] 11.4 (P1) Affichage de l'auteur et de l'horodatage de chaque règlement dans l'historique. — RG-PAY-008
- [ ] 11.5 (P1) Recalcul et rafraîchissement du reste à payer et du statut après chaque règlement enregistré. — RG-PAY-004 à RG-PAY-006
- [ ] 11.6 (P1) Masquage de l'action d'enregistrement sur une cotisation déjà soldée (statut Payé).

## 12. Campagnes — bilan et clôture (`campaigns-ui`)

- [ ] 12.1 (P1) Onglet bilan de campagne : total attendu, total encaissé, reste à encaisser. — US-COT-007 ; openapi:`getCampaignSummary`
- [ ] 12.2 (P1) Onglet bilan : répartition des membres par statut (payé / partiel / non payé).
- [ ] 12.3 (P2) Application de la notation condensée GNF aux montants agrégés du bilan, avec accès à la valeur brute.
- [ ] 12.4 (P1) Action "Clôturer la campagne" réservée à Administrateur/Trésorier, avec boîte de confirmation. — US-COT-008 ; openapi:`closeCampaign`
- [ ] 12.5 (P1) Désactivation des actions de modification (barème, membres concernés, nouveau règlement) sur une campagne clôturée.

## 13. Cagnottes — consultation et création (`cagnottes-ui`)

> Parcours cible : un utilisateur consulte la liste des cagnottes (visuellement distincte des campagnes), en crée une, puis suit sa collecte.

- [ ] 13.1 (P1) Écran liste des cagnottes, visuellement séparé de l'écran campagnes. — RG-CAG-001 ; openapi:`listCagnottes`
- [ ] 13.2 (P2) Filtre par type d'événement (Mariage, Baptême, Décès, Naissance, Autre).
- [ ] 13.3 (P1) Formulaire de création d'une cagnotte (Titre, Type d'événement, Description, Personne/famille concernée, Date de début, Date de fin, Objectif). — US-CAG-001 ; openapi:`createCagnotte`
- [ ] 13.4 (P2) Objectif de montant facultatif, avec masquage de la barre de progression si absent.
- [ ] 13.5 (P1) Masquage de l'action "Créer une cagnotte" pour Opérateur et Membre.

## 14. Cagnottes — contributions et suivi (`cagnottes-ui`)

- [ ] 14.1 (P1) Formulaire d'enregistrement d'une contribution (Membre, Cagnotte, Montant, Date, Mode). — US-CAG-002 ; openapi:`recordContribution`
- [ ] 14.2 (P1) Autorisation de contributions multiples sans restriction de nombre ni de montant minimal pour un même membre. — RG-CAG-005
- [ ] 14.3 (P0) Masquage de l'action d'enregistrement pour un Opérateur dont `peut_enregistrer_paiements` = non.
- [ ] 14.4 (P1) Affichage de l'auteur et de l'horodatage de chaque contribution. — RG-CAG-007
- [ ] 14.5 (P1) Onglet suivi de cagnotte : total collecté, nombre de contributeurs, liste des contributions. — US-CAG-003 ; openapi:`getCagnotteSummary`
- [ ] 14.6 (P2) Barre de progression objectif / reste à collecter, quand un objectif est défini.

## 15. Cagnottes — clôture (`cagnottes-ui`)

- [ ] 15.1 (P1) Action "Clôturer la cagnotte" réservée à Administrateur/Trésorier, avec confirmation. — US-CAG-004 ; openapi:`closeCagnotte`
- [ ] 15.2 (P1) Masquage de l'action d'enregistrement de contribution sur une cagnotte clôturée.

## 16. Espace personnel du membre (`member-space-ui`)

> Parcours cible : un utilisateur Membre se connecte et consulte uniquement ses propres données.

- [ ] 16.1 (P0) Écran profil personnel en lecture seule (informations personnelles, catégorie, fonction, statut). — US-MBR-001 ; openapi:`getMyProfile`
- [ ] 16.2 (P1) Onglet "Mes cotisations" : campagne, période, montant dû, montant payé, reste, statut. — US-MBR-002 ; openapi:`getMyDues`
- [ ] 16.3 (P1) Absence de toute action de paiement en ligne sur l'écran "Mes cotisations". — Annexe A
- [ ] 16.4 (P1) Onglet "Mes contributions" : liste des cagnottes contribuées, montant et date. — US-MBR-003 ; openapi:`getMyContributions`
- [ ] 16.5 (P0) Garde de route confirmant qu'un Membre ne peut consulter que ses propres données (aucun accès à la fiche d'un autre membre). — RG-DATA-001

## 17. Qualité transverse et finitions (P2)

- [ ] 17.1 États de chargement (skeleton/spinner) pour les listes et fiches principales (membres, campagnes, cagnottes).
- [ ] 17.2 États vides ("aucun membre", "aucune campagne", "aucune contribution") sur chaque liste.
- [ ] 17.3 Gestion uniforme des erreurs API (message générique + retry) sur les formulaires de création/modification.
- [ ] 17.4 Vérification d'accessibilité clavier sur l'ensemble des dialogues de formulaire (focus trap, échappement).
- [ ] 17.5 Revue de cohérence responsive (desktop/tablette/mobile) sur l'ensemble des écrans livrés, par comparaison avec le prototype `design/`.
