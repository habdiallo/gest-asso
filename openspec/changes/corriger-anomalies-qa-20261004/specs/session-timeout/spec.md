# session-timeout Specification

## Requirements

### Requirement: La durée JWT et cookie est configurable et cohérente

Le backend SHALL utiliser une même durée configurable pour l'expiration du JWT et le `Max-Age` du cookie de session. La valeur par défaut de l'environnement d'intégration SHALL être de 1800 secondes. La valeur SHALL rester bornée à 1800 secondes maximum par ce ticket et SHALL conserver les attributs `HttpOnly`, `Secure`, `SameSite=Strict` et `Path=/`.

#### Scenario: Session de 30 minutes

- **WHEN** le backend démarre avec la valeur par défaut
- **THEN** le JWT expire à 1800 secondes et le cookie porte `Max-Age=1800`

#### Scenario: Configuration hors borne

- **WHEN** une durée supérieure à 1800 secondes est configurée
- **THEN** le démarrage échoue avec une erreur de configuration explicite

