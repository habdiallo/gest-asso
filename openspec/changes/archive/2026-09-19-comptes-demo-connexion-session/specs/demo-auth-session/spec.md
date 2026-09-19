## ADDED Requirements

### Requirement: Catalogue de comptes de démonstration
Le mode mock SHALL fournir des comptes fictifs pour Administrateur, Trésorier,
Opérateur et Membre, dont deux comptes Opérateur avec des valeurs opposées de
`operatorCanRecordPayments`, conformément à RG-ROLE-007 à RG-ROLE-009 et à la matrice §3.
Les comptes SHALL exposer un `CurrentUser` conforme à `besoins/openapi.yaml`, avec
`accountActive: true` et `operatorCanRecordPayments: false` hors du rôle Opérateur.

#### Scenario: Disponibilité des quatre rôles
- **WHEN** le testeur utilise successivement les comptes documentés en mode mock
- **THEN** il peut obtenir une session Administrateur, Trésorier, Opérateur et Membre
  avec les enums exacts `ADMINISTRATOR`, `TREASURER`, `OPERATOR` et `MEMBER`

#### Scenario: Deux états de l'autorisation Opérateur
- **WHEN** le testeur se connecte avec chacun des deux comptes Opérateur
- **THEN** l'un retourne `operatorCanRecordPayments: true` et l'autre `false`
  sans changer leur rôle `OPERATOR`

### Requirement: Connexion mockée conforme au contrat
En mode mock, `POST /api/v1/auth/login` SHALL répondre selon l'opération `login`
avec un `LoginResponse` conforme pour des identifiants de démonstration valides,
et des erreurs `ErrorResponse` conformes en cas de refus. Le formulaire existant
SHALL rester le point d'entrée de connexion, conformément à US-ACC-001 et RG-003.

#### Scenario: Connexion réussie pour un compte documenté
- **WHEN** un testeur ouvre `/login`, saisit les identifiants valides d'un compte
  documenté et soumet le formulaire
- **THEN** le handler répond 200 avec `accessToken`, `tokenType: Bearer`, `expiresIn`
  entier positif et le `user` de ce compte ; le frontend stocke le jeton via la
  session existante et effectue sa redirection de connexion habituelle

#### Scenario: Identifiant ou mot de passe incorrect
- **WHEN** la requête de connexion contient un identifiant inconnu ou un mauvais
  mot de passe dans un corps conforme à `LoginRequest`
- **THEN** le handler répond 401 avec le code `AUTHENTICATION_REQUIRED` et un message
  générique sans révéler le champ incorrect ; le formulaire n'ouvre pas de nouvelle session

#### Scenario: Corps de connexion invalide
- **WHEN** la requête ne contient pas un JSON conforme à `LoginRequest`, notamment
  un champ obligatoire manquant ou un type incorrect
- **THEN** le handler répond 400 avec un `ErrorResponse` de code `VALIDATION_ERROR`

#### Scenario: Changement de compte avec un ancien en-tête Bearer
- **WHEN** une requête de connexion valide est envoyée avec un en-tête Authorization
  provenant d'une précédente session
- **THEN** le handler répond avec le compte correspondant aux nouveaux identifiants,
  sans imposer la validité de cet ancien jeton à l'opération publique `login`

### Requirement: Hydratation de session depuis le jeton
En mode mock, `GET /api/v1/me` SHALL résoudre le compte exclusivement depuis son
jeton Bearer et répondre selon l'opération `getCurrentUser`. La correspondance
SHALL rester stable après rechargement du navigateur et redémarrage du serveur
de développement pour le même catalogue de démonstration.

#### Scenario: Restauration après rechargement
- **WHEN** un testeur connecté avec l'un des cinq comptes recharge la page en
  conservant le jeton stocké par `SessionService`
- **THEN** `/api/v1/me` répond 200 avec les mêmes `userId`, association, membre, rôle
  et autorisation Opérateur que ceux retournés à la connexion

#### Scenario: Restauration après redémarrage du serveur mock
- **WHEN** le serveur `start:mock` est redémarré puis la page est rechargée avec un
  jeton de démonstration reconnu déjà stocké
- **THEN** le compte est retrouvé sans nécessiter une connexion préalable dans
  la mémoire de la nouvelle instance MSW

#### Scenario: Jeton absent, mal formé ou inconnu
- **WHEN** `/api/v1/me` reçoit une requête sans jeton Bearer reconnu
- **THEN** le handler répond 401 avec le code `AUTHENTICATION_REQUIRED`, sans
  retourner de profil ni de données d'un autre compte

#### Scenario: Résolution distincte de chaque compte
- **WHEN** les jetons de deux comptes différents sont utilisés successivement
  pour appeler `/api/v1/me`
- **THEN** chaque requête retrouve son propre compte et aucune n'hérite du dernier
  utilisateur connecté par une autre page ou un autre onglet

### Requirement: Activation limitée au mode de développement mocké
Les nouveaux comptes, fixtures et handlers SHALL être activés exclusivement par
`npm run start:mock`, en réutilisant le dispositif T-105. `npm start` et le build
normal SHALL rester indépendants de ces nouveaux handlers. Le client généré et
les composants de connexion/session SHALL conserver leur fonctionnement applicatif.

#### Scenario: Connexion et hydratation sans backend en mode mock
- **WHEN** le testeur démarre `npm run start:mock` sans backend disponible et utilise
  le formulaire de connexion puis recharge la page
- **THEN** MSW répond aux requêtes `/api/v1/auth/login` et `/api/v1/me` avant qu'elles
  atteignent le backend, via le client HTTP généré existant

#### Scenario: Démarrage et build normaux
- **WHEN** `npm start` ou `npm run build` est exécuté sans la configuration mock
- **THEN** aucun nouveau handler ni compte de démonstration n'est activé dans
  l'application et les nouveaux modules mock ne sont pas inclus dans le bundle normal

#### Scenario: Tests unitaires indépendants du worker
- **WHEN** les tests Vitest vérifient la connexion et la session applicatives
- **THEN** ils utilisent `HttpTestingController`/`provideHttpClientTesting` et ne
  démarrent aucun worker MSW

### Requirement: Mode d'emploi pour tester les sessions
La documentation frontend SHALL fournir la commande de démarrage, l'URL `/login`,
les cinq identifiants et leur mot de passe de démonstration, les rôles/permissions
associés et les étapes pour changer de compte ou remettre la session à zéro.

#### Scenario: Première connexion guidée
- **WHEN** un testeur suit la documentation depuis `contribo-front/`
- **THEN** il peut démarrer le mode mock et se connecter avec un compte documenté
  sans modifier le code ou créer manuellement un jeton dans le navigateur

#### Scenario: Retour à une session vierge
- **WHEN** le testeur suit les instructions de remise à zéro puis recharge la page
- **THEN** le jeton `contribo-session-token` est supprimé et aucune session n'est
  restaurée automatiquement ; les autres préférences du navigateur sont conservées

#### Scenario: Déconnexion et choix d'un autre compte
- **WHEN** le testeur utilise le bouton « Se déconnecter » existant puis se connecte
  avec un autre compte de démonstration
- **THEN** la précédente session est supprimée et le nouveau rôle/profil est obtenu
  par le formulaire habituel, sans modification du code ou saisie manuelle de jeton

#### Scenario: Limites des écrans disponibles
- **WHEN** le testeur consulte les instructions de démonstration
- **THEN** il est informé des écrans effectivement livrés et du fait que les comptes
  ne rendent pas disponibles les écrans et mutations métier encore non implémentés
