## ADDED Requirements

### Requirement: Shared detail shell

The frontend SHALL provide a shared detail shell that renders a contextual back action, a kicker, a title, an introduction, an optional action area, a hero summary and a tab content area without depending on a feature model or API service.

#### Scenario: Detail shell matches the prototype hierarchy

- **WHEN** a campaign or social fund detail page provides its context, title, period, actions and metrics
- **THEN** the shell renders them in the same ordered hero structure with the configured maximum content width
- **AND** the action area remains aligned to the right on desktop and becomes a full-width action group on narrow screens

#### Scenario: Detail shell exposes a contextual back action

- **WHEN** the user activates the back action
- **THEN** the page navigates to the corresponding campaign or social fund list
- **AND** the action has a visible focus state and an accessible name

### Requirement: Shared detail tabs

The frontend SHALL provide an accessible shared tab primitive for detail pages. It SHALL render `tablist`, `tab`, and `tabpanel` relationships, expose the active tab, keep only the active tab in the tab sequence, and support activation by click and left/right arrow keys.

#### Scenario: User changes the active tab

- **WHEN** the user clicks an inactive tab
- **THEN** the selected tab changes without a full page navigation
- **AND** the corresponding panel is displayed with matching `aria-controls` and `aria-labelledby` values

#### Scenario: User navigates tabs with the keyboard

- **WHEN** focus is on an active tab and the user presses ArrowRight or ArrowLeft
- **THEN** the next or previous tab becomes active with wraparound at the ends
- **AND** focus moves to the newly active tab

#### Scenario: Active tab receives visual feedback

- **WHEN** a tab is active, hovered or focused
- **THEN** the tab exposes the gold active indicator or a visible focus ring without relying on color alone for its selected state

### Requirement: Shared data table presentation

The frontend SHALL provide a shared data table presentation primitive that supports projected headers and cells, a desktop table container, an optional mobile representation, row separators, hover feedback, focus-visible feedback for interactive rows, and `aria-busy` while a page action is pending.

#### Scenario: Table renders projected domain content

- **WHEN** a detail page provides column headers and row content
- **THEN** the shared primitive renders them in a consistent bordered surface with readable header and cell spacing
- **AND** the primitive does not fetch, sort or transform the domain data

#### Scenario: Table row is interactive

- **WHEN** a feature supplies an interactive row or an action inside a row
- **THEN** hover and focus-visible states are visible and the interaction is triggered only by the configured control
- **AND** a non-interactive row is not announced as a link or button

#### Scenario: Table is narrow

- **WHEN** the viewport cannot display all desktop columns without making their content unreadable
- **THEN** the primitive uses the feature-provided mobile representation or an accessible horizontal overflow fallback
- **AND** no required value becomes unreachable by keyboard navigation

### Requirement: Shared detail interaction states

The shared detail primitives SHALL expose consistent hover, focus-visible, disabled, loading, empty and error presentation while leaving the request state and authorization decision to the owning feature.

#### Scenario: Action is disabled during a request

- **WHEN** the owning feature marks an action or pagination control as pending
- **THEN** the control is disabled or carries `aria-disabled`, exposes its pending state and ignores duplicate activation

#### Scenario: Data request fails

- **WHEN** the owning feature reports an initial or page-level error
- **THEN** the detail surface renders an accessible error message and preserves any already visible data when the feature supports that behavior

#### Scenario: Data set is empty

- **WHEN** the owning feature reports an empty result
- **THEN** the table area renders an accessible empty state instead of an empty table body

### Requirement: Consistent table page capacity

Les tableaux de l'interface SHALL afficher au maximum 10 éléments par page. Les tableaux alimentés par une API SHALL demander la page avec `size=10`, et les tableaux alimentés par une collection déjà chargée SHALL appliquer la même limite localement. Le bloc de pagination SHALL afficher les boutons précédent et suivant ainsi que la page courante sur le nombre total de pages uniquement lorsqu'au moins deux pages existent.

#### Scenario: Table contains at most 10 elements

- **WHEN** le tableau contient 10 éléments ou moins
- **THEN** toutes les lignes sont visibles sur une seule page
- **AND** le bloc de pagination n'est pas rendu

#### Scenario: Table contains more than 10 elements

- **WHEN** le tableau contient plus de 10 éléments
- **THEN** chaque page contient au plus 10 lignes
- **AND** les contrôles précédent et suivant permettent de naviguer entre les pages
- **AND** un statut accessible affiche la page courante et le nombre total de pages
