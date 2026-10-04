# Images Docker

Ce document décrit les choix appliqués aux images backend et frontend de
Contribo. Les images finales sont construites en plusieurs étapes, le cache
BuildKit est conservé entre les builds CI, et chaque image est scannée et
testée avant publication (voir `RELEASING.md`).

## Choix retenus (T-208)

- **Backend** : runtime `eclipse-temurin:21-jre-alpine`, utilisateur non
  privilégié `contribo` (UID 10001), `ENTRYPOINT` Java direct sans script
  shell. Les secrets sont lus par Spring Boot depuis `/run/secrets`.
- **Frontend** : `nginxinc/nginx-unprivileged:1.30-alpine`, HTTP sur le port
  8080, configuration embarquée rendue par `envsubst` (seule variable :
  `TRUSTED_PROXY_CIDR`), aucun montage requis. Build Angular sur
  `node:24-alpine`, comme la CI.
- Copier les descripteurs Maven et npm avant les sources ; monter
  `/root/.m2/repository` et `/root/.npm` comme caches BuildKit.
- Produire un artefact Maven stable `contribo-back.jar`.
- Healthchecks définis uniquement dans les Dockerfiles (`wget`, présent dans
  les deux images).
- Exclure du contexte les dépendances, sorties de build, caches, logs et secrets.

L'étape `jdeps`/`jlink` sur Ubuntu (T-197) a été retirée : elle gagnait environ
50 Mo au prix d'une liste de modules à maintenir et d'un risque de module
manquant à l'exécution. La base Alpine garde l'essentiel du gain sans cette
maintenance.

## Tailles mesurées

Tailles retournées par `docker image inspect` (Docker 29, stockage containerd,
arm64). Elles ne sont pas comparables aux mesures T-197 faites avec un autre
stockage : les deux colonnes ont été mesurées ici dans les mêmes conditions.

| Image | `develop` avant T-208 | T-208 | Écart |
| --- | ---: | ---: | ---: |
| Backend | 299 414 235 octets (jlink, Ubuntu) | 352 124 207 octets (JRE Alpine) | +17,6 % |
| Frontend | 77 810 373 octets (nginx 1.27) | 83 421 981 octets (nginx-unprivileged 1.30) | +7,2 % |

L'image backend reste 19 % plus petite que l'image JDK complète de référence
mesurée en T-197 (436 Mo).

## Sécurité de la chaîne

- Scan Trivy bloquant sur les vulnérabilités `CRITICAL` corrigeables ; les
  exceptions sont justifiées et datées dans `.trivyignore`.
- SBOM et attestation de provenance (`mode=max`) attachés aux images publiées.
- Images de base et actions GitHub suivies par Dependabot (`.github/dependabot.yml`).
- `contribo-back/pom.xml` surcharge `tomcat.version` tant que la version gérée
  par Spring Boot reste vulnérable (CVE critiques corrigées en 11.0.25).

## Validation

```sh
docker build -t contribo-back:local -f contribo-deploiement/backend.Dockerfile .
docker build -t contribo-front:local -f contribo-deploiement/frontend.Dockerfile .
contribo-deploiement/init-secrets.sh --local --dir .local-secrets --generate-db-password
docker compose -f contribo-deploiement/compose.yaml up -d --no-build --wait
scripts/smoke-test.sh http://localhost:8081
```

Critères :

- les deux images tournent sous un utilisateur non root et n'embarquent aucun
  outil de build ni secret ;
- PostgreSQL, le backend et le frontend passent leurs healthchecks ;
- le smoke test réussit ;
- le scan Trivy ne remonte aucune vulnérabilité `CRITICAL` corrigeable.

## Rollback

Revenir à la paire d'images précédente par revert de la PR de déploiement
(voir `PORTAINER.md`). Les données PostgreSQL et les secrets ne sont pas
modifiés par un changement d'image.
