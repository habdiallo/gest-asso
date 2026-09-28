# Activer le flux release

## Problème

Le dépôt prépare un flux avec `develop` pour l'intégration et `main` pour la
production, mais le contrôle CI de `main` refuse encore les branches
`release/vX.Y.Z` et `hotfix/*`. La première release ne peut donc pas passer la
validation de conventions sans contourner le contrôle.

## Résultat attendu

Le contrôle de conventions accepte les branches de ticket vers `develop` et les
branches `release/vX.Y.Z` ou `hotfix/*` vers `main`. Les règles restent strictes
sur les noms et refusent les autres combinaisons.

## Périmètre

- Mise à jour du workflow GitHub de conventions.
- Mise à jour de ses tests de non-régression.
- Traçabilité OpenSpec et ticket local T-156.
