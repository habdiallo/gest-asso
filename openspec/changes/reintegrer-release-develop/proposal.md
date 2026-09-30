## Pourquoi

La release `v0.1.0` a été fusionnée dans `main`, avec les changements de sécurité
de production et d'activation du flux release. Ces changements ne sont pas dans
l'ascendance de `develop`, qui a ensuite reçu T-157, T-158 et T-159.

Cet écart fait diverger les branches d'intégration et de production. Une prochaine
release créée depuis `develop` pourrait donc perdre des corrections déjà livrées
sur `main`.

## Résultat attendu

- Réintégrer l'état de `main` dans `develop` par une PR dédiée vers `develop`.
- Préserver les changements déjà présents sur `develop`.
- Conserver une trace Git de la réintégration, sans recopier les commits à la main.
- Vérifier que les conventions autorisent la branche de correction vers `develop`.

## Hors périmètre

- Aucun nouveau changement fonctionnel.
- Aucune fusion directe dans `main` ou `develop`.
- Aucun déploiement ou modification de l'infrastructure applicative.
