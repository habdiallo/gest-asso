## Context

Le backend utilise `jjwt` avec un secret HMAC lu depuis `security.jwt.secret`. Le filtre maison extrait ensuite l'identifiant UUID du sujet et place directement cet UUID dans le contexte Spring Security. Le déploiement d'intégration utilise actuellement un secret Docker contenant le secret JWT.

Le projet de référence utilise Spring Security OAuth2 Resource Server, Nimbus et une paire `RSAPublicKey`/`RSAPrivateKey`. Son workflow génère une paire temporaire pour les tests et sa stack Portainer monte les clés PEM par secrets fichiers. Contribo doit conserver ses routes, son modèle `LoginResponse` et ses contrôles d'accès applicatifs.

## Goals / Non-Goals

**Goals:**

- Signer les JWT avec la clé privée RSA et vérifier les JWT avec la clé publique RSA.
- Conserver le sujet UUID, le type Bearer, l'expiration et les erreurs 401 existantes.
- Permettre des sources de clés classpath, fichier local et fichier Docker secret sans mettre de clé dans Git.
- Fournir une stack Portainer indépendante de PostgreSQL, connectée aux réseaux externes existants et à un réseau interne backend/frontend.
- Publier des images GHCR versionnées et documenter le rollback par tag.

**Non-Goals:**

- Remplacer JWT par des sessions serveur ou des jetons opaques.
- Ajouter une rotation automatique multi-clés ou un endpoint JWKS dans ce ticket.
- Modifier les règles d'autorisation métier ou le schéma de base de données.
- Exposer le backend directement sur le réseau public de Portainer.

## Decisions

- **Spring Security OAuth2 Resource Server et Nimbus** : utiliser les composants standards pour décoder les JWT RS256 et configurer un `JwtEncoder` avec la paire RSA. Cette approche est retenue plutôt qu'un parseur JJWT maison, car elle aligne la vérification, les erreurs et la configuration sur le projet de référence.
- **Compatibilité du principal UUID** : fournir un convertisseur ou un adaptateur qui conserve l'extraction de l'UUID depuis `sub`, afin que `CurrentUserId` et les contrôleurs existants ne dépendent pas directement de l'objet `Jwt`.
- **Configuration par ressources PEM** : accepter des emplacements de ressources `classpath:` et `file:` pour les deux clés. La configuration doit échouer rapidement si une clé est absente, illisible ou incompatible, sans fallback vers un secret HMAC.
- **Secrets Docker fichiers** : la stack Portainer monte `rsa_private_key` et `rsa_public_key` sous `/run/secrets`, puis transmet leurs emplacements au backend. La clé privée reste absente du réseau public et des variables multi-lignes Portainer.
- **Workflow versionné** : conserver les validations pull request, puis publier sur `main` avec un tag semver et un alias d'intégration, en générant les clés uniquement dans le job de test. Les images sont taguées avec des noms stables et versionnés pour permettre le rollback.
- **Branches d'intégration et de production** : utiliser `develop` comme cible des PR de ticket. Créer `release/vX.Y.Z` depuis `develop`, la valider vers `main`, puis réintégrer la release dans `develop`. Les hotfixes suivent le même retour depuis `main`.
- **Publication par branche** : publier `latest-int` et le SHA sur `develop`, `latest` et le SHA sur `main`, puis les tags semver et le SHA sur un tag `vX.Y.Z`. Les PR construisent les images sans les publier.

## Risks / Trade-offs

- [Risque] Les JWT HMAC existants ne seront plus acceptés après le déploiement. → [Mitigation] Documenter la reconnexion obligatoire et déployer la paire RSA avant la nouvelle version ; aucun état serveur de session n'est perdu.
- [Risque] Une clé privée incorrecte ou absente empêche le backend de démarrer. → [Mitigation] Ajouter une validation de configuration au démarrage, une procédure de génération et un contrôle CI avec des clés éphémères.
- [Risque] Une stack Portainer peut référencer des réseaux ou un PostgreSQL dont les noms diffèrent. → [Mitigation] Rendre les noms et chemins surchargeables par variables, valider les prérequis dans la documentation et ne pas gérer PostgreSQL dans cette stack.
- [Risque] Un tag `latest` peut rendre un rollback ambigu. → [Mitigation] Documenter et privilégier un tag semver immuable pour `IMAGE_TAG`, en conservant un alias d'intégration pratique.

## Migration Plan

1. Générer une paire RSA dédiée à chaque environnement et la déposer dans le gestionnaire de secrets de l'hôte Portainer.
2. Déployer la configuration et les images avec les emplacements RSA configurés.
3. Vérifier le login, une requête authentifiée et le refus d'un ancien ou d'un JWT mal signé.
4. Pour un rollback, redéployer une image précédente avec sa paire RSA correspondante ; ne jamais réintroduire `JWT_SECRET` dans la stack.

Pour le flux Git, créer `develop` depuis `main` avant la première PR de ticket,
protéger les deux branches sur GitHub, puis utiliser `release/vX.Y.Z` pour chaque
promotion en production. Une release ou un hotfix fusionné dans `main` est ensuite
réintégré dans `develop`.

## Open Questions

- La rotation multi-clés et la conservation simultanée d'anciennes clés sont hors périmètre et devront faire l'objet d'un ticket dédié si nécessaire.
