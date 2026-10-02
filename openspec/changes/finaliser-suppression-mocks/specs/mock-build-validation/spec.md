## REMOVED Requirements

### Requirement: Compilation des configurations frontend

**Reason**: La configuration Angular mock et la commande de démarrage associée n'existent plus.

**Migration**: Compiler et servir les configurations réelles `development` et `production` avec le backend disponible.

### Requirement: Validation du JSON du barème par handler mock

**Reason**: La validation doit être portée par l'endpoint backend réel, pas par un handler de démonstration.

**Migration**: Vérifier les règles du barème via l'API réelle et conserver les tests unitaires frontend nécessaires.

### Requirement: Contrôle de compilation en configuration mock

**Reason**: Aucun build mock n'est plus maintenu dans la chaîne frontend.

**Migration**: La CI valide le build réel, les tests frontend et les contrôles tooling configurés.
