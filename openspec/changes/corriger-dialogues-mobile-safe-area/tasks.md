## 1. Ticket et diagnostic

- [x] 1.1 [T-207] Résoudre T-207, confirmer `front/fix-207-dialogues-mobile-safe-area` et exécuter `node scripts/tickets.mjs verify T-207` avant le code.
- [x] 1.2 [T-207] Lire le composant partagé de dialogue, inventorier ses usages et confirmer le périmètre mobile sans embarquer les modifications préexistantes.

## 2. Correction du dialogue mobile et des actions

- [x] 2.1 [T-207] Ajouter l'espacement de zone sûre en haut et en bas du dialogue mobile, avec une limite de hauteur compatible avec les fenêtres mobiles.
- [x] 2.2 [T-207] Organiser l'en-tête, le contenu défilable et le pied d'actions pour garder la fermeture et les actions accessibles sur un formulaire long.
- [x] 2.3 [T-207] Préserver l'accessibilité du dialogue, du bouton de fermeture et des actions Annuler et Enregistrer.
- [x] 2.4 [T-207] Harmoniser les groupes `.form-dialog-actions` en grille mobile à deux colonnes de largeur égale, avec empilement sous contrainte et contrôles tactiles pleine largeur.

## 3. Validation

- [x] 3.1 [T-207] Ajouter ou compléter les tests ciblés du composant partagé pour le rendu mobile, les groupes d'actions et les contrôles accessibles.
- [ ] 3.2 [T-207] Exécuter les tests frontend, le lint, le formatage et le build, puis vérifier le rendu aux largeurs mobiles ciblées.
- [ ] 3.3 [T-207] Relire le diff ciblé, valider OpenSpec et le registre des tickets, puis préparer la PR vers `develop` sans fusion ni publication non demandée.
