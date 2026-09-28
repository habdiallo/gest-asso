## 1. Préparation du ticket

- [ ] 1.1 [T-157] Résoudre T-157, vérifier la dépendance T-156, lire les règles CI et préparer la branche `infra/chore-157-promouvoir-images-release` avant toute modification.
- [ ] 1.2 [T-157] Définir le format des tags candidates, la conservation des digests backend/frontend et la checklist de validation staging pour le ticket infra/chore/promouvoir-images-release sur la branche `infra/chore-157-promouvoir-images-release`.

## 2. Pipeline des images

- [ ] 2.1 [T-157] Adapter le workflow GitHub Actions pour déclencher le build push sur `release/vX.Y.Z` et `hotfix/*`, tout en conservant les validations sans publication sur les pull requests, pour le ticket infra/chore/promouvoir-images-release sur la branche `infra/chore-157-promouvoir-images-release`.
- [ ] 2.2 [T-157] Publier les images backend et frontend candidates avec des tags traçables, exposer leurs digests dans le résumé du workflow et bloquer la publication si une validation échoue, pour le ticket infra/chore/promouvoir-images-release sur la branche `infra/chore-157-promouvoir-images-release`.
- [ ] 2.3 [T-157] Supprimer le rebuild d'images déclenché par le push vers `main`, préserver la publication d'intégration sur `develop` et garantir que la production réutilise les images candidates, pour le ticket infra/chore/promouvoir-images-release sur la branche `infra/chore-157-promouvoir-images-release`.
- [ ] 2.4 [T-157] Vérifier que les tags de release source et les événements de pull request ne publient jamais une image mutable ou non validée, pour le ticket infra/chore/promouvoir-images-release sur la branche `infra/chore-157-promouvoir-images-release`.

## 3. Staging et exploitation

- [ ] 3.1 [T-157] Documenter le déploiement staging avec les deux digests issus du même run CI dans la documentation Portainer et le dépôt `gest-asso-deploiement`, pour le ticket infra/chore/promouvoir-images-release sur la branche `infra/chore-157-promouvoir-images-release`.
- [ ] 3.2 [T-157] Documenter la promotion manuelle vers la production, la vérification post-déploiement et le rollback par paire de digests, pour le ticket infra/chore/promouvoir-images-release sur la branche `infra/chore-157-promouvoir-images-release`.

## 4. Vérification et livraison

- [ ] 4.1 [T-157] Adapter les tests de conventions et de pipeline pour couvrir les branches release/hotfix, l'absence de push sur pull request et l'absence de build d'image sur `main`, pour le ticket infra/chore/promouvoir-images-release sur la branche `infra/chore-157-promouvoir-images-release`.
- [ ] 4.2 [T-157] Exécuter les validations YAML, OpenSpec, catalogue des tickets, composition Docker, tests backend/frontend et contrôles de diff, pour le ticket infra/chore/promouvoir-images-release sur la branche `infra/chore-157-promouvoir-images-release`.
- [ ] 4.3 [T-157] Mettre à jour les artefacts OpenSpec, préparer la pull request vers `develop`, puis consigner les limites et l'étape de validation staging avant toute promotion vers `main`, pour le ticket infra/chore/promouvoir-images-release sur la branche `infra/chore-157-promouvoir-images-release`.
