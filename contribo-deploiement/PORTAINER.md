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

Le fichier `db_password` doit être créé au même endroit. Dans Portainer, les
chemins peuvent être remplacés par `DB_PASSWORD_FILE_PATH`,
`RSA_PUBLIC_KEY_FILE_PATH` et `RSA_PRIVATE_KEY_FILE_PATH`.

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

## Promouvoir en production

Après les smoke tests staging et la fusion de la release vers `main`, reprendre
exactement les deux mêmes digests dans la stack de production. Le push vers
`main` ne reconstruit pas une autre image. Le dépôt
`gest-asso-deploiement` contient la même composition sans symlink et peut être
utilisé comme source Git de la stack Portainer.

## Vérifier et revenir en arrière

Vérifier le healthcheck du backend, l'accès à l'application via le proxy et une
connexion suivie d'une requête authentifiée. Après chaque déploiement, conserver
les deux digests précédents.

Pour un rollback, remplacer `BACKEND_IMAGE` et `FRONTEND_IMAGE` par la paire de
digests précédente puis redéployer la stack. Les deux images reviennent alors à
la même version. Les secrets RSA et les données PostgreSQL restent inchangés.
