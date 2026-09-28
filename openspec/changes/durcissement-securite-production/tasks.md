## 1. Cadrage et contrat

- [x] 1.1 [T-154] Vérifier les dépendances T-145, T-149 et T-151, confirmer le périmètre `fullstack/chore-154-durcissement-securite-production`, puis renommer la branche provisoire avant toute modification de code.
- [x] 1.2 [T-154] Exécuter `node scripts/tickets.mjs resolve T-154 --json` puis `node scripts/tickets.mjs verify T-154` sur la branche résolue et consigner les prérequis réellement présents.
- [x] 1.3 [T-154] Modifier `besoins/openapi.yaml` pour décrire le login par cookie, le retrait du JWT de `LoginResponse`, la réponse `429`, les erreurs CSRF et les contraintes de credentials, puis régénérer les types concernés sans modifier de fichier généré hors périmètre.
- [x] 1.4 [T-154] Établir la matrice de tests couvrant limitation, spoofing de proxy, cookies, CSRF, HTTPS, headers, Actuator, secrets et logs, avec une assertion explicite d'absence de données sensibles.
- [x] 1.5 [T-154] Séparer les paramètres local, intégration et production, documenter les secrets injectés et définir les critères d'activation progressive de HTTPS, HSTS et CSP.
- [x] 1.6 [T-154] Documenter le retour arrière vers les images et la configuration proxy précédentes sans réintroduire de secret par défaut ni laisser un endpoint Actuator public non prévu.

## 2. Backend Spring Boot

- [x] 2.1 [T-154] Implémenter le limiteur de login par adresse client canonique et identifiant normalisé, avec compteurs bornés, réponse `429`, comportement générique et tests de dépassement et de remise à zéro de fenêtre.
- [x] 2.2 [T-154] Configurer la chaîne de confiance des proxies et la dérivation de l'adresse client afin qu'un `X-Forwarded-For` fourni par un client ne puisse pas contourner les limites ni falsifier les événements.
- [x] 2.3 [T-154] Remplacer l'émission du bearer token dans le corps par le cookie de session sécurisé, limiter sa durée à 15 minutes maximum, réactiver CSRF et protéger toutes les requêtes mutantes authentifiées.
- [x] 2.4 [T-154] Restreindre Actuator à `health`, `liveness` et `readiness` publics, puis protéger ou désactiver `info`, métriques et endpoints restants pour les utilisateurs non administrateurs.
- [x] 2.5 [T-154] Rendre les secrets PostgreSQL et JWT obligatoires en intégration et production, puis ajouter les événements structurés de connexion, autorisation, token invalide et limitation sans journaliser de valeur sensible.

## 3. Frontend et reverse proxy

- [x] 3.1 [T-154] Adapter le service de session et l'intercepteur Angular pour utiliser les credentials, hydrater `/me`, configurer le token CSRF et supprimer toute lecture, écriture ou suppression du JWT de session dans `localStorage`.
- [x] 3.2 [T-154] Configurer Nginx pour la terminaison TLS de production, la redirection HTTP, les limites globales et login, la réécriture sûre des headers client et les headers HSTS, CSP, nosniff, referrer, permissions et anti-framing.
- [x] 3.3 [T-154] Mettre à jour les manifests de déploiement et le Compose local ou d'intégration pour distinguer les valeurs de développement des secrets injectés, vérifier les healthchecks et ne pas exposer directement le backend ou la base en production.

## 4. Validation et livraison

- [x] 4.1 [T-154] Exécuter les tests backend ciblés et les tests HTTP de sécurité, notamment `401`, `403`, `429`, cookies, CSRF, Actuator et démarrage sans secret, puis corriger uniquement les écarts de ce ticket.
- [x] 4.2 [T-154] Exécuter les tests frontend et le build Angular, vérifier l'absence de clé JWT de session dans le code et les tests, puis valider le chargement de session et la déconnexion avec cookies.
- [x] 4.3 [T-154] Exécuter les validations Nginx et Compose disponibles, vérifier les headers sur succès et erreur, relire le diff ciblé, mettre à jour les cases réellement terminées et préparer la PR de `fullstack/chore-154-durcissement-securite-production` vers `main` sans fusion ni auto-merge.
