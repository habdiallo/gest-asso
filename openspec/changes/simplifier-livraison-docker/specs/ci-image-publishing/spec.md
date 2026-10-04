## MODIFIED Requirements

### Requirement: Les images publiées sont versionnées

Le workflow SHALL publier les images backend et frontend uniquement sous des références immuables : un tag `sha-<commit>` pour chaque push validé sur `develop`, `release/vX.Y.Z` ou `hotfix/<description>`, et un tag semver `vX.Y.Z` créé par retag du digest déjà validé lorsqu'un tag Git `vX.Y.Z` est poussé. Le workflow MUST NOT publier d'alias mutable (`latest`, `latest-int` ou tag de branche) et MUST NOT reconstruire une image lors d'un push sur `main` ou d'un tag.

#### Scenario: Publication de l'intégration

- **WHEN** un changement validé est poussé sur `develop`
- **THEN** les deux images sont poussées avec un tag `sha-<commit>` et aucun alias mutable

#### Scenario: Publication semver par retag

- **WHEN** un tag Git `vX.Y.Z` est poussé sur un commit dont les images `sha-<commit>` existent
- **THEN** les deux images reçoivent le tag `vX.Y.Z` sur leurs digests existants, sans nouveau build ni clé RSA publiée

#### Scenario: Tag sans image candidate

- **WHEN** un tag Git `vX.Y.Z` est poussé sur un commit qui n'a pas d'images `sha-<commit>` publiées
- **THEN** le workflow échoue explicitement sans construire ni publier d'image

#### Scenario: Tag au format invalide

- **WHEN** un tag Git ne respecte pas le format `v<majeur>.<mineur>.<correctif>` en minuscule
- **THEN** le workflow de promotion n'est pas déclenché

#### Scenario: Push sur main

- **WHEN** une release ou un hotfix est fusionné sur `main`
- **THEN** aucune image n'est reconstruite ni republiée

## ADDED Requirements

### Requirement: Les images sont analysées et attestées

Le workflow SHALL analyser chaque image backend et frontend construite avec un scanner de vulnérabilités avant toute publication, SHALL échouer si une vulnérabilité `CRITICAL` corrigeable est détectée, et SHALL attacher un SBOM et une attestation de provenance à chaque image publiée.

#### Scenario: Image saine publiée

- **WHEN** une image ne contient aucune vulnérabilité `CRITICAL` corrigeable
- **THEN** elle est publiée avec un SBOM et une attestation de provenance consultables dans le registre

#### Scenario: Vulnérabilité critique détectée

- **WHEN** le scan détecte une vulnérabilité `CRITICAL` pour laquelle un correctif existe
- **THEN** le workflow échoue et aucune des deux images n'est publiée

### Requirement: Smoke test conteneurisé avant publication

Le workflow SHALL démarrer la composition locale avec les images construites, une base PostgreSQL éphémère et des secrets éphémères, puis exécuter le script de smoke test versionné. Un échec MUST bloquer la publication. Le même script SHALL être utilisable contre une URL déployée.

#### Scenario: Stack fonctionnelle

- **WHEN** les images démarrent, passent leurs healthchecks et que le smoke test vérifie la page `/login`, ses en-têtes de sécurité, les règles de cache et une réponse de l'API sous `/api/v1`
- **THEN** le job réussit et la publication peut continuer

#### Scenario: Régression d'exécution

- **WHEN** un service ne devient pas sain ou qu'une vérification du smoke test échoue
- **THEN** le job échoue avec les journaux des conteneurs et aucune image n'est publiée

#### Scenario: Vérification après déploiement

- **WHEN** le mainteneur exécute le script de smoke test avec l'URL publique d'un environnement
- **THEN** le script applique les mêmes vérifications et retourne un code non nul en cas d'échec

### Requirement: Validation frontend unique par PR

Les tests et le build frontend SHALL s'exécuter une seule fois par événement de PR, avec la même version majeure de Node.js que l'image frontend, tout en conservant le nom de contrôle requis par la protection de branche.

#### Scenario: PR modifiant le frontend

- **WHEN** une PR vers `develop` ou `main` est ouverte
- **THEN** un seul job exécute `npm test` et `npm run build` pour le frontend et son statut porte le nom attendu par la protection de branche
