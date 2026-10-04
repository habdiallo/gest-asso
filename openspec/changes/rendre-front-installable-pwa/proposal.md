## Why

Le frontend Contribo fonctionne aujourd'hui comme une application web classique et ne peut pas être ajouté à l'écran d'accueil ou lancé dans une fenêtre dédiée. Une PWA installable simplifiera l'accès récurrent depuis mobile et desktop, tout en conservant l'authentification et les données métier gérées par le backend réel.

## What Changes

- Ajouter les métadonnées PWA nécessaires à l'installation du frontend Angular.
- Déclarer un manifeste avec un nom, une icône, une couleur de thème, une URL de démarrage et un affichage autonome.
- Activer un service worker limité au shell statique de l'application, sans mise en cache des cookies, des réponses API ou des données métier privées.
- Préserver le parcours de connexion, les routes protégées, le proxy de développement et le comportement responsive existant.
- Vérifier l'installation et le lancement en mode autonome sur mobile, tablette et desktop, ainsi que le comportement en contexte non sécurisé.

## Capabilities

### New Capabilities

- `pwa-installability`: rendre le frontend installable comme application web progressive sans exposer ni mettre en cache les données privées.

### Modified Capabilities

- Aucune.

## Impact

- Frontend Angular : configuration de build, ressources publiques, bootstrap et service worker.
- Dépendances frontend : éventuel paquet PWA Angular, verrouillage npm et scripts de validation.
- Déploiement : vérification des en-têtes et du contexte HTTPS requis pour l'installation en environnement distant.
- Tests : tests unitaires de configuration, build production, audit du manifeste et vérification navigateur aux largeurs 320, 375, 820 et desktop.
