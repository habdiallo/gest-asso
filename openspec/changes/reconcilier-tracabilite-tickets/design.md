## Context

Le registre local s'appuie sur les cases des tâches OpenSpec pour déterminer si
un ticket dépendant peut démarrer. Une PR fusionnée doit donc laisser sa tâche
de livraison cochée dans la branche d'intégration.

## Decisions

- Cocher uniquement les tâches de livraison des tickets déjà fusionnés, T-164,
  T-165, T-167, T-169 et T-175.
- Ne pas modifier les implémentations ni les tâches fonctionnelles de ces
  tickets.
- Vérifier le registre et les dépendances depuis la branche de maintenance,
  puis reporter cette base dans les worktrees de la vague 1.

## Validation

Le contrôle `node scripts/tickets.mjs check` doit rester valide et les tickets
T-166, T-171, T-174 et T-177 doivent pouvoir être vérifiés après intégration de
ce changement.
