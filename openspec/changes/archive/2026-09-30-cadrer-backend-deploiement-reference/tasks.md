## 1. Audit et qualification des sources

- [x] 1.1 [T-142] Sur `fullstack/chore-142-cadrage-backend-deploiement`, vérifier le ticket avec `node scripts/tickets.mjs resolve T-142 --json`, relire les sources fonctionnelles actuelles (`besoins/openapi.yaml`, cahier MVP, specs OpenSpec, README frontend) et consigner les contraintes vérifiables du backend attendu.
- [x] 1.2 [T-142] Auditer `/Users/habdiallo/Workspace/project-perso/saas-asso` en lecture seule, comparer `HEAD` à l'état de travail, puis relever séparément les patterns d'architecture, de génération API, de configuration, de sécurité, de persistance, de conteneurisation et de déploiement.
- [x] 1.3 [T-142] Compléter la matrice de réutilisation en classant chaque élément comme réutilisable tel quel, adaptable ou à écarter, avec la justification, les risques et la référence au contrat ou aux règles actuelles de Contribo.

## 2. Direction technique et contrats

- [x] 2.1 [T-142] Documenter la direction d'architecture backend hexagonale et de déploiement pour Contribo, en séparant domaine, cas d'usage, adapters, persistance, sécurité, environnements, images, reverse proxy, healthchecks et rollback, sans reprendre de logique métier de la référence.
- [x] 2.2 [T-142] Définir la gouvernance API Design First autour de `besoins/openapi.yaml`, incluant l'ordre de modification du contrat, la validation, la génération backend éventuelle, la régénération Angular, l'alignement MSW, la compatibilité et les changements d'autorisation.

## 3. Validation et préparation de livraison

- [x] 3.1 [T-142] Vérifier que les specs couvrent les succès, erreurs, autorisations, dérives de contrat, secrets, santé et rollback, puis exécuter les contrôles OpenSpec et `node scripts/tickets.mjs check` sans modifier de code applicatif.
- [x] 3.2 [T-142] Relire le diff documentaire ciblé, confirmer que `main` n'est pas modifiée ni poussée, puis préparer la PR de `fullstack/chore-142-cadrage-backend-deploiement` vers `main` avec le périmètre, les limites de l'analyse et les futurs tickets backend, frontend et déploiement à attribuer.
