## REMOVED Requirements

### Requirement: Catalogue de comptes de démonstration

**Reason**: Les comptes fictifs et leurs réponses sont supprimés avec le runtime mock.

**Migration**: Utiliser les comptes présents dans la base de développement réelle et documentés par l'environnement local.

### Requirement: Connexion mockée conforme au contrat

**Reason**: Le formulaire appelle désormais exclusivement l'API backend réelle.

**Migration**: Tester la connexion avec le backend local actif et conserver les tests unitaires isolés.

### Requirement: Hydratation de session depuis le jeton mock

**Reason**: La résolution des comptes en mémoire et les jetons de démonstration n'existent plus.

**Migration**: Vérifier la session via les endpoints réels et le cookie de session local.

### Requirement: Activation limitée au mode de développement mocké

**Reason**: Le mode mock runtime est supprimé.

**Migration**: Utiliser `npm start` avec le backend et la base de développement.

### Requirement: Mode d'emploi pour tester les sessions mockées

**Reason**: La documentation des identifiants fictifs et de la remise à zéro du worker est obsolète.

**Migration**: Suivre la documentation du backend réel et de la base de développement.

## ADDED Requirements

### Requirement: Expiration de session sur le backend réel

Le frontend SHALL effacer l'état de session et rediriger vers `/login` lorsqu'une requête authentifiée autre que la connexion retourne `401`. Un `403` SHALL rester géré comme une erreur d'autorisation ou de règle métier sans effacer la session.

#### Scenario: Session expirée pendant une action métier

- **WHEN** le JWT local expire puis qu'une page appelle un endpoint réel et reçoit `401`
- **THEN** le frontend efface l'utilisateur courant et redirige vers la page de connexion

#### Scenario: Accès refusé sans expiration

- **WHEN** un endpoint réel retourne `403` pour un rôle ou une règle métier
- **THEN** le frontend conserve la session et affiche l'erreur d'accès adaptée
