## Context

Factoriser Nginx, healthchecks et nommage des variables. Le ticket est isolé pour permettre un worktree et une PR dédiés.

## Goals / Non-Goals

**Goals:**

- Traiter le problème identifié et laisser une documentation vérifiable.
- Préserver les frontières d architecture et les contrats hors périmètre.

**Non-Goals:**

- Ne pas mélanger les autres problèmes de l audit dans cette branche.
- Ne pas modifier main ou develop directement.

## Decisions

Implémenter le plus petit découpage cohérent, avec une validation automatisée lorsque le sujet est vérifiable. Les routes API, le fallback SPA et les limites de débit sont placés dans des includes Nginx communs, stockés hors de `conf.d` afin de ne pas être chargés automatiquement à un mauvais niveau de configuration. Les différences de transport propres à la production restent dans `nginx.conf`.

## Risks / Trade-offs

- Une migration peut exposer des dépendances implicites. Les tests, la documentation et une procédure de retour arrière doivent les rendre visibles.

## Migration Plan

Vérifier le ticket, implémenter uniquement son périmètre, exécuter les validations, mettre à jour les tâches, puis préparer une PR vers develop.
