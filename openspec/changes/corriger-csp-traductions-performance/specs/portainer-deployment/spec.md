## MODIFIED Requirements

### Requirement: La stack Portainer utilise les secrets fichiers et les réseaux attendus

La stack SHALL déployer uniquement le backend et le frontend, utiliser les images GHCR sélectionnées par leurs références immuables, monter les clés RSA depuis des secrets fichiers, joindre les réseaux externes PostgreSQL et proxy, et conserver un réseau interne privé entre backend et frontend. La validation post-déploiement SHALL aussi vérifier que le frontend sert les assets et le fichier Nginx attendus par l'image sélectionnée.

#### Scenario: Déploiement nominal

- **WHEN** les réseaux externes, les images et les fichiers secrets sont disponibles
- **THEN** le backend et le frontend démarrent
- **THEN** le frontend peut joindre le backend sur le réseau interne et aucun port backend n'est publié sur le réseau public

#### Scenario: Assets et configuration de l'image déployée

- **WHEN** la stack est redéployée avec une nouvelle référence d'image frontend
- **THEN** `/login`, `assets/i18n/fr.json` et les bundles référencés par l'HTML répondent avec les types attendus
- **THEN** le header CSP retourné correspond à la configuration Nginx montée sur l'hôte

#### Scenario: Version non conforme

- **WHEN** un asset nécessaire est absent, qu'un bundle référencé répond en erreur ou que la CSP effective diverge de la configuration validée
- **THEN** le smoke test échoue et la version n'est pas déclarée prête
