## Context

Le prototype `design/` centralise le rendu des actions dans `.btn`, avec une hauteur
de 44 px, un rayon de 8 px, une icône et des variantes primaire, secondaire et
danger. Le frontend a déjà rapproché plusieurs classes de ces tokens, mais les
templates continuent de répéter des classes et des SVG. Le dashboard expose
« Nouvelle campagne » comme un lien Angular avec une apparence de bouton, tandis
que les listes utilisent des boutons HTML dont les classes ne sont pas toujours
identiques.

La sidebar a déjà un shell proche du prototype : largeur 256 px, padding, rayon,
état actif et seuil desktop. L'écart observé porte surtout sur le modèle de
navigation et sur le pied : ordre, libellés, regroupement Administration, entrée
« Mon espace » pour l'administrateur, ainsi que la présentation de l'identité et
des actions de pied. `design/app.js` fournit la référence de contenu, et
`navigation-items.ts` reste la source des destinations autorisées côté Angular.

## Goals / Non-Goals

**Goals:**

- Fournir une primitive Angular partagée pour le rendu des actions, utilisable par
  les liens de navigation et par les boutons d'action.
- Conserver la bonne sémantique HTML : un lien pour aller vers
  `/campagnes?creer=1`, un bouton pour une action locale ou la soumission d'un
  formulaire.
- Migrer les actions visibles des écrans concernés vers cette primitive sans
  changer leurs routes, paramètres, validations ou droits.
- Faire correspondre la navigation desktop administrateur au prototype et rendre
  les variantes de rôle explicites et testables.
- Vérifier le rendu à partir des deux pages locales de référence, en conservant le
  comportement mobile et les actions d'authentification.

**Non-Goals:**

- Transformer un lien de navigation en bouton uniquement pour son apparence.
- Ajouter une destination, une permission, une API ou une page métier.
- Modifier le backend, le contrat OpenAPI, les données de session ou la logique de
  connexion.
- Réécrire le shell CSS déjà aligné si la comparaison confirme qu'il ne constitue
  pas l'écart principal.

## Decisions

### 1. Un composant d'action partagé avec deux modes sémantiques

Créer le composant neutre `contribo-front/src/app/shared/action-button/`. Il expose
un contrat de rendu commun pour les variantes `primary`, `secondary` et `danger`,
les icônes existantes, l'état désactivé et l'état de chargement. Il supporte un
mode bouton natif et un mode lien Angular avec `RouterLink` et `queryParams`.

Le dashboard utilisera le mode lien pour « Nouvelle campagne », car cette action
change de route et conserve `creer=1`. Les actions de création présentes dans une
formulaire ou les actions locales utiliseront le mode bouton avec un `type` explicite.
Dans les deux cas, le même composant porte les classes visuelles, le focus visible,
les attributs ARIA nécessaires et l'icône décorative.

Alternative écartée : conserver des classes Tailwind copiées dans chaque template.
Cette solution règle un écran à la fois et permet aux divergences de revenir lors
des prochains menus. Une conversion systématique des liens en boutons est également
écartée, car elle dégrade la navigation clavier, l'ouverture dans un nouvel onglet
et la sémantique des URLs.

### 2. Migration ciblée des actions utilisateur

Inventorier les actions primaires, secondaires, dangereuses et de pagination dans
`dashboard`, `members`, `campaigns`, `social-funds`, `income-categories` et
`roles-users`. Remplacer les actions qui correspondent au motif `.btn` du prototype,
en conservant les contrôles spécialisés qui ont un contrat différent, comme les
onglets, filtres, selects et liens textuels.

Le dashboard et les actions « créer » des listes servent de parcours de référence.
Les tests vérifient le nœud HTML produit, le libellé, l'icône, la route ou l'événement,
et l'absence de soumission implicite quand un bouton est de type `button`.

### 3. Modèle de navigation centralisé et role-aware

Étendre le modèle de navigation partagé plutôt que de coder des exceptions dans le
template. Chaque entrée conserve sa destination et son icône, et porte au besoin
une section de présentation. Pour l'administrateur, la référence desktop est :
Tableau de bord, Membres, Cotisations, Cagnottes, puis Administration contenant
Utilisateurs & rôles et Catégories. Les libellés « Cotisations », « Utilisateurs &
rôles » et « Catégories » sont des libellés de navigation, sans renommage des
routes ou des modèles métier.

Les autres rôles gardent uniquement leurs destinations autorisées. L'entrée
« Mon espace » ne doit pas être ajoutée à la navigation administrateur desktop si
elle n'est pas présente dans le prototype, mais sa route et ses garde-fous ne sont
pas supprimés. La navigation mobile conserve son comportement actuel sauf si un
test montre qu'elle partage nécessairement le même modèle de libellés.

Alternative écartée : dupliquer le menu de `design/app.js` dans Angular. Le
prototype peut servir de référence visuelle, mais les permissions et les routes
doivent rester dérivées de la session et du modèle frontend.

### 4. Pied de sidebar fondé sur la session

Conserver `SessionService.user()` comme seule source de nom, initiales et rôle.
Aligner le séparateur, l'espacement, l'avatar, la ligne d'identité et l'affordance
du pied sur `.profile*` du prototype. La déconnexion et le changement de thème
restent accessibles et conservent leurs effets, même si leur placement exact doit
être adapté au shell Angular.

### 5. Liste Campagnes alignée sur les cartes du prototype

La page `/campagnes` reprend le motif de la référence visuelle : en-tête avec
action de création, barre de recherche pleine largeur, groupe segmenté de filtres
et grille responsive de cartes. Chaque carte affiche le nombre de membres, le nom,
la période, le statut, puis le montant encaissé, le montant attendu et la
progression lorsque `financialSummary` est fourni par l'API. Les rôles qui ne
reçoivent pas ce bilan conservent une carte de consultation sans inventer de
montants.

La présentation de la liste ne propose que les statuts Toutes, Ouvertes et
Clôturées. La valeur technique `UPCOMING`, encore acceptée par le contrat pour
les règles de détail et les données historiques, est normalisée visuellement en
Ouverte dans cette page afin de ne pas exposer un troisième statut à l'utilisateur.
Le segment « Ouvertes » utilise `status=OPEN`, défini par le contrat de liste comme
l'union des états techniques `OPEN` et `UPCOMING`, pour ne pas masquer une campagne
présentée comme ouverte. Cette décision ne modifie pas les conditions d'édition du
barème, qui continuent de dépendre du statut technique.

### 6. Liste Cagnottes alignée sur les cartes du prototype

La page `/cagnottes` reprend le même shell de liste que `/campagnes` : largeur
maximale de 1440 px, recherche iconifiée, groupe segmenté Toutes/Ouvertes/Clôturées
et grille responsive de cartes. Chaque carte affiche le type d'événement, le statut
avec un point de couleur, le titre, le bénéficiaire et la période, puis le montant
encaissé, l'objectif, la progression et le nombre de contributeurs lorsque ces
informations sont renvoyées par l'API.

La recherche et le statut utilisent les paramètres contractuels `q` et `status` de
`GET /social-funds`. La pagination et le filtre existant par type d'événement sont
préservés, ce dernier restant disponible dans un filtre secondaire afin de ne pas
perdre une capacité métier déjà livrée. La réponse est ordonnée de la date de début
la plus récente à la plus ancienne avant pagination, conformément au contrat API.

### 7. Composant partagé de cartes financières

Les cartes Campagnes et Cagnottes utilisent le composant neutre
`contribo-front/src/app/shared/financial-card/`. Il reçoit uniquement des valeurs
d'affichage et une destination de détail : libellé supérieur, statut et son ton,
titre, sous-titre, montant encaissé, objectif facultatif, progression facultative,
libellé de pied et valeur de progression. Les pages restent responsables des
formats de dates, de montants et des libellés métier propres à leur API.

Le composant rend un lien Angular couvrant la carte et applique le même conteneur
que `.campaign-card` du prototype : bordure et ombre de repos, déplacement de 2 px
et bordure dorée au survol, titre doré au survol ou au focus, ainsi qu'un anneau
`focus-visible` accessible. L'absence d'objectif masque complètement la comparaison
avec l'objectif et la barre de progression, sans transformer un montant absent en
zéro.

### 8. Dimensions et ordre des listes

Le composant partagé utilise un padding de 21 px et ne dépend ni d'une hauteur
minimale ni de `h-full` : la carte prend la hauteur de son contenu. Le bloc financier
suit le sous-titre avec une marge de 22 px, comme `.campaign-card` dans le prototype,
au lieu d'être repoussé artificiellement en bas de carte. Les éléments de grille ne
portent pas de hauteur minimale additionnelle : une variante plus courte ne peut donc
pas étirer les autres cartes de sa ligne. Les listes demandent au serveur six éléments
par page, ce qui produit au maximum deux lignes de trois cartes sur desktop, puis
conservent la pagination existante pour les éléments suivants.

Les campagnes et les cagnottes sont triées par `startDate` décroissante, puis par
`endDate` décroissante en cas d'égalité, avant la pagination. Le contrat OpenAPI
documente cet ordre pour les deux opérations de liste. Le mock MSW applique le même
tri afin que la démonstration et les tests représentent le comportement attendu du
serveur.

## Risks / Trade-offs

- [Risque] Un lien converti en bouton pourrait perdre le comportement d'URL ou de
  navigation dans un nouvel onglet -> le mode lien est obligatoire pour les
  destinations, avec un test sur `RouterLink` et `creer=1`.
- [Risque] Un composant trop générique pourrait modifier le type d'un bouton de
  formulaire -> le type est explicite et couvert par des tests de soumission.
- [Risque] Les libellés de la maquette peuvent être appliqués à un rôle non
  autorisé -> les entrées restent filtrées par le rôle et aucun lien de prototype
  n'est ajouté sans destination autorisée.
- [Risque] Le rendu du prototype utilise des identités de démonstration différentes
  de l'application -> les captures de validation utilisent les données de session,
  jamais les noms codés en dur de `design/app.js`.
- [Risque] Une modification du modèle vertical se répercute sur la navigation
  mobile -> les tests vérifient séparément les orientations et le breakpoint
  existant.

## Migration Plan

1. Réserver T-128, résoudre le ticket et renommer la branche provisoire en
   `front/fix-128-harmonisation-actions-navigation-sidebar` avant toute modification
   applicative.
2. Ajouter le composant partagé et ses tests unitaires sans changer les parcours.
3. Migrer le dashboard, puis les actions équivalentes des listes et formulaires.
4. Mettre à jour le modèle de navigation, les tests de rôle et le rendu du pied.
5. Comparer l'application et `design/index.html` aux largeurs desktop prévues,
   exécuter les tests, le build et le lint, puis livrer une PR vers `main`.

Le retour arrière consiste à remettre les templates sur leurs composants précédents
et à restaurer les libellés de navigation, sans migration de données ni changement
API.

## Open Questions

Aucune question bloquante. La revue visuelle finale doit toutefois confirmer les
dimensions au breakpoint desktop et le placement exact de la déconnexion après la
première intégration du composant partagé.
