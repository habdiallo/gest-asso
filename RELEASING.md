# Flux de branches et releases

## Rôles des branches

- `main` représente la production. Elle reçoit uniquement une release ou un hotfix validé par PR.
- `develop` représente l'intégration. Les branches de ticket sont fusionnées ici après revue.
- `release/vX.Y.Z` est créée depuis `develop` pour stabiliser une version avant sa livraison.
- `hotfix/<description>` est créée depuis `main` pour une correction urgente.

Le mainteneur doit créer `develop` une fois depuis `main`, puis protéger `main` et
`develop` dans GitHub. Les pushes directs sur ces deux branches restent interdits.

## Développement et release

1. Résoudre le ticket et créer sa branche depuis `origin/develop`.
2. Ouvrir la PR du ticket vers `develop`.
3. Créer `release/vX.Y.Z` depuis `develop` quand le périmètre est prêt.
4. Corriger uniquement les problèmes de stabilisation sur la branche release.
5. Valider la candidate en staging (voir ci-dessous) : fusionner la PR de
   staging générée pour la **tête** de la release, puis lancer le smoke test.
6. Ouvrir la PR de release vers `main` et la fusionner par **merge commit**
   (pas de squash) : le commit testé doit rester dans l'historique de `main`.
7. Poser le tag `vX.Y.Z` (en minuscule) sur la **tête de `release/vX.Y.Z`**,
   c'est-à-dire le commit dont les images ont été testées, puis le pousser.
8. Réintégrer la release dans `develop`.

Une branche release ne remplace pas les PR de ticket et ne doit pas recevoir de
nouvelles fonctionnalités non présentes dans `develop`.

## Images

| Événement | Ce que fait la CI |
| --- | --- |
| PR vers `develop` ou `main` | Tests, build, scan Trivy, smoke test. Rien n'est publié. |
| Push sur `develop` | Un seul build par image, poussé avec SBOM et provenance sous un tag `validation-*` non déployable ; ce digest est scanné et testé, puis reçoit le tag `sha-<commit>`. |
| Push sur `release/vX.Y.Z` ou `hotfix/*` | Idem, plus le tag `candidate-*`, puis PR automatique de **staging** dans `gest-asso-deploiement`. |
| Push sur `main` | Rien : aucune image n'est reconstruite. |
| Tag `vX.Y.Z` | `promote-release.yml` lit les digests déployés en **staging**, vérifie qu'ils ont été construits depuis le commit tagué, les retague en `vX.Y.Z` sans rebuild, puis ouvre la PR de **production**. |

Aucun alias mutable (`latest`, `latest-int`) n'est publié. Un scan Trivy qui
trouve une vulnérabilité `CRITICAL` corrigeable bloque la publication ; une
exception doit être justifiée et datée dans `.trivyignore`.

Le digest publié est toujours celui qui a été scanné et testé : les tags sont
ajoutés par retag, sans rebuild. Les tags `validation-*` d'un run en échec
restent dans le registre mais ne sont jamais référencés par un déploiement.

Le workflow de promotion échoue si le commit tagué n'est pas dans `main`, ou si
les images déployées en staging ne proviennent pas de ce commit (label OCI
`org.opencontainers.image.revision`). Un commit ajouté à la release après la
validation staging doit donc repasser par la staging avant d'être tagué. Les tags historiques comme
`V1.1.0` ne sont pas réécrits, mais ne déclenchent pas la promotion.

## Déployer et revenir en arrière

Le dépôt `gest-asso-deploiement` est la seule source de vérité du déploiement
(voir `contribo-deploiement/PORTAINER.md`) :

1. La CI ouvre une PR `deploy(staging): ...` ou `deploy(production): ...` qui
   modifie uniquement les deux lignes `image:` de l'environnement.
2. Fusionner la PR : Portainer redéploie la stack depuis `main`.
3. Vérifier avec `scripts/smoke-test.sh https://<url-de-l-environnement>`.
4. En cas de régression : **revert** de la PR de déploiement. La paire de
   digests précédente revient depuis l'historique Git ; secrets et données ne
   changent pas. Une migration de schéma incompatible exige une migration
   corrective avant tout rollback.

## Hotfix

1. Créer `hotfix/<description>` depuis `main`.
2. Pousser la branche : la candidate est publiée et la PR de staging ouverte.
3. Ouvrir une PR vers `main`, attendre les validations et la fusionner par merge commit.
4. Poser et pousser le tag `vX.Y.Z` sur la tête du hotfix.
5. Réintégrer le hotfix dans `develop`.
