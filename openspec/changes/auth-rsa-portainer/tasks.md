## 1. Authentification RSA

- [x] 1.1 [T-155] Résoudre T-155, créer `fullstack/chore-155-auth-rsa-portainer` depuis `origin/main`, lire les règles backend et vérifier les prérequis avant toute modification applicative.
- [x] 1.2 [T-155] Ajouter le chargement typé des clés RSA PEM depuis classpath et fichier, remplacer la configuration `JWT_SECRET` et documenter la génération locale sans committer de clé.
- [x] 1.3 [T-155] Remplacer l'émission et la validation HMAC par JWT RS256 avec les composants Spring Security adaptés, conserver le sujet UUID, l'expiration, le Bearer et les erreurs 401.
- [x] 1.4 [T-155] Adapter les tests backend pour générer ou charger une paire RSA contrôlée, couvrir login, requête authentifiée, expiration, signature invalide et configuration absente.

## 2. Intégration et Portainer

- [x] 2.1 [T-155] Remplacer les références `JWT_SECRET` dans les compositions, l'entrypoint, les exemples d'environnement et la documentation d'intégration par des secrets RSA fichiers.
- [x] 2.2 [T-155] Ajouter la stack Portainer backend/frontend avec images GHCR versionnées, réseaux externes, réseau interne, healthchecks et secrets RSA non exposés.
- [x] 2.3 [T-155] Documenter les prérequis Portainer, la génération d'une paire par environnement, les variables, le déploiement, le tag d'intégration et le rollback.

## 3. CI et publication

- [x] 3.1 [T-155] Adapter le workflow GitHub Actions pour générer une paire RSA éphémère dans les tests, publier les images après validation sur `develop` et `main`, gérer les tags de release et produire des tags cohérents.
- [x] 3.2 [T-155] Formaliser le flux `develop`, `release/vX.Y.Z`, `hotfix/*` et `main` dans les règles, hooks, contrôles de PR, modèle de PR et documentation du dépôt.
- [ ] 3.3 [T-155] Valider les compositions, les Dockerfiles, la configuration de démarrage et les contrôles de sécurité sans secret réel ni clé versionnée.

## 4. Livraison

- [ ] 4.1 [T-155] Exécuter les tests Maven, les validations frontend, les builds d'images, `openspec validate`, `node scripts/tickets.mjs check` et les contrôles adaptés, puis relire le diff.
- [ ] 4.2 [T-155] Mettre à jour les artefacts OpenSpec selon les actions réellement réalisées, committer avec `chore(fullstack): T-155 ...`, pousser la branche et ouvrir une PR vers `develop` sans fusion automatique.
