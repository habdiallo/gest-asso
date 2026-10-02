## 1. T-190, bloquer les sessions limitées

- [x] 1.1 [T-190] Résoudre T-190, confirmer `front/fix-190-bloquer-session-limitee-routes-metier` et exécuter `node scripts/tickets.mjs verify T-190` avant le code.
- [x] 1.2 [T-190] Modifier la garde de `/mon-espace` pour refuser une session portant `mustChangePassword=true` et rediriger vers `/changer-mot-de-passe`.
- [x] 1.3 [T-190] Ajouter le test de non-régression de la garde pour une session limitée et conserver l'accès pour une session active.
- [x] 1.4 [T-190] Exécuter les tests frontend ciblés, la suite frontend et le build, puis relire le diff.
- [x] 1.5 [T-190] Préparer la PR `front/fix-190-bloquer-session-limitee-routes-metier` vers `develop` avec les validations réelles.

## 2. T-191, traduire l'espace personnel

- [x] 2.1 [T-191] Résoudre T-191, confirmer `front/fix-191-traduire-espace-personnel-membre` et exécuter `node scripts/tickets.mjs verify T-191` avant le code.
- [x] 2.2 [T-191] Ajouter les traductions françaises des clés `memberSpace.profile.role` et `memberSpace.profile.personalAccessTitle`.
- [x] 2.3 [T-191] Ajouter ou compléter le test du template du profil pour vérifier les libellés visibles et l'absence de clés brutes.
- [x] 2.4 [T-191] Exécuter les tests frontend ciblés, la suite frontend et le build, puis préparer la PR vers `develop`.

## 3. T-192, publier le suivi QA

- [x] 3.1 [T-192] Résoudre T-192, confirmer `infra/test-192-suivre-campagne-qa-20261002` et exécuter `node scripts/tickets.mjs verify T-192` avant la publication des artefacts.
- [x] 3.2 [T-192] Ajouter les runs QA finaux, leurs anomalies et tickets locaux, sans secret, mot de passe, cookie ou token.
- [x] 3.3 [T-192] Ajouter un index de suivi indiquant les campagnes, compteurs, tickets correctifs, blocages et prochaine revalidation.
- [x] 3.4 [T-192] Exécuter les contrôles QA/OpenSpec et préparer la PR `infra/test-192-suivre-campagne-qa-20261002` vers `develop`.
