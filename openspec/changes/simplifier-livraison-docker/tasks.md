Ticket : T-208
Scope / type : infra / chore
Slug : simplifier-livraison-docker
Branche : infra/chore-208-simplifier-livraison-docker
Prérequis : T-199 terminé et fusionné dans develop
PR : vers develop ; la PR compagnon dans `gest-asso-deploiement` est suivie en section 9

## 1. Préparer le ticket

- [ ] 1.1 [T-208] Vérifier la branche du ticket, résoudre T-208, confirmer que T-199 est fusionné dans `develop` et présent dans l'ascendance, puis exécuter `node scripts/tickets.mjs verify T-208` avant toute modification de code.
- [ ] 1.2 [T-208] Relever sur GitHub les noms des contrôles requis par la protection de `develop` et `main`, confirmer qu'aucun environnement ne consomme `latest-int` et relever la plage du réseau Docker `frontend` de l'hôte.

## 2. Image frontend autonome et configuration Nginx unique

- [ ] 2.1 [T-208] Passer `frontend.Dockerfile` à `node:24-alpine` pour le build et à `nginx-unprivileged` (port 8080, non root) pour le runtime, avec le healthcheck défini uniquement dans l'image.
- [ ] 2.2 [T-208] Créer un template serveur HTTP unique traité par `envsubst` (`TRUSTED_PROXY_CIDR`, filtre `NGINX_ENVSUBST_FILTER`) et regrouper les en-têtes de sécurité dans un include partagé.
- [ ] 2.3 [T-208] Supprimer `nginx.conf`, `nginx.local.conf` et `nginx.portainer.conf`, puis vérifier que l'image démarre sans montage et sert `/login` avec les en-têtes attendus.

## 3. Secrets lus nativement par le backend

- [ ] 3.1 [T-208] Ajouter l'import `optional:configtree` dans `application.yaml`, mapper `db_password` et `bootstrap_admin_password` en conservant la priorité des variables d'environnement.
- [ ] 3.2 [T-208] Ajouter la validation au démarrage du mot de passe PostgreSQL et des ressources RSA avec un message qui nomme le secret sans sa valeur, et ses tests (absent, vide, illisible, présent).
- [ ] 3.3 [T-208] Supprimer `backend-entrypoint.sh` et son test, remplacer `prepare-secrets.sh` par `init-secrets.sh` (génération et vérification de la paire RSA, droits `10001` et `0400`, mode `--check-only`) et adapter son test.

## 4. Runtime backend et proxy de confiance

- [ ] 4.1 [T-208] Remplacer les étapes jlink et Ubuntu de `backend.Dockerfile` par `eclipse-temurin:21-jre-noble` avec l'utilisateur 10001, un `ENTRYPOINT` Java direct et un healthcheck dont l'outil est présent dans l'image.
- [ ] 4.2 [T-208] Faire accepter des plages CIDR et des adresses exactes par `ClientAddressResolver`, avec échec au démarrage sur une entrée invalide, et ses tests unitaires.
- [ ] 4.3 [T-208] Mesurer les tailles des deux images et mettre à jour `IMAGE-OPTIMIZATION.md` (pratiques, critères, résultats).

## 5. Composition unique et suppression des variantes

- [ ] 5.1 [T-208] Simplifier `compose.yaml` : images optionnelles `BACKEND_IMAGE` et `FRONTEND_IMAGE`, répertoire de secrets monté en lecture seule, plus de montages Nginx, plus de healthcheck redéfini, plus de `SPRING_PROFILES_ACTIVE`.
- [ ] 5.2 [T-208] Supprimer `compose.integration.yaml`, `integration.env.example`, `INTEGRATION.md`, `compose.portainer.yaml`, `portainer.env.example`, `deployment-repo-parity.yml` et `scripts/check-deployment-repo-parity.mjs`, puis retirer leurs références actives hors archives OpenSpec.

## 6. Chaîne CI des images

- [ ] 6.1 [T-208] Fusionner la validation frontend dans un seul job qui conserve le nom de contrôle requis, puis supprimer `frontend-compilation.yml` si la protection de branche le permet.
- [ ] 6.2 [T-208] Construire chaque image avec `load: true`, la scanner avec Trivy épinglé (`CRITICAL`, `ignore-unfixed`), puis la publier avec SBOM et provenance ; supprimer `latest-int` et ne publier que `sha-<commit>` et le tag candidat existant.
- [ ] 6.3 [T-208] Écrire `scripts/smoke-test.sh <base-url>` et ajouter un job qui démarre `compose.yaml` avec les images construites, des secrets éphémères et PostgreSQL, attend les healthchecks, lance le script et bloque la publication en cas d'échec.
- [ ] 6.4 [T-208] Ajouter le job qui ouvre ou met à jour la PR `staging.env` dans `gest-asso-deploiement` après une candidate release ou hotfix, avec commit, run et digests dans sa description.
- [ ] 6.5 [T-208] Ajouter `promote-release.yml` déclenché par `v[0-9]+.[0-9]+.[0-9]+` : résolution des digests `sha-<commit>`, échec explicite s'ils manquent, retag `imagetools create`, PR `prod.env` dans le dépôt de déploiement.
- [ ] 6.6 [T-208] Ajouter `.github/dependabot.yml` (docker et github-actions, cible `develop`) et accepter les branches `dependabot/` de `dependabot[bot]` dans `workflow-conventions.yml`, avec un test du contrôle.

## 7. Documentation

- [ ] 7.1 [T-208] Réécrire `RELEASING.md` selon les déclencheurs, tags et étapes de promotion réels, et documenter le format de tag `vX.Y.Z` en minuscule.
- [ ] 7.2 [T-208] Réduire `PORTAINER.md` à : renvoi vers `gest-asso-deploiement`, noms des fichiers de secrets, `init-secrets.sh`, configuration Caddy (port 8080, HSTS, redirection), smoke test, rollback par revert et migration depuis l'ancienne stack.
- [ ] 7.3 [T-208] Mettre à jour `contribo-deploiement/README.md` pour le démarrage local avec le répertoire de secrets.

## 8. Valider localement

- [ ] 8.1 [T-208] Exécuter `mvn -B verify` dans `contribo-back`, `npm test -- --watch=false` et `npm run build` dans `contribo-front`, et les tests du dossier `tests/` concernés.
- [ ] 8.2 [T-208] Construire les deux images, vérifier l'utilisateur non root, les ports, l'absence d'outils de build, puis lancer `compose.yaml` et `scripts/smoke-test.sh http://localhost:<port>` avec succès.
- [ ] 8.3 [T-208] Valider la syntaxe des workflows modifiés et le change avec `openspec validate simplifier-livraison-docker`, puis `node scripts/tickets.mjs check`.

## 9. Livrer

- [ ] 9.1 [T-208] Ajouter explicitement les fichiers du ticket, committer `chore(infra): T-208 <résumé>`, pousser la branche et ouvrir la PR vers `develop` avec le modèle du dépôt, les validations réellement exécutées et les points BREAKING.
- [ ] 9.2 [T-208] Préparer la PR compagnon dans `gest-asso-deploiement` (composition unique, `staging.env`, `prod.env`, répertoire de secrets, port 8080, CIDR de confiance, Caddy) et remplacer le secret `DEPLOYMENT_REPO_TOKEN` par un jeton fin avec écriture du contenu et des PR sur ce seul dépôt.
- [ ] 9.3 [T-208] Après fusion, sur la première release contenant T-208 : vérifier la PR staging générée, le smoke test staging, le retag `vX.Y.Z`, la PR production et le rollback par revert.
