## MODIFIED Requirements

### Requirement: Session d'authentification en cookie sécurisé

Le login SHALL établir la session avec un cookie de type `__Host-` portant `HttpOnly`, `Secure`, `SameSite=Strict` et `Path=/`, sans exposer le JWT dans le corps JSON ni dans un stockage accessible au JavaScript. La durée de validité de la session SHALL être limitée à 30 minutes, soit 1800 secondes, au maximum pour ce ticket.

#### Scenario: Connexion réussie
- **WHEN** un compte actif fournit des identifiants valides à `POST /auth/login`
- **THEN** la réponse pose le cookie de session avec les attributs de sécurité requis
- **THEN** la réponse ne contient pas de JWT exploitable par le frontend
- **THEN** le JWT et le cookie expirent au plus tard après 1800 secondes

#### Scenario: Déconnexion
- **WHEN** l'utilisateur appelle l'action de déconnexion
- **THEN** le cookie de session est supprimé ou expiré côté serveur
- **THEN** une réutilisation de l'ancienne session échoue
