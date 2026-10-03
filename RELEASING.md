# Flux de branches et releases

## Rôles des branches

- `main` représente la production. Elle reçoit uniquement une release ou un hotfix validé par PR.
- `develop` représente l'intégration. Les branches de ticket sont fusionnées ici après revue.
- `release/vX.Y.Z` est créée depuis `develop` pour stabiliser une version avant sa livraison.
- `hotfix/<description>` est créée depuis `main` pour une correction urgente.

Le mainteneur doit créer `develop` une fois depuis `main`, puis protéger `main` et
`develop` dans GitHub. Les pushes directs sur ces deux branches restent interdits.

## Développement et release

1. Résoudre le ticket et créer sa branche depuis `origin/develop`.
2. Ouvrir la PR du ticket vers `develop`.
3. Créer `release/vX.Y.Z` depuis `develop` quand le périmètre est prêt.
4. Corriger uniquement les problèmes de stabilisation sur la branche release.
5. Ouvrir la PR de release vers `main`, puis la fusionner après validation.
6. Créer le tag `vX.Y.Z` sur le commit de production et réintégrer la release dans `develop`.

Une branche release ne remplace pas les PR de ticket et ne doit pas recevoir de
nouvelles fonctionnalités non présentes dans `develop`.

## Images et Portainer

La CI valide les tests sur les PR vers `develop` et `main`. Un push sur `develop`
publie les deux images GHCR avec `latest-int` et `sha-<commit>`. Un push sur
`main` publie `latest` et `sha-<commit>`. Un tag `vX.Y.Z` publie les tags semver
correspondants et le SHA du commit.

Portainer utilise une paire cohérente de références `BACKEND_IMAGE` et
`FRONTEND_IMAGE`, idéalement les deux digests publiés par le même run CI. Pour
revenir en arrière, remplacer les deux références par la paire précédente et
redéployer la stack.

## Hotfix

1. Créer `hotfix/<description>` depuis `main`.
2. Ouvrir une PR vers `main` et attendre les validations.
3. Après fusion, réintégrer le hotfix dans `develop`.
