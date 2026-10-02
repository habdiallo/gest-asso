## MODIFIED Requirements

### Requirement: Alias stables pour les imports profonds

Le frontend MUST utiliser des alias TypeScript pour les imports qui traversent plusieurs racines stables, notamment `@assets/*` pour `src/assets/*`. Les alias existants `@core/*`, `@shared/*`, `@features/*` et `@api` MUST respecter les frontières d'architecture et ne MUST NOT masquer une dépendance directe entre features.

#### Scenario: Import global profond migré

- **WHEN** un module importe une ressource globale avec plusieurs remontées `../`
- **THEN** l'import utilise l'alias racine correspondant et résout de manière identique dans le build, les tests, le lint et les outils TypeScript

#### Scenario: Import local à une feature

- **WHEN** un module importe un voisin strictement local à la même feature
- **THEN** un chemin relatif peut être conservé si celui-ci rend la dépendance locale plus explicite

#### Scenario: Dépendance entre features

- **WHEN** un import tente de relier directement deux features
- **THEN** l'alias ne contourne pas le contrôle d'architecture et la dépendance est refusée, déplacée vers une frontière neutre ou traitée par un ticket distinct
