## MODIFIED Requirements

### Requirement: Présentation des liens et de leur état actif

Le frontend SHALL appliquer aux liens verticaux existants la présentation `.nav` et
`.nav-item` du prototype : icône 18 px, texte 14 px, gap 12 px, hauteur nominale
43 px, rayon 9 px et espacement entre items de 5 px. Il SHALL reproduire le survol
et l'état actif avec fond gold-wash, bordure teintée, accent sur texte/icône et
repère latéral lumineux. Il SHALL permettre l'agrandissement du texte sans couper
les libellés.

Pour le rôle Administrateur, la navigation desktop SHALL afficher dans cet ordre
les destinations existantes : « Tableau de bord », « Membres », « Cotisations »,
« Cagnottes », puis une rubrique « Administration » contenant « Utilisateurs &
rôles » et « Catégories ». Les libellés sont ceux de la référence `design/`, tandis
que les routes, les gardes et les permissions restent ceux de l'application.
Pour les autres rôles, seuls les liens déjà autorisés par `navigationItemsForRole`
peuvent être affichés, avec le regroupement Administration uniquement lorsqu'il
contient des entrées.

#### Scenario: Navigation administrateur conforme au prototype

- **WHEN** un Administrateur consulte la sidebar desktop
- **THEN** les sept entrées et leur ordre correspondent à la référence visuelle,
  avec « Utilisateurs & rôles » et « Catégories » dans Administration
- **AND** l'entrée « Mon espace » n'est pas affichée dans cette navigation desktop
- **AND** les routes de campagnes, catégories et rôles restent leurs routes
  Angular existantes

#### Scenario: Navigation selon le rôle

- **WHEN** un Trésorier, Opérateur ou Membre consulte sa navigation
- **THEN** il ne voit que les destinations autorisées pour son rôle
- **AND** aucun libellé ou regroupement administrateur ne lui donne un accès
  supplémentaire

#### Scenario: Destination et état actif

- **WHEN** un utilisateur active un lien de sidebar puis consulte une sous-route
  couverte par ce lien
- **THEN** le lien garde sa destination et son comportement actuels et affiche
  l'état actif complet avec `aria-current="page"`
- **AND** le repère latéral est visible sans être coupé et le focus clavier reste
  perceptible

### Requirement: Identité et actions existantes en pied

Le frontend SHALL reproduire la présentation `.profile*` du prototype avec un
séparateur, un avatar, une ligne de nom et le rôle applicatif à partir des seules
données disponibles dans `SessionService.user()`. Le pied SHALL conserver les
actions de thème et de déconnexion sous une forme accessible, avec le même contrat
visuel d'action partagé lorsqu'elles sont rendues comme boutons. Le bloc SHALL être
informatif et ne SHALL déclencher aucune nouvelle requête API.

#### Scenario: Identité issue de la session

- **WHEN** les données de session sont disponibles
- **THEN** le pied affiche les initiales dérivées du nom, le nom du membre et son
  rôle applicatif
- **AND** il n'utilise pas les identités de démonstration codées dans le prototype

#### Scenario: Actions de pied conservées

- **WHEN** l'utilisateur consulte la sidebar desktop
- **THEN** le changement de thème et la déconnexion restent atteignables au clavier
  avec des noms accessibles
- **AND** leurs effets restent identiques après l'alignement visuel

#### Scenario: Hauteur réduite et texte agrandi

- **WHEN** la hauteur disponible diminue ou le texte est agrandi à 200 %
- **THEN** les liens et les actions du pied restent atteignables avec défilement si
  nécessaire
- **AND** aucun libellé de navigation n'est coupé de manière inaccessible
