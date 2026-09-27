# Rapport d'audit T-140

## Périmètre et référence

L'audit porte sur `contribo-front/` depuis la branche
`front/refactor-140-audit-refactorisation-sans-regression`, basée sur
`origin/main` après T-139. Les modifications documentaires T-138 et les cinq
fichiers `source-command-opsx-*` non conformes à `main` restent hors périmètre.

La référence avant refactorisation est la suivante :

- 243 fichiers applicatifs TypeScript, HTML et CSS dans `src/app/`.
- 261 fichiers sources en incluant les scripts et ressources TypeScript.
- 75 fichiers de tests et 771 tests réussis avec `npm test -- --watch=false`.
- `npm run lint`, `npm run build` et `npm run test:tooling` réussis.
- `npm run build` conserve l'avertissement de budget CSS préexistant sur
  `src/app/app.css` : 7,31 kB pour un budget de 4 kB.
- `npm run format:check` échoue uniquement sur trois fichiers préexistants :
  `features/income-categories/mocks/handlers.spec.ts`,
  `features/member-space/components/my-dues.spec.ts` et
  `features/members/member-payment-dates.spec.ts`.

## Cartographie du frontend

### Entrée, shell et routes

- `src/main.ts` démarre l'application Angular.
- `src/app/app.config.ts` assemble les providers globaux, le routeur, les
  traductions et les interceptors.
- `src/app/app.routes.ts` expose le shell et charge les features par lazy
  loading. Les routes fonctionnelles sont regroupées dans `features/`.
- `features/shell/` porte le layout global et la navigation persistante.
- `features/auth/` porte la connexion et la protection de l'accès.
- `features/account/` porte l'espace de compte.

### Features métier

Chaque feature regroupe ses pages, composants, services, mocks et tests
colocalisés :

| Feature             | Responsabilité principale                        | Validation observée                     |
| ------------------- | ------------------------------------------------ | --------------------------------------- |
| `campaigns`         | campagnes, détails, cotisations et paiements     | tests de pages, composants et handlers  |
| `dashboard`         | indicateurs, sélections et actions rapides       | tests de page et mocks                  |
| `income-categories` | catégories de revenu et dialogs                  | tests de page, formulaires et handlers  |
| `member-space`      | parcours membre et consultations personnelles    | tests de pages et composants            |
| `members`           | liste, détail, formulaires et cotisations membre | tests de page, formulaires et onglets   |
| `roles-users`       | utilisateurs, rôles et permissions               | tests de page et handlers               |
| `social-funds`      | cagnottes, détails et contributions              | tests de pages, formulaires et handlers |

### Socle transversal

- `core/api/generated/` contient le client API généré et ses modèles. Il est
  consommé via `@api` et ne doit pas être refactorisé manuellement.
- `core/navigation/` contient la navigation et les routes partagées.
- `core/session/` contient la session, les permissions et les comptes courants.
- `core/i18n/` contient le chargement et les clés de traduction.
- `core/theme/` contient la gestion des thèmes.
- `shared/` contient les composants, directives et utilitaires neutres. Les
  composants partagés utilisent déjà majoritairement `OnPush`.
- `src/assets/` contient les traductions et ressources statiques.
- `src/mocks/` contient les données de démonstration communes aux handlers.

Les configurations TypeScript, Angular, Vitest, ESLint, Prettier et les scripts
de validation sont sous `contribo-front/`. Les dépendances externes n'ont pas
besoin d'évolution pour le périmètre retenu.

## Matrice des constats

| Constat et preuve                                                                      | Fréquence / consommateurs                                                                  | Bénéfice attendu                                                      | Risque                                                                               | Décision et validation                                                                      |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| Imports profonds vers `assets/i18n/fr.json`                                            | 33 occurrences dans l'application et les specs, depuis core, shared et plusieurs features  | Réduire les remontées fragiles et rendre la racine globale explicite  | Faible si l'alias est résolu par Angular, TypeScript, tests et lint                  | Retenu. Ajouter `@assets/*`, migrer les imports globaux, exécuter tests, lint et build      |
| Imports profonds vers `mocks/demo-accounts.ts` et `mocks/demo-dues.ts`                 | Handlers et specs de plusieurs features                                                    | Réduire les chemins relatifs et stabiliser les mocks communs          | Faible si `@mocks/*` reste réservé à `src/mocks`                                     | Retenu. Ajouter `@mocks/*`, conserver les imports locaux et valider `test:tooling`          |
| Formateur `Intl.DateTimeFormat` de date calendrier strictement identique               | 7 modules de features, même locale, options UTC et construction ISO                        | Supprimer une duplication prouvée sans changer les signatures locales | Faible avec un helper pur et des wrappers locaux                                     | Retenu. Centraliser dans `core/formatting`, conserver les exports locaux et ajouter un test |
| `dashboard/mocks/handlers.ts` importe `social-funds/mocks/handlers.ts`                 | 1 dépendance directe entre features                                                        | Aucun gain sûr par alias, mais signal d'architecture à traiter        | Élevé, car déplacer ou masquer le mock peut changer les fixtures                     | Reporté. Documenter pour un ticket dédié, ne pas le masquer avec `@features/*`              |
| Pages et specs très volumineuses, notamment dashboard, membres, campagnes et cagnottes | Pages jusqu'à 989 lignes HTML, specs jusqu'à 1831 lignes                                   | Lisibilité potentielle                                                | Moyen à élevé, consommateurs et états nombreux                                       | Reporté. Une extraction sans découpage fonctionnel prouvé serait spéculative                |
| `$any($event.target)` dans `campaign-dues-tab.html`                                    | 1 occurrence                                                                               | Améliorer le typage local                                             | Faible mais hors des groupes retenus, car le type DOM doit être choisi explicitement | Reporté. À traiter avec un ticket de typage ciblé si nécessaire                             |
| Présence de code mort                                                                  | Recherche des routes, imports, scripts, configurations et conventions Angular              | Réduire le code inutilisé                                             | Élevé si une référence indirecte est manquée                                         | Aucun élément supprimé. Les éléments non démontrés restent en place                         |
| `OnPush`, `effect` et état réactif                                                     | Les composants de production observés utilisent déjà `OnPush`; les `effect` sont localisés | Gain éventuel de performance                                          | Élevé sans mesure ni preuve de mauvais comportement                                  | Aucun changement global. L'audit ne justifie pas de modifier la stratégie Angular           |
| Budget CSS dépassé et écarts Prettier                                                  | Avertissement build et trois fichiers formatés hors périmètre                              | Réduire les avertissements                                            | Aucun lien démontré avec T-140                                                       | Conservé comme état préexistant, sans correction hors périmètre                             |

## Priorisation et groupe livré

Le groupe T-140 est limité aux corrections internes démontrées et réversibles :

1. déclarer `@assets/*` et `@mocks/*` dans `tsconfig.json`;
2. migrer les imports qui traversent plusieurs racines globales;
3. centraliser le formateur de date calendrier identique dans `core/formatting`,
   tout en gardant les fonctions exportées par les features;
4. ajouter un test ciblé du helper partagé et relancer les contrôles.

Les routes, permissions, appels API, données, formulaires, états globaux,
navigation et composants métier restent inchangés. Les seules évolutions
visuelles ajoutées après le retour utilisateur sont ciblées sur mobile : actions
réparties sans débordement, disposition adaptative des tablists selon leurs
libellés, cartes des listes métier qui exposaient encore une table large,
retour à la ligne des textes, filtres compacts et récapitulatifs de règlement
en trois colonnes, ainsi que le maintien de la pagination à 10 éléments par
page. Aucun changement
de dépendance externe, de contrat ou de stockage n'est nécessaire.

## Frontières conservées

Les imports strictement locaux à une feature restent relatifs. L'import du mock
social dans le handler du dashboard est conservé et signalé, car un alias ne
doit pas masquer une dépendance directe entre features. Les aliases ne servent
pas à créer une architecture parallèle.

L'analyse des consommateurs des pages, composants, services et handlers n'a pas
révélé de séparation de responsabilité suffisamment indépendante pour justifier
une extraction dans ce ticket. Les gros fichiers sont liés à plusieurs états,
permissions et parcours. Ils restent donc inchangés plutôt que de créer une
abstraction spéculative ou de déplacer une responsabilité entre `features/`,
`core/` et `shared/`.

## Code mort et vérification visuelle

Les imports statiques, routes lazy, configurations, scripts et tests ont été
inspectés avant toute suppression. Aucun fichier n'est supprimé par T-140 :
la preuve de code mort n'est pas suffisante.

Le groupe initial ne modifiait ni HTML ni CSS. Le complément demandé modifie
les templates mobiles de la fiche membre et des tablists, sans changer le rendu
desktop, les données ni les parcours. Les tables desktop restent sémantiques et
les cartes mobiles reprennent toutes les valeurs métier. La vérification
navigateur manuelle couvre le dashboard, les listes de membres, les fiches
campagne et cagnotte, ainsi que les tablists et les cartes mobiles. Les
variations exactes de navigateur et de thème restent couvertes par la
validation responsive existante et les limites documentées.

## Reversibilité

Les corrections sont isolées dans les composants partagés, les templates
mobiles et les changements d'import. Un revert du commit T-140 restaure les
chemins et le rendu précédent sans migration de données ni changement du
contrat API.

## Validation après implémentation

- `npm test -- --watch=false` : 76 fichiers et 783 tests réussis.
- `npm run lint` : réussi.
- `npm run build` : réussi, avec l'avertissement CSS préexistant décrit plus
  haut.
- `npm run test:tooling` : 6 tests réussis.
- `npm run format:check` : échec sur les trois fichiers déjà identifiés avant
  T-140, sans nouveau fichier en échec.
- `node scripts/tickets.mjs check` et `node scripts/tickets.mjs verify T-140` :
  réussis.
- `openspec validate audit-refactorisation-sans-regression --strict` : réussi.
- `git diff --check` : réussi.
- Les changements HTML ciblent les actions, tablists, filtres, tableaux et
  cartes mobiles du dashboard, des membres, des campagnes et des cagnottes.
  Aucun chemin T-138 ou `source-command-opsx-*` n'est inclus.
