## Context

Introduire des façades propres aux features sans créer de DTO concurrent. Le ticket est isolé pour permettre un worktree et une PR dédiés.

## Goals / Non-Goals

**Goals:**

- Traiter le problème identifié et laisser une documentation vérifiable.
- Préserver les frontières d architecture et les contrats hors périmètre.

**Non-Goals:**

- Ne pas mélanger les autres problèmes de l audit dans cette branche.
- Ne pas modifier main ou develop directement.

## Decisions

Implémenter le plus petit découpage cohérent, avec une validation automatisée lorsque le sujet est vérifiable. `core/api/index.ts` devient la frontière stable de l'application : lui seul réexporte le client généré depuis `generated/`. Les features, le socle, les composants partagés et les mocks importent `@core/api`, sans créer de DTO concurrent ni de client HTTP manuel. Les changements dépendants T-164 et T-166 ont déjà stabilisé le contrat et la sortie générée.

## Risks / Trade-offs

- Une migration peut exposer des dépendances implicites. Les tests, la documentation et une procédure de retour arrière doivent les rendre visibles.

## Migration Plan

Vérifier le ticket, implémenter uniquement son périmètre, exécuter les validations, mettre à jour les tâches, puis préparer une PR vers develop.
