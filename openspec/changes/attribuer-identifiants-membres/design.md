## Context

La table `user_accounts` possède déjà un champ `identifier` unique par association. Lors de la création d'un membre, `MemberService` le remplit actuellement avec le téléphone lorsque celui-ci est renseigné, puis retourne cet identifiant avec le mot de passe temporaire. Le téléphone est pourtant une donnée de contact modifiable et potentiellement partagée.

Le détail utilisateur expose déjà un compte via `GET /users/{userId}`, mais le contrat `UserAccountSummary` ne contient pas encore l'identifiant. La création est fullstack : le backend produit la nouvelle valeur, puis le frontend la rend visible dans le dialogue de détail du compte utilisateur. Les listes restent inchangées.

## Goals / Non-Goals

**Goals:**

- Générer un identifiant stable au format `initialesprenomnom-code`, par exemple `jpdiallo-4821`.
- Normaliser les accents et séparateurs, gérer les prénoms composés et garantir l'unicité par association.
- Décorréler le téléphone de l'authentification pour les nouveaux comptes.
- Exposer l'identifiant dans `UserAccount` et l'afficher uniquement dans le détail utilisateur.
- Migrer en place les comptes existants sans toucher à leur mot de passe, leur UUID ou leur historique.

**Non-Goals:**

- Ajouter une nouvelle colonne : `user_accounts.identifier` est conservé.
- Rendre le téléphone obligatoire ou globalement unique.
- Afficher l'identifiant dans la liste des membres, la liste des utilisateurs ou la fiche membre.
- Modifier les mots de passe, les rôles, les associations ou les données financières existantes.
- Autoriser les utilisateurs à choisir librement un identifiant arbitraire.

## Decisions

### Identifiant généré côté backend

Le backend génère l'identifiant dans le service de création, dans la même transaction que le membre et son compte. Le prénom est découpé sur les espaces, tirets et apostrophes, une initiale est prise pour chaque partie, puis le nom est normalisé et concaténé. Les accents sont retirés, les caractères non alphanumériques sont supprimés et le résultat est converti en minuscules.

Le code est composé de quatre chiffres générés par le backend. Le service vérifie la disponibilité du candidat dans l'association et régénère le code en cas de collision. La contrainte SQL existante sur `(association_id, identifier)` reste l'autorité finale.

### Contrat API et affichage

`UserAccountSummary` reçoit un champ `identifier` en lecture seule. Le frontend affiche l'identifiant dans le dialogue de détail du compte utilisateur déjà utilisé pour les rôles et la réinitialisation du mot de passe. Il ne l'affiche pas dans les listes ni dans les pages membres. Le téléphone reste modifiable comme contact et ne provoque aucune modification de l'identifiant de connexion.

### Migration des comptes existants

Les comptes existants sont mis à jour en place, sans suppression. Une étape de pré-migration produit un inventaire non secret des comptes concernés et de leurs UUID. La migration applique ensuite une correspondance explicite vers des identifiants générés et vérifiés, ciblée par UUID de compte, jamais par une mise à jour globale des numéros de téléphone.

Les mots de passe hashés, `must_change_password`, rôles, UUID et références historiques restent inchangés. Une sauvegarde et une vérification de l'unicité sont exigées avant l'update. Le rollback restaure les anciennes valeurs d'`identifier` à partir de la correspondance conservée.

## Risks / Trade-offs

- [Collision de code] Le code à quatre chiffres offre un espace fini. Le service vérifie l'unicité et réessaie ; la contrainte SQL protège les courses concurrentes.
- [Noms très longs ou sans caractères latins] La normalisation applique une longueur maximale documentée et prévoit un fallback.
- [Migration mal ciblée] Une mise à jour globale pourrait changer des comptes inattendus. La migration utilise les UUID inventoriés, une transaction et une sauvegarde.
- [Anciennes habitudes de connexion] Les comptes migrés recevront de nouveaux identifiants. La correspondance doit être communiquée avec le même niveau de confidentialité que les identifiants temporaires.
