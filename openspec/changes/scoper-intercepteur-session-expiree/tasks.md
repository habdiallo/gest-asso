## 1. Ticket et branche

- [x] 1.1 Résoudre `node scripts/tickets.mjs resolve T-182 --json`, lire les prérequis et confirmer la branche `front/fix-182-scoper-intercepteur-session-expiree`. [T-182]
- [x] 1.2 Exécuter `node scripts/tickets.mjs verify T-182` avant toute modification de code applicatif. [T-182]

## 2. Portée de l'intercepteur

- [x] 2.1 Identifier dans le contrat et le frontend les appels explicites de vérification d'authentification ou de session, en conservant l'exclusion de `POST /auth/login`. [T-182]
- [x] 2.2 Modifier `session-expired.interceptor.ts` pour limiter l'effacement de session et la navigation vers `/login` aux `401` issus de ces appels identifiés. [T-182]
- [x] 2.3 Vérifier que les `401` d'endpoints métier sont propagés sans effacement de session ni navigation globale. [T-182]
- [x] 2.4 Préserver la redirection `PASSWORD_CHANGE_REQUIRED` sur `403` et documenter la règle de portée dans le socle de session si nécessaire. [T-182]

## 3. Tests frontend

- [x] 3.1 Mettre à jour les tests colocalisés de `session-expired.interceptor.ts` pour couvrir la validation de session qui invalide la session. [T-182]
- [x] 3.2 Ajouter un test de régression pour un `401` de `/members` ou `/dashboard` qui conserve la session et ne navigue pas vers `/login`. [T-182]
- [x] 3.3 Conserver les tests du login en `401`, du `403` d'accès refusé et du `403 PASSWORD_CHANGE_REQUIRED`. [T-182]

## 4. Validation et livraison

- [x] 4.1 Exécuter les tests frontend ciblés, le build frontend et les validations pertinentes du dépôt. [T-182] (tests et build réussis ; le contrôle Prettier global signale des fichiers préexistants hors périmètre)
- [x] 4.2 Mettre à jour les cases de ce fichier pour les seules tâches réellement réalisées. [T-182]
- [ ] 4.3 Préparer une PR de `front/fix-182-scoper-intercepteur-session-expiree` vers `develop` avec le modèle du dépôt, sans pousser ni fusionner sans demande explicite. [T-182]
