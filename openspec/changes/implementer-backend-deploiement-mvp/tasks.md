## 1. Socle backend et données

- [x] 1.1 [T-143] Sur `back/chore-143-socle-backend-api`, créer le socle backend, vérifier la branche et les prérequis de `T-142`, brancher la validation OpenAPI et ajouter un démarrage minimal testable sans logique métier.
- [x] 1.2 [T-144] Sur `back/chore-144-persistance-mvp`, ajouter la configuration de persistance retenue, les migrations initiales et le socle de tests d'intégration, après intégration de `T-143`.

## 2. Authentification et domaines MVP

- [x] 2.1 [T-145] Sur `back/feat-145-authentification-mvp`, implémenter le login, le bearer token, l'utilisateur courant et les refus prévus par le contrat, après `T-144`.
- [ ] 2.2 [T-146] Sur `back/feat-146-api-membres`, implémenter les opérations MVP membres, catégories de revenu et comptes couvertes par le contrat, avec règles et autorisations issues du projet actuel uniquement.
- [ ] 2.3 [T-147] Sur `back/feat-147-api-campagnes-paiements`, implémenter les opérations campagnes, cotisations et règlements du MVP avec leurs transitions et erreurs contractuelles.
- [ ] 2.4 [T-148] Sur `back/feat-148-api-cagnottes-contributions`, implémenter les opérations cagnottes et contributions du MVP, sans reprendre les événements ou règles de la référence qui ne figurent pas dans Contribo.

## 3. Déploiement et publication

- [x] 3.1 [T-149] Sur `infra/chore-149-deploiement-local`, créer les Dockerfiles, le Compose local, le routage `/api/v1`, les healthchecks et la configuration sans secret pour le développement.
- [x] 3.2 [T-150] Sur `infra/chore-150-ci-images`, ajouter les validations CI et la publication versionnée des images backend et frontend après succès des contrôles applicatifs et conteneurs.
- [ ] 3.3 [T-151] Sur `infra/chore-151-deploiement-integration`, préparer l'environnement d'intégration, les secrets externes, les réseaux minimaux, le déploiement par tag immuable et le rollback.

## 4. Livraison

- [x] 4.0 [T-152] Publier le découpage des tickets backend et déploiement, vérifier le registre et préparer la PR de planification vers `main`, sans implémenter de code applicatif.
- [x] 4.1 [T-143] Exécuter les validations de `T-143`, relire le diff ciblé, pousser uniquement `back/chore-143-socle-backend-api` et ouvrir sa PR vers `main`, sans fusion ni auto-merge.
- [x] 4.2 [T-144] Exécuter les validations de `T-144`, relire le diff ciblé, pousser uniquement `back/chore-144-persistance-mvp` et ouvrir sa PR vers `main`, sans fusion ni auto-merge.
- [x] 4.3 [T-145] Exécuter les validations de `T-145`, relire le diff ciblé, pousser uniquement `back/feat-145-authentification-mvp` et ouvrir sa PR vers `main`, sans fusion ni auto-merge.
- [ ] 4.4 [T-146] Exécuter les validations de `T-146`, relire le diff ciblé, pousser uniquement `back/feat-146-api-membres` et ouvrir sa PR vers `main`, sans fusion ni auto-merge.
- [ ] 4.5 [T-147] Exécuter les validations de `T-147`, relire le diff ciblé, pousser uniquement `back/feat-147-api-campagnes-paiements` et ouvrir sa PR vers `main`, sans fusion ni auto-merge.
- [ ] 4.6 [T-148] Exécuter les validations de `T-148`, relire le diff ciblé, pousser uniquement `back/feat-148-api-cagnottes-contributions` et ouvrir sa PR vers `main`, sans fusion ni auto-merge.
- [x] 4.7 [T-149] Exécuter les validations de `T-149`, relire le diff ciblé, pousser uniquement `infra/chore-149-deploiement-local` et ouvrir sa PR vers `main`, sans fusion ni auto-merge.
- [x] 4.8 [T-150] Exécuter les validations de `T-150`, relire le diff ciblé, pousser uniquement `infra/chore-150-ci-images` et ouvrir sa PR vers `main`, sans fusion ni auto-merge.
- [ ] 4.9 [T-151] Exécuter les validations de `T-151`, relire le diff ciblé, pousser uniquement `infra/chore-151-deploiement-integration` et ouvrir sa PR vers `main`, sans fusion ni auto-merge.
