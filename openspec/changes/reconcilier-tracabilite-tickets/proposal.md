## Why

Plusieurs tickets fusionnés, notamment T-164, T-165, T-167, T-169 et T-175,
ont conservé des tâches de livraison décochées dans `develop`. Le contrôle des
dépendances refuse alors à tort les tickets qui peuvent commencer.

## What Changes

- Refléter dans les tâches OpenSpec que les PR déjà fusionnées ont été préparées.
- Rendre la vérification des dépendances cohérente avec l'état d'intégration.
- Documenter la règle de réconciliation avant le lancement d'une vague.

## Impact

Scope documentation et workflow OpenSpec. Aucun code applicatif n'est modifié.
