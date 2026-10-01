## Context

Décider et documenter quand un état global est justifié, puis fournir le socle retenu. Le ticket est isolé pour permettre un worktree et une PR dédiés.

## Goals / Non-Goals

**Goals:**

- Traiter le problème identifié et laisser une documentation vérifiable.
- Préserver les frontières d architecture et les contrats hors périmètre.

**Non-Goals:**

- Ne pas mélanger les autres problèmes de l audit dans cette branche.
- Ne pas modifier main ou develop directement.

## Decisions

- L'état reste local ou colocalisé dans `features/<feature>/` par défaut, avec les
  Signals Angular et des services de feature lorsque plusieurs composants doivent
  partager une même donnée.
- `core/` conserve uniquement l'état transversal déjà nécessaire, notamment la
  session, le thème et la configuration HTTP/API. Un cache métier global n'est pas
  introduit pour compenser une absence de stratégie d'invalidation.
- La source de vérité des données serveur reste l'API. Après une mutation, la
  feature recharge ou invalide explicitement les données concernées.
- Une promotion vers `core/` nécessite un usage par plusieurs features, une durée
  de vie transversale et une justification documentée avec ses tests.

Ces choix évitent un store global prématuré tout en laissant un critère explicite
pour les besoins futurs. Les changements dépendants attendent T-172.

## Risks / Trade-offs

- Une migration peut exposer des dépendances implicites. Les tests, la documentation et une procédure de retour arrière doivent les rendre visibles.

## Migration Plan

Le changement est documentaire et n'impose pas de migration de données. Les
features existantes conservent leur état actuel. Lorsqu'une nouvelle feature est
créée ou qu'un état est déplacé, appliquer la stratégie, ajouter les tests
colocalisés, puis vérifier la documentation et le build frontend. Le retour
arrière consiste à retirer la documentation et la décision ajoutées si aucune
feature ne les référence encore.

## Validation et limites

Les contrôles de registre et de traçabilité passent avec `node scripts/tickets.mjs
check`, `node scripts/tickets.mjs verify T-176`, `openspec status` et les
instructions `openspec apply`. La documentation frontend stable passe avec
`npm run test:documentation`, et les tests de workflow du dépôt passent avec
`node --test tests/tickets.test.mjs tests/git-workflow.test.cjs`.

Après génération locale du client OpenAPI ignoré, `npm run build`, `npm test --
--watch=false` (804 tests) et `npm run test:tooling` passent. `npm run check:api`
et le contrôle d'alignement des versions OpenAPI passent également.

Les limites suivantes sont préexistantes et ne sont pas introduites par ce
changement documentaire :

- `npm run format:check` signale 20 fichiers frontend existants ;
- `npm run lint` signale l'import `inject` inutilisé dans
  `src/app/core/session/auth.interceptor.ts` ;
- `npm run build:mock` termine par un deadlock interne esbuild avec le code 134,
  y compris en exécution séquentielle ;
- `npm ci` signale 8 vulnérabilités dans l'arbre de dépendances existant, dont 6
  hautes et 2 critiques.

Aucun test runtime ni aucune migration d'état n'est nécessaire pour T-176 : la
livraison définit une règle de gouvernance et ne déplace pas d'état existant.

## Open Questions

- Aucun store global supplémentaire n'est requis par les features actuelles.
- Une future synchronisation temps réel devra préciser sa source de vérité et sa
  politique d'invalidation avant d'être promue dans `core/`.
