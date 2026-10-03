## MODIFIED Requirements

### Requirement: CSP compatible avec l'application

Le reverse proxy SHALL appliquer une CSP restrictive compatible avec les bundles Angular, les traductions, les polices et les appels API réellement utilisés par l'application. La CSP SHALL NOT autoriser `unsafe-eval` ou `unsafe-inline` pour les scripts comme solution générale. Les polices nécessaires SHALL être servies depuis les assets de l'application et aucune origine de police tierce ne SHALL être requise.

#### Scenario: Page de connexion sous la CSP effective

- **WHEN** un navigateur ouvre `/login` avec la CSP de l'environnement d'intégration
- **THEN** les traductions françaises, les champs et le bouton sont visibles
- **THEN** aucune erreur `unsafe-eval` ne provient du rendu des traductions

#### Scenario: Police utilisée par l'interface

- **WHEN** le navigateur charge les polices déclarées par le frontend
- **THEN** chaque fichier de police est servi depuis les assets de l'application et l'origine courante
- **THEN** aucune police nécessaire n'est bloquée par la CSP

#### Scenario: Ressource externe non nécessaire

- **WHEN** un script tiers non requis par le fonctionnement métier est injecté par l'infrastructure
- **THEN** son blocage par la CSP ne provoque pas d'erreur fonctionnelle dans le frontend

#### Scenario: Vérification des headers

- **WHEN** la validation interroge l'HTML et un endpoint API de l'image déployée
- **THEN** les directives CSP attendues sont présentes dans les réponses concernées
- **THEN** la validation signale toute divergence entre le fichier Nginx suivi et la configuration effectivement montée
