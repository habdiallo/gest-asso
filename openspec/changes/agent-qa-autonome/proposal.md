## Why

T-183 fournit un plan manuel fonctionnel couvrant les parcours connus de Contribo, mais il ne définit pas encore un agent capable de reprendre ce référentiel, d'observer l'application et de produire un cycle QA complet et traçable à chaque exécution. Cette évolution transforme le plan de recette en campagne réutilisable, avec détection des doublons, distinction entre défaut confirmé et ambiguïté produit, et historique exploitable pour les régressions.

## What Changes

- Introduire un agent QA autonome qui découvre les features, routes, rôles, permissions, états métier et dépendances à partir des sources du projet et du plan T-183.
- Générer ou mettre à jour un plan de scénarios couvrant les parcours nominaux, limites, erreurs, validations, autorisations, transitions d'état, interactions entre features et risques de régression.
- Exécuter ou guider l'exécution manuelle dans un environnement déclaré, en conservant les préconditions, données, étapes, observations, preuves et verdicts `Réussi`, `Échoué`, `Bloqué` ou `Non applicable`.
- Comparer le comportement observé au comportement attendu sans inventer de règle métier lorsqu'une source est ambiguë.
- Classifier les anomalies par type, sévérité `Blocker`, `Critical`, `Major`, `Minor` ou `Trivial`, priorité, impact et niveau de confiance.
- Créer un ticket de correction exploitable pour chaque anomalie confirmée, avec reproduction, résultats attendu et observé, critères d'acceptation et tests de non-régression.
- Vérifier les artefacts et tickets déjà accessibles avant de créer une anomalie, afin d'éviter les doublons et de rattacher chaque résultat à la chaîne Feature, Scénario, Résultat, Anomalie, Ticket.
- Produire à chaque run les livrables de plan, résultats, anomalies, tickets et synthèse QA, en conservant l'historique et les zones non couvertes.
- Prévoir des profils de campagne smoke, complète et ciblée par feature, sans confondre les contrôles fonctionnels avec l'audit responsive hors périmètre de T-183.

## Capabilities

### New Capabilities

- `autonomous-qa-cycle`: orchestration d'un cycle QA manuel complet, depuis l'analyse de l'application jusqu'au rapport de synthèse et aux tickets de correction.

### Modified Capabilities

Aucune exigence existante n'est modifiée. Le plan `manual-functional-test-plan` de T-183 est consommé comme référentiel de couverture et reste la source des comportements fonctionnels déjà documentés.

## Impact

- Ticket local T-187, scope `infra`, type `feat`, branche `infra/feat-187-agent-qa-autonome`, dépendant de T-183, PR prévue vers `develop`.
- Futur outillage d'agent, format des artefacts QA, index des runs et mécanisme de déduplication dans les répertoires dédiés à définir en conception.
- Lecture des sources existantes : `contribo-front/src/app/features/`, `besoins/cahier-user-stories-mvp-association-v2.md`, `besoins/openapi.yaml`, les specs OpenSpec et le plan de T-183.
- Utilisation possible d'un navigateur ou d'une session d'environnement de recette pour l'observation manuelle. Aucun accès aux données de production ne doit être requis.
- Aucun changement de comportement métier, d'API ou de données de production n'est inclus dans cette proposition. Les éventuels tickets de correction issus d'un run seront des évolutions séparées avec leur propre scope et leur propre branche.
