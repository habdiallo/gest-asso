# desktop-sidebar-visual Specification

## Purpose
TBD - created by archiving change fidelite-sidebar-desktop-design. Update Purpose after archive.
## Requirements
### Requirement: Cadre visuel de la sidebar desktop

Le frontend SHALL reproduire le cadre de `.sidebar` dans `design/styles.css` pour la sidebar authentifiée au seuil existant de 821 px : largeur 256 px, position fixe à gauche, padding 28 px en haut et 20 px sur les côtés/en bas, fond surface-glass avec flou 24 px et bordure droite line. Le décalage du contenu principal SHALL rester cohérent avec cette largeur.

#### Scenario: Affichage dans les deux thèmes
- **WHEN** un utilisateur connecté consulte l'application à 1440 × 900 ou 1024 × 768 px, avec texte à taille normale, en thème sombre puis clair
- **THEN** le cadre, les espacements et les surfaces de la sidebar correspondent aux règles du prototype dans le thème correspondant
- **AND** la sidebar ne recouvre pas le contenu principal

### Requirement: Marque desktop conforme au prototype

Le frontend SHALL afficher dans la sidebar le logo SVG du prototype dans une marque de 38 × 38 px à rayon 11 px, le nom CONTRIBO en Bebas Neue 25 px et le sous-titre « Gestion associative » en Space Grotesk 8 px avec la casse, l'espacement et l'alignement de `.brand*`. Les SVG décoratifs SHALL être cachés des technologies d'assistance.

#### Scenario: Bloc de marque complet
- **WHEN** la sidebar desktop est visible
- **THEN** son bloc supérieur affiche le logo, le nom et le sous-titre avec les dimensions, couleurs et espacements du prototype
- **AND** il ne crée aucune nouvelle destination de navigation

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

Le frontend SHALL reproduire la presentation `.profile*` du prototype avec avatar 36 px, nom 13 px et role applicatif 11 px a partir des seules donnees deja disponibles dans `SessionService.user`. Le bloc SHALL etre une action de navigation contextuelle : il SHALL ouvrir « Mon profil » pour un Membre et « Mon acces » pour un Administrateur, Tresorier ou Operateur. Le pied SHALL conserver les actions theme et deconnexion existantes sous l'identite, avec leurs noms accessibles et leur fonctionnement actuels.

#### Scenario: Identite disponible pour un role de gestion

- **WHEN** un Administrateur, Tresorier ou Operateur est authentifie et les donnees utilisateur sont disponibles
- **THEN** le pied affiche les initiales derivees du nom, le nom du membre et son role applicatif sans donnees fictives
- **AND** l'activation du bloc ouvre la page « Mon acces »

#### Scenario: Identite disponible pour un Membre

- **WHEN** un Membre est authentifie et les donnees utilisateur sont disponibles
- **THEN** le pied affiche les initiales derivees du nom, le nom du membre et son role applicatif sans donnees fictives
- **AND** l'activation du bloc ouvre « Mon profil » dans l'espace personnel

#### Scenario: Donnees utilisateur pas encore chargees

- **WHEN** la session est authentifiee mais ses donnees utilisateur ne sont pas encore disponibles
- **THEN** le bloc conserve son emplacement sans afficher une identite fictive ni declencher une requete supplementaire
- **AND** les actions theme et deconnexion restent accessibles

#### Scenario: Hauteur reduite et acces clavier

- **WHEN** la hauteur disponible diminue ou le texte est agrandi a 200 % et l'utilisateur navigue au clavier
- **THEN** les liens et les actions du pied restent atteignables, avec defilement si necessaire, sans recouvrement ni texte de lien tronque
- **AND** le changement de theme, la navigation du bloc et la deconnexion produisent les effets attendus

### Requirement: Perimetre limite a la sidebar et a sa destination

La correction SHALL se limiter a la presentation de la sidebar existante, a la destination de son bloc d'identite et a la page de compte necessaire pour le parcours cible. Elle SHALL preserver les autres routes, gardes, droits, logique de session, contrat API, jetons globaux, pages metier, topbar et navigation horizontale mobile, notamment la correction de deconnexion T-110. Elle SHALL conserver le seuil de visibilite existant sans creer de comportement tablette distinct.

#### Scenario: Absence de regression hors sidebar

- **WHEN** l'application est comparee avant et apres a 820 px et a une largeur mobile de 375 px, dans les deux themes
- **THEN** la sidebar reste masquee et l'en-tete ainsi que la navigation mobile gardent leur rendu et leurs interactions actuels
- **AND** a 821 px la sidebar apparait sans changement de destination metier ni recouvrement du contenu principal

#### Scenario: Session absente

- **WHEN** aucun utilisateur n'est authentifie
- **THEN** la sidebar et la page de compte restent absentes et le rendu de connexion reste inchange

