## Context

Le frontend Angular est servi par Nginx avec une CSP restrictive. La page de connexion charge correctement le bundle, le fichier `assets/i18n/fr.json` et l'endpoint CSRF, mais la console montre que Transloco MessageFormat appelle `new Function`, bloqué par `script-src 'self'`. Les libellés traduits deviennent alors vides. La même réponse HTML référence des polices Google dont les fichiers sont bloqués par `font-src 'self'`.

Le démarrage global attend actuellement plusieurs initializers Angular avant de rendre l'application : traduction, récupération de l'utilisateur courant et préparation CSRF. Une réponse backend lente ou une ressource externe lente retarde donc aussi l'affichage de la page publique de connexion.

## Goals / Non-Goals

**Goals:**

- Rendre les traductions ICU et les pluriels fonctionnels sous la CSP effective, sans `unsafe-eval`.
- Supprimer la dépendance bloquante aux polices externes ou la déclarer explicitement avec une justification vérifiable.
- Afficher rapidement la page de connexion même si une préparation de session non nécessaire à son premier rendu est lente.
- Définir des mesures reproductibles de chargement et un budget de régression.
- Vérifier le résultat sur l'image réellement déployée et la configuration Nginx effectivement montée par Portainer.

**Non-Goals:**

- Modifier le contrat OpenAPI, le modèle de données ou les règles d'authentification métier.
- Ajouter une deuxième langue ou remplacer Transloco par une architecture frontend différente.
- Autoriser globalement les scripts inline, `unsafe-eval` ou des domaines tiers sans besoin démontré.
- Déclarer Cloudflare Insights obligatoire pour le fonctionnement de l'application.

## Decisions

### 1. Conserver une CSP restrictive

Le correctif remplace l'adaptateur MessageFormat par un transpileur Transloco local qui parse les expressions `plural` utilisées par les traductions françaises et s'appuie sur `Intl.PluralRules`. Cette représentation n'exécute pas de code dynamique. L'ajout de `unsafe-eval` est écarté comme solution par défaut, car il annulerait une protection explicitement recherchée par le durcissement de sécurité.

Alternative rejetée : ajouter `unsafe-eval` uniquement pour faire disparaître l'erreur. Cette option rétablit l'affichage mais augmente la surface d'exécution de code injecté.

### 2. Rendre les polices déterministes

Les polices utilisées par le design seront empaquetées dans les assets du frontend et servies depuis l'origine de l'application. Les déclarations `@font-face` pointeront vers ces fichiers locaux, avec les variantes réellement utilisées et les licences conservées dans le dépôt. Le chargement de la page ne devra pas dépendre d'une ressource tierce.

Alternative rejetée : conserver Google Fonts en ajoutant `fonts.gstatic.com` à `font-src`. Cette option supprimerait l'erreur mais conserverait une dépendance réseau et un coût DNS/TLS sur le chemin critique.

### 3. Réduire le travail bloquant au démarrage

Le profilage séparera le temps de réponse réseau, le téléchargement des assets, l'initialisation Transloco et les appels de session. Le chargement des traductions reste dans le chemin critique, tandis que la récupération de session est déclenchée par les gardes asynchrones des routes protégées. La préparation CSRF est déclenchée juste avant chaque action mutante qui l'exige, notamment la connexion.

Alternative rejetée : masquer la lenteur avec un délai artificiel ou un écran de chargement permanent. Le parcours doit devenir interactif plus tôt et conserver des états explicites en cas d'erreur.

### 4. Vérifier la configuration réellement déployée

La validation post-déploiement contrôlera l'HTML, les assets de traduction, les headers CSP, l'absence d'erreurs console bloquantes et la configuration Nginx montée depuis l'hôte. Une modification du fichier suivi dans le dépôt ne sera considérée comme livrée qu'après rafraîchissement de la stack Portainer et vérification de l'image et du fichier effectifs.

## Risks / Trade-offs

- [Risque] Une solution de pluralisation différente change subtilement certains messages français. -> Mitigation : conserver les clés et paramètres, ajouter des tests 0, 1 et plusieurs, puis vérifier les scénarios visibles.
- [Risque] Le décalage de l'hydratation de session permet un affichage temporaire de la page publique avant une redirection. -> Mitigation : garder les gardes de routes protégées et rendre la transition explicite.
- [Risque] L'auto-hébergement des polices augmente la taille de l'image. -> Mitigation : limiter les variantes réellement utilisées, conserver les formats nécessaires et mesurer l'effet sur le poids initial.
- [Risque] Portainer continue d'utiliser un ancien fichier Nginx monté sur l'hôte. -> Mitigation : vérifier le chemin, le contenu et le header HTTP après chaque redéploiement.
- [Risque] Cloudflare continue à signaler des scripts bloqués. -> Mitigation : documenter ces scripts comme non fonctionnels pour l'application ou définir une intégration CSP dédiée si la télémétrie est requise.

## Migration Plan

1. Mesurer la page actuelle sur l'environnement d'intégration et conserver les erreurs console et les headers comme preuve de référence.
2. Implémenter le rendu des traductions CSP-compatible et la stratégie de polices, puis exécuter les tests frontend.
3. Réduire les initializers bloquants et ajouter les mesures de performance et les tests de non-régression.
4. Construire les images, déployer les références immuables et rafraîchir explicitement la stack Portainer.
5. Exécuter le smoke test navigateur sur `/login`, vérifier les traductions, les polices, les headers, le temps d'interaction et les appels API.
6. En cas de régression, revenir aux deux images précédentes et à la configuration Nginx précédente, puis conserver les mesures pour le diagnostic.

## Validation effectuée

Référence observée sur l'environnement d'intégration le 3 octobre 2026 :

- `/login` répond en HTTP 200, `assets/i18n/fr.json` en HTTP 200 et `/api/v1/auth/csrf` en HTTP 204.
- Temps réseau mesurés avec cache disponible : HTML 0,135 s, traduction 0,169 s, CSRF 0,080 s.
- La console signalait `new Function` dans `@jsverse/transloco-messageformat`, le blocage de Google Fonts par `font-src 'self'`, des scripts Cloudflare non requis bloqués et un `401` attendu sur `/api/v1/me` sans session.
- La CSP effective conservait `script-src 'self'`, `font-src 'self'` et ne contenait pas `unsafe-eval`.

Contrôles locaux exécutés sur la candidate :

- `npm run check:api` : réussi.
- `npm run generate:api` : réussi après téléchargement du JAR OpenAPI fixé, sortie ignorée par Git.
- `npm test -- --watch=false` : 73 fichiers et 723 tests réussis.
- `npm run build` : réussi, avec l'avertissement préexistant de budget sur `src/app/app.css`.
- `npm run lint` : réussi.
- Prettier ciblé sur les fichiers modifiés : réussi. Le contrôle global signale 14 fichiers préexistants hors périmètre.
- `nginx -t` dans `nginx:1.27-alpine` avec les includes Portainer : réussi.

Le déploiement d'intégration et la comparaison navigateur cache froid/cache chaud restent à exécuter après publication de l'image candidate.

## Open Questions

- Les polices doivent-elles être conservées visuellement à l'identique ou une variante système acceptable peut-elle réduire le poids initial ?
- Quel budget de temps d'interaction sera retenu après la première mesure sur l'environnement d'intégration ?
