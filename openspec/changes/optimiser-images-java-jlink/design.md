## Context

Le backend est construit avec Maven et Java 21 dans `contribo-deploiement/backend.Dockerfile`, puis exécuté dans `eclipse-temurin:21-jre-jammy` avec `curl` pour la readiness probe. Le Dockerfile copie actuellement les sources avant le packaging, ce qui limite le cache des dépendances. Le frontend utilise Java uniquement pendant la génération OpenAPI et son image finale est Nginx, donc l'optimisation Java concerne le backend et les étapes de build partagées.

Le pipeline utilise déjà BuildKit et un cache GitHub Actions pour l'image backend. Le changement doit donc améliorer à la fois le contenu de l'image finale et la réutilisation des étapes de build, sans changer le contrat API ni le fonctionnement de la stack Portainer.

## Goals / Non-Goals

**Goals:**

- Obtenir une mesure reproductible de l'image actuelle avant de modifier le runtime.
- Isoler les dépendances Maven des sources afin qu'une modification applicative conserve le cache utile.
- Construire un runtime Java 21 ciblé à partir de l'analyse `jdeps`, avec une liste de modules contrôlée et documentée.
- Garder une base glibc compatible avec les bibliothèques natives et les comportements Spring Boot actuels.
- Vérifier les certificats CA, le fuseau horaire, les secrets montés, JDBC/PostgreSQL, Flyway, JWT et l'Actuator.
- Publier une image optimisée seulement si elle passe les mêmes validations que l'image actuelle et si son gain est mesurable.

**Non-Goals:**

- Modifier le code métier, le contrat OpenAPI ou la configuration fonctionnelle de Spring Boot.
- Ajouter `jlink` dans l'image finale ou conserver un JDK complet dans le runtime.
- Convertir le frontend final en image Java, qui reste une image Nginx.
- Remplacer automatiquement la base glibc par Alpine ou une image distroless sans preuve de compatibilité.
- Réduire les tests ou désactiver les contrôles de sécurité pour obtenir une image plus petite.

## Decisions

### 1. Mesure avant adoption

La branche commencera par mesurer la taille compressée et non compressée, les couches, le temps de build avec et sans cache, le temps de démarrage et le comportement de la readiness probe. Les résultats de référence et les résultats optimisés seront conservés dans la documentation de la PR. Une image plus petite n'est pas suffisante si elle augmente sensiblement le temps de build ou casse un parcours runtime.

### 2. Layers Maven et BuildKit

Le Dockerfile copiera d'abord le `pom.xml` et la spec OpenAPI nécessaire, exécutera la résolution des dépendances, puis copiera les sources et lancera le packaging. Les caches Maven de BuildKit seront montés dans l'étape de build lorsque le builder CI le permet. La configuration `cache-from` et `cache-to` existante restera la source de cache distante du job image.

La séparation des couches sera vérifiée avec les outils Docker disponibles. Une extraction de layers Spring Boot ne sera retenue que si elle est supportée par la version effective du plugin et si elle donne un gain clair sans rendre le démarrage ou le diagnostic plus fragile.

### 3. Runtime `jdeps` et `jlink`

Le JDK de l'étape de build servira à analyser le résultat compilé avec `jdeps --print-module-deps`, puis à construire un runtime Java 21 avec `jlink`. L'analyse devra couvrir les classes applicatives et les bibliothèques runtime du fat jar, avec traitement explicite des dépendances dynamiques non détectées statiquement. La liste de modules résultante sera versionnée dans le Dockerfile ou dans un script maintenable, et sera contrôlée par un test de démarrage.

Le runtime ciblé sera copié dans une image finale glibc minimale. Cette image conservera `ca-certificates`, les données de fuseau horaire si elles sont nécessaires, `curl` ou un équivalent compatible avec le healthcheck, l'utilisateur non privilégié si disponible et le script d'entrypoint existant. L'image finale ne contiendra ni Maven ni JDK.

### 4. Validation et repli

La validation s'effectuera sur l'image construite localement puis dans le pipeline. Elle couvrira le healthcheck, le port Actuator 9001, le démarrage de l'application avec les secrets et variables de la stack d'intégration, ainsi que les tests backend existants. Si `jdeps` ou `jlink` produit un runtime incomplet, l'implémentation conservera une variante JRE générique derrière un choix explicite de build, ou sera retirée de la PR. Aucun changement de déploiement ne sera publié avec une image non validée.

## Risks / Trade-offs

- **[Modules dynamiques manquants]** Spring Boot, les providers de sécurité, JDBC ou TLS peuvent charger des classes ou services que `jdeps` ne déduit pas. → Ajouter les modules requis après analyse des logs, activer les tests de démarrage et conserver une image de repli.
- **[Incompatibilité native]** Une base trop minimale peut casser des bibliothèques natives ou des certificats. → Rester sur glibc, installer explicitement CA et timezone, puis valider PostgreSQL, TLS et Flyway.
- **[Gain faible]** Les dépendances applicatives peuvent dominer la taille finale. → Comparer les layers et la taille compressée, et ne retenir que les changements apportant un gain mesurable.
- **[Cache non reproductible]** Un cache Maven ou BuildKit mal isolé peut masquer un problème de résolution. → Garder des builds sans cache dans la validation périodique et pinner les versions des images de build.
- **[Diagnostic plus complexe]** Un runtime jlink réduit peut manquer d'outils utiles. → Documenter les commandes de diagnostic et conserver les outils de debug dans les seules étapes de build.

## Migration Plan

1. Mesurer l'image actuelle et enregistrer le point de comparaison.
2. Modifier le Dockerfile backend sur la branche T-197, puis construire les variantes générique et jlink.
3. Exécuter les tests Maven, le smoke test de conteneur et la stack d'intégration avec les mêmes secrets et variables que la configuration existante.
4. Publier l'image candidate dans le pipeline sans modifier la promotion de release tant que les contrôles ne sont pas verts.
5. Mettre à jour la documentation de déploiement avec la méthode de build, les métriques et le repli.
6. En cas de régression, sélectionner l'image JRE générique précédente et revenir au Dockerfile antérieur sans migration de données.

## Open Questions

- Le gain de taille justifie-t-il de conserver la variante jlink après comparaison avec un JRE glibc déjà optimisé ?
- La version effective de Spring Boot expose-t-elle une extraction de layers stable et utile pour ce fat jar ?
- Faut-il ajouter un job CI dédié pour comparer les tailles, ou intégrer les seuils dans le job image existant ?
