## Context

Le détail d'une campagne rend les règlements dans `contribo-front/src/app/features/campaigns/components/campaign-payments-tab/campaign-payments-tab.html`. Le composant réutilise `app-data-table`, les tokens de `contribo-front/src/styles.css` et les polices déjà chargées par l'application. Le prototype de référence est `design/`, notamment les règles `.tab-toolbar`, `.data-panel` et `.table` de `design/styles.css`.

Le contenu fonctionnel actuel est volontairement conservé : quatre colonnes, pagination, chargement, état vide, erreur et appel API de la feature. Le hero de campagne doit également exposer uniquement des actions ayant un effet observable. T-133 dépend de T-132 afin de partir de la version stabilisée du détail de campagne.

## Goals / Non-Goals

**Goals:**

- Reproduire la hiérarchie visuelle du prototype pour le titre, la description, l'en-tête et les lignes du tableau.
- Utiliser les tokens existants `font-sans`, `font-data`, `text-text`, `text-text-2`, `text-text-3`, `text-success`, `bg-surface` et `bg-surface-2`.
- Aligner les tailles, graisses, interlettrages, hauteurs de ligne, espacements et séparateurs sur les valeurs du prototype.
- Vérifier la lisibilité desktop et le comportement du conteneur horizontal sur les petits écrans.
- Supprimer l'action hero « Voir la situation des membres », qui répète l'onglet initial sans changer l'état perceptible de la page.
- Préserver l'onglet « Situation des membres » et les boutons « Enregistrer un règlement » au niveau des lignes de cotisation.

**Non-Goals:**

- Ne pas ajouter, supprimer, renommer ou réordonner une colonne.
- Ne pas afficher `recordedBy`, `recordedAt` ou une nouvelle métadonnée dans ce tableau MVP.
- Ne pas modifier les DTO, les appels API, les mocks, les droits, les filtres ou la pagination.
- Ne pas créer une nouvelle police, une dépendance ou un composant partagé uniquement pour cette correction.
- Ne pas ajouter de bouton hero « Enregistrer un règlement » tant qu'un sélecteur de membre et de cotisation n'est pas disponible.

## Decisions

### Réutiliser les tokens et le composant existants

La correction reste dans la feature campagnes, principalement dans le template de `CampaignPaymentsTab`. Les classes Tailwind existantes et les variables de `styles.css` expriment déjà les polices du prototype. Cette option évite une divergence entre le tableau des règlements et les autres tableaux.

Alternative écartée : ajouter une feuille de style ou un composant de tableau spécifique. Cela dupliquerait les tokens et rendrait les écarts futurs plus probables.

### Reproduire les niveaux typographiques du prototype

- Le titre de section utilise la typographie d'interface de niveau `h3`, et non la police d'affichage condensée réservée aux grands titres.
- La description reste secondaire, avec la taille et la couleur de texte atténuée du prototype.
- L'en-tête utilise `font-data`, une petite taille, une graisse moyenne, la casse majuscule et l'interlettrage du prototype.
- Les lignes utilisent une hauteur de 64 px, des cellules de 16 px, un texte de 13 px, un nom de membre plus contrasté, et des valeurs monétaires en `font-data` tabulaire avec la couleur de succès.

Alternative écartée : ajuster seulement la taille de police. Le défaut observé concerne aussi la famille, la graisse, l'interlettrage, le contraste et les espacements.

### Conserver la structure métier du tableau

Le template conserve exactement les quatre cellules existantes et leur ordre : membre, montant, mode de règlement, date. La fidélité au design porte sur la présentation de ces cellules, pas sur l'ajout de la colonne « Enregistré par » visible dans certaines variantes du prototype.

### Supprimer l'action hero sans remplacer artificiellement le flux

Le bouton « Voir la situation des membres » sera retiré du hero et la méthode `openSituationTab` pourra être supprimée si elle n'est plus utilisée. L'onglet « Situation des membres » reste disponible dans la navigation du détail, et chaque cotisation non soldée conserve son action d'enregistrement lorsque le statut de campagne et le rôle l'autorisent.

Alternative écartée : remplacer le bouton par « Enregistrer un règlement ». Le formulaire actuel nécessite une cotisation précise et ne peut pas ouvrir une écriture financière générique sans sélectionner le membre et le reste dû. Un bouton global serait donc ambigu et demanderait un nouveau parcours métier, à traiter dans un ticket ultérieur si le besoin est confirmé.

## Risks / Trade-offs

- [Risque] Une valeur Tailwind trop précise peut diverger du design sur une autre taille d'écran. → Vérifier le rendu à la largeur desktop de référence et sur un viewport étroit, en conservant le défilement horizontal local.
- [Risque] Des tests qui vérifient uniquement le texte peuvent laisser revenir une régression visuelle. → Ajouter des sélecteurs stables de présentation nécessaires aux tests et réaliser une vérification navigateur ciblée.
- [Risque] Une correction du composant peut affecter d'autres onglets si des styles sont déplacés vers `app-data-table`. → Garder les ajustements spécifiques au tableau des règlements tant qu'aucun besoin partagé n'est démontré.
- [Risque] Retirer le bouton hero peut réduire la visibilité de la situation des membres. → Conserver l'onglet explicite et vérifier que le détail ouvre toujours la situation par défaut.

## Migration Plan

1. Résoudre T-133 et vérifier que T-132 est disponible dans la branche de base.
2. Ajuster le template de `CampaignPaymentsTab` et ses tests sans modifier le contrat API.
3. Exécuter les tests ciblés, la suite frontend, le lint, le build et la vérification visuelle navigateur.
4. Publier une PR dédiée vers `main` avec le ticket T-133.

Le retour arrière consiste à rétablir le commit de styles du composant. Aucune migration de données, génération API ou action de déploiement spécifique n'est nécessaire.

## Open Questions

- Aucune question fonctionnelle ouverte. Si une différence de rendu subsiste après la vérification navigateur, elle doit être traitée comme un ajustement de tokens ou de classes dans le périmètre T-133, sans modifier le contrat du tableau.
- Le futur bouton global d'enregistrement d'un règlement reste à concevoir avec un parcours de sélection du membre et de la cotisation.
