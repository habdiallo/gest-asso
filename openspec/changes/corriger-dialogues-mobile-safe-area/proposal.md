## Pourquoi

Sur mobile, les dialogues de formulaire peuvent commencer trop près du bord
supérieur de la fenêtre. Dans une PWA, cette zone peut être occupée par la
barre système ou l'encoche de l'appareil, ce qui masque le bouton de fermeture
et donne l'impression que le formulaire est superposé au système.

## Changements

- Respecter les zones sûres supérieure et inférieure de la fenêtre sur les
  dialogues partagés.
- Conserver un bouton de fermeture atteignable et un corps de formulaire
  défilable lorsque le contenu dépasse la hauteur disponible.
- Garder les actions Annuler et Enregistrer visibles dans le pied du dialogue,
  avec un espacement adapté aux petits écrans.
- Harmoniser les groupes de deux actions pour qu'ils occupent la largeur
  disponible et se partagent la ligne sur mobile lorsque les libellés restent
  lisibles.
- Vérifier le clavier, le focus et les tailles mobiles sans modifier les
  contrats métier ni les données envoyées.

## Hors périmètre

- Aucun changement de validation ou de comportement API.
- Aucun changement de navigation basse ou de shell global.
- Aucun ajout de bibliothèque de composants.
- Aucun changement des libellés ou de l'ordre métier des actions.
