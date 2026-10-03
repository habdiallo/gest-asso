## Why

L'image Docker backend Java embarque aujourd'hui un JRE générique et invalide trop souvent le cache Maven, ce qui augmente le volume publié, la surface runtime et le temps de construction. Le ticket T-197 vise à mesurer ces coûts puis à adopter une image runtime minimale et des layers reproductibles sans dégrader le démarrage, les migrations, l'Actuator, TLS ou l'authentification.

## What Changes

- Mesurer la taille, le contenu, le temps de build et le démarrage de l'image backend actuelle comme référence.
- Réorganiser le Dockerfile backend pour maximiser la réutilisation des layers Maven et séparer les dépendances des sources.
- Utiliser `jdeps` pour déterminer les modules nécessaires, puis construire un runtime Java ciblé avec `jlink` dans une étape de build dédiée.
- Conserver les éléments nécessaires au runtime, notamment les certificats CA, le fuseau horaire, le binaire de healthcheck et la compatibilité glibc.
- Vérifier le démarrage de Spring Boot, l'accès JDBC/PostgreSQL, Flyway, JWT, l'Actuator et la readiness probe dans l'image optimisée.
- Comparer les gains et documenter un retour arrière vers l'image JRE générique si la compatibilité ou la maintenance n'est pas satisfaisante.

## Capabilities

### New Capabilities

- `java-image-optimization`: construire et valider des images Docker Java backend plus petites, avec des layers de dépendances cacheables et un runtime Java ciblé.

### Modified Capabilities

- Aucun comportement applicatif ou contrat API ne change. Les exigences de déploiement concernées seront couvertes par la nouvelle capacité.

## Impact

- Dockerfile et scripts de build du backend dans `contribo-back/` et `contribo-deploiement/`.
- Pipeline de publication des images Docker et éventuels scripts de mesure.
- Dépendances de build Java utilisées pour `jdeps` et `jlink`, sans ajout de dépendance applicative.
- Validation locale et CI des images backend. Le frontend n'est pas converti en runtime Java : Java reste limité à sa génération OpenAPI pendant le build et l'image finale reste Nginx.
