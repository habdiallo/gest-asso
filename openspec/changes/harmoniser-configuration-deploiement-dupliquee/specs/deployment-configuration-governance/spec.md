## ADDED Requirements

### Requirement: Supprimer les duplications internes de déploiement

Les configurations Nginx locale et de production SHALL partager les routes API,
le fallback de l'application et les limites de débit via des includes communs.
Les différences de transport propres à la production SHALL rester explicites
dans la configuration de production.

#### Scenario: Configurations Nginx harmonisées

- **WHEN** les configurations locale et de production sont contrôlées
- **THEN** les routes `/api/v1`, le fallback SPA et les limites de débit sont
  définis dans les includes communs, sans duplication interne

#### Scenario: Différences de transport conservées

- **WHEN** la configuration de production est comparée à la configuration locale
- **THEN** la redirection HTTP vers HTTPS, TLS et HSTS restent uniquement en
  production

#### Scenario: Contrôle de livraison

- **WHEN** le ticket est validé
- **THEN** son périmètre est couvert par le code ou une décision documentée, ses validations sont tracées et ses dépendances sont respectées
