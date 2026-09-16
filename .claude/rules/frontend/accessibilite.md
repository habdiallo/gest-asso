---
paths:
  - "contribo-front/src/**"
---

# Accessibilité — Contribo

## Exigence et approche

- Respecter les exigences WCAG AA : clavier, focus, contraste et noms accessibles.
- Privilégier HTML sémantique/contrôles natifs ; ARIA seulement lorsque la sémantique native ne suffit pas.
- Ne pas communiquer un statut, retard ou erreur uniquement par la couleur.
- Vérifier contraste/focus dans les deux thèmes et aux tailles mobile, tablette et desktop.
- Aucun runner axe n'est installé : ne pas annoncer une validation exhaustive. Si un audit axe est disponible, traiter ses erreurs et compléter par clavier/visuel.

## Contrôles et messages

| Élément | Attendu |
| --- | --- |
| Bouton sans texte | Nom accessible français, `aria-label` ou texte masqué |
| Champ | Label associé à un identifiant unique |
| Champ obligatoire | `required` natif ; `aria-required` si contrôle personnalisé |
| Champ invalide | `aria-invalid` cohérent avec la validation affichée |
| Aide/erreur de champ | `aria-describedby` vers des éléments présents |
| Navigation courante | `aria-current="page"` ou `ariaCurrentWhenActive="page"` avec le routage Angular |
| Contrôle repliable | `aria-expanded` et `aria-controls` cohérents |
| SVG décoratif | `aria-hidden="true"` et non focusable |
| Retour informatif | `role="status"` ou live region polie adaptée |
| Erreur bloquante | Annonce adaptée, par exemple `role="alert"`, sans répétition inutile |

## Clavier et interactions

- Boutons/liens natifs, tabulation logique et focus visible.
- Un dialogue possède un nom, reçoit le focus, contient la navigation clavier et restitue le focus au déclencheur à la fermeture.
- Gérer Échap lorsque la fermeture est autorisée, sans perte silencieuse de saisie.
- Onglets : rôles, sélection, association au panneau et navigation clavier cohérents.
- Ne pas utiliser `tabindex` positif ni masquer globalement le focus en CSS.
- Maintenir l'accès clavier après filtrage, pagination et actualisation.
- Ne pas déléguer ces responsabilités à une bibliothèque absente.

## Langue et vérification

- Noms accessibles selon `i18n.md` : français MVP, sans pipe de traduction fictif.
- Tester noms/associations DOM dans Angular ; vérifier clavier et lisibilité dans un navigateur disponible.
- Compilation et tests jsdom ne constituent pas un audit d'accessibilité complet.
