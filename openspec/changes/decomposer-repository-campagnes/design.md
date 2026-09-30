## Context

Séparer campagnes, échéances et règlements par responsabilité. Le ticket est isolé pour permettre un worktree et une PR dédiés.

## Goals / Non-Goals

**Goals:**

- Traiter le problème identifié et laisser une documentation vérifiable.
- Préserver les frontières d architecture et les contrats hors périmètre.

**Non-Goals:**

- Ne pas mélanger les autres problèmes de l audit dans cette branche.
- Ne pas modifier main ou develop directement.

## Decisions

Le service applicatif dépend désormais de trois ports distincts :
`CampaignCatalogRepository` pour le cycle de vie des campagnes,
`CampaignDueRepository` pour les échéances et `CampaignPaymentRepository` pour
les règlements. Chaque port possède un adaptateur JDBC dédié.

Pour limiter le risque de régression, ces adaptateurs délèguent encore leurs
opérations au composant JDBC existant, qui reste la frontière SQL partagée de
cette étape. Le dépôt monolithique n'est donc plus une dépendance de service,
et pourra être réduit ou supprimé lors d'une étape ultérieure sans modifier
les cas d'usage.

## Risks / Trade-offs

- La délégation conserve temporairement un composant SQL partagé. Elle évite de
  dupliquer les requêtes et de modifier les transactions dans ce ticket, mais
  laisse une seconde étape pour déplacer le SQL dans chaque adaptateur.
- Une migration peut exposer des dépendances implicites. Les tests, la
  documentation et une procédure de retour arrière doivent les rendre visibles.

## Migration Plan

Vérifier le ticket, implémenter uniquement son périmètre, exécuter les validations, mettre à jour les tâches, puis préparer une PR vers develop.
