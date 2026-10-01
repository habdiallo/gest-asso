## ADDED Requirements

### Requirement: Préparer un environnement et un jeu de données de recette

Le plan de tests manuels SHALL définir les prérequis d'environnement, les comptes de recette et un jeu de données fictif réinitialisable couvrant les états nécessaires aux parcours fonctionnels.

#### Scenario: Vérification de démarrage

- **WHEN** un testeur démarre une campagne de tests
- **THEN** il vérifie l'URL, la version de l'application, la disponibilité de l'API, l'accès aux comptes de recette et les opérations critiques avant d'exécuter un cas métier

#### Scenario: Données métier disponibles

- **WHEN** le testeur prépare la campagne complète
- **THEN** le jeu de données contient au moins un membre actif, un membre inactif, plusieurs catégories de revenu, une campagne Brouillon, une campagne Ouverte, une campagne Clôturée, des cotisations non payée, partiellement payée et payée, une cagnotte ouverte et une cagnotte clôturée

#### Scenario: Prérequis indisponible

- **WHEN** une route ou une opération requise est indisponible, notamment `GET /dashboard`
- **THEN** les cas dépendants sont marqués `Bloqué` avec la cause et la dépendance concernée, sans être déclarés réussis grâce à un mock non documenté

### Requirement: Couvrir les rôles et les autorisations

Le plan SHALL exécuter les parcours avec les rôles Administrateur, Trésorier, Opérateur et Membre, et SHALL distinguer l'Opérateur avec `operatorCanRecordPayments = false` de celui avec `operatorCanRecordPayments = true`.

#### Scenario: Matrice positive des rôles

- **WHEN** le testeur exécute la matrice des droits
- **THEN** il vérifie pour chaque rôle les fonctionnalités accessibles, les actions visibles, les destinations par défaut et les données consultables conformément à la matrice du cahier des charges

#### Scenario: Accès négatif par navigation directe

- **WHEN** un rôle tente d'ouvrir directement une route réservée à un autre rôle
- **THEN** l'application empêche l'accès, affiche ou redirige vers le parcours d'accès refusé prévu, et n'expose pas les données de la fonctionnalité

#### Scenario: Variantes de l'Opérateur

- **WHEN** un Opérateur non autorisé puis un Opérateur autorisé consultent une campagne et une cagnotte
- **THEN** le premier peut uniquement réaliser les actions de consultation et de modification de membre non structurante prévues, tandis que le second peut enregistrer un règlement et une contribution dans les limites du MVP

#### Scenario: Fonction associative indépendante du rôle

- **WHEN** deux comptes ont la même fonction associative mais des rôles applicatifs différents
- **THEN** leurs droits suivent leurs rôles applicatifs et non leur fonction descriptive

### Requirement: Vérifier l'authentification, la session et la navigation

Le plan SHALL couvrir la connexion, les erreurs d'authentification, l'hydratation de session, l'expiration, la déconnexion, le changement de mot de passe et la navigation conditionnelle par rôle.

#### Scenario: Connexion nominale

- **WHEN** un compte de chacun des quatre rôles saisit des identifiants valides
- **THEN** la session est établie, l'utilisateur est hydraté, la destination attendue est ouverte et le menu correspondant au rôle est affiché

#### Scenario: Connexion invalide

- **WHEN** le testeur soumet des identifiants invalides ou un formulaire incomplet
- **THEN** un message compréhensible est affiché, aucune session n'est créée, aucune redirection protégée n'est réalisée et les données saisies sont conservées selon le comportement attendu

#### Scenario: Expiration et déconnexion

- **WHEN** la session est expirée côté serveur ou que le testeur utilise l'action de déconnexion
- **THEN** les jetons et données de session sont invalidés, l'accès protégé est fermé et l'écran de connexion est affiché sans conserver de données privées accessibles

#### Scenario: Changement de mot de passe obligatoire

- **WHEN** un compte marqué comme devant changer son mot de passe se connecte
- **THEN** il est dirigé vers le formulaire de changement, les validations de mot de passe sont appliquées et l'accès aux fonctionnalités reste bloqué jusqu'à la réussite de l'opération

### Requirement: Tester les membres, les catégories et les utilisateurs

Le plan SHALL couvrir les opérations de consultation, recherche, filtrage, pagination, création, modification, désactivation, réactivation et gestion des rôles prévues par les US-MEM, US-REV et US-ROLE.

#### Scenario: Parcours membre nominal

- **WHEN** un Administrateur ou un Trésorier consulte les membres, crée un membre valide, ouvre sa fiche et modifie ses informations
- **THEN** le membre apparaît avec le statut Actif, son compte associé est signalé selon le contrat, ses données sont visibles dans la fiche et la modification est persistée

#### Scenario: Restriction des champs membre

- **WHEN** un Opérateur modifie une fiche membre
- **THEN** seuls le nom d'usage, le téléphone, la ville et le pays sont modifiables, tandis que la catégorie, la fonction, le rôle et le statut restent protégés

#### Scenario: Cycle de vie du membre

- **WHEN** un Administrateur désactive puis réactive un membre
- **THEN** le membre n'est pas supprimé, son historique reste disponible, il n'est pas automatiquement inclus dans une nouvelle campagne pendant son inactivité et sa réactivation ne modifie pas son historique

#### Scenario: Catégories de revenu

- **WHEN** un Administrateur crée puis modifie une catégorie de revenu
- **THEN** le libellé obligatoire est validé, la catégorie est disponible dans les formulaires concernés et les cotisations historiques ne sont pas modifiées

#### Scenario: Gestion des utilisateurs et des rôles

- **WHEN** un Administrateur consulte les utilisateurs, modifie un rôle, change l'attribut Opérateur et demande une réinitialisation d'identifiants
- **THEN** chaque changement est confirmé par l'état retourné et les droits du compte correspondent au nouveau rôle et à la valeur de l'attribut

#### Scenario: Refus de gestion privilégiée

- **WHEN** un Trésorier, un Opérateur ou un Membre tente d'accéder aux catégories, aux rôles ou aux opérations de statut réservées
- **THEN** l'action est absente ou refusée et aucune donnée ni mutation privilégiée n'est réalisée

### Requirement: Tester le cycle de vie des campagnes et des cotisations

Le plan SHALL couvrir la création, le filtrage, le détail, la configuration du barème, l'ouverture, la consultation des cotisations, l'enregistrement des règlements, les paiements partiels, le bilan et la clôture conformément aux US-COT et aux règles de paiement.

#### Scenario: Création et préparation d'une campagne

- **WHEN** un Administrateur ou un Trésorier crée une campagne avec des dates valides puis configure un montant strictement positif pour chaque catégorie concernée
- **THEN** la campagne est créée en Brouillon, les cotisations sont établies avec le montant propre à la campagne et les éléments de préparation sont visibles

#### Scenario: Blocage de l'ouverture

- **WHEN** le testeur tente d'ouvrir une campagne avant sa date de début, avec un barème incomplet ou dans un état incompatible
- **THEN** l'ouverture est refusée, la cause bloquante est explicite et la campagne reste en Brouillon

#### Scenario: Ouverture et immutabilité du barème

- **WHEN** un Administrateur ou un Trésorier confirme l'ouverture d'une campagne prête et arrivée à sa date de début
- **THEN** la campagne passe à Ouverte, l'auteur et la date d'ouverture sont conservés, les montants deviennent immuables et les règlements sont activables

#### Scenario: Paiements et statuts de cotisation

- **WHEN** un Trésorier ou un Opérateur autorisé enregistre plusieurs règlements avec des montants et modes valides
- **THEN** le total payé, le reste à payer et le statut passent correctement de À payer à Partiellement payé puis à Payé, avec la traçabilité de l'utilisateur et de la date

#### Scenario: Refus d'un règlement invalide

- **WHEN** le testeur saisit un montant nul, négatif, supérieur au reste à payer, ou tente de payer une campagne Brouillon, Clôturée ou une cotisation déjà Payée
- **THEN** l'opération est refusée, le montant restant et le statut ne changent pas et un message adapté est présenté

#### Scenario: Bilan et clôture

- **WHEN** un rôle autorisé consulte le bilan puis qu'un Administrateur ou un Trésorier clôture la campagne
- **THEN** les agrégats correspondent aux cotisations et règlements, l'historique reste consultable et toute modification du barème ou nouveau règlement est refusé après clôture

### Requirement: Tester les cagnottes et les contributions

Le plan SHALL couvrir la création, les filtres, le détail, le suivi, les contributions de membres et de contributeurs externes, la pagination et la clôture d'une cagnotte.

#### Scenario: Création et suivi d'une cagnotte

- **WHEN** un Administrateur ou un Trésorier crée une cagnotte avec un type, une période et les informations attendues
- **THEN** la cagnotte est listée, son détail expose le total collecté, le nombre de contributeurs, l'objectif éventuel, le reste et les contributions

#### Scenario: Contribution d'un membre

- **WHEN** un Trésorier ou un Opérateur autorisé enregistre une contribution liée à un membre avec un montant, une date et un mode valides
- **THEN** la contribution est rattachée à une seule identité, apparaît dans le suivi et ne modifie aucune cotisation

#### Scenario: Contribution externe

- **WHEN** un Trésorier ou un Opérateur autorisé enregistre une contribution au nom d'un contributeur externe
- **THEN** le prénom et le nom sont conservés comme instantané, la contribution est comptée correctement et aucun membre, compte ou accès n'est créé

#### Scenario: Contrôle d'identité contributrice

- **WHEN** le testeur soumet une contribution sans identité, avec un membre et un contributeur externe simultanément, ou sur une cagnotte clôturée
- **THEN** l'opération est refusée et aucune contribution partielle n'est créée

#### Scenario: Clôture d'une cagnotte

- **WHEN** un Administrateur ou un Trésorier confirme la clôture d'une cagnotte
- **THEN** les contributions et le montant final restent consultables et toute nouvelle contribution est refusée

### Requirement: Vérifier l'espace personnel et la confidentialité des données

Le plan SHALL vérifier que chaque utilisateur consulte les données correspondant à son identité et à son rôle, et qu'un Membre ne peut pas consulter les données d'un autre membre.

#### Scenario: Consultation personnelle

- **WHEN** un utilisateur authentifié ouvre son compte ou son espace personnel
- **THEN** il voit son profil, ses cotisations et ses contributions autorisées avec les montants, dates et statuts attendus

#### Scenario: Isolation des données du Membre

- **WHEN** un Membre tente d'ouvrir la liste des membres, la fiche d'un autre membre ou une URL contenant l'identifiant d'un autre membre
- **THEN** l'accès est refusé ou limité à ses propres données et aucune information personnelle ou financière d'un tiers n'est affichée

#### Scenario: Conservation de l'historique

- **WHEN** un membre est désactivé ou qu'une catégorie est modifiée après une campagne passée
- **THEN** les informations historiques de la campagne, des règlements et des contributions restent cohérentes avec leur état d'origine

### Requirement: Tracer les résultats et séparer le fonctionnel du responsive

Le plan SHALL fournir une fiche de résultat par cas et SHALL distinguer les résultats fonctionnels des contrôles responsive qui seront traités dans une évolution ultérieure.

#### Scenario: Résultat reproductible

- **WHEN** un testeur termine un cas manuel
- **THEN** il enregistre l'identifiant du cas, la date, l'environnement, le rôle, les données utilisées, le verdict, l'observation, la preuve et le ticket de défaut si nécessaire

#### Scenario: Cas non vérifiable

- **WHEN** une dépendance technique, une donnée ou une route empêche l'exécution
- **THEN** le cas est marqué `Bloqué` ou `Non applicable` avec justification, sans être assimilé à un échec fonctionnel ni à une réussite

#### Scenario: Anomalie nécessitant une correction

- **WHEN** l'exécution d'un cas révèle une anomalie indépendante du scénario en cours
- **THEN** un ticket de type `fix` est créé immédiatement avec le cas, le rôle, l'environnement, les étapes, les résultats attendu et observé, les preuves et la priorité
- **THEN** le scope du ticket est `front`, `back` ou `fullstack` selon la zone affectée, et le cas reste `Échoué` ou `Bloqué` jusqu'à sa revalidation

#### Scenario: Hors périmètre responsive

- **WHEN** un testeur observe un problème de largeur, de débordement, de contraste, de densité ou de composition selon le viewport
- **THEN** il le rattache à la future campagne responsive et ne modifie pas le verdict fonctionnel du présent plan, sauf si l'action métier devient impossible à utiliser
