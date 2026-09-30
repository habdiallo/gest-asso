## Context

Le workflow `.github/workflows/backend-frontend-images.yml` exécute les tests
sur les pull requests et reconstruit les images lors des pushes sur `develop`,
`main` et les tags de version. Les builds de pull request ne sont pas publiés,
alors que le push sur `main` reconstruit et publie les images après le merge.

Le dépôt `gest-asso-deploiement` fournit maintenant une stack Portainer sans
symlink. Portainer ne construit pas les images ; il doit recevoir deux
références d'images cohérentes et idéalement immuables.

La contrainte principale est de conserver un workflow simple pour un mainteneur
seul, sans déployer automatiquement en production ni introduire un orchestrateur
supplémentaire.

## Goals / Non-Goals

**Goals:**

- Construire et publier une candidate depuis une branche `release/vX.Y.Z` ou
  `hotfix/<description>` après validation des tests.
- Exposer les tags et digests backend/frontend nécessaires au staging.
- Utiliser en production les mêmes images que celles validées en staging.
- Supprimer le rebuild d'images déclenché par le push de merge vers `main`.
- Permettre un rollback en remplaçant les deux digests dans Portainer.
- Documenter les étapes manuelles restantes et les validations attendues.

**Non-Goals:**

- Déployer automatiquement une stack Portainer depuis GitHub Actions.
- Modifier le code métier, l'API, la base de données ou l'authentification.
- Ajouter une registry ou un orchestrateur en dehors de GHCR et Portainer.
- Automatiser la mise à jour du dépôt `gest-asso-deploiement` dans cette première
  version.

## Decisions

### Construire sur release, pas sur main

Les pushes sur les branches `release/vX.Y.Z` et `hotfix/*` déclenchent les
tests puis un build push des deux images. Chaque candidate reçoit un tag
contenant la branche de release et le SHA source, et son digest est publié dans
le résumé du workflow. Les événements `pull_request` continuent à vérifier le
code sans pousser dans GHCR.

L'alternative consistant à continuer à construire sur `main` est rejetée : elle
reconstruit l'artefact après la validation et peut produire une image différente.

### Promouvoir par digest sans rebuild

Après validation staging, Portainer reçoit les digests de la candidate. Le push
vers `main` ne déclenche plus de build d'image. La promotion en production est
une action manuelle dans Portainer, avec les deux digests issus du même run CI.

Une future automatisation pourrait retagger ou copier les mêmes manifestes, mais
elle n'est pas nécessaire pour cette livraison et augmenterait la surface
d'exploitation.

### Staging manuel et explicite

Le mainteneur déploie la candidate dans un environnement staging en renseignant
`BACKEND_IMAGE` et `FRONTEND_IMAGE` dans la stack du dépôt de déploiement. La
validation utilise une checklist de smoke tests et conserve le run CI ainsi que
les digests. La PR vers `main` reste soumise à une validation humaine explicite.

### Développement indépendant

Les merges dans `develop` continuent à publier les images d'intégration avec un
tag de branche et un tag SHA. Ces images servent à l'environnement d'intégration
et ne sont jamais promues en production.

## Risks / Trade-offs

- [Risque] Une mauvaise copie de digest dans Portainer peut associer des
  versions backend et frontend différentes. -> La checklist exige deux digests
  issus du même run et la documentation affiche les deux références ensemble.
- [Risque] Une validation staging oubliée permettrait un merge non testé. -> La
  PR de release contient une checklist obligatoire et le mainteneur ne fusionne
  qu'après le smoke test documenté.
- [Risque] Les tags candidates peuvent être nettoyés trop tôt dans GHCR. -> Le
  digest est conservé et la politique de rétention doit exclure les candidates
  encore utilisées.
- [Trade-off] La promotion manuelle n'est pas entièrement GitOps. -> Elle évite
  une automatisation complexe pour un projet solo ; l'automatisation pourra être
  ajoutée dans un ticket séparé.

## Migration Plan

1. Adapter le workflow pour publier les candidates release et hotfix après les
   tests, et ne plus construire sur `main`.
2. Mettre à jour la documentation de release, staging et Portainer.
3. Créer une candidate de test, la déployer en staging et vérifier les smoke
   tests.
4. Fusionner une release validée vers `main` sans rebuild d'image.
5. Déployer en production avec les mêmes digests, puis conserver les digests
   précédents pour le rollback.

En cas de problème, revenir au workflow précédent et redeployer les deux images
de la dernière release connue. Le code applicatif et les données persistantes ne
sont pas modifiés par cette migration.

## Open Questions

- Le nom exact de l'environnement staging et ses réseaux Docker doivent-ils être
  ajoutés à la documentation d'exploitation ?
- La protection de branche GitHub doit-elle exiger une validation staging
  formalisée avant toute fusion de release ?
