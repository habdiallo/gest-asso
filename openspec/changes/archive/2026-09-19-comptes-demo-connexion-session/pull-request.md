# chore(front): T-107 fournir les comptes et sessions de démonstration

## Problème et résultat

Sans backend, le formulaire de connexion ne permettait pas de tester une session.
Le mode `start:mock` fournit désormais cinq comptes fictifs couvrant les quatre
rôles et les deux autorisations Opérateur, avec `POST /api/v1/auth/login` et
`GET /api/v1/me`. Chaque jeton retrouve le même profil après rechargement et
redémarrage du serveur. Les corps invalides sont refusés en 400 et les credentials
ou Bearer inconnus en 401, conformément aux DTO générés.

Le README documente les identifiants, le mot de passe commun `demo-contribo`,
la déconnexion, le changement de compte et la remise à zéro de la session.

## Traçabilité et périmètre

- Ticket local : **T-107**, enregistré dans `openspec/tickets.json`.
- Change OpenSpec : `comptes-demo-connexion-session`, schéma `spec-driven`.
- Scope / type : `front` / `chore`.
- Branche : `front/chore-107-mocks-connexion-session` ; cible prévue : `main`.
- Tâches locales : 1.1–3.3 et 4.1. Publication et revue/fusion restent distinctes.
- Dépendances présentes : T-105 (MSW) et T-5 corrigé, PR 13 intégrée dans
  `63f78c7`. La branche a été rebasée sur `origin/main` à jour (`6041c99`,
  incluant les PR 13 à 21, T-5 à T-13) avant publication ; aucun conflit sur
  les fichiers propres à T-107.

## Validation

Depuis `contribo-front/`, avec Node 24 et les dépendances déjà installées,
rejoué après le rebase sur `main` à jour :

- `npm test -- --watch=false` : **16 fichiers, 83 tests réussis**, dont la
  validation des corps/limites Unicode et la restauration des cinq profils par
  le client HTTP et son intercepteur. Aucun worker MSW dans Vitest.
- `npm run lint` et `npm run format:check` : réussis.
- `npm run test:tooling` : **6 tests réussis**.
- `npx --no-install tsc --noEmit -p tsconfig.app.json` et
  `npx --no-install tsc --noEmit -p tsconfig.mock.json` : réussis.
- `npm run build` et `npm run build -- --configuration mock` : réussis.
- `node scripts/tickets.mjs verify T-107`,
  `node scripts/tickets.mjs check --base-ref origin/main` (depuis la racine),
  `openspec validate comptes-demo-connexion-session --strict` et
  `git diff --check` : réussis.
- Vérification manuelle dans Chrome via `npm run start:mock -- --port 4209` :
  connexion `operateur.demo` / `demo-contribo`, menu Opérateur affiché
  (Membres, Campagnes, Cagnottes, Mon espace), session restaurée après
  rechargement via `GET /api/v1/me`, déconnexion vers `/login`, puis mauvais
  mot de passe sur `admin.demo` refusé avec le message générique attendu.
  Aucune erreur console. La matrice complète des cinq comptes et des cas
  401/400 avait été validée dans une session précédente sur ce même code
  (login/handlers/fixtures inchangés par le rebase) ; non rejouée intégralement
  ici faute de temps, seule une vérification représentative l'a été.

Pas de nouveau composant visuel, de dépendance E2E ou de validation backend.
Les contrôles GitHub et la revue restent à effectuer lors de la publication.

## Impacts et livraison

Aucune modification du contrat, du client généré, du formulaire ou de la session
applicative. Les nouveaux modules sont chargés uniquement par l'entrée mock,
exclus de la compilation normale. Le fichier worker déjà copié par T-105 reste
inerte en démarrage normal.

Les jetons sont fixes ; leur expiration temporelle n'est pas simulée. Le mock
du tableau de bord conserve ses données Membre indépendantes de la connexion.
Les écrans et droits métier futurs ne sont pas livrés par ce ticket.
Le retour au mode normal utilise `npm start` ; un retrait des fixtures/handlers
ne modifie aucune donnée serveur ni migration.

Cette description est préparée localement. Aucun push, ouverture de PR, fusion
ou archivage n'a été effectué dans cet apply.

## Avant revue

- [x] Branche conforme au ticket ; cible prévue `main`.
- [x] Périmètre limité au ticket et diff relu.
- [x] Critères d'acceptation couverts et validations pertinentes exécutées.
- [x] Artefacts/tâches OpenSpec mis à jour selon les actions réellement effectuées.
- [x] Aucun secret ou fichier temporaire dans le diff ; impacts documentés.
