## 1. Inventorier les formulaires et les règles

- [x] 1.1 [T-185] Vérifier la branche `front/feat-185-signaler-champs-requis`, résoudre T-185 et inventorier les formulaires, champs requis, champs facultatifs et validateurs existants.
- [x] 1.2 [T-185] Définir la convention d'indicateur obligatoire, les règles de nommage Transloco et la matrice des messages locaux, métier et d'authentification.

## 2. Implémenter l'indication des champs obligatoires

- [x] 2.1 [T-185] Ajouter l'indicateur visuel et accessible aux champs obligatoires des formulaires d'authentification, membres, catégories, campagnes, règlements, cagnottes, contributions et rôles.
- [x] 2.2 [T-185] Harmoniser les attributs `required`, `aria-required`, `aria-invalid` et `aria-describedby` pour les contrôles natifs et personnalisés.
- [x] 2.3 [T-185] Ajouter ou réutiliser les clés Transloco françaises pour les indicateurs, aides et messages de validation sans texte en dur dans les templates.

## 3. Rendre les messages précis sans divulgation

- [x] 3.1 [T-185] Remplacer les messages génériques des validations locales par des messages adaptés aux règles obligatoire, format, borne, cohérence entre champs et choix requis.
- [x] 3.2 [T-185] Conserver les messages génériques de sécurité pour la connexion et mapper les erreurs API à partir de `ErrorResponse.code` et `fieldErrors`.

## 4. Valider le comportement

- [x] 4.1 [T-185] Ajouter les tests frontend couvrant les marqueurs, messages, associations DOM, contrôles personnalisés, soumission, correction et réinitialisation.
- [x] 4.2 [T-185] Exécuter les tests frontend, le build et une vérification manuelle clavier des formulaires concernés, puis préparer une PR vers `develop` sans fusion ni publication non demandée.
