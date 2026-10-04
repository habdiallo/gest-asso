## 1. Préparer l'intégration PWA

- [ ] 1.1 [T-206] Vérifier la compatibilité Angular 21, du builder de production et de la dépendance PWA retenue, puis confirmer le périmètre frontend sans modification du backend.
- [ ] 1.2 [T-206] Créer ou réutiliser la branche `front/feat-206-rendre-front-installable-pwa` depuis `origin/develop` et vérifier l'état Git avant toute modification de code.

## 2. Ajouter les ressources installables

- [ ] 2.1 [T-206] Déclarer le manifeste web, les métadonnées HTML et les icônes locales 192 et 512 pixels avec un démarrage sur le parcours de connexion.
- [ ] 2.2 [T-206] Activer l'enregistrement du service worker uniquement pour le build de production et configurer le cache du shell statique sans inclure `/api/**` ni les données privées.
- [ ] 2.3 [T-206] Vérifier que la configuration de développement conserve le proxy backend et n'installe pas de service worker persistant pendant les tests locaux.

## 3. Préserver l'authentification et les mises à jour

- [ ] 3.1 [T-206] Vérifier le rechargement d'une route protégée, l'expiration de session et le retour vers la connexion depuis l'application installée.
- [ ] 3.2 [T-206] Vérifier la récupération d'une nouvelle version du shell et documenter le rollback par retrait de la configuration PWA.
- [ ] 3.3 [T-206] Identifier les champs et dialogues qui déclenchent un autofocus ou un focus programmatique sur mobile, sans modifier les parcours métier.
- [ ] 3.4 [T-206] Ajuster la stratégie de focus pour éviter le zoom de viewport, conserver un focus visible et permettre l'utilisation normale du clavier virtuel.
- [ ] 3.5 [T-206] Fermer le dialogue ou menu de déconnexion sur interaction extérieure, tout en laissant les interactions internes ouvertes et fonctionnelles.
- [ ] 3.6 [T-206] Restaurer le focus sur le contrôle déclencheur après fermeture extérieure ou avec Escape, puis couvrir les cas dans les tests d'interaction.

## 4. Valider et livrer

- [ ] 4.1 [T-206] Ajouter les contrôles automatisés du manifeste, de l'enregistrement production, de l'exclusion des API du cache et de l'absence d'interférence en développement.
- [ ] 4.2 [T-206] Exécuter lint, format check, tests frontend, tooling et build production, puis corriger toute régression.
- [ ] 4.3 [T-206] Exécuter la vérification navigateur en contexte sécurisé à 320, 375, 820 et desktop, avec installation, lancement autonome, rechargement et contrôle de l'absence de débordement horizontal.
- [ ] 4.4 [T-206] Mettre à jour la documentation frontend et de déploiement sur HTTPS, le cache du shell, les limites hors ligne et le rollback, puis préparer la PR vers `develop`.
- [ ] 4.5 [T-206] Compléter les contrôles automatisés et navigateur avec le zoom autofocus, la fermeture extérieure du dialogue ou menu de déconnexion et le retour de focus.
