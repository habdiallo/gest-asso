## MODIFIED Requirements

### Requirement: Secrets obligatoires sans valeur connue

Les profils d'intégration et de production SHALL exiger les secrets PostgreSQL
et JWT par injection externe. L'application SHALL échouer au démarrage avec une
erreur de configuration explicite si un secret obligatoire est absent, vide ou
illisible. Quand `DB_PASSWORD_FILE` est défini, l'entrypoint MUST vérifier le
fichier avant de lancer la JVM et MUST retourner un code non nul sans afficher
sa valeur.

#### Scenario: Secret de production absent

- **WHEN** le backend démarre avec un profil d'intégration ou de production sans
  mot de passe PostgreSQL ou clé JWT
- **THEN** le démarrage échoue avant l'acceptation de trafic
- **THEN** aucune valeur `contribo` ou autre valeur connue n'est utilisée comme
  repli

#### Scenario: Fichier de mot de passe illisible

- **WHEN** `DB_PASSWORD_FILE` pointe vers un fichier absent, vide ou illisible
- **THEN** l'entrypoint écrit un diagnostic générique sur stderr et quitte avec
  un code non nul
- **THEN** la JVM n'est pas lancée et le contenu du fichier n'apparaît jamais
  dans les logs

#### Scenario: Fichier de mot de passe lisible

- **WHEN** `DB_PASSWORD_FILE` pointe vers un fichier non vide lisible par l'UID
  runtime 10001
- **THEN** l'entrypoint exporte la valeur pour Spring Boot et lance la JVM
- **THEN** la valeur n'est pas écrite dans les logs

#### Scenario: Clé RSA illisible

- **WHEN** le backend démarre avec une ressource RSA absente ou illisible par
  l'utilisateur du conteneur
- **THEN** l'application échoue explicitement avant d'accepter du trafic
- **THEN** l'erreur ne révèle pas le contenu de la clé privée

#### Scenario: Secret local explicite

- **WHEN** le Compose de développement est démarré avec son fichier
  d'environnement local explicitement choisi
- **THEN** le service fonctionne avec des valeurs de développement documentées
- **THEN** ces valeurs ne sont pas utilisées par les manifests d'intégration ou
  de production
