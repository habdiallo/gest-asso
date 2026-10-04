## ADDED Requirements

### Requirement: Manifeste d'application installable

Le frontend SHALL publier un manifeste web valide et lié au document principal, avec un nom, un nom court, une icône locale au moins en 192 et 512 pixels, `start_url`, `scope`, `display: standalone`, `theme_color` et `background_color`.

#### Scenario: Manifeste valide en production

- **WHEN** un navigateur compatible charge le build de production sur un contexte sécurisé
- **THEN** il peut lire le manifeste sans erreur, résoudre ses icônes locales et identifier l'application avec son nom et son affichage autonome

#### Scenario: Démarrage de l'application installée

- **WHEN** l'utilisateur ouvre l'application depuis l'icône installée
- **THEN** l'application démarre sur le parcours d'entrée du frontend, conserve le périmètre de navigation déclaré et applique le parcours de connexion normal

### Requirement: Service worker limité aux ressources publiques

Le frontend SHALL enregistrer un service worker en production pour les ressources statiques du shell Angular et SHALL exclure du cache les cookies, les réponses `/api/**`, les jetons et toute donnée métier privée.

#### Scenario: Ressource statique disponible après installation

- **WHEN** une ressource statique déjà chargée est demandée après une perte réseau
- **THEN** le service worker peut servir la version publique installée sans requérir une requête API

#### Scenario: Donnée métier non mise en cache

- **WHEN** une requête vers `/api/**` ou une réponse contenant une donnée de session est observée
- **THEN** elle n'est pas ajoutée au cache du service worker et suit le comportement normal d'échec ou de succès réseau

#### Scenario: Développement sans service worker persistant

- **WHEN** le frontend est lancé avec la configuration de développement
- **THEN** le service worker PWA n'interfère pas avec le proxy backend ni avec les tests locaux

### Requirement: Mise à jour et retour arrière du shell

Le frontend SHALL détecter et appliquer une nouvelle version du shell statique sans conserver indéfiniment une version obsolète, et SHALL permettre un retour à la configuration précédente en supprimant la configuration PWA sans modifier le contrat API.

#### Scenario: Nouvelle version publiée

- **WHEN** un build contenant une nouvelle version des ressources statiques est déployé
- **THEN** une nouvelle visite peut récupérer cette version et le navigateur ne reste pas bloqué sur l'ancien shell après le cycle de mise à jour

#### Scenario: Déploiement précédent restauré

- **WHEN** la configuration PWA est retirée lors d'un rollback applicatif
- **THEN** le frontend reste servi comme application web normale et les routes d'authentification et appels API conservent leur comportement

### Requirement: Installation et interface responsive

Le frontend SHALL conserver les interactions et la lisibilité de l'application installée aux largeurs 320, 375, 820 et desktop, sans débordement horizontal introduit par les métadonnées ou les contrôles d'installation.

#### Scenario: Vérification aux largeurs cibles

- **WHEN** l'application installable est vérifiée à 320, 375, 820 et en desktop
- **THEN** le shell, l'écran de connexion et l'indication d'installation restent utilisables sans perte d'action principale ni débordement horizontal de la page

#### Scenario: Rechargement d'une route protégée

- **WHEN** l'utilisateur recharge l'application installée sur une route protégée sans session valide
- **THEN** le frontend applique le parcours de connexion normal et ne contourne pas les contrôles d'accès
