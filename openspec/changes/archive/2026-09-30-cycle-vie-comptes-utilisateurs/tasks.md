## 1. Préparation du ticket

- [x] 1.1 [T-158] Résoudre T-158, vérifier la dépendance T-155, lire les règles backend/frontend et préparer la branche `fullstack/feat-158-cycle-vie-comptes` avant toute modification pour le ticket fullstack/feat/cycle-vie-comptes.
- [x] 1.2 [T-158] Confirmer la politique de mot de passe, le périmètre des comptes existants et les paramètres de bootstrap Docker pour le ticket fullstack/feat/cycle-vie-comptes sur `fullstack/feat-158-cycle-vie-comptes`.

## 2. Cycle de vie backend des comptes

- [x] 2.1 [T-158] Ajouter la migration `must_change_password` et `password_changed_at`, marquer les comptes existants et adapter les modèles et lectures de comptes pour le ticket fullstack/feat/cycle-vie-comptes sur `fullstack/feat-158-cycle-vie-comptes`.
- [x] 2.2 [T-158] Générer les secrets temporaires, retourner une réponse de création dédiée, stocker uniquement les hash et ajouter la régénération administrateur avec révocation pour le ticket fullstack/feat/cycle-vie-comptes sur `fullstack/feat-158-cycle-vie-comptes`.
- [x] 2.3 [T-158] Ajouter le changement de mot de passe, la politique serveur, la revendication de session limitée et le refus `PASSWORD_CHANGE_REQUIRED` des opérations métier pour le ticket fullstack/feat/cycle-vie-comptes sur `fullstack/feat-158-cycle-vie-comptes`.
- [x] 2.4 [T-158] Ajouter le bootstrap idempotent du premier administrateur après Flyway, avec secret Docker en fichier, configuration d'association et absence de réinitialisation au redémarrage pour le ticket fullstack/feat/cycle-vie-comptes sur `fullstack/feat-158-cycle-vie-comptes`.

## 3. Parcours frontend d'activation

- [x] 3.1 [T-158] Mettre à jour le contrat généré, le service de création de membre et la confirmation avec identifiant, secret temporaire, copie accessible et suppression de tout stockage persistant pour le ticket fullstack/feat/cycle-vie-comptes sur `fullstack/feat-158-cycle-vie-comptes`.
- [x] 3.2 [T-158] Ajouter la route lazy, le formulaire à deux saisies, le garde de session limitée et la transition vers la session normale après changement pour le ticket fullstack/feat/cycle-vie-comptes sur `fullstack/feat-158-cycle-vie-comptes`.
- [x] 3.3 [T-158] Ajouter l'action Administrateur de régénération des secrets dans `roles-users`, les messages d'erreur et les handlers mock associés pour le ticket fullstack/feat/cycle-vie-comptes sur `fullstack/feat-158-cycle-vie-comptes`.

## 4. Vérification et livraison

- [x] 4.1 [T-158] Ajouter les tests backend de migration, création, changement obligatoire, session limitée, reset, bootstrap idempotent, permissions et absence de fuite de secret pour le ticket fullstack/feat/cycle-vie-comptes sur `fullstack/feat-158-cycle-vie-comptes`.
- [x] 4.2 [T-158] Ajouter les tests frontend de copie, navigation obligatoire, validation des deux saisies, déconnexion et régénération, puis documenter les secrets Portainer et la procédure de premier démarrage pour le ticket fullstack/feat/cycle-vie-comptes sur `fullstack/feat-158-cycle-vie-comptes`.
- [x] 4.3 [T-158] Exécuter les validations OpenAPI, génération client, tests backend/frontend, build, OpenSpec et contrôles de diff, puis préparer une PR vers `develop` avec la traçabilité T-158 pour le ticket fullstack/feat/cycle-vie-comptes sur `fullstack/feat-158-cycle-vie-comptes`.
