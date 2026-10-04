## Why

La chaîne de livraison Docker repose sur de bonnes bases (digests immuables,
images multi-stage, runtime non-root, secrets fichiers, réseau interne), mais
elle a accumulé une complexité accidentelle : trois compositions, quatre
configurations Nginx, une composition dupliquée entre deux dépôts avec contrôle
de parité, une image frontend inutilisable sans fichier monté depuis l'hôte,
environ 250 lignes de shell autour des secrets et une promotion par
copier-coller manuel de digests. La documentation de release ne correspond plus
au workflow réel (aucune publication sur `main` ni sur tag), et la chaîne ne
comporte ni scan de vulnérabilités, ni SBOM, ni suivi des images de base, ni
smoke test automatisé. Chaque déploiement exige donc des étapes manuelles
fragiles et des procédures de rattrapage (`rmdir`, recréation de réseau).

## What Changes

- Aligner `RELEASING.md` et le workflow d'images : publication semver par
  **retag sans rebuild** du digest candidat sur un tag `vX.Y.Z` (minuscule),
  suppression des alias mutables `latest-int` et `latest`. **BREAKING** pour
  tout environnement qui consommerait encore `latest-int`.
- Faire du dépôt `gest-asso-deploiement` la **seule source de vérité** de la
  composition de déploiement : suppression du miroir `compose.portainer.yaml`,
  de `portainer.env.example`, du workflow `deployment-repo-parity.yml` et de
  `scripts/check-deployment-repo-parity.mjs` dans ce dépôt.
- Promotion GitOps : la CI ouvre automatiquement une PR dans
  `gest-asso-deploiement` qui met à jour les références d'images (staging après
  une candidate, production après un tag). Déployer = fusionner une PR,
  rollback = revert.
- Image frontend **autonome et non privilégiée** : base `nginx-unprivileged`,
  HTTP seul par défaut (TLS et HSTS portés par le proxy d'entrée Caddy),
  plage `set_real_ip_from` injectée par template `envsubst`. **BREAKING** : le
  port interne passe de 80 à 8080 et le proxy d'entrée doit être adapté.
- Suppression de `compose.integration.yaml`, `integration.env.example`,
  `INTEGRATION.md`, `nginx.conf` (TLS), `nginx.portainer.conf` et du montage
  de configuration Nginx depuis l'hôte.
- Secrets lus nativement par Spring Boot (`configtree`) depuis un répertoire
  monté : suppression de `backend-entrypoint.sh`, de la logique
  `DB_PASSWORD_FILE`, du secret bootstrap obligatoire même vide ; réduction de
  `prepare-secrets.sh` à une initialisation courte (paire RSA et droits). Le
  démarrage échoue toujours explicitement si un secret obligatoire manque.
- Runtime backend sur `eclipse-temurin:21-jre` au lieu de l'étape jlink sur
  Ubuntu.
- Proxy de confiance défini par **plage CIDR** côté backend : suppression de
  l'IP fixe `172.30.0.10` et du sous-réseau IPAM imposé.
- Sécurité de la chaîne : scan Trivy bloquant sur `CRITICAL`, SBOM et
  provenance attachés aux images publiées, Dependabot pour les images de base
  et les actions GitHub (avec acceptation de ses branches par le contrôle
  `Workflow conventions`).
- Smoke test automatisé (script versionné) exécuté en CI sur la stack
  conteneurisée et réutilisable après déploiement.
- Corrections de cohérence : Node 24 dans le Dockerfile frontend comme en CI,
  validation frontend exécutée une seule fois par PR, healthcheck défini
  uniquement dans les images, suppression du profil Spring `int` inexistant.

## Capabilities

### New Capabilities

Aucune. Le change modifie des capacités de livraison existantes.

### Modified Capabilities

- `ci-image-publishing` : plus d'alias mutables, publication semver par retag,
  scan, SBOM, provenance et smoke test conteneurisé obligatoires.
- `release-image-promotion` : la staging et la production sont mises à jour par
  PR automatique dans le dépôt de déploiement, la production reçoit un tag
  semver pointant sur le digest testé.
- `portainer-deployment` : source de vérité unique, secrets en répertoire avec
  bootstrap optionnel, aucun fichier Nginx sur l'hôte, rollback par revert.
- `deployment-foundation` : image frontend autonome et non privilégiée, deux
  variantes de composition seulement, images de base suivies.
- `actuator-and-secret-hardening` : les secrets fichiers sont lus par
  l'application elle-même, avec échec explicite au démarrage.
- `proxy-security-hardening` : TLS, redirection HTTPS et HSTS portés par le
  proxy d'entrée ; confiance du proxy interne par plage CIDR.

## Impact

- Ticket : **T-208**, scope `infra`, type `chore`, branche
  `infra/chore-208-simplifier-livraison-docker`, PR vers `develop`. Un seul
  ticket à la demande du mainteneur, malgré une petite modification backend
  (`ClientAddressResolver`, `application.yaml`).
- Prérequis : T-199 (`durcir-secrets-runtime-portainer`) doit être terminé et
  fusionné, car T-208 remplace l'entrypoint et le script de secrets qu'il durcit.
- Fichiers : `contribo-deploiement/` (Dockerfiles, compose, Nginx, scripts,
  docs), `.github/workflows/`, `.github/dependabot.yml`, `RELEASING.md`,
  `tests/`, `scripts/`, `contribo-back` (résolution d'adresse client et import
  des secrets).
- Aucun impact sur le contrat API, le schéma PostgreSQL ou les données.
- Dépôt externe `gest-asso-deploiement` : une PR compagnon est nécessaire
  (composition unique, fichiers d'environnement versionnés, port frontend 8080,
  montage du répertoire de secrets, Caddy). Le jeton CI doit pouvoir y ouvrir
  des PR (lecture du contenu, écriture des branches et PR).
- Environnements existants : migration une fois des secrets vers le répertoire
  monté et de la configuration Caddy, avec retour possible à la paire de
  digests précédente tant que la composition précédente est conservée.
