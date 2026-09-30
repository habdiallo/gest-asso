## Context

Découpler les services, ports et repositories des DTO OpenAPI. Le ticket est isolé pour permettre un worktree et une PR dédiés.

## Goals / Non-Goals

**Goals:**

- Traiter le problème identifié et laisser une documentation vérifiable.
- Préserver les frontières d architecture et les contrats hors périmètre.

**Non-Goals:**

- Ne pas mélanger les autres problèmes de l audit dans cette branche.
- Ne pas modifier main ou develop directement.

## Decisions

Implémenter le plus petit découpage cohérent, avec une validation automatisée lorsque le sujet est vérifiable. Les changements dépendants attendent les tickets T-167.

## Implementation scope

La première tranche migre les modèles et ports communs aux comptes, membres et
catégories. Les snapshots issus de la persistance vivent dans `domain/`, les
repositories JDBC et les ports applicatifs les utilisent directement, et les
valeurs de rôle, de statut membre et de devise sont définies hors du contrat
généré. Les DTO OpenAPI restent limités aux adapters REST et aux sorties de
services non encore migrées afin de préserver le contrat existant.

Les agrégats campagnes, échéances, règlements, cagnottes et contributions ne
sont pas redécoupés ici. Leur migration doit rester compatible avec T-173 et les
changes métier déjà livrés.

## Risks / Trade-offs

- Une migration peut exposer des dépendances implicites. Les tests, la documentation et une procédure de retour arrière doivent les rendre visibles.

## Migration Plan

Vérifier le ticket, implémenter uniquement son périmètre, exécuter les validations, mettre à jour les tâches, puis préparer une PR vers develop.
