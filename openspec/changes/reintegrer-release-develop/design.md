## Contexte

`main` et `develop` ont divergé après la release `v0.1.0`. La branche `main`
contient T-154, T-156 et l'intégration de la release T-155, tandis que `develop`
contient les évolutions livrées ensuite.

## Décision

Créer une branche de ticket depuis `develop`, puis y fusionner `origin/main` avec
un commit de merge explicite. La PR cible `develop` et conserve les deux lignes
d'historique. Les conflits éventuels sont résolus en conservant les changements
fonctionnels récents de `develop` et les corrections de production de `main`.

La branche de correction utilise le format de ticket accepté par le contrôle CI :
`infra/chore-162-reintegrer-main-develop` vers `develop`.

## Validation

- Le registre des tickets reste cohérent avec `T-162`.
- Le contrôle des conventions accepte la branche vers `develop`.
- Les tests du dépôt et les contrôles OpenSpec passent.
- La comparaison Git confirme que `main` est désormais dans l'ascendance de la
  branche d'intégration après fusion de la PR.

## Retour arrière

La PR peut être fermée avant fusion. Après fusion, un revert du commit de merge
permet de restaurer l'état précédent de `develop`, sous validation du mainteneur.
