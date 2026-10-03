# Optimisation des images Docker

Ce document décrit les pratiques appliquées aux images backend et frontend de
Contribo. Les images finales sont construites en plusieurs étapes et le cache
BuildKit est conservé entre les builds CI.

## Résultats locaux T-197

Les tailles ci-dessous sont les tailles non compressées retournées par
`docker image inspect` sur Docker Desktop. La taille réellement transférée par
le registre dépend de la compression et des couches déjà présentes sur le nœud.

| Image | Baseline | Optimisée | Évolution |
| --- | ---: | ---: | ---: |
| Backend | 457 470 851 octets, 436,3 MiB | 299 390 156 octets, 285,5 MiB | -34,6 % |
| Frontend | 77 467 733 octets, 73,9 MiB | 77 468 244 octets, 73,9 MiB | +511 octets |

Le frontend conserve la même image finale Nginx. L'optimisation porte surtout
sur la réutilisation du cache npm et sur l'exclusion des artefacts de build du
contexte Docker.

Sur le poste de validation, un rebuild chaud avec cache a pris 1,7 s pour le
backend et 1,9 s pour le frontend. Un rebuild sans cache a pris 62,1 s pour le
backend et 16,3 s pour le frontend. Ces durées servent de repère local et ne
constituent pas un budget CI universel.

## Pratiques retenues

- Copier les descripteurs Maven et npm avant les sources afin de réutiliser les
  dépendances lors d'une modification de code uniquement.
- Monter `/root/.m2/repository` et `/root/.npm` comme caches BuildKit.
- Construire le runtime Java avec `jdeps` puis `jlink` dans une étape dédiée.
- Produire un artefact Maven stable `contribo-back.jar`, indépendant de la
  version Maven, puis utiliser `--compress=zip-6` avec le JDK 21+.
- Ajouter explicitement les modules cryptographiques et de sécurité nécessaires
  au chargement RSA et à TLS.
- Utiliser une base glibc Ubuntu dans le runtime backend avec les certificats CA,
  les fuseaux horaires et `curl` requis par l'application et le healthcheck.
- Exécuter le backend avec l'utilisateur non privilégié `contribo` (UID 10001).
- Conserver uniquement les assets Angular et les fichiers Nginx nécessaires dans
  l'image frontend finale.
- Exclure du contexte les dépendances, sorties de build, caches, logs et secrets.

Le runtime final backend ne contient ni Maven, ni `javac`, ni `jdeps`, ni un JDK
complet. Les secrets restent injectés par l'environnement de déploiement.

## Validation

Build local des images :

```sh
docker build -t contribo-back:t197 -f contribo-deploiement/backend.Dockerfile .
docker build -t contribo-front:t197 -f contribo-deploiement/frontend.Dockerfile .
```

Validation du compose local avec PostgreSQL, Flyway et les clés RSA :

```sh
POSTGRES_PASSWORD=... \
RSA_PUBLIC_KEY_FILE_PATH=/chemin/rsa_public.pem \
RSA_PRIVATE_KEY_FILE_PATH=/chemin/rsa_private.pem \
docker compose -p contribo-t197 -f contribo-deploiement/compose.yaml up -d --build
```

Les critères d'acceptation sont les suivants :

- le backend optimisé reste au moins 20 % plus petit que la baseline ;
- le frontend final n'augmente pas de plus de 1 % ;
- les services PostgreSQL, backend et frontend passent leurs healthchecks ;
- `/actuator/health/readiness`, `/` et `/login` répondent avec le statut attendu ;
- les tests backend, les tests outillage frontend et le build frontend passent ;
- les images finales n'exposent aucun outil de build ni secret.

La CI utilise déjà Buildx avec les caches GitHub Actions `backend` et `frontend`.
Toute modification de ces Dockerfiles reconstruit donc les images et vérifie les
étapes de génération dans le workflow des images.

Les images de base restent référencées par des tags de famille maintenus par les
images officielles Temurin, Maven et Ubuntu. Chaque build CI reconstruit les
étapes et le digest publié dans le résumé du workflow devient la référence
immuable de déploiement. Une mise à jour de base doit donc passer par un run CI
complet avant d'être promue.

## Repli et rollback

Si un module dynamique manque en production, reconstruire temporairement le
backend avec le runtime générique `eclipse-temurin:21-jre-jammy` en conservant
les mêmes étapes Maven et les mêmes contrôles de santé. Ne pas publier ce repli
comme remplacement silencieux : le tag ou le digest doit rester identifiable.

Pour un rollback de déploiement, redéployer le digest d'une image précédente
validée dans Portainer ou dans le compose d'intégration, puis vérifier les
healthchecks backend et frontend. Les données PostgreSQL et les secrets ne sont
pas modifiés par le changement d'image.
