# security-audit-logging Specification

## Purpose
TBD - created by archiving change durcissement-securite-production. Update Purpose after archive.
## Requirements
### Requirement: Événements de sécurité journalisés

Le backend SHALL journaliser les connexions réussies, les échecs de connexion, les refus d'autorisation, les tokens invalides et les limitations déclenchées. Chaque événement SHALL contenir un type, un résultat, un horodatage et un identifiant de corrélation, avec les identifiants techniques minimaux au diagnostic.

#### Scenario: Échec de connexion
- **WHEN** un login échoue pour un identifiant inconnu, un compte inactif ou un mot de passe incorrect
- **THEN** un événement d'échec est écrit avec le même niveau de détail externe pour ces cas
- **THEN** le mot de passe et le contenu de la requête ne sont pas journalisés

#### Scenario: Token invalide ou autorisation refusée
- **WHEN** un token invalide est présenté ou qu'une autorisation est refusée
- **THEN** un événement de sécurité correspondant est écrit avec le résultat et la corrélation de la requête
- **THEN** le JWT, le cookie de session et les clés ne sont pas écrits dans le log

### Requirement: Absence de secrets dans les logs

Les logs de sécurité MUST exclure les mots de passe, JWT, cookies de session, clés de signature, secrets d'environnement et corps sensibles. Les identifiants de connexion et adresses IP SHALL être masqués, hachés ou soumis à la politique de rétention validée.

#### Scenario: Inspection d'un lot de logs
- **WHEN** les événements de sécurité d'un scénario de connexion sont collectés
- **THEN** aucune valeur de mot de passe, token, cookie ou clé fournie au scénario n'apparaît dans les messages ou champs structurés

