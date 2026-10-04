## ADDED Requirements

### Requirement: Image frontend autonome et non privilégiée

L'image frontend SHALL démarrer sans montage de configuration, s'exécuter avec un utilisateur non root, écouter en HTTP sur le port interne 8080 et accepter la plage d'adresses du proxy d'entrée par variable d'environnement. Elle MUST NOT embarquer de configuration TLS.

#### Scenario: Démarrage sans montage

- **WHEN** le conteneur frontend est démarré sans volume ni secret
- **THEN** Nginx sert l'application sur le port 8080, le processus ne tourne pas en root et le healthcheck de l'image réussit

#### Scenario: Plage du proxy d'entrée configurée

- **WHEN** la variable de plage du proxy d'entrée est fournie
- **THEN** Nginx retient l'adresse client transmise par ce proxy pour ses limites de débit et l'ignore pour toute autre source

### Requirement: Variantes de composition minimales

Le dépôt applicatif SHALL fournir une seule composition, destinée au développement local et à la CI, qui construit les images ou utilise des images fournies. Les configurations Nginx SHALL partager une seule définition des routes, des limites de débit et des en-têtes. Le healthcheck de chaque service SHALL être défini une seule fois, dans son image.

#### Scenario: Démarrage local

- **WHEN** un développeur lance la composition locale avec des secrets locaux
- **THEN** PostgreSQL, le backend et le frontend démarrent sans autre fichier de composition

#### Scenario: Recherche de variantes obsolètes

- **WHEN** le dossier `contribo-deploiement/` est inspecté
- **THEN** il ne contient ni composition d'intégration, ni configuration Nginx TLS, ni configuration Nginx propre à Portainer

### Requirement: Dépendances d'images suivies

Les images de base des Dockerfiles et les actions GitHub SHALL être surveillées par un outil de mise à jour automatique qui ouvre des PR vers `develop`. Ces PR SHALL être acceptées par le contrôle `Workflow conventions` tout en restant soumises aux autres validations.

#### Scenario: Nouvelle version d'image de base

- **WHEN** une nouvelle version d'une image de base référencée est publiée
- **THEN** une PR de mise à jour est ouverte vers `develop` et passe par la CI complète

#### Scenario: Branche de mise à jour automatique

- **WHEN** le contrôle `Workflow conventions` évalue une PR provenant d'une branche `dependabot/`
- **THEN** il accepte son nom de branche sans assouplir la règle pour les autres branches
