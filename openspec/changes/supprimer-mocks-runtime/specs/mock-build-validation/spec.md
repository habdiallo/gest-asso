## REMOVED Requirements

### Requirement: Compilation des configurations frontend

**Reason**: La configuration Angular mock, le serveur MSW et le build mock sont supprimés.

**Migration**: Compiler et servir le frontend avec les configurations réelles `development` et `production`, puis tester l'intégration avec le backend actif.

### Requirement: Validation du JSON du barème

**Reason**: Le comportement était porté par un handler MSW supprimé et ne constituait pas une validation du backend.

**Migration**: Vérifier la validation du barème via l'endpoint réel et conserver les tests unitaires du composant ou du service qui ne dépendent pas de MSW.

### Requirement: Contrôle de compilation en PR

**Reason**: Il n'existe plus de configuration mock à compiler dans la CI.

**Migration**: Le workflow frontend compile la configuration réelle et exécute les tests et contrôles tooling existants.
