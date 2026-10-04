## Contexte

Les formulaires métier utilisent le composant partagé `form-dialog`. Le
correctif doit donc agir sur sa structure et ses styles, afin de corriger les
dialogues de création et de modification sans dupliquer des règles dans les
features.

## Décisions

- Le conteneur mobile du dialogue sera limité par la hauteur dynamique de la
  fenêtre et recevra un espacement supérieur et inférieur basé sur
  `env(safe-area-inset-*)`, avec une marge minimale lisible.
- Le contenu central sera la seule zone défilable. L'en-tête contenant le titre
  et le bouton de fermeture ainsi que le pied contenant les actions resteront
  visibles.
- Le bouton de fermeture conservera un nom accessible et le comportement de
  fermeture existant. Les boutons Annuler et Enregistrer restent présents sur
  mobile, car ils offrent des actions explicites et accessibles au clavier.
- Le comportement desktop restera inchangé autant que possible grâce à une
  règle responsive ciblée.
- Les groupes `.form-dialog-actions` seront traités comme une grille mobile à
  deux colonnes de largeur égale, avec un espacement constant et des contrôles
  qui occupent toute leur cellule. Sous une largeur très étroite, la grille
  passera en une colonne pour éviter les libellés tronqués ou le défilement
  horizontal. Le seuil de 24 rem tient compte des marges internes du dialogue,
  afin de conserver des libellés lisibles sur les largeurs mobiles de 320 et
  375 px tout en gardant la présentation en ligne sur les écrans plus larges.
  Les libellés peuvent aussi revenir à la ligne sans agrandir la page
  horizontalement. L'ordre existant, action secondaire puis action principale,
  sera conservé.

## Validation

- Tester le rendu DOM du dialogue, la présence des contrôles et les classes ou
  styles responsables de la zone défilable.
- Exécuter les tests frontend, le lint, le formatage et le build.
- Vérifier manuellement à 320, 375 et 430 px, en orientation portrait, avec un
  formulaire long et un clavier visible si le navigateur le permet.
- Vérifier les groupes de boutons à 320, 375 et 430 px ainsi qu'avec un zoom de
  texte élevé, en contrôlant la cible tactile, le contraste et l'absence de
  débordement.
