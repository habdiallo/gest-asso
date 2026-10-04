## 1. Préparer la configuration et le backend

- [x] 1.1 [T-209] Résoudre `T-209`, vérifier ses prérequis et créer ou réutiliser la branche `back/fix-209-configurer-secure-cookie-session` avant toute modification de code.
- [x] 1.2 [T-209] Arrêter le nom de la variable d'environnement et le profil local, puis documenter la valeur par défaut sécurisée dans `application.yaml`.
- [x] 1.3 [T-209] Ajouter le réglage Spring du cookie avec `true` par défaut et exposer la valeur effective au service d'émission.
- [x] 1.4 [T-209] Adapter `SessionCookieService` et `SecurityConfig` pour dériver le nom du cookie, émettre et supprimer le même cookie, et ne jamais associer `__Host-` à `Secure=false`.

## 2. Aligner les déploiements et le contrat

- [x] 2.1 [T-209] Configurer le compose de développement local et son exemple pour activer explicitement `Secure=false` uniquement avec le frontend HTTP.
- [x] 2.2 [T-209] Configurer les compositions d'intégration et de Portainer ainsi que leurs exemples pour conserver `Secure=true`.
- [x] 2.3 [T-209] Mettre à jour la documentation ou le contrat OpenAPI si nécessaire afin de décrire le cookie sécurisé de référence et la variante locale sans ambiguïté.

## 3. Vérifier le comportement

- [x] 3.1 [T-209] Ajouter ou adapter les tests backend pour vérifier les attributs du cookie sécurisé, le nom `__Host-contribo-session`, le défaut `true` et la suppression du cookie.
- [x] 3.2 [T-209] Ajouter un scénario de test du mode local HTTP vérifiant le nom sans préfixe `__Host-`, `Secure=false`, la lecture de session, une requête authentifiée et la déconnexion.

## 4. Valider et préparer la livraison

- [x] 4.1 [T-209] Exécuter les validations backend et de configuration adaptées, puis vérifier que les compositions non locales restent sécurisées et que les modifications étrangères sont exclues du diff.
- [ ] 4.2 [T-209] Relire le diff du ticket, mettre à jour les cases réellement terminées et préparer une PR `T-209` vers `develop` selon le modèle du dépôt, sans fusion ni auto-merge.
