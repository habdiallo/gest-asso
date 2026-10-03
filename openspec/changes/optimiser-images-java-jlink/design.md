## Context

Le backend est construit avec Maven et Java 21 dans `contribo-deploiement/backend.Dockerfile`, puis exécuté dans `eclipse-temurin:21-jre-jammy` avec `curl` pour la readiness probe. Le Dockerfile copie actuellement les sources avant le packaging, ce qui limite le cache des dépendances. Le frontend est construit avec Node, utilise Java uniquement pendant la génération OpenAPI, puis est servi par Nginx. Les deux Dockerfiles doivent donc être traités dans le même ticket, avec des optimisations spécifiques à leur chaîne de build et à leur runtime.

Le pipeline utilise déjà BuildKit et un cache GitHub Actions pour l'image backend. Le changement doit améliorer le contenu des deux images finales et la réutilisation des étapes de build, sans changer le contrat API, le rendu SPA ni le fonctionnement de la stack Portainer.

## Goals / Non-Goals

**Goals:**

- Obtenir une mesure reproductible de l'image actuelle avant de modifier le runtime.
- Isoler les dépendances Maven des sources afin qu'une modification applicative conserve le cache utile.
- Construire un runtime Java 21 ciblé à partir de l'analyse `jdeps`, avec une liste de modules contrôlée et documentée.
- Garder une base glibc compatible avec les bibliothèques natives et les comportements Spring Boot actuels.
- Vérifier les certificats CA, le fuseau horaire, les secrets montés, JDBC/PostgreSQL, Flyway, JWT et l'Actuator.
- Publier une image optimisée seulement si elle passe les mêmes validations que l'image actuelle et si son gain est mesurable.
- Isoler le layer `npm ci` du frontend, ne jamais embarquer Node, Java ou les caches de build dans l'image Nginx finale, et conserver le fallback SPA et le proxy API.
- Vérifier `.dockerignore`, les permissions, les versions de base, les labels utiles et le mode non privilégié lorsque la configuration Nginx le permet.

**Non-Goals:**

- Modifier le code métier, le contrat OpenAPI ou la configuration fonctionnelle de Spring Boot.
- Ajouter `jlink` dans l'image finale ou conserver un JDK complet dans le runtime.
- Convertir le frontend final en image Java, qui reste une image Nginx.
- Réécrire la configuration fonctionnelle Nginx ou le contrat API pour obtenir un gain de taille.
- Remplacer automatiquement la base glibc par Alpine ou une image distroless sans preuve de compatibilité.
- Réduire les tests ou désactiver les contrôles de sécurité pour obtenir une image plus petite.

## Decisions

### 1. Mesure avant adoption

La branche commencera par mesurer la taille compressée et non compressée, les couches, le temps de build avec et sans cache, le temps de démarrage et le comportement de la readiness probe. Les résultats de référence et les résultats optimisés seront conservés dans la documentation de la PR. Une image plus petite n'est pas suffisante si elle augmente sensiblement le temps de build ou casse un parcours runtime.

### 2. Layers Maven et BuildKit

Le Dockerfile copiera d'abord le `pom.xml` et la spec OpenAPI nécessaire, exécutera la résolution des dépendances, puis copiera les sources et lancera le packaging. Les caches Maven de BuildKit seront montés dans l'étape de build lorsque le builder CI le permet. La configuration `cache-from` et `cache-to` existante restera la source de cache distante du job image.

La séparation des couches sera vérifiée avec les outils Docker disponibles. Une extraction de layers Spring Boot ne sera retenue que si elle est supportée par la version effective du plugin et si elle donne un gain clair sans rendre le démarrage ou le diagnostic plus fragile.

### 3. Layers Node et runtime Nginx

Le Dockerfile frontend copiera d'abord `package.json` et `package-lock.json`, exécutera `npm ci` avec un cache npm BuildKit, puis copiera la spec OpenAPI et les sources. L'étape finale ne recevra que les artefacts browser produits par Angular et les configurations Nginx nécessaires. Node, Java, les sources, les caches npm et les fichiers temporaires resteront dans les étapes de build.

La configuration finale conservera le fallback des routes SPA, le proxy `/api`, les headers de sécurité, la limitation de débit et le healthcheck. Toute proposition de non-root ou de filesystem read-only sera validée avec la configuration Nginx et les montages Portainer avant adoption.

### 4. Runtime `jdeps` et `jlink`

Le JDK de l'étape de build servira à analyser le résultat compilé avec `jdeps --print-module-deps`, puis à construire un runtime Java 21 avec `jlink`. L'analyse devra couvrir les classes applicatives et les bibliothèques runtime du fat jar, avec traitement explicite des dépendances dynamiques non détectées statiquement. La liste de modules résultante sera versionnée dans le Dockerfile ou dans un script maintenable, et sera contrôlée par un test de démarrage.

Le runtime ciblé sera copié dans une image finale glibc minimale. Cette image conservera `ca-certificates`, les données de fuseau horaire si elles sont nécessaires, `curl` ou un équivalent compatible avec le healthcheck, l'utilisateur non privilégié si disponible et le script d'entrypoint existant. L'image finale ne contiendra ni Maven ni JDK.

### 5. Bonnes pratiques communes, validation et repli

La validation s'effectuera sur les images construites localement puis dans le pipeline. Elle couvrira les deux healthchecks, le port Actuator 9001, le démarrage de l'application avec les secrets et variables de la stack d'intégration, le chargement des assets, le fallback SPA, le proxy frontend et les tests backend existants. Les fichiers `.dockerignore`, les utilisateurs, les permissions, les ports et les outils de build seront inspectés. Si `jdeps` ou `jlink` produit un runtime incomplet, l'implémentation conservera une variante JRE générique derrière un choix explicite de build, ou sera retirée de la PR. Aucun changement de déploiement ne sera publié avec une image non validée.

## Risks / Trade-offs

- **[Modules dynamiques manquants]** Spring Boot, les providers de sécurité, JDBC ou TLS peuvent charger des classes ou services que `jdeps` ne déduit pas. → Ajouter les modules requis après analyse des logs, activer les tests de démarrage et conserver une image de repli.
- **[Incompatibilité native]** Une base trop minimale peut casser des bibliothèques natives ou des certificats. → Rester sur glibc, installer explicitement CA et timezone, puis valider PostgreSQL, TLS et Flyway.
- **[Gain faible]** Les dépendances applicatives peuvent dominer la taille finale. → Comparer les layers et la taille compressée, et ne retenir que les changements apportant un gain mesurable.
- **[Cache non reproductible]** Un cache Maven ou BuildKit mal isolé peut masquer un problème de résolution. → Garder des builds sans cache dans la validation périodique et pinner les versions des images de build.
- **[Diagnostic plus complexe]** Un runtime jlink réduit peut manquer d'outils utiles. → Documenter les commandes de diagnostic et conserver les outils de debug dans les seules étapes de build.
- **[Régression frontend]** Une image Nginx trop nettoyée peut casser le fallback SPA, le proxy ou les headers. → Tester les routes directes, les assets, l'API proxifiée et le healthcheck avant promotion.
- **[Non-root incompatible]** Nginx ou Portainer peut dépendre d'un port ou d'un chemin système privilégié. → Tester cette option séparément et ne l'adopter que si le runtime et la stack restent fonctionnels.

## Migration Plan

1. Mesurer l'image actuelle et enregistrer le point de comparaison.
2. Modifier les Dockerfiles backend et frontend sur la branche T-197, puis construire les variantes optimisées et les fallbacks actuels.
3. Exécuter les tests Maven, le build frontend, les smoke tests de conteneurs et la stack d'intégration avec les mêmes secrets et variables que la configuration existante.
4. Publier l'image candidate dans le pipeline sans modifier la promotion de release tant que les contrôles ne sont pas verts.
5. Mettre à jour la documentation de déploiement avec la méthode de build, les métriques et le repli.
6. En cas de régression, sélectionner l'image JRE générique précédente et revenir au Dockerfile antérieur sans migration de données.

## Open Questions

- Le gain de taille justifie-t-il de conserver la variante jlink après comparaison avec un JRE glibc déjà optimisé ?
- La version effective de Spring Boot expose-t-elle une extraction de layers stable et utile pour ce fat jar ?
- Faut-il ajouter un job CI dédié pour comparer les tailles des deux images, ou intégrer les seuils dans le job image existant ?
- Le mode non-root est-il compatible avec les ports et les montages Nginx utilisés par Portainer ?
