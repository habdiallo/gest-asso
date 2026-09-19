# frontend-initialization Specification

## Purpose
TBD - created by archiving change initialisation-front-features. Update Purpose after archive.
## Requirements
### Requirement: Architecture frontend par fonctionnalités
Le frontend SHALL organiser les responsabilités métier dans `features/<feature>/`,
les responsabilités globales dans `core/` et les éléments neutres réutilisés dans
`shared/`. Il MUST charger la première fonctionnalité paresseusement et ne MUST
pas imposer de couches hexagonales, ports ou adapters frontend.

#### Scenario: Accès à la première fonctionnalité
- **WHEN** le navigateur ouvre la route racine
- **THEN** une page d'accueil Contribo en français est chargée par une route lazy et rendue dans le shell.

#### Scenario: Dépendances du socle
- **WHEN** un fichier de `core/` ou `shared/` importe une fonctionnalité via les alias ou un chemin relatif vers `features/`
- **THEN** le lint signale la dépendance interdite.

### Requirement: Outillage cohérent avec le frontend navigateur
Le projet SHALL proposer lint TypeScript/templates/accessibilité, formatage
Prettier, tests Vitest et build Angular strict, avec des dépendances compatibles
Angular 21. Il MUST conserver une seule configuration PostCSS active et ne MUST
pas ajouter SSR, Express, traduction multilingue ou bibliothèques UI sans besoin.

#### Scenario: Vérification du socle
- **WHEN** le développeur exécute lint, contrôle Prettier, tests non interactifs et build de production
- **THEN** les commandes terminent avec succès et les tests ne nécessitent pas de backend.

### Requirement: Génération API depuis le contrat partagé
La génération SHALL produire les modèles et services Angular depuis
`besoins/openapi.yaml`, avec une version de générateur fixée. Le code généré MUST
compiler en TypeScript strict et préserver les propriétés optionnelles/nullables
pertinentes ; il ne MUST pas être édité manuellement ni entrer dans le lint/format.

#### Scenario: Génération reproductible
- **WHEN** le développeur exécute `npm run generate:api` puis compile l'application et le généré
- **THEN** le client utilise `/api/v1`, les types reflètent le contrat et la compilation réussit.

#### Scenario: Développement du shell sans client
- **WHEN** le client n'a pas encore été généré et aucune feature API ne le consomme
- **THEN** le shell peut être construit et testé sans déclencher Java ni la génération.

### Requirement: Proxy de développement conforme au contrat
Le serveur Angular SHALL rediriger les sous-chemins `/api/v1/...` via le proxy de
développement, sans modifier le chemin contractuel. Il MUST documenter la cible
locale comme convention tant que le backend n'est pas disponible.

#### Scenario: Routage d'une requête imbriquée
- **WHEN** une requête vise `/api/v1/members/identifiant`
- **THEN** le proxy transmet ce même chemin au serveur local configuré.

