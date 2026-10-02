## Context

Rendre explicite le rôle distinct du cahier fonctionnel et d OpenAPI. Le ticket est isolé pour permettre un worktree et une PR dédiés.

## Goals / Non-Goals

**Goals:**

- Traiter le problème identifié et laisser une documentation vérifiable.
- Préserver les frontières d architecture et les contrats hors périmètre.

**Non-Goals:**

- Ne pas mélanger les autres problèmes de l audit dans cette branche.
- Ne pas modifier main ou develop directement.

## Decisions

Le cahier métier reste la référence des parcours, acteurs et invariants. Le
fichier `contribo-back/src/main/resources/contribo-api.yml` reste la référence de la forme des échanges HTTP.
Les specs OpenSpec relient une décision aux deux documents lorsque le besoin a
un impact d'interface. Aucun client ou modèle généré ne devient une source de
vérité indépendante.

La documentation de référence sera reliée depuis la racine `besoins/`, le
frontend et le backend. Elle décrira aussi l'ordre de validation et de génération
pour que les deux consommateurs utilisent le même contrat et des versions de
générateur alignées.

## Risks / Trade-offs

- Une migration peut exposer des dépendances implicites. Les tests, la documentation et une procédure de retour arrière doivent les rendre visibles.

## Migration Plan

Vérifier le ticket et la présence du contrat partagé, documenter les frontières,
exécuter les validations de documentation et de génération disponibles, mettre à
jour les tâches T-174, puis préparer une PR vers develop. Le contrat OpenAPI et
le code applicatif restent inchangés dans ce ticket.
