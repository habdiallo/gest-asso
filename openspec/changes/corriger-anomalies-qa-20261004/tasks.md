## 1. T-201, normaliser les taux de collecte

- [x] 1.1 [T-201] Résoudre T-201, confirmer `front/fix-201-normaliser-taux-collecte-affichage` et exécuter `node scripts/tickets.mjs verify T-201` avant le code.
- [x] 1.2 [T-201] Ajouter un formateur d'affichage de pourcentage avec une décimale au maximum et couvrir les valeurs entières, décimales et flottantes longues.
- [x] 1.3 [T-201] Utiliser le formateur dans le détail, la liste et les indicateurs de campagne sans modifier le taux numérique utilisé pour les calculs et progressions.
- [x] 1.4 [T-201] Ajouter les tests de non-régression sur les trois vues, notamment pour 28.571428571428573 et 0.29296875.
- [x] 1.5 [T-201] Exécuter les validations frontend pertinentes et préparer la PR vers `develop`.

## 2. T-202, corriger la navigation au zoom élevé

- [x] 2.1 [T-202] Résoudre T-202, confirmer `front/fix-202-corriger-navigation-zoom-200` et exécuter `node scripts/tickets.mjs verify T-202` avant le code.
- [x] 2.2 [T-202] Corriger la répartition et le retour à la ligne des liens de navigation basse aux largeurs 320, 375 et 820 px avec un texte à 200 pour cent.
- [x] 2.3 [T-202] Adapter la hauteur du shell et du menu de profil au contenu réel sans recouvrement.
- [x] 2.4 [T-202] Ajouter ou compléter les tests DOM/CSS accessibles et vérifier le clavier du contrôle de déconnexion.
- [x] 2.5 [T-202] Exécuter les validations frontend et préparer la PR vers `develop`, puis joindre une preuve navigateur avant la fusion.

## 3. T-203, porter la session à 30 minutes

- [ ] 3.1 [T-203] Résoudre T-203, confirmer `back/fix-203-session-trente-minutes` et exécuter `node scripts/tickets.mjs verify T-203` avant le code.
- [ ] 3.2 [T-203] Remplacer la durée codée en dur du cookie par la propriété de durée JWT partagée et porter le défaut d'intégration à 1800 secondes.
- [ ] 3.3 [T-203] Porter la borne maximale de validation à 1800 secondes avec un message d'erreur cohérent.
- [ ] 3.4 [T-203] Ajouter les tests de cohérence entre expiration JWT et `Max-Age` du cookie, ainsi que la conservation des attributs de sécurité.
- [ ] 3.5 [T-203] Exécuter les validations backend pertinentes et préparer la PR vers `develop`.
