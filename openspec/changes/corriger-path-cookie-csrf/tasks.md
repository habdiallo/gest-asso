## 1. Préparer la correction backend

- [x] 1.1 [T-184] Vérifier la branche `back/fix-184-corriger-path-cookie-csrf`, résoudre T-184 et confirmer le comportement actuel du cookie avec le context-path `/api/v1`.
- [x] 1.2 [T-184] Identifier la configuration Spring Security et les tests HTTP existants couvrant `GET /auth/csrf`, le cookie de session et les requêtes mutantes.

## 2. Corriger le chemin et préserver la sécurité

- [x] 2.1 [T-184] Configurer explicitement le `CookieCsrfTokenRepository` pour émettre `XSRF-TOKEN` avec `Path=/`, sans modifier les attributs du cookie `__Host-contribo-session`.
- [x] 2.2 [T-184] Vérifier que les exemptions CSRF, l'authentification par cookie et le refus des mutations sans token restent inchangés.

## 3. Ajouter les validations

- [x] 3.1 [T-184] Ajouter ou ajuster les tests HTTP vérifiant `Set-Cookie`, `Path=/`, la lisibilité du token et l'acceptation d'une mutation avec header `X-XSRF-TOKEN`.
- [x] 3.2 [T-184] Ajouter ou ajuster le test de régression d'une mutation authentifiée sans token CSRF, qui doit rester refusée sans mutation métier.

## 4. Vérifier et préparer la livraison

- [x] 4.1 [T-184] Exécuter les tests backend ciblés, puis les validations adaptées du projet et une vérification réseau avec le context-path `/api/v1` si l'environnement est disponible.
- [x] 4.2 [T-184] Relire le diff ciblé, documenter les résultats réels et préparer une PR vers `develop` sans fusion ni publication non demandée.
