## MODIFIED Requirements

### Requirement: La stack Portainer utilise les secrets fichiers et les réseaux attendus

La stack SHALL déployer uniquement le backend et le frontend, utiliser les
images GHCR sélectionnées par `IMAGE_TAG`, monter les clés RSA depuis des
secrets fichiers, joindre les réseaux externes PostgreSQL et proxy, et conserver
un réseau interne privé entre backend et frontend. Les fichiers référencés par
`file:` SHALL être préparés avec un propriétaire ou un groupe permettant leur
lecture par l'UID runtime 10001, sans rendre les secrets publics. La
documentation SHALL fournir une migration pour les secrets existants et une
vérification par `stat` avant redéploiement.

#### Scenario: Déploiement nominal

- **WHEN** les réseaux externes, les images et les fichiers secrets sont
  disponibles avec des permissions compatibles avec UID 10001
- **THEN** le backend et le frontend démarrent, le frontend peut joindre le
  backend sur le réseau interne et aucun port backend n'est publié sur le réseau
  public
- **THEN** le backend lit le mot de passe PostgreSQL et les clés RSA sans
  exécuter sous root

#### Scenario: Secret hôte incompatible

- **WHEN** un fichier secret monté par `file:` reste propriétaire de root avec
  un mode qui interdit sa lecture à UID 10001
- **THEN** la procédure de pré-déploiement signale le fichier et bloque la
  migration avant le pull de la nouvelle image
- **THEN** aucun redéploiement silencieux ne doit démarrer le backend sans son
  mot de passe PostgreSQL

#### Scenario: Migration des secrets existants

- **WHEN** une stack existante doit passer au runtime non-root
- **THEN** l'administrateur ajuste le propriétaire ou le groupe et le mode de
  chaque secret selon la procédure documentée
- **THEN** un contrôle de lisibilité par UID 10001 est exécuté avant le
  redéploiement

#### Scenario: Déploiement nominal avec rollback

- **WHEN** les healthchecks ou la lecture des secrets échouent après le
  redéploiement
- **THEN** l'administrateur peut restaurer la paire de digests précédente sans
  modifier les secrets ni les données PostgreSQL

### Requirement: Le déploiement permet un rollback par tag

La documentation SHALL recommander un tag d'image versionné et SHALL décrire le
changement de `IMAGE_TAG` comme procédure de rollback sans modifier les secrets
ni les données.

#### Scenario: Retour à une version précédente

- **WHEN** l'administrateur remplace `IMAGE_TAG` par une version publiée
  précédente et redéploie la stack
- **THEN** Portainer utilise les deux images de cette version et la procédure ne
  nécessite pas de reconstruire l'image localement
