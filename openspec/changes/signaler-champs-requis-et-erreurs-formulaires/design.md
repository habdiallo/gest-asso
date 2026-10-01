## Context

Le frontend Angular contient plusieurs formulaires réactifs répartis dans les features d'authentification, membres, catégories, campagnes, cagnottes et utilisateurs. Des composants partagés existent déjà pour certains contrôles, notamment les sélecteurs personnalisés, le mode de règlement et les dialogues. Les règles du frontend imposent des labels associés, des contrôles accessibles, des messages en français via Transloco et une décision d'erreur fondée sur `ErrorResponse.code` plutôt que sur le texte retourné par l'API.

Le besoin porte sur le retour utilisateur et l'accessibilité du formulaire. Il ne doit pas modifier les règles métier, l'autorisation backend ni les messages d'authentification qui doivent rester suffisamment génériques pour éviter l'énumération de comptes.

## Goals / Non-Goals

**Goals:**

- Rendre immédiatement identifiables les champs obligatoires par un indicateur visuel accompagné d'une information accessible.
- Fournir un message actionnable pour chaque validation locale connue, sans révéler de donnée privée ou de détail de sécurité.
- Garantir une association DOM correcte entre champ, aide et erreur, y compris pour les contrôles personnalisés et les dialogues.
- Uniformiser le déclenchement des erreurs après blur, après soumission ou après `markAllAsTouched`, selon le comportement existant du formulaire.
- Ajouter des tests ciblés sans dupliquer l'implémentation interne des validateurs.

**Non-Goals:**

- Modifier les règles métier, le contrat OpenAPI ou les contraintes serveur.
- Afficher les règles détaillées d'un mot de passe ou confirmer qu'un identifiant existe.
- Auditer le rendu responsive, le contraste complet ou la composition desktop, tablette et mobile.
- Introduire une bibliothèque de composants ou un système de formulaire externe.

## Decisions

### Convention d'indication des champs obligatoires

Chaque label d'un champ obligatoire affichera un astérisque visuel et une mention accessible équivalente, par exemple `obligatoire`, afin que l'information ne repose pas uniquement sur la couleur ou le symbole. Le caractère obligatoire restera aussi exprimé par le contrôle natif ou la configuration Angular adaptée.

Une abstraction partagée pourra porter le label et ses attributs si elle réduit réellement la duplication. Sinon, les templates conserveront des labels natifs proches du contrôle pour éviter une couche générique difficile à maintenir.

### Catalogue de messages par règle

Les messages seront classés par type de validation :

- champ obligatoire vide : indiquer le champ attendu ;
- format ou valeur invalide : indiquer le format ou la nature de valeur attendue ;
- borne de montant ou de date : indiquer la contrainte utile sans exposer de donnée confidentielle ;
- cohérence entre champs : indiquer les champs à comparer et la relation attendue ;
- choix obligatoire : demander une sélection explicite ;
- erreur métier API : utiliser le code stable et les erreurs de champ fournis par le contrat.

Les erreurs de connexion et de récupération de compte conserveront un message générique, même si la cause technique interne est plus précise.

### Internationalisation et accessibilité

Les nouveaux messages seront ajoutés à `fr.json` et consommés par clé Transloco. Les champs invalides auront `aria-invalid="true"`, les aides et erreurs seront reliées avec `aria-describedby`, et l'indicateur obligatoire sera annoncé sans répétition inutile.

### Couverture de tests

Les tests vérifieront le DOM et le comportement observable : présence de l'indicateur pour les champs requis, absence pour les champs facultatifs, apparition du bon message au bon moment, conservation de la saisie après erreur, association des identifiants ARIA et maintien du message générique pour l'authentification.

## Risks / Trade-offs

- [Risque] Une étoile seule est mal comprise ou invisible pour une technologie d'assistance. -> Mitigation : ajouter une mention accessible et une explication commune dans les formulaires.
- [Risque] Des messages trop détaillés divulguent une information sensible. -> Mitigation : conserver des messages génériques pour l'authentification et ne jamais afficher de valeur secrète ou d'existence de compte.
- [Risque] La duplication des labels et messages augmente la divergence entre features. -> Mitigation : centraliser les clés Transloco et extraire uniquement les motifs partagés réellement répétés.
- [Risque] Les contrôles personnalisés ne propagent pas correctement l'état du formulaire parent. -> Mitigation : tester `touched`, `invalid`, `markAllAsTouched`, `aria-describedby` et le reset sur chaque composant partagé concerné.

## Migration Plan

1. Inventorier les champs obligatoires et facultatifs de chaque formulaire concerné.
2. Définir les clés et la convention française dans `fr.json`.
3. Appliquer la convention aux features et composants partagés par petits groupes.
4. Ajouter les tests de DOM, de validation et d'accessibilité associés.
5. Exécuter les tests frontend et le build.
6. Revenir en arrière en retirant les nouveaux mappings et marqueurs sans modifier le contrat API ni les données.

## Open Questions

- Souhaite-t-on afficher une légende globale `* Champ obligatoire` sur chaque dialogue, en plus de l'information portée par chaque label ?
- Quels champs de mot de passe doivent être décrits par une aide visible, au-delà d'un message d'erreur générique ?
