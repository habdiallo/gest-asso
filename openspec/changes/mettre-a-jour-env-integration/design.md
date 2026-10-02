## Contexte

`compose.integration.yaml` exige des variables pour les images immuables, les
secrets PostgreSQL et RSA, le proxy de confiance et les certificats TLS. Son
fichier exemple doit fournir le même contrat d'environnement sans contenir de
valeurs sensibles.

## Décisions

- Conserver des placeholders explicites pour les valeurs dépendantes de
  l'environnement.
- Documenter l'adresse IP exacte du frontend telle qu'elle est observée par le
  backend, car Nginx relaie les appels API de Caddy vers le backend et le
  résolveur compare cette adresse sans interpréter les plages CIDR.
- Utiliser `FRONTEND_HTTP_PORT` et `FRONTEND_HTTPS_PORT`, consommées par la
  stack, à la place de `FRONTEND_PORT`.
- Garder les références d'images sous forme de tags de release ou de digests,
  sans utiliser `latest`.
- Monter `nginx.portainer.conf` dans le frontend Portainer pour remplacer la
  configuration TLS embarquée par une configuration HTTP interne. Caddy reste
  le seul composant exposé en HTTPS et relaie vers `frontend:80`.
- Activer `TRUSTED_PROXY_HEADERS` et renseigner l'adresse exacte du conteneur
  frontend observée par le backend. La configuration Nginx Portainer restaure
  l'IP client depuis le header Caddy pour conserver les limites par client et
  réémet HSTS.
- Déclarer une plage IP dédiée au réseau interne géré par la stack et fixer
  `FRONTEND_INTERNAL_IP` dans cette plage. Ainsi, `TRUSTED_PROXY_ADDRESSES` ne
  change pas lors d'une recréation du frontend.
- Conserver ce fichier avec `compose.portainer.yaml` dans le dépôt de
  déploiement consommé par Portainer, puis synchroniser la copie de référence
  du dépôt applicatif.

## Validation

Comparer les clés de l'exemple aux interpolations de `compose.integration.yaml`,
valider la syntaxe des deux compositions Portainer et exécuter les contrôles du
registre des tickets et de parité du dépôt de déploiement.
