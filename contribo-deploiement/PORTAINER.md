# Déploiement Portainer

La stack `compose.portainer.yaml` déploie les images GHCR du backend et du
frontend sans construire localement. Elle suppose que les réseaux Docker
externes `backend` et `frontend` existent déjà sur l'hôte Portainer. Le réseau
`contribo-internal` est créé par la stack et n'est pas exposé vers l'extérieur.

## Préparer les secrets

Créer une paire RSA dédiée à chaque environnement. La clé privée ne doit jamais
être ajoutée au dépôt, passée en variable multi-ligne ou partagée entre les
environnements. Les chemins réels sont ceux des variables
`DB_PASSWORD_FILE_PATH`, `RSA_PUBLIC_KEY_FILE_PATH`,
`RSA_PRIVATE_KEY_FILE_PATH` et `BOOTSTRAP_ADMIN_PASSWORD_FILE_PATH`.

La préparation est automatisée par `prepare-secrets.sh`. Elle lit les chemins
de l'environnement Compose, crée la paire RSA si nécessaire, crée un fichier
bootstrap vide si le bootstrap est désactivé, applique le propriétaire UID/GID
`10001`, limite les modes à `400`, puis vérifie la lecture effective avec cet
UID. Elle ne génère jamais un mot de passe PostgreSQL ou un mot de passe
bootstrap.

```bash
sudo ./contribo-deploiement/prepare-secrets.sh \
  --env-file /chemin/vers/portainer.env
sudo ./contribo-deploiement/prepare-secrets.sh \
  --env-file /chemin/vers/portainer.env \
  --check-only
```

Le fichier `db_password` doit être créé au même endroit. Le fichier
`bootstrap_admin_password` doit exister même lorsque
`BOOTSTRAP_ADMIN_ENABLED=false`, car il est toujours monté par la stack. Dans
ce cas, un fichier vide suffit. Pour créer le premier administrateur, renseigner
ce fichier avec au moins 12 caractères et activer
`BOOTSTRAP_ADMIN_ENABLED=true` dans les variables de la stack. Le secret est lu dans le conteneur via
`/run/secrets/bootstrap_admin_password`, puis il n'est jamais réutilisé pour
réinitialiser un compte existant.

Lorsque `BOOTSTRAP_ADMIN_ENABLED=true`, ajouter `--require-bootstrap` aux deux
commandes du script afin de refuser un fichier vide. Avec le bootstrap désactivé,
le fichier vide créé par le script est suffisant pour le montage Compose.

Dans Portainer, les chemins peuvent être remplacés par ces mêmes variables.
Ne pas supposer que le chemin est `/opt` ou `/etc` : l'environnement utilisé par
la stack est la source de vérité. Le fichier Compose conserve `/opt/contribo/secrets`
comme fallback historique lorsque ces variables sont absentes.

Un exemple complet de variables pour cette stack est disponible dans
`contribo-deploiement/portainer.env.example`. Le proxy Caddy doit rejoindre le
réseau externe `frontend` et peut relayer le trafic vers le service frontend
sur HTTP interne :

```caddyfile
integration.example.com {
    header Strict-Transport-Security "max-age=31536000; includeSubDomains"
    reverse_proxy frontend:80
}
```

La stack monte également `nginx.portainer.conf` dans le frontend. Ce fichier
force Nginx à écouter en HTTP sur le port 80 interne, car l'image frontend
embarque par défaut la configuration TLS de la stack d'intégration. Le
montage utilise `FRONTEND_NGINX_CONFIG_FILE_PATH`, un chemin absolu du système
de fichiers de l'hôte Docker. Ne pas placer ce fichier uniquement dans
`portainer_data` : ce volume est visible par le conteneur Portainer, mais le
démon Docker résout le bind mount sur l'hôte.

Préparer le fichier sur l'hôte avant de déployer ou redéployer la stack :

```bash
install -d -m 755 /etc/contribo/nginx
install -m 644 /chemin/vers/nginx.portainer.conf \
  /etc/contribo/nginx/nginx.portainer.conf
test -f /etc/contribo/nginx/nginx.portainer.conf
```

Définir ensuite `FRONTEND_NGINX_CONFIG_FILE_PATH` dans les variables de la
stack, puis utiliser l'action de rafraîchissement Git de Portainer avant le
redéploiement. Vérifier aussi que le chemin est bien un fichier régulier sur
l'hôte avec `stat` et non un répertoire. La syntaxe longue du montage désactive
la création automatique du chemin source : si le fichier est absent ou si le
chemin est un répertoire, Compose refuse le démarrage avec une erreur explicite.
Le fichier récupère l'IP client
transmise par Caddy pour que les limites de débit Nginx restent indexées par
client. La configuration couvre la plage Docker privée `172.16.0.0/12`;
adapter `set_real_ip_from` si le réseau Docker `frontend` utilise une autre
plage.

Après un ancien montage avec création automatique, Docker peut avoir créé un
répertoire au chemin configuré, par exemple
`/etc/contribo/nginx/nginx.portainer.conf`, ou à l'ancien chemin relatif
`/data/compose/<stack-id>/nginx.portainer.conf`. Arrêter la stack, inspecter
le chemin concerné sur l'hôte, puis supprimer uniquement ce répertoire s'il est
vide, dédié à cette stack et confirmé comme obsolète :

```bash
ls -ld /etc/contribo/nginx/nginx.portainer.conf
rmdir /etc/contribo/nginx/nginx.portainer.conf
ls -ld /data/compose/<stack-id>/nginx.portainer.conf
rmdir /data/compose/<stack-id>/nginx.portainer.conf
```

Dans cette composition, Caddy termine le HTTPS public, mais le backend doit
faire confiance explicitement à l'adresse IP du conteneur frontend sur le
réseau `contribo-internal`. Définir `TRUSTED_PROXY_HEADERS=true` et
`TRUSTED_PROXY_ADDRESSES=172.30.0.10` dans les variables de la stack. La
composition fixe cette adresse avec `FRONTEND_INTERNAL_IP` sur le réseau
`INTERNAL_NETWORK_SUBNET`. Les variables de certificat TLS du frontend restent
inutiles pour Portainer.

Par défaut, utiliser :

```text
INTERNAL_NETWORK_SUBNET=172.30.0.0/24
FRONTEND_INTERNAL_IP=172.30.0.10
TRUSTED_PROXY_ADDRESSES=172.30.0.10
```

Choisir une plage qui n'est utilisée par aucun autre réseau Docker de l'hôte.
Si `contribo-internal` existe déjà avec une ancienne configuration, arrêter la
stack, vérifier avec `docker network inspect contribo-internal` qu'elle ne
contient que les conteneurs Contribo, puis la recréer lors du prochain
déploiement. Ne pas supprimer un réseau partagé par d'autres stacks.

Le bootstrap ne s'exécute que si aucun compte administrateur ni autre compte
utilisateur n'existe. Il crée l'association, une catégorie de revenu, le
membre technique et son compte administrateur avec `must_change_password`.
Après la première connexion, changer le mot de passe. Ensuite, laisser
`BOOTSTRAP_ADMIN_ENABLED=false` pour les redémarrages normaux.

## Déployer une candidate en staging

Le workflow GitHub Actions publie une candidate depuis une branche
`release/vX.Y.Z` ou `hotfix/*` après les validations backend et frontend. Le
résumé du workflow fournit les deux digests à utiliser ensemble :

```text
BACKEND_IMAGE=ghcr.io/habdiallo/contribo-back@sha256:<digest-backend>
FRONTEND_IMAGE=ghcr.io/habdiallo/contribo-front@sha256:<digest-frontend>
```

Définir ces deux variables ainsi que `DB_HOST`, `DB_PORT`, `DB_NAME` et
`DB_USERNAME` dans la stack staging. Les deux digests doivent provenir du même
run CI. Les tags `latest`, les tags de branche et les références absentes sont
interdits par la composition.

Les réseaux externes peuvent être renommés avec `DATABASE_NETWORK` et
`PROXY_NETWORK`. Le proxy doit joindre le service `frontend` sur le réseau
`frontend`; le frontend joint le backend uniquement sur
`contribo-internal`.

## Source de vérité et synchronisation

Les routes API, le fallback de l'application et les limites de débit sont
partagés par les configurations Nginx locale et de production via les includes
`nginx-application-locations.conf` et `nginx-rate-limits.conf`. La configuration
de production conserve ses différences nécessaires : redirection HTTP vers
HTTPS, certificats TLS et HSTS.

Le dépôt `habdiallo/gest-asso-deploiement`, branche `main`, est la source de
vérité consommée par Portainer pour la composition de production. La copie
`contribo-deploiement/compose.portainer.yaml` de ce dépôt applicatif est un
miroir de référence pour les développeurs et la CI.

Toute modification de la composition doit être livrée dans deux PR
synchronisées : d'abord dans `gest-asso-deploiement`, puis dans ce dépôt avec
la même composition. Le workflow `Deployment repository parity` compare les
deux fichiers sur `develop` et `main` et bloque toute divergence.

Le dépôt applicatif doit posséder le secret GitHub `DEPLOYMENT_REPO_TOKEN`,
limité à la lecture du dépôt privé `gest-asso-deploiement`. Ce jeton est utilisé
uniquement par le checkout CI du dépôt de déploiement et ne doit jamais être
écrit dans les fichiers de configuration ou les logs.

## Promouvoir en production

Après les smoke tests staging et la fusion de la release vers `main`, reprendre
exactement les deux mêmes digests dans la stack de production. Le push vers
`main` ne reconstruit pas une autre image. Après la fusion des PR
synchronisées, Portainer doit continuer à pointer vers la branche `main` de
`gest-asso-deploiement`.

## Vérifier et revenir en arrière

Avant chaque pull d'image, exécuter le contrôle sans mutation :

```bash
sudo ./contribo-deploiement/prepare-secrets.sh \
  --env-file /chemin/vers/portainer.env \
  --check-only
```

Vérifier le healthcheck du backend, l'accès à l'application via le proxy et une
connexion suivie d'une requête authentifiée. Après chaque déploiement, conserver
les deux digests précédents.

Après le redéploiement frontend, vérifier depuis un poste client que l'image et
le fichier Nginx monté correspondent bien à la candidate :

```bash
docker inspect contribo-frontend --format '{{.Config.Image}}'
docker inspect contribo-frontend --format '{{range .Mounts}}{{println .Source .Destination}}{{end}}'
curl -fsSI https://integration.example.com/login
curl -fsSI https://integration.example.com/assets/i18n/fr.json
curl -fsSI https://integration.example.com/fonts/outfit-300.woff2
```

La réponse de `/login` doit contenir la CSP sans `unsafe-eval`, la réponse du
fichier de traduction doit être servie sans cache persistant, et les bundles
hashés ainsi que les polices doivent porter un cache longue durée. Ouvrir
ensuite `/login` avec le cache vidé puis une seconde fois avec le cache chaud,
et confirmer dans la console que les libellés français et la police locale sont
présents sans erreur CSP bloquante. Si le fichier monté diffère du dépôt, mettre
à jour `FRONTEND_NGINX_CONFIG_FILE_PATH` sur l'hôte puis redéployer la stack.

Pour un rollback, remplacer `BACKEND_IMAGE` et `FRONTEND_IMAGE` par la paire de
digests précédente puis redéployer la stack. Les deux images reviennent alors à
la même version. Les secrets RSA et les données PostgreSQL restent inchangés.
