## 1. Ticket et contrat d'environnement

- [x] 1.1 [T-195] Résoudre T-195, confirmer `infra/chore-195-mettre-a-jour-env-integration` et exécuter `node scripts/tickets.mjs verify T-195` avant la modification.
- [x] 1.2 [T-195] Comparer les variables interpolées par `compose.integration.yaml` avec `integration.env.example` et recenser les écarts.

## 2. Mise à jour et validation

- [x] 2.1 [T-195] Mettre à jour `integration.env.example` avec les variables de proxy, TLS et ports réellement consommées, sans secret réel.
- [x] 2.2 [T-195] Valider le fichier, le registre des tickets, le périmètre Git et préparer une PR vers `develop`.
- [x] 2.3 [T-195] Ajouter un exemple Portainer cohérent avec les réseaux externes, la base PostgreSQL existante et la terminaison TLS par Caddy.
- [x] 2.4 [T-195] Corriger la stack Portainer pour monter la configuration Nginx HTTP dédiée, documenter le fichier requis et synchroniser le dépôt consommé par Portainer.
- [x] 2.5 [T-195] Traiter la revue Portainer : restaurer l'IP client pour les limites de débit, activer la confiance proxy backend et rétablir HSTS.
- [x] 2.6 [T-195] Stabiliser l'IP interne du frontend et documenter la recréation sûre du réseau Docker si sa configuration existante doit être remplacée.
