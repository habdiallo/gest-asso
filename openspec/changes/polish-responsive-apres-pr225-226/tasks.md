## 1. Préparer le ticket et le périmètre

- [x] 1.1 [T-205] Confirmer la branche `front/refactor-205-polish-responsive-apres-pr225-226`, le registre et l'absence de modification applicative préexistante à embarquer.
- [x] 1.2 [T-205] Comparer le shell courant après les PR 225 et 226 et consigner les zones observées à 320, 375, 820 et desktop.

## 2. Implémenter le polish responsive

- [x] 2.1 [T-205] Ajuster les variables et espacements du shell mobile pour les safe areas et les petits conteneurs.
- [x] 2.2 [T-205] Encadrer la navigation et les actions intermédiaires par un défilement local ou un empilement sans débordement de page.
- [x] 2.3 [T-205] Préserver les labels ARIA, les focus visibles, les zones tactiles et le seuil desktop existant.

## 3. Tester l'impact

- [x] 3.1 [T-205] Ajouter ou mettre à jour les tests frontend ciblant le shell et la navigation responsive.
- [x] 3.2 [T-205] Exécuter le lint, les tests et le build frontend avec le client API généré présent dans la branche.
- [x] 3.3 [T-205] Observer le rendu navigateur à 320, 375, 820 et desktop, puis consigner les résultats et limites d'authentification.

## 4. Livrer de façon réversible

- [x] 4.1 [T-205] Vérifier le statut OpenSpec, le registre des tickets et le diff final sans fichier généré accidentel.
- [x] 4.2 [T-205] Créer le commit local T-205 et pousser uniquement la branche dédiée.
- [x] 4.3 [T-205] Créer la PR vers `develop` avec les bonnes pratiques, les validations exécutées et le plan de revert.
