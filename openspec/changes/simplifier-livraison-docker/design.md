## Context

État de `origin/develop` au moment de la proposition :

- `contribo-deploiement/` contient trois compositions (`compose.yaml` local,
  `compose.integration.yaml` avec TLS dans Nginx, `compose.portainer.yaml`
  miroir du dépôt `gest-asso-deploiement`), quatre configurations Nginx
  (`nginx.conf` TLS embarquée dans l'image, `nginx.local.conf`,
  `nginx.portainer.conf` montée depuis l'hôte, includes partagés),
  `backend-entrypoint.sh` et `prepare-secrets.sh` (environ 200 lignes, testé
  en `sudo` dans la CI).
- `backend-frontend-images.yml` saute le job `images` sur `main`, n'a aucun
  déclencheur sur tag et publie `latest-int` depuis `develop`, alors que
  `RELEASING.md` annonce `latest` sur `main` et des tags semver sur `vX.Y.Z`.
  Les tags Git existants mélangent `V1.1.0` et `v1.0.3`.
- Les tests frontend tournent deux fois par PR (`frontend-compilation.yml` et
  `backend-frontend-images.yml`), avec Node 24 en CI et `node:22-alpine` dans
  le Dockerfile.
- `ClientAddressResolver` compare l'adresse distante à une liste d'adresses
  exactes, d'où l'IP fixe `172.30.0.10` et le sous-réseau IPAM imposé.
- `SPRING_PROFILES_ACTIVE=int` est injecté alors qu'aucun fichier
  `application-int.yaml` n'existe.
- `BootstrapAdminInitializer` lit déjà un fichier via
  `bootstrap.admin.password-file` ; les clés RSA sont déjà des ressources
  Spring `file:`.
- T-199 (`durcir-secrets-runtime-portainer`) durcit l'entrypoint et le script
  de secrets ; il lui reste des validations à terminer.

## Goals / Non-Goals

**Goals:**

- Une seule composition dans ce dépôt (local et CI), une seule source de
  vérité de déploiement dans `gest-asso-deploiement`.
- Des images qui démarrent sans fichier de l'hôte autre que les secrets.
- Un déploiement et un rollback qui se font par PR et revert, sans
  copier-coller de digest.
- Une chaîne qui scanne, atteste et vérifie les images avant publication.
- Une documentation de release qui décrit exactement le workflow.

**Non-Goals:**

- Déplacer les Dockerfiles à côté des applications ou changer le contexte de
  build.
- Remplacer Portainer, Caddy ou GHCR, ou introduire Kubernetes.
- Supprimer la dépendance Java du build frontend (génération du client API).
- Activer Dependabot pour npm et Maven (possible dans un ticket ultérieur).
- Signer les images avec cosign.
- Réécrire les tags Git historiques (`V1.1.0` reste en l'état).

## Decisions

### D1. Le dépôt de déploiement devient l'unique source de vérité

`gest-asso-deploiement` porte `compose.yaml`, `staging.env` et `prod.env`
(références d'images et paramètres non secrets). Ce dépôt supprime son miroir,
`portainer.env.example`, le workflow de parité et son script.

Alternative écartée : faire pointer Portainer sur ce dépôt. Les PR automatiques
de mise à jour d'images y seraient refusées par les conventions de branche et
de ticket, et chaque déploiement passerait par `develop`.

### D2. Promotion par retag et PR GitOps

- `develop`, `release/*`, `hotfix/*` : build, scan, smoke test, puis push
  `sha-<commit>` (et le tag `candidate-*` existant pour release et hotfix).
- Après une candidate release ou hotfix : un job ouvre ou met à jour une PR
  dans `gest-asso-deploiement` qui modifie uniquement `staging.env`.
- Tag `v[0-9]+.[0-9]+.[0-9]+` : un workflow `promote-release.yml` résout les
  digests de `sha-<commit>`, échoue s'ils sont absents, applique
  `docker buildx imagetools create --tag ...:vX.Y.Z <image>@<digest>`, puis
  ouvre une PR qui modifie `prod.env` avec `vX.Y.Z@sha256:<digest>`.
- Plus aucun alias mutable : `latest-int` est supprimé.

Le jeton `DEPLOYMENT_REPO_TOKEN` (aujourd'hui en lecture) est remplacé par un
jeton fin limité à `gest-asso-deploiement` avec `contents: write` et
`pull-requests: write`. La PR est ouverte avec `gh pr create` sur une branche
`deploy/<env>-<sha court>` ; aucune fusion automatique.

Alternative écartée : webhook Portainer déclenché par la CI. Il déploie sans
trace Git ni revue, et le rollback redevient manuel.

### D3. Image frontend autonome sur `nginx-unprivileged`

- Base `nginxinc/nginx-unprivileged:<version>-alpine`, port 8080, utilisateur
  non root.
- Une seule configuration serveur HTTP embarquée sous forme de template
  `/etc/nginx/templates/default.conf.template`, traité par l'`envsubst` natif
  de l'image. Variable `TRUSTED_PROXY_CIDR` (défaut `172.16.0.0/12`) pour
  `set_real_ip_from`. `NGINX_ENVSUBST_FILTER` limite la substitution à cette
  variable pour ne pas casser les variables Nginx.
- Les includes (routes, limites, en-têtes) restent partagés ; les en-têtes de
  sécurité passent dans un include unique pour éviter la triple copie.
- HSTS et redirection HTTPS sont déplacés vers Caddy (déjà le terminateur TLS).
- `nginx.conf` TLS, `nginx.portainer.conf` et `nginx.local.conf` disparaissent.
  La composition locale n'a plus besoin de montages Nginx.

Alternative écartée : conserver une image TLS par défaut. C'est la cause du
montage depuis l'hôte et des procédures de récupération documentées.

### D4. Suppression de la composition d'intégration

L'intégration et la staging passent par Portainer. `compose.integration.yaml`,
`integration.env.example` et `INTEGRATION.md` sont supprimés. La composition
locale accepte `BACKEND_IMAGE` et `FRONTEND_IMAGE` optionnelles pour que la CI
teste les images construites sans rebuild.

### D5. Secrets lus nativement par Spring Boot

- `spring.config.import: optional:configtree:${SECRETS_DIR:/run/secrets}/`.
  Chaque fichier devient une propriété portant son nom.
- `spring.datasource.password: ${DB_PASSWORD:${db_password:}}` : la variable
  d'environnement reste prioritaire pour le développement local.
- Bootstrap : `bootstrap.admin.password: ${BOOTSTRAP_ADMIN_PASSWORD:${bootstrap_admin_password:}}`.
  Le fichier est simplement absent quand le bootstrap est désactivé.
- RSA : `RSA_PUBLIC_KEY=file:/run/secrets/rsa_public.pem`, inchangé dans le
  principe.
- Échec explicite : un validateur au démarrage (propriétés validées ou
  `ApplicationRunner` précoce) vérifie la présence non vide du mot de passe
  PostgreSQL et la lisibilité des ressources RSA, et lève une erreur nommant
  le secret sans sa valeur. Un fichier illisible du configtree provoque déjà
  un échec de chargement ; un test le vérifie.
- La stack de déploiement monte le répertoire `/opt/contribo/secrets` en
  lecture seule sur `/run/secrets` au lieu de déclarer quatre secrets Compose.
- `backend-entrypoint.sh` est supprimé (`ENTRYPOINT ["java", "-jar", "/app/app.jar"]`).
- `prepare-secrets.sh` est remplacé par `init-secrets.sh` (environ 30 lignes) :
  crée le répertoire, génère la paire RSA si absente, vérifie la paire,
  applique `10001:10001` et `0400`. Il ne crée plus de fichier bootstrap vide.

Alternative écartée : conserver l'entrypoint shell. Il duplique en shell une
validation que l'application fait mieux et qui doit être testée en `sudo`.

### D6. Runtime backend `eclipse-temurin:21-jre`

L'étape jlink et la base Ubuntu sont remplacées par
`eclipse-temurin:21-jre-noble` avec l'utilisateur 10001. L'image grossit
d'environ 50 à 80 Mo, en échange de la suppression de `jdeps`, de la liste de
modules et du risque de module manquant à l'exécution. `IMAGE-OPTIMIZATION.md`
est mis à jour avec les tailles mesurées. Si `curl` est absent de la base, il
est installé pour le healthcheck ou le healthcheck utilise `wget`.

Alternatives écartées : Jib (nouveau plugin Maven, plus de Dockerfile commun
aux deux images) et distroless (pas de shell pour le diagnostic sur un serveur
unique).

### D7. Proxy de confiance par CIDR

`ClientAddressResolver` accepte des adresses et des plages CIDR via
`IpAddressMatcher` de Spring Security, déjà présent. Une entrée invalide fait
échouer le démarrage. La stack déclare
`TRUSTED_PROXY_ADDRESSES=<sous-réseau du réseau interne>` ; l'adresse fixe et
le bloc IPAM deviennent inutiles.

### D8. Sécurité de la chaîne d'images

- Chaque image est construite avec `load: true`, scannée par
  `aquasecurity/trivy-action` (version épinglée, `severity: CRITICAL`,
  `ignore-unfixed: true`, `exit-code: 1`), puis poussée depuis le cache avec
  `provenance: mode=max` et `sbom: true`.
- `.github/dependabot.yml` : écosystèmes `docker` (`/contribo-deploiement`) et
  `github-actions`, cible `develop`, fréquence hebdomadaire.
- `workflow-conventions.yml` accepte en plus `^dependabot/` pour l'acteur
  `dependabot[bot]` uniquement.

### D9. Smoke test versionné

`scripts/smoke-test.sh <base-url>` (curl uniquement) vérifie :

- `/login` en 200 avec CSP sans `unsafe-eval` et `X-Frame-Options: DENY` ;
- `/assets/i18n/fr.json` servi sans cache persistant ;
- un bundle hashé servi avec un cache longue durée ;
- `POST /api/v1/auth/login` avec des identifiants invalides qui répond 401,
  ce qui prouve le routage vers le backend (et non 502).

Un job CI démarre `compose.yaml` avec les images construites, des secrets
générés à la volée et PostgreSQL éphémère, attend les healthchecks puis lance
le script. Il remplace les `curl` manuels de `PORTAINER.md`.

### D10. Cohérences

- `frontend.Dockerfile` passe à `node:24-alpine`.
- La validation frontend reste dans un seul job. Le job frontend de
  `backend-frontend-images.yml` réutilise le nom de contrôle requis par la
  protection de branche, et `frontend-compilation.yml` est supprimé une fois
  les contrôles requis vérifiés sur GitHub.
- Les healthchecks sont définis uniquement dans les Dockerfiles.
- `SPRING_PROFILES_ACTIVE` disparaît des compositions et de la documentation.
- `RELEASING.md` décrit exactement les déclencheurs, les tags et la promotion.

## Risks / Trade-offs

- [Migration des environnements existants : port 8080, montage du répertoire
  de secrets, Caddy] → Procédure de migration pas à pas dans `PORTAINER.md`,
  PR compagnon dans `gest-asso-deploiement` fusionnée en même temps que la
  première candidate T-208, rollback par revert de cette PR vers l'ancienne
  composition et l'ancienne paire de digests.
- [Jeton d'écriture sur le dépôt de déploiement] → Jeton fin limité à ce seul
  dépôt, aucune fusion automatique, branche `main` du dépôt de déploiement
  protégée.
- [Les contrôles requis de la protection de branche portent l'ancien nom du
  job frontend] → Vérifier les noms requis sur GitHub avant de supprimer
  `frontend-compilation.yml` ; conserver le nom de contrôle.
- [Trivy bloque une release sur une CVE de base sans correctif] →
  `ignore-unfixed` et fichier `.trivyignore` versionné avec justification et
  date d'expiration.
- [Variables Nginx consommées par `envsubst`] → Filtre `NGINX_ENVSUBST_FILTER`
  et test de rendu dans le smoke test.
- [Image backend plus lourde qu'avec jlink] → Écart mesuré et documenté ;
  impact négligeable pour un serveur unique.
- [Nom des propriétés configtree couplé aux noms de fichiers] → Noms
  documentés dans `PORTAINER.md` et vérifiés par `init-secrets.sh --check-only`.

## Migration Plan

1. Fusionner T-199, puis livrer T-208 sur `develop` : la CI publie `sha-*`
   (sans `latest-int`), lance scan et smoke test.
2. Préparer la PR compagnon `gest-asso-deploiement` : composition unique,
   `staging.env`, `prod.env`, port 8080, montage du répertoire de secrets,
   `TRUSTED_PROXY_ADDRESSES` en CIDR, Caddy `reverse_proxy frontend:8080` avec
   HSTS et redirection.
3. Sur l'hôte : `init-secrets.sh --check-only` puis renommage éventuel des
   fichiers de secrets selon les noms attendus.
4. Créer la première `release/vX.Y.Z` contenant T-208 : la CI ouvre la PR
   staging ; fusionner, laisser Portainer redéployer, lancer
   `scripts/smoke-test.sh` sur l'URL de staging.
5. Fusionner la release dans `main`, pousser `vX.Y.Z` : la CI retague et ouvre
   la PR production ; fusionner et lancer le smoke test.
6. Rollback : revert de la PR de déploiement concernée. Pour revenir avant
   T-208, revert également la PR compagnon (ancienne composition, fichiers
   Nginx de l'hôte toujours présents tant qu'ils ne sont pas supprimés).
7. Après une release stable : supprimer `/etc/contribo/nginx/` sur l'hôte et
   l'ancien réseau `contribo-internal` à sous-réseau fixe s'il n'est plus
   utilisé.

## Open Questions

- Noms exacts des contrôles requis par la protection de `develop` et `main`
  (à lire dans les réglages GitHub avant la suppression du workflow frontend).
- Plage réelle du réseau Docker `frontend` sur l'hôte, pour fixer la valeur de
  `TRUSTED_PROXY_CIDR`.
- Un environnement consomme-t-il encore `latest-int` ? À confirmer avant la
  fusion ; sinon basculer cet environnement sur les digests.
