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

## Déployer

Définir `GHCR_OWNER`, `IMAGE_TAG`, `DB_HOST`, `DB_PORT`, `DB_NAME` et
`DB_USERNAME` dans les variables de la stack. `IMAGE_TAG` vaut `latest-int` par
défaut, mais un tag SHA ou semver immuable est recommandé.

Les réseaux externes peuvent être renommés avec `DATABASE_NETWORK` et
`PROXY_NETWORK`. Le proxy doit joindre le service `frontend` sur le réseau
`frontend`; le frontend joint le backend uniquement sur
`contribo-internal`.

## Vérifier et revenir en arrière

Vérifier le healthcheck du backend, l'accès à l'application via le proxy et une
connexion suivie d'une requête authentifiée. Après chaque déploiement, conserver
le tag précédent.

Pour un rollback, remplacer `IMAGE_TAG` par le tag précédent et redéployer la
stack. Les deux images reviennent alors à la même version. Les secrets RSA et les
données PostgreSQL restent inchangés.
