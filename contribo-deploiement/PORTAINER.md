# Déploiement Portainer

La stack `compose.portainer.yaml` déploie les images GHCR du backend et du
frontend sans construire localement. Elle suppose que les réseaux Docker
externes `backend` et `frontend` existent déjà sur l'hôte Portainer. Le réseau
`contribo-internal` est créé par la stack et n'est pas exposé vers l'extérieur.

## Préparer les secrets

Créer une paire RSA dédiée à chaque environnement. La clé privée ne doit jamais
être ajoutée au dépôt, passée en variable multi-ligne ou partagée entre les
environnements.

```bash
install -d -m 700 /opt/contribo/secrets
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 \
  -out /opt/contribo/secrets/rsa_private.pem
openssl rsa -pubout -in /opt/contribo/secrets/rsa_private.pem \
  -out /opt/contribo/secrets/rsa_public.pem
chmod 600 /opt/contribo/secrets/rsa_private.pem
chmod 644 /opt/contribo/secrets/rsa_public.pem
```

Le fichier `db_password` doit être créé au même endroit. Pour créer le premier
administrateur, créer aussi `bootstrap_admin_password` avec au moins 12
caractères et activer `BOOTSTRAP_ADMIN_ENABLED=true` dans les variables de la
stack. Le secret est lu dans le conteneur via
`/run/secrets/bootstrap_admin_password`, puis il n'est jamais réutilisé pour
réinitialiser un compte existant.

Dans Portainer, les chemins peuvent être remplacés par
`DB_PASSWORD_FILE_PATH`, `RSA_PUBLIC_KEY_FILE_PATH`,
`RSA_PRIVATE_KEY_FILE_PATH` et `BOOTSTRAP_ADMIN_PASSWORD_FILE_PATH`.

Un exemple complet de variables pour cette stack est disponible dans
`contribo-deploiement/portainer.env.example`. Le proxy Caddy doit rejoindre le
réseau externe `frontend` et peut relayer le trafic vers le service frontend
sur HTTP interne :

```caddyfile
integration.example.com {
    reverse_proxy frontend:80
}
```

Dans cette composition, Caddy termine le HTTPS public. Les variables de
certificat TLS du frontend et `TRUSTED_PROXY_ADDRESSES` de la composition
d'intégration ne sont pas nécessaires pour la stack Portainer.

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

Vérifier le healthcheck du backend, l'accès à l'application via le proxy et une
connexion suivie d'une requête authentifiée. Après chaque déploiement, conserver
les deux digests précédents.

Pour un rollback, remplacer `BACKEND_IMAGE` et `FRONTEND_IMAGE` par la paire de
digests précédente puis redéployer la stack. Les deux images reviennent alors à
la même version. Les secrets RSA et les données PostgreSQL restent inchangés.
