---
paths:
  - "contribo-front/src/**/*.html"
  - "contribo-front/src/**/*.ts"
---

# Templates Angular — Contribo

## Structure et état

- Utiliser `@if`, `@for`, `@switch` et `@let` plutôt que les anciennes directives structurelles.
- Dans `@for`, choisir une clé `track` stable, généralement l'UUID métier. Ne pas utiliser l'index pour une liste filtrable ou réordonnable.
- Utiliser `@let` lorsqu'une valeur répétée peut être factorisée utilement ; aucun préfixe `_` n'est obligatoire.
- Garder les templates simples ; les calculs/conversions réutilisés appartiennent à un pipe pur ou un `computed()`.
- Les gestionnaires d'événements restent des méthodes typées du composant.
- Utiliser les bindings de classe et de style plutôt que `ngClass` et `ngStyle`.
- Ne pas utiliser `$any()`, de fonctions fléchées ou `new Date()` dans le template.

## Saisie et interactions

- Utiliser des formulaires réactifs typés et des contrôles natifs accessibles.
- Donner `type="button"` aux boutons qui ne soumettent pas et `type="submit"` au bouton de validation.
- Associer chaque champ à un label ; relier les aides et messages d'erreur au contrôle.
- Ne pas rendre un `div` cliquable quand un bouton ou lien exprime l'action.
- Employer des SVG inline accessibles ; aucune convention de composant `ds-*` n'est imposée.
- Éviter les soumissions simultanées. Afficher l'état d'enregistrement et conserver la saisie en cas d'erreur.

## Affichage métier

- Distinguer chargement, absence de données, erreur et contenu disponible.
- Afficher les états fournis par l'API ; ne pas deviner un retard, une clôture ou un droit à partir de données partielles.
- Un montant absent n'est pas zéro. Afficher une valeur de remplacement pour une donnée facultative absente.
- Formatter montants/dates selon `i18n.md`, sans stocker de chaînes formatées dans les DTO.
- Respecter les onglets et dialogues responsive du prototype : clavier, focus et retour au contexte après fermeture.
- Textes et noms accessibles suivent `i18n.md` ; ne pas ajouter de pipe de traduction non configuré.
