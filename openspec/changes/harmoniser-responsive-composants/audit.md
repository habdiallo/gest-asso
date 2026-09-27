# Audit responsive T-139

## Portée observée

L'audit couvre le shell, les composants `shared/`, les composants locaux des
features et les pages métier présentes dans `contribo-front/src/app`. Les captures
du dashboard servent de référence de densité et de composition mobile. Elles ne
définissent ni les données ni l'ordre fonctionnel à implémenter.

## Largeurs et conventions existantes

| Surface    | Convention observée                                                   | Largeurs ou seuils                 | Point de vigilance                                                                          |
| ---------- | --------------------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------- |
| Shell      | Sidebar et topbar desktop, header et navigation basse mobile/tablette | `1181px`                           | Le footer fixe réduit la surface utile et les libellés horizontaux doivent rester lisibles  |
| Pages      | Conteneur `max-w-shell`, padding progressif et page header partagé    | `660px`, `661px`, `sm`, `lg`, `xl` | Les seuils Tailwind `sm` et les seuils métier ne sont pas toujours alignés                  |
| Dashboard  | Grilles 1 colonne, 2 colonnes puis 4 colonnes pour les KPI            | `sm`, `lg`                         | Les cartes KPI gardent `174px`, `22px` de padding et plusieurs espacements fixes sur mobile |
| Listes     | Filtres empilés sur mobile, tableaux dans `overflow-x-auto`           | `sm`, `lg`, `821px`                | Les actions et filtres ne partagent pas toujours la même largeur utile                      |
| Détails    | Hero et métriques recomposés avant les colonnes desktop               | `661px`, `xl`                      | Les actions et les métriques doivent conserver leur priorité sur largeur étroite            |
| Dialogues  | Plein écran mobile, fenêtre contrainte au-dessus de `821px`           | `821px`                            | Les pieds de formulaire doivent rester accessibles avec le clavier et le scroll interne     |
| Navigation | `sidebar-link` vertical, liens iconographiques dans la barre basse    | `1181px`                           | La composition horizontale doit rester partagée et filtrée par rôle                         |

## Constats

- Le shell masque correctement la sidebar sous `1181px`. Le header mobile/tablette
  reprend désormais la marque, le thème et le profil dans une composition compacte.
- `app-page-header` empile son contenu sous `660px`, mais les actions projetées
  restent contraintes par le `min-w-32` du bouton et ne prennent pas naturellement
  toute la largeur disponible.
- Les cartes KPI du dashboard utilisent une hauteur minimale de `174px`, un
  padding de `22px` et des espacements verticaux fixes. La grille passe bien en
  une colonne, mais le rythme vertical est trop coûteux pour un écran mobile.
- Les actions rapides sont déjà en grille 1 colonne puis 2 colonnes, mais chaque
  raccourci conserve une hauteur minimale de `92px`, alors qu'une liste compacte
  avec deux colonnes sur mobile large peut préserver la même accessibilité.
- Les listes et tableaux possèdent des conteneurs de scroll local, ce qui doit
  être conservé. Les lignes de liste doivent toutefois limiter les troncatures
  qui masquent la valeur ou le statut principal.
- Les composants partagés reprennent les tokens T-138, mais quelques paddings et
  dimensions restent locaux dans `financial-card`, `empty-state`, `page-header`
  et les cartes du dashboard.
- Les formulaires utilisent déjà des grilles adaptées et les dialogues sont
  plein écran sur mobile. Le changement doit donc rester ciblé sur la composition,
  sans modifier les contrats de formulaire.

## Matrice problème, règle et exception

| Problème                                  | Composants concernés                  | Règle T-139                                                                                   | Exception admise                                                                                |
| ----------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Action de page trop étroite               | `page-header`, `action-button`        | Étendre l'action à la largeur du conteneur sous `660px`                                       | Plusieurs actions restent en ligne si leur largeur totale est lisible                           |
| Navigation basse peu identifiable         | `navigation-menu`, shell              | Ajouter un repère iconographique et préserver une cible tactile stable                        | Les rôles avec peu d'items gardent leur répartition fluide                                      |
| Cartes KPI trop hautes                    | Dashboard et cartes financières       | Réduire padding et espaces sur mobile, conserver la grille quand les valeurs restent lisibles | Les montants longs gardent leur largeur et leur wrapping                                        |
| Densité verticale excessive               | Actions rapides et sections dashboard | Utiliser une composition compacte cohérente avec le conteneur                                 | Ne pas compacter une action dont le libellé devient ambigu                                      |
| Largeur de tableau supérieure au viewport | `data-table`, pages de listes         | Conserver le scroll local et empêcher le scroll de page                                       | Une carte mobile dédiée est possible seulement si elle conserve toutes les données essentielles |
| Transitions hétérogènes                   | Pages de liste, détail et formulaires | Aligner les compositions sur les seuils observés `661px` et `821px`                           | `xl` reste justifié pour les colonnes de détail réellement larges                               |

## Direction retenue

1. Stabiliser le shell et les primitives partagées avant les pages métier.
2. Utiliser la largeur réelle du conteneur pour les actions et les cartes, avec
   `min-width: 0` et des grilles fluides avant d'ajouter un breakpoint.
3. Réduire la densité uniquement sur mobile, sans diminuer les touch targets,
   supprimer les valeurs financières ou masquer l'action principale.
4. Conserver les tableaux en scroll local, les dialogues plein écran et les
   formulaires empilés sur mobile.
5. Vérifier les deux thèmes et les largeurs 340px, 390px, 640px, 820px, 1024px
   et 1280px, en portant une attention particulière aux transitions 660/661px et
   820/821px.

## Décisions confirmées

- Les tokens T-138 restent la source visuelle globale. T-139 ajuste leur
  composition, pas leur palette ni le contrat des composants.
- Aucune nouvelle container query n'est nécessaire avant une preuve issue de la
  vérification des composants réutilisés dans des conteneurs différents.
- Le dashboard est une surface de validation prioritaire, pas une exception au
  périmètre transversal.
- La navigation basse est rendue par le même composant partagé que la sidebar.
  Elle ajoute Accueil, conserve uniquement les destinations autorisées par le
  rôle et garde les catégories de revenu dans un défilement horizontal local
  lorsque les six destinations ne tiennent pas dans la largeur disponible.
- Le lien mobile « Utilisateurs & rôles » conserve une cible tactile stable et se
  répartit sur deux lignes lorsque la largeur impose ce compromis.

## Vérifications réalisées

- Smoke test visuel sur l'application mock à `375x667` : le dashboard expose le
  header mobile, les actions principales, les sélecteurs et la navigation basse
  sans débordement de la page ; la grille KPI reste sur une colonne à cette
  largeur.
- Vérification de la composition de navigation mobile : Accueil est placé en
  première position, les icônes et les libellés sont centrés, les destinations
  changent selon le rôle, « Utilisateurs & rôles » reste lisible sur deux lignes
  et « Catégories » reste visible pour l'administrateur lorsque la largeur le
  permet, avec un défilement local conservé en secours sur les écrans plus
  étroits.
- Correction visuelle complémentaire : le libellé long de la dernière entrée
  administrative peut se casser dans la largeur de son bouton afin de ne pas
  empiéter sur Catégories.
- La typographie de la navigation basse est fixée à `8px` pour préserver la
  lisibilité et la densité attendues sur mobile.
- Une échelle typographique responsive est maintenant portée par des tokens
  globaux : mobile jusqu'à `660px`, tablette de `661px` à `1180px`, desktop au
  delà. Les primitives `page-header`, `detail-shell`, `data-table`, cartes,
  métriques, sélecteurs, dialogues, états vides et pagination consomment ces
  tokens au lieu de reprendre automatiquement les tailles desktop.
- Le parcours Membres a été contrôlé sur la liste et la fiche en défilement :
  la table conserve un scroll horizontal local, la fiche empile ses actions et
  ses métriques, et les réserves du shell maintiennent le contenu au-dessus de
  la navigation fixe. Une marge supplémentaire est réservée sous le dernier
  contenu pour garder les boutons de pagination entièrement accessibles.
- Les paginations des listes Membres, Campagnes et Cagnottes passent en colonne
  sous `660px`, avec des boutons compacts à chevrons et un compteur centré au
  format `1/3`. Les libellés complets restent disponibles aux technologies
  d’assistance et reprennent leur affichage textuel sur tablette et desktop.
- Les listes Cotisations et Cagnottes demandent six cartes par page. La
  pagination est masquée tant qu’une seule page suffit et apparaît uniquement
  au-delà de six cartes, sur mobile comme sur desktop.
- Vérification tablette par la règle de shell `1181px` : la navigation basse et
  l'en-tête compact restent actifs sous ce seuil, tandis que la sidebar et la
  topbar ne reprennent la main qu'au-dessus. L'en-tête est fixe en haut de la
  fenêtre et la navigation basse est fixe en bas, avec des réserves de contenu
  pour éviter tout recouvrement pendant le défilement.
- Vérification du profil mobile : le bouton utilisateur ouvre un menu compact
  donnant accès à l'espace personnel et à la déconnexion, sans dupliquer ces
  actions dans le shell fermé. Le panneau est opaque et ses deux actions
  utilisent le rayon standard de bouton, tandis que le conteneur utilise le
  rayon de menu.
- Vérification desktop à `1280x720` : la sidebar, les quatre KPI et la
  composition large restent alignés, puis contrôle du thème clair et du thème
  sombre sur le même parcours.
- Vérification du détail de campagne à la même largeur : le tableau conserve
  son défilement horizontal local et la navigation basse reste visible.
- Le lien mobile « Utilisateurs & rôles » se répartit sur deux lignes dans sa
  cible sans réduire la zone tactile ni modifier les destinations autorisées.
- Vérification statique des transitions `660/661px`, `820/821px` et `1180/1181px`
  dans les composants modifiés, complétée par le build, le lint et les tests
  frontend.
- La vérification visuelle exhaustive des six largeurs intermédiaires reste une
  limite de l'environnement de validation courant ; les règles sont toutefois
  bornées aux seuils existants et aucune donnée ou interaction n'a été
  supprimée.
