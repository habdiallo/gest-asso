## Context

Contribo possède un frontend Angular organisé par fonctionnalités, un contrat OpenAPI partagé et un plan manuel fonctionnel déjà décrit par T-183. Le dépôt ne configure actuellement aucun outil E2E et les contrôles manuels doivent donc rester possibles sans dépendre d'une nouvelle plateforme d'automatisation. L'agent proposé doit analyser les sources du projet, préparer une campagne, guider ou observer une session de recette, puis conserver des artefacts permettant de reprendre l'historique.

Le dispositif concerne plusieurs responsabilités distinctes : découverte du périmètre, génération de scénarios, exécution d'une campagne, comparaison avec les attentes, qualification des écarts, déduplication et publication de résultats. Il doit respecter les frontières du frontend existant, ne pas modifier l'application pendant une campagne et ne jamais utiliser de données de production.

## Goals / Non-Goals

**Goals:**

- Définir un contrat stable pour une exécution QA identifiée par un `runId`, son environnement, son périmètre et sa version de référence.
- Construire une couverture à partir de T-183, des routes/features Angular, du cahier métier, des specs OpenSpec et du contrat OpenAPI.
- Permettre une exécution guidée par un testeur, ainsi qu'une observation navigateur lorsque l'adaptateur disponible le permet.
- Conserver les entrées, scénarios, résultats, preuves, anomalies, tickets et synthèse dans un format lisible et exploitable par un run suivant.
- Détecter les doublons avant de créer un nouveau ticket et distinguer défaut confirmé, suspicion, blocage technique et clarification produit.
- Fournir des validations de schéma et des fixtures pour vérifier l'orchestration sans lancer l'application réelle.

**Non-Goals:**

- Ajouter un framework E2E, modifier les routes Angular, le backend, le contrat OpenAPI ou les données métier.
- Déclarer automatiquement un défaut lorsque le comportement attendu n'est pas établi par une source fiable.
- Accéder à la production, contourner une permission, exécuter une action financière irréversible ou réinitialiser des données sans autorisation explicite de l'environnement.
- Publier une issue externe, pousser une branche, ouvrir ou fusionner une PR sans adaptateur autorisé et décision explicite du workflow.
- Remplacer les tests unitaires, d'intégration et les contrôles responsive dédiés.

## Decisions

### Orchestrateur à étapes et adaptateurs explicites

Le cycle sera composé des étapes `discover`, `plan`, `prepare`, `execute`, `compare`, `classify`, `deduplicate`, `report` et `finalize`. Chaque étape consommera et produira un document validé. Les accès au navigateur, à l'application et à une éventuelle gestion de tickets seront des adaptateurs séparés avec une politique déclarée.

Cette séparation permet de lancer une campagne en mode guidé même lorsqu'aucun navigateur pilotable ou environnement de recette n'est disponible. Une implémentation monolithique ou une intégration directe dans les features Angular rendrait les runs difficiles à tester et violerait le rôle d'outillage transversal.

### Sources de vérité hiérarchisées

Le plan T-183 et les specs fonctionnelles portent les comportements attendus. Le cahier métier et les règles associées complètent les validations et les rôles. Le contrat OpenAPI décrit les opérations et erreurs d'interface. Les routes et composants existants indiquent le périmètre effectivement exposé. En cas de contradiction, l'agent conserve les références en conflit et produit une question de clarification au lieu de choisir silencieusement.

La découverte produira un inventaire avec source, date de lecture, commit ou version observée, feature, route, opération API, rôle et dépendances. Les hypothèses non confirmées seront explicitement marquées `à clarifier`.

### Identifiants stables et déduplication déterministe

Chaque scénario aura un identifiant stable dérivé de la feature, du parcours et de l'intention métier. Chaque anomalie aura une empreinte calculée à partir de la feature, du scénario, de la condition, du résultat attendu et du résultat observé normalisé. L'empreinte sera comparée aux runs précédents et aux tickets QA accessibles.

Une correspondance exacte réutilisera l'anomalie existante et ajoutera une observation au run courant. Une correspondance partielle sera signalée comme doublon potentiel nécessitant une décision. Seule une anomalie confirmée sans doublon sera proposée comme nouveau ticket.

### Artefacts Markdown et JSON par run

Le stockage proposé est `qa/runs/<runId>/` avec un index global maintenable. Chaque run contiendra au minimum : `scope.json`, `test-plan.md`, `test-results.json`, `anomalies.md`, `tickets/`, `summary.md` et `manifest.json`. Le JSON sera la source machine, le Markdown la vue QA lisible. Le manifest reliera les identifiants de feature, scénario, résultat, anomalie et ticket et enregistrera les versions des sources.

Les preuves seront des références vers des captures, logs ou observations expurgées. Les secrets, jetons, mots de passe, données personnelles et montants sensibles seront filtrés avant persistance. Les résultats non exécutés ne seront jamais comptés comme réussis.

### Politique de tickets en deux niveaux

Le run crée d'abord un ticket QA local sous `tickets/` avec le contenu attendu par l'équipe de développement. Un ticket ne sera promu dans `openspec/tickets.json` que lorsque son périmètre, son scope, son type, sa priorité et ses dépendances sont validés selon le workflow du dépôt. La promotion crée ensuite la branche dédiée et la PR éventuelle dans une étape séparée.

Cette décision évite qu'un run de recette crée des branches ou des changements applicatifs sans contrôle, tout en fournissant immédiatement un ticket exploitable. Elle distingue aussi une anomalie observée d'une demande produit encore ambiguë.

### Profils d'exécution et reprise

Le profil `smoke` couvre les prérequis, la connexion, la navigation, le tableau de bord et les permissions critiques. Le profil `full` reprend la matrice T-183. Un profil `targeted` sélectionne une ou plusieurs features et réutilise les préconditions nécessaires. Un run reprend les scénarios et anomalies connus par identifiant, mais recalcule les résultats et la couverture à partir de la version courante.

### Validations et garde-fous

L'agent refusera un run sans environnement déclaré, version observée, politique de données et compte rendu des prérequis. Une action destructive ou financière sera marquée comme guidée et demandera une confirmation de session. Une route non disponible bloquera les scénarios dépendants. Les schémas d'artefacts, la déduplication et les règles de comptage seront testés sur des fixtures avant toute validation sur environnement réel.

## Risks / Trade-offs

- [Risque] Le périmètre découvert depuis le code diverge du cahier métier. -> Mitigation : conserver les deux sources, afficher les écarts et produire une clarification plutôt qu'un scénario silencieusement inventé.
- [Risque] L'observation navigateur échoue ou n'est pas disponible. -> Mitigation : maintenir un mode guidé complet et marquer les cas non observés `Bloqué` ou `Non applicable`.
- [Risque] Une empreinte trop stricte crée des doublons ou une empreinte trop large fusionne deux défauts. -> Mitigation : utiliser une empreinte exacte et une file de doublons potentiels avec décision explicite.
- [Risque] Les preuves contiennent des secrets ou des données personnelles. -> Mitigation : redaction avant écriture, contrôle de manifest et interdiction des secrets dans les artefacts versionnés.
- [Risque] Une campagne financière modifie un jeu de données partagé. -> Mitigation : environnement dédié, préconditions vérifiées, opérations irréversibles guidées et procédure de réinitialisation documentée.
- [Risque] Le volume du plan rend le run complet trop long. -> Mitigation : profils smoke, full et targeted, avec conservation de la matrice exhaustive.

## Migration Plan

1. Valider T-183 comme référentiel disponible et réaliser l'inventaire des sources sans exécuter de mutation.
2. Implémenter les schémas, l'orchestrateur en mode dry-run et les fixtures de couverture et de déduplication.
3. Ajouter le mode guidé avec création d'un premier run sur environnement de recette dédié.
4. Ajouter un adaptateur d'observation navigateur seulement après validation de la politique de données et des preuves.
5. Tester un profil smoke, puis un profil full et comparer les rapports à une exécution manuelle de référence.
6. En cas de retour arrière, arrêter l'adaptateur et conserver les runs déjà produits. Les artefacts peuvent être archivés sans modifier l'application ni supprimer les tickets QA.

## Open Questions

- Quel emplacement partagé doit héberger `qa/runs/` et quelle politique de rétention doit s'appliquer aux preuves ?
- Quel environnement de recette et quel mécanisme de réinitialisation seront autorisés pour les campagnes financières ?
- Quel adaptateur navigateur est disponible dans l'hôte d'exécution, et quelles confirmations doivent rester manuelles ?
- La promotion d'un ticket QA vers le registre local doit-elle être manuelle ou réservée à un mode approuvé par le mainteneur ?
- Les anomalies de type clarification produit doivent-elles être suivies dans le même format que les tickets `fix` ou dans une file distincte ?
