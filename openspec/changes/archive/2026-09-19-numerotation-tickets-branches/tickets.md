# Catalogue proposé des tickets frontend

104 tickets locaux : `T-1` à `T-104`. Ce catalogue est une proposition, à adopter
avec le workflow ; ces numéros ne sont pas des issues GitHub. Les références
OpenSpec restent celles du backlog original, dont les trois étapes terminées
restent liées à l'initialisation `000`.

**Pendant l'initialisation**, remplacer le numéro de la branche affichée ci-dessous
par `000`. Exemple : `T-1` utilise `front/feat-000-jetons-design`, puis
`front/feat-1-jetons-design` après la fin d'initialisation déclarée par le mainteneur.
Les deux noms exacts et les dépendances initiales sont dans [tickets.json](tickets.json).
Le numéro est une identité stable ; il ne représente pas l'ordre d'exécution.

| Ticket | Étape OpenSpec | Priorité | Évolution | Branche après initialisation |
| --- | --- | --- | --- | --- |
| T-1 | 1.3 | P0 | Importer les jetons de design (couleurs, typographies, arrondis) depuis `design/DESIGN (5).md` dans le système de style de l'application. | `front/feat-1-jetons-design` |
| T-2 | 1.5 | P1 | Mettre en place les deux thèmes visuels (Obsidian Midnight et Alabaster Gallery) et le sélecteur de thème. | `front/feat-2-themes-visuels` |
| T-3 | 2.1 | P0 | Écran de connexion (identifiant + mot de passe), sans lien d'inscription. | `front/feat-3-ecran-connexion` |
| T-4 | 2.2 | P0 | Gestion de l'erreur de connexion (message générique, pas de redirection). | `front/feat-4-erreur-connexion` |
| T-5 | 2.3 | P0 | Stockage de la session (jeton) et hydratation de l'utilisateur connecté au démarrage de l'app. | `front/feat-5-session-utilisateur` |
| T-6 | 2.4 | P0 | Interception des réponses API en erreur d'authentification → invalidation de session et redirection vers l'écran de connexion. | `front/feat-6-expiration-session` |
| T-7 | 2.5 | P0 | Action de déconnexion explicite (menu utilisateur). | `front/feat-7-deconnexion` |
| T-8 | 2.6 | P0 | Garde de routage par rôle applicatif (Administrateur / Trésorier / Opérateur / Membre) avec écran "accès refusé" pour toute route non autorisée. | `front/feat-8-gardes-roles` |
| T-9 | 2.7 | P0 | Menu de navigation dynamique par rôle : items Administrateur (membres, catégories, campagnes, cagnottes, rôles/utilisateurs, mon espace). | `front/feat-9-navigation-administrateur` |
| T-10 | 2.8 | P0 | Menu de navigation dynamique | `front/feat-10-navigation-tresorier` |
| T-11 | 2.9 | P0 | Menu de navigation dynamique | `front/feat-11-navigation-operateur` |
| T-12 | 2.10 | P0 | Menu de navigation dynamique | `front/feat-12-navigation-membre` |
| T-13 | 2.11 | P1 | Composant "état de l'attribut Opérateur autorisé" exposé dans le contexte applicatif (`peut_enregistrer_paiements`) pour piloter l'affichage conditionnel des actions de paiement. | `front/feat-13-autorisation-paiements-operateur` |
| T-14 | 2.12 | P0 | Layout responsive commun (desktop / tablette / mobile) avec navigation adaptée à chaque taille d'écran. | `front/feat-14-layout-responsive` |
| T-15 | 2.13 | P0 | Composant dialogue de formulaire : superposé sur desktop/tablette, plein écran sur mobile. | `front/feat-15-dialogues-formulaires` |
| T-16 | 2.14 | P1 | Composant tableau de bord générique par rôle (point d'entrée après connexion), reprenant les indicateurs pertinents selon le rôle. | `front/feat-16-tableau-bord` |
| T-17 | 3.1 | P0 | Utilitaire de formatage détaillé d'un montant GNF (séparateur de milliers, suffixe "GNF"). | `front/feat-17-formatage-gnf` |
| T-18 | 3.2 | P0 | Utilitaire de formatage condensé d'un montant GNF (K / M / Mds, une décimale max) avec accès à la valeur brute (info-bulle). | `front/feat-18-formatage-gnf-condense` |
| T-19 | 3.3 | P1 | Composant de saisie de montant avec formatage automatique en direct et validation "entier uniquement". | `front/feat-19-saisie-montants` |
| T-20 | 3.4 | P0 | Composant de sélection du mode de règlement limité à Espèces / Mobile Money / Virement bancaire. | `front/feat-20-modes-reglement` |
| T-21 | 4.1 | P0 | Écran liste des membres : tableau avec Nom, Prénom, Nom d'usage, Pays, Ville, Téléphone, Catégorie, Fonction, Statut. | `front/feat-21-liste-membres` |
| T-22 | 4.2 | P0 | Distinction visuelle membres actifs / inactifs dans la liste. | `front/feat-22-statuts-membres` |
| T-23 | 4.3 | P1 | Vue liste restreinte pour l'Opérateur (masquage du détail financier). | `front/feat-23-liste-membres-operateur` |
| T-24 | 4.4 | P2 | Recherche par nom dans la liste des membres. | `front/feat-24-recherche-membres` |
| T-25 | 4.5 | P2 | Filtre par statut (Actif/Inactif) dans la liste des membres. | `front/feat-25-filtre-statut-membres` |
| T-26 | 4.6 | P2 | Filtre par catégorie de revenu dans la liste des membres. | `front/feat-26-filtre-categorie-membres` |
| T-27 | 4.7 | P0 | Écran fiche membre : bloc informations personnelles, catégorie, fonction, statut. | `front/feat-27-fiche-membre` |
| T-28 | 4.8 | P1 | Fiche membre | `front/feat-28-cotisations-fiche-membre` |
| T-29 | 4.9 | P1 | Fiche membre | `front/feat-29-reglements-fiche-membre` |
| T-30 | 4.10 | P1 | Fiche membre | `front/feat-30-contributions-fiche-membre` |
| T-31 | 4.11 | P1 | Navigation clavier entre les onglets de la fiche membre (flèches gauche/droite), sans rechargement de page. | `front/feat-31-onglets-clavier-fiche-membre` |
| T-32 | 4.12 | P1 | Fiche membre en lecture seule pour un Opérateur non autorisé aux paiements (masquage des actions d'enregistrement). | `front/feat-32-actions-paiement-fiche-membre` |
| T-33 | 5.1 | P0 | Formulaire de création de membre (Nom, Prénom, Nom d'usage, Pays, Ville, Téléphone, Catégorie, Fonction). | `front/feat-33-creation-membre` |
| T-34 | 5.2 | P0 | Validation "catégorie de revenu obligatoire" sur le formulaire de création. | `front/feat-34-validation-categorie-membre` |
| T-35 | 5.3 | P0 | Statut Actif par défaut affiché après création, sans champ de saisie du statut. | `front/feat-35-statut-initial-membre` |
| T-36 | 5.4 | P1 | Message de confirmation "compte utilisateur créé" après création d'un membre. | `front/feat-36-confirmation-compte-membre` |
| T-37 | 5.5 | P0 | Masquage de l'action "Ajouter un membre" pour les rôles Opérateur et Membre. | `front/feat-37-droits-creation-membre` |
| T-38 | 5.6 | P0 | Formulaire de modification d'un membre | `front/feat-38-modification-membre` |
| T-39 | 5.7 | P0 | Formulaire de modification d'un membre | `front/feat-39-modification-membre-operateur` |
| T-40 | 5.8 | P0 | Retrait de tout contrôle de changement de statut dans le formulaire général de modification. | `front/feat-40-statut-hors-formulaire-membre` |
| T-41 | 6.1 | P1 | Action "Désactiver" sur la fiche d'un membre actif, réservée à l'Administrateur. | `front/feat-41-desactivation-membre` |
| T-42 | 6.2 | P1 | Boîte de confirmation avant désactivation, mentionnant l'exclusion des futures campagnes. | `front/feat-42-confirmation-desactivation-membre` |
| T-43 | 6.3 | P1 | Mise à jour du statut affiché après désactivation, en conservant l'historique visible (cotisations, règlements, contributions). | `front/feat-43-statut-apres-desactivation` |
| T-44 | 6.4 | P1 | Action "Réactiver" sur la fiche d'un membre inactif, réservée à l'Administrateur. | `front/feat-44-reactivation-membre` |
| T-45 | 6.5 | P1 | Boîte de confirmation avant réactivation. | `front/feat-45-confirmation-reactivation-membre` |
| T-46 | 6.6 | P1 | Masquage mutuel des actions "Désactiver"/"Réactiver" selon le statut courant du membre. | `front/feat-46-actions-statut-membre` |
| T-47 | 6.7 | P1 | Masquage des deux actions pour les rôles Trésorier, Opérateur et Membre. | `front/feat-47-droits-activation-membre` |
| T-48 | 7.1 | P1 | Écran liste des catégories de revenu, réservé à l'Administrateur. | `front/feat-48-liste-categories-revenu` |
| T-49 | 7.2 | P0 | Garde de route interdisant l'écran catégories aux autres rôles. | `front/feat-49-garde-categories-revenu` |
| T-50 | 7.3 | P1 | Formulaire de création d'une catégorie (libellé obligatoire, sans champ de montant). | `front/feat-50-creation-categorie-revenu` |
| T-51 | 7.4 | P1 | Formulaire de modification d'une catégorie, avec message rappelant l'absence d'effet rétroactif. | `front/feat-51-modification-categorie-revenu` |
| T-52 | 8.1 | P1 | Écran liste des utilisateurs avec rôle applicatif affiché, réservé à l'Administrateur. | `front/feat-52-liste-utilisateurs` |
| T-53 | 8.2 | P1 | Sélecteur de changement de rôle applicatif (4 rôles) sur la fiche d'un utilisateur. | `front/feat-53-modification-role-utilisateur` |
| T-54 | 8.3 | P2 | Affichage de la fonction associative comme information distincte, non modifiable depuis cet écran. | `front/feat-54-fonction-associative-utilisateur` |
| T-55 | 8.4 | P1 | Contrôle d'activation/désactivation de `peut_enregistrer_paiements` pour un compte Opérateur. | `front/feat-55-autorisation-operateur` |
| T-56 | 8.5 | P1 | Masquage du contrôle `peut_enregistrer_paiements` pour les comptes non-Opérateur. | `front/feat-56-controle-autorisation-operateur` |
| T-57 | 9.1 | P0 | Écran liste des campagnes (nom, période, statut) pour Administrateur/Trésorier/Opérateur. | `front/feat-57-liste-campagnes` |
| T-58 | 9.2 | P2 | Filtre par statut de campagne (ouverte/clôturée). | `front/feat-58-filtre-statut-campagnes` |
| T-59 | 9.3 | P2 | Recherche par nom de campagne. | `front/feat-59-recherche-campagnes` |
| T-60 | 9.4 | P0 | Écran détail de campagne avec onglets (barème, cotisations, bilan). | `front/feat-60-detail-campagne` |
| T-61 | 9.5 | P0 | Onglet cotisations : tableau membre/catégorie/montant dû/montant payé/reste/statut. | `front/feat-61-cotisations-campagne` |
| T-62 | 9.6 | P1 | Vue restreinte de l'onglet cotisations pour l'Opérateur (sans agrégats réservés). | `front/feat-62-cotisations-campagne-operateur` |
| T-63 | 9.7 | P2 | Filtre par statut de cotisation (À payer / Partiellement payé / Payé / En retard). | `front/feat-63-filtre-statut-cotisations` |
| T-64 | 9.8 | P1 | Navigation par onglets sans rechargement de page, avec navigation clavier flèches gauche/droite. | `front/feat-64-onglets-clavier-campagne` |
| T-65 | 10.1 | P0 | Formulaire de création de campagne (Nom, Description, Date de début, Date de fin, membres concernés). | `front/feat-65-creation-campagne` |
| T-66 | 10.2 | P0 | Validation "date de fin ≥ date de début". | `front/feat-66-validation-dates-campagne` |
| T-67 | 10.3 | P0 | Masquage de l'action "Créer une campagne" pour Opérateur et Membre. | `front/feat-67-droits-creation-campagne` |
| T-68 | 10.4 | P0 | Formulaire de configuration du barème (montant par catégorie de revenu) sur une campagne. | `front/feat-68-bareme-campagne` |
| T-69 | 10.5 | P1 | Signalement visuel d'une catégorie sans montant configuré dans le barème. | `front/feat-69-categories-sans-bareme` |
| T-70 | 10.6 | P2 | Champ de saisie de montant avec formatage GNF en direct dans le formulaire de barème. | `front/feat-70-formatage-saisie-bareme` |
| T-71 | 11.1 | P0 | Formulaire d'enregistrement d'un règlement (Membre, Campagne, Montant, Date, Mode). | `front/feat-71-enregistrement-reglement` |
| T-72 | 11.2 | P0 | Blocage côté formulaire d'un montant de règlement supérieur au reste à payer, avec message explicite. | `front/feat-72-validation-surpaiement` |
| T-73 | 11.3 | P0 | Masquage de l'action d'enregistrement pour un Opérateur dont `peut_enregistrer_paiements` = non. | `front/feat-73-droits-reglement-operateur` |
| T-74 | 11.4 | P1 | Affichage de l'auteur et de l'horodatage de chaque règlement dans l'historique. | `front/feat-74-auteur-horodatage-reglements` |
| T-75 | 11.5 | P1 | Recalcul et rafraîchissement du reste à payer et du statut après chaque règlement enregistré. | `front/feat-75-rafraichissement-cotisation` |
| T-76 | 11.6 | P1 | Masquage de l'action d'enregistrement sur une cotisation déjà soldée (statut Payé). | `front/feat-76-cotisation-soldee` |
| T-77 | 12.1 | P1 | Onglet bilan de campagne : total attendu, total encaissé, reste à encaisser. | `front/feat-77-bilan-campagne` |
| T-78 | 12.2 | P1 | Onglet bilan : répartition des membres par statut (payé / partiel / non payé). | `front/feat-78-statuts-bilan-campagne` |
| T-79 | 12.3 | P2 | Application de la notation condensée GNF aux montants agrégés du bilan, avec accès à la valeur brute. | `front/feat-79-montants-condenses-bilan` |
| T-80 | 12.4 | P1 | Action "Clôturer la campagne" réservée à Administrateur/Trésorier, avec boîte de confirmation. | `front/feat-80-cloture-campagne` |
| T-81 | 12.5 | P1 | Désactivation des actions de modification (barème, membres concernés, nouveau règlement) sur une campagne clôturée. | `front/feat-81-verrouillage-campagne-cloturee` |
| T-82 | 13.1 | P1 | Écran liste des cagnottes, visuellement séparé de l'écran campagnes. | `front/feat-82-liste-cagnottes` |
| T-83 | 13.2 | P2 | Filtre par type d'événement (Mariage, Baptême, Décès, Naissance, Autre). | `front/feat-83-filtre-evenement-cagnottes` |
| T-84 | 13.3 | P1 | Formulaire de création d'une cagnotte (Titre, Type d'événement, Description, Personne/famille concernée, Date de début, Date de fin, Objectif). | `front/feat-84-creation-cagnotte` |
| T-85 | 13.4 | P2 | Objectif de montant facultatif, avec masquage de la barre de progression si absent. | `front/feat-85-objectif-facultatif-cagnotte` |
| T-86 | 13.5 | P1 | Masquage de l'action "Créer une cagnotte" pour Opérateur et Membre. | `front/feat-86-droits-creation-cagnotte` |
| T-87 | 14.1 | P1 | Formulaire d'enregistrement d'une contribution (Membre, Cagnotte, Montant, Date, Mode). | `front/feat-87-enregistrement-contribution` |
| T-88 | 14.2 | P1 | Autorisation de contributions multiples sans restriction de nombre ni de montant minimal pour un même membre. | `front/feat-88-contributions-multiples` |
| T-89 | 14.3 | P0 | Masquage de l'action d'enregistrement pour un Opérateur dont `peut_enregistrer_paiements` = non. | `front/feat-89-droits-contribution-operateur` |
| T-90 | 14.4 | P1 | Affichage de l'auteur et de l'horodatage de chaque contribution. | `front/feat-90-auteur-horodatage-contributions` |
| T-91 | 14.5 | P1 | Onglet suivi de cagnotte : total collecté, nombre de contributeurs, liste des contributions. | `front/feat-91-suivi-cagnotte` |
| T-92 | 14.6 | P2 | Barre de progression objectif / reste à collecter, quand un objectif est défini. | `front/feat-92-progression-cagnotte` |
| T-93 | 15.1 | P1 | Action "Clôturer la cagnotte" réservée à Administrateur/Trésorier, avec confirmation. | `front/feat-93-cloture-cagnotte` |
| T-94 | 15.2 | P1 | Masquage de l'action d'enregistrement de contribution sur une cagnotte clôturée. | `front/feat-94-verrouillage-cagnotte-cloturee` |
| T-95 | 16.1 | P0 | Écran profil personnel en lecture seule (informations personnelles, catégorie, fonction, statut). | `front/feat-95-profil-personnel` |
| T-96 | 16.2 | P1 | Onglet "Mes cotisations" : campagne, période, montant dû, montant payé, reste, statut. | `front/feat-96-mes-cotisations` |
| T-97 | 16.3 | P1 | Absence de toute action de paiement en ligne sur l'écran "Mes cotisations". | `front/feat-97-absence-paiement-en-ligne` |
| T-98 | 16.4 | P1 | Onglet "Mes contributions" : liste des cagnottes contribuées, montant et date. | `front/feat-98-mes-contributions` |
| T-99 | 16.5 | P0 | Garde de route confirmant qu'un Membre ne peut consulter que ses propres données (aucun accès à la fiche d'un autre membre). | `front/feat-99-acces-donnees-personnelles` |
| T-100 | 17.1 | P2 | États de chargement (skeleton/spinner) pour les listes et fiches principales (membres, campagnes, cagnottes). | `front/feat-100-etats-chargement` |
| T-101 | 17.2 | P2 | États vides ("aucun membre", "aucune campagne", "aucune contribution") sur chaque liste. | `front/feat-101-etats-vides` |
| T-102 | 17.3 | P2 | Gestion uniforme des erreurs API (message générique + retry) sur les formulaires de création/modification. | `front/feat-102-erreurs-api-formulaires` |
| T-103 | 17.4 | P2 | Vérification d'accessibilité clavier sur l'ensemble des dialogues de formulaire (focus trap, échappement). | `front/test-103-accessibilite-dialogues` |
| T-104 | 17.5 | P2 | Revue de cohérence responsive (desktop/tablette/mobile) sur l'ensemble des écrans livrés, par comparaison avec le prototype `design/`. | `front/test-104-coherence-responsive` |
