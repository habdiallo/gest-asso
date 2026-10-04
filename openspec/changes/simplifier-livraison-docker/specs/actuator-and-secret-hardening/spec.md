## MODIFIED Requirements

### Requirement: Secrets obligatoires sans valeur connue

Les environnements d'intégration et de production SHALL fournir les secrets PostgreSQL et JWT par injection externe, sous forme de fichiers lus directement par l'application au démarrage, sans script d'entrée intermédiaire. L'application SHALL échouer au démarrage avec une erreur de configuration explicite, sans afficher la valeur du secret, si un secret obligatoire est absent, vide ou illisible.

#### Scenario: Secret de production absent
- **WHEN** le backend démarre sans mot de passe PostgreSQL ou clé JWT dans les sources de configuration
- **THEN** le démarrage échoue avant l'acceptation de trafic
- **THEN** aucune valeur `contribo` ou autre valeur connue n'est utilisée comme repli

#### Scenario: Secret fichier illisible
- **WHEN** un fichier de secret existe mais n'est pas lisible par l'UID runtime
- **THEN** le démarrage échoue avec un message qui nomme le secret concerné sans révéler son contenu

#### Scenario: Secret fichier lu nativement
- **WHEN** le répertoire de secrets monté contient le mot de passe PostgreSQL
- **THEN** le backend l'utilise sans variable `DB_PASSWORD_FILE` ni script d'entrée shell

#### Scenario: Secret local explicite
- **WHEN** le Compose de développement est démarré avec son fichier d'environnement local explicitement choisi
- **THEN** le service fonctionne avec des valeurs de développement documentées
- **THEN** ces valeurs ne sont pas utilisées par les manifests d'intégration ou de production
