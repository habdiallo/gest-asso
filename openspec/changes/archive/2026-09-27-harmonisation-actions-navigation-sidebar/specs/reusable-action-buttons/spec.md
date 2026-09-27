## ADDED Requirements

### Requirement: Composant d'action partagé

Le frontend SHALL fournir dans `shared/` un composant d'action réutilisable qui
porte le rendu commun des actions primaire, secondaire et dangereuse, avec les
dimensions, le rayon, l'icône, la typographie, les états et le focus visible définis
par le motif `.btn` du prototype.

#### Scenario: Action de navigation du dashboard

- **WHEN** un utilisateur authentifié consulte le dashboard
- **THEN** « Nouvelle campagne » utilise le composant d'action partagé en mode lien
- **AND** le lien conserve la destination des campagnes et le paramètre `creer=1`
- **AND** son rendu visuel est identique à celui des actions primaires utilisant le
  même composant

#### Scenario: Action locale ou soumission de formulaire

- **WHEN** une action crée, enregistre, annule ou déclenche une opération locale
- **THEN** le template utilise le même composant en mode bouton avec un type HTML
  explicite
- **AND** l'événement, la validation et la soumission du formulaire conservent leur
  comportement existant

### Requirement: Sémantique native et états accessibles

Le composant SHALL rendre un élément `<a>` pour une destination de navigation et un
élément `<button>` pour une action locale. Il SHALL transmettre les états disabled,
loading et focus-visible aux technologies d'assistance sans supprimer le nom
accessible ou l'icône décorative.

#### Scenario: Navigation au clavier

- **WHEN** l'utilisateur atteint l'action de navigation au clavier puis l'active
- **THEN** le navigateur conserve le comportement d'un lien, y compris la destination
  et le focus visible

#### Scenario: Action indisponible ou en chargement

- **WHEN** une action est désactivée ou en cours de chargement
- **THEN** elle ne déclenche pas deux fois l'opération
- **AND** son état est exposé avec l'attribut HTML ou ARIA adapté
- **AND** le libellé reste compréhensible sans dépendre uniquement de l'icône

#### Scenario: Bouton dans un formulaire

- **WHEN** une action rendue dans un formulaire ne doit pas le soumettre
- **THEN** l'élément rendu porte `type="button"`
- **AND** une action de validation porte explicitement `type="submit"`

### Requirement: Adoption par les menus métier

Les actions correspondant au motif `.btn` SHALL utiliser le composant partagé dans
les écrans dashboard, membres, campagnes, cagnottes, catégories et rôles et
utilisateurs. Les contrôles qui ont une sémantique distincte, comme les onglets,
filtres, selects et liens textuels, SHALL conserver leur composant spécialisé.

#### Scenario: Cohérence entre les écrans

- **WHEN** un utilisateur compare les actions primaires de plusieurs menus à la
  même largeur et dans le même thème
- **THEN** leur hauteur, rayon, espacement, icône, typographie, survol et focus sont
  portés par le même composant
- **AND** aucun écran migré ne réintroduit une copie locale du contrat `.btn`
