## Context

Publier la couverture, les tickets, les dépendances et les décisions résiduelles. Le ticket est isolé pour permettre un worktree et une PR dédiés.

## Goals / Non-Goals

**Goals:**

- Traiter le problème identifié et laisser une documentation vérifiable.
- Préserver les frontières d architecture et les contrats hors périmètre.

**Non-Goals:**

- Ne pas mélanger les autres problèmes de l audit dans cette branche.
- Ne pas modifier main ou develop directement.

## Decisions

Implémenter le plus petit découpage cohérent, avec une validation automatisée lorsque le sujet est vérifiable. Les changements dépendants attendent les tickets T-164, T-165, T-166, T-167, T-168, T-169, T-170, T-171, T-172, T-173, T-174, T-175, T-176, T-177, T-178.

## Risks / Trade-offs

- Une migration peut exposer des dépendances implicites. Les tests, la documentation et une procédure de retour arrière doivent les rendre visibles.

## Migration Plan

Vérifier le ticket, implémenter uniquement son périmètre, exécuter les validations, mettre à jour les tâches, puis préparer une PR vers develop.
