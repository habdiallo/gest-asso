## Context

Le frontend Angular est livré comme une application navigateur avec un build de production et un reverse proxy pour `/api/v1`. Il n'expose pas encore de manifeste web ni de service worker. L'authentification repose sur un cookie HttpOnly et les écrans métier dépendent du backend réel, donc l'installation ne doit pas être confondue avec un fonctionnement métier hors ligne. Le même périmètre mobile contient un focus automatique susceptible de zoomer la viewport et un dialogue ou menu de déconnexion qui ne réagit pas au clic extérieur.

## Goals / Non-Goals

**Goals:**

- Produire un manifeste conforme aux critères d'installation des navigateurs modernes.
- Afficher une icône et un nom cohérents sur l'écran d'accueil et dans la fenêtre autonome.
- Précharger uniquement les ressources statiques nécessaires au shell Angular.
- Laisser les appels API, les cookies de session et les données privées hors du cache du service worker.
- Garantir que le rechargement d'une route protégée conserve le parcours d'authentification normal.
- Empêcher le focus automatique mobile de provoquer un zoom ou un déplacement inattendu de la viewport.
- Fermer le dialogue ou menu de déconnexion sur une interaction extérieure et restaurer le focus sur son déclencheur.

**Non-Goals:**

- Rendre les écrans métier utilisables hors ligne.
- Mettre en cache des réponses `/api/**`, des tokens, des cookies ou des données personnelles.
- Ajouter une synchronisation différée, des notifications push ou une installation forcée.
- Modifier le contrat OpenAPI, le backend ou les règles d'autorisation.

## Decisions

### Utiliser l'intégration PWA Angular maintenue

S'appuyer sur le mécanisme PWA officiel compatible avec la version Angular du frontend, après vérification de la compatibilité exacte de la dépendance et du lockfile. Cette option est préférée à un service worker écrit à la main, car elle conserve la configuration de build et les mises à jour de cache dans les conventions Angular. Une implémentation manuelle ne serait retenue que si la dépendance officielle est incompatible avec Angular 21.

### Déclarer un manifeste statique versionné

Définir le nom, le nom court, les icônes 192 et 512 pixels, `start_url`, `scope`, `display: standalone`, `theme_color` et `background_color` dans les ressources publiques du frontend. `start_url` doit mener au parcours d'entrée de l'application sans contourner l'authentification. Les icônes doivent être des ressources locales versionnées, sans dépendance à un domaine tiers.

### Limiter le cache au shell public

Configurer le service worker pour les ressources statiques produites par Angular, avec une stratégie de mise à jour qui permet de récupérer une nouvelle version sans conserver indéfiniment un ancien bundle. Aucun groupe de cache ne doit cibler `/api/`, les cookies ou les données métier. En cas d'accès sans réseau, l'interface peut afficher le shell déjà installé, mais les routes et appels nécessitant une session doivent continuer à échouer de manière explicite et sûre.

### Vérifier l'installation sans modifier le parcours métier

Ajouter les tests de configuration et de build nécessaires, puis vérifier dans un navigateur Chromium l'apparition de l'installation, le lancement en fenêtre autonome, le rechargement de `/login` et la mise à jour d'une nouvelle version. La campagne visuelle couvre 320, 375, 820 et desktop afin de s'assurer que le bouton d'installation ou les métadonnées n'introduisent pas de débordement.

### Stabiliser le focus et la fermeture extérieure sur mobile

Éviter l'autofocus programmatique sur mobile lorsqu'il n'est pas indispensable. Pour les champs qui doivent recevoir le focus, appliquer une taille de texte calculée d'au moins `16px` aux inputs, selects et textareas concernés. Cette approche est préférée à l'ajout de `maximum-scale=1` dans la balise viewport, car elle évite le zoom automatique tout en laissant le zoom volontaire disponible pour les utilisateurs. Vérifier le résultat avec le clavier virtuel. Le dialogue ou menu de déconnexion doit écouter l'interaction extérieure sur son conteneur ou son backdrop, ignorer les clics internes, gérer Escape lorsque le composant le permet et rendre le focus au bouton déclencheur après fermeture. Cette logique reste colocalisée dans le composant partagé ou le composant de navigation concerné, sans état global supplémentaire.

Référence de diagnostic et de choix CSS : [2 ways to avoid the automatic zoom-in on input fields](https://medium.com/@rares.popescu/2-ways-to-avoid-the-automatic-zoom-in-on-input-fields-8a71479e542e). La restriction `maximum-scale=1` est explicitement écartée pour préserver l'accessibilité du zoom utilisateur.

## Risks / Trade-offs

- [Un service worker obsolète peut servir un ancien bundle] -> versionner la configuration, tester le cycle de mise à jour et documenter la désinstallation du service worker en rollback.
- [Le navigateur refuse l'installation en HTTP distant] -> vérifier HTTPS en intégration et conserver localhost comme seul contexte de développement autorisé.
- [Un cache trop large peut exposer ou figer des données privées] -> interdire explicitement les URLs API et contrôler le contenu des caches dans la validation navigateur.
- [Les icônes augmentent la taille du bundle public] -> utiliser des fichiers optimisés et limités aux tailles requises par les navigateurs.
- [Une dépendance PWA peut modifier le build Angular] -> verrouiller la version, exécuter lint, tests, tooling et build avant livraison, avec suppression simple de la configuration en cas de rollback.
- [Un clic extérieur peut fermer trop tôt une action interne] -> distinguer la cible du conteneur et celle du dialogue, tester les clics internes et vérifier le retour de focus.
- [Le retrait de l'autofocus peut dégrader l'accessibilité] -> conserver un focus explicite pour les parcours qui l'exigent, l'annoncer dans les tests et vérifier la navigation clavier et lecteur d'écran.
