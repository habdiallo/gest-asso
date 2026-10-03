## ADDED Requirements

### Requirement: Identifiant stable dans le compte utilisateur

Le backend SHALL retourner dans la réponse de création le nouvel identifiant généré et le mot de passe temporaire exactement une fois. Les lectures ultérieures SHALL retourner l'identifiant dans le compte utilisateur autorisé, sans jamais retourner le mot de passe ni son hash.

#### Scenario: Confirmation de création

- **WHEN** un Administrateur ou un Trésorier crée un membre
- **THEN** la réponse contient l'identifiant généré et le mot de passe temporaire
- **AND** l'identifiant ne contient pas nécessairement le téléphone

#### Scenario: Lecture du compte utilisateur

- **WHEN** un Administrateur consulte le détail d'un compte utilisateur
- **THEN** la réponse contient l'identifiant de connexion
- **AND** elle ne contient ni mot de passe temporaire ni hash
