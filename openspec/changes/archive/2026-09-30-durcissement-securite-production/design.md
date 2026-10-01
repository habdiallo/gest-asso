## Context

Le backend expose actuellement `POST /auth/login` avec un JWT dans la réponse JSON, le frontend le persiste dans `localStorage`, la protection CSRF est désactivée et le proxy transmet une chaîne `X-Forwarded-For` contrôlée indirectement par le client. Le reverse proxy écoute uniquement en HTTP et ne pose pas les headers de sécurité attendus. Spring Actuator expose `health` et `info`, tandis que la configuration applicative et le Compose local contiennent encore des valeurs connues pour des secrets.

Le ticket touche le contrat OpenAPI, le backend Spring Boot, le frontend Angular et le déploiement Nginx. Les dépendances T-145, T-149 et T-151 fournissent respectivement le socle d'authentification et les bases de déploiement local et d'intégration. Chaque étape doit laisser un état testable, avec un mode local explicitement distinct de la configuration exposée.

## Goals / Non-Goals

**Goals:**

- Empêcher le bruteforce du login par IP et identifiant, tout en limitant le trafic global au proxy.
- Ne plus rendre le JWT de session accessible au JavaScript ou persistant dans le navigateur.
- Réactiver CSRF avec un mécanisme compatible avec Angular et le déploiement sous même origine.
- Forcer HTTPS en environnement exposé et poser une politique de headers vérifiable.
- Refuser le démarrage d'une configuration d'intégration ou de production dont les secrets obligatoires sont absents.
- Réduire Actuator à la surface publique minimale et journaliser les événements de sécurité sans secret.

**Non-Goals:**

- Ajouter dans ce ticket les refresh tokens rotatifs, la MFA, les workflows de réinitialisation de mot de passe ou la politique de mot de passe.
- Réaliser l'audit d'autorisation métier de toutes les ressources, les sauvegardes, les scans de supply chain ou l'audit externe.
- Introduire une nouvelle base de données de sessions si un cookie signé par le backend suffit au déploiement actuel.
- Rendre le mode de développement local accessible depuis Internet ou lui appliquer artificiellement les certificats de production.

## Decisions

### 1. Cookie de session HttpOnly avec protection CSRF par double soumission

Le login émettra un cookie de session de type `__Host-` avec `HttpOnly`, `Secure`, `SameSite=Strict` et `Path=/`, sans attribut `Domain`. Le corps JSON ne contiendra plus de JWT à copier dans le stockage ou les headers frontend. La session restera courte, avec une durée maximale de 15 minutes dans ce ticket.

La protection CSRF utilisera un token non secret distinct, exposé au frontend dans un cookie lisible par Angular et renvoyé dans un header dédié pour les requêtes mutantes. Le backend exigera ce header pour les méthodes mutantes authentifiées et le frontend configurera l'intercepteur XSRF Angular. Le cookie de session restera HttpOnly et ne sera jamais lu par le code Angular.

Alternative rejetée : conserver le bearer token en mémoire côté frontend. Cela supprime la persistance mais laisse le token accessible à une XSS active et ne répond pas à l'objectif de réduction de l'exposition au JavaScript.

### 2. Limitation en deux niveaux et adresse client canonique

Nginx appliquera une limite globale et une limite dédiée aux requêtes de login. Le backend appliquera les fenêtres par adresse client canonique et identifiant normalisé afin qu'un attaquant ne puisse pas contourner une seule clé avec plusieurs identifiants ou plusieurs adresses.

L'adresse client sera déterminée uniquement à partir d'un saut proxy explicitement de confiance. Le proxy d'entrée écrasera les headers `X-Forwarded-For` et `X-Real-IP` reçus du client avec la valeur observée sur sa connexion. Une topologie placée derrière un load balancer devra déclarer sa plage de proxies de confiance ; sinon les headers entrants seront ignorés. Les limites retourneront `429` avec un corps d'erreur compatible avec le contrat et sans révéler l'existence d'un compte.

Alternative rejetée : utiliser directement le premier élément de `X-Forwarded-For`. Ce comportement permettrait au client de choisir sa clé de limitation.

### 3. Nginx comme frontière TLS et politique de headers explicite

La configuration de production redirigera HTTP vers HTTPS et terminera TLS avec des certificats injectés hors de l'image. HSTS sera posé uniquement sur les réponses HTTPS et avec `includeSubDomains` après validation de la topologie. La CSP sera d'abord limitée aux ressources nécessaires au bundle Angular et testée sur les parcours de connexion et de navigation.

La protection contre le framing combinera `frame-ancestors 'none'` dans la CSP et `X-Frame-Options: DENY` pour les clients anciens. Les autres headers seront posés avec `always` afin de couvrir les erreurs HTTP. Le mode local conservera un profil HTTP séparé et ne sera pas présenté comme une configuration de production.

### 4. Secrets obligatoires et Actuator minimal

Les profils d'intégration et de production utiliseront des placeholders obligatoires pour le mot de passe PostgreSQL et la clé JWT, sans valeur de repli connue. Le Compose local pourra fournir des valeurs de développement uniquement via un fichier ou un environnement explicitement local, sans les réutiliser dans la configuration de production.

La surface Actuator publique sera limitée à `health`, `health/liveness` et `health/readiness`. `info`, les métriques et tout autre endpoint devront être désactivés ou protégés par une autorisation d'administration et, si l'exploitation le permet, par un réseau interne.

### 5. Journalisation structurée et minimisée

Les événements de succès et d'échec de connexion, refus d'autorisation, token invalide et limitation déclenchée seront émis avec un type d'événement, un résultat, un horodatage, un identifiant de corrélation et les identifiants techniques nécessaires au diagnostic. L'identifiant de connexion sera masqué ou haché selon le besoin opérationnel, et l'adresse IP sera traitée comme donnée sensible.

Les messages et champs de contexte seront construits à partir de valeurs contrôlées. Aucun mot de passe, JWT, cookie de session, clé de signature ou secret de configuration ne pourra être écrit dans les logs, y compris lors d'une exception.

## Risks / Trade-offs

- [Risque] Le changement de contrat de login casse les mocks et le client généré actuels. → Modifier d'abord `besoins/openapi.yaml`, régénérer les types concernés et livrer les tests frontend et backend dans la même évolution.
- [Risque] `SameSite=Strict` bloque un déploiement sur des sites distincts. → Déployer le frontend et l'API sous la même origine par défaut ; si une séparation devient nécessaire, documenter une décision CORS et CSRF dédiée avant d'assouplir le cookie.
- [Risque] Une CSP trop stricte casse Angular ou des ressources nécessaires. → Partir des ressources réellement produites, tester les parcours critiques et refuser `unsafe-eval` ; toute exception devra être justifiée et ciblée.
- [Risque] Un compteur en mémoire ne suit pas plusieurs instances backend. → Conserver l'abstraction de stockage du limiteur et vérifier la topologie ; exiger un stockage partagé avant toute montée en charge horizontale.
- [Risque] HSTS rend une erreur TLS difficile à corriger pour les clients déjà enregistrés. → Activer HSTS en production uniquement après validation des certificats, de la redirection et des sous-domaines concernés.
- [Risque] Des logs trop détaillés exposent des données sensibles. → Ajouter des assertions de tests et une revue de recherche de secrets dans les messages d'authentification et d'erreur.

## Migration Plan

1. Mettre à jour le contrat OpenAPI, le design et les tests de sécurité sans changer encore le déploiement public.
2. Implémenter le cookie de session, CSRF, la limitation backend, les endpoints Actuator et la configuration obligatoire des secrets.
3. Adapter le frontend Angular pour les credentials et le token CSRF, puis supprimer les accès au JWT de session dans `localStorage`.
4. Activer Nginx HTTPS, les limites et les headers dans le profil d'intégration, exécuter les smoke tests, puis promouvoir la même configuration vers la production.
5. En cas de régression, revenir à l'image précédente et au profil proxy précédent avant de réactiver le trafic. Ne pas laisser une configuration avec secrets par défaut sur un environnement exposé.

## Open Questions

- Le domaine public final et la chaîne de certificats TLS doivent-ils être fournis par Portainer, un load balancer externe ou Nginx lui-même ?
- La production restera-t-elle sur une seule instance backend, ou faut-il brancher dès ce ticket le limiteur sur un stockage partagé ?
- Le rôle d'administration Actuator doit-il être complété par une allowlist réseau indépendante de l'autorisation applicative ?
