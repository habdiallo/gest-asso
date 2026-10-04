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

`gest-asso-deploiement` porte `compose.base.yaml` (services communs),
`networks.yaml` et un fichier par environnement, `staging/compose.yaml` et
`production/compose.yaml`, qui incluent les réseaux, étendent la base et
portent leurs deux lignes `image:` écrites en dur. Les références ne passent
pas par un `.env` versionné : depuis Portainer 2.27, une stack Git n'interpole
plus le `.env` du dépôt (portainer/portainer#12546). Ce dépôt supprime son
miroir, `portainer.env.example`, le workflow de parité et son script.

Alternative écartée : faire pointer Portainer sur ce dépôt. Les PR automatiques
de mise à jour d'images y seraient refusées par les conventions de branche et
de ticket, et chaque déploiement passerait par `develop`.

### D2. Promotion par retag et PR GitOps

- `develop`, `release/*`, `hotfix/*` : **un seul build** par image, poussé avec
  SBOM et provenance sous un tag `validation-<run>-<attempt>` non déployable.
  Ce digest exact est scanné et testé, puis reçoit `sha-<commit>` (et
  `candidate-*` pour release et hotfix) par `imagetools create`, qui conserve
  le digest (vérifié localement sur un registre avec attestations, et contrôlé
  après chaque retag dans le workflow). Sur une PR, l'image est construite une
  fois et chargée localement ; rien n'est publié.
- Images de base épinglées par digest dans les Dockerfiles (tag conservé pour
  la lisibilité et pour Dependabot).
- Après une candidate release ou hotfix : un job ouvre ou met à jour une PR
  dans `gest-asso-deploiement` qui modifie uniquement les deux lignes `image:`
  de `staging/compose.yaml` (`scripts/update-deployment-images.sh`, testé).
- Tag `v[0-9]+.[0-9]+.[0-9]+` : un workflow `promote-release.yml` lit les
  digests déployés dans `staging/compose.yaml` du dépôt de déploiement, vérifie
  que leur label `org.opencontainers.image.revision` est le commit tagué,
  applique `docker buildx imagetools create --tag ...:vX.Y.Z <image>@<digest>`,
  puis ouvre une PR qui modifie `production/compose.yaml` avec
  `vX.Y.Z@sha256:<digest>`. Le tag mutable `sha-*` ne sert pas à choisir la
  production : un rebuild ultérieur du même commit pourrait le déplacer. Le tag doit pointer sur la tête de la release,
  fusionnée dans `main` par merge commit : c'est le seul commit dont les images
  `sha-<commit>` existent. Le workflow vérifie qu'il est dans `main`.
- Plus aucun alias mutable : `latest-int` est supprimé.

Le jeton `DEPLOYMENT_REPO_TOKEN` (aujourd'hui en lecture) est remplacé par un
jeton fin limité à `gest-asso-deploiement` avec `contents: write` et
`pull-requests: write`. Il est fourni à Git par l'assistant
`gh auth git-credential`, jamais dans une URL ni dans la configuration du
clone. La branche `deploy/*` n'est jamais force-poussée : une relance
identique la réutilise, une branche divergente arrête le job sans écraser. La PR est ouverte avec `gh pr create` sur une branche
`deploy/<env>-<libellé>` par `scripts/open-deployment-pr.sh` ; aucune fusion
automatique.

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

### D6. Runtime backend `eclipse-temurin:21-jre-alpine`

L'étape jlink et la base Ubuntu sont remplacées par
`eclipse-temurin:21-jre-alpine` avec l'utilisateur 10001 et un healthcheck
`wget`. Mesure dans les mêmes conditions : 352 Mo contre 299 Mo avec jlink
(+17,6 %), alors que `21-jre-noble` atteignait 500 Mo (+67 %) et a été écarté.
Le gain : plus de `jdeps`, de liste de modules ni de risque de module manquant.
L'authentification JWT, Flyway et le bootstrap ont été vérifiés sur cette base.

Alternatives écartées : Jib (nouveau plugin Maven, plus de Dockerfile commun
aux deux images) et distroless (pas de shell pour le diagnostic sur un serveur
unique).

### D7. Proxy de confiance par CIDR

`ClientAddressResolver` accepte des adresses et des plages CIDR via
`IpAddressMatcher` de Spring Security, déjà présent ; les noms d'hôte sont
refusés et une entrée invalide fait échouer le démarrage. La stack fait
confiance à la plage du réseau interne `contribo-internal`, sur lequel seul le
frontend joint le backend : l'adresse IP fixe disparaît. La plage reste
déclarée (variable `INTERNAL_NETWORK_SUBNET`) car faire confiance à toutes les
plages privées laisserait un conteneur du réseau PostgreSQL usurper
`X-Real-IP`.

### D8. Sécurité de la chaîne d'images

- Chaque image est construite avec `load: true`, scannée par
  `aquasecurity/trivy-action` (version épinglée, `severity: CRITICAL`,
  `ignore-unfixed: true`, `exit-code: 1`), puis poussée depuis le cache avec
  `provenance: mode=max` et `sbom: true`.
- `.github/dependabot.yml` : écosystèmes `docker` (`/contribo-deploiement`) et
  `github-actions`, cible `develop`, fréquence hebdomadaire.
- `workflow-conventions.yml` accepte en plus `^dependabot/` pour l'acteur
  `dependabot[bot]` uniquement.

### D8 bis. Corrections révélées par le premier scan

Le scan local des images a trouvé des vulnérabilités `CRITICAL` corrigeables,
présentes aussi dans les images publiées depuis `develop` :

- Tomcat 11.0.22 (Spring Boot 4.1.0 ; 4.1.1 gère encore 11.0.24) :
  `tomcat.version` est surchargée à 11.0.26 dans `pom.xml`, à retirer dès que
  Spring Boot gère une version corrigée ;
- nginx 1.28.2 et OpenSSL 3.5.5 : base frontend passée à
  `nginx-unprivileged:1.30-alpine`.

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
2. Préparer la PR compagnon `gest-asso-deploiement` : `compose.base.yaml`,
   `networks.yaml`, `staging/compose.yaml`, `production/compose.yaml`, port
   8080, montage du répertoire de secrets, confiance par plage, Caddy
   `reverse_proxy frontend:8080` avec HSTS et redirection.
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

- Protection de branche : vérifiée le 2026-10-04, `develop` et `main` n'ont ni
  protection ni ruleset ; aucun nom de contrôle n'est imposé. À configurer
  conformément à `CONTRIBUTING.md` (hors périmètre).
- Plage réelle du réseau Docker `frontend` sur l'hôte : défaut
  `172.16.0.0/12` conservé, à confirmer avec `docker network inspect frontend`.
- Usage résiduel de `latest-int` sur l'hôte : aucun dans le dépôt de
  déploiement (images par digest), à confirmer dans les variables Portainer.
