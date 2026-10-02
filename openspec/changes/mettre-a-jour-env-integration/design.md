## Contexte

`compose.integration.yaml` exige des variables pour les images immuables, les
secrets PostgreSQL et RSA, le proxy de confiance et les certificats TLS. Son
fichier exemple doit fournir le même contrat d'environnement sans contenir de
valeurs sensibles.

## Décisions

- Conserver des placeholders explicites pour les valeurs dépendantes de
  l'environnement.
- Utiliser `FRONTEND_HTTP_PORT` et `FRONTEND_HTTPS_PORT`, consommées par la
  stack, à la place de `FRONTEND_PORT`.
- Garder les références d'images sous forme de tags de release ou de digests,
  sans utiliser `latest`.

## Validation

Comparer les clés de l'exemple aux interpolations de `compose.integration.yaml`,
valider la syntaxe et exécuter les contrôles du registre des tickets.
