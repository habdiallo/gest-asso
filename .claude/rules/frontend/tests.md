---
paths:
  - "contribo-front/src/**"
  - "contribo-front/tsconfig.spec.json"
  - "contribo-front/angular.json"
  - "contribo-front/package.json"
---

# Tests frontend — Contribo

## Outillage réel

- Vitest et jsdom sont déclarés ; builder Angular `@angular/build:unit-test`.
- Depuis `contribo-front/` : `npm test -- --watch=false` pour une exécution non interactive.
- Aucun outil E2E ni module de traduction de test n'est configuré. Le client API se génère explicitement, sans hook `pretest`.
- Ne pas ajouter Karma, Jasmine ou un runner pour reproduire l'ancien projet.

## Stratégie

- Tester le comportement observable : DOM, actions, sorties, navigation et API publique des services/pipes/guards/intercepteurs.
- Chaque nouveau composant/service avec comportement possède un `.spec.ts`, sans test vide imposé aux interfaces/constantes/configurations sans logique.
- Couvrir le parcours nominal et les cas limites/erreurs pertinents de l'US ou règle métier.
- Choisir test isolé ou avec enfants selon la responsabilité ; ne pas mocker systématiquement tous les enfants et injections.
- Ne pas utiliser de schéma permissif pour dissimuler une erreur de template.
- Mocker les dépendances externes nécessaires, pas l'implémentation interne testée.
- Sélecteurs sémantiques et stables, ou `data-testid` pour les éléments ambigus. Éviter classes de style, `nth-child` et sélecteurs fragiles.

## Fixtures et assertions

- Colocaliser les fixtures propres à une feature ; mutualiser seulement celles réellement partagées.
- Données fictives conformes à OpenAPI : UUID, dates typées, entiers GNF et enums exactes.
- Ne pas utiliser de vraies données personnelles/financières.
- Vérifier un attendu indépendant : ne pas reproduire le calcul testé pour fabriquer l'attendu.
- Tester l'intégration du client généré et la logique applicative, pas son implémentation générée.

## Couverture propre au MVP

- Chargement, état vide, erreur, succès et conservation de la saisie en cas d'échec.
- Menus/actions selon rôle/autorisation Opérateur, jamais selon fonction associative.
- Champs structurants verrouillés ; opérations de statut réservées à l'Administrateur.
- Paiements partiels, refus du sur-paiement et ressources clôturées, selon les réponses API.
- Contributions indépendantes des cotisations et agrégats officiels de contributeurs uniques.
- Formats GNF complet/condensé, seuils et dates sans décalage de jour.
- Clavier/focus des dialogues, onglets et contrôles ; contraste et responsive nécessitent aussi un navigateur.

## Avant livraison

- Exécuter tests pertinents et build en proportion du changement.
- Ne pas annoncer un test, audit ou une commande réussis sans exécution.
- Si un outil manque ou bloque, préciser ce qui n'a pas pu être vérifié.
