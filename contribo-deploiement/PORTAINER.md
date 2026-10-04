# Déploiement Portainer

La composition de déploiement, les références d'images par environnement, la
préparation de l'hôte et la configuration Caddy vivent uniquement dans le dépôt
[`habdiallo/gest-asso-deploiement`](https://github.com/habdiallo/gest-asso-deploiement)
(voir son `README.md`). Ce dépôt applicatif fournit les images, le script
`init-secrets.sh` et le smoke test.

## Ce que l'hôte doit fournir

- les réseaux Docker externes `backend` (PostgreSQL) et `frontend` (Caddy) ;
- un répertoire de secrets, par défaut `/opt/contribo/secrets`, monté en lecture
  seule sur `/run/secrets` du backend et lu nativement par Spring Boot
  (`spring.config.import=configtree`) :

| Fichier | Rôle | Obligatoire |
| --- | --- | --- |
| `db_password` | mot de passe PostgreSQL | oui |
| `rsa_private.pem`, `rsa_public.pem` | paire RSA des JWT, une par environnement | oui |
| `bootstrap_admin_password` | création du premier administrateur | non |

Un secret obligatoire absent, vide ou illisible par l'UID `10001` fait échouer
le démarrage du backend avec un message qui nomme le secret, sans sa valeur.
Préparer et contrôler le répertoire avec `init-secrets.sh` (root sur l'hôte) :

```bash
sudo sh contribo-deploiement/init-secrets.sh --dir /opt/contribo/secrets
sudo sh contribo-deploiement/init-secrets.sh --dir /opt/contribo/secrets --check-only
```

Aucun autre fichier de l'hôte n'est nécessaire : l'image frontend embarque sa
configuration Nginx (HTTP sur le port 8080, utilisateur non root) et la plage
du proxy d'entrée se règle par la variable `TRUSTED_PROXY_CIDR`. Caddy porte
TLS, la redirection HTTPS et HSTS, et relaie vers `frontend:8080`.

## Déployer, vérifier, revenir en arrière

Voir [RELEASING.md](../RELEASING.md) : la CI ouvre dans le dépôt de déploiement
une PR de staging (candidate `release/*` ou `hotfix/*`) puis de production (tag
`vX.Y.Z`). Fusionner déploie ; revert de la PR revient à la paire précédente.

Après chaque déploiement :

```bash
scripts/smoke-test.sh https://<url-de-l-environnement>
```

Le script vérifie la page `/login` et ses en-têtes de sécurité (CSP sans
`unsafe-eval`, framing interdit), le cache des traductions et des bundles
hashés, puis le routage de l'API (401 attendu sur des identifiants invalides).

## Migrer une stack existante (avant T-208)

À faire une fois, avec la première release contenant T-208. L'ancienne stack
(`compose.portainer.yaml`) reste en place jusqu'à la bascule.

1. Fusionner dans `gest-asso-deploiement` la PR compagnon T-208 (structure
   `compose.base.yaml`, `networks.yaml`, `staging/`, `production/`), puis
   reporter dans chaque `<environnement>/compose.yaml` les digests actuellement
   déployés.
2. Sur l'hôte, conserver `/opt/contribo/secrets` : les noms de fichiers sont
   inchangés. Supprimer `bootstrap_admin_password` s'il est vide, puis lancer
   `init-secrets.sh --check-only`.
3. Adapter Caddy : `reverse_proxy frontend:8080` (au lieu de `:80`) et ajouter
   l'en-tête HSTS, désormais absent de Nginx.
4. Dans Portainer, changer le chemin Compose de la stack en
   `staging/compose.yaml` (ou `production/compose.yaml`), retirer les
   variables devenues inutiles (`BACKEND_IMAGE`, `FRONTEND_IMAGE`,
   `*_FILE_PATH`, `FRONTEND_NGINX_CONFIG_FILE_PATH`, `FRONTEND_INTERNAL_IP`,
   `TRUSTED_PROXY_ADDRESSES`, `SPRING_PROFILE`), arrêter la stack si le réseau
   `contribo-internal` doit être recréé, puis redéployer.
5. Fusionner la PR de staging générée par la CI et lancer le smoke test.
6. Retour arrière de la bascule : revert de la PR compagnon, remettre l'ancien
   chemin Compose, les anciennes variables et `reverse_proxy frontend:80`.
7. Après une release stable, supprimer `/etc/contribo/nginx/` sur l'hôte.

## Prérequis CI

Le secret GitHub `DEPLOYMENT_REPO_TOKEN` du dépôt applicatif doit être un jeton
fin limité au seul dépôt `gest-asso-deploiement`, avec les permissions
**Contents: read and write** et **Pull requests: read and write**. Il sert
uniquement à pousser une branche `deploy/*` et à ouvrir la PR ; aucune fusion
n'est automatique.
